# Development guide

Every command below is taken from `package.json`, `angular.json` or `project.json`.

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | `^22.22.3`, `^24.15.0` or `>=26` | Angular 22's supported range (`engines` of `@angular/core@22`) |
| npm | the one shipped with Node (11.x was used) | `package-lock.json` is committed |
| Angular CLI | `~22.2.2`, **local** | A dev dependency; use `npm run ng -- ...` or `npx ng ...`, no global install needed |

TypeScript is `~6.0.3`. `@angular/build` and `ng-packagr` 22 only accept `>=6.0 <6.1`, so do not bump it
independently.

## Installation

```bash
npm install
```

## Environment configuration

The only environment setting is the API base URL.

| File | Used by | `api` |
|---|---|---|
| `src/environments/environment.ts` | development and tests | `http://localhost:3000/` |
| `src/environments/environment.prod.ts` | production build (file replacement in `angular.json`) | `http://localhost:3000/` |

`AppModule` provides `environment.api` to the libraries through the `API_URL` token from `projects/shared`.
Libraries must not import `environment` themselves.

## Development server

The app needs the mock backend, so run both:

```bash
npm run mock-api   # json-server --watch src/app/data/data.json --port 3000
npm start          # ng serve -o  →  http://localhost:4200
```

`json-server` writes back to `src/app/data/data.json` when you create or delete records, so check
`git status` before committing.

## Production build

```bash
npm run build        # app → dist/vica-assist/
npm run build:libs   # all libraries → dist/<name>/
```

`build:libs` runs `shared`, `my-pipes`, `item`, `my-flights`, `my-hotels`, `mat-input` in that order. A
library that imports another library resolves it from `dist/` inside its own `tsconfig.lib.json`, so the
dependency must be built first. The app and the tests resolve the same imports to source through the
`@vica-assist/*` paths in the root `tsconfig.json`.

`npm run watch` rebuilds the app on change using the development configuration.

## Testing

Tests run on Vitest through `@angular/build:unit-test`, with the `testing` build configuration (JIT) from
`angular.json`.

```bash
npm test                 # the app
ng test <project>        # my-flights | my-hotels | my-pipes | item | mat-input | shared
ng test --watch=false    # single run, as in CI
```

Use `ng test`, not `nx test`: Nx's Angular adapter cannot run the Vitest builder.

## Linting

```bash
npm run lint             # nx run-many -t lint → the app and all six libraries
```

Each project has an `@nx/eslint:lint` target in its `project.json`; the shared flat config is
`eslint.config.mjs` at the root.

## Formatting

No formatter such as Prettier is configured. `.editorconfig` sets UTF-8, two-space indents, trimmed
trailing whitespace (except in Markdown), a final newline, and single quotes for `.ts` files; let your
editor apply it.

## Where configuration lives

| File | Purpose |
|---|---|
| `angular.json` | Authoritative for `ng build`, `serve`, `test`, `extract-i18n` and the library builds |
| `project.json` (root and per library) | Nx only: project detection and the lint targets |
| `tsconfig.json` | Compiler options and the `@vica-assist/*` path aliases used by the app and tests |
| `tsconfig.base.json` | Shared by the `my-hotels` and `my-pipes` project tsconfigs and read by Nx's boundary rule |
| `projects/*/tsconfig.lib.json` | Library builds; maps inter-library aliases to `dist/` |

## Debugging

- The development configuration (`ng serve`, `npm run watch`) has source maps and no optimisation.
- `.vscode/launch.json` has an "ng serve" Chrome launch configuration. Its "ng test" configuration still
  targets Karma's debug page (`localhost:9876/debug.html`) and no longer works now that tests run on Vitest.
- To see why a lint warning appears, run `npx nx lint <project> --output-style=static`.

## Common development issues

| Symptom | Cause and fix |
|---|---|
| Requests to `localhost:3000` fail or the lists are empty | `npm run mock-api` is not running |
| `ng build <library>` cannot find `@vica-assist/shared` (or another library) | The dependency has not been built; run `npm run build:libs` |
| `nx test` fails with "Vitest failed to find the runner" | Expected; use `ng test <project>` |
| `nx run <library>:build` reports the target does not exist | Library builds live in `angular.json`; use `ng build <library>` |
| `ng update` fails with "Failed to parse package manager output" (seen on Windows with npm 11) | Bump versions in `package.json`, then run the schematics directly: `ng generate ./node_modules/<package>/<migrations file>:<name>` (see Phase 6 of the upgrade roadmap) |
| Stale Nx results after changing config | `npx nx reset` |
| `ng serve` ignores an `angular.json` edit | Restart it; the workspace config is read at start-up |
| Node version errors during `npm install` or `ng` | Use a Node version from the prerequisites table |
