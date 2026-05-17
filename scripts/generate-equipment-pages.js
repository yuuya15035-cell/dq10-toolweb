const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const EQUIPMENT_CSV_PATH = path.join(ROOT_DIR, "data", "equipment_data.csv");
const RECIPE_CSV_PATH = path.join(ROOT_DIR, "data", "recipe.csv");
const WHITE_BOX_CSV_PATH = path.join(ROOT_DIR, "data", "white_box.csv");
const BAZAAR_CSV_PATH = path.join(ROOT_DIR, "data", "bazaar_prices.csv");
const OUTPUT_BASE_DIR = path.join(ROOT_DIR, "equipment");
const SITEMAP_PATH = path.join(ROOT_DIR, "sitemap.xml");
const SITE_ORIGIN = "https://dq10tools.com";
const GENERATED_MARKER = "generated-by: scripts/generate-equipment-pages.js";
const MATERIAL_BASE_DIR = path.join(ROOT_DIR, "bazaar");
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
  const normalized = String(value || "").replace(/,/g, "").replace(/%/g, "").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCanonicalUrl(equipmentName) {
  return `${SITE_ORIGIN}/equipment/${encodeURIComponent(equipmentName)}/`;
}

function toEquipmentUrl(equipmentName) {
  const params = new URLSearchParams();
  params.set("tab", "equipment-db");
  params.set("equipmentSearch", equipmentName);
  return `${SITE_ORIGIN}/equipment/?${params.toString()}`;
}

function toCraftUrl(equipmentName) {
  const params = new URLSearchParams();
  params.set("equipment", equipmentName);
  return `${SITE_ORIGIN}/craft/?${params.toString()}`;
}

function toMaterialUrl(materialName) {
  return `${SITE_ORIGIN}/bazaar/${encodeURIComponent(materialName)}/`;
}

