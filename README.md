# Kale Riders

Official homepage: https://kaleriders.com

A static website for Kale Riders, a Seoul-based partner for global projects entering Korea. The site includes English and Korean copy, responsive layouts, interactive service sections, animated artwork, and an inquiry form delivered to hello@kaleriders.com through FormSubmit.

## Development

Requires Node.js 22 or later and Python 3. No npm dependencies or build step are required.

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory public
npm test
```

Open http://127.0.0.1:4173. English is the default whenever the URL has no language parameter, including for returning visitors. `?lang=ko` or `?lang=en` selects the language; the switch updates that parameter without saving a browser preference.

## Homepage release — 2026-11-08

The approved homepage presents services and work before the Korea context and three-stage approach, then research, team and inquiry sections. The FAQ and its footer link are hidden for later restoration. English appears first in the language switch and loads by default.

The latest typography pass uses self-hosted Pretendard for Korean and English, a single-line English headline on larger screens, a smaller light-weight KALE expansion and fewer decorative section labels.

The compact two-row footer has no divider between rows. Its KALE expansion uses small text with only K, A, L and E bold; the extra supporting sentence is removed. Desktop and mobile spacing follows the final approved local preview.

The process diagram advances its connector and highlighted stage together every five seconds. Visitors can select a stage directly; focus, hover and reduced-motion settings keep its description readable.

Only approved runtime modules and assets are included from the local preview. New comparison pages and withdrawn design variants are excluded. The production homepage allows indexing; the existing `/sample` draft remains `noindex`.

## Event sample

`https://kaleriders.com/sample` serves the event portfolio draft separately from the homepage. Vercel rewrites `/sample` and `/sample/` to `public/sample.html`. For the simple local Python server, open `/sample.html?lang=ko#work`. The page is marked `noindex` and retains the existing Korean/English switch.

The six cases use 19 original photos and three videos from the owner's Drive. Metrics and unverified delivery descriptions are illustrative and visibly labeled as drafts. Replace bilingual copy and values in `public/case-studies-data.js`; review the sample labels in `public/case-studies.js` before treating any values as verified. `docs/case-study-sources.json` records the source files.

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
