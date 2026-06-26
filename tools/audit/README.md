# Crossbow site audit

Dev-only QA harness for the Crossbow Capital Advisors static site. It is intentionally
isolated from the production site (which ships **zero** runtime dependencies) — nothing
in `tools/` is deployed.

## What it checks

For every HTML page in the site (root + `team/`), served from a throwaway local HTTP
server that emulates the production pretty-URL behaviour:

- **Console errors / warnings** and uncaught page errors
- **Failed network requests** (404s, blocked resources)
- **Broken internal links** — every `href`/`src` resolved against the filesystem
- **Accessibility** violations via [axe-core](https://github.com/dequelabs/axe-core)
- **Page weight** — total transferred bytes + the five largest assets per page
- **Layout-shift risk** — `<img>` elements missing `width`/`height`/`aspect-ratio`
- **SEO / meta gaps** — `<title>`, description, canonical, OG tags, `lang`, single `<h1>`, JSON-LD

## Run it

```bash
cd tools/audit
npm install      # first time only — pulls puppeteer + axe-core
npm run audit
```

Reports are written to `tools/audit/reports/audit-<timestamp>.{md,json}`.
The process exits non-zero if any console error, broken link, or a11y violation is found,
so it can gate CI.

> `node_modules/` and `reports/` are git-ignored.
