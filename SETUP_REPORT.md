# SETUP REPORT

Generated: 2026-10-14T03:37:13.288Z

## Summary

- Project folder: `/media/hozoman/Hazim/Hazim/Me/shendy-life-calendar`
- Files generated: 46
- Reference files copied: none
- install: OK
- typecheck: FAILED
- lint: OK
- tests: FAILED
- build: FAILED
- git: OK
- github: SKIPPED / NOT AUTHENTICATED

## Command log

```
### npm install
$ npm install --no-audit --no-fund
Exit: 0

--stdout--

added 230 packages in 1m

--stderr--
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.


### typecheck
$ npm run typecheck
Exit: 2

--stdout--

> shendy-life-calendar@1.0.0 typecheck
> tsc --noEmit

src/App.tsx(15,19): error TS6133: 'startOfMonth' is declared but its value is never read.
src/components/Toast.tsx(1,1): error TS6133: 'React' is declared but its value is never read.


### lint
$ npm run lint
Exit: 0

--stdout--

> shendy-life-calendar@1.0.0 lint
> eslint "src/**/*.{ts,tsx}"


/media/hozoman/Hazim/Hazim/Me/shendy-life-calendar/src/App.tsx
  15:19  warning  'startOfMonth' is defined but never used  @typescript-eslint/no-unused-vars

/media/hozoman/Hazim/Hazim/Me/shendy-life-calendar/src/utils/export.ts
  76:12  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)



### test
$ npm test
Exit: 1

--stdout--

> shendy-life-calendar@1.0.0 test
> vitest run


 RUN  v2.1.9 /media/hozoman/Hazim/Hazim/Me/shendy-life-calendar

 ❯ src/__tests__/cycle.test.ts (6 tests | 1 failed) 18ms
   × science A/B/C cycle > business session index continues across cycles (does not reset) 11ms
     → expected 6 to be 5 // Object.is equality
 ❯ src/__tests__/export.test.ts (4 tests | 1 failed) 15ms
   × export/import > produces CSV with header and quoted Arabic text 9ms
     → expected 'id,title,pillar,pillarAr,track,date,s…' to match /"جلسة علم — Business"/
 ✓ src/__tests__/date.test.ts (5 tests) 7ms
 ✓ src/__tests__/businessFunctions.test.ts (3 tests) 6ms
 ✓ src/__tests__/college.test.ts (2 tests) 5ms

 Test Files  2 failed | 3 passed (5)
      Tests  2 failed | 18 passed (20)
   Start at  06:36:12
   Duration  2.87s (transform 153ms, setup 0ms, collect 341ms, tests 51ms, environment 2ms, prepare 1.15s)


--stderr--
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/__tests__/cycle.test.ts > science A/B/C cycle > business session index continues across cycles (does not reset)
AssertionError: expected 6 to be 5 // Object.is equality

- Expected
+ Received

- 5
+ 6

 ❯ src/__tests__/cycle.test.ts:38:45
     36|     expect(businessSessionIndex('A', 2, 2)).toBe(4);
     37|     // Week D (A again) Sun -> index 5
     38|     expect(businessSessionIndex('A', 3, 0)).toBe(5);
       |                                             ^
     39|     // Week D (A again) Wed -> index 6
     40|     expect(businessSessionIndex('A', 3, 3)).toBe(6);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/__tests__/export.test.ts > export/import > produces CSV with header and quoted Arabic text
AssertionError: expected 'id,title,pillar,pillarAr,track,date,s…' to match /"جلسة علم — Business"/

- Expected: 
/"جلسة علم — Business"/

+ Received: 
"id,title,pillar,pillarAr,track,date,startTime,endTime,durationMinutes,actualMinutes,status,outputs,blocker,nextAction,notes
evt_1,جلسة علم — Business,Science,العلم,Business,2026-10-18,09:00,12:00,180,,not_started,Sooq first pass,,,"

 ❯ src/__tests__/export.test.ts:49:17
     47|     const lines = csv.split('\n');
     48|     expect(lines[0]).toMatch(/id,title,pillar/);
     49|     expect(csv).toMatch(/"جلسة علم — Business"/);
       |                 ^
     50|   });
     51| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯



### build
$ npm run build
Exit: 1

--stdout--

> shendy-life-calendar@1.0.0 build
> tsc -b && vite build

src/App.tsx(15,19): error TS6133: 'startOfMonth' is declared but its value is never read.
src/components/Toast.tsx(1,1): error TS6133: 'React' is declared but its value is never read.


### typecheck
$ npm run typecheck
Exit: 2

--stdout--

> shendy-life-calendar@1.0.0 typecheck
> tsc --noEmit

src/App.tsx(15,19): error TS6133: 'startOfMonth' is declared but its value is never read.
src/components/Toast.tsx(1,1): error TS6133: 'React' is declared but its value is never read.


### lint
$ npm run lint
Exit: 0

--stdout--

> shendy-life-calendar@1.0.0 lint
> eslint "src/**/*.{ts,tsx}"


/media/hozoman/Hazim/Hazim/Me/shendy-life-calendar/src/App.tsx
  15:19  warning  'startOfMonth' is defined but never used  @typescript-eslint/no-unused-vars

/media/hozoman/Hazim/Hazim/Me/shendy-life-calendar/src/utils/export.ts
  84:12  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)



### test
$ npm test
Exit: 1

--stdout--

> shendy-life-calendar@1.0.0 test
> vitest run


 RUN  v2.1.9 /media/hozoman/Hazim/Hazim/Me/shendy-life-calendar

 ❯ src/__tests__/cycle.test.ts (6 tests | 1 failed) 18ms
   × science A/B/C cycle > business session index continues across cycles (does not reset) 11ms
     → expected 6 to be 5 // Object.is equality
 ❯ src/__tests__/export.test.ts (4 tests | 1 failed) 15ms
   × export/import > produces CSV with header and quoted Arabic text 10ms
     → expected 'id,title,pillar,pillarAr,track,date,s…' to match /"جلسة علم — Business"/
 ✓ src/__tests__/date.test.ts (5 tests) 7ms
 ✓ src/__tests__/businessFunctions.test.ts (3 tests) 6ms
 ✓ src/__tests__/college.test.ts (2 tests) 5ms

 Test Files  2 failed | 3 passed (5)
      Tests  2 failed | 18 passed (20)
   Start at  06:36:38
   Duration  2.53s (transform 172ms, setup 0ms, collect 264ms, tests 50ms, environment 1ms, prepare 1.01s)


--stderr--
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/__tests__/cycle.test.ts > science A/B/C cycle > business session index continues across cycles (does not reset)
AssertionError: expected 6 to be 5 // Object.is equality

- Expected
+ Received

- 5
+ 6

 ❯ src/__tests__/cycle.test.ts:50:45
     48|     expect(businessSessionIndex('A', 2, 2)).toBe(4);
     49|     // Week D (A again) Sun -> index 5
     50|     expect(businessSessionIndex('A', 3, 0)).toBe(5);
       |                                             ^
     51|     // Week D (A again) Wed -> index 6
     52|     expect(businessSessionIndex('A', 3, 3)).toBe(6);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/__tests__/export.test.ts > export/import > produces CSV with header and quoted Arabic text
AssertionError: expected 'id,title,pillar,pillarAr,track,date,s…' to match /"جلسة علم — Business"/

- Expected: 
/"جلسة علم — Business"/

+ Received: 
"id,title,pillar,pillarAr,track,date,startTime,endTime,durationMinutes,actualMinutes,status,outputs,blocker,nextAction,notes
evt_1,جلسة علم — Business,Science,العلم,Business,2026-10-18,09:00,12:00,180,,not_started,Sooq first pass,,,"

 ❯ src/__tests__/export.test.ts:49:17
     47|     const lines = csv.split('\n');
     48|     expect(lines[0]).toMatch(/id,title,pillar/);
     49|     expect(csv).toMatch(/"جلسة علم — Business"/);
       |                 ^
     50|   });
     51| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯



### build
$ npm run build
Exit: 1

--stdout--

> shendy-life-calendar@1.0.0 build
> tsc -b && vite build

src/App.tsx(15,19): error TS6133: 'startOfMonth' is declared but its value is never read.
src/components/Toast.tsx(1,1): error TS6133: 'React' is declared but its value is never read.


### typecheck
$ npm run typecheck
Exit: 2

--stdout--

> shendy-life-calendar@1.0.0 typecheck
> tsc --noEmit

src/App.tsx(15,19): error TS6133: 'startOfMonth' is declared but its value is never read.
src/components/Toast.tsx(1,1): error TS6133: 'React' is declared but its value is never read.


### lint
$ npm run lint
Exit: 0

--stdout--

> shendy-life-calendar@1.0.0 lint
> eslint "src/**/*.{ts,tsx}"


/media/hozoman/Hazim/Hazim/Me/shendy-life-calendar/src/App.tsx
  15:19  warning  'startOfMonth' is defined but never used  @typescript-eslint/no-unused-vars

/media/hozoman/Hazim/Hazim/Me/shendy-life-calendar/src/utils/export.ts
  84:12  warning  'e' is defined but never used  @typescript-eslint/no-unused-vars

✖ 2 problems (0 errors, 2 warnings)



### test
$ npm test
Exit: 1

--stdout--

> shendy-life-calendar@1.0.0 test
> vitest run


 RUN  v2.1.9 /media/hozoman/Hazim/Hazim/Me/shendy-life-calendar

 ❯ src/__tests__/cycle.test.ts (6 tests | 1 failed) 21ms
   × science A/B/C cycle > business session index continues across cycles (does not reset) 13ms
     → expected 6 to be 5 // Object.is equality
 ❯ src/__tests__/export.test.ts (4 tests | 1 failed) 21ms
   × export/import > produces CSV with header and quoted Arabic text 13ms
     → expected 'id,title,pillar,pillarAr,track,date,s…' to match /"جلسة علم — Business"/
 ✓ src/__tests__/date.test.ts (5 tests) 7ms
 ✓ src/__tests__/businessFunctions.test.ts (3 tests) 6ms
 ✓ src/__tests__/college.test.ts (2 tests) 5ms

 Test Files  2 failed | 3 passed (5)
      Tests  2 failed | 18 passed (20)
   Start at  06:37:04
   Duration  2.81s (transform 187ms, setup 0ms, collect 301ms, tests 59ms, environment 2ms, prepare 990ms)


--stderr--
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/__tests__/cycle.test.ts > science A/B/C cycle > business session index continues across cycles (does not reset)
AssertionError: expected 6 to be 5 // Object.is equality

- Expected
+ Received

- 5
+ 6

 ❯ src/__tests__/cycle.test.ts:50:45
     48|     expect(businessSessionIndex('A', 2, 2)).toBe(4);
     49|     // Week D (A again) Sun -> index 5
     50|     expect(businessSessionIndex('A', 3, 0)).toBe(5);
       |                                             ^
     51|     // Week D (A again) Wed -> index 6
     52|     expect(businessSessionIndex('A', 3, 3)).toBe(6);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/__tests__/export.test.ts > export/import > produces CSV with header and quoted Arabic text
AssertionError: expected 'id,title,pillar,pillarAr,track,date,s…' to match /"جلسة علم — Business"/

- Expected: 
/"جلسة علم — Business"/

+ Received: 
"id,title,pillar,pillarAr,track,date,startTime,endTime,durationMinutes,actualMinutes,status,outputs,blocker,nextAction,notes
evt_1,جلسة علم — Business,Science,العلم,Business,2026-10-18,09:00,12:00,180,,not_started,Sooq first pass,,,"

 ❯ src/__tests__/export.test.ts:49:17
     47|     const lines = csv.split('\n');
     48|     expect(lines[0]).toMatch(/id,title,pillar/);
     49|     expect(csv).toMatch(/"جلسة علم — Business"/);
       |                 ^
     50|   });
     51| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯



### build
$ npm run build
Exit: 1

--stdout--

> shendy-life-calendar@1.0.0 build
> tsc -b && vite build

src/App.tsx(15,19): error TS6133: 'startOfMonth' is declared but its value is never read.
src/components/Toast.tsx(1,1): error TS6133: 'React' is declared but its value is never read.


### git init
$ git init -b main
Exit: 0

--stdout--
Initialized empty Git repository in /media/hozoman/Hazim/Hazim/Me/shendy-life-calendar/.git/


### git config user.email
$ git config user.email setup@local
Exit: 0


### git config user.name
$ git config user.name Setup
Exit: 0


### git add
$ git add .
Exit: 0


### git commit
$ git commit -m chore: initial commit from setup.js
Exit: 0

--stdout--
[main (root-commit) bb292d0] chore: initial commit from setup.js
 47 files changed, 7879 insertions(+)
 create mode 100644 .eslintrc.cjs
 create mode 100644 .github/workflows/ci.yml
 create mode 100644 .gitignore
 create mode 100644 .prettierignore
 create mode 100644 .prettierrc
 create mode 100644 README.md
 create mode 100644 docs/DEPLOYMENT_GITHUB.md
 create mode 100644 docs/DEVELOPMENT.md
 create mode 100644 docs/PRIVACY_AND_BACKUP.md
 create mode 100644 docs/SCHEDULE_RULES.md
 create mode 100644 docs/SETUP.md
 create mode 100644 docs/TESTING.md
 create mode 100644 index.html
 create mode 100644 package-lock.json
 create mode 100644 package.json
 create mode 100644 src/App.tsx
 create mode 100644 src/__tests__/businessFunctions.test.ts
 create mode 100644 src/__tests__/college.test.ts
 create mode 100644 src/__tests__/cycle.test.ts
 create mode 100644 src/__tests__/date.test.ts
 create mode 100644 src/__tests__/export.test.ts
 create mode 100644 src/components/AgendaView.tsx
 create mode 100644 src/components/CalendarDay.tsx
 create mode 100644 src/components/CalendarMonth.tsx
 create mode 100644 src/components/CalendarWeek.tsx
 create mode 100644 src/components/EventDialog.tsx
 create mode 100644 src/components/Header.tsx
 create mode 100644 src/components/SettingsPanel.tsx
 create mode 100644 src/components/Sidebar.tsx
 create mode 100644 src/components/Toast.tsx
 create mode 100644 src/components/UnscheduledList.tsx
 create mode 100644 src/components/WeeklyDashboard.tsx
 create mode 100644 src/domain/businessFunctions.ts
 create mode 100644 src/domain/college.ts
 create mode 100644 src/domain/cycle.ts
 create mode 100644 src/domain/defaults.ts
 create mode 100644 src/domain/id.ts
 create mode 100644 src/domain/types.ts
 create mode 100644 src/main.tsx
 create mode 100644 src/state/store.tsx
 create mode 100644 src/storage/localStorage.ts
 create mode 100644 src/styles/global.css
 create mode 100644 src/utils/date.ts
 create mode 100644 src/utils/export.ts
 create mode 100644 src/vite-env.d.ts
 create mode 100644 tsconfig.json
 create mode 100644 vite.config.ts


```

## Notes

- No secrets are stored in this report.
- If a step FAILED above, fix the reported issue and re-run.
- Never run `git push --force` or `npm audit fix --force`.
