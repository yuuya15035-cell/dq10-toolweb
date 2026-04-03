// DQ10職人ツールの最小実装。
// 日本語コメントを多めに入れて、将来の拡張をしやすくしています。

const STORAGE_KEY = "dq10_toolweb_data_v1";
// recipe.csv の配置先。data ディレクトリ配下を正として扱います。
const RECIPE_CSV_PATH = "./data/recipe.csv";
const TOOLS_CSV_PATH = "./data/tools.csv";
const BAZAAR_CSV_PATH = "./data/bazaar_prices.csv";
const LAST_UPDATED_JSON_PATH = "./data/last-updated.json";
const BAZAAR_FAVORITES_STORAGE_KEY = "dq10_toolweb_bazaar_favorites_v1";
const RECIPE_FAVORITES_STORAGE_KEY = "dq10_toolweb_recipe_favorites_v1";
const RECIPE_FAVORITE_CATEGORY_VALUE = "__favorites__";
const TAB_IDS = new Set(["profit", "bazaar", "favorites", "data"]);
const FAVORITES_TAB_IDS = new Set(["recipes", "materials"]);
const RECIPE_SUMMARY_MATERIAL_LIMIT = 4;
const BAZAAR_CATEGORY_ORDER = ["石系", "植物系", "モンスター系", "その他", "消費アイテム"];
const BAZAAR_SORT_OPTIONS = [
  { value: "standard", label: "標準順" },
  { value: "rate_desc", label: "変動率高い順" },
  { value: "rate_asc", label: "変動率低い順" },
];
const RECIPE_SORT_OPTIONS = [
  { value: "cost_desc", label: "原価高い順" },
  { value: "cost_asc", label: "原価低い順" },
  { value: "favorite_first", label: "お気に入り優先" },
];

// 初期データ（CSVが読み込めない場合のフォールバック）
const defaultData = {
  feeRate: 5,
  materials: [
    { id: "m:てっこうせき", name: "てっこうせき", price: 120 },
    { id: "m:ぎんのこうせき", name: "ぎんのこうせき", price: 320 },
    { id: "m:ようせいのひだね", name: "ようせいのひだね", price: 450 },
  ],
  equipments: [
    { id: "e:はがねのつるぎ", name: "はがねのつるぎ", salePrices: { star0: 3200, star1: 3200, star2: 3200, star3: 3200 } },
    { id: "e:ぎんのレイピア", name: "ぎんのレイピア", salePrices: { star0: 5800, star1: 5800, star2: 5800, star3: 5800 } },
  ],
  recipes: [
    { id: crypto.randomUUID(), equipmentId: "e:はがねのつるぎ", materialId: "m:ぎんのこうせき", quantity: 1 },
    { id: crypto.randomUUID(), equipmentId: "e:はがねのつるぎ", materialId: "m:てっこうせき", quantity: 1 },
    { id: crypto.randomUUID(), equipmentId: "e:ぎんのレイピア", materialId: "m:ぎんのこうせき", quantity: 1 },
  ],
  tools: [],
  toolPurchasePrices: [],
};

// CSVの1行（カンマ区切り）を最低限パースする関数。
// このデータはクォートをほぼ使っていない想定なので、できるだけシンプルに実装しています。
function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

// 装備名・素材名から固定IDを作る関数。
// 名前をベースにすることで、再読み込み後も価格の引き継ぎがしやすくなります。
function makeEquipmentId(name) {
  return `e:${name}`;
}

function makeMaterialId(name) {
  return `m:${name}`;
}

function makeToolId(profession, toolName) {
  return `t:${profession}:${toolName}`;
}

async function fetchCsvLines(path) {
  console.info(`[CSV] fetch start: ${path}`);
  const response = await fetch(path);
  if (!response.ok) {
    console.error(`[CSV] fetch failed: path=${path}, status=${response.status}`);
    throw new Error(`CSVの読み込みに失敗しました: ${path} (${response.status})`);
  }
  const csvText = await response.text();
  const normalized = csvText.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/).filter((line) => line.trim().length > 0);
  console.info(`[CSV] fetch success: path=${path}, lines=${lines.length}`);
  return lines;
}

function parseToolsFromLines(lines) {
  if (lines.length <= 1) {
    throw new Error("tools.csv にデータ行がありません");
  }

  const headers = parseCsvLine(lines[0]);
  const professionIndex = headers.indexOf("profession");
  const toolNameIndex = headers.indexOf("tool_name");
  const durabilityIndex = headers.indexOf("durability");
  const sortOrderIndex = headers.indexOf("sort_order");

  if (professionIndex < 0 || toolNameIndex < 0 || durabilityIndex < 0 || sortOrderIndex < 0) {
    throw new Error("tools.csv ヘッダーが想定と一致しません");
  }

  const tools = [];
  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const profession = row[professionIndex];
    const toolName = row[toolNameIndex];
    const durability = Number(row[durabilityIndex] || 0);
    const sortOrder = Number(row[sortOrderIndex] || Number.MAX_SAFE_INTEGER);
    if (!profession || !toolName || durability <= 0) {
      console.warn(`tools.csv の ${i + 1} 行目をスキップしました（profession/tool_name/durability 不正）`);
      continue;
    }

    tools.push({
      id: makeToolId(profession, toolName),
      profession,
      toolName,
      durability,
      sortOrder,
    });
  }

  return tools;
}

// recipe.csvを読み込み、画面で使うデータ構造に変換します。
async function loadDataFromCsv() {
  const [recipeLines, toolLines] = await Promise.all([fetchCsvLines(RECIPE_CSV_PATH), fetchCsvLines(TOOLS_CSV_PATH)]);
  const lines = recipeLines;
  if (lines.length <= 1) {
    throw new Error("CSVにデータ行がありません");
  }

  // ヘッダー行の位置を取り、必要列の存在を確認します。
  const headers = parseCsvLine(lines[0]);
  const craftsmanIndex = headers.indexOf("craftsman");
  const categoryIndex = headers.indexOf("category");
  const equipmentNameIndex = headers.indexOf("equipmentName");
  const materialNameIndex = headers.indexOf("materialName");
  const quantityIndex = headers.indexOf("quantity");

  if (craftsmanIndex < 0 || categoryIndex < 0 || equipmentNameIndex < 0 || materialNameIndex < 0 || quantityIndex < 0) {
    throw new Error("CSVヘッダーが想定と一致しません");
  }

  const equipmentMap = new Map();
  const materialMap = new Map();
  const recipes = [];

  // データ行を順に読み取り、装備・素材を重複なくまとめます。
  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const craftsman = row[craftsmanIndex];
    const category = row[categoryIndex];
    const equipmentName = row[equipmentNameIndex];
    const materialName = row[materialNameIndex];
    const quantity = Number(row[quantityIndex] || 0);

    if (!craftsman || !category || !equipmentName || !materialName || quantity <= 0) continue;

    if (!equipmentMap.has(equipmentName)) {
      equipmentMap.set(equipmentName, {
        id: makeEquipmentId(equipmentName),
        name: equipmentName,
        craftsman,
        category,
        // 販売価格はCSVに無いので0初期化（既存保存値があれば後で引き継ぎ）
        salePrices: { star0: 0, star1: 0, star2: 0, star3: 0 },
      });
    }

    if (!materialMap.has(materialName)) {
      materialMap.set(materialName, {
        id: makeMaterialId(materialName),
        name: materialName,
        // 素材価格もCSVに無いため0初期化（既存保存値があれば後で引き継ぎ）
        price: 0,
      });
    }

    recipes.push({
      id: crypto.randomUUID(),
      equipmentId: makeEquipmentId(equipmentName),
      materialId: makeMaterialId(materialName),
      quantity,
    });
  }

  const tools = parseToolsFromLines(toolLines);

  return {
    feeRate: 5,
    equipments: Array.from(equipmentMap.values()),
    materials: Array.from(materialMap.values()),
    recipes,
    tools,
    toolPurchasePrices: [],
  };
}

function loadStoredData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadBazaarFavoriteState() {
  const raw = localStorage.getItem(BAZAAR_FAVORITES_STORAGE_KEY);
  if (!raw) {
    return {
      showFavoritesOnly: false,
      favoriteMaterialKeys: new Set(),
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const keys = Array.isArray(parsed?.favoriteMaterialKeys) ? parsed.favoriteMaterialKeys : [];
    return {
      showFavoritesOnly: Boolean(parsed?.showFavoritesOnly),
      favoriteMaterialKeys: new Set(keys.map((key) => String(key || "").trim()).filter((key) => key !== "")),
    };
  } catch {
    return {
      showFavoritesOnly: false,
      favoriteMaterialKeys: new Set(),
    };
  }
}

function saveBazaarFavoriteState() {
  localStorage.setItem(
    BAZAAR_FAVORITES_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      keyType: "materialName",
      favoriteMaterialKeys: Array.from(bazaarFavoriteMaterialKeys),
      showFavoritesOnly: showBazaarFavoritesOnly,
    })
  );
}

function loadRecipeFavoriteState() {
  const raw = localStorage.getItem(RECIPE_FAVORITES_STORAGE_KEY);
  if (!raw) return new Set();

  try {
    const parsed = JSON.parse(raw);
    const keys = Array.isArray(parsed?.favoriteRecipeKeys) ? parsed.favoriteRecipeKeys : [];
    return new Set(
      keys
        .map((key) => String(key || "").trim())
        .filter((key) => key !== "")
        .map((key) => {
          if (key.startsWith("id:") || key.startsWith("name:")) return key;
          return `name:${key}`;
        })
    );
  } catch {
    return new Set();
  }
}

function saveRecipeFavoriteState() {
  localStorage.setItem(
    RECIPE_FAVORITES_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      keyType: "equipmentId",
      favoriteRecipeKeys: Array.from(recipeFavoriteKeys),
    })
  );
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// CSVデータをベースに、既存のローカル保存データ（価格や手数料）を重ねます。
function mergeWithStoredData(csvData, storedData) {
  if (!storedData) return csvData;

  const materialPriceByName = new Map((storedData.materials || []).map((m) => [m.name, Number(m.price || 0)]));
  const salePricesByName = new Map(
    (storedData.equipments || []).map((e) => [e.name, normalizeSalePrices(e.salePrices, Number(e.salePrice || 0))])
  );
  const toolPurchasePriceById = new Map((storedData.toolPurchasePrices || []).map((t) => [t.toolId, Number(t.purchasePrice || 0)]));

  return {
    feeRate: Number(storedData.feeRate ?? csvData.feeRate ?? 5),
    materials: csvData.materials.map((m) => ({
      ...m,
      price: materialPriceByName.get(m.name) ?? m.price,
    })),
    equipments: csvData.equipments.map((e) => ({
      ...e,
      salePrices: salePricesByName.get(e.name) ?? normalizeSalePrices(e.salePrices, Number(e.salePrice || 0)),
    })),
    recipes: csvData.recipes,
    tools: csvData.tools || [],
    toolPurchasePrices: (csvData.tools || []).map((tool) => ({
      toolId: tool.id,
      purchasePrice: toolPurchasePriceById.get(tool.id) || 0,
    })),
  };
}

