#!/usr/bin/env node
'use strict';

/* =========================================================
   Shendy Life Calendar — fix.cjs (full version)

   - Hard-fixes known unused-import errors.
   - Generic TS6133 auto-fix loop (up to 4 passes).
   - Runs typecheck, lint, test, build.
   - Commits and pushes ONLY if all checks pass.
   - Verifies the push actually landed (remote HEAD == local HEAD).
   - Prints latest GitHub Actions runs.

   Works on Linux Mint / Ubuntu / macOS / WSL.
   Requires: node >= 18, git, npm. `gh` is optional.

   Usage:
     node fix.cjs
     node fix.cjs --no-push
     node fix.cjs --message="fix: something"
     node fix.cjs --branch=main
   ========================================================= */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const NO_PUSH = ARGS.includes('--no-push');
const MSG_ARG = ARGS.find((a) => a.startsWith('--message='));
const BRANCH_ARG = ARGS.find((a) => a.startsWith('--branch='));
const COMMIT_MSG = MSG_ARG
  ? MSG_ARG.slice('--message='.length)
  : 'fix: resolve unused imports (TS6133)';
const FORCED_BRANCH = BRANCH_ARG ? BRANCH_ARG.slice('--branch='.length) : null;

/* -------- terminal colors -------- */

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log  = (...a) => console.log(...a);
const ok   = (m) => console.log(C.green + '  ✓ ' + C.reset + m);
const bad  = (m) => console.error(C.red + '  ✗ ' + C.reset + m);
const note = (m) => console.warn(C.yellow + '  ! ' + C.reset + m);
const head = (m) => console.log('\n' + C.bold + C.cyan + '▶ ' + m + C.reset);
const dim  = (m) => console.log(C.dim + '    ' + m + C.reset);

/* -------- fs helpers -------- */

const exists = (p) => fs.existsSync(p);
const read   = (p) => fs.readFileSync(p, 'utf8');
const write  = (p, c) => fs.writeFileSync(p, c, 'utf8');

/* -------- process helpers -------- */

function run(cmd, args, opts) {
  opts = opts || {};
  const r = spawnSync(cmd, args, {
    stdio: opts.stdio || 'pipe',
    encoding: 'utf8',
    cwd: opts.cwd || ROOT,
    env: opts.env || process.env,
  });
  return {
    code: r.status == null ? 1 : r.status,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    error: r.error || null,
  };
}

function commandExists(cmd) {
  const r = spawnSync('which', [cmd], { stdio: 'pipe' });
  return r.status === 0 && r.stdout && r.stdout.toString().trim().length > 0;
}

function findNpm() {
  if (commandExists('npm')) return 'npm';
  // fallback: look next to node
  const nodeDir = path.dirname(process.execPath);
  const candidates = [
    path.join(nodeDir, 'npm'),
    path.join(nodeDir, 'bin', 'npm'),
    '/usr/bin/npm',
    '/usr/local/bin/npm',
    '/snap/bin/npm',
  ];
  for (const c of candidates) if (exists(c)) return c;
  return null;
}

/* =========================================================
   1) HARD FIXES (deterministic)
   ========================================================= */

function fixAppTsx() {
  const p = path.join(ROOT, 'src', 'App.tsx');
  if (!exists(p)) { note('src/App.tsx not found — skipping.'); return false; }

  const src = read(p);
  if (!/\bstartOfMonth\b/.test(src)) {
    ok('App.tsx already clean.');
    return false;
  }

  let out = src;
  let touched = false;

  // Remove from any named import block
  out = out.replace(
    /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g,
    (m, names, mod) => {
      const parts = names.split(',').map((s) => s.trim()).filter(Boolean);
      const filtered = parts.filter((n) => {
        const as = /^(\S+)\s+as\s+(\S+)$/.exec(n);
        if (as) return as[2] !== 'startOfMonth';
        return n !== 'startOfMonth';
      });
      if (filtered.length === parts.length) return m;
      touched = true;
      if (filtered.length === 0) return '';
      return `import { ${filtered.join(', ')} } from '${mod}';`;
    },
  );

  if (!touched || out === src) {
    note('App.tsx: startOfMonth appears but no removable import found. Inspect manually.');
    return false;
  }

  write(p, out);
  ok('App.tsx: removed unused startOfMonth import.');
  return true;
}

