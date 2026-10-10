# VicaAssist

An Angular travel-booking app for a small agency: **agents** publish flight and hotel listings, and
**customers** assemble an order (flight and/or hotel) and confirm it as a finished booking. The app is
backed by a local `json-server` mock, so it runs with no real backend.

This is a portfolio project. Besides the app itself, most of the history here is the modernisation of a
multi-year-stale Angular 13 / Nx 14 codebase to Angular 22, written up in
[docs/DEPENDENCY_UPGRADE_ROADMAP.md](docs/DEPENDENCY_UPGRADE_ROADMAP.md).

## Contents

[Overview](#overview) · [Key features](#key-features) · [Architecture](#architecture) ·
[Authentication and authorization](#authentication-and-authorization) · [Application flow](#application-flow) ·
[Technology stack](#technology-stack) · [Project structure](#project-structure) ·
[Design and engineering decisions](#design-and-engineering-decisions) ·
[Security considerations](#security-considerations) · [Validation and error handling](#validation-and-error-handling) ·
[Testing](#testing) · [Getting started](#getting-started) · [Code quality](#code-quality) ·
[Known limitations](#known-limitations) · [Future improvements](#future-improvements)

## Overview

| Role | Can do |
|---|---|
| Visitor (`unknown`) | See the generic homepage, log in, register |
| Customer | See their orders, start a new request, open a finished order |
| Agent | See incoming orders, add flights and hotels to an order, mark it finished |

## Key features

- Role-based homepage: the route that loads depends on the signed-in user's role.
- Agents add flights (`add-flight`) and hotels (`add-hotel`) to a customer's order.
- Customers file requests (`user-requests`) and follow them (`user-finished-order`).
- `final-order` combines an order with its chosen flight and hotel into one finished booking.
- Responsive header: a navbar on wide screens, an offcanvas sidebar with dropdowns on phones and tablets.

## Architecture

```
┌────────────────────────── src/app (Angular application) ──────────────────────────┐
│  modules/shared      homepage · header · login · register · footer                 │
│  modules/all_modules add/choose flight and hotel · final-order · user requests     │
│  services/           signal stores (session, order, finalOrder, links) · guards    │
└───────────────┬──────────────────────────────────────────────────────┬─────────────┘
                │ imports (@vica-assist/*)                              │ HTTP
┌───────────────▼──────── projects/ (libraries) ─────────────┐   ┌───────▼────────┐
│  my-flights ─┐                                              │   │  json-server   │
│  my-hotels ──┼─► shared                       my-pipes      │   │  :3000         │
│  item ───────┘                                              │   │  data.json     │
└─────────────────────────────────────────────────────────────┘   └────────────────┘
```

- **`src/app`** is the application. Feature areas are lazy-loaded from `app-routing.module.ts`.
- **`projects/`** holds five libraries. Libraries never import from the app, and their dependency graph has
  no cycles:
  - `shared` — flight/hotel/order interfaces, `HttpResourceService`, and the `API_URL` injection token.
  - `my-flights`, `my-hotels` — the HTTP clients and the agent forms for flights and hotels.
  - `item` — presentational flight and hotel cards.
  - `my-pipes` — a small pipe library.
- **Backend:** `environment.api` points at `http://localhost:3000/`. `json-server` serves
  `src/app/data/data.json`, whose top-level keys (`login`, `orders`, `hotels`, `flights`, `finalOrder`)
  become REST collections.

## Authentication and authorization

Session state lives in `SessionStore` (`services/session`). Login calls `GET /login?username=&password=`
on the mock backend and, on a match, stores the username and role. A failed login resets the store.

| Piece | File | Behaviour |
|---|---|---|
| Roles | `session.store.ts` | `agent`, `customer`, or `unknown` (the logged-out default) |
| `authGuard` | `services/auth-guard/auth.guard.ts` | Redirects to `/login` when logged out, and to `/homepage` when the route's `expectedRole` does not match |
| `roleMatch(role)` | `services/auth-guard/role.match.ts` | A `canMatch` guard used by the homepage routes to pick one of three components for the same `''` path |
| Header links | `link.store.ts` | Switch between login/register and logout when the session changes |

**This is not real security.** See [Security considerations](#security-considerations).

## Application flow

1. A customer registers and logs in. The `''` homepage route resolves to the user homepage.
2. The customer files a request (`user-requests`), which creates a `pending` order.
3. An agent logs in, opens the order from the order list, and adds a flight (`my-flights`) and a hotel
   (`my-hotels`) tied to that order's id.
4. The agent marks the order finished (`updateStatusByOrderID`).
5. `final-order` combines the order, flight and hotel into a `finalOrder` record, then deletes the now
   redundant pending order, flight and hotel records.

Flights and hotels are tied to an order through the order's id; `HttpResourceService` implements the shared
"list, filter by order id, create, delete" client both libraries extend.

## Technology stack

| Area | Choice |
|---|---|
| Framework | Angular 22 (NgModule-based, lazy-loaded routes), zone.js |
| Language | TypeScript 6.0 |
| UI | Angular Material 22 (Material 3 theme) + a slimmed Bootstrap 5 + ng-bootstrap (header offcanvas and dropdowns) |
| Styling | CSS custom property design tokens with a `prefers-color-scheme` dark theme; self-hosted Inter and DM Sans; inlined SVG icons |
| State | NgRx Signals (`signalStore`) |
| Build | `@angular/build` (esbuild / Vite) and ng-packagr for the libraries |
| Tests | Vitest through `@angular/build:unit-test` |
| Lint | ESLint 10, angular-eslint, typescript-eslint, driven through Nx |
| Workspace | Nx 23 (graph and lint only), Angular CLI as the task runner |
| Mock API | json-server 0.17 |

## Project structure

```
src/app/
  modules/all_modules/   feature modules (add flight/hotel, final-order, user requests, ...)
  modules/shared/        header, homepage (+ role-specific pages), destinations, login, register, footer
  services/              session, order, finalOrder, links stores · auth guards · window-resize service
  data/data.json         json-server database
projects/
  shared · my-flights · my-hotels · item · my-pipes
docs/
  development.md                  how to work on the project
  DEPENDENCY_UPGRADE_ROADMAP.md   what was upgraded, in which order, and what broke
  BOOTSTRAP_ROADMAP.md            Bootstrap/ng-bootstrap, styling and build notes
angular.json                      Angular CLI workspace (build, serve, test for every project)
project.json (per project)        Nx-only configuration (lint targets)
```

## Design and engineering decisions

- **Destinations are static sample data.** The six trending destinations, their prices and the destination picker
  in the booking form come from one typed constant (`modules/shared/destinations`), with gradient and emoji art
  instead of photos: no request, no image weight, and the picker writes the same `destination` control as the
  free-text field, so the order sent to the API is unchanged.
- **The hero is a WebP `<img>`**, not a CSS background, so the browser can prioritise it (`fetchpriority="high"`)
  and reserve its space; it is 132 kB instead of a 239 kB JPG.
- **Native date inputs instead of the Material date picker.** The picker cost about 126 kB of JS on every route with
  a date field. Dates are now plain `YYYY-MM-DD` strings with a shared "return not before departure" validator.
- **Unused Material imports are audited.** Each module's Material imports were compared with the templates in
  its own scope, and 20 unused ones were removed; the strict template compiler guards against regressions.
- **Design tokens as CSS custom properties.** Colors, typography and spacing live in
  `src/assets/styles/design-system/` and switch to a dark palette through `prefers-color-scheme`; the Material 3
  theme and Bootstrap read from the same brand colors. Components consume `var(--…)` instead of hex values.
- **Lean global CSS.** Bootstrap is imported by part (only what the templates use, with trimmed utilities) and
  Material uses its Material 3 `mat.theme` instead of a prebuilt theme, so global styles went from 334 kB to
  123 kB raw (31 kB to 14 kB transferred).
- **No third-party font or icon requests.** Inter and DM Sans are served from the app (Latin subset), and the 23
  icons are inlined SVG strings registered through `provideAppIcons()` from `@vica-assist/shared`.
- **Signal stores instead of services with subjects.** Each domain has one `signalStore`. Templates read
  signals directly, which is what lets every component run `OnPush` (below).
- **`OnPush` everywhere.** Angular 22 makes it the default, and the upgrade migration first marked every
  component `Eager` to preserve behaviour. All 17 were then audited and moved to `OnPush`; the only one
  that relied on a side effect (`LoginComponent`'s error flag) became a signal.
- **A shared library instead of libraries importing the app.** Libraries used to import interfaces,
  `environment` and even `OrderStore` from `src/`, which broke their package builds. Shared code now lives
  in `projects/shared`, the API base URL is injected through `API_URL`, and `my-flights` receives the order
  as an `@Input` instead of reading the app's store.
- **`angular.json` is the single source for build/serve/test.** `ng` only reads `angular.json`, and Nx's
  adapter cannot run Angular's Vitest builder. `project.json` files therefore hold only Nx-specific
  configuration (lint). Details in the roadmap, Phase 7.
- **Path aliases for libraries.** `@vica-assist/*` aliases resolve to source for the app and tests, and to
  `dist/` inside each library's `tsconfig.lib.json`, so libraries build as real packages.
- **One `canMatch` + `canActivate` pairing for the homepage.** Three components share the `''` path;
  `roleMatch` selects which loads and `authGuard` protects the two authenticated ones.

## Security considerations

This is a demo backed by a mock API, and several things would be unacceptable in production:

- **No real authentication.** Login is a `GET` with the username and password in the **query string**, so
  credentials end up in URLs, browser history and server logs. `data.json` stores **plaintext passwords**,
  and registration `POST`s the password as-is.
- **Guards are UX, not security.** `authGuard` and `roleMatch` only hide routes in the browser. Any client can
  call the mock API directly, and nothing on the server checks roles.
- **Self-selected role.** Registration is a free-text field (`agent/customer`), so anyone can sign up as an
  agent; anything else becomes `customer`.
- **JWT packages are wired but unused.** `JwtModule` is configured with an undefined `tokenGetter`, and no
  token is issued or stored; the session is in memory only and is lost on reload.
- The client never copies the backend's password into the session store after login.

A production version needs a real backend that hashes passwords, issues short-lived tokens in an HTTP-only
cookie or `Authorization` header, assigns roles server-side, and enforces authorization on every endpoint.

## Validation and error handling

- Forms use Angular reactive forms with validators (required, patterns for names, countries and
  `HH:MM` times, length limits for IDs and prices). The flight form requires a stop duration only when the
  flight has a stop.
- `HttpResourceService` logs backend failures and rethrows a user-facing message; `SessionStore.siteLogin`
  turns an HTTP error into a failed login rather than throwing.
- Invalid login shows an inline message; success and failure of agent actions use snack bars.

## Testing

```bash
npm test                  # the main app (Vitest)
ng test my-flights        # projects/my-flights
ng test my-hotels         # projects/my-hotels
ng test my-pipes          # projects/my-pipes
ng test item              # projects/item
ng test shared            # projects/shared
npm run lint              # ESLint for the app and every library
```

Tests are real: stores run against `HttpTestingController`, the services' HTTP contracts are asserted, and
guards run in an injection context. A header spec checks the navbar/sidebar swap, and a login spec checks
the invalid-credentials message. Several component specs are construction smoke tests only, because their
templates need real Material form controls to render meaningfully.

## Getting started

Prerequisites: **Node.js** `^22.22.3`, `^24.15.0` or `>=26` (Angular 22's supported range) and npm. The
Angular CLI is a local dev dependency, so no global install is needed. More in
[docs/development.md](docs/development.md).

```bash
npm install
npm run mock-api   # terminal 1: json-server on http://localhost:3000
npm start          # terminal 2: ng serve -o  (http://localhost:4200)
```

Sample users are in `src/app/data/data.json` (`login` collection).

**Configuration:** the API base URL is `environment.api` in `src/environments/environment.ts`
(`environment.prod.ts` replaces it in production builds). `AppModule` provides it to the libraries as
`API_URL`.

**Build:**

```bash
npm run build        # app → dist/vica-assist/
npm run build:libs   # every library → dist/<name>/, in dependency order
```

## Code quality

`npm run lint` runs ESLint on all seven projects and currently reports 0 errors and 0 warnings. Dependency
audit status and the reasoning behind each upgrade are in the roadmap; `npm audit --omit=prod` reports one
high-severity dev-only finding (see below).

## Known limitations

- **Nx only runs lint and the project graph.** `nx test` cannot run Angular's Vitest builder; use `ng test`.
  The Nx graph also shows no edges from the app to the libraries, because the root project at `.` overlaps
  the library folders.
- **One high-severity `npm audit` finding** (`undici` 7.x, pulled in by the latest `nx`). Dev-only.
- **Material dominates the lazy routes.** The initial bundle is about 0.72 MB raw (174 kB transferred), inside its
  750 kB budget, but the agent homepage, user homepage and final-order routes each add 0.33 to 0.43 MB of JS, roughly
  150 to 240 kB of it Angular Material and CDK. Replacing more Material parts with native elements is the next lever.
- **Overlapping services from an earlier iteration:** `SflightService` (app) and `MyFlightsService` (library)
  both talk to the flights endpoint.

## Future improvements

- A real authentication backend (see Security considerations) and persisting the session.
- Move from NgModules to standalone components, and zoneless change detection now that every component is
  `OnPush`.
- Extract the duplicated flight services into one.