let state = structuredClone(defaultData);
let selectedEquipmentId = state.equipments[0]?.id || "";
// 装備検索キーワード（利益計算画面の装備プルダウン用）
let equipmentSearchKeyword = "";
let materialSearchKeyword = "";
// 利益計算画面の絞り込み条件（未選択なら全件）
let selectedCraftsman = "";
let selectedCategory = "";
let selectedToolId = "";
let bazaarPrices = [];
let selectedBazaarCategory = "";
let selectedBazaarSort = "standard";
let bazaarSearchText = "";
let selectedBazaarMaterialName = "";
let isBazaarSearchComposing = false;
let shouldRefocusBazaarSearchInput = false;
let bazaarCsvUpdatedAt = "-";
let showBazaarFavoritesOnly = false;
let activeFavoritesTabId = "recipes";
let bazaarFavoriteMaterialKeys = new Set();
let recipeFavoriteKeys = new Set();
let selectedRecipeSort = RECIPE_SORT_OPTIONS[0].value;
let activeTabId = "profit";
let pendingBazaarFocusMaterialKey = "";
// 利益計算画面だけで使う「今回計算用の一時単価」。
// - キー: materialId
// - 値: 画面上で上書きした単価
// saveData() には含めず、素材価格管理の元データを保護します。
const temporaryMaterialPrices = new Map();

function getRequiredElementById(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`#${id} が見つかりません。該当機能をスキップします。`);
  }
  return element;
}

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const menuToggleButton = getRequiredElementById("menuToggleButton");
const sideMenu = getRequiredElementById("sideMenu");
const menuOverlay = getRequiredElementById("menuOverlay");
const sideMenuItems = document.querySelectorAll(".side-menu-item");

const equipmentSelect = getRequiredElementById("equipmentSelect");
const recipeSortSelect = getRequiredElementById("recipeSortSelect");
const recipeFavoriteActionWrap = getRequiredElementById("recipeFavoriteActionWrap");
const equipmentSearchInput = getRequiredElementById("equipmentSearchInput");
const materialSearchInput = getRequiredElementById("materialSearchInput");
const craftsmanFilterSelect = getRequiredElementById("craftsmanFilterSelect");
const categoryFilterSelect = getRequiredElementById("categoryFilterSelect");
const productionCountInput = getRequiredElementById("productionCountInput");
const salePriceStar0Input = getRequiredElementById("salePriceStar0Input");
const salePriceStar1Input = getRequiredElementById("salePriceStar1Input");
const salePriceStar2Input = getRequiredElementById("salePriceStar2Input");
const salePriceStar3Input = getRequiredElementById("salePriceStar3Input");
const countStar0Input = getRequiredElementById("countStar0Input");
const countStar1Input = getRequiredElementById("countStar1Input");
const countStar2Input = getRequiredElementById("countStar2Input");
const countStar3Input = getRequiredElementById("countStar3Input");
const recipeTableWrap = getRequiredElementById("recipeTableWrap");
const toolWrap = getRequiredElementById("toolWrap");
const toolSelect = getRequiredElementById("toolSelect");
const toolDurabilityInput = getRequiredElementById("toolDurabilityInput");
const toolPurchasePriceInput = getRequiredElementById("toolPurchasePriceInput");
const materialListWrap = getRequiredElementById("materialListWrap");
const recipeAdminListWrap = getRequiredElementById("recipeAdminListWrap");
const exportMaterialPricesButton = getRequiredElementById("exportMaterialPricesButton");
const importMaterialPricesButton = getRequiredElementById("importMaterialPricesButton");
const importMaterialPricesInput = getRequiredElementById("importMaterialPricesInput");
const materialDataTransferMessage = getRequiredElementById("materialDataTransferMessage");
const bazaarListWrap = getRequiredElementById("bazaarListWrap");
const favoriteRecipesListWrap = getRequiredElementById("favoriteRecipesListWrap");
const favoriteMaterialsListWrap = getRequiredElementById("favoriteMaterialsListWrap");
const favoritesTabButtons = document.querySelectorAll("[data-favorites-tab]");
const favoritesPanels = document.querySelectorAll(".favorites-panel");

const perCraftToolCostEl = getRequiredElementById("perCraftToolCost");
const totalMaterialCostEl = getRequiredElementById("totalMaterialCost");
const profitStar0ValueEl = getRequiredElementById("profitStar0Value");
const profitStar1ValueEl = getRequiredElementById("profitStar1Value");
const profitStar2ValueEl = getRequiredElementById("profitStar2Value");
const profitStar3ValueEl = getRequiredElementById("profitStar3Value");
const productionCountWarningEl = getRequiredElementById("productionCountWarning");
const countStar0ValueEl = getRequiredElementById("countStar0Value");
const countStar1ValueEl = getRequiredElementById("countStar1Value");
const countStar2ValueEl = getRequiredElementById("countStar2Value");
const countStar3ValueEl = getRequiredElementById("countStar3Value");
const totalProfitStar0ValueEl = getRequiredElementById("totalProfitStar0Value");
const totalProfitStar1ValueEl = getRequiredElementById("totalProfitStar1Value");
const totalProfitStar2ValueEl = getRequiredElementById("totalProfitStar2Value");
const totalProfitStar3ValueEl = getRequiredElementById("totalProfitStar3Value");
const totalFeeValueEl = getRequiredElementById("totalFeeValue");
const averageNetSalesValueEl = getRequiredElementById("averageNetSalesValue");
const totalProfitValueEl = getRequiredElementById("totalProfitValue");

const materialForm = getRequiredElementById("materialForm");
const equipmentForm = getRequiredElementById("equipmentForm");
const recipeForm = getRequiredElementById("recipeForm");

const recipeEquipmentSelect = getRequiredElementById("recipeEquipmentSelect");
const recipeMaterialSelect = getRequiredElementById("recipeMaterialSelect");

function formatGold(value) {
  return `${Math.round(value).toLocaleString("ja-JP")} G`;
}

function formatBazaarPrice(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "-";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "-";
  return parsed.toLocaleString("ja-JP");
}

function formatBazaarPriceWithUnit(value) {
  const text = formatBazaarPrice(value);
  return text === "-" ? "-" : `${text} G`;
}

function normalizeBazaarRate(rate) {
  if (!Number.isFinite(rate)) return null;
  return Math.abs(rate) < 0.05 ? 0 : rate;
}

function formatBazaarChangeRate(rate) {
  const normalizedRate = normalizeBazaarRate(rate);
  if (!Number.isFinite(normalizedRate)) return "-";

  const absRate = Math.abs(normalizedRate);
  const signPrefix = normalizedRate > 0 ? "+" : "";
  const displayRate = absRate === 0 ? 0 : normalizedRate;
  return `${signPrefix}${displayRate.toFixed(1)}%`;
}

function getBazaarChangeArrow(rate) {
  const normalizedRate = normalizeBazaarRate(rate);
  if (!Number.isFinite(normalizedRate)) return "";
  if (normalizedRate >= 100) return "↑";
  if (normalizedRate >= 1) return "↗";
  if (normalizedRate <= -100) return "↓";
  if (normalizedRate <= -1) return "↘";
  return "→";
}

function getBazaarChangeToneClass(rate) {
  const normalizedRate = normalizeBazaarRate(rate);
  if (!Number.isFinite(normalizedRate)) return "is-unavailable";
  if (normalizedRate > 0) return "is-positive";
  if (normalizedRate < 0) return "is-negative";
  return "is-neutral";
}

function getBazaarChangePresentation(rate) {
  const normalizedRate = normalizeBazaarRate(rate);
  if (!Number.isFinite(normalizedRate)) {
    return {
      text: "-",
      arrow: "",
      toneClass: "is-unavailable",
      isComputable: false,
    };
  }

  return {
    text: formatBazaarChangeRate(normalizedRate),
    arrow: getBazaarChangeArrow(normalizedRate),
    toneClass: getBazaarChangeToneClass(normalizedRate),
    isComputable: true,
  };
}

