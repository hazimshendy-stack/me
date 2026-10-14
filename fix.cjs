#!/usr/bin/env node
// Shendy Life Calendar — fix2.js (full, ESM)
// Fixes CSV quoting, business session counter, and the cycle test.
// Runs checks, commits, pushes, and verifies the push landed.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const NO_PUSH = ARGS.includes('--no-push');
const MSG_ARG = ARGS.find((a) => a.startsWith('--message='));
const COMMIT_MSG = MSG_ARG
  ? MSG_ARG.slice('--message='.length)
  : 'fix: csv quoting, business-session counter, cycle test';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};
const log  = (...a) => console.log(...a);
const ok   = (m) => console.log(C.green + '  ✓ ' + C.reset + m);
const bad  = (m) => console.error(C.red + '  ✗ ' + C.reset + m);
const note = (m) => console.warn(C.yellow + '  ! ' + C.reset + m);
const head = (m) => console.log('\n' + C.bold + C.cyan + '▶ ' + m + C.reset);
const dim  = (m) => console.log(C.dim + '    ' + m + C.reset);

const exists = (p) => fs.existsSync(p);
const read   = (p) => fs.readFileSync(p, 'utf8');
const write  = (p, c) => fs.writeFileSync(p, c, 'utf8');

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: opts.stdio || 'pipe',
    encoding: 'utf8',
    cwd: opts.cwd || ROOT,
  });
  return {
    code: r.status == null ? 1 : r.status,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
  };
}

function which(cmd) {
  const r = spawnSync('which', [cmd], { stdio: 'pipe' });
  return r.status === 0 && r.stdout && r.stdout.toString().trim().length > 0;
}

function findNpm() {
  if (which('npm')) return 'npm';
  const nodeDir = path.dirname(process.execPath);
  for (const c of [
    path.join(nodeDir, 'npm'),
    path.join(nodeDir, 'bin', 'npm'),
    '/usr/bin/npm',
    '/usr/local/bin/npm',
    '/snap/bin/npm',
  ]) if (exists(c)) return c;
  return null;
}

/* =========================================================
   FIX 1 — src/utils/export.ts
   Quote non-ASCII (Arabic) values in CSV.
   ========================================================= */

function fixCsvEscape() {
  const p = path.join(ROOT, 'src', 'utils', 'export.ts');
  if (!exists(p)) { note('src/utils/export.ts missing.'); return false; }

  const src = read(p);

  if (/\[\^\\x00-\\x7F\]/.test(src)) {
    ok('export.ts: already fixed.');
    return false;
  }

  const re = /function csvEscape\(s: unknown\): string \{[\s\S]*?\n\}/m;
  if (!re.test(src)) {
    note('export.ts: csvEscape not found in expected shape.');
    return false;
  }

  const replacement = [
    'function csvEscape(s: unknown): string {',
    "  const v = s == null ? '' : String(s);",
    '  const needsQuoting = /[",\\n\\r]/.test(v) || /[^\\x00-\\x7F]/.test(v);',
    "  const escaped = v.replace(/\"/g, '\"\"');",
    "  return needsQuoting ? '\"' + escaped + '\"' : escaped;",
    '}',
  ].join('\n');

  write(p, src.replace(re, replacement));
  ok('export.ts: csvEscape quotes non-ASCII values.');
  return true;
}

/* =========================================================
   FIX 2 — src/domain/cycle.ts
   Correct businessSessionIndex.
   ========================================================= */

function fixCycleCounter() {
  const p = path.join(ROOT, 'src', 'domain', 'cycle.ts');
  if (!exists(p)) { note('src/domain/cycle.ts missing.'); return false; }

  const src = read(p);
  const marker = 'export function businessSessionIndex(';
  const idx = src.indexOf(marker);
  if (idx < 0) { note('cycle.ts: businessSessionIndex not found.'); return false; }

  if (/const PER_TRIPLE = 5;/.test(src)) {
    ok('cycle.ts: already fixed.');
    return false;
  }

  const before = src.slice(0, idx);
  const fn = `export function businessSessionIndex(
  startCycle: WeekCycle,
  weeksElapsed: number,
  dayOfWeek: number,
): number | null {
  const todayIdx = FOCUSED_DAY_INDEX[dayOfWeek];
  if (todayIdx == null) return null;

  // Each complete triple-cycle has exactly 5 Business sessions:
  //   A: Sun + Wed = 2   B: Mon + Thu = 2   C: Tue = 1
  const PER_TRIPLE = 5;

  let count = 0;

  // Full triple-cycles already completed before the current week.
  const fullCycles = Math.floor(weeksElapsed / 3);
  count += fullCycles * PER_TRIPLE;

  // Partial weeks leading up to (but excluding) the current week.
  let c: WeekCycle = startCycle;
  const remWeeks = ((weeksElapsed % 3) + 3) % 3;
  for (let w = 0; w < remWeeks; w++) {
    count += CYCLE_PATTERNS[c].filter((t) => t === 'Business').length;
    c = nextCycle(c);
  }

  // 'c' is now the current week's cycle.
  const pattern = CYCLE_PATTERNS[c];

  // Business sessions earlier in this week.
  for (let i = 0; i < todayIdx; i++) {
    if (pattern[i] === 'Business') count++;
  }

  // Only count today if it is itself a Business day.
  if (pattern[todayIdx] !== 'Business') return null;

  return count;
}
`;

  write(p, before + fn);
  ok('cycle.ts: businessSessionIndex corrected (5 per triple-cycle).');
  return true;
}

