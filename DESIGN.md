# Design

## Source of truth
Status: Active. User selected mixed direction 02, 꽃이 핀 케일 가든 (`garden-bloom`), with its screenshot. Date: 2026-10-26.
Surface: patterned wordmark illustrations, original three-direction review page, and a new two-direction mixed review page at `mixed-botanical-options.html`.
Evidence: `docs/brand.md`, `design-qa.md`, `public/assets/kale-riders-logo.png` (visually inspected), `public/character-art.js`, `public/pattern-art.js`, `public/closing-spray.js`, `public/styles.css`, and the user's supplied screenshots and feedback.

## Brand
KALE Riders connects international projects with Korea and builds lasting fan relationships. The symbol is an asymmetric, curly kale leaf with a tapered stem and branching blue veins. Artwork is friendly, confident, flat and graphic. The latest request explicitly brings the original rounded, slender-petal and soft five-petal flowers back into the foliage. Reuse their exact vector geometry from the original `public/pattern-art.js` in git; avoid unrelated flower styles, realistic shading or a new logo.

## Product goals
Make kale and growing greenery recognizable within the letterforms while preserving the existing illustration family. Apply the selected fuller leaf-and-flower garden (`garden-bloom`) to the CRYPTO hero and Kale Riders closing wordmarks. Reuse the exact approved artwork, placement and colors; preserve the characters and lime spray motion.

## Personas and jobs
The project owner compares directions and selects a pattern. Website visitors should connect the artwork to the kale name/symbol without additional explanation.

## Information architecture
Original review page retains all three botanical directions. New mixed review page contains two overview links, complete and animated wordmark views, enlarged pattern/specimen details, and CRYPTO applications. Shared motion controls retain the same timing. Main website navigation and contact flows remain the existing implementation.

## Design principles
- Preserve irregular lobed edges, a directional stem and visible veins so kale cannot be confused with a flower.
- Keep flowers recognizable as the original artwork and vary their scale/frequency between the two mixed options.
- Vary composition, silhouette, density and direction, rather than merely recoloring one pattern.
- Keep enough blue space to distinguish individual leaves within narrow letter strokes.
- Test large pattern fields and clipped typography; both must work.
- Keep captions short and concrete; show the design prominently.

## Visual language
Blue `#254ad8`, lime `#d8ee7a`, lavender `#b8c6f3`, peach `#e8b58d`, paper `#f4f3eb`. Lime and paper lead botanical fills; peach is a small accent. Blue rounded outlines and veins match existing vectors. Reuse local Kaky Sans with Arial wordmark lettering. The chosen lime spray remains fixed. Word positions stay fixed; only paint resets. Existing characters and exact 15-second spray/body motion remain.

## Components
The artwork exposes the same eight-tile/four-color motif contract to the existing renderer. Flowering Kale Garden (`garden-bloom`) is the shared default for main-page SVG lettering and the closing Canvas renderer. Comparison pages retain all alternatives through explicit artwork arguments. Faint base markings use the selected motifs as well.

The mixed sets share five Garden foliage tiles and three original flower tiles. `garden-accent` remains an alternative with 180 placements and 25% smaller flowers; selected `garden-bloom` uses 220 placements with 45% flowers of varied sizes. These percentages describe motif counts, not visible area. Existing comparison playback is reused by both pages.

## Accessibility
Semantic headings and named links/buttons, visible keyboard focus, text labels alongside color. Decorative SVGs are hidden from accessibility APIs; scene images have descriptions. Default completed still frame permits shape evaluation. Motion requires an explicit control, honors reduced motion, and stops when the document is hidden. No flashing.

## Responsive behavior
One shared max-width with consistent page gutters. Three overview fields become a single column on small screens. Detail rows stack. Wordmark scenes preserve their aspect ratio and avoid horizontal overflow. Controls wrap and keep at least 44px touch targets.

## Interaction states
Static SVG wordmark fallback is present before images decode. Loading feedback changes to ready only after decoded assets. Errors retain the static comparison. Completed view shows all shapes; motion view reuses synchronized existing spray timing. Pausing retains the current frame. Page hiding cancels requestAnimationFrame.

## Content voice
Korean, clear and specific: describe what differs in shape and arrangement. Do not put implementation details or unsupported marketing claims in the review UI.

## Implementation constraints
Vanilla ESM/SVG/Canvas2D, no new application dependency. Preserve current typography, layout, characters, flight paths and lime spray. Main artwork module imports and HTML entry carry revision `garden-bloom-20261026` to avoid reusing the earlier cached module graph. Review vector outputs offline with available local SVG/Canvas renderers, then run existing tests and targeted checks. User explicitly requested links only and no Chrome opening for this task; that overrides the earlier default Chrome review preference.

## Open questions
- [x] User selected mixed direction 02, Flowering Kale Garden, and authorized application.
- [x] Served main entry and all 12 ESM modules checked; the entire artwork import chain is revisioned. Actual default rendering equals the selected preview in 10 desktop/mobile complete, spray and reset states. All 72 tests pass. Earlier browser state was not reproduced, so its cause is not asserted. No Chrome tab was opened; the returned link requests fresh HTML and modules.
