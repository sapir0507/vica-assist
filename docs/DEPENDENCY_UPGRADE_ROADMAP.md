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

The remaining hops (15 → 21) are a forward-looking roadmap, not yet started.

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
- **15 → 16**: TypeScript `~4.9`–`5.1`. Signals land as developer preview (no forced change). Low
  functional risk once the v15 Material migration is settled.
- **16 → 17**: TypeScript `~5.2`. The new esbuild/Vite application builder becomes the default for
  *new* projects, but the existing `browser`/`karma` executors keep working unchanged. New
  `@if`/`@for`/`@switch` control-flow syntax is introduced; existing `*ngIf`/`*ngFor` templates
  aren't broken and don't need touching.
- **17 → 18**: TypeScript `~5.4`. Zoneless change detection enters developer preview (opt-in,
  irrelevant here — this app relies on Zone.js throughout). Material moves further into Material 3
  design tokens; re-check the theme files touched at v15.
- **18 → 19**: TypeScript `~5.5`–`5.6`. Standalone becomes the `ng generate` default, but
  NgModule-based code keeps compiling — no forced rewrite.
- **19 → 20 → 21**: TypeScript `~5.8`–`5.9`. Same pattern: opt-in signals/zoneless features, no
  forced breakage for an NgModule + Zone.js app — but re-run the full test suite and a manual
  click-through at each hop regardless, since Material/CDK keep shifting internals release to
  release.

At every hop: bump `@ng-bootstrap/ng-bootstrap` and `@angular-eslint/*` to match, and re-run the
full test sweep (`nx test vica-assist myFlights item mat-input my-hotels my-pipes`).

## Phase 3 — Nx (semi-independent track, can trail behind Angular)

Since no `@nrwl/angular` executors are in play, Nx can upgrade on its own schedule via
`npx nx migrate latest` (it runs the intermediate migrations for you, unlike `ng update`'s
one-major rule) — but this workspace's config is already non-standard (`angular.json` *and*
`project.json` both present; `ng test`/`ng build` invoked directly fail with
`Invalid format version detected - Expected:[1] Found:[2]`, only `nx test`/`nx build` work). Do a
dry run (`nx migrate latest --dry-run`) and expect to reconcile: Nx renamed `@nrwl/*` to `@nx/*`
from v16 on, and later Nx versions increasingly expect configuration to live in `project.json`
exclusively — resolve that drift before migrating further rather than compounding it.

## Phase 4 — ESLint & Jest tooling (after Phase 2 settles, not in parallel)

- `@angular-eslint/*` v15+ requires **ESLint's flat config** (`eslint.config.js`) instead of the
  current `.eslintrc.json` files — budget a dedicated migration pass, bump `eslint` to 9.x+ and
  `@typescript-eslint/*` to match (pinned to `@angular-eslint`'s peer range).
- `jest-preset-angular` must track whichever Angular major is current — getting `my-hotels`/
  `my-pipes` onto `11.1.2` for Angular 13 took exactly this exercise (missing `ts-node`, an
  incompatible preset version, an `.mjs` transform gap); the same playbook applies at each future
  Angular hop.

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
