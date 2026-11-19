# Project guide

This repository is a small static website deployed to GitHub Pages. Keep it dependency-free so it can be hosted directly from the repository.

## Files

- `index.html` contains the book shell and visual styling.
- `book.js` loads the configuration, cover assets, and HTML pages, and handles opening, page navigation, and page-turn animation.
- `book.config.json` configures the cover and the ordered page spreads.
- `pages/` contains the standalone HTML fragments shown inside the book.
- `assets/` contains the cover icon and favicon.
- `.github/workflows/deploy-pages.yml` deploys the site to GitHub Pages on pushes to `main` and on manual workflow runs.

## Book configuration

`book.config.json` has a required `cover` object with:

- `icon`: path to the cover icon.
- `title`: cover title and browser title.
- `subtitle`: cover subtitle and browser title.
- `favicon`: path to the favicon.

Its `pages` array defines spreads in reading order. Each spread must have `left` and `right` paths that point to separate HTML files. Paths are resolved relative to `book.config.json` so the site also works when hosted below a repository path on GitHub Pages.

When adding or moving an asset or page, update its path in the configuration. Preserve one left and one right page per spread.

## Editing guidance

- Keep book controls and navigation behavior in `book.js`; keep layout and presentation in `index.html`.
- Keep navigation inside the dedicated page footer area so page content can be styled independently.
- Page files are HTML fragments inserted into `.page-content`. Avoid adding document-level `<html>`, `<head>`, or `<body>` wrappers.
- The site uses relative URLs and browser `fetch`, so preview it through an HTTP server or GitHub Pages rather than opening `index.html` as a `file://` URL.
- Respect `prefers-reduced-motion` when changing animations.
- No build step is required. GitHub Actions publishes the repository root as the Pages artifact.
