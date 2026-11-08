# Design

## Source of truth
Active, 2026-11-08. The owner approved all findings in `../../previews/service-refresh/qa/site-audit-20261106/report.html`. The 2026-11-08 owner request adds a full section-flow, English-copy and typography pass. The later circular-map trial was withdrawn by the owner; current code restores the version in `../../previews/service-refresh/checkpoints/2026-11-08-before-orbit` with English-first language controls. The trial source remains in `../../previews/service-refresh/checkpoints/2026-11-08-orbit-option-3`. Fresh baseline evidence is in `../../previews/service-refresh/qa/flow-review-20261108/before`; the pre-edit source is preserved in `../../previews/service-refresh/checkpoints/2026-11-08-flow-copy`. The owner selected revised footer option2, after removing its supporting sentence; source visual is `../../previews/service-refresh/public/assets/footer-options-20261108-v2/option-2.png`. This document describes the deployed homepage and its synchronized local preview. Earlier decisions are retained in `../../previews/service-refresh/archive/before-audit-improvements-20261106/DESIGN.md`; the complete previous working site is archived alongside it. The independent reference `/mnt/j/01_Project/kaleriders/site/public` and its 189-file manifest remain protected.

Evidence: BRAND.md, current screenshots and measurements in `../../previews/service-refresh/qa/audit-improvements-20261106`, approved brand concepts 1 and 3, real media provenance in `../../site/docs/case-study-sources.json`, and the client-flow audit. Production deployment is authorized in this session. The active production checkout is this checkout; the reference `/mnt/j/01_Project/kaleriders/site/public` stays protected.

## Brand
KALE Riders — KOLs, Authenticity, Loyalty & Engagement. Meaning: 진정성 있는 참여를 오래가는 팬 관계로 이어가다. Preserve cobalt, cream, lime, leaf lockup, floral CRYPTO artwork, and the existing member characters. Show genuine work without inventing testimonials, delivery roles, results, credentials or response-time guarantees.

## Product goals
Help project teams understand the five services quickly, inspect actual event records and the team, and start a relevant inquiry. Reduce redundant introduction, improve meaningful text, preserve chosen motion, and make every service discoverable at narrow widths.

## Personas and jobs
Global project teams evaluating a partner for Korea; creators and community partners reviewing the team; the owner comparing working and reference versions. Their primary task is to understand the support offered and contact the right team with project goals and timing.

## Information architecture
Hero with approved acronym signature → partner logos → five services → real event photos, records and films → local context → three-stage process → research and clearly marked report example → team → inquiry → footer. FAQ is retained with `hidden`, together with its footer link, for later restoration. Header navigation follows Services → Work → Approach; team and inquiry remain available.

On 2026-11-08, the owner requested restoring the deployed connection process board and context illustration in place of HOW WE MOVE. The process board retains #approach for navigation. Context now comes immediately before it, and the illustrative report follows both; real event evidence appears directly after services. The reference-strip heading and case-jump link are removed from the homepage; all five logos remain. `#friends` retains its approved testimonial design but stays hidden until genuine messages and approved attributions exist. Do not merely remove sample labels from fictional endorsements.

## Design principles
Reuse existing modules and brand treatment. Prefer concrete copy and readable explanations to extra slogans. Keep critical inquiry actions beside services. Distinguish observed event scenes from unverified delivery claims. Avoid repeated long introductory sections.

## Visual language
Existing color tokens remain authoritative. The owner requested self-hosted Pretendard Variable (v1.3.9, SIL OFL 1.1) for Korean and English interface text. The hero location reads “Based in Seoul” in sentence case, 12–13px, regular weight and .01em tracking. The English hero headline and “Entering Korea with a plan.” approach heading are one line above 600px and keep readable line breaks on phones. Hero acronym copy is 17–22px desktop /16px mobile at weight300, with initials500 and italic styling; the former KALE STANDS FOR caption and lime underlines are removed. Decorative section/service eyebrows, numeric section captions and LOCAL FREQUENCY /01 are removed; functional step order, report-example disclosures and controls remain. Major section headings share a 32–48px scale and 500 weight; mobile titles use 30–32px. Main explanatory copy is 15–16px desktop / 14–15px mobile, with 1.75–1.8 line height. Metadata is 11–12px; compact process-step labels never fall below 10px. English headings use approximately -.025em tracking, rather than the tighter Korean tracking. Chart labels render at 12 CSS pixels through a viewBox based on the rendered chart dimensions. Small circular team fronts remain approximately 76–84px. Main sections use 64px desktop / 40px mobile padding, with 96–112px total gaps between the paired context, process and reporting sections on desktop and 64–80px on mobile. Section-heading gaps are 28–32px. The desktop process diagram and all existing artwork remain; mobile labels may wrap within the same three-step layout.

## Components
Header and footer use `assets/kale-riders-logo-transparent.png`, an alpha-background edit of the supplied logo. Existing leaf/wordmark SVG crops and display sizes are preserved. Opaque source stays archived in assets; the new lockups use normal compositing instead of multiply.

`route-motion.js` synchronizes the existing SVG dash and one active lime stage on a5-second cycle (previously10seconds). Card clicks seek that same timeline. Stage-button hover/focus, reduced motion, hidden tabs and offscreen visibility pause the clock without catch-up jumps. Only manual selections use the polite description announcement. The process-board top bar and description separator are removed.

