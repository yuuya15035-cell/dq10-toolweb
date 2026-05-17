const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const CSV_PATH = path.join(ROOT_DIR, "data", "monster_detail_data.csv");
const OUTPUT_BASE_DIR = path.join(ROOT_DIR, "monster");
const SITEMAP_PATH = path.join(ROOT_DIR, "sitemap.xml");
const SITE_ORIGIN = "https://dq10tools.com";

const GENERATED_MARKER = "generated-by: scripts/generate-monster-pages.js";

function readCsvRows(csvPath) {
  const text = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (!lines.length) return [];
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[String(header || "").trim()] = String(values[index] || "").trim();
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

function splitPipeValues(value) {
  return String(value || "")
    .split("｜")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toCanonicalUrl(monsterName) {
  return `${SITE_ORIGIN}/monster/${encodeURIComponent(monsterName)}/`;
}

function toMonsterQueryUrl(monsterName) {
  return `${SITE_ORIGIN}/monster/?q=${encodeURIComponent(monsterName)}`;
}

function renderListSection(label, values) {
  if (!values.length) {
    return `<li><strong>${escapeHtml(label)}：</strong>なし</li>`;
  }
  return `<li><strong>${escapeHtml(label)}：</strong>${values.map((value) => escapeHtml(value)).join(" / ")}</li>`;
}

function countFilledFields(row) {
  return [
    "monster_type",
    "exp",
    "gold",
    "normal_drop",
    "rare_drop",
    "white_box",
    "orbs",
    "habitats",
  ].reduce((count, key) => count + (String(row[key] || "").trim() ? 1 : 0), 0);
}

function getOutputName(monsterName) {
  return monsterName;
}

function buildMonsterPageHtml(row, outputName = "") {
  const monsterName = String(row.monster_name || "").trim();
  const pageName = String(outputName || monsterName).trim();
  const type = String(row.monster_type || "").trim();
  const exp = String(row.exp || "").trim();
  const gold = String(row.gold || "").trim();
  const normalDrop = String(row.normal_drop || "").trim();
  const rareDrop = String(row.rare_drop || "").trim();
  const whiteBoxValues = splitPipeValues(row.white_box);
  const orbValues = splitPipeValues(row.orbs);
  const habitatValues = splitPipeValues(row.habitats);
  const canonicalUrl = toCanonicalUrl(pageName);
  const queryUrl = toMonsterQueryUrl(monsterName);
  const description = `${monsterName}の通常ドロップ、レアドロップ、白宝箱、宝珠、生息地、経験値、ゴールドを確認できます。DQ10ツールのモンスター情報ページです。`;

  return `<!doctype html>
<html lang="ja">
<head>
  <!-- ${GENERATED_MARKER} -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(monsterName)}｜モンスター情報｜DQ10ツール</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(monsterName)}｜モンスター情報｜DQ10ツール" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="article" />
  <style>
    :root {
      color-scheme: light;
      --bg: #ead9ba;
      --bg-soft: #f5ead4;
      --card: rgba(255, 249, 240, 0.96);
      --border: rgba(145, 105, 57, 0.32);
      --text: #3c2a1f;
      --sub: #6b5646;
      --accent: #7a4c25;
      --link: #80501f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Yu Gothic UI", "Hiragino Sans", sans-serif;
      background: radial-gradient(circle at top, #f6eddc 0%, var(--bg-soft) 44%, var(--bg) 100%);
      color: var(--text);
      line-height: 1.7;
    }
    main {
      width: min(760px, calc(100% - 28px));
      margin: 0 auto;
      padding: 28px 0 44px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 10px 24px rgba(73, 48, 24, 0.08);
      padding: 18px 18px 16px;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: clamp(1.55rem, 4vw, 2rem);
      line-height: 1.25;
      color: #2f2117;
    }
    .lead {
      margin: 0;
      color: var(--sub);
      font-size: 0.98rem;
    }
    .meta {
      margin: 12px 0 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .meta span {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(155, 119, 63, 0.08);
      border: 1px solid rgba(155, 119, 63, 0.18);
      font-size: 0.88rem;
      color: #5a3b22;
    }
    ul {
      margin: 0;
      padding-left: 1.15rem;
    }
    li + li { margin-top: 7px; }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid rgba(145, 105, 57, 0.3);
      background: rgba(255, 249, 240, 0.98);
      color: var(--link);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.92rem;
    }
    .button:hover,
    .button:focus-visible {
      background: #fff7eb;
    }
    .note {
      font-size: 0.85rem;
      color: var(--sub);
      margin-top: 10px;
    }
    @media (max-width: 640px) {
      main {
        width: min(100% - 20px, 760px);
        padding-top: 18px;
      }
      .card {
        padding: 15px 14px 14px;
        border-radius: 14px;
      }
      .actions {
        flex-direction: column;
      }
      .button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="card">
      <h1>${escapeHtml(monsterName)}</h1>
      <p class="lead">通常ドロップ・レアドロップ・白宝箱・宝珠・生息地・経験値・ゴールドを確認できるモンスター個別ページです。</p>
      <div class="meta">
        ${type ? `<span>${escapeHtml(type)}</span>` : ""}
        ${exp ? `<span>経験値 ${escapeHtml(exp)}</span>` : ""}
        ${gold ? `<span>ゴールド ${escapeHtml(gold)}</span>` : ""}
      </div>
    </section>

    <section class="card">
      <ul>
        ${renderListSection("通常ドロップ", normalDrop ? [normalDrop] : [])}
        ${renderListSection("レアドロップ", rareDrop ? [rareDrop] : [])}
        ${renderListSection("白宝箱", whiteBoxValues)}
        ${renderListSection("宝珠", orbValues)}
        ${renderListSection("生息地", habitatValues)}
      </ul>
      <div class="actions">
        <a class="button" href="${escapeHtml(queryUrl)}">モンスター情報ページで詳細を開く</a>
        <a class="button" href="${SITE_ORIGIN}/monster/">モンスター一覧へ戻る</a>
      </div>
      <p class="note">最新の絞り込みや関連リンクは、モンスター情報ページで確認できます。</p>
    </section>
  </main>
</body>
</html>
`;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeMonsterPage(row, outputName = "") {
  const monsterName = String(row.monster_name || "").trim();
  if (!monsterName) return null;
  const pageName = String(outputName || monsterName).trim();
  const monsterDir = path.join(OUTPUT_BASE_DIR, pageName);
  ensureDirectory(monsterDir);
  const outputPath = path.join(monsterDir, "index.html");
  fs.writeFileSync(outputPath, buildMonsterPageHtml(row, pageName), "utf8");
  return outputPath;
}

function collectMonsterRows(detailRows) {
  const rowByName = new Map();
  detailRows.forEach((row) => {
    const monsterName = String(row.monster_name || "").trim();
    if (!monsterName) return;
    const current = rowByName.get(monsterName);
    if (!current || countFilledFields(row) >= countFilledFields(current)) {
      rowByName.set(monsterName, row);
    }
  });
  return rowByName;
}

function removeOldGeneratedPages(expectedOutputNames) {
  if (!fs.existsSync(OUTPUT_BASE_DIR)) return [];
  const removed = [];
  const expected = new Set(expectedOutputNames);
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

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function updateSitemap(monsterUrls) {
  if (!fs.existsSync(SITEMAP_PATH)) return { added: 0, removed: 0 };
  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  const expectedMonsterUrls = new Set(monsterUrls);
  const staleMonsterUrlPattern = /  <url>\r?\n    <loc>(https:\/\/dq10tools\.com\/monster\/(?!<\/loc>)[^<]+)<\/loc>\r?\n  <\/url>\r?\n/g;
  let removed = 0;
  const sitemapWithoutStaleUrls = sitemap.replace(staleMonsterUrlPattern, (block, loc) => {
    if (expectedMonsterUrls.has(loc)) return block;
    removed += 1;
    return "";
  });
  const existingLocs = new Set(Array.from(
    sitemapWithoutStaleUrls.matchAll(/<loc>([^<]+)<\/loc>/g),
    (match) => match[1]
  ));
  const additions = monsterUrls
    .filter((url) => !existingLocs.has(url))
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`);
  if (!additions.length && !removed) return { added: 0, removed: 0 };
  const nextSitemap = sitemapWithoutStaleUrls.replace(
    /<\/urlset>\s*$/,
    `${additions.join("\n")}\n</urlset>\n`
  );
  fs.writeFileSync(SITEMAP_PATH, nextSitemap, "utf8");
  return { added: additions.length, removed };
}

function main() {
  const detailRows = readCsvRows(CSV_PATH);
  const rowByName = collectMonsterRows(detailRows);
  const rows = Array.from(rowByName.values());
  const expectedOutputNames = rows.map((row) => getOutputName(String(row.monster_name || "").trim()));
  const removed = removeOldGeneratedPages(expectedOutputNames);
  const written = [];
  const monsterUrls = [];
  rows.forEach((row) => {
    const monsterName = String(row.monster_name || "").trim();
    const outputName = getOutputName(monsterName);
    const outputPath = writeMonsterPage(row, outputName);
    if (outputPath) {
      written.push(outputPath);
      monsterUrls.push(toCanonicalUrl(outputName));
    }
  });
  const sitemapResult = updateSitemap(monsterUrls);
  if (!written.length) {
    console.log("個別ページは生成されませんでした。");
    return;
  }
  console.log(`生成したモンスター個別ページ: ${written.length}件`);
  console.log(`同名重複をまとめた件数: ${Math.max(detailRows.filter((row) => String(row.monster_name || "").trim()).length - rows.length, 0)}件`);
  console.log(`削除した古い生成ページ: ${removed.length}件`);
  console.log(`sitemap.xml への追加URL: ${sitemapResult.added}件`);
  console.log(`sitemap.xml から削除した古いURL: ${sitemapResult.removed}件`);
}

main();
