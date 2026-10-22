# Kale Riders

Official homepage: https://kaleriders.com

A static website for Kale Riders, a Seoul-based partner for global projects entering Korea. The site includes English and Korean copy, responsive layouts, interactive service sections, animated artwork, and a project brief saved locally on the visitor’s device.

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
- `checks/` contains the language and motion tests.
- `vercel.json` configures a static deployment with no build or install command.
- GitHub `main` is the production branch. Connected pushes deploy through Vercel.
- `kaleriders.com` is the canonical domain; `www.kaleriders.com` redirects to it.
- Domain registration and DNS are managed in Vercel.

The project brief is a local text download. It does not send a contact inquiry or store submitted data on a server.
