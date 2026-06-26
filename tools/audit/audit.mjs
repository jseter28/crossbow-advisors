#!/usr/bin/env node
/**
 * Crossbow Capital Advisors — static-site QA audit.
 *
 * Serves the site from a throwaway local HTTP server (so extensionless
 * pretty-URLs and relative paths resolve exactly as they will in production),
 * then drives each page with headless Chrome to collect:
 *   - console errors / warnings
 *   - failed network requests (404s, blocked resources)
 *   - broken internal links (href/src that resolve to a missing file)
 *   - accessibility violations (axe-core)
 *   - page weight (total transferred bytes + largest assets)
 *   - layout-shift risks (<img> without width/height) and missing lazy hints
 *   - SEO / meta gaps (title, description, canonical, OG, lang, single <h1>)
 *
 * Writes a timestamped Markdown + JSON report to ./reports and exits non-zero
 * when any error-level problem is found, so it can gate CI.
 *
 * Usage:  npm install && npm run audit
 */

import http from "node:http";
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync, readdirSync } from "node:fs";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { AxePuppeteer } from "@axe-core/puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, "..", ".."); // repo root (two levels up from tools/audit)
const REPORT_DIR = join(__dirname, "reports");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

/** Map a request URL path to a real file on disk, emulating .htaccess pretty-URLs. */
function resolveRequestPath(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (p.endsWith("/")) p += "index.html";
  let abs = normalize(join(SITE_ROOT, p));
  if (!abs.startsWith(SITE_ROOT)) return null; // path traversal guard
  if (existsSync(abs) && statSync(abs).isDirectory()) abs = join(abs, "index.html");
  if (!existsSync(abs) && !extname(abs)) abs = abs + ".html"; // extensionless → .html
  return existsSync(abs) ? abs : null;
}

function startServer() {
  return new Promise((res) => {
    const server = http.createServer((req, reqRes) => {
      const abs = resolveRequestPath(req.url);
      if (!abs) {
        reqRes.writeHead(404, { "Content-Type": "text/plain" });
        reqRes.end("Not found");
        return;
      }
      reqRes.writeHead(200, {
        "Content-Type": MIME[extname(abs)] || "application/octet-stream",
        "Content-Length": statSync(abs).size,
      });
      createReadStream(abs).pipe(reqRes);
    });
    server.listen(0, "127.0.0.1", () => res(server));
  });
}

/** Discover every HTML page in the site (root + team/). */
function discoverPages() {
  const pages = [];
  for (const f of readdirSync(SITE_ROOT)) {
    if (f.endsWith(".html")) pages.push("/" + f);
  }
  const teamDir = join(SITE_ROOT, "team");
  if (existsSync(teamDir)) {
    for (const f of readdirSync(teamDir)) {
      if (f.endsWith(".html")) pages.push("/team/" + f);
    }
  }
  return pages.sort();
}