function fixToastTsx() {
  const p = path.join(ROOT, 'src', 'components', 'Toast.tsx');
  if (!exists(p)) { note('src/components/Toast.tsx not found — skipping.'); return false; }

  const src = read(p);
  if (!/^\s*import\s+React\s+from\s+['"]react['"]\s*;?\s*$/m.test(src)) {
    ok('Toast.tsx already clean (no default React import).');
    return false;
  }

  const out = src.replace(/^\s*import\s+React\s+from\s+['"]react['"]\s*;?\s*\r?\n?/m, '');

  if (/\bReact\./.test(out)) {
    note('Toast.tsx: default React import is actually used. Leaving as-is.');
    return false;
  }

  write(p, out);
  ok('Toast.tsx: removed unused default React import.');
  return true;
}

/* =========================================================
   2) GENERIC TS6133 AUTO-FIX
   ========================================================= */

function parseTS6133(output) {
  const re = /^(.+?)\((\d+),(\d+)\):\s*error\s+TS6133:\s*'([^']+)'\s+is declared but its value is never read\./gm;
  const list = [];
  let m;
  while ((m = re.exec(output)) !== null) {
    list.push({ file: m[1].trim(), line: Number(m[2]), col: Number(m[3]), name: m[4] });
  }
  return list;
}

function tryRemoveImport(filePath, name) {
  if (!exists(filePath)) return false;
  const src = read(filePath);
  const lines = src.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*import\b/.test(line)) continue;

    // default-only
    const def = /^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s*['"][^'"]+['"]\s*;?\s*$/.exec(line);
    if (def && def[1] === name) {
      lines[i] = '';
      changed = true;
      continue;
    }

    // named (with optional default)
    const named = /^(\s*import\s*(?:[A-Za-z_$][\w$]*\s*,\s*)?)\{([^}]*)\}(\s*from\s*['"][^'"]+['"]\s*;?\s*)$/.exec(line);
    if (!named) continue;

    const items = named[2].split(',').map((s) => s.trim()).filter(Boolean);
    const kept = items.filter((it) => {
      const as = /^(\S+)\s+as\s+(\S+)$/.exec(it);
      if (as) return as[2] !== name;
      return it !== name;
    });
    if (kept.length === items.length) continue;

    if (kept.length === 0) {
      const defPart = /import\s+([A-Za-z_$][\w$]*)\s*,\s*$/.exec(named[1]);
      lines[i] = defPart ? `import ${defPart[1]}${named[3]}` : '';
    } else {
      lines[i] = `${named[1]}{ ${kept.join(', ')} }${named[3]}`;
    }
    changed = true;
  }

  if (changed) write(filePath, lines.join('\n'));
  return changed;
}

function autoFixTS6133(npmCmd, maxCycles) {
  maxCycles = maxCycles || 4;
  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    dim('typecheck cycle ' + cycle + '/' + maxCycles);
    const r = run(npmCmd, ['run', 'typecheck']);
    if (r.code === 0) { ok('typecheck clean.'); return true; }

    const errs = parseTS6133(r.stdout + '\n' + r.stderr);
    if (errs.length === 0) {
      bad('typecheck failed with non-TS6133 errors:');
      const tail = (r.stdout + '\n' + r.stderr).split('\n').slice(0, 60).join('\n');
      console.error(C.dim + tail + C.reset);
      return false;
    }

    dim('found ' + errs.length + ' TS6133 error(s)');
    let fixed = 0;
    for (const e of errs) {
      const p = path.join(ROOT, e.file);
      if (tryRemoveImport(p, e.name)) {
        ok('  removed "' + e.name + '" from ' + e.file);
        fixed++;
      } else {
        note('  could not remove "' + e.name + '" from ' + e.file);
      }
    }
    if (fixed === 0) return false;
  }
  return false;
}

/* =========================================================
   3) REMAINING CHECKS
   ========================================================= */

function runRemainingChecks(npmCmd) {
  const out = {};
  for (const s of ['lint', 'test', 'build']) {
    dim('npm run ' + s);
    const r = run(npmCmd, ['run', s], { stdio: 'inherit' });
    out[s] = r.code === 0;
    if (r.code === 0) ok(s + ' OK');
    else bad(s + ' FAILED');
  }
  return out;
}

/* =========================================================
   4) GIT
   ========================================================= */

function git(args, opts) {
  return run('git', args, opts);
}

function ensureGitIdentity() {
  const email = git(['config', 'user.email']).stdout.trim();
  if (!email) {
    git(['config', 'user.email', 'you@localhost']);
    git(['config', 'user.name', process.env.USER || 'You']);
    note('Set local git identity (you@localhost). Change with: git config user.email ...');
  }
}

function currentBranch() {
  const r = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const b = r.stdout.trim();
  if (b === 'HEAD') return null; // detached
  return b || null;
}