function toBazaarSearchUrl(materialName) {
  const params = new URLSearchParams();
  params.set("tab", "bazaar");
  params.set("item", materialName);
  return `${SITE_ORIGIN}/bazaar/?${params.toString()}`;
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

function getMaterialHref(materialName) {
  if (!materialName) return "";
  return hasGeneratedPage(MATERIAL_BASE_DIR, materialName) ? toMaterialUrl(materialName) : toBazaarSearchUrl(materialName);
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

function countFilledFields(row) {
  return [
    "equipment_group",
    "equipment_level",
    "equipment_type",
    "attack",
    "attack_magic",
    "heal_magic",
    "defense",
    "shield_guard_rate",
    "hp",
    "mp",
    "speed",
    "dex",
    "fashionable",
    "weight",
    "traits",
  ].reduce((count, key) => count + (String(row[key] || "").trim() ? 1 : 0), 0);
}

function splitTraitEntries(value) {
  return String(value || "")
    .split(/\r?\n|\/|／/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function collectEquipmentRows(rows) {
  const byName = new Map();
  rows.forEach((row) => {
    const equipmentName = String(row.equipment_name || "").trim();
    if (!equipmentName) return;
    if (!byName.has(equipmentName)) {
      byName.set(equipmentName, { ...row, traits: [] });
    }
    const current = byName.get(equipmentName);
    if (countFilledFields(row) > countFilledFields(current)) {
      [
        "equipment_id",
        "equipment_group",
        "equipment_level",
        "equipment_type",
        "attack",
        "attack_magic",
        "heal_magic",
        "defense",
        "shield_guard_rate",
        "hp",
        "mp",
        "speed",
        "dex",
        "fashionable",
        "weight",
      ].forEach((key) => {
        if (String(row[key] || "").trim()) current[key] = row[key];
      });
    }
    splitTraitEntries(row.traits).forEach((trait) => {
      if (!current.traits.includes(trait)) current.traits.push(trait);
    });
  });
  return byName;
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
        craftsman: String(row.craftsman || "").trim(),
        category: String(row.category || "").trim(),
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

function stripArmorSetSuffix(equipmentName) {
  return String(equipmentName || "").replace(/セット$/, "").trim();
}

function collectWhiteBoxRows(rows) {
  const byItemName = new Map();
  rows.forEach((row) => {
    const itemName = String(row.item_name || "").trim();
    if (!itemName) return;
    if (!byItemName.has(itemName)) {
      byItemName.set(itemName, { itemName, itemSlot: String(row.item_slot || "").trim(), monsters: [] });
    }
    const dropStatus = String(row.drop_status || "").trim().toLowerCase();
    const monsterName = String(row.monster_name || "").trim();
    if (dropStatus !== "has_drop" || !monsterName) return;
    const current = byItemName.get(itemName);
    if (!current.monsters.includes(monsterName)) current.monsters.push(monsterName);
  });
  return byItemName;
}

function getWhiteBoxEntries(equipment, whiteBoxByItemName) {
  const equipmentName = String(equipment.equipment_name || "").trim();
  const equipmentGroup = String(equipment.equipment_group || "").trim();
  const exact = whiteBoxByItemName.get(equipmentName);
  if (exact) return [exact];
  if (equipmentGroup !== "armor") return [];
  const setKey = stripArmorSetSuffix(equipmentName);
  if (!setKey) return [];
  return Array.from(whiteBoxByItemName.values()).filter((entry) => String(entry.itemName || "").startsWith(setKey));
}

function formatNumber(value) {
  return Number(value).toLocaleString("ja-JP");
}

function buildStatItems(row) {
  const stats = [
    ["攻撃力", row.attack],
    ["攻撃魔力", row.attack_magic],
    ["回復魔力", row.heal_magic],
    ["守備力", row.defense],
    ["盾ガード率", row.shield_guard_rate],
    ["HP", row.hp],
    ["MP", row.mp],
    ["すばやさ", row.speed],
    ["きようさ", row.dex],
    ["おしゃれさ", row.fashionable],
    ["おもさ", row.weight],
  ];
  return stats
    .filter(([, value]) => String(value || "").trim() !== "")
    .map(([label, value]) => `<li><strong>${escapeHtml(label)}：</strong>${escapeHtml(value)}</li>`)
    .join("");
}

function renderList(label, values) {
  if (!values.length) return `<li><strong>${escapeHtml(label)}：</strong>なし</li>`;
  return `<li><strong>${escapeHtml(label)}：</strong>${values.map((value) => escapeHtml(value)).join(" / ")}</li>`;
}

function buildRecipeItems(recipe, bazaarPrices) {
  if (!recipe) return { html: `<p class="empty">必要素材なし</p>`, estimatedCost: null, missingPriceCount: 0 };
  let estimatedCost = 0;
  let missingPriceCount = 0;
  const items = Array.from(recipe.materials.entries()).map(([materialName, quantity]) => {
    const unitPrice = bazaarPrices.get(materialName);
    if (unitPrice === undefined) {
      missingPriceCount += 1;
    } else {
      estimatedCost += unitPrice * quantity;
    }
    return `<li><span><a href="${escapeHtml(getMaterialHref(materialName))}">${escapeHtml(materialName)}</a> x ${escapeHtml(quantity)}</span><span>${unitPrice === undefined ? "単価なし" : `${formatNumber(unitPrice)}G`}</span></li>`;
  });
  return {
    html: `<ul class="material-list">${items.join("")}</ul>`,
    estimatedCost,
    missingPriceCount,
  };
}

function buildWhiteBoxHtml(entries) {
  if (!entries.length) return `<p class="empty">白宝箱ドロップなし</p>`;
  const items = entries.map((entry) => {
    const monsters = entry.monsters.length
      ? entry.monsters.map((monsterName) => `<a href="${escapeHtml(getMonsterHref(monsterName))}">${escapeHtml(monsterName)}</a>`).join(" / ")
      : "なし";
    const itemLabel = entry.itemName ? `${entry.itemName}${entry.itemSlot ? `（${entry.itemSlot}）` : ""}` : "";
    return `<li>${itemLabel ? `<span class="sub-label">${escapeHtml(itemLabel)}</span><br>` : ""}${monsters}</li>`;
  });
  return `<ul>${items.join("")}</ul>`;
}

function buildEquipmentPageHtml(equipment, context) {
  const equipmentName = String(equipment.equipment_name || "").trim();
  const equipmentType = String(equipment.equipment_type || "").trim();
  const equipmentGroup = String(equipment.equipment_group || "").trim();
  const equipmentLevel = String(equipment.equipment_level || "").trim();
  const traits = Array.isArray(equipment.traits) ? equipment.traits : [];
  const isArmorSet = equipmentGroup === "armor" && equipmentType === "防具セット";
  const recipe = context.recipes.get(equipmentName);
  const recipeResult = buildRecipeItems(recipe, context.bazaarPrices);
  const whiteBoxEntries = getWhiteBoxEntries(equipment, context.whiteBoxByItemName);
  const canonicalUrl = toCanonicalUrl(equipmentName);
  const equipmentUrl = toEquipmentUrl(equipmentName);
  const craftUrl = toCraftUrl(equipmentName);
  const description = `${equipmentName}の性能、基礎効果、セット効果、必要素材、白宝箱、推定原価を確認できます。DQ10ツールの装備情報ページです。`;
  const statItems = buildStatItems(equipment);

  return `<!doctype html>
<html lang="ja">
<head>
  <!-- ${GENERATED_MARKER} -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(equipmentName)}｜装備情報｜DQ10ツール</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(equipmentName)}｜装備情報｜DQ10ツール" />
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
    ul { margin: 0; padding-left: 1.15rem; }
    li + li { margin-top: 7px; }
    .material-list { list-style: none; padding-left: 0; }
    .material-list li { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(145, 105, 57, 0.18); padding: 6px 0; }
    .sub-label { color: var(--sub); font-size: 0.86rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(145, 105, 57, 0.3); background: rgba(255, 249, 240, 0.98); color: var(--link); text-decoration: none; font-weight: 700; font-size: 0.92rem; }
    .button:hover, .button:focus-visible { background: #fff7eb; }
    @media (max-width: 640px) { main { width: min(100% - 20px, 760px); padding-top: 18px; } .card { padding: 15px 14px 14px; border-radius: 14px; } .actions { flex-direction: column; } .button { width: 100%; } .material-list li { align-items: flex-start; flex-direction: column; gap: 2px; } }
  </style>
</head>
<body>
  ${renderCommonNav()}
  <main>
    <section class="card">
      <h1>${escapeHtml(equipmentName)}</h1>
      <p class="lead">性能・基礎効果・セット効果・必要素材・白宝箱・推定原価を確認できる装備個別ページです。</p>
      <div class="meta">
        ${equipmentType ? `<span>${escapeHtml(equipmentType)}</span>` : ""}
        ${equipmentGroup ? `<span>${escapeHtml(equipmentGroup)}</span>` : ""}
        ${equipmentLevel ? `<span>レベル ${escapeHtml(equipmentLevel)}</span>` : ""}
      </div>
      <div class="actions">
        <a class="button" href="${escapeHtml(equipmentUrl)}">装備情報ページで詳細を開く</a>
        <a class="button" href="${escapeHtml(craftUrl)}">職人アシストで開く</a>
        <a class="button" href="${SITE_ORIGIN}/equipment/">装備一覧へ戻る</a>
      </div>
    </section>
    <section class="card">
      <h2>性能</h2>
      ${statItems ? `<ul>${statItems}</ul>` : `<p class="empty">性能情報なし</p>`}
    </section>
    <section class="card">
      <h2>${isArmorSet ? "セット効果" : "基礎効果・特性"}</h2>
      ${traits.length ? `<ul>${traits.map((trait) => `<li>${escapeHtml(trait)}</li>`).join("")}</ul>` : `<p class="empty">${isArmorSet ? "セット効果なし" : "基礎効果・特性なし"}</p>`}
    </section>
    <section class="card">
      <h2>必要素材</h2>
      ${recipeResult.html}
      <p class="note">推定原価：${recipe ? `${formatNumber(recipeResult.estimatedCost)}G${recipeResult.missingPriceCount ? "（単価なし素材あり）" : ""}` : "なし"}</p>
    </section>
    <section class="card">
      <h2>白宝箱</h2>
      ${buildWhiteBoxHtml(whiteBoxEntries)}
      <div class="actions">
        <a class="button" href="${escapeHtml(equipmentUrl)}">装備情報ページで詳細を開く</a>
        <a class="button" href="${escapeHtml(craftUrl)}">職人アシストで開く</a>
        <a class="button" href="${SITE_ORIGIN}/equipment/">装備一覧へ戻る</a>
        <a class="button" href="${SITE_ORIGIN}/">ホームに戻る</a>
      </div>
      <p class="note">最新の絞り込みや関連リンクは、装備情報ページで確認できます。</p>
    </section>
  </main>
</body>
</html>
`;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeEquipmentPage(equipment, context) {
  const equipmentName = String(equipment.equipment_name || "").trim();
  if (!equipmentName) return null;
  const equipmentDir = path.join(OUTPUT_BASE_DIR, equipmentName);
  ensureDirectory(equipmentDir);
  const outputPath = path.join(equipmentDir, "index.html");
  fs.writeFileSync(outputPath, buildEquipmentPageHtml(equipment, context), "utf8");
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

function updateSitemap(equipmentUrls) {
  if (!fs.existsSync(SITEMAP_PATH)) return { added: 0 };
  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  const existingLocs = new Set(Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]));
  const additions = equipmentUrls
    .filter((url) => !existingLocs.has(url))
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`);
  if (!additions.length) return { added: 0 };
  const nextSitemap = sitemap.replace(/<\/urlset>\s*$/, `${additions.join("\n")}\n</urlset>\n`);
  fs.writeFileSync(SITEMAP_PATH, nextSitemap, "utf8");
  return { added: additions.length };
}

function main() {
  const equipmentRows = readCsvRows(EQUIPMENT_CSV_PATH);
  const recipeRows = readCsvRows(RECIPE_CSV_PATH, { encoding: "shift_jis" });
  const whiteBoxRows = readCsvRows(WHITE_BOX_CSV_PATH);
  const bazaarRows = readCsvRows(BAZAAR_CSV_PATH);
  const equipmentByName = collectEquipmentRows(equipmentRows);
  const equipments = Array.from(equipmentByName.values());
  const context = {
    recipes: collectRecipes(recipeRows),
    whiteBoxByItemName: collectWhiteBoxRows(whiteBoxRows),
    bazaarPrices: collectBazaarPrices(bazaarRows),
  };
  const removed = removeOldGeneratedPages(equipments.map((equipment) => String(equipment.equipment_name || "").trim()));
  const written = [];
  const equipmentUrls = [];
  equipments.forEach((equipment) => {
    const outputPath = writeEquipmentPage(equipment, context);
    if (outputPath) {
      written.push(outputPath);
      equipmentUrls.push(toCanonicalUrl(String(equipment.equipment_name || "").trim()));
    }
  });
  const sitemapResult = updateSitemap(equipmentUrls);
  const missingRecipeCount = equipments.filter((equipment) => !context.recipes.has(String(equipment.equipment_name || "").trim())).length;
  const missingWhiteBoxCount = equipments.filter((equipment) => getWhiteBoxEntries(equipment, context.whiteBoxByItemName).length === 0).length;
  console.log(`生成した装備個別ページ: ${written.length}件`);
  console.log(`同名重複をまとめた件数: ${Math.max(equipmentRows.filter((row) => String(row.equipment_name || "").trim()).length - equipments.length, 0)}件`);
  console.log(`削除した古い生成ページ: ${removed.length}件`);
  console.log(`sitemap.xml への追加URL: ${sitemapResult.added}件`);
  console.log(`レシピ未取得の装備: ${missingRecipeCount}件`);
  console.log(`白宝箱未取得の装備: ${missingWhiteBoxCount}件`);
}

main();
