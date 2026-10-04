# Dependency Audit & Upgrade Roadmap

`package.json` was pinned almost entirely to **Angular 13** (released Feb 2022, EOL since Nov
2022) and **Nx 14.1.4** (mid-2022). `npm outdated` showed every `@angular/*`, `@angular-eslint/*`,
Nx, Angular Material, ng-bootstrap, ESLint and Jest-tooling package multiple majors behind latest.
This doc lays out the full staged roadmap from that state to latest, since several of the hops
(Angular Material's MDC rewrite, ESLint's flat-config switch) are substantial, independent efforts
rather than a same-day bump.

## Status

**Phase 0 and Phase 1 are done** (`phases/phases-3/dependency-upgrade`). One correction made
during execution: `@auth0/angular-jwt@5.2.0` looked safe via `npm outdated` but actually requires
`@angular/common >=14.0.0` — shipped `~5.1.0` (→ `5.1.2`) instead, the real safe ceiling on
Angular 13. Also removed three fully-unused dead dependencies found while auditing `package.json`:
`angular-material` (legacy AngularJS 1.x Material, unrelated to `@angular/material`), `popper.js`
v1 (superseded by the already-present `@popperjs/core` v2), and a stray package literally named
`latest`. Phase 2's first hop, **13 → 14**, is also done (`feature/angular-upgrade/14`): core/cdk/
material/cli/eslint bumped to the 14.x line, `@ng-bootstrap/ng-bootstrap` to `^13.1.1` (the line that
targets Angular 14) and `@auth0/angular-jwt` to `~5.2.0` (closing the gap noted above, now that
`@angular/common` is actually `>=14.0.0`). Along the way, fixed three things this hop exposed rather
than caused: `angular.json`'s `"version"` field had been flipped from `1` to `2` in an old commit,
breaking every direct `ng` CLI invocation (`version: 2` is actually required here, since Nx's own
split `project.json` files depend on it — restored it rather than "fixing" it away); the root
`tsconfig.json` never actually inherited `tsconfig.base.json`'s `skipLibCheck`, so TypeScript 4.8's
stricter generic-constraint checking surfaced a latent typing bug in Akita's own `.d.ts` (added
`skipLibCheck` directly to the root config); and Angular 14's reactive forms becoming generically
typed by default surfaced a few real `null`-vs-`undefined` gaps in `login`/`register` components
under this app's `strict: true` TypeScript config. Also had to bump `jest-preset-angular` to
`^12.2.6` (11.x doesn't actually work against Angular 14's compiler-cli despite its open-ended peer
range) which pulled `jest`/`ts-jest`/`@types/jest` to 28.x, and pin `jest-environment-jsdom`
directly at the root — without that pin, npm hoists the wrong (27.x) copy via Nx's own
`@nrwl/jest`-pinned transitive dependency, which crashes on construction. Phase 2's second hop,
**14 → 15** (the Material MDC rewrite), is also done (`feature/angular-upgrade/15`): core/cdk/
material/cli/eslint bumped to 15.2.x, `@ng-bootstrap/ng-bootstrap` to `^14.2.0`, TypeScript to
`~4.9.5`. Deleted `src/assets/styles/theme.scss` (confirmed dead — never wired into the build or
`index.html`) rather than migrating its legacy `@angular/material/theming` Sass API. Updated four
`.scss` files' hardcoded legacy class overrides (`.mat-form-field`, `.mat-card`,
`.mat-card-subtitle`, `.mat-radio-button`) to their MDC `-mdc-` infixed equivalents, verified against
the actually-installed `@angular/material` package source rather than assumed. Three real
regressions surfaced by this hop, none of them Material-related:
- `ng update`'s own schematic wrote `@angular/cdk`/`@angular/material` at a nonexistent `14.3.0`-style
  patch again (same class of error as the 13→14 hop) — had to manually verify and pin the real
  ceiling (`cdk`/`material` top out one patch behind `core` in the 15.x line, same as 14.x did).
  `ng update`'s own "install a temporary newer CLI" step also failed in this environment (it resolved
  a stray ancient `npm` package sitting outside the project, under the user's home directory) — ended
  up setting every package version by hand instead, same discipline as working around a bad `ng
  update` result, just earlier in the process.
- Angular 15's karma builder has a real regression in the legacy `main: src/test.ts` +
  `require.context(...)` spec-discovery pattern (public issue: angular/angular-cli#24287, still open,
  no official fix). The builder's own `FindTestsPlugin` already auto-discovers and injects spec files
  into whichever `main` entry is configured regardless of whether `main` is custom or the builder's
  built-in virtual one — so the fix was removing just the obsolete `require.context(...)` block from
  each project's `test.ts` (all four karma-based projects), not `test.ts` itself. Learned this the
  hard way: an interim attempt to delete `test.ts`/`main` entirely also works for spec *discovery*,
  but loses the `zone.js`/`zone.js/testing` + `initTestEnvironment` setup `test.ts` was also doing
  (the builder's virtual-main fallback only replaces the TestBed init half, not the zone import) —
  reverted to the surgical fix instead of the wholesale deletion.
- Setting `tsconfig.json`'s `target` to `ES2022` (required to silence an Angular-15-forced compiler
  warning, which turned out to be *necessary* — not just cosmetic — for the `require.context` fix
  above to take effect) implicitly turned on TypeScript's real ES2022 class-field `[[Define]]`
  semantics, which broke every Akita `Query` subclass with a field initializer calling `this.select()`
  (Angular's CLI normally forces `useDefineForClassFields: false` to prevent exactly this, but only
  while it's silently overriding `target` itself — once `target` is set explicitly, that protection
  has to be set explicitly too). Added `"useDefineForClassFields": false` alongside it.

