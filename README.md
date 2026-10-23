# Kale Riders

Official homepage: https://kaleriders.com

A static website for Kale Riders, a Seoul-based partner for global projects entering Korea. The site includes English and Korean copy, responsive layouts, interactive service sections, animated artwork, and an inquiry form delivered to hello@kaleriders.com through FormSubmit.

## Development

Requires Node.js 22 or later and Python 3. No npm dependencies or build step are required.

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory public
npm test
```

Open http://127.0.0.1:4173. English is the default on a first visit. `?lang=ko` or `?lang=en` overrides the saved language preference.

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
