# Kale Riders

Official homepage: https://kaleriders.com

A static website for Kale Riders, a Seoul-based partner for global projects entering Korea. The site includes English and Korean copy, responsive layouts, interactive service sections, animated artwork, and an inquiry form delivered to hello@kaleriders.com through FormSubmit.

## Development

Requires Node.js 22 or later and Python 3. No npm dependencies or build step are required.

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory public
npm test
```

Open http://127.0.0.1:4173. English is the default whenever the URL has no language parameter, including for returning visitors. `?lang=ko` or `?lang=en` selects the language; the switch updates that parameter without saving a browser preference. The page copy in `index.html` is written in Korean and `i18n.js` switches it to English. So that an English visit never paints Korean first, a short script in the `<head>` hides the page until that switch (at most four seconds, in case the scripts fail to load) and the homepage preloads its modules; `checks/language.test.mjs` and `checks/photo-wall.test.mjs` cover both. When a module is added, removed or given a new version token, update the matching `modulepreload` line in `index.html`.

## Homepage release — 2026-11-08

The approved homepage presents services and work before the Korea context and three-stage approach, then research, team and inquiry sections. The FAQ and its footer link are hidden for later restoration. English appears first in the language switch and loads by default.

The latest typography pass uses self-hosted Pretendard for Korean and English, a single-line English headline on larger screens, a smaller light-weight KALE expansion and fewer decorative section labels.

The compact two-row footer has no divider between rows. Its KALE expansion uses small text with only K, A, L and E bold; the extra supporting sentence is removed. Desktop and mobile spacing follows the final approved local preview.

The process diagram advances its connector and highlighted stage together every five seconds. Visitors can select a stage directly; focus, hover and reduced-motion settings keep its description readable.

Only approved runtime modules and assets are included from the local preview. New comparison pages and withdrawn design variants are excluded. The production homepage allows indexing; the existing `/sample` draft remains `noindex`.

## Photo wall

The homepage wall under “People we brought together.” fills 100 square tiles from 35 unique photos. Each appears two or three times, and the balanced order keeps a photo from sitting directly beside or above itself. Nineteen come from the event cases. The owner supplied four more on 2026-11-10: two from KGEN VeriFi Seoul After Hours, a KGEN booth and an Axis Robotics booth. On 2026-11-12 the owner added eight more: four from Momentum × Buidlpad's Keep The Mo’mentum and four from the Aria meetup; faces close to the camera are pixelated in six of them, and the originals are in the kaleriders Drive. Later that day the owner uploaded four FOGO photos to the same Drive: the Mainnet Party photo zone and venue, and the Korea FOGO Meet Up venue and merch table; they are scaled to 1280px, and faces are pixelated in the photo of attendees at the party (`fogo/mainnet-networking.jpg`). The added photos are listed as `wallPhotos` in `public/refresh-media.js`, appear on the wall only, and are not part of a case story on `/sample`. At the owner's request the faces visible in the two After Hours photos are pixelated, so those two files differ from the supplied originals; `docs/case-study-sources.json` records both checksums.

To add a photo, copy the original into `public/assets/cases/`, append it to `wallPhotos` with Korean and English descriptions, record it in `docs/case-study-sources.json` and update the photo count in `checks/case-studies.test.mjs`. An optional `position` (CSS `object-position`, such as `50% 88%`) keeps an off-center subject inside the square and expanded crops. `arrangeWall()` in the same file builds the order; `checks/photo-wall.test.mjs` checks the spread, the square tiles and crop focus, the source records, and that each page loads every module under one version token.

## Event films

The row under the wall (“A look inside the events.”) shows three films side by side, stacked from 600px down. `eventFilms` in `public/refresh-media.js` lists them by case: the FOGO Mainnet Party and Korea FOGO Meet Up case videos, and the KGEN · VeriFi Korea after-movie the owner sent on 2026-11-12. The KGEN case keeps a photo as its own media, so its film entry names the files. The after-movie was re-encoded from its 4K original to 1280 × 720 H.264 with AAC sound (94 s, 17.6 MB, index first so playback starts while it loads); its poster is the frame at 1:07.5, with the presenters, the VeriFi Korea banner and the screen. `docs/case-study-sources.json` records both files with the original's checksum, and `checks/case-studies.test.mjs` checks the row.

## Services infographic

On 2026-11-11 the owner asked for the five services to be shown lightly, as a simple infographic that says the team has delivered all five and can deliver them. The heading reads “직접 해온 일. 그래서 맡길 수 있는 일.” (“Work we’ve already delivered. Ready for your project.”). Each service shows its line icon, a check, its name and one short line, and lines from every service meet at a “KALE Riders” team label. On 2026-11-12 the owner added a sixth service, community management (second in the row), asked for copy that does not count the services, and asked for the partner symbols in the team label: while a service is highlighted, the label shows the symbols of the five projects in the partner-logo strip beside that service's steps. The same five show for every service, because which project used which service is not recorded, followed by “+N”. The owner asked for a figure between 5 and 10 for each service; the figures (`more` in `public/services-content.js`) are not a tally from records, so replace them with the owner's counts when supplied. The owner also chose the sign in each circle: “KOL” lettering, the Telegram plane for community, three people for meetups, a page with a bar chart for press outreach (a calmer, financial-news look), a parachute carrying a token for airdrops, and the Korea Blockchain Week wordmark for KBW events, drawn in the text colour. `docs/reference-logo-sources.json` records the four symbol files added for this. Only the highlighted service has a lime check; the others keep an outlined one. The section has no photos, project records, example documents or per-service inquiry buttons; inquiries start from the header and closing buttons.

The lines and checks draw once, when 30% of the graphic is on screen; with reduced motion the graphic appears already drawn. Then the highlight moves to the next service every 1.56 seconds (slowed from 1.2 on 2026-11-12), from the first to the last and round again, and the team label shows that service's three steps. Pointing at, pressing or keyboard-focusing a service holds it for 3 seconds before the cycle continues. The cycle pauses while the section is off screen and does not run with reduced motion. Each button is described by its steps through `aria-describedby`, so screen readers read them with the button rather than announcing every change. Below 900px the services form a vertical list on a rail that runs into the team card. Every label state shares one grid cell there, so choosing a service never moves the page.

`public/services-content.js` holds the bilingual copy, the icons (the Lucide line icons the service tabs already used) and `serviceCycle()`. `public/refresh-services.js` and `.css` draw the section. `checks/services.test.mjs` covers the copy, the line geometry, the label states and the cycle timing with fake buttons and timers.

## Team

Each team coin shows a portrait in grayscale and flips to that member's colored PFP. Kang's front is the existing illustration. The owner supplied the Kalya photo and all three PFPs on 2026-11-11 and the current Mascot photo on 2026-11-12. That photo was a close-up cropped at the right edge of the head, so the frame around it (the right edge of the head, the background and the shoulders) was generated with a locally run image model to match the scale of the other portraits; the supplied pixels are unchanged. Kang's PFP was recut the same day on a clear ground and scaled to sit whole inside the coin. Later that day Mascot's portrait was recropped to centre the face and show it 15% larger, and Kalya's PFP was reframed 15% smaller, with the ring outside its round original generated by the same local image model. `docs/team-image-sources.json` records the source, edit and checksum of each file added since 2026-11-11; Kang's illustration predates it. `checks/team.test.mjs` checks that every member's files exist, the recorded checksums and the rendered coins. To replace an image, put a square crop in `public/assets/team/`, point the member's `image` or `pfp` in `public/refresh-team.js` at it and update its record.

## Event sample

`https://kaleriders.com/sample` serves the event portfolio draft separately from the homepage. Vercel rewrites `/sample` and `/sample/` to `public/sample.html`. For the simple local Python server, open `/sample.html?lang=ko#work`. The page is marked `noindex` and retains the existing Korean/English switch.

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