function formatBazaarUpdatedAt(rawValue) {
  const normalized = String(rawValue || "").trim();
  if (normalized === "") return "-";

  const normalizedDateText = normalized.replace(/-/g, "/");
  const parsed = new Date(normalizedDateText);
  if (Number.isNaN(parsed.getTime())) return normalized;

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

async function loadBazaarLastUpdatedAt() {
  try {
    console.info(`[last-updated.json] fetch start: ${LAST_UPDATED_JSON_PATH}`);
    const response = await fetch(LAST_UPDATED_JSON_PATH);
    if (!response.ok) {
      throw new Error(`status=${response.status}`);
    }

    const payload = await response.json();
    const formatted = formatBazaarUpdatedAt(payload?.bazaarCsvUpdatedAt);
    console.info(`[last-updated.json] fetch success: bazaarCsvUpdatedAt=${formatted}`);
    return formatted;
  } catch (error) {
    console.warn("[last-updated.json] 読み込みに失敗したため、更新時刻は '-' を表示します", error);
    return "-";
  }
}

function parseNullableNumber(value) {
  const normalized = String(value ?? "").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOfficialUrl(value) {
  const normalized = String(value || "").trim();
  if (normalized === "") return "";
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

function parseBazaarPricesFromLines(lines) {
  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const materialNameIndex = headers.indexOf("materialName");
  const itemCategoryIndex = headers.indexOf("item_category");
  const sortOrderIndex = headers.indexOf("sort_order");
  const todayPriceIndex = headers.indexOf("today_price");
  const previousDayPriceIndex = headers.indexOf("previous_day_price");
  const updatedAtIndex = headers.indexOf("updated_at");
  const updateInfoIndex = headers.indexOf("update_info");
  const commentIndex = headers.indexOf("comment");
  const shopPriceIndex = headers.indexOf("shop_price");
  const officialUrlIndex = headers.indexOf("official_url");
  console.info("[bazaar_prices.csv] header columns:", headers);

  if (
    materialNameIndex < 0 ||
    itemCategoryIndex < 0 ||
    sortOrderIndex < 0 ||
    todayPriceIndex < 0 ||
    previousDayPriceIndex < 0 ||
    commentIndex < 0
  ) {
    throw new Error("bazaar_prices.csv ヘッダーが想定と一致しません");
  }

  if (updateInfoIndex < 0) {
    console.warn("[bazaar_prices.csv] update_info 列が見つからないため空文字で補完します");
  }
  if (updatedAtIndex < 0) {
    console.warn("[bazaar_prices.csv] updated_at 列が見つからないため参照しません");
  }
  if (shopPriceIndex < 0) {
    console.warn("[bazaar_prices.csv] shop_price 列が見つからないため null で補完します");
  }
  if (officialUrlIndex < 0) {
    console.warn("[bazaar_prices.csv] official_url 列が見つからないため空文字で補完します");
  }

  const rows = lines
    .slice(1)
    .map((line) => parseCsvLine(line))
    .map((row, rowIndex) => {
      const sortOrderRaw = Number(row[sortOrderIndex]);
      const todayPriceRaw = String(row[todayPriceIndex] || "").trim();
      const shopPriceRaw = shopPriceIndex >= 0 ? String(row[shopPriceIndex] || "").trim() : "";
      const displayPriceRaw = todayPriceRaw !== "" ? todayPriceRaw : shopPriceRaw;
      const todayPrice = parseNullableNumber(todayPriceRaw);
      const previousDayPrice = parseNullableNumber(row[previousDayPriceIndex]);
      return {
        id: `bazaar-row-${rowIndex}`,
        materialName: String(row[materialNameIndex] || "").trim(),
        materialKey: makeMaterialId(String(row[materialNameIndex] || "").trim()),
        itemCategory: String(row[itemCategoryIndex] || "").trim(),
        sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : Number.MAX_SAFE_INTEGER,
        todayPrice,
        shopPrice: parseNullableNumber(shopPriceRaw),
        displayPrice: parseNullableNumber(displayPriceRaw),
        previousDayPrice,
        priceChangeRate: calculatePriceChangeRate(todayPrice, previousDayPrice),
        updatedAt: updatedAtIndex >= 0 ? String(row[updatedAtIndex] || "").trim() : "",
        updateInfo: updateInfoIndex >= 0 ? String(row[updateInfoIndex] || "").trim() : "",
        comment: String(row[commentIndex] || "").trim(),
        officialUrl: officialUrlIndex >= 0 ? parseOfficialUrl(row[officialUrlIndex]) : "",
      };
    })
    .filter((row) => row.materialName !== "")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  console.info(`[bazaar_prices.csv] parsed rows: ${rows.length}`);
  return rows;
}

async function loadBazaarPricesCsv() {
  const lines = await fetchCsvLines(BAZAAR_CSV_PATH);
  return parseBazaarPricesFromLines(lines);
}

function getBazaarCategoryPriority(category) {
  const index = BAZAAR_CATEGORY_ORDER.indexOf(String(category || "").trim());
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function calculatePriceChangeRate(todayPrice, yesterdayPrice) {
  if (!Number.isFinite(todayPrice)) return null;
  if (!Number.isFinite(yesterdayPrice) || yesterdayPrice === 0) return null;
  return ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100;
}

function getBazaarRowChangeRate(row) {
  if (Number.isFinite(row?.priceChangeRate)) return row.priceChangeRate;
  return calculatePriceChangeRate(row?.todayPrice, row?.previousDayPrice);
}

function compareNullableNumbers(a, b, direction = "desc") {
  const aIsValid = Number.isFinite(a);
  const bIsValid = Number.isFinite(b);
  if (!aIsValid && !bIsValid) return 0;
  if (!aIsValid) return 1;
  if (!bIsValid) return -1;
  return direction === "asc" ? a - b : b - a;
}

function getSortedBazaarRows(rows, currentCategory, currentSort) {
  const normalizedSort = BAZAAR_SORT_OPTIONS.some((option) => option.value === currentSort) ? currentSort : "standard";
  return rows.slice().sort((a, b) => {
    if (normalizedSort === "standard") {
      // 「標準順」は変動率では並べ替えず、元の並びに戻す。
      // 「すべて」表示時のみカテゴリ既定順を先に適用し、カテゴリ内は CSV 既定順で表示する。
      if (currentCategory === "") {
        const categoryDiff = getBazaarCategoryPriority(a.itemCategory) - getBazaarCategoryPriority(b.itemCategory);
        if (categoryDiff !== 0) return categoryDiff;
      }
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return String(a.materialName || "").localeCompare(String(b.materialName || ""), "ja");
    }

    const aRate = getBazaarRowChangeRate(a);
    const bRate = getBazaarRowChangeRate(b);
    const sortDirection = normalizedSort === "rate_asc" ? "asc" : "desc";
    const rateDiff = compareNullableNumbers(aRate, bRate, sortDirection);
    if (rateDiff !== 0) return rateDiff;

    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return String(a.materialName || "").localeCompare(String(b.materialName || ""), "ja");
  });
}

function isBazaarFavoriteRow(row) {
  return bazaarFavoriteMaterialKeys.has(row?.materialKey);
}

function normalizeBazaarSearchText(value) {
  return String(value || "").trim().toLocaleLowerCase("ja");
}

function getBazaarSearchCandidates(keyword) {
  const normalizedKeyword = normalizeBazaarSearchText(keyword);
  if (normalizedKeyword === "") return [];

  const uniqueNames = new Set();
  bazaarPrices.forEach((row) => {
    const materialName = String(row?.materialName || "").trim();
    if (materialName === "") return;
    const normalizedName = normalizeBazaarSearchText(materialName);
    if (normalizedName.includes(normalizedKeyword)) {
      uniqueNames.add(materialName);
    }
  });

  return Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, "ja"));
}

function getVisibleBazaarRows() {
  const targetRows = bazaarPrices.filter((row) => selectedBazaarCategory === "" || row.itemCategory === selectedBazaarCategory);
  const favoriteFilteredRows = showBazaarFavoritesOnly ? targetRows.filter((row) => isBazaarFavoriteRow(row)) : targetRows;
  const normalizedKeyword = normalizeBazaarSearchText(bazaarSearchText);
  const keywordFilteredRows =
    normalizedKeyword === ""
      ? favoriteFilteredRows
      : favoriteFilteredRows.filter((row) => normalizeBazaarSearchText(row.materialName).includes(normalizedKeyword));
  const filteredRows = keywordFilteredRows;
  return getSortedBazaarRows(filteredRows, selectedBazaarCategory, selectedBazaarSort);
}

function renderBazaarPrices() {
  if (!bazaarListWrap) return;

  if (!Array.isArray(bazaarPrices) || bazaarPrices.length === 0) {
    console.warn(`[bazaar] render skipped: rows.length=${Array.isArray(bazaarPrices) ? bazaarPrices.length : "not-array"}`);
    bazaarListWrap.innerHTML = `<p>表示できる価格データがありません。CSV内容を確認してください。</p>`;
    return;
  }

  const categorySet = new Set(
    bazaarPrices
      .map((row) => String(row.itemCategory || "").trim())
      .filter((category) => category !== "")
  );
  const categories = Array.from(categorySet).sort((a, b) => {
    const priorityDiff = getBazaarCategoryPriority(a) - getBazaarCategoryPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return a.localeCompare(b, "ja");
  });
  const hasSelectedCategory = selectedBazaarCategory !== "" && categorySet.has(selectedBazaarCategory);

  if (selectedBazaarCategory !== "" && !hasSelectedCategory) {
    selectedBazaarCategory = "";
  }

  const visibleRows = getVisibleBazaarRows();
  const searchText = String(bazaarSearchText || "");
  const trimmedSearchText = searchText.trim();
  const searchCandidates = getBazaarSearchCandidates(trimmedSearchText);
  const showSearchCandidates = trimmedSearchText !== "";
  console.info(
    `[bazaar] render rows: total=${bazaarPrices.length}, visible=${visibleRows.length}, category=${selectedBazaarCategory || "all"}, sort=${selectedBazaarSort}, favoritesOnly=${showBazaarFavoritesOnly}, search=${trimmedSearchText || "-"}`
  );

  bazaarListWrap.innerHTML = `
    <div class="bazaar-control-wrap">
      <label class="field bazaar-category-field">
        <span>ジャンル切り替え</span>
        <select id="bazaarCategorySelect" aria-label="ジャンル切り替え">
          <option value="">すべて</option>
          ${categories
            .map(
              (category) => `
                <option value="${category}" ${selectedBazaarCategory === category ? "selected" : ""}>${category}</option>
              `
            )
            .join("")}
        </select>
      </label>
      <label class="field bazaar-sort-field">
        <span>並び替え</span>
        <select id="bazaarSortSelect" aria-label="並び替え">
          ${BAZAAR_SORT_OPTIONS.map(
            (option) => `
              <option value="${option.value}" ${selectedBazaarSort === option.value ? "selected" : ""}>${option.label}</option>
            `
          ).join("")}
        </select>
      </label>
      <label class="field bazaar-search-field">
        <span>素材検索</span>
        <div class="bazaar-search-input-wrap">
          <input
            id="bazaarSearchInput"
            type="search"
            placeholder="素材名で検索"
            aria-label="素材名で検索"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
          />
          <button
            id="bazaarSearchClearButton"
            type="button"
            class="bazaar-search-clear-button"
            aria-label="素材検索をクリア"
            ${trimmedSearchText === "" ? "disabled" : ""}
          >
            ×
          </button>
        </div>
        ${
          showSearchCandidates
            ? `<div class="bazaar-search-candidates" role="listbox" aria-label="素材検索候補">
                ${
                  searchCandidates.length === 0
                    ? `<p class="bazaar-search-empty">候補がありません</p>`
                    : searchCandidates
                        .slice(0, 30)
                        .map(
                          (candidate) => `
                            <button type="button" class="bazaar-search-candidate-button">
                              ${candidate}
                            </button>
                          `
                        )
                        .join("")
                }
              </div>`
            : ""
        }
      </label>
      <label class="field inline-field bazaar-favorite-filter-field">
        <input id="bazaarFavoritesOnlyToggle" type="checkbox" ${showBazaarFavoritesOnly ? "checked" : ""} />
        <span>お気に入りのみ表示</span>
      </label>
    </div>
    <div class="bazaar-list">
      ${
        visibleRows.length === 0
          ? `<p>${showBazaarFavoritesOnly ? "お気に入り登録された素材がありません。" : "選択した条件のデータがありません。"}</p>`
          : visibleRows
              .map((row) => {
          const todayPriceHtml = formatBazaarPriceWithUnit(row.displayPrice);
          const changeRate = getBazaarRowChangeRate(row);
          const changePresentation = getBazaarChangePresentation(changeRate);
          const isFavorite = isBazaarFavoriteRow(row);
          const hasOfficialUrl = row.officialUrl !== "";
          const changeArrowHtml = changePresentation.isComputable
            ? `<span class="bazaar-change-arrow ${changePresentation.toneClass}" aria-hidden="true">${changePresentation.arrow}</span>`
            : "";

          return `
            <article class="bazaar-card ${pendingBazaarFocusMaterialKey !== "" && row.materialKey === pendingBazaarFocusMaterialKey ? "is-focused" : ""}" data-bazaar-material-key="${row.materialKey}">
              <header class="bazaar-card-header">
                <div>
                  <h3>${row.materialName}</h3>
                  <p class="bazaar-category">${row.itemCategory || "-"}</p>
                </div>
                <button
                  type="button"
                  class="bazaar-favorite-button ${isFavorite ? "is-active" : ""}"
                  aria-label="${row.materialName}をお気に入り${isFavorite ? "解除" : "登録"}"
                  aria-pressed="${isFavorite ? "true" : "false"}"
                  data-bazaar-row-id="${row.id}"
                >
                  ♥
                </button>
              </header>
              <div class="bazaar-main">
                <div class="bazaar-primary">
                  <p class="bazaar-today-price">${todayPriceHtml}</p>
                  <p class="bazaar-change-rate">前日比: <span class="bazaar-change-value ${changePresentation.toneClass}">${changePresentation.text}</span>${changeArrowHtml}</p>
                  <p class="bazaar-previous-price">前日: ${formatBazaarPriceWithUnit(row.previousDayPrice)}</p>
                </div>
                <dl class="bazaar-meta">
                  <div class="bazaar-meta-item">
                    <dt>更新時刻</dt>
                    <dd>${bazaarCsvUpdatedAt}</dd>
                  </div>
                  <div class="bazaar-meta-item">
                    <dt>コメント</dt>
                    <dd class="bazaar-comment">${row.comment || "-"}</dd>
                  </div>
                </dl>
              </div>
              ${
                hasOfficialUrl
                  ? `<div class="bazaar-actions">
                      <a
                        class="bazaar-official-link-button"
                        href="${row.officialUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="${row.materialName}の公式相場サイトを新しいタブで開く"
                      >
                        公式相場サイトで確認
                      </a>
                    </div>`
                  : ""
              }
            </article>
          `;
              })
              .join("")
      }
    </div>
  `;

  const bazaarCategorySelect = bazaarListWrap.querySelector("#bazaarCategorySelect");
  if (bazaarCategorySelect) {
    bazaarCategorySelect.value = selectedBazaarCategory;
    bazaarCategorySelect.addEventListener("change", (event) => {
      selectedBazaarCategory = String(event.target.value || "");
      renderBazaarPrices();
    });
  }

  const bazaarSortSelect = bazaarListWrap.querySelector("#bazaarSortSelect");
  if (bazaarSortSelect) {
    bazaarSortSelect.value = selectedBazaarSort;
    bazaarSortSelect.addEventListener("change", (event) => {
      selectedBazaarSort = String(event.target.value || BAZAAR_SORT_OPTIONS[0].value);
      renderBazaarPrices();
    });
  }

  const bazaarFavoritesOnlyToggle = bazaarListWrap.querySelector("#bazaarFavoritesOnlyToggle");
  if (bazaarFavoritesOnlyToggle) {
    bazaarFavoritesOnlyToggle.checked = showBazaarFavoritesOnly;
    bazaarFavoritesOnlyToggle.addEventListener("change", (event) => {
      showBazaarFavoritesOnly = Boolean(event.target.checked);
      saveBazaarFavoriteState();
      renderBazaarPrices();
    });
  }

  const bazaarSearchInput = bazaarListWrap.querySelector("#bazaarSearchInput");
  if (bazaarSearchInput) {
    bazaarSearchInput.value = searchText;
    if (shouldRefocusBazaarSearchInput) {
      bazaarSearchInput.focus({ preventScroll: true });
      bazaarSearchInput.setSelectionRange(searchText.length, searchText.length);
      shouldRefocusBazaarSearchInput = false;
    }
    bazaarSearchInput.addEventListener("compositionstart", () => {
      isBazaarSearchComposing = true;
    });
    bazaarSearchInput.addEventListener("compositionend", (event) => {
      isBazaarSearchComposing = false;
      bazaarSearchText = String(event.target.value || "");
      selectedBazaarMaterialName = "";
      shouldRefocusBazaarSearchInput = true;
      renderBazaarPrices();
    });
    bazaarSearchInput.addEventListener("input", (event) => {
      bazaarSearchText = String(event.target.value || "");
      selectedBazaarMaterialName = "";
      if (isBazaarSearchComposing) return;
      shouldRefocusBazaarSearchInput = true;
      renderBazaarPrices();
    });
  }

  const bazaarSearchClearButton = bazaarListWrap.querySelector("#bazaarSearchClearButton");
  if (bazaarSearchClearButton) {
    bazaarSearchClearButton.addEventListener("click", () => {
      bazaarSearchText = "";
      selectedBazaarMaterialName = "";
      shouldRefocusBazaarSearchInput = true;
      renderBazaarPrices();
    });
  }

  bazaarListWrap.querySelectorAll(".bazaar-search-candidate-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBazaarMaterialName = String(button.textContent || "").trim();
      bazaarSearchText = selectedBazaarMaterialName;
      shouldRefocusBazaarSearchInput = true;
      renderBazaarPrices();
    });
  });

  bazaarListWrap.querySelectorAll("[data-bazaar-row-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const rowId = String(button.dataset.bazaarRowId || "");
      const row = bazaarPrices.find((item) => item.id === rowId);
      if (!row?.materialKey) return;

      if (bazaarFavoriteMaterialKeys.has(row.materialKey)) {
        bazaarFavoriteMaterialKeys.delete(row.materialKey);
      } else {
        bazaarFavoriteMaterialKeys.add(row.materialKey);
      }

      saveBazaarFavoriteState();
      renderBazaarPrices();
      renderFavoritesPage();
    });
  });

  if (pendingBazaarFocusMaterialKey !== "") {
    const focusTarget = bazaarListWrap.querySelector(`[data-bazaar-material-key="${pendingBazaarFocusMaterialKey}"]`);
    if (focusTarget) {
      focusTarget.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    pendingBazaarFocusMaterialKey = "";
  }
}

