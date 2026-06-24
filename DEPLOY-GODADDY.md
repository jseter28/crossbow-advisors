# Deploying crossbowadvisors.net to GoDaddy cPanel

Static site (no build). Hosting = **GoDaddy cPanel/Linux**, domain + DNS = **GoDaddy**.
**crossbowadvisors.net currently serves a live Squarespace site** — verify privately, flip DNS
last, keep Squarespace as instant rollback.

> Alternative considered: Firebase Hosting (how Bump's front end ships). We chose GoDaddy cPanel
> for single-vendor simplicity.

## Pre-deploy cleanup — DONE (in repo)
- Removed dead `#approach` nav links from `contact.html` + all team pages.
- Added `.htaccess` (force HTTPS, www→non-www, extensionless URLs, gzip/cache, basic security headers).
- Pruned orphaned contact-form JS from `assets/main.js`.
- Added `robots.txt` + `sitemap.xml`.

## Build the upload artifact
```bash
cd ~/crossbow-advisors
zip -r ../crossbow-deploy.zip . \
  -x '.git/*' '.gitignore' 'README.md' 'HANDOFF.md' 'DEPLOY-GODADDY.md' '*.DS_Store'
```
Includes the hidden `.htaccess`. Ship `index.html`, `contact.html`, `team/`, `assets/`,
`.htaccess`, `robots.txt`, `sitemap.xml`.

## 1 — Confirm hosting product
GoDaddy → **My Products** → confirm a **Web Hosting (cPanel/Linux)** plan → open **cPanel Admin**.
If the only product is **Website Builder / Airo**, STOP — it can't host hand-coded HTML.
Note the **Shared IP** and the docroot for the domain (primary domain → `public_html`).

## 2 — Upload (staging; does not affect the live domain)
cPanel **File Manager** → docroot → upload `crossbow-deploy.zip` → **Extract**. Confirm
`index.html` is at the docroot root, `assets/img/skyline-01.jpg` is the full 1.6 MB, and
`.htaccess` is present (File Manager → Settings → Show hidden files).

## 3 — Preview BEFORE cutover (protects the live site)
Local hosts-file override — verify the real domain against GoDaddy without changing DNS:
```
sudo sh -c 'echo "<GoDaddy Shared IP>  crossbowadvisors.net www.crossbowadvisors.net" >> /etc/hosts'
```
Load the site, run the checklist (§6), then remove that hosts line.
(Alt: a `staging.crossbowadvisors.net` A-record → GoDaddy IP for a shareable preview URL.)

## 4 — SSL
Once the domain resolves to GoDaddy, ensure **AutoSSL** (Let's Encrypt) issues for
`crossbowadvisors.net` + `www`. Verify `https://` is clean before the `.htaccess` HTTPS redirect
is relied on.

## 5 — DNS cutover (only public-facing step; do last)
GoDaddy **DNS Management**:
1. **Screenshot the current Squarespace A `@` + `www` records** (rollback), then lower their **TTL to 600s** (~a day ahead if possible).
2. Point apex `A @` → **GoDaddy Shared IP**; update `www` to match. Ensure the hosting account serves crossbowadvisors.net from the uploaded docroot.
3. Wait for propagation; confirm AutoSSL issued.
> Do NOT cancel/delete Squarespace until fully verified.

## 6 — Verify
- `https://crossbowadvisors.net` loads new site; `http://` and `www` 301 to canonical.
- `/`, `/contact`, `/team`, every `/team/<slug>` resolve (extensionless) — no 404s.
- Skyline photo loads; Fraunces/Inter render; favicon shows; nav/footer/mailto/tel work.
- Mobile layout + skyline `background-attachment` fallback OK. No console/mixed-content errors.

## Rollback
GoDaddy DNS → restore the saved Squarespace `@` + `www` records. Low TTL reverts within minutes.

## ⚠️ Before public launch
`assets/img/skyline-01.jpg` is a **licensed AdobeStock image** (AdobeStock_270116468) — confirm the
license covers commercial website display, or swap it. (It's also a Nashville skyline on a NY firm —
cosmetic.)
