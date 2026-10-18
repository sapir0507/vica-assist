# VicaAssist

An Angular travel-booking app for a small agency: **agents** publish flight and hotel listings, and
**customers** assemble an order (flight and/or hotel) and confirm it as a finished booking. The app is
backed by a local `json-server` mock, so it runs with no real backend.

This is a portfolio project. Besides the app itself, most of the history here is the modernisation of a
multi-year-stale Angular 13 / Nx 14 codebase to Angular 22, written up in
[docs/history/DEPENDENCY_UPGRADE_ROADMAP.md](docs/history/DEPENDENCY_UPGRADE_ROADMAP.md).

## Contents

[Overview](#overview) · [Key features](#key-features) · [Documentation](#documentation) ·
[Getting started](#getting-started) · [Known limitations](#known-limitations) ·
[Future improvements](#future-improvements)

## Overview

| Role | Can do |
|---|---|
| Visitor | Reads the public page: how it works, trending destinations with facts and real numbers, agents, airlines, reviews, a FAQ and a question form. Choosing a destination leads to sign-in |
| Customer | Books a trip in four steps, follows the request with its assigned agent, chooses among the agent's hotels and flights, messages the agent, and rates a finished trip |
| Agent | Works through their own queue of requests, adds flights and hotels for the customer, messages them, and reads their own statistics |
| Admin | Company-wide numbers, every request with manual reassignment, agents, airlines, configuration, visitor inquiries, review moderation and an audit log |

The page that loads at `/homepage` depends on the signed-in user's role.

## Key features

- **Known destinations.** The places a trip can go to are a `destinations` collection; orders point at them by id, and
  only active destinations can be booked.
- **Automatic assignment.** Each request goes to the agent with the fewest open requests (a head start for a specialist,
  skipping agents who are away). A request nobody answers within the promised time (24 h by default) is handed to
  another agent once, and the customer is told.
- **Checked offers.** Agents choose the real offer; the form warns, without blocking, when it differs from what the
  customer asked for, and the customer's cards say how each offer compares.
- **A privacy-aware public page.** The visitor page reads one aggregate document, `publicSummary`; numbers and reviews
  stay hidden until enough bookings exist for nobody to be identifiable.
- **Sign-in conveniences.** Remember me (30 days or the tab), a simulated-email password reset, a show-password toggle
  and floating labels. All of it is a demo of the flows, not real security (see
  [architecture.md](docs/architecture.md#security-considerations)).
- **Insights for agents.** Request funnel, customer satisfaction and business numbers, drawn with plain CSS.
- **A design system.** CSS custom property tokens with a dark scheme, reduced-motion support and shared components
  ([docs/design.md](docs/design.md)).

## Documentation

| Document | Read it for |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Layers, libraries, the mock API and its collections, Angular architecture, authentication and security notes, and why important decisions were made |
| [docs/application-flow.md](docs/application-flow.md) | Roles in detail, how a request moves from booking to rating (with diagrams), assignment, validation and error handling |
| [docs/design.md](docs/design.md) | Design tokens, typography, components, animation and accessibility |
| [docs/development.md](docs/development.md) | Prerequisites, commands, testing, linting, debugging and common problems |
| [docs/history/](docs/history/) | The upgrade logs: [dependency upgrade](docs/history/DEPENDENCY_UPGRADE_ROADMAP.md) and [Bootstrap and styling](docs/history/BOOTSTRAP_ROADMAP.md) |

## Getting started

Prerequisites: **Node.js** `^22.22.3`, `^24.15.0` or `>=26` (Angular 22's supported range) and npm. The Angular CLI is a
local dev dependency, so no global install is needed.

```bash
npm install
npm run mock-api   # terminal 1: json-server on http://localhost:3000
npm start          # terminal 2: ng serve -o  (http://localhost:4200)
```

Sample users are in `src/app/data/data.json` (`login` collection).

| Task | Command |
|---|---|
| Run the app tests | `npm test` (one library: `ng test <project>`) |
| Lint the app and every library | `npm run lint` |
| Build the app | `npm run build` (output in `dist/vica-assist/`) |
| Build every library | `npm run build:libs` |

The API base URL is `environment.api` in `src/environments/environment.ts` (`environment.prod.ts` replaces it in
production builds). More in [docs/development.md](docs/development.md).

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

- A real authentication backend (see [Security considerations](docs/architecture.md#security-considerations)) and
  persisting the session.
- Move from NgModules to standalone components, and zoneless change detection now that every component is
  `OnPush`.
- Extract the duplicated flight services into one.
