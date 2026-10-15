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
| Visitor (`unknown`) | Information only: how it works, trending destinations (each opens a panel with facts, real numbers and reviews), the agents, the airlines, live service numbers, reviews, a FAQ and a question form. Choosing a destination leads to sign-in and, for a customer, to a booking form with it filled in. No booking on the page itself |
| Customer | A dashboard with a photo hero, their open orders with a step progress bar and a Confirm booking button, their agent (rating, languages, answer time) and trending destinations; `/homepage/book`, `/homepage/bookings` (opens on "Ready to choose", with upcoming tickets and a past-trips list on the Booked tab) and `/homepage/messages` are real routes. Messages are kept per request, so the messages page asks which request to write about. Book a trip in four steps (destination, travelers, details, preferences), land on a status page with their assigned agent, a timeline, what happens next, messages, and edit or cancel while the request waits; choose among the agent's hotels and flights; rate a finished trip |
| Agent | Work through their own queue of pending requests (with the customer's wishes beside every field), choose airline, flight and hotel details, message the customer, switch availability, and read their own statistics on the Insights tab |
| Admin | One long page: company-wide numbers and an agent comparison, every request with manual reassignment, agents and their accounts, airlines, a configuration editor, visitor inquiries, review moderation and an audit log |

## Key features

- Role-based homepage: the route that loads depends on the signed-in user's role.
- Agents add flights (`add-flight`) and hotels (`add-hotel`) to a customer's order.
- The visitor page reads one document, `publicSummary`, made of aggregates (totals, averages, first names,
  destinations). It is rebuilt whenever a booking, a rating, an agent, an airline or a hidden review changes, and
  numbers and reviews stay hidden until enough bookings exist (5 by default) for nobody to be identifiable.
- The booking form validates travelers (Israeli ID check digit, first and last name, no duplicates), the origin and
  destination (a known country or city, with autocomplete), dates and budget, and collects the customer's
  **preferences** (stops or direct, checked baggage, cabin, departure time, preferred airlines, flexible dates,
  hotel breakfast, bed, area, rooms, meals, seat, assistance, notes) for the agent.
- Each request is **assigned to an agent** automatically (`pickAgent`: least open requests, a head start for a
  specialist, skipping agents who are away); a request nobody answers within the promised time (24 h by default)
  is handed to another agent once, and the customer is told.
- Agents choose the real offer (airline from the configured list, cabin, stops, baggage, hotel, price); the form
  warns, without blocking, when an offer differs from what the customer asked for, and the customer's cards say
  how each offer compares.
- Customers file requests (`user-requests`) and follow them in three tabs: waiting for an agent, ready to choose
  (with how many hotels and flights the agent added) and booked.
- After a trip has ended the customer rates the hotel and the flight (1 to 5 stars) and can write a review.
- The agent's Insights tab shows the request funnel, satisfaction (average, share of 4 to 5 star ratings, rating
  distribution, latest reviews, response rate) and business numbers (time to answer, booked value, budget used,
  top destinations, trip types, bookings per month), drawn with plain CSS.
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
  `src/app/data/data.json`, whose top-level keys (`login`, `destinations`, `orders`, `hotels`, `flights`,
  `finalOrder`, ...) become REST collections.

## Authentication and authorization

Session state lives in `SessionStore` (`services/session`). Login calls `GET /login?username=&password=`
on the mock backend and, on a match, stores the username and role. A failed login resets the store.

- **Remember me.** A successful login is saved as `{ username, role, expiresAt }` under `vica-session`: in
  `localStorage` for 30 days when "Remember me" is ticked, otherwise in `sessionStorage` (it survives a reload but
  ends with the tab). The password is never stored. An app initializer calls `SessionStore.restore()`, which drops
  expired or malformed entries, and logout clears both.
- **Forgot password.** `/forgot-password` asks for a username and `PasswordResetService` stores a single-use token
  (30 minutes, one per account) in the `passwordResets` collection. There is no mail server, so the page shows the
  "email" with its reset link, labelled as a demo; the answer is the same for unknown usernames. `/reset-password`
  checks the token, changes the password and deletes the token.
- **Show-password toggle and floating labels** are shared by login, register and the reset pages (see
  [docs/design.md](docs/design.md)).