Short informational labels share a thin `var(--line)` border, fully rounded corners and4px/12px padding: Based in Seoul, Example report and desktop SEOUL /KR. They remain non-interactive. The report label keeps its lime fill; coordinates remain hidden on compact screens.

The owner removed the process-board footer strip (brand sentence and KALE RIDERS / SEOUL) and the standalone action-rate calculation note beneath the report. The report-example disclosure, metrics, data table and period controls remain.

`refresh-services.js/css` provides five panels and service-specific inquiry buttons. Stable Korean select values are carried in `data-brief-service`; visible EN names match service labels. `app.js` owns tabs, menu, dialog, form focus and the restored three-stage process board, including selected-stage preservation during language changes.

`refresh-insights.js/css` owns the bilingual report example, 4/8/12-week calculations, accessible data table and responsive chart. A ResizeObserver keeps labels from shrinking on mobile. Numeric sample provenance is visible directly above the metrics.

`refresh-media.js/css` owns the deterministic balanced photo order, three factual event records, three visible films and retained hidden testimonial proposal. Each source photo appears 5–6 times within the 100 cells; no new event imagery or additional unique photographs is claimed. `refresh-gallery.js/css` and its tested pure layout preserve the chosen fixed-frame push expansion.

`refresh-team.js/css` uses Kang's supplied portrait, and established monochrome character fronts for Kalya and Mascot instead of fictional human photos. All three flip to colored PFP backs. Existing simple responsibility descriptions are retained, with no invented credentials.

`site-refinements.css` contains shared reading rhythm, narrow-header sizing and the inquiry toolbar/scroll region, using existing tokens. No external package or new design system. Pretendard is a local font asset with its license; it does not require a CDN at runtime.

The footer uses two compact rows: original wordmark and navigation in the first row; a 13px single-line acronym, centered email and right-aligned copyright below. Only the K/A/L/E initials are bold. The supporting meaning sentence is removed in both languages. The later owner adjustment removes the middle divider between the two footer rows; the top footer boundary remains. Footer row padding is tightened to4px +4px on desktop (previously16px +12px), with18px/14px outer padding; mobile gaps are reduced while links retain44px tap heights. At compact widths the lower row wraps; on mobile the footer becomes a readable stack. Footer layout is scoped with `.footer-compact` in `site-refinements.css` ; the later typography pass independently reduces the hero signature. The FAQ navigation item is hidden with its section.

## Accessibility
Keep semantic keyboard-operable tabs, visible focus, retained FAQ semantics, accessible image/character labels, native video controls and no video autoplay. Retain reduced-motion handling and gallery pause on hover/focus/manual interaction, offscreen and hidden tab. The dialog keeps a 44px close control visible outside its scrolling form, traps modal focus natively, and restores trigger focus. Character movement instructions remain available to assistive technology without cluttering the visual page.

## Responsive behavior
Validate 320, 360, 390, 768 and 1440 CSS pixels in Korean and English. No page overflow. At 1050px and below the five tabs form two columns with the final item spanning both, without hidden sideways-only services. Reports stack on small screens; mobile metric rows remain readable. Gallery retains 20×5 desktop / 10×10 compact squares in a fixed frame.

## Interaction states
Service inquiries preselect the requested service while preserving user-entered fields; generic inquiries preserve existing selections. Form required-field and email validation, pending, confirmed-success and error states remain intact. Actual transmissions are not made during QA. Language switches preserve tab state and media nodes. The header places EN before 국문. Plain entry and invalid language queries default to English, ignoring old localStorage choices; explicit `?lang=ko` and `?lang=en` are respected. Switching languages updates the URL so reloading the chosen language still works; navigating back to a bare URL restores English.

Expanded photos change randomly every 2 seconds when active. Other tiles remain square, push sideways and dim, while the selected image has the approved border. Team auto-previews one random member every 3 seconds, with a 350ms coin flip, a 1-second PFP hold, and a return; only one member is active. Manual controls and visibility/reduced-motion safeguards remain.

## Content voice
Concise Korean and matching natural English. Use concrete descriptions of Korean market research, KOL campaigns, press outreach, meetups and event delivery. Replace repetitive slogan pairs, vague "next chapter" language and broad promises with short factual statements; keep the KALE acronym, approved brand graphics and Korean text. Remove duplicated slogans, visible drag/reset instructions, and preview-only team copy after fictional faces are removed. Keep truthful report-example explanation. Event cards identify KGEN VeriFi Korea, Open AGI Frontier and KBW Creators Night with observable scenes only. Inquiry explains review → discussion → scope/timeline proposal without promising an unconfirmed SLA.

## Implementation constraints
Vanilla HTML/CSS/ESM, no new dependencies. Keep this preview synchronized with the isolated active production checkout. Preserve original assets and reference files. For this flow/copy pass, verify syntax, section order and anchors, all service tabs, report periods, stage selection across language changes, gallery interaction, inquiry open/close, readable process labels, 320/390/768/1440px layouts in both languages, and fresh screenshots. Re-run gallery layout math or timing suites only when their implementation changes. Keep backups and evidence outside `public`.

## Open questions
- [ ] Owner: genuine supporter videos, approved quotes and attributions; required before showing `#friends`.
- [ ] Owner: verified per-project KALE responsibilities and outcomes; do not reuse draft metrics as real results.
- [ ] Owner: actual portraits for Kalya/Mascot if desired; established characters are the current truthful fallback.
- [ ] Owner: operational reply-time promise, if one is agreed. Current copy explains next steps without a deadline.
- [ ] Owner: more unique event photos; only 19 original photographs are currently available.
