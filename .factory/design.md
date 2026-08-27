# Design thesis: Inkboard time studio

## Direction and rationale

Headless Scheduler uses a **risograph tactile collage** rather than the polished blue chrome common to calendar software. Planning is physical: sticky notes move, ink overlaps, ruled paper holds time in place. The docs site therefore reads like a working studio table—useful grids under imperfect ink—while the library itself stays headless. The visual metaphor explains the product: structure is supplied, surface is yours.

## Palette

The single light, paper-based treatment is intentional; the riso inks depend on an off-white stock. The library is theme-neutral and its example preset exposes every color as a CSS variable.

| Token | Value | Use |
| --- | --- | --- |
| paper | `#f4efdf` | warm page stock |
| paper-deep | `#e8dfc9` | grouped regions |
| ink | `#19231f` | primary text (13.2:1 on paper) |
| ink-soft | `#4e5c55` | secondary text (6.4:1) |
| tomato | `#c93f32` | primary action and time ink |
| tomato-dark | `#8d241e` | accessible action surface |
| cobalt | `#2456a6` | links, focus, second ink |
| cobalt-dark | `#173b78` | accessible blue surface |
| leaf | `#2f6b47` | success/availability |
| ochre | `#9b6400` | warning |
| danger | `#a52424` | error/destructive state |

Color is never the only status signal: event categories include text and patterns; online state includes a label and dot.

## Type, spacing, shape

- Display: the local platform serif stack (`Georgia`, `Times New Roman`) gives the page its printed-editorial voice without a font request.
- Utility/body: the local system sans stack (`ui-sans-serif`, `system-ui`) keeps the npm example fast and code legible. Numeric cells use tabular figures. No font files or third-party font services are loaded.
- Scale: 14 / 16 / 20 / 28 / 44 / 72 px. Body never drops below 16 px.
- Spacing follows a 4 px base with 8, 12, 16, 24, 32, 48, 72 steps.
- Edges are mostly square with 2–8 px softening. Offset 2 px ink shadows and coarse dashed rules replace generic floating cards.

## Interaction grammar and motion

Interactive objects behave like paper pieces: hover lifts by 2 px, pressed objects return to the table, and a moved event settles over 180 ms. View changes crossfade/translate for 220 ms. Focus is a 3 px cobalt ring with a paper gutter. Under `prefers-reduced-motion: reduce`, all translation and smooth scrolling are removed; state changes remain visible through contrast and outline.

Touch targets are at least 44 px. The narrow layout drops decorative artwork first, turns the view switcher into a horizontal strip, and preserves a horizontally scrollable timeline rather than illegibly shrinking it.

## Asset plan and provenance

- `site/public/riso-scheduler.webp`: original generated hero collage showing torn calendar strips, resource rows and movable red/blue paper events. Generated with the Param Factory `factory-image` deployment on 2026-08-27, then converted locally to WebP. Prompt is stored beside the source metadata in `site/public/riso-scheduler.png.json`. No source brands, copied UI, logos, or third-party assets.
- Interface icons are hand-drawn inline SVG paths authored for this repository. They inherit current color and need no external icon font.
- Paper grain and registration offsets are CSS-authored, so they add no image request or tracking surface.

## Tailwind-native contract

The example theme is a small `@layer components` stylesheet using stable `hs-*` hooks and CSS variables. Consumers can copy it into Tailwind, map the tokens in `tailwind.config`, or ignore it and render their own DOM through render props. No high-specificity selectors or runtime styling library is used.
