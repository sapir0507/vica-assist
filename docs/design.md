# Design System

The visual language of vica-assist: tokens, typography, components and accessibility rules. The source of
truth is `src/assets/styles/design-system/`; this page explains how it is organised and why.

## Principles

- **Tokens first.** Components read CSS custom properties (`var(--color-primary)`, `var(--space-4)`), never raw
  hex values or pixel sizes, so a theme change is a change to one file.
- **One palette, two schemes.** Light and dark are both first-class and follow the OS
  (`prefers-color-scheme`); there is no manual toggle.
- **Three libraries, one look.** Angular Material, Bootstrap and the app's own components are all pointed at the
  same tokens, so they never disagree about colour.
- **Accessible by default.** Visible focus, skip link, reduced-motion support and text colours chosen for contrast.

## Files

| File | Responsibility |
| --- | --- |
| `_colors.scss` | Colour tokens, light values on `:root`, dark overrides under `prefers-color-scheme: dark` |
| `_typography.scss` | Font families, type scale, line heights, weights, heading styles |
| `_spacing.scss` | Spacing scale, radii, shadows, transitions, header height |
| `_fonts.scss` | `@font-face` for the two self-hosted variable fonts |
| `_theme-colors.scss` | Material palettes generated with `ng generate @angular/material:theme-color` (do not hand-edit) |
| `_bootstrap.scss` | Only the Bootstrap parts the app uses, with its variables mapped to the tokens |
| `_components.scss` | Shared component classes (BEM-style naming: `.order-card__title`, `.chip--pending`) |

`src/styles.scss` loads them in that order and applies the Material theme, mapping `--mat-sys-*` variables to the
same tokens. Page-specific styling lives in each component's own `.scss`.

## Colour

Brand is a violet primary with a cyan secondary, on a warm off-white (light) or near-black (dark) background.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-bg` | `#fafaf8` | `#0f1115` | Page background |
| `--color-surface` | `#ffffff` | `#171a21` | Cards, header, inputs |
| `--color-surface-raised` | `#ffffff` | `#1f232c` | Elements above a surface |
| `--color-border` | `#e5e7eb` | `#2c313c` | Dividers and outlines |
| `--color-text` | `#1f2937` | `#f3f4f6` | Body text |
| `--color-text-secondary` | `#4b5563` | `#d1d5db` | Supporting text |
| `--color-text-muted` | `#6b7280` | `#9ca3af` | Hints, metadata |
| `--color-primary` / `-hover` | `#7c3aed` / `#6d28d9` | `#a78bfa` / `#c4b5fd` | Buttons, links, focus |
| `--color-on-primary` | `#ffffff` | `#1e1b2e` | Text on primary |
| `--color-secondary` | `#0891b2` | `#22d3ee` | Accents |
| `--color-secondary-text` | `#0e7490` | `#67e8f9` | Secondary colour used as text (darker for contrast) |
| `--color-success` | `#15803d` | `#4ade80` | Finished/confirmed |
| `--color-warning` | `#b45309` | `#fbbf24` | Pending |
| `--color-danger` | `#dc2626` | `#f87171` | Errors, destructive actions |
| `--color-overlay` | `rgb(17 24 39 / 55%)` | `rgb(0 0 0 / 65%)` | Modal backdrops |

Footer tokens (`--color-footer-*`) are a separate dark surface that stays dark in both schemes.

Status is never conveyed by colour alone: chips carry a text label (`pending`, `finished`), and the tinted
background is derived with `color-mix(in srgb, <colour> 16%, transparent)` so it adapts to either scheme.

## Typography

- **Display** (headings, brand): DM Sans Variable. **Body**: Inter Variable. Both are self-hosted through
  `@fontsource-variable` with `font-display: swap`, so there is no third-party font request.
- Scale: `--text-xs` 0.75rem, `-sm` 0.875rem, `-base` 1rem, `-lg` 1.125rem, `-xl` 1.25rem, `-2xl` 1.5rem.
  `--text-3xl` and `--text-4xl` use `clamp()` so `h1`/`h2` scale with the viewport without breakpoints.
- Line heights: tight 1.2 (headings), normal 1.5 (body), relaxed 1.7 (long text).
- Weights: regular 400, medium 500, semibold 600, bold 700.

## Spacing, shape and motion

- **Spacing:** `--space-1` to `--space-16` (0.25rem, 0.5, 0.75, 1, 1.5, 2, 3, 4rem). There is no `--space-5`;
  use the nearest step.