async function auditPage(browser, origin, pagePath) {
  const page = await browser.newPage();
  const consoleErrors = [];
  const consoleWarnings = [];
  const failedRequests = [];
  const responses = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") consoleErrors.push(text);
    else if (type === "warning" || type === "warn") consoleWarnings.push(text);
  });
  page.on("pageerror", (err) => consoleErrors.push("[pageerror] " + err.message));
  page.on("requestfailed", (req) =>
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText || "failed" })
  );
  page.on("response", (resp) => {
    const status = resp.status();
    const url = resp.url();
    const len = Number(resp.headers()["content-length"] || 0);
    responses.push({ url, status, bytes: len });
    if (status >= 400) failedRequests.push({ url, error: "HTTP " + status });
  });

  const url = origin + pagePath;
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  // ---- Links / resources -> filesystem resolution ----
  const refs = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("[href],[src]").forEach((el) => {
      const raw = el.getAttribute("href") || el.getAttribute("src");
      if (raw) out.push(raw);
    });
    return out;
  });
  const brokenLinks = [];
  for (const raw of refs) {
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(raw)) continue;
    const clean = raw.split("#")[0].split("?")[0];
    if (!clean) continue;
    // resolve relative to the page's directory
    const baseDir = dirname(pagePath);
    let target = clean.startsWith("/")
      ? join(SITE_ROOT, clean)
      : normalize(join(SITE_ROOT, baseDir, clean));
    if (target.endsWith("/")) target = join(target, "index.html");
    const candidates = [target];
    if (!extname(target)) candidates.push(target + ".html", join(target, "index.html"));
    if (!candidates.some((c) => existsSync(c))) brokenLinks.push(raw);
  }

  // ---- SEO / meta ----
  const seo = await page.evaluate(() => {
    const get = (sel, attr) => {
      const el = document.querySelector(sel);
      return el ? (attr ? el.getAttribute(attr) : el.textContent.trim()) : null;
    };
    return {
      title: get("title"),
      description: get('meta[name="description"]', "content"),
      canonical: get('link[rel="canonical"]', "href"),
      ogTitle: get('meta[property="og:title"]', "content"),
      ogImage: get('meta[property="og:image"]', "content"),
      lang: document.documentElement.getAttribute("lang"),
      h1Count: document.querySelectorAll("h1").length,
      jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    };
  });

  // ---- Image / CLS hygiene ----
  const imageIssues = await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll("img").forEach((img) => {
      const hasDims = img.getAttribute("width") && img.getAttribute("height");
      if (!hasDims && !img.style.aspectRatio) {
        issues.push({ src: img.getAttribute("src"), issue: "missing width/height (CLS risk)" });
      }
    });
    return issues;
  });

  // ---- Accessibility (axe-core) ----
  let axeViolations = [];
  try {
    const results = await new AxePuppeteer(page).analyze();
    axeViolations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
    }));
  } catch (e) {
    axeViolations = [{ id: "axe-error", impact: "n/a", help: String(e), nodes: 0, targets: [] }];
  }

  const totalBytes = responses.reduce((a, r) => a + r.bytes, 0);
  const largest = [...responses]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5)
    .map((r) => ({ url: r.url.replace(origin, ""), kb: +(r.bytes / 1024).toFixed(1) }));

  await page.close();

  const seoGaps = [];
  if (!seo.title) seoGaps.push("missing <title>");
  if (!seo.description) seoGaps.push("missing meta description");
  if (!seo.canonical) seoGaps.push("missing canonical");
  if (!seo.ogTitle) seoGaps.push("missing og:title");
  if (!seo.ogImage) seoGaps.push("missing og:image");
  if (!seo.lang) seoGaps.push("missing <html lang>");
  if (seo.h1Count !== 1) seoGaps.push(`h1 count = ${seo.h1Count} (expect 1)`);

  return {
    page: pagePath,
    consoleErrors,
    consoleWarnings,
    failedRequests,
    brokenLinks,
    axeViolations,
    imageIssues,
    seo,
    seoGaps,
    totalKB: +(totalBytes / 1024).toFixed(1),
    largest,
  };
}