function getRecipeRowsForEquipment(equipmentId) {
  return state.recipes.filter((row) => row.equipmentId === equipmentId);
}

function getFavoriteRecipeMaterialSummary(equipmentId) {
  const rows = getRecipeRowsForEquipment(equipmentId);
  if (rows.length === 0) return "必要素材データなし";
  const summary = rows
    .slice()
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, RECIPE_SUMMARY_MATERIAL_LIMIT)
    .map((row) => {
      const material = state.materials.find((item) => item.id === row.materialId);
      const materialName = material?.name || "(削除済み素材)";
      return `${materialName}×${row.quantity}`;
    });
  return summary.join(" / ");
}

function openRecipeFromFavorite(equipmentId) {
  if (!equipmentId) return;
  selectedEquipmentId = equipmentId;
  switchTab("profit");
  navigateByAppParams({ tab: "profit", equipmentId, materialKey: "" });
  rerenderAll();
  document.getElementById("profit")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function openBazaarFromFavorite(materialKey) {
  switchTab("bazaar");
  pendingBazaarFocusMaterialKey = materialKey || "";
  bazaarSearchText = "";
  selectedBazaarMaterialName = "";
  navigateByAppParams({ tab: "bazaar", equipmentId: "", materialKey: materialKey || "" });
  renderBazaarPrices();
  document.getElementById("bazaar")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function switchFavoritesTab(targetTabId) {
  const normalizedTarget = FAVORITES_TAB_IDS.has(targetTabId) ? targetTabId : "recipes";
  activeFavoritesTabId = normalizedTarget;

  favoritesTabButtons.forEach((button) => {
    const isActive = button.dataset.favoritesTab === normalizedTarget;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
  });

  favoritesPanels.forEach((panel) => {
    const shouldShow =
      (panel.id === "favoritesRecipesPanel" && normalizedTarget === "recipes") ||
      (panel.id === "favoritesMaterialsPanel" && normalizedTarget === "materials");
    panel.classList.toggle("is-active", shouldShow);
    panel.hidden = !shouldShow;
  });
}

function renderFavoriteRecipesSection() {
  if (!favoriteRecipesListWrap) return;
  const favoriteEquipments = state.equipments
    .filter((equipment) => isRecipeFavorite(equipment))
    .sort(compareEquipmentsByBaseSort);

  if (favoriteEquipments.length === 0) {
    favoriteRecipesListWrap.innerHTML = `<p class="favorites-empty">お気に入りレシピはまだありません。</p>`;
    return;
  }

  favoriteRecipesListWrap.innerHTML = `
    <div class="favorites-list">
      ${favoriteEquipments
        .map((equipment) => {
          return `
            <article class="favorite-item-card">
              <header class="favorite-item-header">
                <button type="button" class="favorite-item-title-button" data-favorite-recipe-id="${equipment.id}">
                  ${equipment.name}
                </button>
              </header>
              <p class="favorite-item-meta">原価目安: ${formatGold(getRoundedEquipmentMaterialCost(equipment.id))}</p>
              <p class="favorite-item-meta">必要素材: ${getFavoriteRecipeMaterialSummary(equipment.id)}</p>
              <a href="#" class="favorite-link-button" data-favorite-recipe-link-id="${equipment.id}">レシピ検索で開く</a>
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  favoriteRecipesListWrap.querySelectorAll("[data-favorite-recipe-id]").forEach((button) => {
    button.addEventListener("click", () => {
      openRecipeFromFavorite(String(button.dataset.favoriteRecipeId || ""));
    });
  });
  favoriteRecipesListWrap.querySelectorAll("[data-favorite-recipe-link-id]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openRecipeFromFavorite(String(link.dataset.favoriteRecipeLinkId || ""));
    });
  });
}