function commitAndPush() {
  ensureGitIdentity();

  const status = git(['status', '--porcelain']).stdout;
  if (!status.trim()) {
    log(C.dim + '    (working tree clean — nothing to commit)' + C.reset);
  } else {
    git(['add', '-A'], { stdio: 'inherit' });
    const c = git(['commit', '-m', COMMIT_MSG], { stdio: 'inherit' });
    if (c.code !== 0) { bad('git commit failed.'); return false; }
  }

  const local = git(['rev-parse', 'HEAD']).stdout.trim();
  if (!local) { bad('Cannot read local HEAD.'); return false; }
  log(C.dim + '    local  HEAD: ' + local + C.reset);

  const origin = git(['remote', 'get-url', 'origin']).stdout.trim();
  if (!origin) {
    note('No "origin" remote configured. Local commit kept.');
    log('    git remote add origin <url>');
    log('    git push -u origin <branch>');
    return false;
  }

  let branch = FORCED_BRANCH || currentBranch();
  if (!branch) {
    note('Detached HEAD — cannot push. Checkout a branch first:');
    log('    git checkout -b main');
    return false;
  }
  log(C.dim + '    branch:     ' + branch + C.reset);
  log(C.dim + '    origin:     ' + origin + C.reset);

  dim('pushing to origin/' + branch + '…');
  const p = git(['push', '-u', 'origin', branch], { stdio: 'inherit' });
  if (p.code !== 0) {
    bad('git push failed (exit ' + p.code + ').');
    log('    Try:  git pull --rebase origin ' + branch + '   then re-run.');
    return false;
  }

  const remoteLine = git(['ls-remote', 'origin', 'refs/heads/' + branch]).stdout.trim();
  const remote = remoteLine ? remoteLine.split(/\s+/)[0] : '';
  log(C.dim + '    remote HEAD: ' + (remote || '(empty)') + C.reset);

  if (!remote) {
    bad('Could not read remote HEAD — push did not land.');
    return false;
  }
  if (remote !== local) {
    bad('MISMATCH: remote (' + remote + ') != local (' + local + ').');
    bad('Push did not land. Check: git branch -vv   git remote -v');
    return false;
  }

  ok('VERIFIED: remote HEAD == local HEAD.');
  return true;
}

/* =========================================================
   5) POST-PUSH: show GitHub Actions
   ========================================================= */

function showLatestRuns() {
  if (!commandExists('gh')) return;
  if (run('gh', ['auth', 'status']).code !== 0) return;

  const list = run('gh', ['run', 'list', '--limit', '3']);
  if (list.code === 0 && list.stdout.trim()) {
    head('Latest GitHub Actions runs');
    console.log(list.stdout.trimEnd());
    dim('watch live: gh run watch');
  }
}

/* =========================================================
   MAIN
   ========================================================= */

function main() {
  log(C.bold + C.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + C.reset);
  log(C.bold + C.cyan + ' SHENDY LIFE CALENDAR — fix.cjs' + C.reset);
  log(C.bold + C.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + C.reset);
  log(C.dim + ' node: ' + process.version + '   cwd: ' + ROOT + C.reset);

  if (!exists(path.join(ROOT, 'package.json'))) {
    bad('No package.json here. Run from project root.');
    process.exit(1);
  }

  const npmCmd = findNpm();
  if (!npmCmd) { bad('npm not found on PATH.'); process.exit(1); }
  ok('npm: ' + npmCmd);

  if (!commandExists('git')) { bad('git not found on PATH.'); process.exit(1); }
  ok('git found.');

  const ghAvailable = commandExists('gh');
  const ghAuthed = ghAvailable && run('gh', ['auth', 'status']).code === 0;
  if (ghAuthed) ok('gh: authenticated');
  else if (ghAvailable) note('gh installed but not authenticated (push will use git credentials).');
  else note('gh not installed (optional).');

  if (!exists(path.join(ROOT, 'node_modules'))) {
    dim('installing dependencies…');
    const i = run(npmCmd, ['install', '--no-audit', '--no-fund'], { stdio: 'inherit' });
    if (i.code !== 0) { bad('npm install failed.'); process.exit(2); }
  }

  head('1) Hard fixes');
  const a = fixAppTsx();
  const b = fixToastTsx();
  if (!a && !b) dim('nothing to change in the two known files.');

  head('2) Auto-fix TS6133 loop');
  if (!autoFixTS6133(npmCmd, 4)) {
    bad('typecheck still failing. Aborting before commit.');
    process.exit(3);
  }

  head('3) Remaining checks');
  const res = runRemainingChecks(npmCmd);
  if (!res.lint || !res.test || !res.build) {
    bad('One or more checks failed. Nothing committed.');
    process.exit(3);
  }

  if (NO_PUSH) {
    ok('--no-push set; done (no git operations).');
    return;
  }

  head('4) Commit, push, and verify');
  if (!commitAndPush()) {
    bad('Push not verified. See instructions above.');
    process.exit(4);
  }

  head('5) Done');
  ok('All checks passed and push verified.');
  showLatestRuns();

  log('');
  log(C.bold + 'Next:' + C.reset + '  Open GitHub → Actions → confirm the new run is green.');
  log(C.dim + '       if it fails: gh run view --log-failed' + C.reset);
}

try {
  main();
} catch (e) {
  bad('Unexpected error:');
  console.error(e && e.stack ? e.stack : String(e));
  process.exit(99);
}