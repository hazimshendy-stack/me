#!/usr/bin/env node
// Shendy Life Calendar — deploy-pages.js (ESM)
// Enables GitHub Pages deployment using GitHub Actions.
// Diagnoses current state, creates the workflow, commits, pushes, and enables Pages.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const NO_PUSH = ARGS.includes('--no-push');
const DIAG_ONLY = ARGS.includes('--diagnose');
const FORCE_RUN = ARGS.includes('--force-run');

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
const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, c) => fs.writeFileSync(p, c, 'utf8');

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

function git(args, opts = {}) { return run('git', args, opts); }

/* =========================================================
   1) DIAGNOSE
   ========================================================= */

function diagnose() {
  head('1) Diagnosis');

  // Git branch
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim() || '(detached)';
  dim('branch:        ' + branch);

  // Local vs remote HEAD
  const local = git(['rev-parse', 'HEAD']).stdout.trim();
  dim('local  HEAD:   ' + local);

  const originUrl = git(['remote', 'get-url', 'origin']).stdout.trim();
  dim('origin:        ' + (originUrl || '(none)'));

  if (!originUrl) {
    bad('No "origin" remote. Push impossible.');
    return { ok: false, originUrl: '' };
  }

  // Fetch to get fresh remote state
  dim('fetching origin…');
  git(['fetch', 'origin', '--quiet']);

  const remoteRef = git(['rev-parse', 'origin/' + branch]).stdout.trim();
  dim('remote HEAD:   ' + (remoteRef || '(unknown)'));

  if (local === remoteRef && local) {
    ok('Local and remote are in sync.');
  } else {
    note('Local and remote differ. Local: ' + local + '  Remote: ' + remoteRef);
  }

  // Workflows present
  head('Existing GitHub Actions workflows');
  const wfDir = path.join(ROOT, '.github', 'workflows');
  if (!exists(wfDir)) {
    note('.github/workflows/ does not exist locally.');
  } else {
    for (const f of fs.readdirSync(wfDir)) {
      const fp = path.join(wfDir, f);
      const size = fs.statSync(fp).size;
      dim('• ' + f + '  (' + size + ' bytes)');
    }
  }

  // gh availability
  const ghAvailable = which('gh');
  const ghAuthed = ghAvailable && run('gh', ['auth', 'status']).code === 0;
  if (!ghAvailable) {
    note('gh not installed — cannot inspect Pages or trigger runs.');
  } else if (!ghAuthed) {
    note('gh installed but not authenticated.');
  } else {
    ok('gh authenticated.');
    // Latest runs
    const runs = run('gh', ['run', 'list', '--limit', '5']);
    if (runs.code === 0 && runs.stdout.trim()) {
      head('Recent GitHub Actions runs');
      console.log(runs.stdout.trimEnd());
    }
    // Pages status
    const pages = run('gh', ['api', 'repos/{owner}/{repo}/pages']);
    if (pages.code === 0) {
      ok('GitHub Pages is enabled. Response:');
      try {
        const j = JSON.parse(pages.stdout);
        dim('  url:        ' + (j.html_url || '(none)'));
        dim('  build_type: ' + (j.build_type || '(unknown)'));
        dim('  status:     ' + (j.status || '(unknown)'));
      } catch {
        console.log(pages.stdout);
      }
    } else {
      note('GitHub Pages is NOT enabled on this repo (or no permission).');
    }
  }

  return { ok: true, originUrl, branch, ghAvailable, ghAuthed };
}

/* =========================================================
   2) WORKFLOW FILE
   ========================================================= */

const PAGES_WORKFLOW = `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
`;

function ensureWorkflow() {
  head('2) Ensure Pages workflow');
  const wfDir = path.join(ROOT, '.github', 'workflows');
  const wfPath = path.join(wfDir, 'deploy-pages.yml');

  fs.mkdirSync(wfDir, { recursive: true });

  if (exists(wfPath)) {
    const current = read(wfPath);
    if (current === PAGES_WORKFLOW) {
      ok('deploy-pages.yml already present and identical.');
      return false;
    }
    note('deploy-pages.yml exists but differs — overwriting with the canonical version.');
    write(wfPath, PAGES_WORKFLOW);
    ok('deploy-pages.yml updated.');
    return true;
  }

  write(wfPath, PAGES_WORKFLOW);
  ok('deploy-pages.yml created.');
  return true;
}

/* =========================================================
   3) Vite base check (needed for Pages subpath)
   ========================================================= */