Phase 2's third hop, **15 → 16**, is also done (`feature/angular-upgrade/16`): core/cdk/material/cli
bumped to the 16.2.x line, `@angular-eslint/*` to `~16.3.1`, `@ng-bootstrap/ng-bootstrap` to
`^15.1.2`, TypeScript to `~5.1.6`, `ng-packagr` to `^16.2.3`. `jest-preset-angular`'s `^12.2.6` peer
range tops out just below Angular 16, so it had to move to `^13.1.6`, pulling `jest`/`ts-jest`/
`@types/jest`/`jest-environment-jsdom` to the 29.x line (same explicit root-level
`jest-environment-jsdom` pin as the last two hops, just bumped, to avoid Nx hoisting a stale copy
again). This was the first hop in the ladder with no forced code change and none surfaced: all three
risk areas flagged going in (karma's `test.ts`/`FindTestsPlugin` interaction, the
`target`/`useDefineForClassFields` pairing protecting Akita's `Query` subclasses, and
`jest-environment-jsdom` resolving correctly at the root) held with zero fixes needed — full six/five
-project test sweep and a development build both passed clean on the first try, as predicted by the
roadmap's low-risk call for this hop.

Phase 2's fourth hop, **16 → 17**, is also done (`feature/angular-upgrade/17`): core/cdk/material/cli
bumped to the 17.3.x line, `@angular-eslint/*` to `~17.5.3`, `ng-packagr` to `^17.3.0`, TypeScript to
`~5.4.5` (compiler-cli/build-angular/ng-packagr's shared peer range `>=5.4 <5.5` — the roadmap's
earlier `~5.2` guess for this hop was off; verified via `npm view` up front, same discipline as every
hop so far). `@ng-bootstrap/ng-bootstrap` went to `^16.0.0` — its own versioning runs one major
behind Angular's, confirmed again here (`16.0.0`'s peer is `@angular/core: ^17.0.0`, while the
nominally-matching `17.0.1` actually targets Angular 18). `jest-preset-angular` moved to `^14.6.2`
(13.x's peer ceiling is `<19.0.0`, which already covered Angular 17, but 14.x was current and verified
compatible) — jest/ts-jest/jest-environment-jsdom needed no version change (preset 14.x stays on the
jest `^29.0.0` line). One real fix this hop exposed: `jest-preset-angular@14.x` deprecated importing
`setup-jest.js` directly (removal planned) in favor of calling `setupZoneTestEnv()` — updated both
Jest-based projects' `test-setup.ts` (`my-hotels`, `my-pipes`) to the new form. Full six/five-project
test sweep and a development build both passed clean otherwise — no forced template or NgModule
changes from the new (opt-in) `@if`/`@for`/`@switch` control-flow syntax or the new (default-for-new-
projects-only) esbuild/Vite builder, since this app's existing `browser`/`karma` executors keep
working unchanged.

Phase 2's fifth hop, **17 → 18**, is also done (`feature/angular-upgrade/18`): core/cdk/material/cli
bumped to the 18.2.14 line, `@angular-eslint/*` to `~18.4.3`, `ng-packagr` to `^18.2.1`,
`@ng-bootstrap/ng-bootstrap` to `^17.0.1` (the one-major-behind pattern confirmed yet again — `17.0.1`'s
peer is `@angular/core: ^18.0.0`). TypeScript landed on `~5.5.4` (compiler-cli/build-angular/
ng-packagr's shared peer range `>=5.4 <5.6`), exactly the version flagged two hops ago as the one
where `tsconfig.json`'s `baseUrl` deprecation stops being a future-editor-only warning and becomes
real. Resolving it surfaced a much bigger issue than expected:

- `tsconfig.json`'s `paths` block (the dead `item`/`mat-input`/`myFlights`/`myHotels` → `dist/...`
  mappings) was confirmed fully unused — no source file imports those bare specifiers — and was
  deleted outright. But `baseUrl` itself turned out to be load-bearing far beyond that block: the
  entire app relies on root-relative imports (`'projects/my-hotels/src/lib/...'`,
  `'src/app/interfaces/flight.interface'`, etc.) throughout, which only resolve because of `baseUrl`.
  A first attempt to delete `baseUrl` entirely broke ~30 files' worth of imports. The actual fix,
  following TypeScript's own documented migration path (`paths` has worked without `baseUrl` since
  TS 4.1, resolving relative to `tsconfig.json`'s own directory): replace bare `baseUrl: "./"` with
  `"paths": { "*": ["./*"] }`, which reproduces the same resolution without tripping the deprecation.
