# Architecture

How the application is put together, why it is built this way, and what is deliberately not production-grade. The
[README](../README.md) has the short version; [application-flow.md](application-flow.md) follows a request through the
system; [design.md](design.md) covers the visual design system.

## Contents

[Overview](#overview) · [Libraries](#libraries) · [Backend and data](#backend-and-data) ·
[Angular architecture](#angular-architecture) · [Technology stack](#technology-stack) ·
[Project structure](#project-structure) · [Authentication and authorization](#authentication-and-authorization) ·
[Security considerations](#security-considerations) · [Design and engineering decisions](#design-and-engineering-decisions)

## Overview

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
- **`projects/`** holds five libraries (below).
- **Backend:** `environment.api` points at `http://localhost:3000/`. `json-server` serves `src/app/data/data.json`,
  whose top-level keys become REST collections.
- **Replacement backend (in progress):** `backend/` is an ASP.NET Core API that already implements real authentication
  and role-based authorization ([authentication-and-authorization.md](authentication-and-authorization.md)). The
  Angular app does not call it yet; the other collections move over in later milestones.

## Libraries

Libraries never import from the app, and their dependency graph has no cycles.

| Library | Contents |
|---|---|
| `shared` | Flight, hotel, order and destination interfaces, `HttpResourceService`, the `API_URL` injection token, the typed trip configuration, icons, and the pure helpers in `order-matching` (`pickAgent`, `planReassignments`, `checkOffer`, `buildPublicSummary`, `validateConfig`, `places`, ...) |
| `my-flights`, `my-hotels` | The HTTP clients and the agent forms for flights and hotels |
| `item` | Presentational flight and hotel cards |
| `my-pipes` | A small pipe library |

## Backend and data

`json-server` serves `src/app/data/data.json`. Every top-level key is a collection:

| Collection | Holds |
|---|---|
| `login` | Accounts: username, password, email, role (`admin`, `agent`, `customer`) |
| `destinations` | The places a trip can go to: `id`, name, photo, emoji and gradient, description, facts, `active` |
| `orders` | Customer requests, with `destinationId`, status, dates, travelers, preferences, assigned agent |
| `flights`, `hotels` | Offers an agent added to an order (tied to it by the order's id) |
| `finalOrder` | A finished booking: the order with its chosen flight and hotel, and the customer's feedback |
| `agents` | Agent profiles (languages, specialties, availability) |
| `auditLog`, `inquiries`, `passwordResets` | Admin audit entries, visitor questions, single-use reset tokens |
| `publicSummary` | The aggregate document the visitor page reads (see below) |

The visitor page reads one document, `publicSummary`, made of aggregates (totals, averages, first names,
destinations). It is rebuilt whenever a booking, a rating, an agent, an airline or a hidden review changes, and numbers
and reviews stay hidden until enough bookings exist (5 by default) for nobody to be identifiable.

Flights and hotels are tied to an order through the order's id; `HttpResourceService` implements the shared "list,
filter by order id, create, delete" client both libraries extend.

## Angular architecture

- **Modules and components.** The app is NgModule-based with lazy-loaded routes; newer pages (the homepages, the
  customer pages, the auth helpers) are standalone components. Moving fully to standalone is listed under future
  improvements in the README.
- **State.** Each domain has one NgRx `signalStore` (session, order, finalOrder, booking, agent, destination, message,
  audit, inquiry, links, public summary). Templates read signals directly, which is what lets every component run
  `OnPush`.
- **Routing.** Feature areas are lazy-loaded from `app-routing.module.ts`. The `''` homepage route resolves to one of
  four components by role (`canMatch` with `roleMatch`, plus `authGuard`); the customer pages `book`, `bookings` and
  `messages` live under `/homepage` with the same pairing, and a `**` redirect sends everyone else back to `/homepage`.
- **Startup.** `AppModule` provides the API base URL as `API_URL`, loads the trip configuration and the destinations
  with app initializers (neither blocks the app if the API is down), and restores a saved session.
- **Pure logic in the shared library.** Assignment, offer checking, public-summary building and validation rules are
  plain functions with their own specs, so the stores and components stay thin.

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
| Replacement API | ASP.NET Core (.NET 10), JWT bearer authentication, xUnit integration tests |

## Project structure

```
src/app/
  modules/all_modules/   feature modules (add flight/hotel, final-order, user requests, ...)
  modules/shared/        header, homepage (+ role-specific pages), destinations, login, register, forgot/reset
                         password, password toggle, footer
  services/              session, order, finalOrder, booking, agent, destination, message, audit, inquiry, links stores · admin
                         service · auth guards · window-resize service
  data/data.json         json-server database
backend/                          ASP.NET Core API and its tests (see backend/README.md)
projects/
  shared · my-flights · my-hotels · item · my-pipes
  shared/src/lib/config        trip-config.json (defaults) and the typed config
  shared/src/lib/order-matching  pure helpers: pickAgent, planReassignments, checkOffer, validateConfig, places, ...
docs/
  architecture.md                 this document
  application-flow.md             roles and how a request moves through the system
  design.md                       design system: tokens, typography, components, accessibility
  development.md                  how to work on the project
  authentication-and-authorization.md   how the backend authenticates users and enforces roles
  decisions.md                    backend decisions and what each one gave up
  history/                        upgrade logs: DEPENDENCY_UPGRADE_ROADMAP.md, BOOTSTRAP_ROADMAP.md
angular.json                      Angular CLI workspace (build, serve, test for every project)
project.json (per project)        Nx-only configuration (lint targets)
```

## Authentication and authorization

Session state lives in `SessionStore` (`services/session`). Login calls `GET /login?username=&password=` on the mock
backend and, on a match, stores the username and role. A failed login resets the store.

- **Remember me.** A successful login is saved as `{ username, role, expiresAt }` under `vica-session`: in
  `localStorage` for 30 days when "Remember me" is ticked, otherwise in `sessionStorage` (it survives a reload but ends
  with the tab). The password is never stored. An app initializer calls `SessionStore.restore()`, which drops expired or
  malformed entries, and logout clears both.
- **Forgot password.** `/forgot-password` asks for a username and `PasswordResetService` stores a single-use token (30
  minutes, one per account) in the `passwordResets` collection. There is no mail server, so the page shows the "email"
  with its reset link, labelled as a demo; the answer is the same for unknown usernames. `/reset-password` checks the
  token, changes the password and deletes the token.
- **Show-password toggle and floating labels** are shared by login, register and the reset pages (see
  [design.md](design.md)).

| Piece | File | Behaviour |
|---|---|---|
| Roles | `session.store.ts` | `admin`, `agent`, `customer`, or `unknown` (the logged-out default) |
| `authGuard` | `services/auth-guard/auth.guard.ts` | Redirects to `/login` when logged out, and to `/homepage` when the route's `expectedRole` does not match |
| `roleMatch(role)` | `services/auth-guard/role.match.ts` | A `canMatch` guard used by the homepage routes to pick one of four components for the same `''` path |
| Header links | `link.store.ts` | Switch between login/register and logout when the session changes |

**This is not real security.** See the next section.

## Security considerations

This is a demo backed by a mock API, and several things would be unacceptable in production:

- **No real authentication.** Login is a `GET` with the username and password in the **query string**, so credentials
  end up in URLs, browser history and server logs. `data.json` stores **plaintext passwords**, and registration `POST`s
  the password as-is.
- **Guards are UX, not security.** `authGuard` and `roleMatch` only hide routes in the browser. Any client can call the
  mock API directly, and nothing on the server checks roles.
- **Roles are no longer self-selected.** Registration only creates customers; the admin creates agent accounts (with a
  one-time password, stored in plaintext because the mock backend cannot hash).
- **The visitor page is public by design, so it never reads private data.** It requests only `publicSummary` (a spec
  asserts this), and the summary builder is tested to leave out emails, bios, IDs, customer usernames and single-booking
  prices. The mock API still serves every collection to anyone who asks for it.
- **The question form is unauthenticated.** It has a hidden trap field and a one-per-minute limit kept in the browser;
  both are courtesies, not protection. A real backend needs server-side rate limiting and spam control.
- **A destination in the address is only ever matched against the destinations we offer**
  (`DestinationStore.bookable`); an id that is not one of ours is ignored, so the address cannot put words or links on
  the login page or redirect.
- **Everything the admin, an agent or a customer is allowed to do is enforced in the browser** (`AdminService` refuses
  non-admins, stores refuse other people's requests, ratings and messages), and the mock API accepts any request from
  anyone. A real backend must repeat every one of those checks.
- **Assignment, reassignment and the audit log are written by whichever client notices.** In a real system they belong
  to server jobs; the audit log can only be appended to through the app, but nothing stops a direct call.
- **JWT packages are wired but unused.** `JwtModule` is configured with an undefined `tokenGetter`, and no token is
  issued. "Remember me" keeps the username and role in browser storage, so a user can edit them in DevTools; like the
  guards, that is a convenience, not protection. A real backend would issue an HTTP-only session cookie.
- **The password reset is a demo.** The mock API is open and stores passwords in plaintext, so anyone can read reset
  tokens or change a password directly. A real backend must hash passwords, store only a hash of each single-use token
  and email the link instead of showing it.
- The client never copies the backend's password into the session store after login.
- **Orders belong to a customer only by a `customer` field.** Customers see just their own orders and bookings, but the
  filtering happens in the browser: the mock API returns every record to anyone. Likewise nothing on the server stops
  someone from rating another customer's booking or rating twice; the store and form refuse it, a real backend must as
  well.

A production version needs a real backend that hashes passwords, issues short-lived tokens in an HTTP-only cookie or
`Authorization` header, assigns roles server-side, and enforces authorization on every endpoint. The ASP.NET Core API in
`backend/` does the first three for sign-in, registration and password reset; the frontend still has to be moved onto it,
and the remaining collections need the same server-side checks (see
[authentication-and-authorization.md](authentication-and-authorization.md)).

## Design and engineering decisions

- **Destinations are data, and orders point at them by id.** The places a trip can go to live in the `destinations`
  collection, loaded at startup by `DestinationStore`. An order carries `destinationId`, and `OrderStore` refuses an
  unknown or retired one, so only known destinations can be booked; the booking form is a picker of the active ones. The
  order also keeps the destination's name as it was when it was booked (so an old trip keeps its name and the pages that
  show it need no lookup); the store always sets that name from the destination, never from what was typed. Agent
  matching still compares names, because agent specialties are free text. The origin stays free text, checked against a
  bundled list of countries and cities (`places.ts`). Visitors reach a destination through `?destination=<id>`; an id
  that is not one of ours is ignored.
- **Customer pages are routes, not in-page views.** The booking form and the bookings list have their own URLs, so the
  back button, reloads and links (for example "Back to my bookings") work, and the dashboard stays a pure read of the
  stores.
- **One `canMatch` + `canActivate` pairing for the homepage.** Three components share the `''` path; `roleMatch`
  selects which loads and `authGuard` protects the two authenticated ones. The customer pages carry the same pairing,
  and a `**` redirect sends everyone else back to `/homepage`.
- **Signal stores instead of services with subjects.** Each domain has one `signalStore`. Templates read signals
  directly, which is what lets every component run `OnPush`.
- **`OnPush` everywhere.** Angular 22 makes it the default, and the upgrade migration first marked every component
  `Eager` to preserve behaviour. All 17 were then audited and moved to `OnPush`; the only one that relied on a side
  effect (`LoginComponent`'s error flag) became a signal.
- **A shared library instead of libraries importing the app.** Libraries used to import interfaces, `environment` and
  even `OrderStore` from `src/`, which broke their package builds. Shared code now lives in `projects/shared`, the API
  base URL is injected through `API_URL`, and `my-flights` receives the order as an `@Input` instead of reading the
  app's store.
- **`angular.json` is the single source for build/serve/test.** `ng` only reads `angular.json`, and Nx's adapter cannot
  run Angular's Vitest builder. `project.json` files therefore hold only Nx-specific configuration (lint). Details in the
  [upgrade log](history/DEPENDENCY_UPGRADE_ROADMAP.md), Phase 7.
- **Path aliases for libraries.** `@vica-assist/*` aliases resolve to source for the app and tests, and to `dist/` inside
  each library's `tsconfig.lib.json`, so libraries build as real packages.
- **Design tokens as CSS custom properties.** Colors, typography and spacing live in `src/assets/styles/design-system/`
  and switch to a dark palette through `prefers-color-scheme`; the Material 3 theme and Bootstrap read from the same
  brand colors. Components consume `var(--…)` instead of hex values. See [design.md](design.md).
- **Lean global CSS.** Bootstrap is imported by part (only what the templates use, with trimmed utilities) and Material
  uses its Material 3 `mat.theme` instead of a prebuilt theme, so global styles went from 334 kB to 123 kB raw (31 kB to
  14 kB transferred).
- **Native date inputs instead of the Material date picker.** The picker cost about 126 kB of JS on every route with a
  date field. Dates are now plain `YYYY-MM-DD` strings with a shared "return not before departure" validator.
- **Unused Material imports are audited.** Each module's Material imports were compared with the templates in its own
  scope, and 20 unused ones were removed; the strict template compiler guards against regressions.
- **No third-party font or icon requests.** Inter and DM Sans are served from the app (Latin subset), and the icons are
  inlined SVG strings registered through `provideAppIcons()` from `@vica-assist/shared`.
- **The hero is a WebP `<img>`**, not a CSS background, so the browser can prioritise it (`fetchpriority="high"`) and
  reserve its space; it is 132 kB instead of a 239 kB JPG.
