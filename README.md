# Kale Riders

Official homepage: https://kaleriders.com

A static website for Kale Riders, a Seoul-based partner for global projects entering Korea. The site includes English and Korean copy, responsive layouts, interactive service sections, animated artwork, and an inquiry form delivered to hello@kaleriders.com through FormSubmit.

## Development

Requires Node.js 22 or later and Python 3. No npm dependencies or build step are required.

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory public
npm test
```

Open http://127.0.0.1:4173. Since 2026-11-13, at the owner's request, the site shows English only for now: `koreanEnabled` in `public/i18n.js` is false, so `?lang=ko` opens English too, and the language buttons carry `hidden` in `index.html` and `sample.html`. The Korean copy and the switch are kept; to bring them back set `koreanEnabled` to true, remove `hidden`, and restore the `?lang=ko` exception in the inline script at the top of `index.html`. What follows describes the switch as it works when Korean is on. English is the default whenever the URL has no language parameter, including for returning visitors. `?lang=ko` or `?lang=en` selects the language; the switch updates that parameter without saving a browser preference. The page copy in `index.html` is written in Korean and `i18n.js` switches it to English. So that an English visit never paints Korean first, a short script in the `<head>` hides the page until that switch (at most four seconds, in case the scripts fail to load) and the homepage preloads its modules; `checks/language.test.mjs` and `checks/photo-wall.test.mjs` cover both. When a module is added, removed or given a new version token, update the matching `modulepreload` line in `index.html`.

## Homepage release — 2026-11-08

The approved homepage presents services and work before the Korea context and three-stage approach, then research, team and inquiry sections. The FAQ and its footer link are hidden for later restoration. English appears first in the language switch and loads by default.

The latest typography pass uses self-hosted Pretendard for Korean and English, a single-line English headline on larger screens, a smaller light-weight KALE expansion and fewer decorative section labels.

The compact two-row footer has no divider between rows. Its KALE expansion uses small text with only K, A, L and E bold; the extra supporting sentence is removed. Desktop and mobile spacing follows the final approved local preview.

The process diagram advances its connector and highlighted stage together every five seconds. Visitors can select a stage directly; focus, hover and reduced-motion settings keep its description readable.

Only approved runtime modules and assets are included from the local preview. New comparison pages and withdrawn design variants are excluded. The production homepage allows indexing; the existing `/sample` draft remains `noindex`.

## Layout pass (2026-11-13)

The owner found the first screen too empty and asked for the spacing, title positions, sizes and weights to be checked across the site. The hero had been stretched to the height of the first screen, leaving about 160px of empty space above and below the CRYPTO lettering on a tall window; it is now as tall as its content, and the stage's height follows the lettering. In the hero only the three name ribbons fly, on gentler routes that stay within the lettering's height (`HERO_ROUTES` in `public/member-art.js`); the drawn characters remain in the closing section. The approach title, the only centred one, is left-aligned with its line on the right like the others; the services and approach titles share the other titles' tracking; the paddings that meet between sections add up to 112px (80px on phones); and the 10 and 11px labels on the process board, in the context picture and on phone buttons are 12px or more (the board's heading stays 11px at 360px and below so that it keeps one line). The ribbons also fly without characters on `/sample`, which shares `character-art.css`. The section order was reviewed and kept: offer and proof first (partners, services, events), then the reasoning (local context, process, research and reporting), then the team and the inquiry. These rules are the last block of `public/site-refinements.css`.

## Photo wall

The homepage wall under “People we brought together.” shows 200 event photos in square tiles. On 2026-11-12 the owner asked for smaller tiles and a larger opened photo, then chose the look from drafts (kept in `../../previews/wall-scale-20261112/`): 25 columns on wide screens, at first with 11 rows and repeated photos. On 2026-11-13 the owner settled on 8 rows and asked for the wall to be filled without repeats, so twenty photos were added (merch, crowds, stage and catering shots from the same candidate set) for 200 photos on 200 tiles; phones show them in 10 columns by 20 rows. Keep the count at 200, or `arrangeWall` repeats photos to fill the wall. The same day every wall photo was checked again for faces: the owner had found people still recognisable, so any face that can be made out is now pixelated, including small ones at the back of a room, with presenters on stage and printed faces left as they are. Each photo is a rounded chip with 1px between photos. An opened photo spans 9 by 6 tiles (8 by 5 on phones) and has no frame; the others dim to 38% brightness. While the wall plays by itself the opened photo changes every 1.54 seconds. On 2026-11-13 the owner reported the wall suddenly going all bright: pressing the opened photo used to close it, and a photo pressed with the mouse kept focus, so autoplay stayed paused after the pointer had gone. Now one photo is always open, a press opens a photo and holds it for four seconds, and only keyboard focus or a pointer over the wall pauses it (Escape still closes the photo for keyboard users). Escape and the arrow keys act only while focus is inside the wall: with a photo always open, the wall had been swallowing Escape for the whole page, so the inquiry dialog did not close on the first press (found in review and fixed the same day). A small photo under the pointer turns lime, the colour of the play buttons. Nineteen photos come from the event cases and sixteen were supplied by the owner (listed in `public/refresh-media.js`). On 2026-11-12 the owner asked for every collected event photo to go on the wall; the 145 added that day are listed in `public/wall-photos.js`: 57 from the event photographer's Drive folders for KBW Creators Night and Open AGI Frontier, and 88 from public X posts about the events (The Bridge Summit, KGEN VeriFi Korea and Seoul After Hours, Keep The Mo’mentum, the FOGO events, the Aria meetup). The X photos were posted by attendees and project accounts and are used at the owner's decision; three still carry the poster's own watermark. Wall photos are not part of a case story on `/sample`.

Faces close to the camera are pixelated under the owner's rule (attendees, booth visitors and staff; presenters on stage, people seen from behind, small distant faces and faces printed on screens or banners are left). The 145 added photos were masked from two face detectors' output and then checked twice by separate reviewers on zoomed tiles; readable name stickers and a video-call screen are pixelated too. `docs/case-study-sources.json` records each file's source (Drive file or X post), checksum and edit.

Since 2026-11-13 every real person's face is pixelated: the small faces at the back, then presenters, panellists, MCs and photographs of real people shown on screens or slides, after the owner reported a woman holding a microphone still recognisable. Only illustrations, mascots and printed artwork are left, and the film posters are frames without faces (`docs/case-study-sources.json`, `presenterCheck20261113`).

On phones (600px and below) the wall shows 80 of the 200 photos, 10 × 8, drawn afresh on each visit, with the opened photo 6 × 4 tiles; the owner found the page too long there. The rest of the phone layout is in `public/mobile-compact.css` and described in `DESIGN.md` under Responsive behavior. On phones the research list shows its three titles only; the descriptions stay in the page for screen readers.

The wall draws a small copy of every photo from `public/assets/cases/thumbs/` (short side 200px, about 2.4 MB for the whole wall) and loads the full file only when a photo is opened. A photo's optional `position` (CSS `object-position`, such as `50% 20%`) keeps its subject inside the square tile and the opened frame.

To add photos, copy them into `public/assets/cases/<event>/` (1280px on the long side, no metadata), add a 200px copy under `public/assets/cases/thumbs/<event>/`, append them to `public/wall-photos.js` with Korean and English descriptions, record them in `docs/case-study-sources.json` and update the photo count in `checks/case-studies.test.mjs`. Add or remove in twenties so the last row stays full. An optional `position` (CSS `object-position`, such as `50% 88%`) keeps an off-center subject inside the square and expanded crops. `arrangeWall()` in the same file builds the order; `checks/photo-wall.test.mjs` checks the spread, the square tiles and crop focus, the source records, and that each page loads every module under one version token.

## Event films

The row under the wall (“A look inside the events.”) shows three films: one large on the left and two small ones stacked beside it, ending level with it. Since 2026-11-12, at the owner's request, the large film is picked at random on each visit (`orderFilms`), each title lies on its picture and fades out once that film has started, and the frames have 12px corners. From 760px down the three stack in one column. `eventFilms` in `public/refresh-media.js` lists them by case: the FOGO Mainnet Party and Korea FOGO Meet Up case videos, and the KGEN · VeriFi Korea after-movie the owner sent on 2026-11-12. The KGEN case keeps a photo as its own media, so its film entry names the files. The after-movie was re-encoded from its 4K original to 1280 × 720 H.264 with AAC sound (94 s, 17.6 MB, index first so playback starts while it loads); its poster is the frame at 1:07.5, with the presenters, the VeriFi Korea banner and the screen. `docs/case-study-sources.json` records both files with the original's checksum, and `checks/case-studies.test.mjs` checks the row.

## Services infographic

On 2026-11-11 the owner asked for the five services to be shown lightly, as a simple infographic that says the team has delivered all five and can deliver them. The heading reads “직접 해온 일. 그래서 맡길 수 있는 일.” (“Work we’ve already delivered. Ready for your project.”). Each service shows its line icon, a check, its name and one short line, and lines from every service meet at a “KALE Riders” team label. On 2026-11-12 the owner added a sixth service, community management (second in the row), asked for copy that does not count the services, and asked for the partner symbols in the team label: while a service is highlighted, the label shows the symbols of the five projects in the partner-logo strip beside that service's steps. The same five show for every service, because which project used which service is not recorded, followed by “+N”. The owner asked for a figure between 5 and 10 for each service; the figures (`more` in `public/services-content.js`) are not a tally from records, so replace them with the owner's counts when supplied. The owner also chose the sign in each circle: “KOL” lettering, the Telegram plane for community, three people for meetups, a page with a bar chart for press outreach (a calmer, financial-news look), a parachute carrying a token for airdrops, and the Korea Blockchain Week wordmark for KBW events, drawn in the text colour. `docs/reference-logo-sources.json` records the four symbol files added for this. Only the highlighted service has a lime check; the others keep an outlined one. The section has no photos, project records, example documents or per-service inquiry buttons; inquiries start from the header and closing buttons.

On 2026-11-13 the owner replaced the check on every circle with the team's own leaf, shown only on the highlighted service, and gave each service its own partner projects and “+N” for the label (`partners` and `more` in `public/services-content.js`); Airdrops gained whitelists and sale allocation. The lines draw once, when 30% of the graphic is on screen; with reduced motion the graphic appears already drawn. Then the highlight moves to the next service every 1.56 seconds (slowed from 1.2 on 2026-11-12), from the first to the last and round again, and the team label shows that service's three steps. Pointing at, pressing or keyboard-focusing a service holds it for 3 seconds before the cycle continues. The cycle pauses while the section is off screen and does not run with reduced motion. Each button is described by its steps through `aria-describedby`, so screen readers read them with the button rather than announcing every change. Below 900px the services form a vertical list on a rail that runs into the team card. Every label state shares one grid cell there, so choosing a service never moves the page.

`public/services-content.js` holds the bilingual copy, the icons (the Lucide line icons the service tabs already used) and `serviceCycle()`. `public/refresh-services.js` and `.css` draw the section. `checks/services.test.mjs` covers the copy, the line geometry, the label states and the cycle timing with fake buttons and timers.

## Team

Each team coin shows a portrait in grayscale and flips to that member's colored PFP. Kang's front is the existing illustration. The owner supplied the Kalya photo and all three PFPs on 2026-11-11 and the current Mascot photo on 2026-11-12. That photo was a close-up cropped at the right edge of the head, so the frame around it (the right edge of the head, the background and the shoulders) was generated with a locally run image model to match the scale of the other portraits; the supplied pixels are unchanged. Kang's PFP was recut the same day on a clear ground and scaled to sit whole inside the coin. Later that day Mascot's portrait was recropped to centre the face and show it 15% larger, and Kalya's PFP was reframed 15% smaller, with the ring outside its round original generated by the same local image model. `docs/team-image-sources.json` records the source, edit and checksum of each file added since 2026-11-11; Kang's illustration predates it. `checks/team.test.mjs` checks that every member's files exist, the recorded checksums and the rendered coins. To replace an image, put a square crop in `public/assets/team/`, point the member's `image` or `pfp` in `public/refresh-team.js` at it and update its record.

On 2026-11-12 the owner asked for the role beside the name. Each caption now reads name and role on one line (the role drops under the name when the line is too narrow, as it does for the longer English roles near 1000px) and the description under them, at every width; the tablet layout that placed the description beside the role is gone.

The same day the owner asked for livelier coins: about every two seconds (it was three) a random coin turns to its PFP, sometimes two at once and now and then all three (`pickFlips` in `public/refresh-team.js`). Each coin holds its PFP for a second and turns back on its own; a press turns just that coin.

## Event sample

`https://kaleriders.com/sample` serves the event portfolio draft separately from the homepage. Vercel rewrites `/sample` and `/sample/` to `public/sample.html`. For the simple local Python server, open `/sample.html?lang=ko#work`. The page is marked `noindex` and keeps the Korean/English switch in its markup, hidden while the site is English only (2026-11-13).