function renderFavoriteMaterialsSection() {
  if (!favoriteMaterialsListWrap) return;
  const favoriteRows = getSortedBazaarRows(
    bazaarPrices.filter((row) => bazaarFavoriteMaterialKeys.has(row.materialKey)),
    "",
    "standard"
  );

  if (favoriteRows.length === 0) {
    favoriteMaterialsListWrap.innerHTML = `<p class="favorites-empty">お気に入り素材はまだありません。</p>`;
    return;
  }

  favoriteMaterialsListWrap.innerHTML = `
    <div class="favorite-materials-grid">
      ${favoriteRows
        .map((row) => {
          const changeRate = getBazaarRowChangeRate(row);
          const changePresentation = getBazaarChangePresentation(changeRate);
          const changeArrowHtml =
            changePresentation.arrow && changePresentation.isComputable
              ? `<span class="favorite-material-change-arrow ${changePresentation.toneClass}" aria-hidden="true">${changePresentation.arrow}</span>`
              : "";
          return `
            <article class="favorite-material-card">
              <header class="favorite-material-header">
                <button
                  type="button"
                  class="favorite-material-title-button"
                  data-favorite-material-key="${row.materialKey}"
                  aria-label="${row.materialName}をバザー一覧で開く"
                >
                  ${row.materialName}
                </button>
              </header>
              <p class="favorite-material-price">現在価格: ${formatBazaarPriceWithUnit(row.displayPrice)}</p>
              <p class="favorite-material-change">
                前日比:
                <span class="favorite-material-change-value ${changePresentation.toneClass}">${changePresentation.text}</span>
                ${changeArrowHtml}
              </p>
              <a href="#" class="favorite-material-link-button" data-favorite-material-link-key="${row.materialKey}">バザー一覧へ</a>
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  favoriteMaterialsListWrap.querySelectorAll("[data-favorite-material-key]").forEach((button) => {
    button.addEventListener("click", () => {
      openBazaarFromFavorite(String(button.dataset.favoriteMaterialKey || ""));
    });
  });
  favoriteMaterialsListWrap.querySelectorAll("[data-favorite-material-link-key]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openBazaarFromFavorite(String(link.dataset.favoriteMaterialLinkKey || ""));
    });
  });
}

function renderFavoritesPage() {
  renderFavoriteRecipesSection();
  renderFavoriteMaterialsSection();
  switchFavoritesTab(activeFavoritesTabId);
}

function normalizeSalePrices(salePrices, fallbackSalePrice = 0) {
  const fallback = Number(fallbackSalePrice || 0);
  return {
    star0: Number(salePrices?.star0 ?? fallback),
    star1: Number(salePrices?.star1 ?? fallback),
    star2: Number(salePrices?.star2 ?? fallback),
    star3: Number(salePrices?.star3 ?? fallback),
  };
}

function normalizeProductionCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

function normalizeStarCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

function setMaterialDataTransferMessage(message, isError = false) {
  if (!materialDataTransferMessage) return;
  materialDataTransferMessage.textContent = message;
  materialDataTransferMessage.style.color = isError ? "#d93025" : "#4f5d75";
}

function getMaterialPricePayload() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    materials: state.materials.map((material) => ({
      name: material.name,
      price: Number(material.price || 0),
    })),
  };
}

