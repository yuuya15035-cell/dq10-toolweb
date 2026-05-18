const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const ORB_CSV_PATH = path.join(ROOT_DIR, "data", "orb_data.csv");
const OUTPUT_BASE_DIR = path.join(ROOT_DIR, "orb");
const MONSTER_BASE_DIR = path.join(ROOT_DIR, "monster");
const SITEMAP_PATH = path.join(ROOT_DIR, "sitemap.xml");
const SITE_ORIGIN = "https://dq10tools.com";
const GENERATED_MARKER = "generated-by: scripts/generate-orb-pages.js";
const GA4_TAG = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y1XSJ8S4MT"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "G-Y1XSJ8S4MT");
  </script>`;

function readCsvRows(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (!lines.length) return [];
  const headers = parseCsvLine(lines.shift()).map((header) => String(header || "").trim());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = String(values[index] || "").trim();
    });
    return row;
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toCanonicalUrl(orbName) {
  return `${SITE_ORIGIN}/orb/${encodeURIComponent(orbName)}/`;
}

function toOrbSearchUrl(orbName) {
  return `${SITE_ORIGIN}/orb/?q=${encodeURIComponent(orbName)}`;
}

function toMonsterUrl(monsterName) {
  return `${SITE_ORIGIN}/monster/${encodeURIComponent(monsterName)}/`;
}

function toMonsterSearchUrl(monsterName) {
  return `${SITE_ORIGIN}/monster/?q=${encodeURIComponent(monsterName)}`;
}

function hasGeneratedPage(baseDir, pageName) {
  return fs.existsSync(path.join(baseDir, pageName, "index.html"));
}

function getMonsterHref(monsterName) {
  if (!monsterName) return "";
  return hasGeneratedPage(MONSTER_BASE_DIR, monsterName) ? toMonsterUrl(monsterName) : toMonsterSearchUrl(monsterName);
}

function renderCommonNav() {
  return `<nav class="page-menu" aria-label="サイト内メニュー">
    <details>
      <summary aria-label="メニューを開く"><span></span><span></span><span></span></summary>
      <div class="page-menu-panel">
        <a href="${SITE_ORIGIN}/">ホーム</a>
        <a href="${SITE_ORIGIN}/craft/">職人アシスト</a>
        <a href="${SITE_ORIGIN}/bazaar/">バザー価格一覧</a>
        <a href="${SITE_ORIGIN}/monster/">モンスター情報</a>
        <a href="${SITE_ORIGIN}/equipment/">装備</a>
        <a href="${SITE_ORIGIN}/orb/">宝珠</a>
        <a href="${SITE_ORIGIN}/routine/">日課・週課</a>
        <a href="${SITE_ORIGIN}/field-farming/">フィールド狩り</a>
        <a href="${SITE_ORIGIN}/present-codes/">プレゼントのじゅもん</a>
        <a href="${SITE_ORIGIN}/about/">このサイトについて</a>
      </div>
    </details>
  </nav>`;
}

function collectOrbPages(rows) {
  const byName = new Map();
  rows.forEach((row) => {
    const orbName = String(row.orb_name || "").trim();
    if (!orbName) return;
    if (!byName.has(orbName)) {
      byName.set(orbName, {
        orbName,
        category: String(row.orb_category || "").trim(),
        effect: String(row.effect || "").trim(),
        monsters: [],
      });
    }
    const entry = byName.get(orbName);
    if (!entry.category && row.orb_category) entry.category = String(row.orb_category || "").trim();
    if (!entry.effect && row.effect) entry.effect = String(row.effect || "").trim();
    const monsterName = String(row.monster_name || "").trim();
    if (monsterName && !entry.monsters.includes(monsterName)) entry.monsters.push(monsterName);
  });
  return byName;
}

function renderMonsterLinks(monsters) {
  if (!monsters.length) return `<p class="empty">入手モンスター情報なし</p>`;
  return `<ul class="link-list">${monsters
    .slice()
    .sort((a, b) => a.localeCompare(b, "ja"))
    .map((monsterName) => `<li><a href="${escapeHtml(getMonsterHref(monsterName))}">${escapeHtml(monsterName)}</a></li>`)
    .join("")}</ul>`;
}

function buildOrbPageHtml(entry) {
  const canonicalUrl = toCanonicalUrl(entry.orbName);
  const description = `${entry.orbName}の効果、分類、入手モンスターを確認できるDQ10ツールの宝珠情報ページです。`;
  const category = entry.category || "未登録";
  const effect = entry.effect || "未登録";

  return `<!doctype html>
