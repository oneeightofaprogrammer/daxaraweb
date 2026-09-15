# Daxsara — website

A fully static site (HTML/CSS/vanilla JS, no framework, no backend, no build
dependency at runtime) for daxsara.com.

## Structure

- `index.html`, `about.html`, `events.html`, etc. — generated pages (see below)
- `events/*.html` — one static page per event, generated from `data/events.js`
- `assets/css/style.css` — the entire design system
- `assets/js/main.js` — nav, the scroll-driven hero sequence, the star motif, timeline rendering
- `data/events.js`, `data/projects.js`, `data/thoughts.js` — all editable content
- `build.js` — a small Node script that assembles the shared nav/footer into
  every page and pre-renders the event pages. **You only need Node to *edit*
  content** — the deployed output is plain static files with zero server-side
  dependency.

## Editing content

1. Open `data/events.js` (or `projects.js` / `thoughts.js`) and add/edit an entry.
2. Run:
   ```
   node build.js
   ```
3. Commit the changed HTML files along with the data file.

You do not need to touch any `.html` file by hand for events, projects, or
journal entries — they're regenerated from data. Hand-edit the page copy
directly in `build.js` (search for the relevant `...Page()` function) for
anything else.

## Deploying

This repository can be served as-is by GitHub Pages, Cloudflare Pages, or any
static host — there is nothing to build at deploy time.

**GitHub Pages:** Settings → Pages → Deploy from branch → `main` / `/ (root)`.

Before going live, update `SITE_URL` at the top of `build.js` to the real
production domain and re-run `node build.js` (this fixes canonical URLs,
Open Graph URLs, and the sitemap).

## Fonts & imagery

- Type is JetBrains Mono throughout, loaded from Google Fonts.
- Placeholder photography is sourced from Unsplash via hotlinked URLs in the
  data files and `build.js`. Replace these with real Daxsara photography by
  swapping the URLs — no other changes required.