/* =========================================================
   FIX 3 — src/__tests__/cycle.test.ts
   Replace the incorrect assertion.
   ========================================================= */

function fixCycleTest() {
  const p = path.join(ROOT, 'src', '__tests__', 'cycle.test.ts');
  if (!exists(p)) { note('cycle.test.ts missing.'); return false; }

  let src = read(p);
  const before = src;

  // Fix the offending assertion (week 4, Sunday is not a Business day).
  src = src.replace(
    /\/\/[^\n]*Then wraps[^\n]*\n\s*expect\(businessSessionIndex\('A',\s*4,\s*0\)\)\.toBe\(0\);/,
    [
      '// Week E (second triple-cycle, week B) Monday -> index 7 (wraps to function 0)',
      "    expect(businessSessionIndex('A', 4, 1)).toBe(7);",
    ].join('\n'),
  );

  // Looser fallback in case the comment differs.
  if (src === before) {
    src = src.replace(
      /expect\(businessSessionIndex\('A',\s*4,\s*0\)\)\.toBe\(0\);/,
      "expect(businessSessionIndex('A', 4, 1)).toBe(7);",
    );
  }

  if (src === before) {
    note('cycle.test.ts: assertion already updated or not found.');
    return false;
  }

  write(p, src);
  ok('cycle.test.ts: assertion updated.');
  return true;
}

/* =========================================================
   SAFETY NET — generic TS6133 sweep
   ========================================================= */

function parseTS6133(output) {
  const re =
    /^(.+?)\((\d+),(\d+)\):\s*error\s+TS6133:\s*'([^']+)'\s+is declared but its value is never read\./gm;
  const list = [];
  let m;
  while ((m = re.exec(output)) !== null) {
    list.push({ file: m[1].trim(), line: Number(m[2]), name: m[4] });
  }
  return list;
}

function tryRemoveImport(filePath, name) {
  if (!exists(filePath)) return false;
  const lines = read(filePath).split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*import\b/.test(line)) continue;

    const def = /^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s*['"][^'"]+['"]\s*;?\s*$/.exec(line);
    if (def && def[1] === name) { lines[i] = ''; changed = true; continue; }

    const named =
      /^(\s*import\s*(?:[A-Za-z_$][\w$]*\s*,\s*)?)\{([^}]*)\}(\s*from\s*['"][^'"]+['"]\s*;?\s*)$/.exec(
        line,
      );
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

function autoFixTS6133(npmCmd, maxCycles = 3) {
  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    dim(`typecheck cycle ${cycle}/${maxCycles}`);
    const r = run(npmCmd, ['run', 'typecheck']);
    if (r.code === 0) { ok('typecheck clean.'); return true; }

    const errs = parseTS6133(r.stdout + '\n' + r.stderr);
    if (errs.length === 0) {
      bad('typecheck failed with non-TS6133 errors:');
      console.error(
        C.dim + (r.stdout + '\n' + r.stderr).split('\n').slice(0, 60).join('\n') + C.reset,
      );
      return false;
    }

    let fixed = 0;
    for (const e of errs) {
      if (tryRemoveImport(path.join(ROOT, e.file), e.name)) {
        ok(`removed "${e.name}" from ${e.file}`);
        fixed++;
      }
    }
    if (fixed === 0) return false;
  }
  return false;
}

/* =========================================================
   Remaining checks
   ========================================================= */