- While fixing this, `module`/`moduleResolution` briefly got set to `"Node16"`/`"node"` directly in
  the editor outside of this work (an invalid pairing — TS hard-errors unless `moduleResolution` is
  also `Node16`/`NodeNext`, and `Node16` mode isn't what Angular's own tooling uses anyway). Checked
  `@angular/cli`'s own schematic template directly (`node_modules/@schematics/angular/workspace/
  files/tsconfig.json.template`) to confirm the actually-correct pairing for Angular 18:
  `"module": "ES2022"` + `"moduleResolution": "bundler"` (the TS 5.0+ resolution mode built for
  bundler-based toolchains like Angular's webpack/esbuild pipeline, as opposed to `node`/`node16`
  which target real Node.js runtime resolution and require explicit file extensions).
- That same `module`/`moduleResolution` pairing turned out to need applying to **two separate tsconfig
  hierarchies**: `item`/`mat-input`/`myFlights` extend the root `tsconfig.json` directly, but
  `my-hotels`/`my-pipes` extend a completely separate `tsconfig.base.json` that had been stuck on
  `target: "es2015"` / `module: "esnext"` / `moduleResolution: "node"` / `lib: ["es2017","dom"]` since
  before Phase 2 even started — never touched by any prior hop. Brought it in line with the root
  config's Angular-18/TS-5.5 settings. This also had its own dead `paths` block (`@vica-assist/*`
  aliases, confirmed unused the same way) — left in place for now rather than deleted in the same pass
  as the live fix, flagged for a later cleanup pass.
- That alignment broke one file: `projects/my-pipes/tsconfig.spec.json` deliberately overrides
  `"module": "commonjs"` for ts-jest (Jest's CJS runtime), and TypeScript 5.x requires `moduleResolution:
  "bundler"` to pair only with `"preserve"` or ES2015+ modules, not `commonjs`. Fixed by pinning
  `"moduleResolution": "node"` on just that one file, since it genuinely needs CommonJS output.
- `@angular-eslint/eslint-plugin@18.4.3` newly added a hard peer on `@typescript-eslint/utils: ^7.11.0
  || ^8.0.0` (15.x/16.x/17.x only peer on `eslint`/`typescript` — confirmed via `npm view`, this is new
  at 18). The repo is still on `@typescript-eslint/*@5.18.0` (plus `@nrwl/eslint-plugin-nx@14.1.4`'s own
  nested `@typescript-eslint/experimental-utils@~5.18.0`), so a plain `npm install` now hits a hard
  `ERESOLVE`. Properly fixing this means `@typescript-eslint/*` → v7/v8, which itself requires
  `eslint: ^8.56.0`+ and ties into the ESLint flat-config migration Phase 4 already scopes as its own
  dedicated pass (and potentially the still-untouched Nx upgrade track, Phase 3, since `@nrwl/
  eslint-plugin-nx@14.1.4` ships its own nested v5-era copy) — not something to patch ad hoc mid-ladder.
  `--legacy-peer-deps` remains the correct, intentional install flag for this repo for exactly this
  class of known, deferred, non-blocking conflict.

Two pre-existing bugs were found while verifying the `tsconfig.json` fix (confirmed present even
under the original committed config, unrelated to this hop, deliberately not fixed yet — tracked for
a cleanup pass after the full version ladder is done): `projects/my-hotels/src/public-api.ts` re-exports
a nonexistent `./lib/my-hotels/my-hotels.service` (the real file is `hotels.service.ts`), and
`src/app/services/auth/RoleGuardService.service.ts` accesses `this.sessionQuery.isLoggedIn`, which
doesn't exist on `SessionQuery` (only `isLoggedIn$` does). Neither is caught by the normal `nx test`/
`nx build` pipeline — only a direct `tsc -p tsconfig.json` against the whole repo surfaces them.

Full six/five-project test sweep and a development build both passed clean, with no forced change
from Angular 18's (opt-in, unused here) zoneless change detection or further Material 3 token moves.

Phase 2's sixth hop, **18 → 19**, is also done (`feature/angular-upgrade/19`): core/cdk/material/cli
bumped to the 19.2.x line, `@angular-eslint/*` to `~19.8.1`, `ng-packagr` to `^19.2.2`,
`@ng-bootstrap/ng-bootstrap` to `^18.0.0` (one-major-behind pattern holds again — `18.0.0`'s peer is
`@angular/core: ^19.0.0`), TypeScript to `~5.8.3`. Deliberately stayed on `jest-preset-angular@^14.6.2`
rather than bumping to the newly-available `15.x` line — 14.6.2's peer range (`>=15.0.0 <21.0.0`)
already covers Angular 19, and 15.x would force an unrelated, unverified Jest 30 major bump
(`build-angular@19.2.27` itself still peers on `jest: ^29.5.0`, confirming 14.x/Jest 29 is the
intended pairing here, not a stale choice).

This was the first genuinely forced breaking change in the whole ladder: Angular 19 flips the
`@Component`/`@Directive`/`@Pipe` `standalone` default from `false` to `true` when unspecified. This
app predates standalone components entirely (started on Angular 13) and declares every one of its 37
components/pipes without an explicit `standalone` flag, relying on the old implicit default — so
every one of them silently became standalone, which an `@NgModule.declarations` array cannot contain,
and 28 of vica-assist's 78 tests failed with "is marked as standalone and can't be declared in any
NgModule." This is normally handled automatically by `ng update`'s bundled `explicit-standalone-flag`
migration schematic — since this repo bypasses `ng update` (its own temporary-CLI-install step has
been unreliable in this environment since the Angular 15 hop), the schematic had to be found and run
by hand: `npx ng generate ./node_modules/@angular/core/schematics/migrations.json:explicit-standalone-flag`
(the ordinary `ng generate @angular/core:explicit-standalone-flag` form fails with "Schematic ...
not found" — migrations live in a separate `migrations.json` collection, not the default one). That
schematic itself couldn't run either: it locates tsconfigs via each project's `angular.json` architect
config, and this workspace's Nx-split format (`"item": "projects/item"` path strings instead of full
project objects) gives it nothing to resolve, so it fails with "Could not find any tsconfig file."
Applied its exact documented intent by hand instead: added `standalone: false` to all 37 `@Component`/
`@Pipe` decorators lacking the flag (zero already had one, confirming the whole codebase is pre-
standalone). After that, all 99 tests (78 + 21) and the dev build passed clean.

One new, non-blocking build warning appeared: webpack now reports "multiple modules with names that
only differ in casing" for several files (drive-letter casing, e.g. `c:\...` vs `C:\...`), a side
effect of `moduleResolution: "bundler"`'s stricter path resolution. Cosmetic on Windows' case-
insensitive filesystem; worth a dedicated pass later if this is ever built on a case-sensitive one.

Phase 2's seventh hop, **19 → 20**, is also done (`feature/angular-upgrade/20`): core/cdk/material/cli
bumped to the 20.2.x/20.3.x lines, `@angular-eslint/*` to `~20.7.0`, `ng-packagr` to `^20.3.2`,
`@ng-bootstrap/ng-bootstrap` to `^19.0.1` (one-major-behind pattern holds yet again — `19.0.1`'s peer
is `@angular/core: ^20.0.0`), TypeScript to `~5.9.3`. Stayed on `jest-preset-angular@^14.6.2` again
(its `<21.0.0` ceiling still covers Angular 20; `build-angular@20.3.37` itself now peers on
`jest: '^29.5.0 || ^30.2.0'`, so both lines are still officially supported — no reason to force the
30.x move yet). This was a clean hop: no forced code changes, full six/five-project test sweep and a
development build both passed with no new warnings beyond the pre-existing drive-letter-casing ones
from the 19 hop.

Phase 2's eighth and final hop, **20 → 21**, is also done (`feature/angular-upgrade/21`): core/cdk/
material/cli bumped to the 21.2.x line, `@angular-eslint/*` to `~21.4.0`, `ng-packagr` to `^21.2.7`,
`@ng-bootstrap/ng-bootstrap` to `^20.0.0` (one-major-behind pattern held for the eighth and final
time — `20.0.0`'s peer is `@angular/core: ^21.0.0`). TypeScript stayed at `~5.9.3` (the shared ceiling
across compiler-cli/build-angular/ng-packagr is `>=5.9 <6.0`; already at the latest 5.9.x patch).

Unlike every prior hop, this one forced a real Jest ecosystem bump, not just an optional one:
`@angular-devkit/build-angular@21.2.24` now peers on `jest: '^30.2.0'` exclusively — no more `^29.x`
fallback — so `jest-preset-angular` had to move too. Its own latest version at the time of the 19 and
20 hops (`15.0.3`) tops out at `@angular/core: '<21.0.0'`, i.e. doesn't cover this hop at all; had to
go all the way to the actual current `latest` dist-tag, `17.0.1` (`>=20.0.0 <23.0.0`), skipping over
an intermediate `16.x` line entirely. That pulled `jest`/`jest-environment-jsdom` to `30.5.2` and
`@types/jest` to `30.0.0`. `ts-jest` needed no version change — `29.4.14` already peers on
`jest: '^29.0.0 || ^30.0.0'` natively. Despite being the largest single tooling jump of the whole
ladder, it was clean in practice: all 21 Jest-based library tests (`my-hotels`, `my-pipes`, plus
`myFlights`/`item`/`mat-input`) passed with zero changes needed beyond the version bumps themselves,
and the full 78-test karma suite plus a development build passed clean too.

**The full Angular 13 → 21 upgrade ladder (Phase 2) is now complete.** Every hop landed on its own
branch, squashed, fast-forward-merged per the sync workflow. Three items were deliberately deferred
rather than fixed mid-ladder, tracked for a dedicated follow-up pass:
- Phase 4 (ESLint flat-config migration: `eslint` → 9.x+, `@typescript-eslint/*` → v7/v8, `.eslintrc.json`
  → `eslint.config.js`) — scoped out from the start, confirmed necessary by the `@angular-eslint@18.4.3`+
  `@typescript-eslint/utils` peer conflict hit at the 18 hop.
- Phase 3 (the Nx upgrade track: `@nrwl/*@14.1.4` → `@nx/*` current, plus reconciling `angular.json`'s
  Nx-split format, which has caused friction at nearly every hop — the `ng update` migration-schematic
  failure at the 19 hop and the `angular.json` version-field flip dance at every hop both trace back to
  it) — not started, still fully on the Phase 0 baseline.
- Two pre-existing bugs found while fixing the 18 hop's `tsconfig.json` (`projects/my-hotels/src/
  public-api.ts`'s dead re-export, `RoleGuardService`'s `isLoggedIn` vs `isLoggedIn$` typo), plus the
  dead `@vica-assist/*` paths block found in `tsconfig.base.json` at the same hop — all three
  confirmed unrelated to any version bump, left for a cleanup pass.

The remaining hops (none — the ladder is done) have no further roadmap entries.

Two structural facts shape the plan:
- **No `@nrwl/angular` package is installed.** All Angular projects use plain
  `@angular-devkit/build-angular` executors, with Nx layered on top only for task running/caching
  and a custom `@e-square/nx-ddd` generator. The **Angular upgrade track and the Nx upgrade track
  are largely independent** — `ng update` drives the former, `nx migrate` the latter — which
  lowers combined risk versus a fully Nx-integrated Angular workspace.
- **Akita (`@datorama/akita*`) has no Angular peer dependency** (only `rxjs: '*'`), so it never
  forces an Angular bump. `@ng-bootstrap/ng-bootstrap` is the opposite: it pins
  `@angular/core: '^13.0.0'` exactly and ships one major per Angular major, so it **must** be
  bumped alongside every Angular hop.

## Current → latest, by package family

| Family | Latest | Notes |
|---|---|---|
| `@angular/*` (core, common, forms, router, platform-\*, compiler\*, animations, localize) | 21.2.x | One major at a time via `ng update` |
| `@angular/cli`, `@angular-devkit/build-angular` | 21.2.x | Moves with core |
| `@angular/cdk`, `@angular/material` | 22.2.1 | MDC rewrite lands at v15 — biggest visual/structural risk in this roadmap |
| `@ng-bootstrap/ng-bootstrap` | 21.0.0 | Must match Angular major exactly |
| `@angular-eslint/*` | 22.5.0 | Tracks Angular major; v15+ needs ESLint flat config |
| `nx`, `@nrwl/*` | 23.x | `@nrwl/*` renamed to `@nx/*` from Nx 16 on; separate track from Angular |
| `typescript` | 5.9.x | Floor/ceiling set by whichever Angular version you're on |
| `rxjs`, `zone.js` | 7.8.x / 0.15.x | Bumped per each Angular hop's peer range |
| `jest`, `jest-preset-angular`, `ts-jest` | 30.x / 17.x / 29.x | `jest-preset-angular` version is tied to the Angular version in use |
| `eslint` | 10.x | Independent track, but blocked on `@angular-eslint` v15+ needing it |
| `json-server` | 1.0.0-beta.15 | Full rewrite (different CLI/config format) — its own project, not part of this ladder |

## Phase 2 — the Angular major-version ladder (13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 → 21)

Do this **one major version at a time**, each as its own branch/PR: `ng update @angular/core@N
@angular/cli@N` (plus `@angular/cdk`, `@angular/material`, `@ng-bootstrap/ng-bootstrap`,
`@angular-eslint/*` pinned to the matching major) and the full test suite before moving on.
`ng update` only supports one major at a time, and each version's migration schematics assume the
previous version's shape.

- **13 → 14** (done, see Status above): landed on TypeScript `~4.8.4` in practice (the actual
  ceiling `@angular/compiler-cli@14.3.0` allows). Standalone components/directives/pipes are
  introduced as *opt-in* — no forced NgModule changes. The real cost of this "lowest-risk" hop
  turned out to be in tooling (jest/jsdom version hoisting, a stale `skipLibCheck` gap) and in
  Angular 14's reactive forms becoming generically typed by default, not in the app's own
  NgModule/template code.
- **14 → 15** (done, see Status above): landed on TypeScript `~4.9.5`. The actual Material MDC
  rewrite itself turned out low-friction — of the 18 modules used, only `button`, `card`, `checkbox`,
  `form-field`, `input`, `radio`, `select`, `snack-bar`, `tabs`, `tooltip` are MDC-rebuilt in v15, and
  the only code fallout was four `.scss` files' hardcoded class overrides needing their `-mdc-`
  infixed equivalents (the custom `mat-formfield` wrapper in `projects/mat-input` needed no changes
  at all — it only consumes the public API). `src/assets/styles/theme.scss` was deleted rather than
  migrated (confirmed dead). The real cost of this hop was three unrelated regressions it exposed:
  `ng update` guessing a nonexistent `cdk`/`material` patch version again, a genuine Angular-15 karma
  builder bug in the legacy `test.ts` spec-discovery pattern, and a `useDefineForClassFields` gap that
  broke every Akita `Query` subclass — see Status above for details. Manual click-through of
  `appearance="fill"` form fields (~29 across 4 templates) is still worth doing; not verified visually
  here.
- **15 → 16** (done, see Status above): landed on TypeScript `~5.1.6`. Signals landed as developer
  preview as predicted (unused here) — no forced change, and none surfaced.
- **16 → 17** (done, see Status above): landed on TypeScript `~5.4.5` (not the originally-guessed
  `~5.2` — verified the real ceiling via `npm view` instead). The new esbuild/Vite application
  builder became the default for *new* projects, but this app's existing `browser`/`karma` executors
  kept working unchanged, as expected. New `@if`/`@for`/`@switch` control-flow syntax was introduced;
  existing `*ngIf`/`*ngFor` templates weren't touched and didn't need to be.
- **17 → 18** (done, see Status above): landed on TypeScript `~5.5.4`, exactly where `baseUrl`'s
  deprecation became real — see Status above for the full `tsconfig`/`tsconfig.base` fallout this
  surfaced. Zoneless change detection entered developer preview as predicted (opt-in, irrelevant
  here). Material's continued Material 3 token moves caused no fallout in the theme files touched at
  v15.
- **18 → 19** (done, see Status above): landed on TypeScript `~5.8.3`. This was *not* the "no forced
  rewrite" hop it looked like on paper — the `standalone` default flip was a real, repo-wide forced
  change (see Status above), the first genuinely breaking one in the ladder so far.
- **19 → 20** (done, see Status above): landed on TypeScript `~5.9.3`. Unlike the previous hop, this
  one really was the clean, no-forced-change hop it looked like on paper.
- **20 → 21** (done, see Status above): landed on TypeScript `~5.9.3` (no change from the 20 hop — same
  ceiling). The ladder's biggest tooling jump (a forced Jest 30 bump, `jest-preset-angular` 15.x→17.x)
  turned out clean in practice — see Status above.

At every hop: bump `@ng-bootstrap/ng-bootstrap` and `@angular-eslint/*` to match, and re-run the
full test sweep (`nx test vica-assist myFlights item mat-input my-hotels my-pipes`).

## Phase 3 — Nx (done, `chore/nx-upgrade-21`)

Nx 14.1.4 → 23.2.1, a 9-major jump. Two findings surfaced before touching any version, both folded
into this branch since they were directly in scope:
- **Security**: `nx.json`'s `tasksRunnerOptions.default.options.accessToken` was a **committed,
  plaintext, read-write Nx Cloud access token**, present since the repo's first Nx commit — exposed
  in this public repo for the project's entire history. Removed it (and the whole now-pointless
  `tasksRunnerOptions`/`@nrwl/nx-cloud` block, since Nx Cloud has been unreachable in this environment
  for every single build/test run across the whole Angular ladder). **The user still needs to revoke/
  rotate this token on the Nx Cloud dashboard (nx.app)** — removing it from the current file doesn't
  undo the exposure, and rewriting git history to scrub it is a separate, more drastic step not taken
  here without explicit confirmation.
- **Dead dependency**: `@e-square/nx-ddd@^1.2.0` had zero actual usage anywhere in the repo (not
  referenced by any `nx.json` generator/plugin config, no `project.json` target invokes it). It shipped
  its own pinned `@nrwl/*@13.1.2` nested deps — one of the two standing reasons `--legacy-peer-deps`
  has been necessary since the Angular 14 hop. Removed.

`npx nx migrate latest` itself only bumped the core `nx` package — it left every `@nrwl/*` plugin
untouched (they're not part of its recognized package group). Renamed them all by hand, verified
against npm: `@nrwl/cli` dropped entirely (the `nx` package ships its own CLI binary now),
`@nrwl/eslint-plugin-nx` → `@nx/eslint-plugin`, `@nrwl/jest` → `@nx/jest`, `@nrwl/linter` → `@nx/eslint`,
`@nrwl/workspace` → `@nx/workspace`. Also updated the two `project.json` executor references this
renamed (`@nrwl/jest:jest` → `@nx/jest:jest`, `@nrwl/linter:eslint` → `@nx/eslint:lint` in `my-hotels`/
`my-pipes`).

Real fallout from the jump, each hit via the full test/build sweep rather than guessed:
- Modern Nx rejects bare relative `outputs` paths in `project.json` (`"coverage/projects/my-hotels"`) —
  requires the `{workspaceRoot}/`/`{projectRoot}/` token syntax. Fixed in `my-hotels`/`my-pipes`.
- `jest.preset.ts` (the root-level file every project's `jest.config.ts` explicitly points `preset` at
  — confirmed live, not dead, despite looking unreferenced from `nx.json`/`package.json` alone) needed
  its `require('@nrwl/jest/preset')` renamed to `@nx/jest/preset` — but the modern package's export
  shape also changed, wrapping the actual preset under a nested `nxPreset` key instead of exporting it
  directly, so the old `const nxPreset = require(...); module.exports = {...nxPreset}` pattern silently
  produced a broken config (no real options, just `{nxPreset: {...}}`). Fixed by destructuring:
  `const { nxPreset } = require('@nx/jest/preset')`. This one was subtle — tests failed with
  `document is not defined` and a cryptic Jest worker crash, not an obvious "preset is wrong" error.
- `nx.json`'s `npmScope` and `targetDependencies` keys are no longer recognized — removed `npmScope`
  (package.json's own name covers it now) and renamed `targetDependencies` to the modern
  `targetDefaults` shape (`{"prepare": {"dependsOn": ["^prepare"]}, ...}`, using `^` instead of
  `"projects": "dependencies"`).
- Same hoisting-gap class of bug hit at the Angular 14 hop (`jest-environment-jsdom`): `jest-util`
  resolved only to nested copies under several packages, not hoisted to the top level, so `ts-jest`'s
  bare `require('jest-util')` failed. Fixed the same way — pinned `jest-util` as an explicit root-level
  devDependency to force correct hoisting.
- Modern Nx infers project names from directory/config rather than `angular.json`'s legacy name map —
  `myFlights` (camelCase, only ever defined via an `angular.json` alias) is now `my-flights` (matching
  its actual directory, consistent with every other project). A real, if cosmetic, rename — not a bug.
- `tsconfig.base.json`'s dead `@vica-assist/*` paths block (flagged but deliberately left alone at the
  18 hop) started actively breaking the build once Nx's improved dependency-graph inference correctly
  wired up `my-hotels`/`my-flights`/`item`'s library builds as real tasks for the first time — it's
  non-relative and `baseUrl` isn't set in that context, producing a hard `TS5090` error. Removed it
  (confirmed dead; the `"*": ["./*"]` entry already there covers all real path resolution).
- `my-hotels/src/public-api.ts`'s known pre-existing bug (flagged, deliberately unfixed, at the 18 hop
  — a dead re-export of a nonexistent `my-hotels.service`, should be `hotels.service`) got fixed here,
  since it was directly blocking this phase's build verification.
- **A genuine, unresolved upstream TypeScript 5.9 bug** (`Cannot destructure property 'pos' of
  'file.referencedFiles[index]'` — tracked at angular/angular-cli#31649, #32281, and
  angular/angular#57850, the first two closed by the Angular team as "not planned," no fix or
  workaround available as of this writing): once Nx's dependency graph correctly required `my-hotels`
  and `my-flights` to build via `ng-packagr` before `vica-assist` (a relationship nominally declared
  in the original `nx.json` too, via `targetDependencies`, but apparently never actually exercised
  under Nx 14), their standalone `ng-packagr` builds started crashing on this TS-internal bug. Spent
  real effort root-causing this (confirmed via a minimal repro against `ng-packagr`'s own programmatic
  API, and against TypeScript's `NgtscProgram` directly) before concluding it's a genuine upstream
  compiler bug, not a project misconfiguration — several documented workarounds (removing project
  references, `skipDefaultLibCheck`, `disableReferencedProjectLoad`, cache clears) were already
  reported as ineffective by other affected users. Since `vica-assist`'s own webpack build compiles
  every library straight from TypeScript source and never actually consumes any library's packaged
  `dist/` output, forcing that `ng-packagr` pre-build isn't functionally necessary here — removed the
  `build` entry from `nx.json`'s `targetDefaults` entirely, restoring the same behavior that held
  (apparently by accident) throughout the whole Angular 13 → 21 ladder. **Known, documented limitation**:
  `nx build my-hotels` / `nx build my-flights` standalone remain broken until TypeScript fixes this
  upstream; `nx build vica-assist` itself is unaffected and was the only build target ever actually
  exercised by this project's verification bar.

Flagged, not fixed (found incidentally, out of scope for this phase): four root-level duplicate files
(`jest.config.ts`/`.js`, `jest.preset.js` — only `jest.preset.ts` turned out to be live) and
`my-hotels/.babelrc`'s reference to the never-installed `@nrwl/web` package; both are unreferenced
dead config, not blocking anything.

Full six-project test sweep (`vica-assist` + all 5 libraries) and a `vica-assist` development build
both pass clean.

## Phase 4 — ESLint flat-config migration (done, `chore/eslint-flat-config`)

Bumped `eslint` 8.12.0 → `9.39.5` and `@typescript-eslint/*` 5.18.0 → `8.71.0` (both verified against
`@angular-eslint@21.4.0`'s peer range, `eslint: ^8.57.0 || ^9.0.0 || ^10.0.0` /
`@typescript-eslint/utils: ^7.11.0 || ^8.0.0` — the exact conflict that kicked off this whole Phase
3+4 effort). Ran Nx's own `nx g @nx/eslint:convert-to-flat-config` generator rather than hand-writing
the conversion — it correctly identified and converted the two projects that actually had a `lint`
target (`my-hotels`, `@vica-assist/my-pipes`; `item`/`mat-input`/`my-flights`/`vica-assist` never had
one configured, even before this migration, and still don't — adding lint to projects that never had
it is out of scope here). Its own auto-`npm install` step failed on the same stray-ancient-npm
environment issue hit at the Angular 15 hop (`ng update`'s equivalent step) — unrelated to the
generator itself; its file changes had already been written before that step ran, so just installing
manually afterward was enough.

Real fallout, all found via actually running `nx run-many --target=lint` for the first time in this
entire upgrade effort (lint was never part of any Phase 2 hop's verification):
- The generated root `eslint.config.mjs` still imported the old `@nrwl/eslint-plugin-nx` package (for
  the `enforce-module-boundaries` rule specifically) even though the generator separately imported the
  modern `@nx/eslint-plugin` correctly for everything else — a leftover from its naive 1:1 translation
  of the old `.eslintrc.json`. Fixed by registering `@nx/eslint-plugin` under the `@nx` namespace and
  using `@nx/enforce-module-boundaries` directly (that package is removed since Phase 3, so this would
  have been a hard runtime failure).
- `@nx/eslint-plugin`'s `flat/angular` config (used by `my-pipes`, via a `FlatCompat`-wrapped legacy
  `plugin:@nrwl/nx/angular` reference the generator also left behind) required a new unified
  `angular-eslint` package the generator didn't install. Found the matching `21.4.0` line (its peer
  requires `@angular/cli: >= 21.0.0 < 22.0.0`, matching this repo's installed `21.2.24` exactly) and
  rewrote `my-pipes/eslint.config.mjs` to use `@nx/eslint-plugin`'s native `flat/angular` and
  `flat/angular-template` exports directly instead of the broken compat-shim detour.
- **`enforce-module-boundaries` found a genuine, pre-existing architectural issue**: `my-hotels` and
  `@vica-assist/my-pipes` both have a real circular dependency with `vica-assist` (`my-hotels` ->
  `vica-assist` -> `my-hotels`), and separately both violate the rule's "libraries can't import from
  applications" restriction — because they import types/services from `src/app/...` directly (the same
  root-relative-import pattern noted throughout this upgrade; confirmed in Phase 3 that these
  "libraries" aren't actually isolated packages, since the app compiles them straight from source).
  Actually fixing this means moving shared interfaces into their own library — a real refactor, not an
  eslint-config change. Downgraded `enforce-module-boundaries` from `error` to `warn` with a comment
  explaining why, rather than disabling it or silently working around it — keeps the finding visible
  for a future dedicated pass instead of hiding it.
- `@angular-eslint/prefer-standalone` (new in this eslint major) directly conflicts with this app's
  intentional, Angular-19-forced `standalone: false` on every component — enabling it would mean either
  converting the whole app to standalone components (a real architectural change) or disabling it.
  Disabled in `my-pipes/eslint.config.mjs` with a comment explaining why.
- A handful of genuine, actionable lint errors got fixed directly rather than suppressed: a ternary
  expression used purely for its side effect in `hotels.service.ts` (with a meaningless empty-string
  no-op branch) rewritten as a proper `if`; two fully-empty generated-scaffold constructors and one
  empty `ngOnInit` removed from `my-pipes.service.ts`/`my-pipes.component.ts`.

**Also found while verifying this phase's stated success check** (a plain `npm install` succeeding
without `--legacy-peer-deps`) **and fixed as part of landing it**, since both were genuinely blocking
that check:
- `zone.js` had been pinned at `~0.11.4` since the original Angular 13 setup and was **never bumped
  across the entire 13 → 21 ladder** — silently tolerated by `--legacy-peer-deps` the whole time, but a
  hard `ERESOLVE` failure under a plain install once Angular 21's `peerOptional zone.js: ~0.15.0 ||
  ~0.16.0` was actually enforced. Bumped to `~0.16.3`. `karma` had similarly drifted (`~6.3.0` vs.
  `@angular/build`'s `^6.4.0` peer) — bumped to `~6.4.4`.
- `package.json`'s `postinstall` script ran `ngcc` (Angular's pre-Ivy compatibility compiler), a tool
  removed from Angular years before this project even reached Angular 13 — confirmed via searching the
  installed `@angular/compiler-cli` for any trace of it (none). This had been dead, silently-never-
  reached config the entire time; it only surfaced as a hard failure once a plain install finally
  resolved far enough to actually run `postinstall`. Removed the script.

Both standing causes of `--legacy-peer-deps` (the dead `@e-square/nx-ddd` dependency, fixed in Phase 3;
the `@typescript-eslint` peer conflict, fixed here) are now resolved: **a plain `npm install` succeeds
with no flags.** Full six-project test sweep, a `vica-assist` development build, and
`nx run-many --target=lint` (for the two projects that have a lint target) all pass clean.

## Out of scope

- `json-server` 1.x is a ground-up rewrite; it's only the local mock backend
  (`npm run mock-api`), so migrating it is independent, low-priority work.
- `@types/node` should stay on the Node version actually targeted by the app's deployment/runtime,
  not whatever major `npm outdated` suggests.

## Verification at each phase

After each Angular major: the full test sweep, **plus** a manual click-through of every routed
screen (`/homepage`, `/add-flight`, `/add-hotel`, `/login`, `/register`, `/final-order`,
`/user-finished-order`) and the embedded `choose-flight`/`choose-hotel` components inside
`final-order`, specifically watching for Material visual regressions at the v15 hop.

After Phase 3 (Nx): `nx graph` confirms the project graph still resolves all six projects, then the
same test sweep.

After Phase 4: lint returns no new errors beyond pre-existing ones, and the test sweep stays green.