The five cases use 19 original photos and two videos from the owner's Drive. Metrics and unverified delivery descriptions are illustrative and visibly labeled as drafts. Replace bilingual copy and values in `public/case-studies-data.js`; review the sample labels in `public/case-studies.js` before treating any values as verified. `docs/case-study-sources.json` records the source files.

`sample-app.js` initializes the case section before the shared app handles localization. The homepage refresh modules skip roots that are absent from this draft page. Native video controls do not autoplay or preload.

Run `npm test` for content, routes and existing behavior. With a local server and disposable headless Chrome listening on debug port 9227, run `CASES_BASE_URL=http://127.0.0.1:4173/sample.html node scripts/check-case-studies.mjs` for both languages at 360/390/768/1440px, photo decoding, video playback, keyboard expansion and locale-state preservation. Screenshots/results are written to the OS temporary directory under `kale-cases-qa/` (override with `CASES_QA_DIR`).

## Deployment

Vercel project: `kaleriders`, under `kang88xxs-projects`.

- `public/` contains all published files.
- `checks/` contains the inquiry, language, and motion tests.
- `vercel.json` configures a static deployment with no build or install command.
- GitHub `main` is the production branch. Connected pushes deploy through Vercel.
- `kaleriders.com` is the canonical domain; `www.kaleriders.com` redirects to it.
- Domain registration and DNS are managed in Vercel.

