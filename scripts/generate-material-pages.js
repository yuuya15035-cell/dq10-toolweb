const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const BAZAAR_CSV_PATH = path.join(ROOT_DIR, "data", "bazaar_prices.csv");
const RECIPE_CSV_PATH = path.join(ROOT_DIR, "data", "recipe.csv");
const MONSTER_DETAIL_CSV_PATH = path.join(ROOT_DIR, "data", "monster_detail_data.csv");
const OUTPUT_BASE_DIR = path.join(ROOT_DIR, "bazaar");
const SITEMAP_PATH = path.join(ROOT_DIR, "sitemap.xml");
const SITE_ORIGIN = "https://dq10tools.com";
const GENERATED_MARKER = "generated-by: scripts/generate-material-pages.js";
const MONSTER_BASE_DIR = path.join(ROOT_DIR, "monster");

function readText(filePath, encoding = "utf8") {
  const bytes = fs.readFileSync(filePath);
  if (encoding === "shift_jis") return new TextDecoder("shift_jis").decode(bytes).replace(/^\uFEFF/, "");
  return bytes.toString("utf8").replace(/^\uFEFF/, "");
}

function readCsvRows(filePath, options = {}) {
  const text = readText(filePath, options.encoding || "utf8");
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

function parseNumber(value) {
  const normalized = String(value || "").replace(/,/g, "").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(value) {
  const parsed = parseNumber(value);
  return parsed === null ? "なし" : `${parsed.toLocaleString("ja-JP")}G`;
}

function toCanonicalUrl(materialName) {
  return `${SITE_ORIGIN}/bazaar/${encodeURIComponent(materialName)}/`;
}

function toBazaarUrl(materialName) {
  const params = new URLSearchParams();
  params.set("tab", "bazaar");
  params.set("item", materialName);
  return `${SITE_ORIGIN}/bazaar/?${params.toString()}`;
}

function toRecipeUrl(equipmentName) {
  return `${SITE_ORIGIN}/recipe/${encodeURIComponent(equipmentName)}/`;
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

function collectBazaarRows(rows) {
  const byName = new Map();
  rows.forEach((row) => {
    const materialName = String(row.materialName || "").trim();
    if (!materialName || byName.has(materialName)) return;
    byName.set(materialName, row);
  });
  return byName;
}

function collectRecipes(rows) {
  const byMaterialName = new Map();
  rows.forEach((row) => {
    const materialName = String(row.materialName || "").trim();
    const equipmentName = String(row.equipmentName || "").trim();
    const quantity = parseNumber(row.quantity);
    if (!materialName || !equipmentName || !quantity || quantity <= 0) return;
    if (!byMaterialName.has(materialName)) byMaterialName.set(materialName, []);
    const entries = byMaterialName.get(materialName);
    const existing = entries.find((entry) => entry.equipmentName === equipmentName);
    if (existing) {
      existing.quantity += quantity;
    } else {
      entries.push({ equipmentName, quantity });
    }
  });
  return byMaterialName;
}

function collectDropMonsters(rows) {
  const byMaterialName = new Map();
  rows.forEach((row) => {
    const monsterName = String(row.monster_name || "").trim();
    if (!monsterName) return;
    [
      ["normal_drop", "通常ドロップ"],
      ["rare_drop", "レアドロップ"],
    ].forEach(([key, label]) => {
      const materialName = String(row[key] || "").trim();
      if (!materialName) return;
      if (!byMaterialName.has(materialName)) byMaterialName.set(materialName, []);
      const entries = byMaterialName.get(materialName);
      if (!entries.some((entry) => entry.monsterName === monsterName && entry.dropType === label)) {
        entries.push({ monsterName, dropType: label });
      }
    });
  });
  return byMaterialName;
}

function buildRecipeHtml(entries) {
  if (!entries.length) return `<p class="empty">関連レシピなし</p>`;
  const items = entries
    .slice()
    .sort((a, b) => String(a.equipmentName).localeCompare(String(b.equipmentName), "ja"))
    .map((entry) => `<li><a href="${escapeHtml(toRecipeUrl(entry.equipmentName))}">${escapeHtml(entry.equipmentName)}</a><span>${escapeHtml(entry.quantity)}個</span></li>`);
  return `<ul class="link-list">${items.join("")}</ul>`;
}

function buildMonsterHtml(entries) {
  if (!entries.length) return `<p class="empty">ドロップモンスターなし</p>`;
  const items = entries
    .slice()
    .sort((a, b) => String(a.monsterName).localeCompare(String(b.monsterName), "ja"))
    .map((entry) => `<li><a href="${escapeHtml(getMonsterHref(entry.monsterName))}">${escapeHtml(entry.monsterName)}</a><span>${escapeHtml(entry.dropType)}</span></li>`);
  return `<ul class="link-list">${items.join("")}</ul>`;
}

function buildMaterialPageHtml(row, context) {
  const materialName = String(row.materialName || "").trim();
  const canonicalUrl = toCanonicalUrl(materialName);
  const bazaarUrl = toBazaarUrl(materialName);
  const recipes = context.recipesByMaterial.get(materialName) || [];
  const monsters = context.dropMonstersByMaterial.get(materialName) || [];
  const description = `${materialName}のバザー価格、店売り価格、前日比、使い道、関連レシピを確認できます。DQ10ツールの素材情報ページです。`;

  return `<!doctype html>
<html lang="ja">
<head>
  <!-- ${GENERATED_MARKER} -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(materialName)}｜バザー価格・素材情報｜DQ10ツール</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(materialName)}｜バザー価格・素材情報｜DQ10ツール" />
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
    h2 { margin: 0 0 10px; font-size: 1.05rem; color: #3a2415; }
    .lead, .empty, .note { margin: 0; color: var(--sub); font-size: 0.94rem; }
    .meta { margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 8px; }
    .meta span { display: inline-flex; align-items: center; min-height: 30px; padding: 4px 10px; border-radius: 999px; background: rgba(155, 119, 63, 0.08); border: 1px solid rgba(155, 119, 63, 0.18); font-size: 0.88rem; color: #5a3b22; }
    dl { margin: 0; display: grid; grid-template-columns: minmax(112px, auto) 1fr; gap: 8px 12px; }
    dt { color: var(--sub); }
    dd { margin: 0; font-weight: 700; }
    .link-list { list-style: none; padding-left: 0; margin: 0; }
    .link-list li { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(145, 105, 57, 0.18); padding: 6px 0; }
    a { color: var(--link); font-weight: 700; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(145, 105, 57, 0.3); background: rgba(255, 249, 240, 0.98); color: var(--link); text-decoration: none; font-weight: 700; font-size: 0.92rem; }
    .button:hover, .button:focus-visible { background: #fff7eb; }
    @media (max-width: 640px) { main { width: min(100% - 20px, 760px); padding-top: 18px; } .card { padding: 15px 14px 14px; border-radius: 14px; } dl { grid-template-columns: 1fr; gap: 2px; } .link-list li { align-items: flex-start; flex-direction: column; gap: 2px; } .actions { flex-direction: column; } .button { width: 100%; } }
  </style>
</head>
<body>
  ${renderCommonNav()}
  <main>
    <section class="card">
      <h1>${escapeHtml(materialName)}</h1>
      <p class="lead">バザー価格・店売り価格・前日比・使い道・ドロップモンスターを確認できる素材個別ページです。</p>
      <div class="meta">
        ${row.item_category ? `<span>${escapeHtml(row.item_category)}</span>` : ""}
        <span>現在価格 ${escapeHtml(formatPrice(row.today_price))}</span>
      </div>
    </section>
    <section class="card">
      <h2>価格情報</h2>
      <dl>
        <dt>現在価格</dt><dd>${escapeHtml(formatPrice(row.today_price))}</dd>
        <dt>前日価格</dt><dd>${escapeHtml(formatPrice(row.previous_day_price))}</dd>
        <dt>店売り価格</dt><dd>${escapeHtml(formatPrice(row.shop_price))}</dd>
        <dt>更新日時</dt><dd>${escapeHtml(row.updated_at || "なし")}</dd>
        ${row.comment ? `<dt>コメント</dt><dd>${escapeHtml(row.comment)}</dd>` : ""}
      </dl>
    </section>
    <section class="card">
      <h2>関連レシピ</h2>
      ${buildRecipeHtml(recipes)}
    </section>
    <section class="card">
      <h2>この素材を落とすモンスター</h2>
      ${buildMonsterHtml(monsters)}
      <div class="actions">
        <a class="button" href="${escapeHtml(bazaarUrl)}">バザー価格一覧ページで詳細を開く</a>
        <a class="button" href="${SITE_ORIGIN}/bazaar/">バザー価格一覧へ戻る</a>
        <a class="button" href="${SITE_ORIGIN}/">ホームに戻る</a>
      </div>
      <p class="note">最新の価格や関連リンクは、バザー価格一覧ページで確認できます。</p>
    </section>
  </main>
</body>
</html>
`;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeMaterialPage(row, context) {
  const materialName = String(row.materialName || "").trim();
  if (!materialName) return null;
  const materialDir = path.join(OUTPUT_BASE_DIR, materialName);
  ensureDirectory(materialDir);
  const outputPath = path.join(materialDir, "index.html");
  fs.writeFileSync(outputPath, buildMaterialPageHtml(row, context), "utf8");
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

function updateSitemap(materialUrls) {
  if (!fs.existsSync(SITEMAP_PATH)) return { added: 0 };
  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  const existingLocs = new Set(Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]));
  const additions = materialUrls
    .filter((url) => !existingLocs.has(url))
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`);
  if (!additions.length) return { added: 0 };
  const nextSitemap = sitemap.replace(/<\/urlset>\s*$/, `${additions.join("\n")}\n</urlset>\n`);
  fs.writeFileSync(SITEMAP_PATH, nextSitemap, "utf8");
  return { added: additions.length };
}

function main() {
  const bazaarRows = readCsvRows(BAZAAR_CSV_PATH);
  const recipeRows = readCsvRows(RECIPE_CSV_PATH, { encoding: "shift_jis" });
  const monsterRows = readCsvRows(MONSTER_DETAIL_CSV_PATH);
  const materialByName = collectBazaarRows(bazaarRows);
  const materials = Array.from(materialByName.values());
  const context = {
    recipesByMaterial: collectRecipes(recipeRows),
    dropMonstersByMaterial: collectDropMonsters(monsterRows),
  };
  const removed = removeOldGeneratedPages(materials.map((row) => String(row.materialName || "").trim()));
  const written = [];
  const materialUrls = [];
  materials.forEach((row) => {
    const outputPath = writeMaterialPage(row, context);
    if (outputPath) {
      written.push(outputPath);
      materialUrls.push(toCanonicalUrl(String(row.materialName || "").trim()));
    }
  });
  const sitemapResult = updateSitemap(materialUrls);
  const missingRecipeCount = materials.filter((row) => !(context.recipesByMaterial.get(String(row.materialName || "").trim()) || []).length).length;
  const missingMonsterCount = materials.filter((row) => !(context.dropMonstersByMaterial.get(String(row.materialName || "").trim()) || []).length).length;
  console.log(`生成した素材個別ページ: ${written.length}件`);
  console.log(`同名重複をまとめた件数: ${Math.max(bazaarRows.filter((row) => String(row.materialName || "").trim()).length - materials.length, 0)}件`);
  console.log(`削除した古い生成ページ: ${removed.length}件`);
  console.log(`sitemap.xml への追加URL: ${sitemapResult.added}件`);
  console.log(`関連レシピ未取得の素材: ${missingRecipeCount}件`);
  console.log(`ドロップモンスター未取得の素材: ${missingMonsterCount}件`);
}

main();