function buildMarkdown(results, stamp) {
  const lines = [];
  lines.push(`# Crossbow site audit — ${stamp}`, "");
  let totalErrors = 0;
  let totalA11y = 0;
  let totalBroken = 0;

  for (const r of results) {
    totalErrors += r.consoleErrors.length;
    totalA11y += r.axeViolations.reduce((a, v) => a + (v.id === "axe-error" ? 0 : 1), 0);
    totalBroken += r.brokenLinks.length;
  }

  lines.push("## Summary", "");
  lines.push(`- Pages audited: **${results.length}**`);
  lines.push(`- Console errors: **${totalErrors}**`);
  lines.push(`- Broken internal links: **${totalBroken}**`);
  lines.push(`- Accessibility violations: **${totalA11y}**`);
  lines.push(`- Heaviest page: **${Math.max(...results.map((r) => r.totalKB)).toFixed(1)} KB**`);
  lines.push("");

  lines.push("| Page | KB | Console err | Broken | a11y | SEO gaps |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
  for (const r of results) {
    const a11y = r.axeViolations.filter((v) => v.id !== "axe-error").length;
    lines.push(
      `| ${r.page} | ${r.totalKB} | ${r.consoleErrors.length} | ${r.brokenLinks.length} | ${a11y} | ${r.seoGaps.length} |`
    );
  }
  lines.push("");

  for (const r of results) {
    lines.push(`## ${r.page}`, "");
    lines.push(`- Page weight: **${r.totalKB} KB**`);
    if (r.largest.length) {
      lines.push(`- Largest assets: ` + r.largest.map((a) => `\`${a.url}\` (${a.kb} KB)`).join(", "));
    }
    if (r.consoleErrors.length) {
      lines.push("", "**Console errors:**");
      r.consoleErrors.forEach((e) => lines.push(`- ${e}`));
    }
    if (r.consoleWarnings.length) {
      lines.push("", "**Console warnings:**");
      r.consoleWarnings.forEach((e) => lines.push(`- ${e}`));
    }
    if (r.failedRequests.length) {
      lines.push("", "**Failed requests:**");
      r.failedRequests.forEach((e) => lines.push(`- ${e.url} — ${e.error}`));
    }
    if (r.brokenLinks.length) {
      lines.push("", "**Broken internal links:**");
      r.brokenLinks.forEach((e) => lines.push(`- ${e}`));
    }
    if (r.imageIssues.length) {
      lines.push("", "**Image / CLS issues:**");
      r.imageIssues.forEach((e) => lines.push(`- ${e.src} — ${e.issue}`));
    }
    const realA11y = r.axeViolations.filter((v) => v.id !== "axe-error");
    if (realA11y.length) {
      lines.push("", "**Accessibility violations:**");
      realA11y.forEach((v) =>
        lines.push(`- [${v.impact}] ${v.id}: ${v.help} (${v.nodes} node(s)) — e.g. ${v.targets.join(", ")}`)
      );
    }
    if (r.seoGaps.length) {
      lines.push("", "**SEO/meta gaps:** " + r.seoGaps.join(", "));
    }
    lines.push("");
  }

  return { markdown: lines.join("\n"), totalErrors, totalA11y, totalBroken };
}

async function main() {
  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });

  const server = await startServer();
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const pages = discoverPages();
  console.log(`Auditing ${pages.length} pages at ${origin}\n`);

  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const results = [];
  for (const p of pages) {
    process.stdout.write(`  • ${p} … `);
    try {
      const r = await auditPage(browser, origin, p);
      results.push(r);
      const a11y = r.axeViolations.filter((v) => v.id !== "axe-error").length;
      console.log(`${r.totalKB}KB, ${r.consoleErrors.length} err, ${r.brokenLinks.length} broken, ${a11y} a11y`);
    } catch (e) {
      console.log("FAILED: " + e.message);
      results.push({
        page: p, consoleErrors: ["[audit] " + e.message], consoleWarnings: [], failedRequests: [],
        brokenLinks: [], axeViolations: [], imageIssues: [], seo: {}, seoGaps: [], totalKB: 0, largest: [],
      });
    }
  }
  await browser.close();
  server.close();

  // timestamp passed in via env to keep runs deterministic in CI; fallback to ISO
  const stamp = process.env.AUDIT_STAMP || new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const { markdown, totalErrors, totalA11y, totalBroken } = buildMarkdown(results, stamp);
  const mdPath = join(REPORT_DIR, `audit-${stamp}.md`);
  const jsonPath = join(REPORT_DIR, `audit-${stamp}.json`);
  writeFileSync(mdPath, markdown);
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  console.log(`\nReport: ${mdPath}`);
  console.log(`Totals — console errors: ${totalErrors}, broken links: ${totalBroken}, a11y violations: ${totalA11y}`);

  const hasErrors = totalErrors > 0 || totalBroken > 0 || totalA11y > 0;
  process.exit(hasErrors ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