## Contact delivery

- Official domain: https://kaleriders.com/
- Official mailbox and fixed inquiry recipient: `hello@kaleriders.com`
- `public/contact.js` sends inquiries through the FormSubmit AJAX endpoint. The visitor’s email is the Reply-To address.
- A successful provider acknowledgement is required before the form shows success. Errors, timeouts, and activation-required responses preserve the visitor’s input and offer a direct email link.
- FormSubmit requires mailbox activation. The owner completed activation on 2026-10-23. At 12:16 KST, test `KALE-20261023-02` was submitted from the production website in Chrome and received in the `hello@kaleriders.com` inbox; the Korean message and Reply-To header matched the submitted values. If the recipient or form URL changes, repeat activation and verify inbox receipt; an HTTP success response alone is not delivery evidence.
- The form does not save visitor messages in browser storage. FormSubmit processes the submission; its privacy policy is linked beside the submit button.
- No npm dependencies, API keys, SMTP credentials, or changes to the existing Google Workspace MX/SPF records are needed.
- Automated tests use stubbed HTTP responses and do not send real emails. Test production delivery deliberately with clearly labeled test content.

Official setup references: [FormSubmit AJAX](https://formsubmit.co/ajax-documentation), [activation and canonical form URL](https://formsubmit.co/help), [Reply-To and honeypot](https://formsubmit.co/documentation).

## Brand and reference assets

- [Brand wording and development baseline](docs/brand.md)
- [Official reference logo sources and SHA-256 checksums](docs/reference-logo-sources.json)

Reference logos in `public/assets/references/` are copied from their official sources without recoloring, cropping, or redrawing. Only their display dimensions change with the layout.
