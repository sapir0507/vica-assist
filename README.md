# VicaAssist

VicaAssist is an Angular travel-booking app for a small agency: **agents** publish flight and
hotel listings, and **customers** browse them, assemble an order (flight and/or hotel), and
confirm it as a finished booking. It's an Nx workspace generated with Angular CLI 13.2.6.

## Architecture

- **`src/app`** — the main application: routed feature modules under `modules/all_modules`
  (choose/add flight & hotel, the final-order flow, user requests) and `modules/shared`
  (homepage, header/nav, login/register, footer), plus the `services/` layer described below.
- **`projects/`** — Nx libraries, each independently buildable and testable:
  - `my-flights`, `my-hotels` — the flight/hotel CRUD services and the "agent" forms that use them
    (`MyFlightsService`, `HotelsService`).
  - `item` — presentational `flight-item` / `hotel-item` cards used by the "choose" screens.
  - `mat-input` — a reusable Material form-field wrapper.
  - `my-pipes` — shared pipes (e.g. `Capitalize`).
  - `shared` — the flight/hotel/order interfaces, `HttpResourceService` and the `API_URL` token that the
    other libraries and the app depend on (imported as `@vica-assist/shared`). Libraries never import
    from the app; the app provides `API_URL` from `environment.api` in `AppModule`.
- **State management** uses [Akita](https://opensource.salesforce.com/akita/): each domain has a
  `*.store.ts` (holds state), `*.query.ts` (read-only selectors), and a `*.service.ts`
  (HTTP + store mutations) — see `services/order`, `services/finalOrder`, `services/session`,
  `services/links`.
- **Backend**: there's no real backend. `environment.api` (`src/environments/environment.ts`)
  points at `http://localhost:3000/`, served locally by `json-server` from
  `src/app/data/data.json`, whose top-level keys (`login`, `orders`, `hotels`, `flights`,
  `finalOrder`) become REST collections.

### The booking flow

1. An agent adds flights/hotels (`add-new-flight`, `add-new-hotel`), or a customer starts an
   order (`choose-flight`, `choose-hotel`), each a "pending" record on the backend.
2. `final-order` combines a customer's order with their chosen flight/hotel
   (`FinalOrderComponent` + `finalOrderStore`/`finalOrderQuery`).
3. Once everything required by the order's `choice` (`'flight'`, `'hotel'`, or `'both'`) is
   present, `finalOrderService.addfinalOrder()` posts the combined booking to the `finalOrder`
   collection and deletes the now-obsolete pending order/flight/hotel records.

Note two duplicated service pairs exist from earlier iterations of this flow:
`SflightService`/`ShotelService` (`src/app/services`) vs. `MyFlightsService`/`HotelsService`
(`projects/my-flights`, `projects/my-hotels`). Only `SflightService` (via `choose-flight`) and
the `projects/*` pair are actually wired into the app's components; `ShotelService` is kept for
backward compatibility but isn't injected anywhere.

## Development

```bash
npm install
npm run mock-api   # starts json-server on :3000 (the app's backend)
npm start          # ng serve -o, http://localhost:4200
```

Both need to be running for the app to do anything useful — every service in `services/` and
`projects/*` talks to `environment.api` (`localhost:3000`).

## Testing

```bash
npm test                  # the main app (Vitest)
ng test my-flights        # projects/my-flights
ng test my-hotels         # projects/my-hotels
ng test my-pipes          # projects/my-pipes
ng test item              # projects/item
ng test mat-input         # projects/mat-input
npm run lint              # ESLint for the app and every library
```

Several component specs render only a construction smoke test (`expect(component).toBeTruthy()`
without `fixture.detectChanges()`): their templates bind Material form controls
(`mat-select`, `mat-radio-group`, `formControlName`) that need either their real Material
modules or a surrounding `formGroup` the component doesn't itself provide, so a full render
isn't meaningful in isolation.

## Recent Engineering Work

This codebase had no meaningful test coverage and several real bugs; this pass added both and
fixed what the tests found.

**Bugs found and fixed** (`phases/phases-0/bug-fixes`):
- A store-freeze bug in `OrderService`: it aliased its own mutable arrays directly into Akita's
  store state, which Akita deep-freezes in dev mode — mutating those same arrays on the next fetch
  threw and silently broke order syncing after the very first call.
- An `HttpParams` immutability bug in `finalOrderService.get()` that silently dropped its own
  query filters.
- A hardcoded API host, two singular-vs-array response-type bugs, and a UI accordion that
  collapsed entirely when stepping past its first/last panel.

**Testing** (`phases/phases-1/test-coverage`): went from stub `expect(service).toBeTruthy()`
specs — or, in two of the six Nx projects, a test runner that couldn't execute a single spec due
to a missing dependency and an incompatible Jest preset — to 104 passing tests across all six
projects.

**Dependency audit** (`phases/phases-3/dependency-upgrade`): full audit of a multi-year-stale
dependency tree (Angular 13 → 21, Nx 14 → 23), written up as a staged, risk-ranked upgrade roadmap
([docs/DEPENDENCY_UPGRADE_ROADMAP.md](docs/DEPENDENCY_UPGRADE_ROADMAP.md)). Executed the zero-risk
phase: fixed a latent version-skew bug where `@angular/compiler` could silently drift ahead of
`@angular/core`, removed three fully-dead dependencies, and caught one bump that `npm outdated`
suggested as safe but actually required `@angular/common >=14.0.0` — shipped the real safe version
instead of trusting the tool output blindly.

## Known Limitations

- **A failing production index-html step** and other styling leftovers from the Angular 13 setup are
  tracked in [docs/BOOTSTRAP_ROADMAP.md](docs/BOOTSTRAP_ROADMAP.md).
- **Nx only runs lint and the project graph.** The Angular CLI (`ng`) is authoritative for build, serve
  and test via `angular.json`; Nx's adapter cannot run Angular's Vitest builder ("Vitest failed to find
  the runner"), so use `ng test <project>`.
- **One high-severity `npm audit` finding remains** (`undici` 7.x, pulled in by `nx` 23.3.0, the latest
  release). It is a dev-only dependency and will be picked up with the next Nx release.
- **`/choose-flight` and `/choose-hotel` routes are disabled** while their header links remain.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the app into `dist/vica-assist/`. `npm run build:libs` builds every library into
`dist/<name>/` in dependency order (`shared` → `my-pipes` → `item` → `my-flights` / `my-hotels` →
`mat-input`). Libraries that depend on other libraries resolve them from `dist/` through their
`tsconfig.lib.json` paths, so the order matters.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular CLI Overview and Command Reference](https://angular.io/cli) page.
