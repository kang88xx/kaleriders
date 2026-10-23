# KALE Riders — ribbon, hero and process-card QA

Date: 2026-10-23

## Approved scope and sources

- Ribbon direction: option 2, `/Users/henry/Desktop/kaleriders/previews/nameplate-options/option-2.png` (1586 × 992), selected in `/var/folders/72/w_z25p4x67j6bz_72b8jdkk00000gn/T/codex-clipboard-ZUlh8v.png`. Short right tail, shaded fold, subtle shadow, names only.
- Process card: `codex-clipboard-egyhy0.png` and `codex-clipboard-zYKzoQ.png` in the same clipboard directory. Remove all visible step numbers in this card and the large left arrow; improve copy.
- Hero: `codex-clipboard-KQuZM6.png`, `codex-clipboard-8uFKww.png`, `codex-clipboard-qzLPwG.png`. Remove the two body CTAs and fit the complete CRYPTO scene into the first desktop viewport. Header contact remains available.

## Rendered evidence

Local implementation: `http://127.0.0.1:4177/?lang=en#main`.

Browser-exported captures:
- `/Users/henry/Desktop/kaleriders/previews/qa-20261023/hero-desktop-1440.png`: 1440 × 780 CSS pixels, 2880 × 1560 bitmap, 2× density.
- `/Users/henry/Desktop/kaleriders/previews/qa-20261023/hero-mobile-390.png`: 390 × 741 CSS pixels, 780 × 1482 bitmap, 2× density.

Additional native Chrome captures in this conversation show the 1280 × 640 first viewport, the desktop process card with CONNECT selected, and the 390px process card with ACTIVATE selected. The full viewport and focused ribbon geometry were inspected. Source and implementation images were presented together in the same tool input/output for both mobile and desktop comparisons. The comparison uses the same proportions, not a pixel-difference score; character positions vary with the existing animation. The source JPEG used for tool-size limits is only a format-converted preview of the original PNG.

State: English, loaded fonts and artwork, normal animation, light paper theme, browser zoom 100%. Device previews used Chrome's Fit to window display scaling; exported bitmaps retain 2× density.

## Findings and corrections

No actionable P0/P1/P2 mismatch remains in the changed scope.

- Assets: three transparent WebP ribbons preserve a single folded return and one notched tail. Face, fold, tail and shadow move as one unit. Real source-image aspect ratios are retained; CSS frames excess transparent canvas. Kang, Kalya and Mascot are correctly capitalized. The existing character illustrations remain.
- Typography: names are bold and readable at desktop and mobile sizes; small redundant team labels were removed. Existing website font families and weight contrast remain.
- Layout: each character sits above its nameplate. Desktop hero height responds to viewport height; the entire CRYPTO word fits at 1440 × 780 and 1280 × 640. Mobile keeps a natural document flow and fits all three actors within the scene. The former hero button row and instructional hint are removed.
- Copy: the hero now states that KALE Riders helps global projects take root in Korea and build lasting fan relationships. The process card uses DISCOVER / Find your fit, CONNECT / Build local trust, ACTIVATE / Grow engagement, with concrete matching descriptions.
- Process card: visible 01/02/03 prefixes and the numerical progress counter are removed. Its stale counter-writing JavaScript and arrow CSS are deleted. Left text is vertically balanced without the large arrow. Mobile text wraps without clipping.
- Color: existing blue, lime, peach and paper palette is retained. P3: generated ribbon shadows have a slightly bluer edge than the source's neutral cast; at displayed size this remains unobtrusive.
- Motion: existing front/back flight layers are retained, so names may briefly pass behind patterned letters or each other. Hover/focus still brings a member forward; this is the existing interaction rather than a missing ribbon layer. No disconnected or independently flexing ribbon tail remains.

## Comparison history

The first asset pass exposed excess transparent canvas, corrected with proportional CSS framing. The newer hero request was then integrated, removing body CTAs and compressing copy and vertical spacing. Desktop and mobile comparisons passed after these changes. Native captures over the tool payload limit were replaced with a smaller dedicated Chrome window and browser-exported screenshots; no source-only visual completion claim is used.

## Validation

- `npm test`: 65/65 passed after all implementation changes.
- `node --check public/app.js` and `public/translations.js`: passed.
- `git diff --check`: passed.
- Native Chrome: CONNECT and ACTIVATE clicks each update their description and leave only one pressed state. Desktop and mobile layouts reviewed.
- Browser console inspected after interaction. Existing wallet-extension errors/warnings remain, including conflicting `window.ethereum` injection. Applying the local application URL filter leaves no messages; all 25 entries were hidden. No clean-profile zero-error certification is claimed.
- No separate lint, typecheck or build script exists in this static project.

final result: passed

## Closing wordmark and interface simplification — 2026-10-23

Approved reference: `/Users/henry/Desktop/kaleriders/previews/closing-wordmark/kale-riders-preview.png`. Applied the Kale Riders wording and proportions within the existing animated artwork, retaining procedural patterns, two torch characters, pointer placement, and reduced-motion behavior. The reference is a composition guide; pattern details and actor positions change throughout the existing animation.

Additional requested changes: removed the hero location/coordinates, slogan, bottom rule and down-link; removed the reference-section slogan; replaced four service tab numbers with Lucide icons; removed all four service-panel contact buttons and decorative bottom captions. Header/mobile-menu and closing contact entry points remain.

Verification: native Chrome captures in this conversation cover the complete changed artwork, services, and hero at desktop 1280px and mobile 390px widths using a local iframe review sheet. No clipped wordmark or horizontal page overflow was visible. All four service panels switched correctly using a click and ArrowRight. Decorative icons are excluded from accessible names and inherit selected-tab color. The mobile tab row keeps horizontal scrolling and suppresses incidental vertical overflow. Removed elements and their dedicated styles were deleted rather than hidden. No new application dependency was introduced. Icon provenance and license are included.

Automated verification: all 65 existing tests pass, including the renamed artwork label, drag placement, mobile beam alignment, reduced motion, translation coverage, and contact behavior. `node --check public/pattern-art.js` and `git diff --check` pass. No lint/typecheck/build command exists. No new console audit is claimed for this bounded text/CSS/icon change.

final result: passed

## Redundant navigation and outer rules — 2026-10-23

Removed the context-section `How we connect` link and its underline, its now-unused styles and translation, and the final paragraph's trailing margin. Removed only the top rule on the service tab row. Process list now draws borders between adjacent items, leaving its top and bottom open.

Native Chrome reviewed the process section in 1280px and 390px frames: interior separators remain, the outer top/bottom rules are absent, and text layout is intact. The accessibility tree no longer includes How we connect. Source review confirms the service tab selection indicator and bottom rule remain. All 65 tests pass; translation syntax and `git diff --check` pass. Footer alternatives are image-only previews outside the production repository and have not been applied.

final result: passed
