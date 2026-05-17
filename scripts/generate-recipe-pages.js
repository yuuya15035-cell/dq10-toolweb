const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const RECIPE_CSV_PATH = path.join(ROOT_DIR, "data", "recipe.csv");
const BAZAAR_CSV_PATH = path.join(ROOT_DIR, "data", "bazaar_prices.csv");
const EQUIPMENT_BASE_DIR = path.join(ROOT_DIR, "equipment");
const OUTPUT_BASE_DIR = path.join(ROOT_DIR, "recipe");
const SITEMAP_PATH = path.join(ROOT_DIR, "sitemap.xml");
const SITE_ORIGIN = "https://dq10tools.com";
const GENERATED_MARKER = "generated-by: scripts/generate-recipe-pages.js";

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
  return Number(value).toLocaleString("ja-JP");
}

function toCanonicalUrl(equipmentName) {
  return `${SITE_ORIGIN}/recipe/${encodeURIComponent(equipmentName)}/`;
}

function toMaterialUrl(materialName) {
  return `${SITE_ORIGIN}/bazaar/${encodeURIComponent(materialName)}/`;
}

function toEquipmentUrl(equipmentName) {
  return `${SITE_ORIGIN}/equipment/${encodeURIComponent(equipmentName)}/`;
}

function toCraftUrl(equipmentName) {
  const params = new URLSearchParams();
  params.set("q", equipmentName);
  return `${SITE_ORIGIN}/craft/?${params.toString()}`;
}

function collectRecipes(rows) {
  const byEquipmentName = new Map();
  rows.forEach((row) => {
    const equipmentName = String(row.equipmentName || "").trim();
    const materialName = String(row.materialName || "").trim();
    const quantity = parseNumber(row.quantity);
    if (!equipmentName || !materialName || !quantity || quantity <= 0) return;
    if (!byEquipmentName.has(equipmentName)) {
      byEquipmentName.set(equipmentName, {
        equipmentName,
        craftsman: String(row.craftsman || "").trim(),
        category: String(row.category || "").trim(),
        equipmentLevel: String(row.equipmentLevel || "").trim(),
        craftLevel: String(row.craftLevel || "").trim(),
        materials: new Map(),
      });
    }
    const recipe = byEquipmentName.get(equipmentName);
    const current = recipe.materials.get(materialName) || 0;
    recipe.materials.set(materialName, current + quantity);
  });
  return byEquipmentName;
}

function collectBazaarPrices(rows) {
  const byMaterialName = new Map();
  rows.forEach((row) => {
    const materialName = String(row.materialName || "").trim();
    if (!materialName) return;
    const todayPrice = parseNumber(row.today_price);
    const shopPrice = parseNumber(row.shop_price);
    const price = todayPrice ?? shopPrice;
    if (price === null) return;
    byMaterialName.set(materialName, price);
  });
  return byMaterialName;
}

function hasEquipmentPage(equipmentName) {
  return fs.existsSync(path.join(EQUIPMENT_BASE_DIR, equipmentName, "index.html"));
}

function buildMaterialRows(recipe, bazaarPrices) {
  let estimatedCost = 0;
  let missingPriceCount = 0;
  const rows = Array.from(recipe.materials.entries()).map(([materialName, quantity]) => {
    const unitPrice = bazaarPrices.get(materialName);
    const subtotal = unitPrice === undefined ? null : unitPrice * quantity;
    if (subtotal === null) {
      missingPriceCount += 1;
    } else {
      estimatedCost += subtotal;
    }
    return `<tr><td><a href="${escapeHtml(toMaterialUrl(materialName))}">${escapeHtml(materialName)}</a></td><td>${escapeHtml(quantity)}</td><td>${unitPrice === undefined ? "単価なし" : `${formatPrice(unitPrice)}G`}</td><td>${subtotal === null ? "小計なし" : `${formatPrice(subtotal)}G`}</td></tr>`;
  });
  return { html: rows.join(""), estimatedCost, missingPriceCount };
}

