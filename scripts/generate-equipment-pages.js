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
let expectedEquipmentNames = new Set();

const ARMOR_SLOT_ORDER = ["頭", "からだ上", "からだ下", "腕", "足", "小盾", "大盾", "盾"];
const ARMOR_SLOT_TYPES = new Set(ARMOR_SLOT_ORDER);

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

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ja-JP");
}

function toCanonicalUrl(equipmentName) {
  return `${SITE_ORIGIN}/equipment/${encodeURIComponent(equipmentName)}/`;
}

function toEquipmentUrl(equipmentName) {
  return `${SITE_ORIGIN}/equipment/${encodeURIComponent(equipmentName)}/`;
}

function toEquipmentSearchUrl(equipmentName) {
  return `${SITE_ORIGIN}/equipment/?q=${encodeURIComponent(equipmentName)}`;
}

function toCraftUrl(equipmentName) {
  return `${SITE_ORIGIN}/craft/?q=${encodeURIComponent(equipmentName)}`;
}

function toMaterialUrl(materialName) {
  return `${SITE_ORIGIN}/bazaar/${encodeURIComponent(materialName)}/`;
}

function toBazaarSearchUrl(materialName) {
  return `${SITE_ORIGIN}/bazaar/?q=${encodeURIComponent(materialName)}`;
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

function getEquipmentHref(equipmentName) {
  if (!equipmentName) return "";
  return expectedEquipmentNames.has(equipmentName) || hasGeneratedPage(OUTPUT_BASE_DIR, equipmentName)
    ? toEquipmentUrl(equipmentName)
    : toEquipmentSearchUrl(equipmentName);
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

function splitTraitEntries(value) {
  return String(value || "")
    .split(/\r?\n|\/|｜/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function collectEquipmentRows(rows) {
  const byName = new Map();
  rows.forEach((row) => {
    const equipmentName = String(row.equipment_name || "").trim();
    if (!equipmentName) return;
    if (!byName.has(equipmentName)) {
      byName.set(equipmentName, {
        equipmentName,
        equipmentGroup: String(row.equipment_group || "").trim(),
        equipmentLevel: String(row.equipment_level || "").trim(),
        equipmentType: String(row.equipment_type || "").trim(),
        source: "equipment",
        stats: {},
        traits: [],
      });
    }
    const entry = byName.get(equipmentName);
    ["attack", "attack_magic", "heal_magic", "defense", "shield_guard_rate", "hp", "mp", "speed", "dex", "fashionable", "weight"].forEach((key) => {
      const value = String(row[key] || "").trim();
      if (value) entry.stats[key] = value;
    });
    splitTraitEntries(row.traits).forEach((trait) => {
      if (!entry.traits.includes(trait)) entry.traits.push(trait);
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
        equipmentName,
        craftsman: String(row.craftsman || "").trim(),
        category: String(row.category || "").trim(),
        equipmentLevel: String(row.equipmentLevel || "").trim(),
        craftLevel: String(row.craftLevel || "").trim(),
        materials: new Map(),
      });
    }
    const recipe = byEquipmentName.get(equipmentName);
    recipe.materials.set(materialName, (recipe.materials.get(materialName) || 0) + quantity);
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
    if (price !== null) byMaterialName.set(materialName, price);
  });
  return byMaterialName;
}

function collectWhiteBoxRows(rows) {
  const byItemName = new Map();
  rows.forEach((row) => {
    const itemName = String(row.item_name || "").trim();
    if (!itemName) return;
    if (!byItemName.has(itemName)) {
      byItemName.set(itemName, {
        itemName,
        itemSlot: String(row.item_slot || "").trim(),
        equipmentLevel: String(row.equipment_level || "").trim(),
        monsters: [],
      });
    }
    const entry = byItemName.get(itemName);
    if (!entry.itemSlot && row.item_slot) entry.itemSlot = String(row.item_slot || "").trim();
    if (!entry.equipmentLevel && row.equipment_level) entry.equipmentLevel = String(row.equipment_level || "").trim();
    const dropStatus = String(row.drop_status || "").trim().toLowerCase();
    const monsterName = String(row.monster_name || "").trim();
    if (dropStatus === "has_drop" && monsterName && !entry.monsters.includes(monsterName)) {
      entry.monsters.push(monsterName);
    }
  });
  return byItemName;
}

function inferSetPrefixFromSetName(setName) {
  const name = String(setName || "").trim();
  if (!name.endsWith("セット")) return "";
  return name.slice(0, -3);
}

function inferSetNameForItem(itemName, setNames) {
  const name = String(itemName || "").trim();
  return (
    setNames
      .map((setName) => ({ setName, prefix: inferSetPrefixFromSetName(setName) }))
      .filter((entry) => entry.prefix && name.startsWith(entry.prefix))
      .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.setName || ""
  );
}

function isArmorSetEntry(entry) {
  return String(entry?.equipmentGroup || "") === "armor" && String(entry?.equipmentType || "") === "防具セット";
}

function isArmorPartEntry(entry) {
  return String(entry?.equipmentGroup || "") === "armor" || ARMOR_SLOT_TYPES.has(String(entry?.equipmentType || ""));
}

function ensureSyntheticEquipment(equipmentByName, whiteBoxByItemName) {
  const setNames = Array.from(equipmentByName.values()).filter(isArmorSetEntry).map((entry) => entry.equipmentName);
  whiteBoxByItemName.forEach((whiteBox, itemName) => {
    if (equipmentByName.has(itemName)) return;
    const setName = inferSetNameForItem(itemName, setNames);
    equipmentByName.set(itemName, {
      equipmentName: itemName,
      equipmentGroup: setName ? "armor" : "weapon",
      equipmentLevel: whiteBox.equipmentLevel || "",
      equipmentType: whiteBox.itemSlot || "",
      source: "white_box",
      stats: {},
      traits: [],
      setName,
    });
  });
}

function getSetName(entry, setNames) {
  if (isArmorSetEntry(entry)) return entry.equipmentName;
  if (entry?.setName) return entry.setName;
  return inferSetNameForItem(entry?.equipmentName, setNames);
}

function getSetPartEntries(setName, equipmentByName, whiteBoxByItemName, recipes) {
  const prefix = inferSetPrefixFromSetName(setName);
  if (!prefix) return [];
  const names = new Set();
  equipmentByName.forEach((entry, name) => {
    if (name !== setName && name.startsWith(prefix)) names.add(name);
  });
  whiteBoxByItemName.forEach((entry, name) => {
    if (name.startsWith(prefix)) names.add(name);
  });
  recipes.forEach((entry, name) => {
    if (name.startsWith(prefix)) names.add(name);
  });
  return Array.from(names)
    .map((name) => equipmentByName.get(name))
    .filter(Boolean)
    .sort((a, b) => {
      const aIndex = ARMOR_SLOT_ORDER.indexOf(String(a.equipmentType || ""));
      const bIndex = ARMOR_SLOT_ORDER.indexOf(String(b.equipmentType || ""));
      if (aIndex !== bIndex) return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
      return a.equipmentName.localeCompare(b.equipmentName, "ja");
    });
}

function buildStatItems(entry) {
  const labels = [
    ["attack", "攻撃力"],
    ["attack_magic", "攻撃魔力"],
    ["heal_magic", "回復魔力"],
    ["defense", "守備力"],
    ["shield_guard_rate", "盾ガード率"],
    ["hp", "HP"],
    ["mp", "MP"],
    ["speed", "すばやさ"],
    ["dex", "きようさ"],
    ["fashionable", "おしゃれさ"],
    ["weight", "おもさ"],
  ];
  const items = labels
    .map(([key, label]) => {
      const value = String(entry?.stats?.[key] || "").trim();
      return value ? `<li><strong>${escapeHtml(label)}：</strong>${escapeHtml(value)}</li>` : "";
    })
    .filter(Boolean);
  return items.length ? `<ul>${items.join("")}</ul>` : `<p class="empty">性能情報なし</p>`;
}

function buildRecipeHtml(recipe, bazaarPrices) {
  if (!recipe) return { html: `<p class="empty">レシピ情報なし</p>`, estimatedCost: null, missingPriceCount: 0 };
  let estimatedCost = 0;
  let missingPriceCount = 0;
  const items = Array.from(recipe.materials.entries()).map(([materialName, quantity]) => {
    const unitPrice = bazaarPrices.get(materialName);
    const subtotal = unitPrice === undefined ? null : unitPrice * quantity;
    if (subtotal === null) {
      missingPriceCount += 1;
    } else {
      estimatedCost += subtotal;
    }
    return `<tr><td><a href="${escapeHtml(getMaterialHref(materialName))}">${escapeHtml(materialName)}</a></td><td>${escapeHtml(quantity)}</td><td>${unitPrice === undefined ? "単価なし" : `${formatNumber(unitPrice)}G`}</td><td>${subtotal === null ? "小計なし" : `${formatNumber(subtotal)}G`}</td></tr>`;
  });
  const meta = [recipe.craftsman, recipe.category, recipe.equipmentLevel ? `Lv${recipe.equipmentLevel}` : "", recipe.craftLevel].filter(Boolean);
  return {
    html: `
      ${meta.length ? `<p class="recipe-meta">${meta.map(escapeHtml).join(" / ")}</p>` : ""}
      <div class="table-wrap">
        <table>
          <thead><tr><th>素材名</th><th>必要数</th><th>素材単価</th><th>小計</th></tr></thead>
          <tbody>${items.join("")}</tbody>
        </table>
      </div>
      <p class="note">推定原価：${formatNumber(estimatedCost)}G${missingPriceCount ? "（単価なし素材あり）" : ""}</p>
    `,
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

function getWhiteBoxEntriesForName(equipmentName, whiteBoxByItemName) {
  const exact = whiteBoxByItemName.get(equipmentName);
  return exact ? [exact] : [];
}

function getPageRecipeTargets(entry, setPartEntries) {
  if (isArmorSetEntry(entry)) return setPartEntries;
  if (isArmorPartEntry(entry) && setPartEntries.length > 0) return setPartEntries;
  return [entry];
}

function buildSetPartsHtml(setName, setPartEntries) {
  if (!setName || !setPartEntries.length) return "";
  return `
    <section class="card">
      <h2>同じセットの部位</h2>
      <ul class="part-list">
        ${setPartEntries
          .map((part) => `<li><span>${escapeHtml(part.equipmentType || "-")}</span><a href="${escapeHtml(getEquipmentHref(part.equipmentName))}">${escapeHtml(part.equipmentName)}</a></li>`)
          .join("")}
      </ul>
    </section>
  `;
}

function buildRecipeSectionsHtml(targets, recipes, bazaarPrices) {
  if (!targets.length) return `<section class="card"><h2>レシピ情報</h2><p class="empty">レシピ情報なし</p></section>`;
  return targets
    .map((target) => {
      const recipe = recipes.get(target.equipmentName);
      const recipeResult = buildRecipeHtml(recipe, bazaarPrices);
      return `
        <section class="card">
          <h2>${escapeHtml(target.equipmentName)}のレシピ</h2>
          ${recipeResult.html}
        </section>
      `;
    })
    .join("");
}

function buildWhiteBoxSectionsHtml(targets, whiteBoxByItemName) {
  if (!targets.length) return `<section class="card"><h2>白宝箱</h2><p class="empty">白宝箱ドロップなし</p></section>`;
  return `
    <section class="card">
      <h2>白宝箱</h2>
      ${buildWhiteBoxHtml(targets.flatMap((target) => getWhiteBoxEntriesForName(target.equipmentName, whiteBoxByItemName)))}
    </section>
  `;
}

function buildEquipmentPageHtml(entry, context) {
  const equipmentName = entry.equipmentName;
  const setNames = context.setNames;
  const setName = getSetName(entry, setNames);
  const setPartEntries = setName ? getSetPartEntries(setName, context.equipmentByName, context.whiteBoxByItemName, context.recipes) : [];
  const recipeTargets = getPageRecipeTargets(entry, setPartEntries);
  const whiteBoxTargets = isArmorSetEntry(entry) || (isArmorPartEntry(entry) && setPartEntries.length > 0) ? setPartEntries : [entry];
  const canonicalUrl = toCanonicalUrl(equipmentName);
  const craftUrl = toCraftUrl(equipmentName);
  const description = `${equipmentName}の性能、基礎効果、セット効果、必要素材、白宝箱、推定原価を確認できます。DQ10ツールの装備情報ページです。`;
  const isArmor = isArmorSetEntry(entry) || isArmorPartEntry(entry);
  const setEntry = setName ? context.equipmentByName.get(setName) : null;
  const displayEntry = isArmor && setEntry ? setEntry : entry;
  const traits = Array.isArray(displayEntry.traits) ? displayEntry.traits : [];

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
    main { width: min(860px, calc(100% - 28px)); margin: 0 auto; padding: 76px 0 44px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 10px 24px rgba(73, 48, 24, 0.08); padding: 18px 18px 16px; margin-bottom: 16px; }
    h1 { margin: 0 0 8px; font-size: clamp(1.55rem, 4vw, 2rem); line-height: 1.25; color: #2f2117; }
    h2 { margin: 0 0 10px; font-size: 1.05rem; color: #3a2415; }
    .lead, .empty, .note, .recipe-meta { margin: 0; color: var(--sub); font-size: 0.94rem; }
    .meta { margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 8px; }
    .meta span { display: inline-flex; align-items: center; min-height: 30px; padding: 4px 10px; border-radius: 999px; background: rgba(155, 119, 63, 0.08); border: 1px solid rgba(155, 119, 63, 0.18); font-size: 0.88rem; color: #5a3b22; }
    ul { margin: 0; padding-left: 1.15rem; }
    li + li { margin-top: 7px; }
    .part-list { list-style: none; padding-left: 0; display: grid; gap: 7px; }
    .part-list li { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(145, 105, 57, 0.18); padding: 6px 0; }
    .part-list span, .sub-label { color: var(--sub); font-size: 0.86rem; }
    .table-wrap { overflow-x: auto; margin-top: 10px; }
    table { width: 100%; border-collapse: collapse; min-width: 560px; }
    th, td { border-bottom: 1px solid rgba(145, 105, 57, 0.18); padding: 8px 6px; text-align: left; }
    th { color: var(--sub); font-size: 0.88rem; }
    a { color: var(--link); font-weight: 700; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(145, 105, 57, 0.3); background: rgba(255, 249, 240, 0.98); color: var(--link); text-decoration: none; font-weight: 700; font-size: 0.92rem; }
    .button:hover, .button:focus-visible { background: #fff7eb; }
    @media (max-width: 640px) { main { width: min(100% - 20px, 860px); padding-top: 18px; } .card { padding: 15px 14px 14px; border-radius: 14px; } .actions { flex-direction: column; } .button { width: 100%; } .part-list li { flex-direction: column; gap: 2px; } }
  </style>
  <link rel="stylesheet" href="/assets/individual-page.css" />
</head>
<body data-individual-type="装備" data-individual-name="${escapeHtml(equipmentName)}">
  ${renderCommonNav()}
  <main>
    <section class="card">
      <h1>${escapeHtml(equipmentName)}</h1>
      <p class="lead">${isArmor ? "セット情報、各部位のレシピ、白宝箱をまとめて確認できる装備個別ページです。" : "性能、レシピ、必要素材、推定原価、白宝箱をまとめて確認できる装備個別ページです。"}</p>
      <div class="meta">
        ${entry.equipmentType ? `<span>${escapeHtml(entry.equipmentType)}</span>` : ""}
        ${entry.equipmentGroup ? `<span>${escapeHtml(entry.equipmentGroup)}</span>` : ""}
        ${entry.equipmentLevel ? `<span>Lv${escapeHtml(entry.equipmentLevel)}</span>` : ""}
        ${setName && setName !== equipmentName ? `<span>${escapeHtml(setName)}</span>` : ""}
      </div>
      <div class="actions">
        <a class="button" href="${escapeHtml(toEquipmentSearchUrl(equipmentName))}">装備情報ページで詳細を開く</a>
        <a class="button" href="${escapeHtml(craftUrl)}">職人アシストで開く</a>
        <a class="button" href="${SITE_ORIGIN}/equipment/">装備一覧へ戻る</a>
      </div>
    </section>
    <section class="card">
      <h2>性能</h2>
      ${buildStatItems(displayEntry)}
    </section>
    <section class="card">
      <h2>${isArmor ? "基本性能" : "基礎効果・特性"}</h2>
      ${traits.length ? `<ul>${traits.map((trait) => `<li>${escapeHtml(trait)}</li>`).join("")}</ul>` : `<p class="empty">基礎効果・特性情報なし</p>`}
    </section>
    ${buildSetPartsHtml(setName, setPartEntries)}
    ${buildRecipeSectionsHtml(recipeTargets, context.recipes, context.bazaarPrices)}
    ${buildWhiteBoxSectionsHtml(whiteBoxTargets, context.whiteBoxByItemName)}
    <section class="card">
      <div class="actions">
        <a class="button" href="${escapeHtml(toEquipmentSearchUrl(equipmentName))}">装備情報ページで詳細を開く</a>
        <a class="button" href="${escapeHtml(craftUrl)}">職人アシストで開く</a>
        <a class="button" href="${SITE_ORIGIN}/equipment/">装備一覧へ戻る</a>
        <a class="button" href="${SITE_ORIGIN}/">ホームに戻る</a>
      </div>
      <p class="note">最新の絞り込みや関連リンクは、装備情報ページで確認できます。</p>
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

function writeEquipmentPage(entry, context) {
  if (!entry?.equipmentName) return null;
  const equipmentDir = path.join(OUTPUT_BASE_DIR, entry.equipmentName);
  ensureDirectory(equipmentDir);
  const outputPath = path.join(equipmentDir, "index.html");
  fs.writeFileSync(outputPath, buildEquipmentPageHtml(entry, context), "utf8");
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
  if (!fs.existsSync(SITEMAP_PATH)) return { added: 0, removed: 0 };
  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  let removed = 0;
  const cleanedSitemap = sitemap.replace(/\s*<url>\s*\n\s*<loc>(https:\/\/dq10tools\.com\/equipment\/([^/<]+)\/)<\/loc>\s*\n\s*<\/url>\s*\n?/g, (block, url, encodedName) => {
    const name = decodeURIComponent(encodedName);
    if (hasGeneratedPage(OUTPUT_BASE_DIR, name)) return block;
    removed += 1;
    return "";
  });
  const existingLocs = new Set(Array.from(cleanedSitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]));
  const additions = equipmentUrls
    .filter((url) => !existingLocs.has(url))
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`);
  if (!additions.length && !removed) return { added: 0, removed: 0 };
  const nextSitemap = cleanedSitemap.replace(/<\/urlset>\s*$/, additions.length ? `${additions.join("\n")}\n</urlset>\n` : "</urlset>\n");
  fs.writeFileSync(SITEMAP_PATH, nextSitemap, "utf8");
  return { added: additions.length, removed };
}

function main() {
  const equipmentRows = readCsvRows(EQUIPMENT_CSV_PATH);
  const recipeRows = readCsvRows(RECIPE_CSV_PATH, { encoding: "shift_jis" });
  const whiteBoxRows = readCsvRows(WHITE_BOX_CSV_PATH);
  const bazaarRows = readCsvRows(BAZAAR_CSV_PATH);
  const equipmentByName = collectEquipmentRows(equipmentRows);
  const recipes = collectRecipes(recipeRows);
  const whiteBoxByItemName = collectWhiteBoxRows(whiteBoxRows);
  ensureSyntheticEquipment(equipmentByName, whiteBoxByItemName);
  const setNames = Array.from(equipmentByName.values()).filter(isArmorSetEntry).map((entry) => entry.equipmentName);
  const context = {
    equipmentByName,
    recipes,
    whiteBoxByItemName,
    bazaarPrices: collectBazaarPrices(bazaarRows),
    setNames,
  };
  const equipments = Array.from(equipmentByName.values()).sort((a, b) => a.equipmentName.localeCompare(b.equipmentName, "ja"));
  expectedEquipmentNames = new Set(equipments.map((equipment) => equipment.equipmentName));
  const removed = removeOldGeneratedPages(equipments.map((equipment) => equipment.equipmentName));
  const written = [];
  const equipmentUrls = [];
  equipments.forEach((equipment) => {
    const outputPath = writeEquipmentPage(equipment, context);
    if (outputPath) {
      written.push(outputPath);
      equipmentUrls.push(toCanonicalUrl(equipment.equipmentName));
    }
  });
  const sitemapResult = updateSitemap(equipmentUrls);
  const missingRecipeCount = equipments.filter((equipment) => !recipes.has(equipment.equipmentName)).length;
  const missingWhiteBoxCount = equipments.filter((equipment) => getWhiteBoxEntriesForName(equipment.equipmentName, whiteBoxByItemName).length === 0).length;
  console.log(`生成した装備個別ページ: ${written.length}件`);
  console.log(`削除した古い生成ページ: ${removed.length}件`);
  console.log(`sitemap.xml への追加URL: ${sitemapResult.added}件`);
  console.log(`レシピ未取得の装備: ${missingRecipeCount}件`);
  console.log(`白宝箱未取得の装備: ${missingWhiteBoxCount}件`);
}

main();
