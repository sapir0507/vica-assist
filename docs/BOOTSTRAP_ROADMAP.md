# Bootstrap, Build & Styling Roadmap

## Status

**Done: the header sidebar and dropdowns now use `@ng-bootstrap/ng-bootstrap` (`NgbOffcanvas`,
`NgbDropdown`) and Bootstrap's global JS is no longer loaded.**

What happened: the "customers" and "agents" dropdowns did not open because `angular.json` loaded
`bootstrap.min.js`, which has no Popper, so clicking threw `TypeError: i.createPopper is not a
function`. Switching to `bootstrap.bundle.min.js` fixed it (verified in headless Chrome at 400px).
A running `ng serve` does not pick up `angular.json` changes, so it needed a restart. The header
was then moved to ng-bootstrap so open/close state lives in Angular instead of a global script.

## What changed

- `dropdown-sidebar.component.html`: the offcanvas is an `ng-template` opened through
  `NgbOffcanvas`; the panel is dismissed on route navigation and when the component is destroyed
  (it is rendered in `<body>`, so it would otherwise outlive the header swapping to the navbar).
- `dropdown.component.html`: `ngbDropdown` / `ngbDropdownToggle` / `ngbDropdownMenu` with
  `display="static"` so the menu stays inline inside the sidebar. This also removes the duplicate
  `id="offcanvasNavbarDropdown"`.
- `dropdown-sidebar.component.scss`: the `:host` wrapper was removed, because the panel content is
  rendered outside the host element.
- `angular.json` / `project.json`: the Bootstrap `scripts` entry is gone.
- Specs: `dropdown.component.spec.ts` opens the dropdown and asserts the links render; the navbar
  spec no longer logs unknown-element errors.

## Remaining

- Dead links: `/choose-flight` and `/choose-hotel` are in the customers dropdown (`LinkStore`), but
  their routes are commented out in `app-routing.module.ts`, so clicking them logs
  `NG04002: Cannot match any routes`. Either restore the routes or remove the links.
- Bootstrap itself is already the latest release (5.3.8, no Bootstrap 6 on npm) and `package.json`
  declares `^5.3.8`.

## Build and styling setup still on Angular 13 conventions

Found while checking how the project handles Bootstrap, CSS and Sass on Angular 21. Items 1 to 3
are done (see Phase 5 and Phase 7 of the dependency upgrade roadmap); items 4 to 6 are still open.

1. **Done: migrate to `@angular/build:application`.** `angular.json` used the deprecated
   `@angular-devkit/build-angular:browser` builder with `main`, a separate `polyfills.ts`
   (`zone.js`, `@angular/localize/init`) and `browserTarget` in `extract-i18n`. Moving to the
   application builder removed those.
2. **Done: the production build works.** `ng build` (production) used to fail at "Index html generation" with
   `document.documentElement?.setAttribute is not a function` while the development build passed. The
   production build now succeeds on the application builder, with `optimization.styles.inlineCritical:
   false` in `angular.json`; whether the builder or that setting is what fixed it was not isolated.
3. **Done: the duplicate build config is gone.** `angular.json` is the single source for build, serve
   and test; `project.json` keeps only Nx lint targets.
4. **Bootstrap 4 class leftovers.** `mr-2` in `orders-list.component.html` (twice) and
   `order-list-item.component.html` has no effect in Bootstrap 5; it is `me-2`.
5. **Sass `@import` to `@use`.** `src/assets/styles/global.scss` uses `@import "mixin"`, which Sass
   has deprecated. The `@import url(...)` Google Fonts lines in component styles are plain CSS and
   fine.
6. **Global Bootstrap and Material together.** Bootstrap CSS (`@use "bootstrap/scss/bootstrap"`)
   and Material's prebuilt `deeppurple-amber.css` are both loaded globally. Revisit with the
   restyle.

## Done when

- `ng build` (production) succeeds on the application builder, with a single build config.

## Planned restyle: design system guidelines

The whole UI will be restyled later, so the header and build work above should not assume the
current look. These are the guidelines for that restyle. It is a design-layer change on top of the
existing app, not a rebuild: reuse existing code, routes and functionality.

**Direction: photo-heavy and modern clean.** Priorities, in order: trust and clarity, an
inspirational hero built on destination images, a streamlined booking flow with destination
selection as step 1, visual hierarchy through typography and spacing, and mobile-first responsive
layout.

### Design tokens
- **Colors:** background off-white `#fafaf8`; accent purple `#7c3aed`; secondary teal `#0891b2`;
  a dark-gray text hierarchy (primary, secondary, muted); subtle gray borders.
- **Typography:** display font DM Sans or Sora; body font Inter or Outfit; a clear scale for
  h1, h2, h3, p and captions.
- **Spacing:** a scale of 4px, 8px, 16px and so on.

### Pages and components
- **Homepage (`/` or `/homepage`):** a hero with gradient and call to action; a trending-destinations
  grid of 6 cards (image, name, emoji or icon, "Flights from $450" price, lift-and-shadow hover);
  two action cards ("Book Your Trip", "Manage Bookings"); a trust section with 3 icons. Keep the
  existing navigation, header and logout.
- **Booking form (`/booking` or `/create-booking`):** the steps change from General Info,
  Passengers, Travel Details to **Destination, Passengers, Travel Details**.
  1. *Destination (new):* the same 6 cards, clickable, with the selection shown by a purple
     border; a search field ("Or search for another destination"); the choice is stored in the
     form state; progress shows "1 of 3".
  2. *Travelers:* keep the existing passenger logic, restyle it; "2 of 3".
  3. *Travel details:* keep the trip type (Flight+Hotel / Hotel / Flight), date picker and budget
     input; restyle the trip-type radio buttons; "3 of 3".
  Keep all existing form state management, validation and API calls.
- **Destination images:** free stock photos (Unsplash, Pexels, Pixabay), for example Paris,
  Tokyo, Bali, Dubai, Barcelona and Singapore. Keep them in a `destinations.json` (name, emoji,
  image URL, description, price), lazy-load them, and fall back to a gradient background if an
  image fails to load.

### Styling architecture
- Keep the existing SASS structure and add a design-system folder with `_colors.scss`,
  `_typography.scss`, `_spacing.scss` and `_components.scss`.
- Move existing components onto the design tokens.
- Dark mode through CSS variables and `prefers-color-scheme`.
- Responsive from 320px up; light and dark themes; accessible.
- No external component libraries, to keep it lean.

### Routing
Preserve all existing routes (including "Monitor Previous Orders"), keep back navigation working,
and do not change the database or API structure or remove authentication or security features.

### Phases
1. Design tokens (colors, typography, spacing).
2. Homepage: hero and destinations grid.
3. Destination picker as booking form step 1.
4. Animations, dark mode and mobile responsiveness.
5. Free stock images.

### Success criteria
- The homepage feels inspirational, with destination cards.
- The booking form starts with a visual destination picker.
- Colors, typography and spacing are cohesive.
- Mobile responsive and accessible, with dark mode working correctly.
- All existing features still work.

### Open question
"No external component libraries" conflicts with the current stack (Angular Material, Bootstrap,
`@ng-bootstrap/ng-bootstrap`) and with step 2 of the plan above (moving the header to ng-bootstrap).
Decide whether the restyle drops Material and Bootstrap, or whether "no new libraries" is what is
meant, before the header is reworked.
