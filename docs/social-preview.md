# English social preview

- Published asset: `public/assets/kale-riders-social-en-v2.png`
- Dimensions: 1200 × 630, opaque PNG, about 150 KB.
- Source: `scripts/social-card.html`, drawn with the site's own files: the logo
  (`public/assets/kale-riders-logo-transparent.png`), the leaf (`public/assets/favicon-kale-rider.png`)
  and Pretendard Variable. `node scripts/render-social-card.mjs <path to playwright-core>` writes the PNG.
- Text on the image: the logo and the headline “Global projects. Local connections.” Nothing else.
  On 2026-11-13 the owner asked for less text on the thumbnail and chose this from two drafts
  (kept in `../../previews/share-card-20261113/`).
- Usage: Open Graph and Twitter large-image metadata on the homepage and `/sample`; independent of body language.
- Title: “KALE Riders | Your Local Partner in Korea” (unchanged).
- Description, shortened the same day: “KOL campaigns, community management, meetups, press and
  airdrops for global projects entering Korea.”

## Earlier version

`public/assets/kale-riders-social-en-v1.png` (1736 × 906) stays in the repository so link previews
that messengers cached with the old address keep loading. It was generated with an image model from
the leaf symbol and carried the headline, a two-line description, the KALE acronym and the domain.
