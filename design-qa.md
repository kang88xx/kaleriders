# KALE Riders — heading and alignment QA

Date: 2026-10-23

## Visual targets and approved changes

- FAQ source: `/var/folders/72/w_z25p4x67j6bz_72b8jdkk00000gn/T/codex-clipboard-iC8xP2.png` (954 × 650). The user's latest instruction explicitly removes the rail and its indentation from option 2.
- Team heading source: `/var/folders/72/w_z25p4x67j6bz_72b8jdkk00000gn/T/codex-clipboard-RuHzVY.png` (1718 × 548). Keep the stronger line; reduce the lighter line from 400 to 300; remove section label numbers.
- Team caption source: `/var/folders/72/w_z25p4x67j6bz_72b8jdkk00000gn/T/codex-clipboard-6xi0Mn.png`. Capitalize names; remove the numbered affiliation and bottom rule.

## Rendered evidence

Implementation: `http://127.0.0.1:4177/?lang=en#faq` and `#team`.
Implementation screenshot path: no filesystem export was available; native Chrome screenshots are retained in this conversation's CUA results titled “팀 타이틀 굵기 전후 비교”, “FAQ 링크 이동 후 시안 비교”, and “390px 모바일 FAQ 레이아웃 확인”. These are browser-rendered captures, not source-code renderings.

Desktop capture: 3840 × 2160 native pixels, 1920 CSS-pixel window at 2× density; content viewport approximately 1905 × 929 CSS pixels after browser chrome and scrollbar. Mobile: explicit responsive viewport 390 × 842 CSS pixels, rendered as 780 × 1684 physical pixels within the desktop capture.

State: English, warm paper theme, loaded fonts, closed FAQ, normal motion. The mobile layout also showed the lighter team heading and capitalized names in the accessibility tree.

The source image and implementation capture were emitted together in the same comparison input for both FAQ and team headings. Comparison focused on readable heading regions, disregarding source canvas margins and browser chrome. Source heading text uses the same approximate physical size as the desktop capture; no exact pixel-difference score is claimed. Mobile is a responsive adaptation, not a literal crop match.

## Findings

No actionable P0/P1/P2 mismatch remains in the changed layout.

- Typography: existing Noto Sans KR 500 headline faces remain unchanged. Existing lighter spans use a real Noto Sans KR 300 face, matching the existing font version 2.004. English two-line heading structure remains intact. Mobile team text wraps naturally; FAQ fits without clipping.
- Spacing/layout: FAQ label and title share the same left edge; no rail or residual indentation. Header and footer reuse `.section-shell`; desktop left and right edges visibly align. Mobile controls fit the 390px viewport.
- Colors/tokens: paper and blue tokens are unchanged. No opacity trick was used to simulate lighter type.
- Assets: existing logos and character artwork are retained. Mascot's star figure, not the fallback character, was verified after a hard reload.
- Copy: QUESTIONS & ANSWERS; five main-section number prefixes removed. Mascort corrected to Mascot throughout identity wiring. Kang, Kalya, Mascot names and links are present; team affiliation spans and divider CSS removed.

## Comparison history

The first complete target-versus-render comparisons passed. An earlier local capture had cached JavaScript showing the fallback mascot and stale accessibility translations; a hard reload loaded the new modules, restoring the star figure and translated Mascot label. This was a preview-cache issue, not a design change.

## Validation and limits

- `npm test`: 65/65 passed after the final code edits.
- `git diff --check`: passed.
- Desktop and 390px mobile Chrome captures inspected. Existing automated tests cover FAQ exclusive expansion, animation reversal, localization, and character motion/drag behavior.
- Browser console inspected: existing extension-related output and warnings are present. This is not a clean-profile zero-error certification. No new application error was identified in the reviewed output.
- Native screenshot download was interrupted by Chrome window changes; the captures remain available in the conversation. No standalone image export is claimed.
- The requested name-tag alternatives are a separate design exploration; neither alternative is applied in this change.

## Implementation checklist

- [x] FAQ label and left alignment
- [x] Five section labels without numbers; existing lighter headings at 300
- [x] Shared header/footer container
- [x] Corrected and capitalized member names; simplified team captions
- [x] Existing test suite and desktop/mobile visual review

final result: passed