| Piece | File | Behaviour |
|---|---|---|
| Roles | `session.store.ts` | `admin`, `agent`, `customer`, or `unknown` (the logged-out default) |
| `authGuard` | `services/auth-guard/auth.guard.ts` | Redirects to `/login` when logged out, and to `/homepage` when the route's `expectedRole` does not match |
| `roleMatch(role)` | `services/auth-guard/role.match.ts` | A `canMatch` guard used by the homepage routes to pick one of four components for the same `''` path |
| Header links | `link.store.ts` | Switch between login/register and logout when the session changes |

**This is not real security.** See [Security considerations](#security-considerations).

## Application flow

1. A customer registers and logs in. The `''` homepage route resolves to the customer dashboard; "Book your trip" and "Manage bookings" open `/homepage/book` and `/homepage/bookings`, and "Message <agent>" opens `/homepage/messages` to pick the request. Logging in with a destination chosen on the visitor homepage goes straight to `/homepage/book`.
2. The customer files a request (`user-requests`), which creates a `pending` order.
3. An agent logs in, opens the order from the order list, and adds a flight (`my-flights`) and a hotel
   (`my-hotels`) tied to that order's id.
4. The agent marks the order finished (`updateStatusByOrderID`).
5. The customer opens the answered request (`final-order`) and picks a hotel and/or a flight. That
   combines the order, flight and hotel into a `finalOrder` record (the customer's booking), marks the order
   `booked` (it is kept, so its number is never handed out again) and deletes the redundant flight and hotel records.
6. Once the return date has passed, the customer rates the booking; the rating is stored as `feedback` on the
   `finalOrder` record and feeds the agent's Insights.

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
  modules/shared/        header, homepage (+ role-specific pages), destinations, login, register, forgot/reset
                         password, password toggle, footer
  services/              session, order, finalOrder, booking, agent, destination, message, audit, inquiry, links stores · admin
                         service · auth guards · window-resize service
  data/data.json         json-server database
projects/
  shared · my-flights · my-hotels · item · my-pipes
  shared/src/lib/config        trip-config.json (defaults) and the typed config
  shared/src/lib/order-matching  pure helpers: pickAgent, planReassignments, checkOffer, validateConfig, places, ...
docs/
  development.md                  how to work on the project
  design.md                       design system: tokens, typography, components, accessibility
  DEPENDENCY_UPGRADE_ROADMAP.md   what was upgraded, in which order, and what broke
  BOOTSTRAP_ROADMAP.md            Bootstrap/ng-bootstrap, styling and build notes
angular.json                      Angular CLI workspace (build, serve, test for every project)
project.json (per project)        Nx-only configuration (lint targets)
```

## Design and engineering decisions

- **Destinations are data, and orders point at them by id.** The places a trip can go to live in the
  `destinations` collection (`id`, name, photo, emoji and gradient, description, facts, `active`), loaded at startup by
  `DestinationStore`. An order carries `destinationId`, and `OrderStore` refuses an unknown or retired one, so only
  known destinations can be booked; the booking form is a picker of the active ones. The order also keeps the
  destination's name as it was when it was booked (so an old trip keeps its name and the pages that show it need no
  lookup); the store always sets that name from the destination, never from what was typed. Agent matching still
  compares names, because agent specialties are free text. The origin stays free text, checked against a bundled
  list of countries and cities (`places.ts`). Visitors reach a destination through `?destination=<id>`; an id that is
  not one of ours is ignored.
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
  `roleMatch` selects which loads and `authGuard` protects the two authenticated ones. The customer pages
  `book` and `bookings` carry the same pairing, and a `**` redirect sends everyone else back to `/homepage`.
- **Customer pages are routes, not in-page views.** The booking form and the bookings list have their own URLs, so
  the back button, reloads and links (for example "Back to my bookings") work, and the dashboard stays a pure
  read of the stores.

## Security considerations

This is a demo backed by a mock API, and several things would be unacceptable in production:

- **No real authentication.** Login is a `GET` with the username and password in the **query string**, so
  credentials end up in URLs, browser history and server logs. `data.json` stores **plaintext passwords**,
  and registration `POST`s the password as-is.
- **Guards are UX, not security.** `authGuard` and `roleMatch` only hide routes in the browser. Any client can
  call the mock API directly, and nothing on the server checks roles.
- **Roles are no longer self-selected.** Registration only creates customers; the admin creates agent accounts
  (with a one-time password, stored in plaintext because the mock backend cannot hash).
- **The visitor page is public by design, so it never reads private data.** It requests only `publicSummary`
  (a spec asserts this), and the summary builder is tested to leave out emails, bios, IDs, customer usernames and
  single-booking prices. The mock API still serves every collection to anyone who asks for it.
- **The question form is unauthenticated.** It has a hidden trap field and a one-per-minute limit kept in the
  browser; both are courtesies, not protection. A real backend needs server-side rate limiting and spam control.
- **A destination in the address is only ever matched against the destinations we offer** (`DestinationStore.bookable`);
  an id that is not one of ours is ignored, so the address cannot put words or links on the login page or redirect.
- **Everything the admin, an agent or a customer is allowed to do is enforced in the browser** (`AdminService`
  refuses non-admins, stores refuse other people's requests, ratings and messages), and the mock API accepts any
  request from anyone. A real backend must repeat every one of those checks.
- **Assignment, reassignment and the audit log are written by whichever client notices.** In a real system they
  belong to server jobs; the audit log can only be appended to through the app, but nothing stops a direct call.
- **JWT packages are wired but unused.** `JwtModule` is configured with an undefined `tokenGetter`, and no
  token is issued. "Remember me" keeps the username and role in browser storage, so a user can edit them in
  DevTools; like the guards, that is a convenience, not protection. A real backend would issue an HTTP-only
  session cookie.
- **The password reset is a demo.** The mock API is open and stores passwords in plaintext, so anyone can read
  reset tokens or change a password directly. A real backend must hash passwords, store only a hash of each
  single-use token and email the link instead of showing it.
- The client never copies the backend's password into the session store after login.
- **Orders belong to a customer only by a `customer` field.** Customers see just their own orders and bookings,
  but the filtering happens in the browser: the mock API returns every record to anyone. Likewise nothing on the
  server stops someone from rating another customer's booking or rating twice; the store and form refuse it, a real
  backend must as well.

A production version needs a real backend that hashes passwords, issues short-lived tokens in an HTTP-only
cookie or `Authorization` header, assigns roles server-side, and enforces authorization on every endpoint.

## Validation and error handling

- Forms use Angular reactive forms with validators (required, patterns for names, countries and
  `HH:MM` times, length limits for IDs and prices). The flight form requires a stop duration only when the
  flight has a stop.
- `HttpResourceService` logs backend failures and rethrows a user-facing message; `SessionStore.siteLogin`
  turns an HTTP error into a failed login rather than throwing.
- Invalid login shows an inline message; success and failure of agent actions use snack bars.
- **Booking form:** the departure cannot be in the past, the return not before the departure, the budget must be
  above 0, the origin and names must not be blank, IDs must be positive, a destination must be picked from the
  ones we offer and the origin must differ from it. Values are trimmed before they are sent.
- **Ratings:** each booked part needs a whole number from 1 to 5, the review is trimmed and limited to 500
  characters, and `BookingStore.rate` refuses other customers' bookings and trips that have not ended.
- **Statistics read data defensively:** `computeInsights` skips records with missing orders, ratings outside 1 to
  5, negative prices or unreadable dates, and the tab says how many bookings were left out.

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
- **Unchosen options are deleted at booking**, so the dashboard cannot say how many options an agent offered per
  request or whether the first one was accepted.
- **`orderID` still duplicates `id`.** The backend assigns the request's `id`, so two browsers submitting together
  cannot share a number, and the customer sees it as `VA-000012`. Flights, hotels and bookings still join on the
  string `orderID`, which is set from `id` in a second request right after creation. Dropping it means migrating
  those three collections and is left as its own change.
- **The origin is a bundled list of places, and is not exhaustive.** Countries and about 150 major cities are
  accepted; streets and small towns are not. Destinations are the six in `data.json`; there is no admin screen to add
  or retire one yet, and agent specialties are matched to them by name.
- **No real notifications.** Messages and status changes appear when a page is opened or refreshed.
- **Overlapping services from an earlier iteration:** `SflightService` (app) and `MyFlightsService` (library)
  both talk to the flights endpoint.

## Future improvements

- A real authentication backend (see Security considerations) and persisting the session.
- Move from NgModules to standalone components, and zoneless change detection now that every component is
  `OnPush`.
- Extract the duplicated flight services into one.