function buildRecipePageHtml(recipe, context) {
  const equipmentName = recipe.equipmentName;
  const canonicalUrl = toCanonicalUrl(equipmentName);
  const craftUrl = toCraftUrl(equipmentName);
  const materialResult = buildMaterialRows(recipe, context.bazaarPrices);
  const equipmentPageExists = hasEquipmentPage(equipmentName);
  const description = `${equipmentName}の必要素材、素材単価、推定原価、職人アシストを確認できます。DQ10ツールの職人レシピページです。`;

  return `<!doctype html>
<html lang="ja">
<head>
  <!-- ${GENERATED_MARKER} -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(equipmentName)}｜職人レシピ｜DQ10ツール</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(equipmentName)}｜職人レシピ｜DQ10ツール" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="article" />
  <style>
    :root { color-scheme: light; --bg: #ead9ba; --bg-soft: #f5ead4; --card: rgba(255, 249, 240, 0.96); --border: rgba(145, 105, 57, 0.32); --text: #3c2a1f; --sub: #6b5646; --link: #80501f; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Yu Gothic UI", "Hiragino Sans", sans-serif; background: radial-gradient(circle at top, #f6eddc 0%, var(--bg-soft) 44%, var(--bg) 100%); color: var(--text); line-height: 1.7; }
    main { width: min(820px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0 44px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 10px 24px rgba(73, 48, 24, 0.08); padding: 18px 18px 16px; margin-bottom: 16px; }
    h1 { margin: 0 0 8px; font-size: clamp(1.55rem, 4vw, 2rem); line-height: 1.25; color: #2f2117; }
    h2 { margin: 0 0 10px; font-size: 1.05rem; color: #3a2415; }
    .lead, .note { margin: 0; color: var(--sub); font-size: 0.94rem; }
    .meta { margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 8px; }
    .meta span { display: inline-flex; align-items: center; min-height: 30px; padding: 4px 10px; border-radius: 999px; background: rgba(155, 119, 63, 0.08); border: 1px solid rgba(155, 119, 63, 0.18); font-size: 0.88rem; color: #5a3b22; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 560px; }
    th, td { border-bottom: 1px solid rgba(145, 105, 57, 0.18); padding: 8px 6px; text-align: left; }
    th { color: var(--sub); font-size: 0.88rem; }
    a { color: var(--link); font-weight: 700; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(145, 105, 57, 0.3); background: rgba(255, 249, 240, 0.98); color: var(--link); text-decoration: none; font-weight: 700; font-size: 0.92rem; }
    .button:hover, .button:focus-visible { background: #fff7eb; }
    @media (max-width: 640px) { main { width: min(100% - 20px, 820px); padding-top: 18px; } .card { padding: 15px 14px 14px; border-radius: 14px; } .actions { flex-direction: column; } .button { width: 100%; } }
  </style>
</head>
<body>
  <main>
    <section class="card">
      <h1>${escapeHtml(equipmentName)}</h1>
      <p class="lead">必要素材・素材単価・推定原価を確認できる職人レシピページです。</p>
      <div class="meta">
        ${recipe.craftsman ? `<span>${escapeHtml(recipe.craftsman)}</span>` : ""}
        ${recipe.category ? `<span>${escapeHtml(recipe.category)}</span>` : ""}
        ${recipe.equipmentLevel ? `<span>装備レベル ${escapeHtml(recipe.equipmentLevel)}</span>` : ""}
        ${recipe.craftLevel ? `<span>${escapeHtml(recipe.craftLevel)}</span>` : ""}
      </div>
    </section>
    <section class="card">
      <h2>必要素材</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>素材</th><th>必要数</th><th>素材単価</th><th>小計</th></tr></thead>
          <tbody>${materialResult.html}</tbody>
        </table>
      </div>
      <p class="note">推定原価：${formatPrice(materialResult.estimatedCost)}G${materialResult.missingPriceCount ? "（単価なし素材あり）" : ""}</p>
      <div class="actions">
        ${equipmentPageExists ? `<a class="button" href="${escapeHtml(toEquipmentUrl(equipmentName))}">装備詳細ページを開く</a>` : ""}
        <a class="button" href="${escapeHtml(craftUrl)}">職人アシストで開く</a>
        <a class="button" href="${SITE_ORIGIN}/craft/">レシピ一覧へ戻る</a>
      </div>
      <p class="note">最新の素材価格や利益目安は、職人アシストで確認できます。</p>
    </section>
  </main>
</body>
</html>
`;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeRecipePage(recipe, context) {
  const recipeDir = path.join(OUTPUT_BASE_DIR, recipe.equipmentName);
  ensureDirectory(recipeDir);
  const outputPath = path.join(recipeDir, "index.html");
  fs.writeFileSync(outputPath, buildRecipePageHtml(recipe, context), "utf8");
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

function updateSitemap(recipeUrls) {
  if (!fs.existsSync(SITEMAP_PATH)) return { added: 0 };
  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  const existingLocs = new Set(Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]));
  const additions = recipeUrls
    .filter((url) => !existingLocs.has(url))
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`);
  if (!additions.length) return { added: 0 };
  const nextSitemap = sitemap.replace(/<\/urlset>\s*$/, `${additions.join("\n")}\n</urlset>\n`);
  fs.writeFileSync(SITEMAP_PATH, nextSitemap, "utf8");
  return { added: additions.length };
}

function main() {
  const recipeRows = readCsvRows(RECIPE_CSV_PATH, { encoding: "shift_jis" });
  const bazaarRows = readCsvRows(BAZAAR_CSV_PATH);
  const recipes = Array.from(collectRecipes(recipeRows).values());
  const context = { bazaarPrices: collectBazaarPrices(bazaarRows) };
  const removed = removeOldGeneratedPages(recipes.map((recipe) => recipe.equipmentName));
  const written = [];
  const recipeUrls = [];
  recipes.forEach((recipe) => {
    const outputPath = writeRecipePage(recipe, context);
    written.push(outputPath);
    recipeUrls.push(toCanonicalUrl(recipe.equipmentName));
  });
  const sitemapResult = updateSitemap(recipeUrls);
  const missingPriceCount = recipes.filter((recipe) => {
    return Array.from(recipe.materials.keys()).some((materialName) => !context.bazaarPrices.has(materialName));
  }).length;
  console.log(`生成したレシピ個別ページ: ${written.length}件`);
  console.log(`同名重複をまとめた件数: ${Math.max(recipeRows.filter((row) => String(row.equipmentName || "").trim()).length - recipes.length, 0)}件`);
  console.log(`削除した古い生成ページ: ${removed.length}件`);
  console.log(`sitemap.xml への追加URL: ${sitemapResult.added}件`);
  console.log(`単価なし素材を含むレシピ: ${missingPriceCount}件`);
}

main();