<html lang="ja">
<head>
  <!-- ${GENERATED_MARKER} -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${GA4_TAG}
  <title>${escapeHtml(entry.orbName)}｜宝珠情報｜DQ10ツール</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(entry.orbName)}｜宝珠情報｜DQ10ツール" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="article" />
  <style>
    :root { color-scheme: light; --bg: #ead9ba; --bg-soft: #f5ead4; --card: rgba(255, 249, 240, 0.96); --border: rgba(145, 105, 57, 0.32); --text: #3c2a1f; --sub: #6b5646; --link: #80501f; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Yu Gothic UI", "Hiragino Sans", sans-serif; background: radial-gradient(circle at top, #f6eddc 0%, var(--bg-soft) 44%, var(--bg) 100%); color: var(--text); line-height: 1.7; }
    main { width: min(760px, calc(100% - 28px)); margin: 0 auto; padding: 76px 0 44px; }
    .page-menu { position: fixed; top: 12px; left: 12px; z-index: 20; }
    .page-menu details { position: relative; }
    .page-menu summary { width: 44px; height: 44px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border: 1px solid rgba(145, 105, 57, 0.34); border-radius: 12px; background: rgba(255, 249, 240, 0.98); box-shadow: 0 8px 18px rgba(73, 48, 24, 0.12); cursor: pointer; list-style: none; }
    .page-menu summary::-webkit-details-marker { display: none; }
    .page-menu summary span { width: 20px; height: 2px; border-radius: 999px; background: #5a3b22; }
    .page-menu-panel { position: absolute; top: 52px; left: 0; width: min(78vw, 260px); display: grid; gap: 2px; padding: 10px; border: 1px solid rgba(145, 105, 57, 0.32); border-radius: 14px; background: rgba(255, 249, 240, 0.98); box-shadow: 0 12px 28px rgba(73, 48, 24, 0.16); }
    .page-menu-panel a { min-height: 38px; display: flex; align-items: center; padding: 6px 10px; border-radius: 9px; color: var(--link); text-decoration: none; font-weight: 700; font-size: 0.92rem; }
    .page-menu-panel a:hover, .page-menu-panel a:focus-visible { background: rgba(155, 119, 63, 0.1); }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 10px 24px rgba(73, 48, 24, 0.08); padding: 18px 18px 16px; margin-bottom: 16px; }
    h1 { margin: 0 0 8px; font-size: clamp(1.55rem, 4vw, 2rem); line-height: 1.25; color: #2f2117; }
    .lead, .empty, .note { color: var(--sub); }
    .lead { margin: 0; font-size: 0.98rem; }
    .meta { margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 8px; }
    .meta span { display: inline-flex; align-items: center; min-height: 30px; padding: 4px 10px; border-radius: 999px; background: rgba(155, 119, 63, 0.08); border: 1px solid rgba(155, 119, 63, 0.18); font-size: 0.88rem; color: #5a3b22; }
    .info-list { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
    .info-list strong { display: block; margin-bottom: 3px; color: #4a3120; }
    .link-list { margin: 0; padding-left: 1.15rem; }
    .link-list li + li { margin-top: 6px; }
    a { color: var(--link); font-weight: 700; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(145, 105, 57, 0.3); background: rgba(255, 249, 240, 0.98); color: var(--link); text-decoration: none; font-weight: 700; font-size: 0.92rem; }
    .button:hover, .button:focus-visible { background: #fff7eb; }
    .note { font-size: 0.85rem; margin-top: 10px; }
    @media (max-width: 640px) {
      main { width: min(100% - 20px, 760px); padding-top: 70px; }
      .card { padding: 15px 14px 14px; border-radius: 14px; }
      .actions { flex-direction: column; }
      .button { width: 100%; }
    }
  </style>
  <link rel="stylesheet" href="/assets/individual-page.css" />
</head>
<body data-individual-type="宝珠" data-individual-name="${escapeHtml(entry.orbName)}">
  ${renderCommonNav()}
  <main>
    <section class="card">
      <h1>${escapeHtml(entry.orbName)}</h1>
      <p class="lead">効果、分類、入手モンスターを確認できる宝珠個別ページです。</p>
      <div class="meta"><span>${escapeHtml(category)}</span></div>
    </section>
    <section class="card">
      <ul class="info-list">
        <li><strong>宝珠カテゴリ</strong>${escapeHtml(category)}</li>
        <li><strong>効果</strong>${escapeHtml(effect)}</li>
        <li><strong>入手モンスター</strong>${renderMonsterLinks(entry.monsters)}</li>
      </ul>
      <div class="actions">
        <a class="button" href="${escapeHtml(toOrbSearchUrl(entry.orbName))}">宝珠情報ページで詳細を開く</a>
        <a class="button" href="${SITE_ORIGIN}/orb/">宝珠一覧へ戻る</a>
        <a class="button" href="${SITE_ORIGIN}/">ホームに戻る</a>
      </div>
      <p class="note">最新の絞り込みや関連リンクは、宝珠情報ページで確認できます。</p>
    </section>
  </main>
  <script src="/assets/individual-page.js" defer></script>
</body>
</html>
`;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeOrbPage(entry) {
  const orbDir = path.join(OUTPUT_BASE_DIR, entry.orbName);
  ensureDirectory(orbDir);
  const outputPath = path.join(orbDir, "index.html");
  fs.writeFileSync(outputPath, buildOrbPageHtml(entry), "utf8");
  return outputPath;
}

function removeOldGeneratedPages(expectedNames) {
  if (!fs.existsSync(OUTPUT_BASE_DIR)) return [];
  const expected = new Set(expectedNames);
  const removed = [];
  fs.readdirSync(OUTPUT_BASE_DIR, { withFileTypes: true }).forEach((entry) => {
    if (!entry.isDirectory() || expected.has(entry.name)) return;
    const indexPath = path.join(OUTPUT_BASE_DIR, entry.name, "index.html");
    if (!fs.existsSync(indexPath)) return;
    const html = fs.readFileSync(indexPath, "utf8");
    if (!html.includes(GENERATED_MARKER)) return;
    const dirPath = path.join(OUTPUT_BASE_DIR, entry.name);
    fs.rmSync(dirPath, { recursive: true, force: true });
    removed.push(dirPath);
  });
  return removed;
}

function updateSitemap(orbUrls) {
  if (!fs.existsSync(SITEMAP_PATH)) return { added: 0 };
  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  const existingLocs = new Set(Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]));
  const additions = orbUrls
    .filter((url) => !existingLocs.has(url))
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`);
  if (!additions.length) return { added: 0 };
  const nextSitemap = sitemap.replace(/<\/urlset>\s*$/, `${additions.join("\n")}\n</urlset>\n`);
  fs.writeFileSync(SITEMAP_PATH, nextSitemap, "utf8");
  return { added: additions.length };
}

function main() {
  const rows = readCsvRows(ORB_CSV_PATH);
  const orbPages = collectOrbPages(rows);
  const entries = Array.from(orbPages.values());
  const removed = removeOldGeneratedPages(entries.map((entry) => entry.orbName));
  const written = [];
  const orbUrls = [];
  entries.forEach((entry) => {
    written.push(writeOrbPage(entry));
    orbUrls.push(toCanonicalUrl(entry.orbName));
  });
  const sitemapResult = updateSitemap(orbUrls);
  console.log(`生成した宝珠個別ページ: ${written.length}件`);
  console.log(`同名重複をまとめた件数: ${Math.max(rows.filter((row) => String(row.orb_name || "").trim()).length - written.length, 0)}件`);
  console.log(`削除した古い宝珠生成ページ: ${removed.length}件`);
  console.log(`sitemap.xml への追加URL: ${sitemapResult.added}件`);
}

main();
