# Bootstrap, Build & Styling Roadmap

## Status

**The header's mobile sidebar dropdowns ("customers" and "agents") are currently not working: they
do not expand, so Choose Flight / Choose Hotel / Add Flight / Add Hotel are unreachable on phone
and tablet widths.** This needs to be fixed, not just documented.

## What is known

- The sidebar (`dropdown-sidebar.component.html`) and its dropdowns (`dropdown.component.html`)
  are driven by Bootstrap's global JavaScript through `data-bs-toggle` / `data-bs-dismiss`
  attributes, outside Angular's change detection.
- `angular.json` loaded `bootstrap.min.js`, which does not include Popper, although
  `@popperjs/core` is installed. It now loads `bootstrap.bundle.min.js`. This did **not** resolve
  the problem, and the root cause is not yet confirmed.
- Installed versions: Bootstrap 5.3.8, Popper 2.11.8 (`package.json` declares `bootstrap ^5.1.3`).
- `NgbModule` (`@ng-bootstrap/ng-bootstrap`) is already imported in `app.module.ts` but is not used
  by the header.
- Both dropdowns share `id="offcanvasNavbarDropdown"`, so their `aria-labelledby` attributes both
  point at the first toggle.

## Plan

1. **Diagnose in the browser.** Open the sidebar at a phone width, click a toggle, and record the
   console error (if any). Check whether the bundle script loads (`window.bootstrap` is defined),
   whether `.dropdown-menu` receives the `show` class, and whether the `ddm-*` styles in
   `dropdown.component.scss` or the sidebar styles hide the opened menu.
2. **Replace data attributes with `@ng-bootstrap/ng-bootstrap`.** Use `NgbDropdown` for the two
   dropdowns and `NgbOffcanvas` for the sidebar, so open/close state lives in Angular instead of
   a global script. Then drop the `scripts` entry from `angular.json`.
3. **Fix the duplicate dropdown id** (resolved by step 2, since `NgbDropdown` manages the
   `aria-*` wiring).
4. ~~**Upgrade Bootstrap**~~ Done: 5.3.8 is the latest release (no Bootstrap 6 on npm), and the
   declared range in `package.json` is now `^5.3.8`.
5. **Tests:** add a header spec that opens a dropdown and asserts the links render; the existing
   header specs only check that the components are created.

## Build and styling setup still on Angular 13 conventions

Found while checking how the project handles Bootstrap, CSS and Sass on Angular 21. None of this
has been changed yet.

1. **Migrate to `@angular/build:application`.** `angular.json` uses the deprecated
   `@angular-devkit/build-angular:browser` builder with `main`, a separate `polyfills.ts`
   (`zone.js`, `@angular/localize/init`) and `browserTarget` in `extract-i18n`. Moving to the
   application builder removes those and is the likely fix for item 2.
2. **Fix the production build.** `ng build` (production) fails at "Index html generation" with
   `document.documentElement?.setAttribute is not a function`; the development build passes.
   Suspects: critical-CSS inlining or Google Fonts inlining (`index.html` loads several Google
   Fonts links). Not confirmed.
3. **Remove the duplicate build config.** `project.json` repeats the build/test config in
   `angular.json` and still references `bootstrap.min.js`. Keep one source of truth.
4. **Bootstrap 4 class leftovers.** `mr-2` in `orders-list.component.html` (twice) and
   `order-list-item.component.html` has no effect in Bootstrap 5; it is `me-2`.
5. **Sass `@import` to `@use`.** `src/assets/styles/global.scss` uses `@import "mixin"`, which Sass
   has deprecated. The `@import url(...)` Google Fonts lines in component styles are plain CSS and
   fine.
6. **Global Bootstrap and Material together.** Bootstrap CSS (`@use "bootstrap/scss/bootstrap"`),
   Bootstrap JS (`scripts`) and Material's prebuilt `deeppurple-amber.css` are all loaded globally.
   Revisit once the header no longer needs Bootstrap's JS.

## Done when

- On phone and tablet widths, both dropdowns open and every link navigates.
- No `bootstrap*.js` entry remains in `angular.json` `scripts`.
- `ng build` (production) succeeds on the application builder, with a single build config.
- The header spec covers opening a dropdown.