function exportMaterialPricesAsJson() {
  const payload = getMaterialPricePayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const datePart = new Date().toISOString().slice(0, 10);
  link.href = URL.createObjectURL(blob);
  link.download = `dq10-material-prices-${datePart}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);

  setMaterialDataTransferMessage(`単価ファイルを保存しました（${payload.materials.length}件）`);
}

function parseImportedMaterialPriceFile(fileName, text) {
  const normalizedFileName = fileName.toLowerCase();
  const trimmedText = text.trim();

  if (normalizedFileName.endsWith(".json")) {
    const json = JSON.parse(trimmedText);
    const rows = Array.isArray(json?.materials) ? json.materials : [];
    return rows
      .map((row) => ({ name: String(row?.name ?? "").trim(), price: Number(row?.price ?? 0) }))
      .filter((row) => row.name !== "" && Number.isFinite(row.price));
  }

  if (normalizedFileName.endsWith(".csv")) {
    const lines = trimmedText
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return [];
    const headers = parseCsvLine(lines[0]);
    const nameIndex = headers.findIndex((header) => ["name", "materialName", "素材名"].includes(header));
    const priceIndex = headers.findIndex((header) => ["price", "単価", "価格"].includes(header));
    if (nameIndex < 0 || priceIndex < 0) {
      throw new Error("CSVヘッダーは name/price（または materialName/price）形式にしてください");
    }

    return lines
      .slice(1)
      .map((line) => parseCsvLine(line))
      .map((columns) => ({ name: String(columns[nameIndex] ?? "").trim(), price: Number(columns[priceIndex] ?? 0) }))
      .filter((row) => row.name !== "" && Number.isFinite(row.price));
  }

  throw new Error("JSON または CSV ファイルを選択してください");
}

function applyImportedMaterialPrices(rows) {
  const materialByName = new Map(state.materials.map((material) => [material.name, material]));
  let appliedCount = 0;

  rows.forEach((row) => {
    const target = materialByName.get(row.name);
    if (!target) return;
    target.price = Math.max(0, Math.floor(row.price));
    appliedCount += 1;
  });

  if (appliedCount === 0) {
    setMaterialDataTransferMessage("一致する素材名がなかったため、反映は0件でした。", true);
    return;
  }

  saveData();
  rerenderAll();
  setMaterialDataTransferMessage(`単価を読込しました（一致素材 ${appliedCount}件を反映）`);
}

function switchTab(target) {
  const normalizedTarget = TAB_IDS.has(target) ? target : "profit";
  activeTabId = normalizedTarget;
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === normalizedTarget));
  tabContents.forEach((tab) => tab.classList.toggle("active", tab.id === normalizedTarget));
}

function buildAppQueryParams(nextValues = {}) {
  const currentParams = new URLSearchParams(window.location.search);
  const tab = TAB_IDS.has(nextValues.tab) ? nextValues.tab : TAB_IDS.has(currentParams.get("tab")) ? currentParams.get("tab") : activeTabId;
  const params = new URLSearchParams();
  if (tab && tab !== "profit") params.set("tab", tab);
  if (nextValues.equipmentId) params.set("equipmentId", nextValues.equipmentId);
  if (nextValues.materialKey) params.set("materialKey", nextValues.materialKey);
  return params;
}

function navigateByAppParams(nextValues = {}, options = {}) {
  const { replace = false } = options;
  const params = buildAppQueryParams(nextValues);
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (replace) {
    window.history.replaceState({}, "", nextUrl);
  } else {
    window.history.pushState({}, "", nextUrl);
  }
}

function applyAppRouteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (TAB_IDS.has(tab)) {
    switchTab(tab);
  } else {
    switchTab("profit");
  }

  const equipmentId = String(params.get("equipmentId") || "").trim();
  if (equipmentId && state.equipments.some((equipment) => equipment.id === equipmentId)) {
    selectedEquipmentId = equipmentId;
  }

  pendingBazaarFocusMaterialKey = String(params.get("materialKey") || "").trim();
}

function setMenuOpen(isOpen) {
  if (!sideMenu || !menuOverlay || !menuToggleButton) return;
  sideMenu.classList.toggle("is-open", isOpen);
  sideMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  menuToggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menuOverlay.hidden = !isOpen;
}

function scrollToBlock(blockId) {
  if (!blockId) return;
  switchTab(blockId);
  navigateByAppParams({
    tab: blockId,
    equipmentId: blockId === "profit" ? selectedEquipmentId : "",
    materialKey: "",
  });
  const target = document.getElementById(blockId);
  if (!target) return;
  target.scrollIntoView({ block: "start", behavior: "smooth" });
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

favoritesTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchFavoritesTab(button.dataset.favoritesTab);
  });
});

if (menuToggleButton) {
  menuToggleButton.addEventListener("click", () => {
    const next = menuToggleButton.getAttribute("aria-expanded") !== "true";
    setMenuOpen(next);
  });
}

if (menuOverlay) {
  menuOverlay.addEventListener("click", () => {
    setMenuOpen(false);
  });
}

sideMenuItems.forEach((item) => {
  item.addEventListener("click", () => {
    const targetId = item.dataset.menuTarget || "";
    scrollToBlock(targetId);
    setMenuOpen(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

window.addEventListener("popstate", () => {
  applyAppRouteFromUrl();
  rerenderAll();
});

function renderEquipmentSelectors() {
  if (!equipmentSelect || !recipeEquipmentSelect) return;

  if (recipeSortSelect) {
    recipeSortSelect.innerHTML = "";
    RECIPE_SORT_OPTIONS.forEach((option) => {
      recipeSortSelect.add(new Option(option.label, option.value));
    });
    if (!RECIPE_SORT_OPTIONS.some((option) => option.value === selectedRecipeSort)) {
      selectedRecipeSort = RECIPE_SORT_OPTIONS[0].value;
    }
    recipeSortSelect.value = selectedRecipeSort;
  }

  const { filteredEquipments, matchedRecipeByEquipmentId, normalizedMaterialKeyword } = getFilteredEquipmentContext();

  equipmentSelect.innerHTML = "";
  recipeEquipmentSelect.innerHTML = "";

  if (filteredEquipments.length === 0) {
    const emptyLabel =
      selectedCategory === RECIPE_FAVORITE_CATEGORY_VALUE
        ? "お気に入り登録済み装備がありません"
        : "条件に一致する装備がありません";
    equipmentSelect.add(new Option(emptyLabel, ""));
    equipmentSelect.disabled = true;
  } else {
    equipmentSelect.disabled = false;
    filteredEquipments.forEach((equipment) => {
      const roundedMaterialCost = getRoundedEquipmentMaterialCost(equipment.id);
      let label = `${equipment.name}（原価: ${roundedMaterialCost.toLocaleString("ja-JP")} G）`;
      if (normalizedMaterialKeyword !== "") {
        const matchedMaterials = matchedRecipeByEquipmentId.get(equipment.id) || [];
        if (matchedMaterials.length > 0) {
          const details = matchedMaterials.map((m) => `${m.materialName}×${m.quantity}`).join(" / ");
          label = `${label}（${details}）`;
        }
      }
      const option = new Option(label, equipment.id);
      equipmentSelect.add(option);
    });
  }

  // レシピ管理側の装備選択は従来どおり全件表示にしておく
  state.equipments.forEach((equipment) => {
    recipeEquipmentSelect.add(new Option(equipment.name, equipment.id));
  });

  // 現在選択中の装備がフィルタ結果に存在しない場合は先頭に寄せる
  if (!filteredEquipments.some((e) => e.id === selectedEquipmentId)) {
    selectedEquipmentId = filteredEquipments[0]?.id || "";
  }

  if (filteredEquipments.length > 0 && !state.equipments.some((e) => e.id === selectedEquipmentId)) {
    selectedEquipmentId = state.equipments[0]?.id || "";
  }
  equipmentSelect.value = selectedEquipmentId;
  recipeEquipmentSelect.value = selectedEquipmentId;
  renderRecipeFavoriteAction();
}

function renderFilterSelectors() {
  if (!craftsmanFilterSelect || !categoryFilterSelect) return;

  // CSV由来の装備から、職人選択肢（重複なし）を作る
  const craftsmen = Array.from(new Set(state.equipments.map((e) => e.craftsman).filter(Boolean)));
  // category は「選択中の職人」に応じて候補を変える。
  // - 職人未選択: 全カテゴリ
  // - 職人選択済み: その職人のカテゴリのみ
  const categories = Array.from(
    new Set(
      state.equipments
        .filter((e) => selectedCraftsman === "" || e.craftsman === selectedCraftsman)
        .map((e) => e.category)
        .filter(Boolean)
    )
  );

  // 既存選択を崩しにくくするため、毎回再描画して値を戻す流れにしています。
  craftsmanFilterSelect.innerHTML = "";
  categoryFilterSelect.innerHTML = "";

  craftsmanFilterSelect.add(new Option("全職人", ""));
  categoryFilterSelect.add(new Option("全ジャンル", ""));

  craftsmen.forEach((craftsman) => {
    craftsmanFilterSelect.add(new Option(craftsman, craftsman));
  });

  categories.forEach((category) => {
    categoryFilterSelect.add(new Option(category, category));
  });
  categoryFilterSelect.add(new Option("お気に入り", RECIPE_FAVORITE_CATEGORY_VALUE));

  // 選択中の値が候補になければ未選択（全件）へ戻す。
  // 職人を変更したときにカテゴリが無効化された場合も、ここで自然に「全ジャンル」へ戻ります。
  if (!craftsmen.includes(selectedCraftsman)) selectedCraftsman = "";
  if (selectedCategory !== RECIPE_FAVORITE_CATEGORY_VALUE && !categories.includes(selectedCategory)) selectedCategory = "";

  craftsmanFilterSelect.value = selectedCraftsman;
  categoryFilterSelect.value = selectedCategory;
}

function renderMaterialSelector() {
  if (!recipeMaterialSelect) return;

  recipeMaterialSelect.innerHTML = "";
  state.materials.forEach((material) => {
    recipeMaterialSelect.add(new Option(material.name, material.id));
  });
}

function getSelectedEquipment() {
  return state.equipments.find((e) => e.id === selectedEquipmentId);
}

function getRecipeFavoriteKey(equipment) {
  if (equipment?.id) return `id:${equipment.id}`;
  if (equipment?.name) return `name:${equipment.name}`;
  return "";
}

function isRecipeFavorite(equipment) {
  const key = getRecipeFavoriteKey(equipment);
  return key !== "" && recipeFavoriteKeys.has(key);
}

function compareEquipmentsByBaseSort(a, b) {
  const costDiff = getRoundedEquipmentMaterialCost(a.id) - getRoundedEquipmentMaterialCost(b.id);
  if (selectedRecipeSort === "cost_asc") {
    if (costDiff !== 0) return costDiff;
  } else {
    if (costDiff !== 0) return -costDiff;
  }
  return a.name.localeCompare(b.name, "ja");
}

function getFilteredEquipmentContext() {
  const normalizedMaterialKeyword = materialSearchKeyword.trim().toLowerCase();
  const matchedRecipeByEquipmentId = new Map();

  if (normalizedMaterialKeyword !== "") {
    state.recipes.forEach((row) => {
      const material = state.materials.find((m) => m.id === row.materialId);
      const materialName = material?.name?.trim().toLowerCase() ?? "";
      if (!materialName.includes(normalizedMaterialKeyword)) return;

      if (!matchedRecipeByEquipmentId.has(row.equipmentId)) {
        matchedRecipeByEquipmentId.set(row.equipmentId, []);
      }
      matchedRecipeByEquipmentId.get(row.equipmentId).push({
        materialName: material?.name ?? "",
        quantity: row.quantity,
      });
    });
  }

  const filteredEquipments = state.equipments
    .filter((equipment) => {
      const matchesMaterial = normalizedMaterialKeyword === "" || matchedRecipeByEquipmentId.has(equipment.id);
      const matchesFavoriteCategory =
        selectedCategory !== RECIPE_FAVORITE_CATEGORY_VALUE || isRecipeFavorite(equipment);
      return (
        (selectedCraftsman === "" || equipment.craftsman === selectedCraftsman) &&
        (selectedCategory === "" ||
          selectedCategory === RECIPE_FAVORITE_CATEGORY_VALUE ||
          equipment.category === selectedCategory) &&
        matchesFavoriteCategory &&
        (equipmentSearchKeyword === "" || equipment.name.toLowerCase().includes(equipmentSearchKeyword.toLowerCase())) &&
        matchesMaterial
      );
    })
    .sort((a, b) => {
      if (selectedRecipeSort === "favorite_first") {
        const favoriteDiff = Number(isRecipeFavorite(b)) - Number(isRecipeFavorite(a));
        if (favoriteDiff !== 0) return favoriteDiff;
      }
      return compareEquipmentsByBaseSort(a, b);
    });

  return { filteredEquipments, matchedRecipeByEquipmentId, normalizedMaterialKeyword };
}

function renderRecipeFavoriteAction() {
  if (!recipeFavoriteActionWrap) return;

  const equipment = getSelectedEquipment();
  if (!equipment) {
    recipeFavoriteActionWrap.innerHTML = `
      <div class="recipe-favorite-action">
        <button type="button" class="recipe-favorite-toggle-button" disabled>☆ お気に入り登録</button>
        <p class="helper-text">装備を選択すると、お気に入り登録できます。</p>
      </div>
    `;
    return;
  }

  const isFavorite = isRecipeFavorite(equipment);
  recipeFavoriteActionWrap.innerHTML = `
    <div class="recipe-favorite-action">
      <button
        type="button"
        class="recipe-favorite-toggle-button ${isFavorite ? "is-active" : ""}"
        data-toggle-selected-recipe-favorite="true"
        aria-label="${equipment.name}をお気に入り${isFavorite ? "解除" : "登録"}"
      >
        ${isFavorite ? "★ お気に入り解除" : "☆ お気に入り登録"}
      </button>
    </div>
  `;

  const toggleButton = recipeFavoriteActionWrap.querySelector("[data-toggle-selected-recipe-favorite]");
  if (!toggleButton) return;
  toggleButton.addEventListener("click", () => {
    const favoriteKey = getRecipeFavoriteKey(equipment);
    if (!favoriteKey) return;
    if (recipeFavoriteKeys.has(favoriteKey)) {
      recipeFavoriteKeys.delete(favoriteKey);
    } else {
      recipeFavoriteKeys.add(favoriteKey);
    }
    saveRecipeFavoriteState();
    rerenderAll();
  });
}

function getSalePricesForEquipment(equipment) {
  return normalizeSalePrices(equipment?.salePrices, Number(equipment?.salePrice || 0));
}

function getRecipeRowsForSelectedEquipment() {
  return state.recipes.filter((row) => row.equipmentId === selectedEquipmentId);
}

function getToolsForSelectedEquipment() {
  const profession = getSelectedEquipment()?.craftsman;
  if (!profession) return [];
  return (state.tools || [])
    .filter((tool) => tool.profession === profession)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function getSelectedTool() {
  return (state.tools || []).find((tool) => tool.id === selectedToolId);
}

function getToolPurchasePrice(toolId) {
  if (!toolId) return 0;
  const data = (state.toolPurchasePrices || []).find((item) => item.toolId === toolId);
  return Number(data?.purchasePrice || 0);
}

function setToolPurchasePrice(toolId, purchasePrice) {
  if (!toolId) return;
  if (!Array.isArray(state.toolPurchasePrices)) state.toolPurchasePrices = [];
  const found = state.toolPurchasePrices.find((item) => item.toolId === toolId);
  if (found) {
    found.purchasePrice = purchasePrice;
    return;
  }
  state.toolPurchasePrices.push({ toolId, purchasePrice });
}

// 単価は「一時単価」があればそれを優先、無ければ管理用単価を使います。
function getEffectiveMaterialPrice(materialId) {
  if (temporaryMaterialPrices.has(materialId)) {
    return temporaryMaterialPrices.get(materialId) || 0;
  }
  const material = state.materials.find((m) => m.id === materialId);
  return material?.price || 0;
}

function getEquipmentMaterialCost(equipmentId) {
  return state.recipes
    .filter((row) => row.equipmentId === equipmentId)
    .reduce((sum, row) => sum + getEffectiveMaterialPrice(row.materialId) * row.quantity, 0);
}

function getRoundedEquipmentMaterialCost(equipmentId) {
  return Math.round(getEquipmentMaterialCost(equipmentId));
}

function getProductionCountForCalculation() {
  return normalizeProductionCount(productionCountInput?.value);
}

function normalizeProductionCountInput() {
  if (!productionCountInput) return;
  const normalized = normalizeProductionCount(productionCountInput.value);
  productionCountInput.value = String(normalized);
}

function renderRecipeTable() {
  if (!recipeTableWrap) return;

  const rows = getRecipeRowsForSelectedEquipment();
  if (rows.length === 0) {
    recipeTableWrap.innerHTML = "<p>この装備のレシピが未登録です。</p>";
    return;
  }

  const productionCount = getProductionCountForCalculation();
  const htmlRows = rows
    .map((row) => {
      const material = state.materials.find((m) => m.id === row.materialId);
      const price = getEffectiveMaterialPrice(row.materialId);
      const totalRequired = row.quantity * productionCount;
      const subtotal = price * totalRequired;
      return {
        table: `
          <tr>
            <td>${material?.name ?? "(削除済み素材)"}</td>
            <td>${row.quantity}</td>
            <td>${productionCount}</td>
            <td>${totalRequired}</td>
            <td>
              <input
                class="inline-input"
                type="number"
                min="0"
                step="1"
                value="${price}"
                data-temp-material-price-id="${row.materialId}"
              >
            </td>
            <td>${formatGold(subtotal)}</td>
          </tr>
        `,
        card: `
          <article class="recipe-material-card">
            <h4 class="recipe-material-name">${material?.name ?? "(削除済み素材)"}</h4>
            <p class="recipe-material-count-line">
              <span>必要 <strong>${row.quantity}</strong></span>
              <span>/</span>
              <span>制作 <strong>${productionCount}</strong></span>
              <span>/</span>
              <span>合計 <strong>${totalRequired}</strong></span>
            </p>
            <div class="recipe-material-price-row">
              <label class="recipe-material-price-field recipe-material-price-field--embedded">
                <span class="recipe-material-price-prefix" aria-hidden="true">単価</span>
                <input
                  class="material-price-input-mobile material-price-input-mobile--with-prefix"
                  type="number"
                  min="0"
                  step="1"
                  value="${price}"
                  aria-label="単価"
                  data-temp-material-price-id="${row.materialId}"
                >
              </label>
              <p class="recipe-material-subtotal">
                <span>小計</span>
                <strong>${formatGold(subtotal)}</strong>
              </p>
            </div>
          </article>
        `,
      };
    });

  recipeTableWrap.innerHTML = `
    <div class="recipe-table-desktop">
      <table class="table">
        <thead>
          <tr>
            <th>素材名</th>
            <th>1個あたり必要数</th>
            <th>制作数</th>
            <th>総必要数</th>
            <th>単価</th>
            <th>総小計</th>
          </tr>
        </thead>
        <tbody>${htmlRows.map((row) => row.table).join("")}</tbody>
      </table>
    </div>
    <div class="recipe-cards-mobile">
      ${htmlRows.map((row) => row.card).join("")}
    </div>
  `;

  // 利益計算画面でだけ有効な一時単価の変更ハンドラ。
  // ここではsaveData()しないことで、素材価格管理の単価を汚さないようにしています。
  recipeTableWrap.querySelectorAll("[data-temp-material-price-id]").forEach((input) => {
    input.addEventListener("change", (e) => {
      const materialId = e.target.dataset.tempMaterialPriceId;
      const nextPrice = Number(e.target.value || 0);
      temporaryMaterialPrices.set(materialId, nextPrice);
      renderRecipeTable();
      calcAndRenderSummary();
    });
  });
}

function renderToolSection() {
  if (!toolWrap || !toolSelect || !toolDurabilityInput || !toolPurchasePriceInput) return;

  const tools = getToolsForSelectedEquipment();
  toolSelect.innerHTML = "";

  if (tools.length === 0) {
    selectedToolId = "";
    toolSelect.add(new Option("該当する道具がありません", ""));
    toolSelect.disabled = true;
    toolPurchasePriceInput.disabled = true;
    toolPurchasePriceInput.value = "";
    toolDurabilityInput.value = "";
    return;
  }

  toolSelect.disabled = false;
  toolPurchasePriceInput.disabled = false;
  toolSelect.add(new Option("道具を選択", ""));
  tools.forEach((tool) => {
    toolSelect.add(new Option(tool.toolName, tool.id));
  });

  if (!tools.some((tool) => tool.id === selectedToolId)) {
    selectedToolId = "";
  }

  toolSelect.value = selectedToolId;
  const selectedTool = getSelectedTool();
  toolDurabilityInput.value = selectedTool ? String(selectedTool.durability) : "";
  toolPurchasePriceInput.value = selectedTool ? String(getToolPurchasePrice(selectedTool.id)) : "";
}

function applyProfitColor(element, value) {
  if (!element) return;
  element.classList.toggle("is-positive", value >= 0);
  element.classList.toggle("is-negative", value < 0);
}

function calcAndRenderSummary() {
  const eq = getSelectedEquipment();
  const productionCount = getProductionCountForCalculation();
  const countStar0 = normalizeStarCount(countStar0Input?.value);
  const countStar1 = normalizeStarCount(countStar1Input?.value);
  const countStar2 = normalizeStarCount(countStar2Input?.value);
  const countStar3 = normalizeStarCount(countStar3Input?.value);
  if (countStar0Input) countStar0Input.value = String(countStar0);
  if (countStar1Input) countStar1Input.value = String(countStar1);
  if (countStar2Input) countStar2Input.value = String(countStar2);
  if (countStar3Input) countStar3Input.value = String(countStar3);

  const salePrices = getSalePricesForEquipment(eq);
  const perItemMaterialCost = getRecipeRowsForSelectedEquipment().reduce(
    (sum, row) => sum + getEffectiveMaterialPrice(row.materialId) * row.quantity,
    0
  );
  const tool = getSelectedTool();
  const toolPurchasePrice = tool ? getToolPurchasePrice(tool.id) : 0;
  const perCraftToolCost = tool && tool.durability > 0 ? toolPurchasePrice / tool.durability : 0;
  const totalCount = countStar0 + countStar1 + countStar2 + countStar3;
  const feeRate = Number(state.feeRate || 5) / 100;

  const netSalePriceStar0 = salePrices.star0 * (1 - feeRate);
  const netSalePriceStar1 = salePrices.star1 * (1 - feeRate);
  const netSalePriceStar2 = salePrices.star2 * (1 - feeRate);
  const netSalePriceStar3 = salePrices.star3 * (1 - feeRate);
  const profitStar0 = netSalePriceStar0 - perItemMaterialCost - perCraftToolCost;
  const profitStar1 = netSalePriceStar1 - perItemMaterialCost - perCraftToolCost;
  const profitStar2 = netSalePriceStar2 - perItemMaterialCost - perCraftToolCost;
  const profitStar3 = netSalePriceStar3 - perItemMaterialCost - perCraftToolCost;
  const salesStar0 = salePrices.star0 * countStar0;
  const salesStar1 = salePrices.star1 * countStar1;
  const salesStar2 = salePrices.star2 * countStar2;
  const salesStar3 = salePrices.star3 * countStar3;
  const totalProfitStar0 = profitStar0 * countStar0;
  const totalProfitStar1 = profitStar1 * countStar1;
  const totalProfitStar2 = profitStar2 * countStar2;
  const totalProfitStar3 = profitStar3 * countStar3;
  const totalSales = salesStar0 + salesStar1 + salesStar2 + salesStar3;
  const totalFee = totalSales * feeRate;
  const averageNetSales = totalCount > 0 ? (totalSales - totalFee) / totalCount : 0;
  const totalProfit = totalProfitStar0 + totalProfitStar1 + totalProfitStar2 + totalProfitStar3;

  if (perCraftToolCostEl) perCraftToolCostEl.textContent = formatGold(perCraftToolCost);
  if (totalMaterialCostEl) totalMaterialCostEl.textContent = formatGold(perItemMaterialCost);
  if (profitStar0ValueEl) profitStar0ValueEl.textContent = formatGold(profitStar0);
  if (profitStar1ValueEl) profitStar1ValueEl.textContent = formatGold(profitStar1);
  if (profitStar2ValueEl) profitStar2ValueEl.textContent = formatGold(profitStar2);
  if (profitStar3ValueEl) profitStar3ValueEl.textContent = formatGold(profitStar3);
  if (countStar0ValueEl) countStar0ValueEl.textContent = String(countStar0);
  if (countStar1ValueEl) countStar1ValueEl.textContent = String(countStar1);
  if (countStar2ValueEl) countStar2ValueEl.textContent = String(countStar2);
  if (countStar3ValueEl) countStar3ValueEl.textContent = String(countStar3);
  if (totalProfitStar0ValueEl) totalProfitStar0ValueEl.textContent = formatGold(totalProfitStar0);
  if (totalProfitStar1ValueEl) totalProfitStar1ValueEl.textContent = formatGold(totalProfitStar1);
  if (totalProfitStar2ValueEl) totalProfitStar2ValueEl.textContent = formatGold(totalProfitStar2);
  if (totalProfitStar3ValueEl) totalProfitStar3ValueEl.textContent = formatGold(totalProfitStar3);
  if (totalFeeValueEl) totalFeeValueEl.textContent = formatGold(totalFee);
  if (averageNetSalesValueEl) averageNetSalesValueEl.textContent = formatGold(averageNetSales);
  if (totalProfitValueEl) totalProfitValueEl.textContent = formatGold(totalProfit);

  if (productionCountWarningEl) {
    productionCountWarningEl.textContent =
      totalCount === productionCount
        ? ""
        : `警告: ★個数合計（${totalCount}）と制作数（${productionCount}）が一致していません。`;
  }

  applyProfitColor(profitStar0ValueEl, profitStar0);
  applyProfitColor(profitStar1ValueEl, profitStar1);
  applyProfitColor(profitStar2ValueEl, profitStar2);
  applyProfitColor(profitStar3ValueEl, profitStar3);
  applyProfitColor(totalProfitStar0ValueEl, totalProfitStar0);
  applyProfitColor(totalProfitStar1ValueEl, totalProfitStar1);
  applyProfitColor(totalProfitStar2ValueEl, totalProfitStar2);
  applyProfitColor(totalProfitStar3ValueEl, totalProfitStar3);
  applyProfitColor(totalProfitValueEl, totalProfit);
}

function renderMaterialList() {
  if (!materialListWrap) return;

  const rows = state.materials
    .map(
      (m) => `
      <tr>
        <td>${m.name}</td>
        <td><input class="inline-input" type="number" min="0" step="1" value="${m.price}" data-material-price-id="${m.id}"></td>
      </tr>`
    )
    .join("");

  materialListWrap.innerHTML = `
    <table class="table">
      <thead><tr><th>素材名</th><th>価格（G）</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  materialListWrap.querySelectorAll("[data-material-price-id]").forEach((input) => {
    input.addEventListener("change", (e) => {
      const id = e.target.dataset.materialPriceId;
      const material = state.materials.find((m) => m.id === id);
      if (!material) return;
      material.price = Number(e.target.value || 0);
      saveData();
      renderRecipeTable();
      calcAndRenderSummary();
    });
  });
}