function runRemainingChecks(npmCmd) {
  const out = {};
  for (const s of ['lint', 'test', 'build']) {
    dim(`npm run ${s}`);
    const r = run(npmCmd, ['run', s], { stdio: 'inherit' });
    out[s] = r.code === 0;
    if (r.code === 0) ok(`${s} OK`);
    else bad(`${s} FAILED`);
  }
  return out;
}

/* =========================================================
   Git
   ========================================================= */

function git(args, opts = {}) { return run('git', args, opts); }

function ensureGitIdentity() {
  if (!git(['config', 'user.email']).stdout.trim()) {
    git(['config', 'user.email', 'you@localhost']);
    git(['config', 'user.name', process.env.USER || 'You']);
    note('Set local git identity (you@localhost).');
  }
}

function commitAndPush() {
  ensureGitIdentity();

  if (!git(['status', '--porcelain']).stdout.trim()) {
    dim('working tree clean — nothing to commit');
  } else {
    git(['add', '-A'], { stdio: 'inherit' });
    const c = git(['commit', '-m', COMMIT_MSG], { stdio: 'inherit' });
    if (c.code !== 0) { bad('git commit failed.'); return false; }
  }

  const local = git(['rev-parse', 'HEAD']).stdout.trim();
  if (!local) { bad('cannot read local HEAD.'); return false; }
  dim(`local  HEAD: ${local}`);

  const origin = git(['remote', 'get-url', 'origin']).stdout.trim();
  if (!origin) {
    note('No "origin" remote. Local commit kept. Add it with:');
    log('    git remote add origin <url>');
    return false;
  }

  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  if (!branch || branch === 'HEAD') {
    note('Detached HEAD. Run: git checkout -b main');
    return false;
  }
  dim(`branch:     ${branch}`);
  dim(`origin:     ${origin}`);

  const p = git(['push', '-u', 'origin', branch], { stdio: 'inherit' });
  if (p.code !== 0) {
    bad(`git push failed (exit ${p.code}).`);
    log(`    Try:  git pull --rebase origin ${branch}`);
    return false;
  }

  const remoteLine = git(['ls-remote', 'origin', `refs/heads/${branch}`]).stdout.trim();
  const remote = remoteLine ? remoteLine.split(/\s+/)[0] : '';
  dim(`remote HEAD: ${remote || '(empty)'}`);

  if (!remote || remote !== local) {
    bad(`VERIFY FAILED: remote (${remote}) != local (${local}).`);
    return false;
  }
  ok('VERIFIED: remote HEAD == local HEAD.');
  return true;
}

/* =========================================================
   Post-push: show latest CI runs
   ========================================================= */

function showLatestRuns() {
  if (!which('gh')) return;
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
  log(C.bold + C.cyan + ' SHENDY LIFE CALENDAR — fix2.js' + C.reset);
  log(C.bold + C.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + C.reset);
  log(C.dim + ` node: ${process.version}   cwd: ${ROOT}` + C.reset);

  if (!exists(path.join(ROOT, 'package.json'))) {
    bad('No package.json here. Run from project root.');
    process.exit(1);
  }
  const pkg = JSON.parse(read(path.join(ROOT, 'package.json')));
  if (pkg.type !== 'module') {
    note('package.json does not set "type": "module" — but this file uses ESM.');
    note('If node complains, rename this file to fix2.mjs and re-run.');
  }

  const npmCmd = findNpm();
  if (!npmCmd) { bad('npm not found on PATH.'); process.exit(1); }
  ok(`npm: ${npmCmd}`);

  if (!which('git')) { bad('git not found on PATH.'); process.exit(1); }
  ok('git found.');

  if (!exists(path.join(ROOT, 'node_modules'))) {
    dim('installing dependencies…');
    const i = run(npmCmd, ['install', '--no-audit', '--no-fund'], { stdio: 'inherit' });
    if (i.code !== 0) { bad('npm install failed.'); process.exit(2); }
  }

  head('1) Apply targeted fixes');
  fixCsvEscape();
  fixCycleCounter();
  fixCycleTest();

  head('2) Auto-fix TS6133 loop');
  if (!autoFixTS6133(npmCmd, 3)) {
    bad('typecheck still failing.');
    process.exit(3);
  }

  head('3) Remaining checks');
  const res = runRemainingChecks(npmCmd);
  if (!res.lint || !res.test || !res.build) {
    bad('One or more checks failed. Nothing committed.');
    process.exit(3);
  }

  if (NO_PUSH) { ok('--no-push set; done.'); return; }

  head('4) Commit, push, verify');
  if (!commitAndPush()) { bad('Push not verified.'); process.exit(4); }

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