function ensureViteBase() {
  head('3) Check vite base');
  const p = path.join(ROOT, 'vite.config.ts');
  if (!exists(p)) { note('vite.config.ts missing.'); return false; }

  const src = read(p);
  if (/base:\s*['"]\.\/['"]/.test(src)) {
    ok("vite base is './' (correct for Pages).");
    return false;
  }

  // Try to inject base: './'
  if (/defineConfig\(\s*\{/.test(src)) {
    const out = src.replace(
      /defineConfig\(\s*\{/,
      "defineConfig({\n  base: './',",
    );
    if (out !== src) {
      write(p, out);
      ok("vite base set to './'.");
      return true;
    }
  }

  note("Could not auto-set vite base. Ensure base: './' in vite.config.ts.");
  return false;
}

/* =========================================================
   4) Commit + push
   ========================================================= */

function ensureGitIdentity() {
  if (!git(['config', 'user.email']).stdout.trim()) {
    git(['config', 'user.email', 'you@localhost']);
    git(['config', 'user.name', process.env.USER || 'You']);
    note('Set local git identity (you@localhost).');
  }
}

function commitAndPush(message) {
  head('4) Commit + push');

  if (!git(['status', '--porcelain']).stdout.trim()) {
    dim('working tree clean — no new changes to commit.');
    return true; // nothing to push, but state is fine
  }

  ensureGitIdentity();
  git(['add', '-A'], { stdio: 'inherit' });

  const c = git(['commit', '-m', message], { stdio: 'inherit' });
  if (c.code !== 0) { bad('git commit failed.'); return false; }

  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  const p = git(['push', '-u', 'origin', branch], { stdio: 'inherit' });
  if (p.code !== 0) { bad('git push failed.'); return false; }

  const local = git(['rev-parse', 'HEAD']).stdout.trim();
  const remoteLine = git(['ls-remote', 'origin', 'refs/heads/' + branch]).stdout.trim();
  const remote = remoteLine ? remoteLine.split(/\s+/)[0] : '';
  if (!remote || remote !== local) {
    bad('Verify failed: remote ' + remote + ' != local ' + local);
    return false;
  }
  ok('Push verified.');
  return true;
}

/* =========================================================
   5) Enable Pages via gh api
   ========================================================= */

function enablePages() {
  head('5) Enable GitHub Pages');
  if (!which('gh')) {
    note('gh not installed — enable Pages manually:');
    log('    GitHub → Settings → Pages → Source: GitHub Actions');
    return false;
  }
  if (run('gh', ['auth', 'status']).code !== 0) {
    note('gh not authenticated. Run: gh auth login');
    return false;
  }

  // Try to enable
  const tryEnable = run('gh', [
    'api',
    '-X', 'POST',
    'repos/{owner}/{repo}/pages',
    '-f', 'build_type=workflow',
  ]);

  if (tryEnable.code === 0) {
    ok('GitHub Pages enabled (build_type=workflow).');
  } else if (/already enabled|409/.test(tryEnable.stderr + tryEnable.stdout)) {
    ok('GitHub Pages already enabled.');
  } else {
    note('Could not enable via API. Enable manually:');
    log('    GitHub → Settings → Pages → Source: GitHub Actions');
    dim(tryEnable.stderr.trim().split('\n')[0] || '');
  }

  // Show current status
  const info = run('gh', ['api', 'repos/{owner}/{repo}/pages']);
  if (info.code === 0) {
    try {
      const j = JSON.parse(info.stdout);
      dim('url:        ' + (j.html_url || '(none)'));
      dim('status:     ' + (j.status || '(unknown)'));
      dim('build_type: ' + (j.build_type || '(unknown)'));
    } catch {}
  }
  return true;
}

/* =========================================================
   6) Trigger a new run (optional)
   ========================================================= */

function forceNewRun() {
  head('6) Force a new CI run');
  const marker = path.join(ROOT, '.ci-trigger');
  write(marker, new Date().toISOString() + '\n');
  ok('.ci-trigger updated — will produce a new commit.');

  ensureGitIdentity();
  git(['add', '.ci-trigger'], { stdio: 'inherit' });
  const c = git(['commit', '-m', 'chore: trigger CI'], { stdio: 'inherit' });
  if (c.code !== 0) { bad('commit failed.'); return false; }
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  const p = git(['push'], { stdio: 'inherit' });
  if (p.code !== 0) { bad('push failed.'); return false; }
  ok('Trigger commit pushed.');
  return true;
}

/* =========================================================
   MAIN
   ========================================================= */

function main() {
  log(C.bold + C.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + C.reset);
  log(C.bold + C.cyan + ' SHENDY LIFE CALENDAR — deploy-pages.js' + C.reset);
  log(C.bold + C.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + C.reset);
  log(C.dim + ' node: ' + process.version + '   cwd: ' + ROOT + C.reset);

  if (!exists(path.join(ROOT, 'package.json'))) {
    bad('No package.json here. Run from project root.');
    process.exit(1);
  }

  const info = diagnose();
  if (!info.ok) process.exit(2);

  if (DIAG_ONLY) {
    log('');
    log(C.bold + 'Diagnosis complete (--diagnose).' + C.reset);
    return;
  }

  head('Applying fixes');
  const wfChanged = ensureWorkflow();
  const viteChanged = ensureViteBase();

  if (!NO_PUSH) {
    const changed = wfChanged || viteChanged;
    if (changed) {
      commitAndPush('chore: add GitHub Pages deployment workflow');
    } else {
      dim('no changes to commit.');
    }
    enablePages();
  }

  if (FORCE_RUN && !NO_PUSH) {
    forceNewRun();
  }

  head('Done');
  ok('Setup complete.');
  log('');
  log(C.bold + 'Next steps:' + C.reset);
  log('  1) Open:  https://github.com/<you>/shendy-life-calendar/actions');
  log('  2) Wait for "Deploy to GitHub Pages" to finish (green ✓).');
  log('  3) Open:  https://github.com/<you>/shendy-life-calendar/settings/pages');
  log('  4) The published URL is shown there.');
  log('');
  log(C.dim + 'To force a new run without changing code:  node deploy-pages.js --force-run' + C.reset);
  log(C.dim + 'To diagnose only:                          node deploy-pages.js --diagnose' + C.reset);
}

try { main(); }
catch (e) { bad('Unexpected error:'); console.error(e && e.stack ? e.stack : String(e)); process.exit(99); }