- **Radius:** `sm` 0.375rem (small controls), `md` 0.75rem (inputs, cards), `lg` 1.25rem (large panels),
  `pill` (buttons, chips, segmented switch).
- **Elevation:** three soft shadows (`--shadow-sm|md|lg`). Bootstrap shadows are disabled (`$enable-shadows: false`).
- **Motion:** see [Animation](#animation).

## Animation

Motion is used sparingly to explain change, never to decorate. Every animation has a reduced-motion fallback.

| Effect | Where | How |
| --- | --- | --- |
| Hover and focus feedback | Links, footer, sidebar, destination cards, buttons | CSS `transition` on colour, `transform` or `box-shadow`; cards lift `translateY(-4px)` on hover |
| Scroll reveal | Homepage sections | `reveal` directive adds `.reveal` (opacity 0, shifted down 1rem), then `.reveal--visible` once 12% of the element is in view; 0.6s ease, fires once |
| Hero entrance | Visitor homepage | Hero image settles from `scale(1.06)` over 1.4s; title, lead and button rise in turn (0.7s, 120ms apart). Only `transform` runs on the image so it does not delay the largest contentful paint |
| Staggered children | Steps, offer points, agents, airlines, reviews and stat tiles on the visitor homepage | `.stagger-item` with `--i` set to the item's position; once the parent `.reveal` section is visible each item runs the `rise` keyframes (0.5s) with a delay of 70ms per position, capped at the eighth |
| "How it works" timeline | Visitor homepage | Per step (180ms apart): the number pops in with a bounce, a line draws to the next number (wide screens only), then title and text rise. Hovering a step lifts it and grows its number |
| Agent cards | Visitor homepage | Cards rise in turn, then each avatar pops in and the name and title rise. No hover effect: the cards are not clickable |
| Gliding badge | Upcoming trip tickets | The round plane badge in the middle of the route line drifts a short way (up to 3rem) to one side, back through the middle to the other side and home (`glide`, 9s, ease-in-out, repeating), flipping to face the way it goes; `transform` only, and `cqw` makes the distance the line width. Under reduced motion it rests in the middle |
| Count-up numbers | Stat tiles on the dashboards | `countUp` directive waits at 0 until half the number is in view, then eases up to its value (900ms, ease-out cubic) and, once seen, re-animates from the last shown value when it changes |
| Drifting gradient | Admin hero banner | `drift` keyframes move the background position over 18s, alternating, infinite |

Guidelines:

- Animate only `opacity`, `transform`, colour and `box-shadow`; avoid animating layout properties.
- Durations: 150ms (`--transition-fast`) for small feedback, 250ms (`--transition-base`) for state changes,
  up to 0.6s for entrances. Use the tokens for new code; a few older components still use literal `0.2s`.
- Entrance and count-up effects play once; only the decorative hero gradient loops.
- Reduced motion is handled in two layers: the global `prefers-reduced-motion` rule in `_components.scss` shrinks all
  animation and transition durations, and each effect also opts out explicitly. `.reveal` is forced visible,
  the hero `animation` is set to `none`, and both directives check `prefersReducedMotion()` (exported from
  `reveal.directive.ts`) and show the final state immediately. The directives do the same when
  `IntersectionObserver` or `requestAnimationFrame` is unavailable, so content is never left hidden.
- A new effect must show its final state without motion, and must never hide content that only JavaScript can reveal.

## Customer dashboard

- **Hero** (`register-hero.jpg`, decorative) with an uppercase eyebrow, the title and a left-to-right dark fade for
  contrast; the two **action cards** overlap its bottom edge. Both are real links; the "Manage bookings" card shows
  `.chip--pending` / `.chip--ready` counts.
- **Order rows:** destination photo tile (`imageSrc`; the emoji and gradient show if it is missing or fails to load), title, "Flight + Hotel · dates · travelers", a `.chip` for the stage and a thin
  progress bar (`role="progressbar"`, `aria-valuetext` = the stage name, so colour is never the only cue). Stages are
  Request sent, Agent choosing options, Ready to confirm, Booked (`orderStage` in `my-request/timeline.ts`). The bar
  fills with a `scaleX` animation once its section is revealed.
- **Agent card:** initials avatar with an availability dot, rating, languages and answer time, and a Message button
  that opens the messages page. Conversations belong to a request, so that page lists the customer's requests with
  that agent and shows the thread only after one is selected, never assuming which.
- Cards that are not links (order rows, agent card) have no hover effect; the action cards, which are links, lift.

## Bookings page

- **Tabs** (Waiting for agent, Ready to choose, Booked) are a pill-shaped `role="tablist"` with a count badge each; the
  page opens on Ready to choose.
- **Order cards** show a From / To block with a dashed line, the made-by, trip-type and date facts, a green banner with
  what the agent added (a CSS check mark, no icon), and the primary Open order button next to Track status. Cards that are
  not clickable have no hover lift.
- **Booked tab:** trips still ahead are *Upcoming* tickets, with the trip on the left and the spend on the right (a
  `conic-gradient` ring of budget used, price, "Leaves in N days"). Finished trips are rows under *Past trips*, with the
  count and total; a row opens (`aria-expanded`) to its details and the review form. Rated trips show a star chip,
  unrated ones a Rate your trip button.
- **Empty states** (`.empty-state`): a brand icon tile, one sentence and a way forward (Book your trip).
- **Destination pictures** come from the `destination-art` component: the destination's `imageSrc` photo, or the emoji
  on its gradient when there is none or it fails to load. It takes a `destinationId` and reads the destination from `DestinationStore`; size it with `--art-size`.

## Form fields

- **Floating label** (`.form-field--floating`): the label sits inside the input and shrinks to the top when the
  field has focus or a value. The input needs `placeholder=" "` so `:placeholder-shown` can tell empty from filled,
  and the label stays a real `<label for>` after the input. Used on the login, register and password-reset forms.
- **Password toggle** (`<password-toggle [input]="pwd">`, `.form-field--toggle`): an eye button inside the field that
  switches the input between hidden and readable. It is a `type="button"` with `aria-label` and `aria-pressed`.
- **Checkbox row** (`.auth-row`, `.auth-check`): "Remember me" and a link on one line, wrapping on narrow screens.
- **Submit buttons** are disabled while the form is invalid (and while it is saving or sending), shown at half opacity
  without the glow. Field errors still appear once a field has been touched, so the reason is never hidden; forms
  without inline errors (admin airlines, add flight, add hotel) show a short hint instead.
- **Demo message** (`.demo-mail`): a dashed box that shows what an email would have said, because no email is sent.

## Layout and responsiveness

- Fluid first: grids use `repeat(auto-fill, minmax(min(100%, 19rem), 1fr))` (`.order-grid`, `.choice-grid`) so
  cards reflow without media queries, and horizontal padding uses `clamp()`.
- Breakpoints for the cases that need them live in `assets/styles/media.scss` (mobile 600px, tablet 768px,
  tablet landscape 1024px, desktop 1440px).
- The header has a fixed `--header-height` (4rem). Auth pages fill the space between header and footer so the
  form is visible without scrolling on a normal screen.

## Components

| Class | Purpose |
| --- | --- |
| `.site-header`, `.brand` | Translucent, blurred sticky header and logo lockup |
| `.btn-primary` | Pill-shaped primary button (Bootstrap button re-skinned with tokens) |
| `.form-control`, `.form-field`, `.form-grid`, `.form-hint` | Inputs and the two-column form layout shared by booking and agent forms |
| `.auth-page`, `.auth-card`, `.auth-form`, `.auth-choice` | Login and register pages |
| `.order-grid`, `.order-card` | Order lists on the customer homepage and request pages |
| `.chip`, `.chip--pending`, `.chip--finished` | Status labels |
| `.page`, `.page__title` | Routed page: centred column with a title |
| `.choice-grid` | Cards to pick a hotel or flight |
| `.segmented` | Pill-shaped switch between views of one page |
| `.admin-section`, `.admin-table`, `.admin-card` | Admin dashboard building blocks |

Empty states use a dashed border (`.order-grid__empty`, `.choice-grid__empty`) rather than blank space.

## Accessibility

- A global `:focus-visible` outline (2px, `--color-focus-ring`, 2px offset) applies to every interactive element.
- `.skip-link` is the first focusable element and jumps past the header.
- `--color-secondary-text` exists because the secondary brand colour fails contrast as body text on white; use it
  for text and keep `--color-secondary` for fills and icons.
- Animation respects `prefers-reduced-motion`; the page sets `color-scheme: light dark` so native controls match.

## Extending the system

1. Add or change a value as a token in `_colors.scss`, `_typography.scss` or `_spacing.scss`; define dark
   overrides in the same file when the value is a colour.
2. Add a class to `_components.scss` only when two or more components share it; otherwise keep the style in the
   component's own `.scss`.
3. Never hard-code a colour in a component. If a token is missing, add one.
4. Check both colour schemes before committing (switch the OS or browser's emulated `prefers-color-scheme`).