function renderRecipeAdminList() {
  if (!recipeAdminListWrap) return;

  const rows = state.recipes
    .map((r) => {
      const eq = state.equipments.find((e) => e.id === r.equipmentId);
      const mat = state.materials.find((m) => m.id === r.materialId);
      return `
      <tr>
        <td>${eq?.name ?? "(削除済み装備)"}</td>
        <td>${mat?.name ?? "(削除済み素材)"}</td>
        <td>${r.quantity}</td>
        <td><button class="small-btn" data-delete-recipe-id="${r.id}">削除</button></td>
      </tr>`;
    })
    .join("");

  recipeAdminListWrap.innerHTML = `
    <table class="table">
      <thead><tr><th>装備</th><th>素材</th><th>個数</th><th>操作</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  recipeAdminListWrap.querySelectorAll("[data-delete-recipe-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteRecipeId;
      state.recipes = state.recipes.filter((r) => r.id !== id);
      saveData();
      rerenderAll();
    });
  });
}

function rerenderAll() {
  renderFilterSelectors();
  renderEquipmentSelectors();
  renderMaterialSelector();

  const eq = getSelectedEquipment();
  const salePrices = getSalePricesForEquipment(eq);
  if (salePriceStar0Input) salePriceStar0Input.value = salePrices.star0;
  if (salePriceStar1Input) salePriceStar1Input.value = salePrices.star1;
  if (salePriceStar2Input) salePriceStar2Input.value = salePrices.star2;
  if (salePriceStar3Input) salePriceStar3Input.value = salePrices.star3;
  renderRecipeTable();
  renderToolSection();
  renderMaterialList();
  renderRecipeAdminList();
  calcAndRenderSummary();
  renderBazaarPrices();
  renderFavoritesPage();
}

// --- イベント定義 ---
if (equipmentSelect) {
  equipmentSelect.addEventListener("change", (e) => {
    selectedEquipmentId = e.target.value;
    if (activeTabId === "profit") {
      navigateByAppParams({ tab: "profit", equipmentId: selectedEquipmentId, materialKey: "" });
    }
    const eq = getSelectedEquipment();
    const salePrices = getSalePricesForEquipment(eq);
    if (salePriceStar0Input) salePriceStar0Input.value = salePrices.star0;
    if (salePriceStar1Input) salePriceStar1Input.value = salePrices.star1;
    if (salePriceStar2Input) salePriceStar2Input.value = salePrices.star2;
    if (salePriceStar3Input) salePriceStar3Input.value = salePrices.star3;
    renderRecipeTable();
    renderToolSection();
    calcAndRenderSummary();
    renderEquipmentSelectors();
  });
}

if (recipeSortSelect) {
  recipeSortSelect.addEventListener("change", (e) => {
    selectedRecipeSort = e.target.value;
    renderEquipmentSelectors();
  });
}

if (toolSelect) {
  toolSelect.addEventListener("change", (e) => {
    selectedToolId = e.target.value || "";
    const tool = getSelectedTool();
    if (toolDurabilityInput) toolDurabilityInput.value = tool ? String(tool.durability) : "";
    if (toolPurchasePriceInput) toolPurchasePriceInput.value = tool ? String(getToolPurchasePrice(tool.id)) : "";
    calcAndRenderSummary();
  });
}

if (toolPurchasePriceInput) {
  toolPurchasePriceInput.addEventListener("change", (e) => {
    const purchasePrice = Number(e.target.value || 0);
    if (selectedToolId) {
      setToolPurchasePrice(selectedToolId, purchasePrice);
      saveData();
    }
    calcAndRenderSummary();
  });
}

// 装備検索欄の入力に合わせて候補を絞り込みます。
if (equipmentSearchInput) {
  equipmentSearchInput.addEventListener("input", (e) => {
    equipmentSearchKeyword = e.target.value.trim();
    rerenderAll();
  });
}

if (materialSearchInput) {
  materialSearchInput.addEventListener("input", (e) => {
    materialSearchKeyword = e.target.value.trim();
    rerenderAll();
  });
}

if (craftsmanFilterSelect) {
  craftsmanFilterSelect.addEventListener("change", (e) => {
    selectedCraftsman = e.target.value;
    rerenderAll();
  });
}

if (categoryFilterSelect) {
  categoryFilterSelect.addEventListener("change", (e) => {
    selectedCategory = e.target.value;
    rerenderAll();
  });
}

[
  { input: salePriceStar0Input, key: "star0" },
  { input: salePriceStar1Input, key: "star1" },
  { input: salePriceStar2Input, key: "star2" },
  { input: salePriceStar3Input, key: "star3" },
].forEach(({ input, key }) => {
  if (!input) return;
  input.addEventListener("change", (e) => {
    const eq = getSelectedEquipment();
    if (!eq) return;
    eq.salePrices = getSalePricesForEquipment(eq);
    eq.salePrices[key] = Number(e.target.value || 0);
    saveData();
    calcAndRenderSummary();
  });
});

if (productionCountInput) {
  productionCountInput.addEventListener("input", () => {
    renderRecipeTable();
    calcAndRenderSummary();
  });
  productionCountInput.addEventListener("blur", () => {
    normalizeProductionCountInput();
    renderRecipeTable();
    calcAndRenderSummary();
  });
  productionCountInput.addEventListener("change", () => {
    normalizeProductionCountInput();
    renderRecipeTable();
    calcAndRenderSummary();
  });
}

[
  countStar0Input,
  countStar1Input,
  countStar2Input,
  countStar3Input,
].forEach((input) => {
  if (!input) return;
  input.addEventListener("input", () => {
    calcAndRenderSummary();
  });
  input.addEventListener("change", () => {
    input.value = String(normalizeStarCount(input.value));
    calcAndRenderSummary();
  });
});

if (materialForm) {
  materialForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = getRequiredElementById("newMaterialName");
    const priceInput = getRequiredElementById("newMaterialPrice");
    const name = nameInput?.value.trim() ?? "";
    const price = Number(priceInput?.value || 0);
    if (!name) return;

    state.materials.push({ id: makeMaterialId(name), name, price });
    saveData();
    materialForm.reset();
    rerenderAll();
  });
}

if (equipmentForm) {
  equipmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = getRequiredElementById("newEquipmentName");
    const priceInput = getRequiredElementById("newEquipmentPrice");
    const name = nameInput?.value.trim() ?? "";
    const salePrice = Number(priceInput?.value || 0);
    if (!name) return;

    // CSV外で手動追加した装備は、絞り込み対象の値を空で持たせます。
    // これによりデータ構造をそろえつつ、既存画面への影響を最小化できます。
    const added = {
      id: makeEquipmentId(name),
      name,
      salePrices: normalizeSalePrices(null, salePrice),
      craftsman: "",
      category: "",
    };
    state.equipments.push(added);
    selectedEquipmentId = added.id;
    saveData();
    equipmentForm.reset();
    rerenderAll();
  });
}

if (recipeForm) {
  recipeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const quantityInput = getRequiredElementById("recipeQuantity");
    const equipmentId = recipeEquipmentSelect?.value ?? "";
    const materialId = recipeMaterialSelect?.value ?? "";
    const quantity = Number(quantityInput?.value || 0);
    if (!equipmentId || !materialId || quantity <= 0) return;

    // 同じ装備+素材があれば個数を加算
    const existing = state.recipes.find((r) => r.equipmentId === equipmentId && r.materialId === materialId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      state.recipes.push({ id: crypto.randomUUID(), equipmentId, materialId, quantity });
    }

    selectedEquipmentId = equipmentId;
    saveData();
    recipeForm.reset();
    rerenderAll();
  });
}

if (exportMaterialPricesButton) {
  exportMaterialPricesButton.addEventListener("click", () => {
    exportMaterialPricesAsJson();
  });
}

if (importMaterialPricesButton && importMaterialPricesInput) {
  importMaterialPricesButton.addEventListener("click", () => {
    importMaterialPricesInput.click();
  });

  importMaterialPricesInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseImportedMaterialPriceFile(file.name, text);
      applyImportedMaterialPrices(rows);
    } catch (error) {
      console.error(error);
      setMaterialDataTransferMessage("読込に失敗しました。ファイル形式を確認してください。", true);
    } finally {
      importMaterialPricesInput.value = "";
    }
  });
}

// 初期化処理。
// 1) CSVを読み込む
// 2) ローカル保存の価格情報をマージ
// 3) 画面描画
async function initialize() {
  const storedData = loadStoredData();
  const favoriteState = loadBazaarFavoriteState();
  const loadedRecipeFavoriteKeys = loadRecipeFavoriteState();

  try {
    const csvData = await loadDataFromCsv();
    state = mergeWithStoredData(csvData, storedData);
  } catch (error) {
    console.warn("recipe.csv の読み込みに失敗したため、フォールバックデータを使用します", error);
    state = mergeWithStoredData(structuredClone(defaultData), storedData);
  }

  try {
    bazaarPrices = await loadBazaarPricesCsv();
  } catch (error) {
    console.error(`bazaar_prices.csv の読み込みに失敗しました: path=${BAZAAR_CSV_PATH}`, error);
    bazaarPrices = [];
  }

  bazaarCsvUpdatedAt = await loadBazaarLastUpdatedAt();

  // CSV側が空でも初期表示で一覧が空にならないようフォールバックを維持
  if ((state.equipments || []).length === 0 || (state.recipes || []).length === 0) {
    state = mergeWithStoredData(structuredClone(defaultData), storedData);
  }

  selectedEquipmentId = state.equipments[0]?.id || "";
  selectedToolId = "";
  showBazaarFavoritesOnly = favoriteState.showFavoritesOnly;
  bazaarFavoriteMaterialKeys = favoriteState.favoriteMaterialKeys;
  recipeFavoriteKeys = loadedRecipeFavoriteKeys;
  applyAppRouteFromUrl();
  navigateByAppParams(
    {
      tab: activeTabId,
      equipmentId: activeTabId === "profit" ? selectedEquipmentId : "",
      materialKey: activeTabId === "bazaar" ? pendingBazaarFocusMaterialKey : "",
    },
    { replace: true }
  );
  saveData();
  rerenderAll();
}

initialize();
