// DQ10職人ツールの最小実装。
// 日本語コメントを多めに入れて、将来の拡張をしやすくしています。

const STORAGE_KEY = "dq10_toolweb_data_v1";
// recipe.csv の配置先。data ディレクトリ配下を正として扱います。
const RECIPE_CSV_PATH = "./data/recipe.csv";
const TOOLS_CSV_PATH = "./data/tools.csv";
const CRAFT_IDEAL_VALUES_CSV_PATH = "./data/craft_ideal_values.csv";
const BAZAAR_CSV_PATH = "./data/bazaar_prices.csv";
const BAZAAR_HISTORY_CSV_PATH = "./data/bazaar_prices_history.csv";
const PRESENT_CODES_CSV_PATH = "./data/datapresent_codes.csv";
const FIELD_FARMING_CSV_PATH = "./data/field_farming_monsters.csv";
const ORB_DATA_CSV_PATH = "./data/orb_data.csv";
const MONSTER_DATA_CSV_PATH = "./data/monster_data.csv";
const ORB_MONSTERS_CSV_PATH = "./data/orb_monsters.csv";
const WHITE_BOX_CSV_PATH = "./data/white_box.csv";
const EQUIPMENT_DB_CSV_PATH = "./data/equipment_data.csv";
const UPDATES_JSON_PATH = "./data/updates.json";
const UI_SETTINGS_JSON_PATH = "./data/ui-settings.json";
const CONTENT_JSON_PATH = "./data/content.json";
const OFFICIAL_BAZAAR_TOP_URL = "https://dqx-souba.game-blog.app/";
const OFFICIAL_PRESENT_CODE_URL = "https://hiroba.dqx.jp/sc/campaignCode/itemcode/";
const BAZAAR_FAVORITES_STORAGE_KEY = "dq10_toolweb_bazaar_favorites_v1";
const RECIPE_FAVORITES_STORAGE_KEY = "dq10_toolweb_recipe_favorites_v1";
const HOME_FEATURES_STORAGE_KEY = "dq10_toolweb_home_features_v1";
const RECIPE_FAVORITE_CATEGORY_VALUE = "__favorites__";
const HOME_FEATURE_DEFINITIONS = [
  { id: "bazaar", tabId: "bazaar", title: "バザー情報", icon: "💰" },
  { id: "profit", tabId: "profit", title: "職人アシスト", icon: "🛠️" },
  { id: "favorites", tabId: "favorites", title: "お気に入り", icon: "📌" },
  { id: "present-codes", tabId: "present-codes", title: "プレゼント", icon: "🎁" },
  { id: "orbs", tabId: "orbs", title: "宝珠", icon: "💎" },
  { id: "white-boxes", tabId: "white-boxes", title: "白宝箱", icon: "📦" },
  { id: "equipment-db", tabId: "equipment-db", title: "装備データ", icon: "🛡️" },
  { id: "field-farming", tabId: "field-farming", title: "フィールド狩り", icon: "⚔️" },
];
const DEFAULT_HOME_FEATURE_IDS = Object.freeze(["profit", "bazaar", "favorites", "white-boxes"]);
const HOME_FEATURE_ID_SET = new Set(HOME_FEATURE_DEFINITIONS.map((feature) => feature.id));
const SITE_SEARCH_MAX_RESULTS = 10;
const SITE_SEARCH_MATCH_RANK = Object.freeze({
  exact: 0,
  prefix: 1,
  partial: 2,
});
const TAB_IDS = new Set([
  "profit",
  "present-codes",
  "bazaar",
  "favorites",
  "data",
  "field-farming",
  "orbs",
  "white-boxes",
  "equipment-db",
  "ui-settings",
  "content-editor",
  "updates-editor",
  "bazaar-admin",
]);
const TOOL_SCROLL_OFFSETS = Object.freeze({
  min: 72,
  max: 168,
  preferredViewportRatio: 0.16,
  quickAccessVisibleMin: 36,
  quickAccessVisibleMax: 88,
  targetTopGap: 14,
});
const ADMIN_MODE_STORAGE_KEY = "dq10_toolweb_admin_mode_v1";
const ADMIN_PIN = "1010";
const CONTENT_DEFINITIONS = [
  { key: "site_title", label: "サイトタイトル", selector: "#contentSiteTitle" },
  { key: "site_intro", label: "サイト説明文", selector: "#contentSiteIntro" },
  { key: "site_summary", label: "サイト概要文", selector: "#contentSiteSummary" },
  { key: "site_notice", label: "注意書き（価格・情報）", selector: "#contentSiteNotice" },
  { key: "updates_heading", label: "更新情報見出し", selector: "#contentUpdatesHeading" },
  { key: "tools_heading", label: "便利ツール見出し", selector: "#contentToolsHeading" },
  { key: "tools_intro", label: "便利ツール説明", selector: "#contentToolsIntro" },
  { key: "menu_hint", label: "メニュー補足", selector: "#contentMenuHint" },
  { key: "ui_settings_heading", label: "UI設定見出し", selector: "#ui-settings > h2" },
  { key: "ui_settings_note", label: "UI設定説明", selector: "#ui-settings .ui-settings-note" },
  { key: "content_editor_heading", label: "本文編集見出し", selector: "#content-editor > h2" },
  { key: "content_editor_note", label: "本文編集説明", selector: "#content-editor .ui-settings-note" },
  { key: "updates_editor_heading", label: "更新情報編集見出し", selector: "#updates-editor > h2" },
  { key: "updates_editor_note", label: "更新情報編集説明", selector: "#updates-editor .ui-settings-note" },
  { key: "menu_title", label: "サイドメニュー見出し", selector: ".side-menu-header h2" },
];
const DEFAULT_CONTENT = Object.freeze({
  site_title: "ドラゴンクエスト10支援サイト",
  site_intro: "ドラゴンクエスト10の日常プレイを少し便利にする支援サイトです。",
  site_summary: "バザー確認、職人準備、装備検索をスマホでも見やすくまとめています。\nよく使う機能はホームに追加して、自分用に使いやすくできます。",
  site_notice: "※価格・情報は手動確認ベースのため、更新タイミングにより実際のゲーム内状況と差が出る場合があります。",
  updates_heading: "更新情報",
  tools_heading: "よく使う機能",
  tools_intro: "各機能ページやメニューの「ホーム追加」から表示の追加/削除ができます。",
  menu_hint: "※左上のメニューバーからも操作できます",
  ui_settings_heading: "UI設定",
  ui_settings_note: "スライダーや入力で見た目を調整できます。変更はすぐ反映されます。",
  content_editor_heading: "本文編集",
  content_editor_note: "主要な説明文・注意書きを編集できます。変更はすぐ反映されます。",
  updates_editor_heading: "更新情報編集",
  updates_editor_note: "更新情報の追加・編集・削除・並び替えができます。変更は上部の更新情報に即時反映されます。",
  menu_title: "メニュー",
});
const FAVORITES_TAB_IDS = new Set(["recipes", "materials"]);
const RECIPE_SUMMARY_MATERIAL_LIMIT = 4;
const CRAFT_IDEAL_TARGET_JOBS = new Set(["裁縫職人", "木工職人"]);
const BAZAAR_CATEGORY_ORDER = ["石系", "植物系", "モンスター系", "その他", "消費アイテム"];
const BAZAAR_SORT_OPTIONS = [
  { value: "standard", label: "標準順" },
  { value: "rate_desc", label: "変動率高い順" },
  { value: "rate_asc", label: "変動率低い順" },
];
const BAZAAR_CHART_RANGE_DAYS = {
  week: 7,
  month: 30,
  threeMonths: 90,
};
const DEFAULT_BAZAAR_CHART_RANGE_DAYS = BAZAAR_CHART_RANGE_DAYS.month;
const BAZAAR_DETAIL_MODAL_SWIPE_START_SLOP_PX = 8;
const BAZAAR_DETAIL_MODAL_SWIPE_CLOSE_THRESHOLD_PX = 96;
const BAZAAR_DETAIL_MODAL_SWIPE_MAX_TRANSLATE_PX = 220;
const BAZAAR_DETAIL_MODAL_SWIPE_VERTICAL_DOMINANCE_RATIO = 1.15;
const WHITE_BOX_ARMOR_SLOTS = new Set(["頭", "からだ上", "からだ下", "腕", "足"]);
const WHITE_BOX_WEAPON_SLOT_ORDER = [
  "片手剣",
  "両手剣",
  "短剣",
  "スティック",
  "両手杖",
  "槍",
  "斧",
  "棍",
  "爪",
  "ムチ",
  "扇",
  "ハンマー",
  "ブーメラン",
  "弓",
  "鎌",
  "小盾",
  "大盾",
];
const WHITE_BOX_ARMOR_SLOT_ORDER = ["頭", "からだ上", "からだ下", "腕", "足"];
const imeComposingTargets = new WeakSet();
const WHITE_BOX_SLOT_NORMALIZE_MAP = new Map([
  ["片手剣", "片手剣"],
  ["両手剣", "両手剣"],
  ["短剣", "短剣"],
  ["スティック", "スティック"],
  ["杖", "両手杖"],
  ["両手杖", "両手杖"],
  ["ヤリ", "槍"],
  ["槍", "槍"],
  ["オノ", "斧"],
  ["斧", "斧"],
  ["棍", "棍"],
  ["ツメ", "爪"],
  ["爪", "爪"],
  ["ムチ", "ムチ"],
  ["扇", "扇"],
  ["ハンマー", "ハンマー"],
  ["ブーメラン", "ブーメラン"],
  ["弓", "弓"],
  ["鎌", "鎌"],
  ["小盾", "小盾"],
  ["大盾", "大盾"],
  ["頭", "頭"],
  ["からだ上", "からだ上"],
  ["からだ下", "からだ下"],
  ["腕", "腕"],
  ["足", "足"],
]);
const EQUIPMENT_TYPE_ICON_PATH_MAP = new Map([
  ["片手剣", "/assets/icons/equipment/one_hand_sword.png"],
  ["両手剣", "/assets/icons/equipment/two_hand_sword.png"],
  ["短剣", "/assets/icons/equipment/dagger.png"],
  ["斧", "/assets/icons/equipment/axe.png"],
  ["槍", "/assets/icons/equipment/spear.png"],
  ["やり", "/assets/icons/equipment/spear.png"],
  ["スティック", "/assets/icons/equipment/stick.png"],
  ["両手杖", "/assets/icons/equipment/staff.png"],
  ["杖", "/assets/icons/equipment/staff.png"],
  ["ブーメラン", "/assets/icons/equipment/boomerang.png"],
  ["棍", "/assets/icons/equipment/rod.png"],
  ["鎌", "/assets/icons/equipment/scythe.png"],
  ["ハンマー", "/assets/icons/equipment/hammer.png"],
  ["爪", "/assets/icons/equipment/claw.png"],
  ["ツメ", "/assets/icons/equipment/claw.png"],
  ["ムチ", "/assets/icons/equipment/whip.png"],
  ["扇", "/assets/icons/equipment/fan.png"],
  ["弓", "/assets/icons/equipment/bow.png"],
  ["小盾", "/assets/icons/equipment/small_shield.png"],
  ["大盾", "/assets/icons/equipment/large_shield.png"],
  ["兜", "/assets/icons/equipment/helmet.png"],
  ["頭", "/assets/icons/equipment/helmet.png"],
  ["防具セット", "/assets/icons/equipment/set_equipment.png"],
  ["set_equipment", "/assets/icons/equipment/set_equipment.png"],
  ["からだ上", "/assets/icons/equipment/armor_upper.png"],
  ["からだ下", "/assets/icons/equipment/armor_lower.png"],
  ["腕", "/assets/icons/equipment/gloves.png"],
  ["足", "/assets/icons/equipment/boots.png"],
]);
const ITEM_CATEGORY_ICON_PATH_MAP = new Map([
  ["石系", "/assets/icons/item/stone.png"],
  ["植物系", "/assets/icons/item/plant.png"],
  ["消費アイテム", "/assets/icons/item/herb.png"],
  ["モンスター系", "/assets/icons/item/bone.png"],
  ["その他", "/assets/icons/item/miscellaneous goods.png"],
]);
const ORB_CATEGORY_ICON_PATH_MAP = new Map([
  ["炎", "/assets/icons/orb/fire_orb.png"],
  ["水", "/assets/icons/orb/water_orb.png"],
  ["風", "/assets/icons/orb/wind_orb.png"],
  ["光", "/assets/icons/orb/light_orb.png"],
  ["闇", "/assets/icons/orb/dark_orb.png"],
]);
const DEFAULT_UI_SETTINGS = Object.freeze({
  sectionVerticalSpace: 14,
  cardPadding: 10,
  cardRadius: 12,
  titleFontSize: 1.5,
  bodyFontSize: 16,
  buttonHeight: 38,
  buttonRadius: 8,
  iconSize: 16,
  mobileCardColumns: 2,
  desktopMaxWidth: 920,
});
const UI_SETTING_DEFINITIONS = [
  { key: "sectionVerticalSpace", label: "セクション上下余白", min: 6, max: 28, step: 1, unit: "px" },
  { key: "cardPadding", label: "カード内余白", min: 6, max: 24, step: 1, unit: "px" },
  { key: "cardRadius", label: "カード角丸", min: 4, max: 24, step: 1, unit: "px" },
  { key: "titleFontSize", label: "タイトル文字サイズ", min: 1.2, max: 2.2, step: 0.05, unit: "rem" },
  { key: "bodyFontSize", label: "本文文字サイズ", min: 13, max: 20, step: 1, unit: "px" },
  { key: "buttonHeight", label: "ボタン高さ", min: 32, max: 56, step: 1, unit: "px" },
  { key: "buttonRadius", label: "ボタン角丸", min: 4, max: 20, step: 1, unit: "px" },
  { key: "iconSize", label: "アイコンサイズ", min: 12, max: 28, step: 1, unit: "px" },
  { key: "mobileCardColumns", label: "スマホ時のカード列数", min: 1, max: 2, step: 1, unit: "列" },
  { key: "desktopMaxWidth", label: "PC時の最大幅", min: 760, max: 1280, step: 10, unit: "px" },
];

function resolveProjectScopedAssetUrl(path) {
  if (!path) return "";
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  if (!path.startsWith("/")) return path;

  const pathname = window.location.pathname || "/";
  const normalizedPathname = pathname.endsWith(".html") ? pathname.replace(/[^/]*$/, "/") : pathname;
  const projectSegment = normalizedPathname.split("/").filter(Boolean)[0];
  const projectBasePath = projectSegment ? `/${projectSegment}` : "";

  if (!projectBasePath || path.startsWith(`${projectBasePath}/`)) {
    return path;
  }
  return `${projectBasePath}${path}`;
}

function getEquipmentTypeIconPath(typeName) {
  const normalizedType = String(typeName || "").trim();
  if (normalizedType === "") return "";
  return EQUIPMENT_TYPE_ICON_PATH_MAP.get(normalizedType) || "";
}

function getItemCategoryIconPath(categoryName) {
  const normalizedCategory = String(categoryName || "").trim();
  if (normalizedCategory === "") return "";

  const compactCategory = normalizedCategory.replace(/\s+/g, "");
  if (compactCategory === "そのほか") {
    return ITEM_CATEGORY_ICON_PATH_MAP.get("その他") || "";
  }
  return ITEM_CATEGORY_ICON_PATH_MAP.get(compactCategory) || "";
}

function normalizeOrbCategoryName(categoryName) {
  const normalizedCategory = String(categoryName || "").trim().replace(/\s+/g, "");
  if (normalizedCategory === "") return "";
  const matchedBaseCategory = normalizedCategory.match(/(炎|水|風|光|闇)/);
  return matchedBaseCategory ? matchedBaseCategory[1] : normalizedCategory;
}

function getOrbCategoryIconPath(categoryName) {
  const normalizedCategory = normalizeOrbCategoryName(categoryName);
  if (normalizedCategory === "") return "";
  return ORB_CATEGORY_ICON_PATH_MAP.get(normalizedCategory) || "";
}

function buildOrbCategoryLabelHtml(categoryName) {
  const rawLabel = String(categoryName || "").trim();
  const normalizedCategory = normalizeOrbCategoryName(rawLabel);
  const label = rawLabel || "-";
  const iconPath = getOrbCategoryIconPath(rawLabel);
  if (!iconPath) return `<span class="orb-card-category-label">${label}</span>`;

  return `
    <span class="orb-card-category-with-icon">
      <img
        src="${resolveProjectScopedAssetUrl(iconPath)}"
        alt="${normalizedCategory || label}の宝珠アイコン"
        class="orb-card-category-icon"
        loading="lazy"
        decoding="async"
        onerror="this.hidden=true;"
      >
      <span class="orb-card-category-label">${label}</span>
    </span>
  `;
}

function buildBazaarCategoryLabelHtml(categoryName) {
  const normalizedCategory = String(categoryName || "").trim();
  const label = normalizedCategory || "-";
  const iconPath = getItemCategoryIconPath(normalizedCategory);
  if (!iconPath) return `<span class="bazaar-category-label">${label}</span>`;

  return `
    <span class="bazaar-category-with-icon">
      <img
        src="${resolveProjectScopedAssetUrl(iconPath)}"
        alt="${label}アイコン"
        class="bazaar-category-icon"
        loading="lazy"
        decoding="async"
        onerror="this.hidden=true;"
      >
      <span class="bazaar-category-label">${label}</span>
    </span>
  `;
}

function isArmorSetEntry(entry) {
  const equipmentGroup = String(entry?.equipmentGroup || "").trim();
  const equipmentType = String(entry?.equipmentType || "").trim();
  return equipmentGroup === "armor" || equipmentType === "防具セット";
}

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
  craftIdealValues: [],
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

function parseEquipmentLevel(value) {
  const normalized = String(value ?? "").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

async function fetchCsvLines(path) {
  const response = await fetch(path);
  if (!response.ok) {
    console.error(`[CSV] fetch failed: path=${path}, status=${response.status}`);
    throw new Error(`CSVの読み込みに失敗しました: ${path} (${response.status})`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const csvText = decodeCsvText(path, bytes);
  const normalized = csvText.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines;
}

function decodeCsvText(path, bytes) {
  const candidates = ["utf-8", "shift_jis"];
  const validateFn = getCsvValidator(path);

  for (const encoding of candidates) {
    try {
      const decoded = new TextDecoder(encoding, { fatal: true }).decode(bytes);
      if (validateFn(decoded)) {
        return decoded;
      }
    } catch {
      // 次の候補へフォールバック
    }
  }

  throw new Error(`CSVの文字コード判定に失敗しました: ${path}`);
}

function getCsvValidator(path) {
  if (path === BAZAAR_CSV_PATH) {
    return (text) => validateCsvHeader(text, ["materialName", "today_price"], 1);
  }
  if (path === BAZAAR_HISTORY_CSV_PATH) {
    return (text) => validateCsvHeader(text, ["date", "material_name"], 1);
  }
  return (text) => validateCsvHeader(text, [], 0);
}

function validateCsvHeader(text, requiredHeaders, minDataRows = 0) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) return false;

  const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const hasHeaders = requiredHeaders.every((header) => headers.includes(header));
  if (!hasHeaders) return false;
  if (lines.length - 1 < minDataRows) return false;
  if (lines.length > 1 && lines[1].includes("�")) return false;
  return true;
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

function parseCraftIdealValuesFromLines(lines) {
  if (lines.length <= 1) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const jobTypeIndex = headers.indexOf("job_type");
  const itemNameIndex = headers.indexOf("item_name");
  const partIndex = headers.indexOf("part");
  const gridTypeIndex = headers.indexOf("grid_type");
  const star3ToleranceIndex = headers.indexOf("star3_tolerance");
  const cellIndexes = Array.from({ length: 9 }, (_, index) => headers.indexOf(`cell_${index + 1}`));

  if (
    jobTypeIndex < 0 ||
    itemNameIndex < 0 ||
    partIndex < 0 ||
    gridTypeIndex < 0 ||
    star3ToleranceIndex < 0 ||
    cellIndexes.some((index) => index < 0)
  ) {
    throw new Error("craft_ideal_values.csv ヘッダーが想定と一致しません");
  }

  const idealValues = [];
  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const jobType = String(row[jobTypeIndex] || "").trim();
    const itemName = String(row[itemNameIndex] || "").trim();
    if (!CRAFT_IDEAL_TARGET_JOBS.has(jobType) || itemName === "") continue;

    const part = String(row[partIndex] || "").trim();
    const gridType = Number(row[gridTypeIndex] || 0);
    const star3Tolerance = Number(row[star3ToleranceIndex] || 0);
    const cells = cellIndexes.map((cellIndex) => {
      const raw = String(row[cellIndex] || "").trim();
      if (raw === "") return null;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    });

    idealValues.push({
      jobType,
      itemName,
      part,
      gridType: Number.isFinite(gridType) ? gridType : 0,
      star3Tolerance: Number.isFinite(star3Tolerance) ? star3Tolerance : 0,
      cells,
    });
  }

  return idealValues;
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
  const equipmentLevelIndex = headers.indexOf("equipmentLevel");
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
    const equipmentLevel = parseEquipmentLevel(row[equipmentLevelIndex]);
    const materialName = row[materialNameIndex];
    const quantity = Number(row[quantityIndex] || 0);

    if (!craftsman || !category || !equipmentName || !materialName || quantity <= 0) continue;

    if (!equipmentMap.has(equipmentName)) {
      equipmentMap.set(equipmentName, {
        id: makeEquipmentId(equipmentName),
        name: equipmentName,
        craftsman,
        category,
        equipmentLevel: equipmentLevel ?? 0,
        // 販売価格はCSVに無いので0初期化（既存保存値があれば後で引き継ぎ）
        salePrices: { star0: 0, star1: 0, star2: 0, star3: 0 },
      });
    } else if (equipmentLevel !== null) {
      const equipment = equipmentMap.get(equipmentName);
      equipment.equipmentLevel = equipmentLevel;
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
    craftIdealValues: [],
  };
}

async function loadCraftIdealValuesCsv() {
  const lines = await fetchCsvLines(CRAFT_IDEAL_VALUES_CSV_PATH);
  return parseCraftIdealValuesFromLines(lines);
}

async function loadTopUpdates() {
  const response = await fetch(UPDATES_JSON_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`updates.json の読み込みに失敗しました: ${response.status}`);
  }
  const parsed = await response.json();
  if (!Array.isArray(parsed)) return [];

  return normalizeUpdates(parsed);
}

function normalizeUpdateEntry(rawEntry) {
  const date = String(rawEntry?.date || "").trim();
  const text = String(rawEntry?.text || "").trim();
  const url = parseOfficialUrl(rawEntry?.url);
  const linkLabel = String(rawEntry?.link_label || "").trim();
  return { date, text, url, link_label: linkLabel };
}

function normalizeUpdates(rawUpdates) {
  if (!Array.isArray(rawUpdates)) return [];
  return rawUpdates
    .map((entry) => normalizeUpdateEntry(entry))
    .filter((entry) => entry.date !== "" && entry.text !== "")
    .sort((a, b) => b.date.localeCompare(a.date, "ja"));
}

function formatTopUpdateDate(dateText) {
  const normalized = String(dateText || "").trim();
  const matched = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return normalized;
  return `${matched[1]}/${matched[2]}/${matched[3]}`;
}

function renderTopUpdates() {
  if (!topUpdateSection || !topUpdateList) return;
  if (!Array.isArray(topUpdates) || topUpdates.length === 0) {
    topUpdateList.innerHTML = "";
    if (topUpdateViewAllLink) topUpdateViewAllLink.hidden = true;
    topUpdateSection.hidden = true;
    return;
  }

  const topUpdatesForHome = topUpdates.slice(0, 3);
  topUpdateSection.hidden = false;
  if (topUpdateViewAllLink) topUpdateViewAllLink.hidden = topUpdates.length <= 3;
  topUpdateList.innerHTML = topUpdatesForHome
    .map((entry) => {
      const safeText = escapeHtml(entry.text);
      if (entry.url) {
        const label = escapeHtml(entry.link_label || "詳細");
        return `<li><time datetime="${entry.date}">${formatTopUpdateDate(entry.date)}</time> ${safeText} <a href="${entry.url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`;
      }
      return `<li><time datetime="${entry.date}">${formatTopUpdateDate(entry.date)}</time> ${safeText}</li>`;
    })
    .join("");
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

function loadHomeFeatureState() {
  const raw = localStorage.getItem(HOME_FEATURES_STORAGE_KEY);
  if (!raw) return [...DEFAULT_HOME_FEATURE_IDS];

  try {
    const parsed = JSON.parse(raw);
    const storedIds = Array.isArray(parsed?.featureIds) ? parsed.featureIds : parsed;
    if (!Array.isArray(storedIds)) return [...DEFAULT_HOME_FEATURE_IDS];
    const normalized = storedIds
      .map((id) => String(id || "").trim())
      .filter((id, index, self) => id !== "" && HOME_FEATURE_ID_SET.has(id) && self.indexOf(id) === index);
    return normalized.length > 0 ? normalized : [...DEFAULT_HOME_FEATURE_IDS];
  } catch {
    return [...DEFAULT_HOME_FEATURE_IDS];
  }
}

function saveHomeFeatureState() {
  localStorage.setItem(
    HOME_FEATURES_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      featureIds: homeFeatureIds,
    })
  );
}

function isHomeFeatureEnabled(featureId) {
  return homeFeatureIdSet.has(featureId);
}

function toggleHomeFeature(featureId) {
  if (!HOME_FEATURE_ID_SET.has(featureId)) return;
  if (homeFeatureIdSet.has(featureId)) {
    homeFeatureIds = homeFeatureIds.filter((id) => id !== featureId);
  } else {
    homeFeatureIds = [...homeFeatureIds, featureId];
  }
  homeFeatureIdSet = new Set(homeFeatureIds);
  saveHomeFeatureState();
  renderHomeQuickFeatures();
  renderHomeToggleButtons();
}

function renderHomeQuickFeatures() {
  if (!homeQuickFeatureGrid) return;
  const featuresForHome = homeFeatureIds
    .map((id) => HOME_FEATURE_DEFINITIONS.find((feature) => feature.id === id))
    .filter((feature) => feature && TAB_IDS.has(feature.tabId));

  if (featuresForHome.length === 0) {
    homeQuickFeatureGrid.innerHTML = `<p class="home-quick-empty">まだ機能がありません。メニューの「ホーム追加」で設定してください。</p>`;
    return;
  }

  homeQuickFeatureGrid.innerHTML = featuresForHome
    .map((feature) => {
      const safeTitle = escapeHtml(feature.title);
      const safeIcon = escapeHtml(feature.icon || "⭐");
      return `
        <button type="button" class="home-quick-card side-menu-item" data-menu-target="${feature.tabId}" aria-label="${safeTitle}を開く">
          <span class="home-quick-card-icon" aria-hidden="true">${safeIcon}</span>
          <span class="home-quick-card-title">${safeTitle}</span>
        </button>
      `;
    })
    .join("");
}

function renderHomeToggleButtons() {
  document.querySelectorAll(".home-pin-toggle[data-home-feature-id]").forEach((button) => {
    const featureId = String(button.dataset.homeFeatureId || "");
    const enabled = isHomeFeatureEnabled(featureId);
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
    button.innerHTML = enabled ? "🏠<br>ホーム中" : "＋<br>ホーム追加";
  });
}

function decorateSideMenuWithHomeActions() {
  if (!sideMenu) return;
  const sideMenuButtons = sideMenu.querySelectorAll(".side-menu-item[data-menu-target]");
  sideMenuButtons.forEach((menuButton) => {
    const tabId = String(menuButton.dataset.menuTarget || "");
    const featureDefinition = HOME_FEATURE_DEFINITIONS.find((feature) => feature.tabId === tabId);
    if (!featureDefinition) return;
    if (menuButton.closest(".side-menu-item-row")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "side-menu-item-row";
    menuButton.after(wrapper);
    wrapper.append(menuButton);

    const homeToggleButton = document.createElement("button");
    homeToggleButton.type = "button";
    homeToggleButton.className = "home-pin-toggle";
    homeToggleButton.dataset.homeFeatureId = featureDefinition.id;
    homeToggleButton.setAttribute("aria-label", `${featureDefinition.title}をホーム表示に追加または削除`);
    homeToggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleHomeFeature(featureDefinition.id);
    });
    wrapper.append(homeToggleButton);
  });
  renderHomeToggleButtons();
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
    craftIdealValues: csvData.craftIdealValues || [],
  };
}

let state = structuredClone(defaultData);
let uiSettings = structuredClone(DEFAULT_UI_SETTINGS);
let contentData = structuredClone(DEFAULT_CONTENT);
let initialContentData = structuredClone(DEFAULT_CONTENT);
let isAdminModeEnabled = localStorage.getItem(ADMIN_MODE_STORAGE_KEY) === "1";
let selectedEquipmentId = "";
// 装備検索キーワード（利益計算画面の装備プルダウン用）
let equipmentSearchKeyword = "";
let materialSearchKeyword = "";
// 利益計算画面の絞り込み条件（未選択なら全件）
let selectedCraftsman = "";
let selectedCategory = "";
let selectedToolId = "";
let isToolCostIncluded = false;
let isEquipmentSearchExpanded = false;
let isMaterialSearchExpanded = false;
let bazaarPrices = [];
let selectedBazaarCategory = "";
let selectedBazaarSort = "standard";
let bazaarSearchText = "";
let selectedBazaarMaterialName = "";
let isBazaarSearchComposing = false;
let shouldRefocusBazaarSearchInput = false;
let showBazaarFavoritesOnly = false;
let showBazaarMonitoringOnly = false;
let activeFavoritesTabId = "recipes";
let bazaarFavoriteMaterialKeys = new Set();
let recipeFavoriteKeys = new Set();
let homeFeatureIds = [...DEFAULT_HOME_FEATURE_IDS];
let homeFeatureIdSet = new Set(homeFeatureIds);
let activeTabId = "profit";
let appMode = "home";
let pendingBazaarFocusMaterialKey = "";
let bazaarPriceHistoryByMaterialKey = new Map();
let selectedBazaarChartRangeDays = DEFAULT_BAZAAR_CHART_RANGE_DAYS;
let activeBazaarDetailModalKey = "";
let bazaarDetailModalSwipeState = null;
let activeFavoriteMaterialModalKey = "";
let presentCodes = [];
let fieldFarmingMonsters = [];
let orbEntries = [];
let selectedOrbCategory = "";
let orbSearchKeyword = "";
let expandedOrbId = "";
let whiteBoxEntries = [];
let selectedWhiteBoxType = "weapon";
let selectedWhiteBoxSlot = "";
let selectedWhiteBoxSort = "level_desc";
let whiteBoxKeyword = "";
let expandedWhiteBoxItemId = "";
let equipmentDbEntries = [];
let selectedEquipmentDbGroup = "weapon";
let selectedEquipmentDbSort = "level_desc";
let selectedEquipmentDbType = "";
let equipmentDbNameKeyword = "";
let equipmentDbMonsterKeyword = "";
let expandedEquipmentDbId = "";
let presentCodesKeyword = "";
let fieldFarmingKeyword = "";
let siteSearchKeyword = "";
let isSiteSearchDataLoading = false;
let hasLoadedSiteSearchData = false;
let topUpdates = [];
let initialTopUpdates = [];
let isContentEditModeEnabled = false;
let isEquipmentDbNameSearchOpen = false;
let isEquipmentDbMonsterSearchOpen = false;
let hasLoadedPresentCodes = false;
let hasLoadedFieldFarmingMonsters = false;
let hasLoadedOrbData = false;
let hasLoadedWhiteBoxData = false;
let hasLoadedEquipmentDbData = false;
let hasLoadedBazaarPrices = false;
let hasLoadedBazaarPriceHistory = false;
let hasLoadedCraftIdealValues = false;
let hasSyncedMaterialPricesWithBazaar = false;
let isPresentCodesLoading = false;
let isFieldFarmingLoading = false;
let isOrbDataLoading = false;
let isWhiteBoxDataLoading = false;
let isEquipmentDbDataLoading = false;
let isBazaarLoading = false;
let isBazaarHistoryLoading = false;
let isCraftIdealValuesLoading = false;
let isToolSiteSearchOpen = false;
let presentCodesLoadingPromise = null;
let fieldFarmingLoadingPromise = null;
let orbDataLoadingPromise = null;
let whiteBoxDataLoadingPromise = null;
let equipmentDbDataLoadingPromise = null;
let bazaarLoadingPromise = null;
let bazaarHistoryLoadingPromise = null;
let bazaarAdminCsvModel = null;
let bazaarAdminLastResults = new Map();
let bazaarAdminPastedTextByRowId = new Map();
let isBazaarAdminUpdating = false;
let selectedBazaarAdminCategory = "";
let showBazaarAdminUpdatableOnly = false;
let showBazaarAdminMonitoringOnly = false;
let prioritizeBazaarAdminUnupdated = true;
let bazaarAdminAutoUpdateOnPaste = false;
let bazaarAdminAutoOpenNextUrlAfterUpdate = false;
let bazaarAdminAutoScrollNextRowAfterUpdate = true;
const bazaarAdminAutoAdvanceDelayMs = 400;
let bazaarAdminAutoUpdateTimerByRowId = new Map();
let craftIdealValuesLoadingPromise = null;
let selectedFieldFarmingSort = "normal_desc";
let activeFieldFarmingMapModalRowId = "";
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
const appRoot = document.querySelector(".app");
const mobileBottomNav = document.querySelector(".mobile-bottom-nav");
const mobileBottomNavItems = document.querySelectorAll(".mobile-bottom-nav-item");
const appHeader = document.querySelector(".app-header");
const homeSiteSearch = document.getElementById("homeSiteSearch");
const siteSearchInput = getRequiredElementById("siteSearchInput");
const siteSearchResultWrap = getRequiredElementById("siteSearchResultWrap");
const toolSiteSearchDock = document.getElementById("toolSiteSearchDock");
const toolSiteSearchToggleButton = document.getElementById("toolSiteSearchToggleButton");
const toolSiteSearchPanel = document.getElementById("toolSiteSearchPanel");
const toolSiteSearchInput = document.getElementById("toolSiteSearchInput");
const toolSiteSearchResultWrap = document.getElementById("toolSiteSearchResultWrap");
const topUpdateSection = document.getElementById("topUpdateSection");
const topUpdateList = document.getElementById("topUpdateList");
const topUpdateViewAllLink = document.getElementById("topUpdateViewAllLink");
const topQuickAccessSection = document.querySelector(".top-quick-access");
const homeQuickFeatureGrid = getRequiredElementById("homeQuickFeatureGrid");
const homeModeButton = document.getElementById("homeModeButton");

const equipmentSelect = getRequiredElementById("equipmentSelect");
const selectedEquipmentTypeMeta = getRequiredElementById("selectedEquipmentTypeMeta");
const recipeFavoriteActionWrap = getRequiredElementById("recipeFavoriteActionWrap");
const craftIdealValueWrap = getRequiredElementById("craftIdealValueWrap");
const equipmentSearchToggleButton = getRequiredElementById("equipmentSearchToggleButton");
const equipmentSearchField = getRequiredElementById("equipmentSearchField");
const equipmentSearchInput = getRequiredElementById("equipmentSearchInput");
const materialSearchToggleButton = getRequiredElementById("materialSearchToggleButton");
const materialSearchField = getRequiredElementById("materialSearchField");
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
const toolSectionToggleButton = getRequiredElementById("toolSectionToggleButton");
const toolSectionDetail = getRequiredElementById("toolSectionDetail");
const toolSelect = getRequiredElementById("toolSelect");
const toolDurabilityInput = getRequiredElementById("toolDurabilityInput");
const toolPurchasePriceInput = getRequiredElementById("toolPurchasePriceInput");
const materialListWrap = getRequiredElementById("materialListWrap");
const recipeAdminListWrap = getRequiredElementById("recipeAdminListWrap");
const exportMaterialPricesButton = getRequiredElementById("exportMaterialPricesButton");
const importMaterialPricesButton = getRequiredElementById("importMaterialPricesButton");
const importMaterialPricesInput = getRequiredElementById("importMaterialPricesInput");
const materialDataTransferMessage = getRequiredElementById("materialDataTransferMessage");
const saveBazaarHistoryButton = getRequiredElementById("saveBazaarHistoryButton");
const bazaarHistorySnapshotDateInput = getRequiredElementById("bazaarHistorySnapshotDateInput");
const bazaarHistorySaveMessage = getRequiredElementById("bazaarHistorySaveMessage");
const bazaarListWrap = getRequiredElementById("bazaarListWrap");
const bazaarDetailModalOverlay = getRequiredElementById("bazaarDetailModalOverlay");
const bazaarDetailModalDialog = getRequiredElementById("bazaarDetailModalDialog");
const bazaarDetailModalCloseButton = getRequiredElementById("bazaarDetailModalCloseButton");
const bazaarDetailModalHandle = getRequiredElementById("bazaarDetailModalHandle");
const bazaarDetailModalBody = getRequiredElementById("bazaarDetailModalBody");
const presentCodeListWrap = getRequiredElementById("presentCodeListWrap");
const fieldFarmingListWrap = getRequiredElementById("fieldFarmingListWrap");
const orbListWrap = getRequiredElementById("orbListWrap");
const orbSearchInput = getRequiredElementById("orbSearchInput");
const orbCategoryFilterWrap = getRequiredElementById("orbCategoryFilterWrap");
const whiteBoxListWrap = getRequiredElementById("whiteBoxListWrap");
const whiteBoxSortSelect = getRequiredElementById("whiteBoxSortSelect");
const whiteBoxSlotFilterSelect = getRequiredElementById("whiteBoxSlotFilterSelect");
const whiteBoxTypeTabButtons = document.querySelectorAll("[data-whitebox-type]");
const equipmentDbListWrap = getRequiredElementById("equipmentDbListWrap");
const equipmentDbGroupTabButtons = Array.from(document.querySelectorAll("[data-equipment-db-group]"));
const equipmentDbSortSelect = getRequiredElementById("equipmentDbSortSelect");
const equipmentDbTypeFilterSelect = getRequiredElementById("equipmentDbTypeFilterSelect");
const equipmentDbTypeFilterField = equipmentDbTypeFilterSelect?.closest("label");
const equipmentDbNameSearchToggleButton = getRequiredElementById("equipmentDbNameSearchToggleButton");
const equipmentDbNameSearchField = getRequiredElementById("equipmentDbNameSearchField");
const equipmentDbNameSearchInput = getRequiredElementById("equipmentDbNameSearchInput");
const equipmentDbMonsterSearchToggleButton = getRequiredElementById("equipmentDbMonsterSearchToggleButton");
const equipmentDbMonsterSearchField = getRequiredElementById("equipmentDbMonsterSearchField");
const equipmentDbMonsterSearchInput = getRequiredElementById("equipmentDbMonsterSearchInput");
const fieldFarmingSortSelect = getRequiredElementById("fieldFarmingSortSelect");
const fieldFarmingMapModalOverlay = getRequiredElementById("fieldFarmingMapModalOverlay");
const fieldFarmingMapModalDialog = getRequiredElementById("fieldFarmingMapModalDialog");
const fieldFarmingMapModalCloseButton = getRequiredElementById("fieldFarmingMapModalCloseButton");
const fieldFarmingMapModalBody = getRequiredElementById("fieldFarmingMapModalBody");
const favoriteRecipesListWrap = getRequiredElementById("favoriteRecipesListWrap");
const favoriteMaterialsListWrap = getRequiredElementById("favoriteMaterialsListWrap");
const favoriteMaterialModalOverlay = getRequiredElementById("favoriteMaterialModalOverlay");
const favoriteMaterialModalDialog = getRequiredElementById("favoriteMaterialModalDialog");
const favoriteMaterialModalCloseButton = getRequiredElementById("favoriteMaterialModalCloseButton");
const favoriteMaterialModalBody = getRequiredElementById("favoriteMaterialModalBody");
const favoritesTabButtons = document.querySelectorAll("[data-favorites-tab]");
const favoritesPanels = document.querySelectorAll(".favorites-panel");
const uiSettingsControlList = getRequiredElementById("uiSettingsControlList");
const uiSettingsResetButton = getRequiredElementById("uiSettingsResetButton");
const uiSettingsExportButton = getRequiredElementById("uiSettingsExportButton");
const uiSettingsMessage = getRequiredElementById("uiSettingsMessage");
const contentEditorControlList = getRequiredElementById("contentEditorControlList");
const contentEditorModeToggleButton = getRequiredElementById("contentEditorModeToggleButton");
const contentEditorResetButton = getRequiredElementById("contentEditorResetButton");
const contentEditorExportButton = getRequiredElementById("contentEditorExportButton");
const contentEditorMessage = getRequiredElementById("contentEditorMessage");
const updatesEditorAddButton = getRequiredElementById("updatesEditorAddButton");
const updatesEditorResetButton = getRequiredElementById("updatesEditorResetButton");
const updatesEditorExportButton = getRequiredElementById("updatesEditorExportButton");
const updatesEditorList = getRequiredElementById("updatesEditorList");
const updatesEditorMessage = getRequiredElementById("updatesEditorMessage");
const adminFabToggleButton = getRequiredElementById("adminFabToggleButton");
const adminFabPanel = getRequiredElementById("adminFabPanel");
const adminPinGate = getRequiredElementById("adminPinGate");
const adminPinInput = getRequiredElementById("adminPinInput");
const adminPinUnlockButton = getRequiredElementById("adminPinUnlockButton");
const adminActionList = getRequiredElementById("adminActionList");
const adminOpenManageModeButton = getRequiredElementById("adminOpenManageModeButton");
const adminOpenUiSettingsButton = getRequiredElementById("adminOpenUiSettingsButton");
const adminOpenContentEditorButton = getRequiredElementById("adminOpenContentEditorButton");
const adminToggleContentEditModeButton = getRequiredElementById("adminToggleContentEditModeButton");
const adminOpenUpdatesEditorButton = getRequiredElementById("adminOpenUpdatesEditorButton");
const adminOpenBazaarAdminButton = getRequiredElementById("adminOpenBazaarAdminButton");
const adminExportUiSettingsButton = getRequiredElementById("adminExportUiSettingsButton");
const adminExportContentButton = getRequiredElementById("adminExportContentButton");
const adminExportUpdatesButton = getRequiredElementById("adminExportUpdatesButton");
const adminLockButton = getRequiredElementById("adminLockButton");
const adminFabMessage = getRequiredElementById("adminFabMessage");
const bazaarAdminCategorySelect = getRequiredElementById("bazaarAdminCategorySelect");
const bazaarAdminRefreshButton = getRequiredElementById("bazaarAdminRefreshButton");
const bazaarAdminUpdateCategoryButton = getRequiredElementById("bazaarAdminUpdateCategoryButton");
const bazaarAdminUpdateAllButton = getRequiredElementById("bazaarAdminUpdateAllButton");
const bazaarAdminDownloadButton = getRequiredElementById("bazaarAdminDownloadButton");
const bazaarAdminMessage = getRequiredElementById("bazaarAdminMessage");
const bazaarAdminListWrap = getRequiredElementById("bazaarAdminListWrap");

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

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

function normalizeSearchKeyword(value) {
  return String(value || "").trim().toLowerCase();
}

function getSearchMatchRank(text, normalizedKeyword) {
  const normalizedText = normalizeSearchKeyword(text);
  if (normalizedKeyword === "" || normalizedText === "") return Number.MAX_SAFE_INTEGER;
  if (normalizedText === normalizedKeyword) return SITE_SEARCH_MATCH_RANK.exact;
  if (normalizedText.startsWith(normalizedKeyword)) return SITE_SEARCH_MATCH_RANK.prefix;
  if (normalizedText.includes(normalizedKeyword)) return SITE_SEARCH_MATCH_RANK.partial;
  return Number.MAX_SAFE_INTEGER;
}

function buildSiteSearchIndex() {
  const entries = [];
  state.equipments.forEach((equipment) => {
    entries.push({
      name: equipment.name,
      type: "レシピ",
      subLabel: "職人アシスト",
      tabId: "profit",
      targetValue: equipment.id,
      keywords: [equipment.name, equipment.craftsman, equipment.category].filter(Boolean).join(" "),
    });
  });

  (equipmentDbEntries || []).forEach((entry) => {
    const equipmentGroup = String(entry.equipmentGroup || "weapon").trim() === "armor" ? "armor" : "weapon";
    entries.push({
      name: entry.equipmentName,
      type: "装備データ",
      subLabel: "装備一覧",
      tabId: "equipment-db",
      targetValue: entry.equipmentName,
      equipmentGroup,
      keywords: [entry.equipmentName, entry.equipmentType, entry.equipmentGroup].filter(Boolean).join(" "),
    });
  });

  (bazaarPrices || []).forEach((row) => {
    entries.push({
      name: row.materialName,
      type: "素材",
      subLabel: "バザー価格一覧",
      tabId: "bazaar",
      targetValue: row.materialName,
      materialKey: row.materialKey,
      keywords: [row.materialName, row.category].filter(Boolean).join(" "),
    });
  });

  (whiteBoxEntries || []).forEach((entry) => {
    entries.push({
      name: entry.itemName,
      type: "白宝箱",
      subLabel: "白宝箱",
      tabId: "white-boxes",
      targetValue: entry.itemName,
      keywords: [entry.itemName, entry.itemSlot, ...(Array.isArray(entry.monsters) ? entry.monsters.map((monster) => monster.monsterName) : [])]
        .filter(Boolean)
        .join(" "),
    });
  });

  (fieldFarmingMonsters || []).forEach((entry) => {
    const commonKeywords = [entry.monsterName, entry.monsterArea, entry.area, entry.normalDrop, entry.rareDrop, entry.note]
      .filter(Boolean)
      .join(" ");
    if (entry.monsterName) {
      entries.push({
        name: entry.monsterName,
        type: "フィールド狩り",
        subLabel: "フィールド狩り",
        tabId: "field-farming",
        targetValue: entry.monsterName,
        keywords: commonKeywords,
      });
    }
    if (entry.normalDrop) {
      entries.push({
        name: entry.normalDrop,
        type: "フィールド狩り",
        subLabel: "フィールド狩り",
        tabId: "field-farming",
        targetValue: entry.normalDrop,
        keywords: commonKeywords,
      });
    }
    if (entry.rareDrop) {
      entries.push({
        name: entry.rareDrop,
        type: "フィールド狩り",
        subLabel: "フィールド狩り",
        tabId: "field-farming",
        targetValue: entry.rareDrop,
        keywords: commonKeywords,
      });
    }
  });

  (presentCodes || []).forEach((entry) => {
    entries.push({
      name: entry.code,
      type: "プレゼントのじゅもん",
      subLabel: "プレゼントのじゅもん",
      tabId: "present-codes",
      targetValue: entry.code,
      keywords: [entry.code, entry.reward, entry.note, entry.expiresAt].filter(Boolean).join(" "),
    });
  });

  (topUpdates || []).forEach((entry) => {
    entries.push({
      name: entry.text,
      type: "更新情報",
      subLabel: "更新情報一覧",
      tabId: "updates",
      targetValue: entry.text,
      keywords: [entry.date, entry.text].filter(Boolean).join(" "),
    });
  });

  return entries.filter((entry) => String(entry.name || "").trim() !== "");
}

function getSiteSearchCandidates(keyword) {
  const normalizedKeyword = normalizeSearchKeyword(keyword);
  if (normalizedKeyword === "") return [];
  return buildSiteSearchIndex()
    .map((entry, index) => {
      const rankByName = getSearchMatchRank(entry.name, normalizedKeyword);
      const rankByKeyword = getSearchMatchRank(entry.keywords, normalizedKeyword);
      const rank = Math.min(rankByName, rankByKeyword);
      return {
        ...entry,
        rank,
        sourceIndex: index,
      };
    })
    .filter((entry) => Number.isFinite(entry.rank) && entry.rank <= SITE_SEARCH_MATCH_RANK.partial)
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      const lengthDiff = String(a.name || "").length - String(b.name || "").length;
      if (lengthDiff !== 0) return lengthDiff;
      const nameDiff = String(a.name || "").localeCompare(String(b.name || ""), "ja");
      if (nameDiff !== 0) return nameDiff;
      return a.sourceIndex - b.sourceIndex;
    })
    .slice(0, SITE_SEARCH_MAX_RESULTS);
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

function parseNullableNumber(value) {
  const normalized = String(value ?? "").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized.replace(/,/g, ""));
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
  const listingCountIndex = headers.indexOf("listing_count");
  const officialUrlIndex = headers.indexOf("official_url");
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
  if (listingCountIndex < 0) {
    console.warn("[bazaar_prices.csv] listing_count 列が見つからないため null で補完します");
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
        listingCount: listingCountIndex >= 0 ? parseNullableNumber(row[listingCountIndex]) : null,
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

function parsePresentCodesFromLines(lines) {
  if (!Array.isArray(lines) || lines.length <= 1) return [];
  const headers = parseCsvLine(lines[0]);
  const codeIndex = headers.indexOf("code");
  const rewardIndex = headers.indexOf("reward");
  const expiresAtIndex = headers.indexOf("expires_at");
  const linkTypeIndex = headers.indexOf("link_type");
  const urlIndex = headers.indexOf("url");
  const noteIndex = headers.indexOf("note");
  if (codeIndex < 0 || rewardIndex < 0 || expiresAtIndex < 0) {
    throw new Error("datapresent_codes.csv ヘッダーが想定と一致しません");
  }

  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const code = String(row[codeIndex] || "").trim();
    const reward = String(row[rewardIndex] || "").trim();
    const expiresAt = String(row[expiresAtIndex] || "").trim();
    const rawLinkType = linkTypeIndex >= 0 ? String(row[linkTypeIndex] || "").trim().toLowerCase() : "";
    const linkType = rawLinkType === "url" ? "url" : "code";
    const url = urlIndex >= 0 ? String(row[urlIndex] || "").trim() : "";
    const note = noteIndex >= 0 ? String(row[noteIndex] || "").trim() : "";
    if (!code || !reward || !expiresAt) continue;
    rows.push({ code, reward, expiresAt, linkType, url, note });
  }
  return rows;
}

function formatBazaarAdminTimestamp(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day}/${hours}:${minutes}`;
}

function normalizeBazaarAdminNumberText(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits === "" ? "" : String(Number(digits));
}

function normalizeBazaarCommentText(comment) {
  return String(comment ?? "").trim();
}

function isExcludedByComment(comment) {
  const text = normalizeBazaarCommentText(comment);
  return text.includes("固定価格") || text.includes("現在固定") || text.includes("店売り価格固定");
}

function isMonitoringByComment(comment) {
  return normalizeBazaarCommentText(comment) === "";
}

function buildBazaarAdminCsvModel(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("bazaar_prices.csv が空です");
  }
  const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const indexes = {
    materialName: headers.indexOf("materialName"),
    itemCategory: headers.indexOf("item_category"),
    sortOrder: headers.indexOf("sort_order"),
    todayPrice: headers.indexOf("today_price"),
    previousDayPrice: headers.indexOf("previous_day_price"),
    updatedAt: headers.indexOf("updated_at"),
    comment: headers.indexOf("comment"),
    shopPrice: headers.indexOf("shop_price"),
    officialUrl: headers.indexOf("official_url"),
  };
  if (Object.values(indexes).some((value) => value < 0)) {
    throw new Error("bazaar_prices.csv ヘッダーが想定と一致しません");
  }

  const rows = lines
    .slice(1)
    .map((line, originalIndex) => ({ cells: parseCsvLine(line), lineNumber: originalIndex + 2, originalIndex }))
    .filter((entry) => entry.cells.some((cell) => String(cell || "").trim() !== ""))
    .map((entry, index) => {
      const cells = [...entry.cells];
      while (cells.length < headers.length) cells.push("");
      const materialName = String(cells[indexes.materialName] || "").trim();
      const itemCategory = String(cells[indexes.itemCategory] || "").trim();
      const sortOrderRaw = Number(cells[indexes.sortOrder]);
      const comment = String(cells[indexes.comment] || "").trim();
      return {
        id: `bazaar-admin-row-${index}`,
        cells,
        lineNumber: entry.lineNumber,
        originalIndex: entry.originalIndex,
        materialName,
        itemCategory,
        sortOrder: Number.isFinite(sortOrderRaw) ? sortOrderRaw : Number.MAX_SAFE_INTEGER,
        todayPriceText: String(cells[indexes.todayPrice] || "").trim(),
        previousDayPriceText: String(cells[indexes.previousDayPrice] || "").trim(),
        updatedAtText: String(cells[indexes.updatedAt] || "").trim(),
        comment,
        shopPriceText: String(cells[indexes.shopPrice] || "").trim(),
        officialUrl: parseOfficialUrl(cells[indexes.officialUrl]),
        excluded: isExcludedByComment(comment),
      };
    })
    .filter((row) => row.materialName !== "");

  return { headers, indexes, rows };
}

function serializeBazaarAdminCsvModel(model) {
  if (!model?.headers || !Array.isArray(model.rows)) return "";
  const lines = [];
  lines.push(model.headers.map((header) => escapeCsvValue(header)).join(","));
  const rowsInOriginalOrder = [...model.rows].sort(
    (a, b) => Number(a?.originalIndex ?? Number.MAX_SAFE_INTEGER) - Number(b?.originalIndex ?? Number.MAX_SAFE_INTEGER)
  );
  rowsInOriginalOrder.forEach((row) => {
    lines.push(row.cells.map((value) => escapeCsvValue(value)).join(","));
  });
  return `\uFEFF${lines.join("\n")}\n`;
}

function setBazaarAdminMessage(message, isError = false) {
  if (!bazaarAdminMessage) return;
  bazaarAdminMessage.textContent = message;
  bazaarAdminMessage.style.color = isError ? "#d93025" : "#4f5d75";
}

function updateBazaarAdminActionButtons() {
  const disabled = isBazaarAdminUpdating || !bazaarAdminCsvModel;
  if (bazaarAdminRefreshButton) bazaarAdminRefreshButton.disabled = isBazaarAdminUpdating;
  if (bazaarAdminUpdateCategoryButton) bazaarAdminUpdateCategoryButton.disabled = disabled;
  if (bazaarAdminUpdateAllButton) bazaarAdminUpdateAllButton.disabled = disabled;
  if (bazaarAdminDownloadButton) bazaarAdminDownloadButton.disabled = !bazaarAdminCsvModel || isBazaarAdminUpdating;
}

function extractBazaarPriceFromText(text) {
  const normalizedText = String(text || "").replace(/[()（）]/g, " ");
  const perUnitMatch = normalizedText.match(/ひとつあたり\s*([0-9,，,]+)\s*G/i);
  if (perUnitMatch) {
    return { priceText: normalizeBazaarAdminNumberText(perUnitMatch[1]), source: "per_unit" };
  }
  const totalPriceMatch = normalizedText.match(/価格\s*[:：]\s*([0-9,，,]+)\s*G/i);
  if (totalPriceMatch) {
    return { priceText: normalizeBazaarAdminNumberText(totalPriceMatch[1]), source: "total_price" };
  }
  return { priceText: "", source: "none" };
}

function extractUnitPrice(text) {
  return extractBazaarPriceFromText(text);
}

function applyPriceUpdate(row, newPrice) {
  const safePriceText = normalizeBazaarAdminNumberText(newPrice);
  if (!row || !safePriceText) return false;
  const currentToday = String(row.cells[bazaarAdminCsvModel.indexes.todayPrice] || "").trim();
  row.cells[bazaarAdminCsvModel.indexes.previousDayPrice] = currentToday;
  row.cells[bazaarAdminCsvModel.indexes.todayPrice] = safePriceText;
  row.cells[bazaarAdminCsvModel.indexes.updatedAt] = formatBazaarAdminTimestamp(new Date());
  row.todayPriceText = safePriceText;
  row.previousDayPriceText = currentToday;
  row.updatedAtText = String(row.cells[bazaarAdminCsvModel.indexes.updatedAt] || "");
  return true;
}

async function reloadBazaarAdminCsvModel() {
  const lines = await fetchCsvLines(BAZAAR_CSV_PATH);
  bazaarAdminCsvModel = buildBazaarAdminCsvModel(lines);
  bazaarAdminLastResults = new Map();
  bazaarAdminPastedTextByRowId = new Map();
  bazaarAdminAutoUpdateTimerByRowId = new Map();
}

function isBazaarAdminRowUpdated(row) {
  return bazaarAdminLastResults.get(row?.id)?.status === "success";
}

function sortBazaarAdminRows(rows, options = {}) {
  const prioritizeUnupdated = options.prioritizeUnupdated !== false;
  return [...rows].sort((a, b) => {
    if (prioritizeUnupdated) {
      const aUpdated = isBazaarAdminRowUpdated(a) ? 1 : 0;
      const bUpdated = isBazaarAdminRowUpdated(b) ? 1 : 0;
      if (aUpdated !== bUpdated) return aUpdated - bUpdated;
    }
    const categoryCompare = String(a.itemCategory || "").localeCompare(String(b.itemCategory || ""), "ja");
    if (categoryCompare !== 0) return categoryCompare;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    const materialCompare = String(a.materialName || "").localeCompare(String(b.materialName || ""), "ja");
    if (materialCompare !== 0) return materialCompare;
    return a.lineNumber - b.lineNumber;
  });
}

function getBazaarAdminFilteredUpdatableRows() {
  if (!bazaarAdminCsvModel) return [];
  const rowsByCategory = bazaarAdminCsvModel.rows.filter(
    (row) => selectedBazaarAdminCategory === "" || row.itemCategory === selectedBazaarAdminCategory
  );
  const updatableRowsByCategory = rowsByCategory.filter((row) => !row.excluded);
  const filteredUpdatableRows = updatableRowsByCategory.filter(
    (row) => !showBazaarAdminMonitoringOnly || isMonitoringByComment(row.comment)
  );
  return sortBazaarAdminRows(filteredUpdatableRows, { prioritizeUnupdated: prioritizeBazaarAdminUnupdated });
}

function openBazaarAdminUrlInSharedWindow(url) {
  const safeUrl = String(url || "").trim();
  if (!safeUrl) return false;
  const bazaarWindow = window.open(safeUrl, "bazaarWindow");
  if (bazaarWindow) {
    bazaarWindow.focus();
    return true;
  }
  return false;
}

function getNextBazaarAdminUnupdatedRow(currentRowId = "") {
  const sortedRows = getBazaarAdminFilteredUpdatableRows();
  if (sortedRows.length === 0) return null;
  const baseIndex = sortedRows.findIndex((row) => row.id === currentRowId);
  for (let nextIndex = baseIndex >= 0 ? baseIndex + 1 : 0; nextIndex < sortedRows.length; nextIndex += 1) {
    const nextRow = sortedRows[nextIndex];
    if (!nextRow || isBazaarAdminRowUpdated(nextRow) || !nextRow.officialUrl) continue;
    return nextRow;
  }
  return null;
}

function scrollToBazaarAdminRowById(rowId = "") {
  if (!rowId) return;
  const rowElement = bazaarAdminListWrap?.querySelector(`[data-bazaar-admin-row-id="${rowId}"]`);
  if (rowElement instanceof HTMLElement) {
    rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function getBazaarAdminNoNextRowMessage() {
  if (selectedBazaarAdminCategory) return "このカテゴリの未更新はありません。";
  return "全件更新完了です。";
}

function renderBazaarAdminPanel() {
  if (!bazaarAdminListWrap || !bazaarAdminCategorySelect) return;
  if (!bazaarAdminCsvModel) {
    bazaarAdminListWrap.innerHTML = "<p>管理CSVを読み込めていません。</p>";
    updateBazaarAdminActionButtons();
    return;
  }

  const categoryValues = Array.from(new Set(bazaarAdminCsvModel.rows.map((row) => row.itemCategory).filter(Boolean)));
  bazaarAdminCategorySelect.innerHTML = [
    `<option value="">すべてのカテゴリ</option>`,
    ...categoryValues.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`),
  ].join("");
  if (selectedBazaarAdminCategory && !categoryValues.includes(selectedBazaarAdminCategory)) {
    selectedBazaarAdminCategory = "";
  }
  bazaarAdminCategorySelect.value = selectedBazaarAdminCategory;

  const rowsByCategory = bazaarAdminCsvModel.rows.filter(
    (row) => selectedBazaarAdminCategory === "" || row.itemCategory === selectedBazaarAdminCategory
  );
  const updatableRowsByCategory = rowsByCategory.filter((row) => !row.excluded);
  const excludedRowsByCategory = rowsByCategory.filter((row) => row.excluded);
  const unupdatedCount = updatableRowsByCategory.filter((row) => !isBazaarAdminRowUpdated(row)).length;
  const filteredUpdatableRows = updatableRowsByCategory.filter(
    (row) => !showBazaarAdminMonitoringOnly || isMonitoringByComment(row.comment)
  );
  const sortedUpdatableRows = sortBazaarAdminRows(filteredUpdatableRows, { prioritizeUnupdated: prioritizeBazaarAdminUnupdated });
  const sortedExcludedRows = sortBazaarAdminRows(excludedRowsByCategory, { prioritizeUnupdated: false });

  const buildRowHtml = (row) => {
    const result = bazaarAdminLastResults.get(row.id);
    const statusClass = result?.status ? `is-${result.status}` : row.excluded ? "is-excluded" : "";
    const statusText = result?.message || (row.excluded ? "除外（固定価格）" : "未更新");
    const pastedText = bazaarAdminPastedTextByRowId.get(row.id) || "";
    return `
      <article class="bazaar-admin-row ${statusClass}" data-bazaar-admin-row-id="${escapeHtml(row.id)}">
        <div class="bazaar-admin-row-main">
          <p class="bazaar-admin-material">${escapeHtml(row.materialName)}</p>
          <p class="bazaar-admin-meta">${escapeHtml(row.itemCategory)} / today:${escapeHtml(row.todayPriceText || "-")} / prev:${escapeHtml(
            row.previousDayPriceText || "-"
          )}</p>
          <p class="bazaar-admin-meta">updated_at: ${escapeHtml(row.updatedAtText || "-")} / comment: ${escapeHtml(row.comment || "-")}</p>
          <p class="bazaar-admin-status">${escapeHtml(statusText)}</p>
        </div>
        <div class="bazaar-admin-row-actions">
          <button type="button" data-bazaar-admin-open-url="${escapeHtml(row.id)}" ${row.officialUrl ? "" : "disabled"}>URLを開く</button>
          <button type="button" data-bazaar-admin-update-row="${escapeHtml(row.id)}" ${row.excluded ? "disabled" : ""}>この行を更新</button>
          <label class="bazaar-admin-paste-field">
            <span>出品情報貼り付け欄</span>
            <textarea data-bazaar-admin-paste-input="${escapeHtml(row.id)}" rows="2" placeholder="公式ページの出品情報テキストを貼り付け">${escapeHtml(
              pastedText
            )}</textarea>
          </label>
        </div>
      </article>
    `;
  };

  const updatableRowsHtml = sortedUpdatableRows.map((row) => buildRowHtml(row)).join("");
  const excludedRowsHtml = sortedExcludedRows.map((row) => buildRowHtml(row)).join("");

  bazaarAdminListWrap.innerHTML = `
    <div class="bazaar-admin-summary">
      <span>更新対象 ${updatableRowsByCategory.length}件</span>
      <span>未更新 ${unupdatedCount}件</span>
      <span>除外 ${excludedRowsByCategory.length}件</span>
    </div>
    <div class="bazaar-admin-display-filters">
      <label class="field inline-field">
        <input id="bazaarAdminPrioritizeUnupdatedToggle" type="checkbox" ${prioritizeBazaarAdminUnupdated ? "checked" : ""} />
        <span>未更新優先表示</span>
      </label>
      <label class="field inline-field">
        <input id="bazaarAdminUpdatableOnlyToggle" type="checkbox" ${showBazaarAdminUpdatableOnly ? "checked" : ""} />
        <span>更新対象のみ表示</span>
      </label>
      <label class="field inline-field">
        <input id="bazaarAdminMonitoringOnlyToggle" type="checkbox" ${showBazaarAdminMonitoringOnly ? "checked" : ""} />
        <span>監視中のみ表示</span>
      </label>
      <label class="field inline-field">
        <input id="bazaarAdminAutoUpdateOnPasteToggle" type="checkbox" ${bazaarAdminAutoUpdateOnPaste ? "checked" : ""} />
        <span>貼り付けで自動更新</span>
      </label>
      <label class="field inline-field">
        <input id="bazaarAdminAutoOpenNextUrlToggle" type="checkbox" ${bazaarAdminAutoOpenNextUrlAfterUpdate ? "checked" : ""} />
        <span>更新後に次URLを自動で開く</span>
      </label>
      <label class="field inline-field">
        <input id="bazaarAdminAutoScrollNextRowToggle" type="checkbox" ${bazaarAdminAutoScrollNextRowAfterUpdate ? "checked" : ""} />
        <span>更新後に次の行へスクロール</span>
      </label>
    </div>
    <section class="bazaar-admin-section">
      <h3>更新対象一覧</h3>
      ${updatableRowsHtml || "<p>対象行がありません。</p>"}
    </section>
    ${
      showBazaarAdminUpdatableOnly
        ? ""
        : `<section class="bazaar-admin-section bazaar-admin-section-excluded">
            <h3>除外一覧（固定価格）</h3>
            ${excludedRowsHtml || "<p>対象行がありません。</p>"}
          </section>`
    }
  `;

  const prioritizeToggle = bazaarAdminListWrap.querySelector("#bazaarAdminPrioritizeUnupdatedToggle");
  if (prioritizeToggle) {
    prioritizeToggle.addEventListener("change", (event) => {
      prioritizeBazaarAdminUnupdated = Boolean(event.target?.checked);
      renderBazaarAdminPanel();
    });
  }
  const updatableOnlyToggle = bazaarAdminListWrap.querySelector("#bazaarAdminUpdatableOnlyToggle");
  if (updatableOnlyToggle) {
    updatableOnlyToggle.addEventListener("change", (event) => {
      showBazaarAdminUpdatableOnly = Boolean(event.target?.checked);
      renderBazaarAdminPanel();
    });
  }
  const monitoringOnlyToggle = bazaarAdminListWrap.querySelector("#bazaarAdminMonitoringOnlyToggle");
  if (monitoringOnlyToggle) {
    monitoringOnlyToggle.addEventListener("change", (event) => {
      showBazaarAdminMonitoringOnly = Boolean(event.target?.checked);
      renderBazaarAdminPanel();
    });
  }
  const autoUpdateOnPasteToggle = bazaarAdminListWrap.querySelector("#bazaarAdminAutoUpdateOnPasteToggle");
  if (autoUpdateOnPasteToggle) {
    autoUpdateOnPasteToggle.addEventListener("change", (event) => {
      bazaarAdminAutoUpdateOnPaste = Boolean(event.target?.checked);
      setBazaarAdminMessage(
        bazaarAdminAutoUpdateOnPaste ? "貼り付けで自動更新をONにしました。" : "貼り付けで自動更新をOFFにしました。"
      );
    });
  }
  const autoOpenNextUrlToggle = bazaarAdminListWrap.querySelector("#bazaarAdminAutoOpenNextUrlToggle");
  if (autoOpenNextUrlToggle) {
    autoOpenNextUrlToggle.addEventListener("change", (event) => {
      bazaarAdminAutoOpenNextUrlAfterUpdate = Boolean(event.target?.checked);
      setBazaarAdminMessage(
        bazaarAdminAutoOpenNextUrlAfterUpdate
          ? "更新後に次URLを自動で開くをONにしました。"
          : "更新後に次URLを自動で開くをOFFにしました。"
      );
    });
  }
  const autoScrollNextRowToggle = bazaarAdminListWrap.querySelector("#bazaarAdminAutoScrollNextRowToggle");
  if (autoScrollNextRowToggle) {
    autoScrollNextRowToggle.addEventListener("change", (event) => {
      bazaarAdminAutoScrollNextRowAfterUpdate = Boolean(event.target?.checked);
      setBazaarAdminMessage(
        bazaarAdminAutoScrollNextRowAfterUpdate
          ? "更新後に次の行へスクロールをONにしました。"
          : "更新後に次の行へスクロールをOFFにしました。"
      );
    });
  }
  updateBazaarAdminActionButtons();
}

async function updateBazaarAdminSingleRow(row) {
  if (!row || row.excluded) {
    return { status: "excluded", message: "除外（固定価格）" };
  }
  const pastedText = String(bazaarAdminPastedTextByRowId.get(row.id) || "").trim();
  if (!pastedText) {
    return { status: "extract-fail", message: "抽出失敗（貼り付け未入力）" };
  }
  const extracted = extractUnitPrice(pastedText);
  if (!extracted.priceText) {
    return { status: "extract-fail", message: "抽出失敗（today/prevは変更なし）" };
  }

  const applied = applyPriceUpdate(row, extracted.priceText);
  if (!applied) {
    return { status: "extract-fail", message: "抽出失敗（today/prevは変更なし）" };
  }
  return {
    status: "success",
    message: extracted.source === "per_unit" ? `更新成功（ひとつあたり ${extracted.priceText}G）` : `更新成功（代替: 価格 ${extracted.priceText}G）`,
  };
}

async function runBazaarAdminBatchUpdate(options = {}) {
  if (!bazaarAdminCsvModel || isBazaarAdminUpdating) return;
  const category = String(options.category || "").trim();
  const targetRows = bazaarAdminCsvModel.rows.filter((row) => !row.excluded && (category === "" || row.itemCategory === category));
  if (targetRows.length === 0) {
    setBazaarAdminMessage("更新対象がありません。");
    return;
  }

  isBazaarAdminUpdating = true;
  updateBazaarAdminActionButtons();
  setBazaarAdminMessage(`更新中... 対象 ${targetRows.length} 件`);
  let successCount = 0;
  let extractFailCount = 0;
  let excludedCount = 0;
  try {
    for (const row of targetRows) {
      const result = await updateBazaarAdminSingleRow(row);
      bazaarAdminLastResults.set(row.id, result);
      if (result.status === "success") successCount += 1;
      else if (result.status === "excluded") excludedCount += 1;
      else extractFailCount += 1;
    }
  } finally {
    isBazaarAdminUpdating = false;
    updateBazaarAdminActionButtons();
    renderBazaarAdminPanel();
  }
  setBazaarAdminMessage(`更新完了: 更新成功 ${successCount}件 / 抽出失敗 ${extractFailCount}件 / 除外 ${excludedCount}件`);
}

async function runBazaarAdminSingleRowUpdateById(rowId, options = {}) {
  if (!bazaarAdminCsvModel || !rowId || isBazaarAdminUpdating) return null;
  const row = bazaarAdminCsvModel.rows.find((entry) => entry.id === rowId);
  if (!row) return null;
  const shouldScrollToNext = options.scrollToNext === true;
  const shouldAutoOpenNextUrl = options.autoOpenNextUrl === true;
  const silentMessage = options.silentMessage === true;

  isBazaarAdminUpdating = true;
  updateBazaarAdminActionButtons();
  let result = null;
  try {
    result = await updateBazaarAdminSingleRow(row);
    bazaarAdminLastResults.set(row.id, result);
    if (!silentMessage) {
      setBazaarAdminMessage(`${row.materialName}: ${result.message}`);
    }
  } catch (error) {
    console.error("行単位更新に失敗しました", error);
    result = { status: "extract-fail", message: "抽出失敗" };
    bazaarAdminLastResults.set(row.id, result);
    if (!silentMessage) {
      setBazaarAdminMessage(`${row.materialName}: 抽出失敗`, true);
    }
  } finally {
    isBazaarAdminUpdating = false;
    updateBazaarAdminActionButtons();
    renderBazaarAdminPanel();
  }
  if (result?.status === "success" && (shouldScrollToNext || shouldAutoOpenNextUrl)) {
    const nextRow = getNextBazaarAdminUnupdatedRow(row.id);
    if (!nextRow) {
      setBazaarAdminMessage(getBazaarAdminNoNextRowMessage());
      return result;
    }
    if (shouldScrollToNext) {
      scrollToBazaarAdminRowById(nextRow.id);
    }
    if (shouldAutoOpenNextUrl) {
      window.setTimeout(() => {
        const opened = openBazaarAdminUrlInSharedWindow(nextRow.officialUrl);
        if (!opened) {
          setBazaarAdminMessage("次のURLを開けませんでした。", true);
        }
      }, bazaarAdminAutoAdvanceDelayMs);
    }
  }
  return result;
}

async function loadPresentCodesCsv() {
  const lines = await fetchCsvLines(PRESENT_CODES_CSV_PATH);
  return parsePresentCodesFromLines(lines);
}

function parseFieldFarmingMonstersFromLines(lines) {
  if (!Array.isArray(lines) || lines.length <= 1) return [];
  const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const monsterAreaIndex = headers.indexOf("monster_area");
  const monsterNameIndex = headers.indexOf("monster_name");
  const areaIndex = headers.indexOf("area");
  const hpIndex = headers.indexOf("hp");
  const normalDropIndex = headers.indexOf("normal_dr") >= 0 ? headers.indexOf("normal_dr") : headers.indexOf("normal_drop");
  const rareDropIndex = headers.indexOf("rare_drop");
  const noteIndex = headers.indexOf("note");
  const mapUrlIndex = headers.indexOf("map_url");

  if (hpIndex < 0 || normalDropIndex < 0 || rareDropIndex < 0) {
    throw new Error("field_farming_monsters.csv ヘッダーが想定と一致しません");
  }

  return lines
    .slice(1)
    .map((line) => parseCsvLine(line))
    .map((row, index) => {
      const monsterAreaRaw =
        monsterAreaIndex >= 0
          ? String(row[monsterAreaIndex] || "").trim()
          : [String(row[monsterNameIndex] || "").trim(), String(row[areaIndex] || "").trim()].filter(Boolean).join(" / ");
      const hp = parseNullableNumber(row[hpIndex]);
      return {
        id: `field-farming-row-${index}`,
        monsterName: String(row[monsterNameIndex] || "").trim(),
        area: String(row[areaIndex] || "").trim(),
        monsterArea: monsterAreaRaw,
        hp: Number.isFinite(hp) ? Math.round(hp) : null,
        normalDrop: String(row[normalDropIndex] || "").trim(),
        rareDrop: String(row[rareDropIndex] || "").trim(),
        note: noteIndex >= 0 ? String(row[noteIndex] || "").trim() : "",
        mapUrl: mapUrlIndex >= 0 ? String(row[mapUrlIndex] || "").trim() : "",
      };
    })
    .filter((row) => row.monsterArea !== "" && row.normalDrop !== "");
}

async function loadFieldFarmingMonstersCsv() {
  const lines = await fetchCsvLines(FIELD_FARMING_CSV_PATH);
  return parseFieldFarmingMonstersFromLines(lines);
}

function splitMonsterNames(rawText) {
  return String(rawText || "")
    .split(",")
    .map((name) => String(name || "").trim())
    .filter((name) => name !== "");
}

function mergeUniqueMonsterNames(currentNames, newNames) {
  const merged = [...(Array.isArray(currentNames) ? currentNames : [])];
  (Array.isArray(newNames) ? newNames : []).forEach((name) => {
    const normalizedName = String(name || "").trim();
    if (normalizedName !== "" && !merged.includes(normalizedName)) {
      merged.push(normalizedName);
    }
  });
  return merged;
}

function getOrbCategoryClassName(category) {
  const normalizedCategory = normalizeOrbCategoryName(category);
  const categoryClassMap = {
    炎: "fire",
    水: "water",
    風: "wind",
    光: "light",
    闇: "dark",
  };
  return categoryClassMap[normalizedCategory] || "other";
}

function getOrbCategorySortOrder(category) {
  const order = ["炎", "水", "風", "光", "闇"];
  const index = order.indexOf(normalizeOrbCategoryName(category));
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function compareOrbEntries(a, b) {
  const categoryDiff = getOrbCategorySortOrder(a?.orbCategory) - getOrbCategorySortOrder(b?.orbCategory);
  if (categoryDiff !== 0) return categoryDiff;

  const orbIdA = String(a?.orbId || "").trim();
  const orbIdB = String(b?.orbId || "").trim();
  const hasOrbIdA = orbIdA !== "";
  const hasOrbIdB = orbIdB !== "";
  if (hasOrbIdA !== hasOrbIdB) return hasOrbIdA ? -1 : 1;
  if (hasOrbIdA && hasOrbIdB) {
    const numericA = Number(orbIdA);
    const numericB = Number(orbIdB);
    const bothNumeric = Number.isFinite(numericA) && Number.isFinite(numericB);
    if (bothNumeric && numericA !== numericB) return numericA - numericB;
    const orbIdTextDiff = orbIdA.localeCompare(orbIdB, "ja");
    if (orbIdTextDiff !== 0) return orbIdTextDiff;
  }

  return String(a?.orbName || "").localeCompare(String(b?.orbName || ""), "ja");
}

function parseWhiteBoxCsvFromLines(lines) {
  if (lines.length <= 1) return [];
  const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const monsterIdIndex = headers.indexOf("monster_id");
  const monsterNameIndex = headers.indexOf("monster_name");
  const itemNameIndex = headers.indexOf("item_name");
  const itemSlotIndex = headers.indexOf("item_slot");
  const equipmentLevelIndex = headers.indexOf("equipment_level");
  const dropStatusIndex = headers.indexOf("drop_status");

  if (monsterIdIndex < 0 || monsterNameIndex < 0 || itemNameIndex < 0 || itemSlotIndex < 0 || equipmentLevelIndex < 0 || dropStatusIndex < 0) {
    throw new Error("white_box.csv ヘッダーが想定と一致しません");
  }

  const groupedByItemName = new Map();
  lines.slice(1).forEach((line, rowIndex) => {
    const row = parseCsvLine(line);
    const itemName = String(row[itemNameIndex] || "").trim();
    if (itemName === "") return;

    const itemSlot = normalizeWhiteBoxSlot(row[itemSlotIndex]);
    const equipmentLevel = parseEquipmentLevel(row[equipmentLevelIndex]);
    const monsterId = String(row[monsterIdIndex] || "").trim();
    const monsterName = String(row[monsterNameIndex] || "").trim();
    const dropStatus = String(row[dropStatusIndex] || "").trim().toLowerCase();
    const isHasDrop = dropStatus === "has_drop";

    if (!groupedByItemName.has(itemName)) {
      groupedByItemName.set(itemName, {
        id: `white-box-item-${rowIndex + 1}`,
        itemName,
        itemSlot,
        equipmentLevel,
        monsters: [],
        hasDropMonster: false,
      });
    }

    const current = groupedByItemName.get(itemName);
    if (!current.itemSlot && itemSlot) current.itemSlot = itemSlot;
    if (!Number.isFinite(current.equipmentLevel) && Number.isFinite(equipmentLevel)) {
      current.equipmentLevel = equipmentLevel;
    }

    if (isHasDrop && monsterName) {
      current.hasDropMonster = true;
      const duplicate = current.monsters.some(
        (monster) => monster.monsterId === monsterId && monster.monsterName === monsterName
      );
      if (!duplicate) {
        current.monsters.push({
          monsterId,
          monsterName,
        });
      }
    }
  });

  return Array.from(groupedByItemName.values()).sort((a, b) => String(a.itemName || "").localeCompare(String(b.itemName || ""), "ja"));
}

async function loadWhiteBoxCsv() {
  const lines = await fetchCsvLines(WHITE_BOX_CSV_PATH);
  return parseWhiteBoxCsvFromLines(lines);
}

function parseEquipmentDbId(rawId) {
  const normalized = String(rawId || "").trim();
  const matched = normalized.match(/\d+/);
  if (!matched) return Number.MAX_SAFE_INTEGER;
  const parsed = Number(matched[0]);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function parseEquipmentDbShieldGuardRate(value) {
  const normalized = String(value ?? "").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized.replace(/,/g, "").replace(/%/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function splitEquipmentDbTraitEntries(rawTrait) {
  return String(rawTrait || "")
    .split(/\r?\n|\/|／/g)
    .map((trait) => trait.trim())
    .filter((trait) => trait !== "");
}

function parseEquipmentDbCsvFromLines(lines) {
  if (lines.length <= 1) return [];
  const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const equipmentIdIndex = headers.indexOf("equipment_id");
  const equipmentGroupIndex = headers.indexOf("equipment_group");
  const equipmentLevelIndex = headers.indexOf("equipment_level");
  const equipmentTypeIndex = headers.indexOf("equipment_type");
  const equipmentNameIndex = headers.indexOf("equipment_name");
  const attackIndex = headers.indexOf("attack");
  const attackMagicIndex = headers.indexOf("attack_magic");
  const healMagicIndex = headers.indexOf("heal_magic");
  const defenseIndex = headers.indexOf("defense");
  const shieldGuardRateIndex = headers.indexOf("shield_guard_rate") >= 0 ? headers.indexOf("shield_guard_rate") : headers.indexOf("shield_guard");
  const hpIndex = headers.indexOf("hp");
  const mpIndex = headers.indexOf("mp");
  const speedIndex = headers.indexOf("speed");
  const dexIndex = headers.indexOf("dex");
  const fashionableIndex = headers.indexOf("fashionable");
  const weightIndex = headers.indexOf("weight");
  const traitsIndex = headers.indexOf("traits");

  if (
    equipmentIdIndex < 0 ||
    equipmentGroupIndex < 0 ||
    equipmentLevelIndex < 0 ||
    equipmentTypeIndex < 0 ||
    equipmentNameIndex < 0 ||
    attackIndex < 0 ||
    attackMagicIndex < 0 ||
    healMagicIndex < 0 ||
    defenseIndex < 0 ||
    shieldGuardRateIndex < 0 ||
    hpIndex < 0 ||
    mpIndex < 0 ||
    speedIndex < 0 ||
    dexIndex < 0 ||
    fashionableIndex < 0 ||
    weightIndex < 0 ||
    traitsIndex < 0
  ) {
    throw new Error("equipment_data.csv ヘッダーが想定と一致しません");
  }

  const groupedById = new Map();
  lines.slice(1).forEach((line, rowIndex) => {
    const row = parseCsvLine(line);
    const equipmentId = String(row[equipmentIdIndex] || "").trim();
    const equipmentName = String(row[equipmentNameIndex] || "").trim();
    if (equipmentId === "" || equipmentName === "") return;

    const equipmentGroup = String(row[equipmentGroupIndex] || "").trim();
    const equipmentType = String(row[equipmentTypeIndex] || "").trim();
    const equipmentLevel = parseEquipmentLevel(row[equipmentLevelIndex]);
    const attack = parseNullableNumber(row[attackIndex]);
    const attackMagic = parseNullableNumber(row[attackMagicIndex]);
    const healMagic = parseNullableNumber(row[healMagicIndex]);
    const defense = parseNullableNumber(row[defenseIndex]);
    const shieldGuardRate = parseEquipmentDbShieldGuardRate(row[shieldGuardRateIndex]);
    const hp = parseNullableNumber(row[hpIndex]);
    const mp = parseNullableNumber(row[mpIndex]);
    const speed = parseNullableNumber(row[speedIndex]);
    const dex = parseNullableNumber(row[dexIndex]);
    const fashionable = parseNullableNumber(row[fashionableIndex]);
    const weight = parseNullableNumber(row[weightIndex]);
    const traits = splitEquipmentDbTraitEntries(row[traitsIndex]);

    const groupingKey = equipmentGroup === "armor" ? `armor:${equipmentName}` : `weapon:${equipmentId}`;

    if (!groupedById.has(groupingKey)) {
      groupedById.set(groupingKey, {
        id: `equipment-db-item-${rowIndex + 1}`,
        equipmentId,
        equipmentIdNumber: parseEquipmentDbId(equipmentId),
        equipmentGroup,
        equipmentLevel,
        equipmentType,
        equipmentName,
        attack,
        attackMagic,
        healMagic,
        defense,
        shieldGuardRate,
        hp,
        mp,
        speed,
        dex,
        fashionable,
        weight,
        traits: [],
      });
    }

    const current = groupedById.get(groupingKey);
    if (!current.equipmentGroup && equipmentGroup) current.equipmentGroup = equipmentGroup;
    if (!current.equipmentType && equipmentType) current.equipmentType = equipmentType;
    if ((current.equipmentIdNumber || Number.MAX_SAFE_INTEGER) > parseEquipmentDbId(equipmentId)) {
      current.equipmentIdNumber = parseEquipmentDbId(equipmentId);
    }
    if (!Number.isFinite(current.equipmentLevel) && Number.isFinite(equipmentLevel)) current.equipmentLevel = equipmentLevel;
    if (!Number.isFinite(current.attack) && Number.isFinite(attack)) current.attack = attack;
    if (!Number.isFinite(current.attackMagic) && Number.isFinite(attackMagic)) current.attackMagic = attackMagic;
    if (!Number.isFinite(current.healMagic) && Number.isFinite(healMagic)) current.healMagic = healMagic;
    if (!Number.isFinite(current.defense) && Number.isFinite(defense)) current.defense = defense;
    if (!Number.isFinite(current.shieldGuardRate) && Number.isFinite(shieldGuardRate)) current.shieldGuardRate = shieldGuardRate;
    if (!Number.isFinite(current.hp) && Number.isFinite(hp)) current.hp = hp;
    if (!Number.isFinite(current.mp) && Number.isFinite(mp)) current.mp = mp;
    if (!Number.isFinite(current.speed) && Number.isFinite(speed)) current.speed = speed;
    if (!Number.isFinite(current.dex) && Number.isFinite(dex)) current.dex = dex;
    if (!Number.isFinite(current.fashionable) && Number.isFinite(fashionable)) current.fashionable = fashionable;
    if (!Number.isFinite(current.weight) && Number.isFinite(weight)) current.weight = weight;
    traits.forEach((trait) => {
      if (!current.traits.includes(trait)) current.traits.push(trait);
    });
  });

  return Array.from(groupedById.values()).sort((a, b) => {
    const idDiff = a.equipmentIdNumber - b.equipmentIdNumber;
    if (idDiff !== 0) return idDiff;
    return String(a.equipmentId || "").localeCompare(String(b.equipmentId || ""), "ja");
  });
}

async function loadEquipmentDbCsv() {
  const lines = await fetchCsvLines(EQUIPMENT_DB_CSV_PATH);
  return parseEquipmentDbCsvFromLines(lines);
}

function buildWhiteBoxSummaryByItemName(entries) {
  const summaryByName = new Map();
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    const itemName = String(entry?.itemName || "").trim();
    if (itemName === "") return;
    const monsters = Array.isArray(entry?.monsters)
      ? entry.monsters
          .map((monster) => String(monster?.monsterName || "").trim())
          .filter((monsterName) => monsterName !== "")
      : [];
    const uniqueMonsterNames = Array.from(new Set(monsters));
    summaryByName.set(itemName, {
      hasDropMonster: uniqueMonsterNames.length > 0,
      monsterNames: uniqueMonsterNames,
    });
  });
  return summaryByName;
}

function attachWhiteBoxDropsToEquipmentEntries(entries, whiteBoxSummaryByName) {
  return (Array.isArray(entries) ? entries : []).map((entry) => {
    const equipmentName = String(entry?.equipmentName || "").trim();
    const equipmentGroup = String(entry?.equipmentGroup || "").trim();
    const isArmor = equipmentGroup === "armor";
    const whiteBoxSummary = !isArmor ? whiteBoxSummaryByName.get(equipmentName) : null;
    const armorWhiteBoxDropsBySlot = isArmor ? buildArmorWhiteBoxDropsBySlot(equipmentName, whiteBoxEntries) : [];
    const armorWhiteBoxMonsterNames = armorWhiteBoxDropsBySlot.flatMap((slotEntry) =>
      slotEntry.items.flatMap((item) => item.monsterNames)
    );
    const armorUniqueMonsterNames = Array.from(new Set(armorWhiteBoxMonsterNames));
    return {
      ...entry,
      whiteBoxHasDrop: isArmor ? armorUniqueMonsterNames.length > 0 : Boolean(whiteBoxSummary?.hasDropMonster),
      whiteBoxMonsterNames: isArmor ? armorUniqueMonsterNames : Array.isArray(whiteBoxSummary?.monsterNames) ? whiteBoxSummary.monsterNames : [],
      whiteBoxArmorDropsBySlot: armorWhiteBoxDropsBySlot,
    };
  });
}

function stripArmorSetSuffix(name) {
  const normalizedName = String(name || "").trim();
  return normalizedName.endsWith("セット") ? normalizedName.slice(0, -3) : normalizedName;
}

function buildArmorWhiteBoxDropsBySlot(equipmentName, whiteBoxDataEntries) {
  const setKey = stripArmorSetSuffix(equipmentName);
  if (setKey === "") return [];

  const groupedBySlot = new Map();
  (Array.isArray(whiteBoxDataEntries) ? whiteBoxDataEntries : []).forEach((entry) => {
    const itemName = String(entry?.itemName || "").trim();
    if (!itemName.startsWith(setKey)) return;
    if (!entry?.hasDropMonster) return;
    const slot = String(entry?.itemSlot || "").trim() || "不明";
    const monsterNames = Array.isArray(entry?.monsters)
      ? Array.from(
          new Set(
            entry.monsters
              .map((monster) => String(monster?.monsterName || "").trim())
              .filter((monsterName) => monsterName !== "")
          )
        )
      : [];
    if (monsterNames.length === 0) return;

    if (!groupedBySlot.has(slot)) groupedBySlot.set(slot, []);
    groupedBySlot.get(slot).push({
      itemName,
      monsterNames,
    });
  });

  return Array.from(groupedBySlot.entries())
    .sort((a, b) => {
      const slotDiff = getWhiteBoxSlotSortOrder(a[0], "armor") - getWhiteBoxSlotSortOrder(b[0], "armor");
      if (slotDiff !== 0) return slotDiff;
      return String(a[0]).localeCompare(String(b[0]), "ja");
    })
    .map(([slot, items]) => ({
      slot,
      items: items.sort((a, b) => String(a.itemName || "").localeCompare(String(b.itemName || ""), "ja")),
    }));
}

function isArmorSlot(itemSlot) {
  return WHITE_BOX_ARMOR_SLOTS.has(String(itemSlot || "").trim());
}

function normalizeWhiteBoxSlot(rawSlot) {
  const slot = String(rawSlot || "").trim();
  if (slot === "") return "";
  return WHITE_BOX_SLOT_NORMALIZE_MAP.get(slot) || slot;
}

function getWhiteBoxTypeBySlot(itemSlot) {
  return isArmorSlot(itemSlot) ? "armor" : "weapon";
}

function getWhiteBoxSlotSortOrder(itemSlot, type) {
  const order = type === "armor" ? WHITE_BOX_ARMOR_SLOT_ORDER : WHITE_BOX_WEAPON_SLOT_ORDER;
  const index = order.indexOf(String(itemSlot || "").trim());
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function compareWhiteBoxEntries(a, b) {
  const levelA = Number.isFinite(a?.equipmentLevel) ? a.equipmentLevel : Number.MAX_SAFE_INTEGER;
  const levelB = Number.isFinite(b?.equipmentLevel) ? b.equipmentLevel : Number.MAX_SAFE_INTEGER;
  const levelDiff = selectedWhiteBoxSort === "level_desc" ? levelB - levelA : levelA - levelB;
  if (levelDiff !== 0) return levelDiff;
  return String(a?.itemName || "").localeCompare(String(b?.itemName || ""), "ja");
}

function getWhiteBoxFilteredEntries() {
  const normalizedKeyword = normalizeSearchKeyword(whiteBoxKeyword);
  return (whiteBoxEntries || [])
    .filter((entry) => getWhiteBoxTypeBySlot(entry.itemSlot) === selectedWhiteBoxType)
    .filter((entry) => selectedWhiteBoxSlot === "" || String(entry.itemSlot || "") === selectedWhiteBoxSlot)
    .filter((entry) => {
      if (normalizedKeyword === "") return true;
      const monsterNames = Array.isArray(entry.monsters) ? entry.monsters.map((monster) => monster.monsterName) : [];
      return [entry.itemName, entry.itemSlot, ...monsterNames].join(" ").toLowerCase().includes(normalizedKeyword);
    })
    .sort(compareWhiteBoxEntries);
}

async function loadOrbDataCsv() {
  const [orbLines, monsterLines] = await Promise.all([fetchCsvLines(ORB_DATA_CSV_PATH), fetchCsvLines(MONSTER_DATA_CSV_PATH)]);
  const orbHeaders = parseCsvLine(orbLines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const orbIdIndex = orbHeaders.indexOf("orb_id");
  const orbNameIndex = orbHeaders.indexOf("orb_name");
  const orbCategoryIndex = orbHeaders.indexOf("orb_category");
  const effectIndex = orbHeaders.indexOf("effect");
  const monsterNamesIndex = orbHeaders.indexOf("monster_name");

  if (orbIdIndex < 0 || orbNameIndex < 0 || orbCategoryIndex < 0 || effectIndex < 0) {
    throw new Error("orb_data.csv ヘッダーが想定と一致しません");
  }

  const monsterHeaders = parseCsvLine(monsterLines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const monsterIdIndex = monsterHeaders.indexOf("monster_id");
  const monsterNameIndex = monsterHeaders.indexOf("monster_name");
  if (monsterIdIndex < 0 || monsterNameIndex < 0) {
    throw new Error("monster_data.csv ヘッダーが想定と一致しません");
  }

  const monsterNameById = new Map();
  for (let i = 1; i < monsterLines.length; i += 1) {
    const row = parseCsvLine(monsterLines[i]);
    const monsterId = String(row[monsterIdIndex] || "").trim();
    const monsterName = String(row[monsterNameIndex] || "").trim();
    if (monsterId !== "" && monsterName !== "") {
      monsterNameById.set(monsterId, monsterName);
    }
  }

  const monsterNamesByOrbId = new Map();
  if (monsterNamesIndex >= 0) {
    for (let i = 1; i < orbLines.length; i += 1) {
      const row = parseCsvLine(orbLines[i]);
      const orbId = String(row[orbIdIndex] || "").trim();
      if (orbId === "") continue;
      const currentNames = monsterNamesByOrbId.get(orbId) || [];
      monsterNamesByOrbId.set(orbId, mergeUniqueMonsterNames(currentNames, splitMonsterNames(row[monsterNamesIndex])));
    }
  }

  try {
    const orbMonsterLines = await fetchCsvLines(ORB_MONSTERS_CSV_PATH);
    const relationHeaders = parseCsvLine(orbMonsterLines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
    const relationOrbIdIndex = relationHeaders.indexOf("orb_id");
    const relationMonsterIdIndex = relationHeaders.indexOf("monster_id");
    const relationMonsterNameIndex = relationHeaders.indexOf("monster_name");
    if (relationOrbIdIndex >= 0 && (relationMonsterIdIndex >= 0 || relationMonsterNameIndex >= 0)) {
      for (let i = 1; i < orbMonsterLines.length; i += 1) {
        const row = parseCsvLine(orbMonsterLines[i]);
        const orbId = String(row[relationOrbIdIndex] || "").trim();
        if (orbId === "") continue;
        const resolvedMonsterName =
          relationMonsterNameIndex >= 0
            ? String(row[relationMonsterNameIndex] || "").trim()
            : monsterNameById.get(String(row[relationMonsterIdIndex] || "").trim()) || "";
        if (!resolvedMonsterName) continue;
        const currentNames = monsterNamesByOrbId.get(orbId) || [];
        monsterNamesByOrbId.set(orbId, mergeUniqueMonsterNames(currentNames, [resolvedMonsterName]));
      }
    }
  } catch {
    // orb_monsters.csv は任意ファイル扱い
  }

  const groupedEntriesByOrbId = new Map();
  const groupedEntriesFallback = [];

  orbLines
    .slice(1)
    .map((line) => parseCsvLine(line))
    .map((row, rowIndex) => {
      const orbId = String(row[orbIdIndex] || "").trim();
      const resolvedMonsterNames = mergeUniqueMonsterNames(monsterNamesByOrbId.get(orbId) || [], splitMonsterNames(row[monsterNamesIndex]));
      const orbEntry = {
        id: orbId || `orb-row-${rowIndex + 1}`,
        orbId,
        orbName: String(row[orbNameIndex] || "").trim(),
        orbCategory: String(row[orbCategoryIndex] || "").trim(),
        effect: String(row[effectIndex] || "").trim(),
        monsterNames: resolvedMonsterNames,
      };
      if (orbEntry.orbName === "") return;
      if (orbId === "") {
        groupedEntriesFallback.push(orbEntry);
        return;
      }
      const existing = groupedEntriesByOrbId.get(orbId);
      if (!existing) {
        groupedEntriesByOrbId.set(orbId, orbEntry);
        return;
      }
      groupedEntriesByOrbId.set(orbId, {
        ...existing,
        orbName: existing.orbName || orbEntry.orbName,
        orbCategory: existing.orbCategory || orbEntry.orbCategory,
        effect: existing.effect || orbEntry.effect,
        monsterNames: mergeUniqueMonsterNames(existing.monsterNames, orbEntry.monsterNames),
      });
    });

  return [...groupedEntriesByOrbId.values(), ...groupedEntriesFallback].sort(compareOrbEntries);
}

function buildPresentCodeUrl(code) {
  const encodedCode = encodeURIComponent(String(code || "").trim());
  return `${OFFICIAL_PRESENT_CODE_URL}?code=${encodedCode}`;
}

function buildPresentCodeLink(row) {
  if (row?.linkType === "url" && row?.url) return row.url;
  return buildPresentCodeUrl(row?.code);
}

function getPresentCodePrimaryLabel(row) {
  return row?.linkType === "url" ? "受け取り" : "じゅもん";
}

function normalizeMaterialNameKey(name) {
  return String(name || "").trim();
}

function getPreferredBazaarUnitPrice(row) {
  if (Number.isFinite(row?.todayPrice)) return Math.round(row.todayPrice);
  if (Number.isFinite(row?.displayPrice)) return Math.round(row.displayPrice);
  return null;
}

function syncMaterialPricesWithBazaar(materials, bazaarRows) {
  const bazaarPriceByName = new Map();
  (bazaarRows || []).forEach((row) => {
    const materialNameKey = normalizeMaterialNameKey(row?.materialName);
    const preferredPrice = getPreferredBazaarUnitPrice(row);
    if (materialNameKey === "" || !Number.isFinite(preferredPrice)) return;
    bazaarPriceByName.set(materialNameKey, preferredPrice);
  });

  let matchedCount = 0;
  let updatedCount = 0;
  const nextMaterials = (materials || []).map((material) => {
    const materialNameKey = normalizeMaterialNameKey(material?.name);
    const bazaarPrice = bazaarPriceByName.get(materialNameKey);
    if (!Number.isFinite(bazaarPrice)) {
      return material;
    }

    matchedCount += 1;
    const normalizedCurrentPrice = Number(material?.price || 0);
    if (normalizedCurrentPrice === bazaarPrice) {
      return material;
    }

    updatedCount += 1;
    return {
      ...material,
      price: bazaarPrice,
    };
  });

  return {
    materials: nextMaterials,
    matchedCount,
    updatedCount,
  };
}

function getOfficialBazaarUrlByMaterialName(materialName) {
  const normalizedMaterialName = normalizeMaterialNameKey(materialName);
  if (normalizedMaterialName !== "") {
    const matchedRow = bazaarPrices.find((row) => normalizeMaterialNameKey(row?.materialName) === normalizedMaterialName);
    if (matchedRow?.officialUrl) {
      return matchedRow.officialUrl;
    }
  }
  return OFFICIAL_BAZAAR_TOP_URL;
}

async function loadBazaarPricesCsv() {
  const lines = await fetchCsvLines(BAZAAR_CSV_PATH);
  return parseBazaarPricesFromLines(lines);
}

async function ensureCraftIdealValuesLoaded() {
  if (hasLoadedCraftIdealValues || isCraftIdealValuesLoading) return craftIdealValuesLoadingPromise;
  isCraftIdealValuesLoading = true;
  craftIdealValuesLoadingPromise = (async () => {
    try {
      state.craftIdealValues = await loadCraftIdealValuesCsv();
      hasLoadedCraftIdealValues = true;
    } catch (error) {
      console.error(`craft_ideal_values.csv の読み込みに失敗しました: path=${CRAFT_IDEAL_VALUES_CSV_PATH}`, error);
      state.craftIdealValues = [];
    } finally {
      isCraftIdealValuesLoading = false;
    }
  })();
  return craftIdealValuesLoadingPromise;
}

async function ensurePresentCodesLoaded() {
  if (hasLoadedPresentCodes || isPresentCodesLoading) return presentCodesLoadingPromise;
  isPresentCodesLoading = true;
  presentCodesLoadingPromise = (async () => {
    try {
      presentCodes = await loadPresentCodesCsv();
      hasLoadedPresentCodes = true;
    } catch (error) {
      console.error(`datapresent_codes.csv の読み込みに失敗しました: path=${PRESENT_CODES_CSV_PATH}`, error);
      presentCodes = [];
    } finally {
      isPresentCodesLoading = false;
      if (activeTabId === "present-codes") renderPresentCodes();
    }
  })();
  return presentCodesLoadingPromise;
}

async function ensureBazaarPricesLoaded() {
  if (hasLoadedBazaarPrices || isBazaarLoading) return bazaarLoadingPromise;
  isBazaarLoading = true;
  bazaarLoadingPromise = (async () => {
    try {
      bazaarPrices = await loadBazaarPricesCsv();
      hasLoadedBazaarPrices = true;
      if (!hasSyncedMaterialPricesWithBazaar) {
        const materialSyncResult = syncMaterialPricesWithBazaar(state.materials, bazaarPrices);
        state.materials = materialSyncResult.materials;
        hasSyncedMaterialPricesWithBazaar = true;
        saveData();
      }
    } catch (error) {
      console.error(`bazaar_prices.csv の読み込みに失敗しました: path=${BAZAAR_CSV_PATH}`, error);
      bazaarPrices = [];
    } finally {
      isBazaarLoading = false;
      if (activeTabId === "bazaar") renderBazaarPrices();
      if (activeTabId === "field-farming") renderFieldFarmingRanking();
      if (activeTabId === "favorites") renderFavoritesPage();
      if (activeTabId === "profit") {
        renderRecipeTable();
        calcAndRenderSummary();
      }
    }
  })();
  return bazaarLoadingPromise;
}

async function ensureBazaarPriceHistoryLoaded() {
  if (hasLoadedBazaarPriceHistory || isBazaarHistoryLoading) return bazaarHistoryLoadingPromise;
  isBazaarHistoryLoading = true;
  bazaarHistoryLoadingPromise = (async () => {
    try {
      bazaarPriceHistoryByMaterialKey = await loadBazaarPriceHistoryCsv();
      hasLoadedBazaarPriceHistory = true;
    } catch (error) {
      console.error(`bazaar_prices_history.csv の読み込みに失敗しました: path=${BAZAAR_HISTORY_CSV_PATH}`, error);
      bazaarPriceHistoryByMaterialKey = new Map();
    } finally {
      isBazaarHistoryLoading = false;
      if (activeTabId === "favorites") renderFavoritesPage();
      if (activeTabId === "bazaar") renderBazaarPrices();
    }
  })();
  return bazaarHistoryLoadingPromise;
}

async function ensureFieldFarmingMonstersLoaded() {
  if (hasLoadedFieldFarmingMonsters || isFieldFarmingLoading) return fieldFarmingLoadingPromise;
  isFieldFarmingLoading = true;
  fieldFarmingLoadingPromise = (async () => {
    try {
      fieldFarmingMonsters = await loadFieldFarmingMonstersCsv();
      hasLoadedFieldFarmingMonsters = true;
    } catch (error) {
      console.error(`field_farming_monsters.csv の読み込みに失敗しました: path=${FIELD_FARMING_CSV_PATH}`, error);
      fieldFarmingMonsters = [];
    } finally {
      isFieldFarmingLoading = false;
      if (activeTabId === "field-farming") renderFieldFarmingRanking();
    }
  })();
  return fieldFarmingLoadingPromise;
}

async function ensureOrbDataLoaded() {
  if (hasLoadedOrbData || isOrbDataLoading) return orbDataLoadingPromise;
  isOrbDataLoading = true;
  orbDataLoadingPromise = (async () => {
    try {
      orbEntries = await loadOrbDataCsv();
      hasLoadedOrbData = true;
    } catch (error) {
      console.error(`orb_data.csv の読み込みに失敗しました: path=${ORB_DATA_CSV_PATH}`, error);
      orbEntries = [];
    } finally {
      isOrbDataLoading = false;
      if (activeTabId === "orbs") renderOrbCards();
    }
  })();
  return orbDataLoadingPromise;
}

async function ensureWhiteBoxDataLoaded() {
  if (hasLoadedWhiteBoxData || isWhiteBoxDataLoading) return whiteBoxDataLoadingPromise;
  isWhiteBoxDataLoading = true;
  whiteBoxDataLoadingPromise = (async () => {
    try {
      whiteBoxEntries = await loadWhiteBoxCsv();
      hasLoadedWhiteBoxData = true;
    } catch (error) {
      console.error(`white_box.csv の読み込みに失敗しました: path=${WHITE_BOX_CSV_PATH}`, error);
      whiteBoxEntries = [];
    } finally {
      isWhiteBoxDataLoading = false;
      if (activeTabId === "white-boxes") renderWhiteBoxCards();
    }
  })();
  return whiteBoxDataLoadingPromise;
}

async function ensureEquipmentDbDataLoaded() {
  if (hasLoadedEquipmentDbData || isEquipmentDbDataLoading) return equipmentDbDataLoadingPromise;
  isEquipmentDbDataLoading = true;
  equipmentDbDataLoadingPromise = (async () => {
    try {
      const loadedEquipmentDbEntries = await loadEquipmentDbCsv();
      if (!hasLoadedWhiteBoxData) {
        try {
          whiteBoxEntries = await loadWhiteBoxCsv();
          hasLoadedWhiteBoxData = true;
        } catch (whiteBoxError) {
          console.error(`white_box.csv の読み込みに失敗しました: path=${WHITE_BOX_CSV_PATH}`, whiteBoxError);
          whiteBoxEntries = [];
        }
      }
      const whiteBoxSummaryByName = buildWhiteBoxSummaryByItemName(whiteBoxEntries);
      equipmentDbEntries = attachWhiteBoxDropsToEquipmentEntries(loadedEquipmentDbEntries, whiteBoxSummaryByName);
      hasLoadedEquipmentDbData = true;
    } catch (error) {
      console.error(`equipment_data.csv の読み込みに失敗しました: path=${EQUIPMENT_DB_CSV_PATH}`, error);
      equipmentDbEntries = [];
    } finally {
      isEquipmentDbDataLoading = false;
      if (activeTabId === "equipment-db") renderEquipmentDbCards();
    }
  })();
  return equipmentDbDataLoadingPromise;
}

function prefetchDataForTab(tabId) {
  if (tabId === "present-codes") {
    void ensurePresentCodesLoaded();
    return;
  }
  if (tabId === "field-farming") {
    void ensureBazaarPricesLoaded();
    void ensureFieldFarmingMonstersLoaded();
    return;
  }
  if (tabId === "bazaar") {
    void ensureBazaarPricesLoaded();
    void ensureBazaarPriceHistoryLoaded();
    return;
  }
  if (tabId === "favorites") {
    void ensureBazaarPricesLoaded();
    void ensureBazaarPriceHistoryLoaded();
    return;
  }
  if (tabId === "orbs") {
    void ensureOrbDataLoaded();
    return;
  }
  if (tabId === "white-boxes") {
    void ensureWhiteBoxDataLoaded();
    return;
  }
  if (tabId === "equipment-db") {
    void ensureEquipmentDbDataLoaded();
    return;
  }
  if (tabId === "bazaar-admin") {
    if (!bazaarAdminCsvModel) {
      void reloadBazaarAdminCsvModel()
        .then(() => {
          if (activeTabId === "bazaar-admin") renderBazaarAdminPanel();
        })
        .catch((error) => {
          console.error("bazaar_prices.csv(管理) の読み込みに失敗しました", error);
          setBazaarAdminMessage(`管理CSVの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`, true);
        });
    }
  }
}

function renderWhiteBoxCards() {
  if (!whiteBoxListWrap || !whiteBoxSlotFilterSelect || !whiteBoxSortSelect) return;

  whiteBoxTypeTabButtons.forEach((button) => {
    const buttonType = String(button.dataset.whiteboxType || "weapon");
    const isActive = buttonType === selectedWhiteBoxType;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
  });
  whiteBoxSortSelect.value = selectedWhiteBoxSort;

  if (isWhiteBoxDataLoading && !hasLoadedWhiteBoxData) {
    whiteBoxListWrap.innerHTML = `<p class="card">白宝箱データを読み込み中です...</p>`;
    return;
  }
  if (!Array.isArray(whiteBoxEntries) || whiteBoxEntries.length === 0) {
    whiteBoxListWrap.innerHTML = `<p class="card">表示できる白宝箱データがありません。CSV内容を確認してください。</p>`;
    whiteBoxSlotFilterSelect.innerHTML = `<option value="">すべて</option>`;
    return;
  }

  const slots = Array.from(
    new Set(
      whiteBoxEntries
        .filter((entry) => getWhiteBoxTypeBySlot(entry.itemSlot) === selectedWhiteBoxType)
        .map((entry) => String(entry.itemSlot || "").trim())
        .filter((slot) => slot !== "")
    )
  ).sort((a, b) => {
    const sortDiff = getWhiteBoxSlotSortOrder(a, selectedWhiteBoxType) - getWhiteBoxSlotSortOrder(b, selectedWhiteBoxType);
    if (sortDiff !== 0) return sortDiff;
    return a.localeCompare(b, "ja");
  });

  if (selectedWhiteBoxSlot !== "" && !slots.includes(selectedWhiteBoxSlot)) {
    selectedWhiteBoxSlot = "";
  }

  whiteBoxSlotFilterSelect.innerHTML = `
    <option value="">すべて</option>
    ${slots.map((slot) => `<option value="${slot}" ${selectedWhiteBoxSlot === slot ? "selected" : ""}>${slot}</option>`).join("")}
  `;

  const filteredEntries = getWhiteBoxFilteredEntries();
  whiteBoxListWrap.innerHTML = `
    <div class="whitebox-card-grid">
      ${
        filteredEntries.length === 0
          ? `<p class="card whitebox-empty">条件に一致する装備がありません。</p>`
          : filteredEntries
              .map((entry) => {
                const isExpanded = expandedWhiteBoxItemId === entry.id;
                const levelText = Number.isFinite(entry.equipmentLevel) ? `Lv ${entry.equipmentLevel}` : "Lv -";
                const slotIconPath = getEquipmentTypeIconPath(entry.itemSlot);
                const slotMetaLabel = entry.itemSlot || "-";
                const slotMetaText = slotIconPath
                  ? `<span class="equipment-type-meta"><img src="${resolveProjectScopedAssetUrl(slotIconPath)}" alt="" class="equipment-type-icon" loading="lazy" decoding="async"><span>部位: ${slotMetaLabel}</span></span>`
                  : `部位: ${slotMetaLabel}`;
                const monsterListHtml =
                  entry.hasDropMonster && entry.monsters.length > 0
                    ? `<ul class="whitebox-monster-list">${entry.monsters
                        .map((monster) => `<li>${monster.monsterName}</li>`)
                        .join("")}</ul>`
                    : `<p class="whitebox-monster-empty">白宝箱ドロップなし</p>`;
                return `
                  <article class="card whitebox-card whitebox-card-type-${selectedWhiteBoxType} ${isExpanded ? "is-expanded" : ""}">
                    <button type="button" class="whitebox-card-toggle" data-whitebox-item-id="${entry.id}" aria-expanded="${isExpanded ? "true" : "false"}">
                      <h3 class="whitebox-card-name">${entry.itemName}</h3>
                      <p class="whitebox-card-meta">${levelText}</p>
                      <p class="whitebox-card-meta">${slotMetaText}</p>
                    </button>
                    <div class="whitebox-card-monsters ${isExpanded ? "is-open" : ""}" ${isExpanded ? "" : "hidden"}>
                      <p class="whitebox-monster-title">ドロップモンスター</p>
                      ${monsterListHtml}
                    </div>
                  </article>
                `;
              })
              .join("")
      }
    </div>
  `;

  whiteBoxListWrap.querySelectorAll("[data-whitebox-item-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const clickedItemId = String(button.dataset.whiteboxItemId || "");
      expandedWhiteBoxItemId = expandedWhiteBoxItemId === clickedItemId ? "" : clickedItemId;
      renderWhiteBoxCards();
    });
  });
}

function formatEquipmentDbGuardRate(value) {
  if (!Number.isFinite(value)) return "";
  return `${value.toFixed(2)}%`;
}

function compareEquipmentDbEntries(a, b) {
  if (selectedEquipmentDbSort === "level_desc" || selectedEquipmentDbSort === "level_asc") {
    const levelA = Number.isFinite(a?.equipmentLevel) ? a.equipmentLevel : Number.NEGATIVE_INFINITY;
    const levelB = Number.isFinite(b?.equipmentLevel) ? b.equipmentLevel : Number.NEGATIVE_INFINITY;
    const levelDiff = selectedEquipmentDbSort === "level_desc" ? levelB - levelA : levelA - levelB;
    if (levelDiff !== 0) return levelDiff;
  }
  const idDiff = (a?.equipmentIdNumber || Number.MAX_SAFE_INTEGER) - (b?.equipmentIdNumber || Number.MAX_SAFE_INTEGER);
  if (idDiff !== 0) return idDiff;
  return String(a?.equipmentName || "").localeCompare(String(b?.equipmentName || ""), "ja");
}

function getFilteredEquipmentDbEntries() {
  const normalizedKeyword = String(equipmentDbNameKeyword || "").trim().toLowerCase();
  const normalizedMonsterKeyword = String(equipmentDbMonsterKeyword || "").trim().toLowerCase();
  return (equipmentDbEntries || [])
    .filter((entry) => String(entry.equipmentGroup || "weapon") === selectedEquipmentDbGroup)
    .filter((entry) => (selectedEquipmentDbType === "" ? true : String(entry.equipmentType || "") === selectedEquipmentDbType))
    .filter((entry) => {
      if (normalizedKeyword === "") return true;
      return String(entry.equipmentName || "").toLowerCase().includes(normalizedKeyword);
    })
    .filter((entry) => {
      if (normalizedMonsterKeyword === "") return true;
      return (Array.isArray(entry.whiteBoxMonsterNames) ? entry.whiteBoxMonsterNames : []).some((monsterName) =>
        String(monsterName || "").toLowerCase().includes(normalizedMonsterKeyword)
      );
    })
    .sort(compareEquipmentDbEntries);
}

function buildEquipmentDbStatsHtml(entry) {
  const stats = [];
  const statDefinitions = [
    { key: "attack", label: "攻撃力", isRate: false },
    { key: "attackMagic", label: "攻撃魔力", isRate: false },
    { key: "healMagic", label: "回復魔力", isRate: false },
    { key: "defense", label: "守備力", isRate: false },
    { key: "shieldGuardRate", label: "盾ガード率", isRate: true },
    { key: "hp", label: "HP", isRate: false },
    { key: "mp", label: "MP", isRate: false },
    { key: "speed", label: "すばやさ", isRate: false },
    { key: "dex", label: "きようさ", isRate: false },
    { key: "fashionable", label: "おしゃれさ", isRate: false },
    { key: "weight", label: "おもさ", isRate: false },
  ];
  statDefinitions.forEach((definition) => {
    const value = entry?.[definition.key];
    if (!Number.isFinite(value) || Number(value) === 0) return;
    const displayValue = definition.isRate ? formatEquipmentDbGuardRate(value) : value;
    stats.push(`<li><span>${definition.label}</span><strong>${displayValue}</strong></li>`);
  });
  return stats;
}

function renderEquipmentDbCards() {
  if (!equipmentDbListWrap || !equipmentDbTypeFilterSelect || !equipmentDbSortSelect) return;

  equipmentDbGroupTabButtons.forEach((button) => {
    const buttonGroup = String(button.dataset.equipmentDbGroup || "weapon");
    const isActive = buttonGroup === selectedEquipmentDbGroup;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
  });

  if (equipmentDbNameSearchInput && equipmentDbNameSearchInput.value !== equipmentDbNameKeyword) {
    equipmentDbNameSearchInput.value = equipmentDbNameKeyword;
  }
  if (equipmentDbMonsterSearchInput && equipmentDbMonsterSearchInput.value !== equipmentDbMonsterKeyword) {
    equipmentDbMonsterSearchInput.value = equipmentDbMonsterKeyword;
  }

  if (equipmentDbNameSearchField) {
    equipmentDbNameSearchField.hidden = !isEquipmentDbNameSearchOpen;
  }
  if (equipmentDbNameSearchToggleButton) {
    equipmentDbNameSearchToggleButton.setAttribute("aria-expanded", isEquipmentDbNameSearchOpen ? "true" : "false");
    equipmentDbNameSearchToggleButton.textContent = isEquipmentDbNameSearchOpen ? "－ 装備名で検索したい方" : "＋ 装備名で検索したい方";
  }
  if (equipmentDbMonsterSearchField) {
    equipmentDbMonsterSearchField.hidden = !isEquipmentDbMonsterSearchOpen;
  }
  if (equipmentDbMonsterSearchToggleButton) {
    equipmentDbMonsterSearchToggleButton.setAttribute("aria-expanded", isEquipmentDbMonsterSearchOpen ? "true" : "false");
    equipmentDbMonsterSearchToggleButton.textContent = isEquipmentDbMonsterSearchOpen
      ? "－ 白宝箱ドロップモンスター検索"
      : "＋ 白宝箱ドロップモンスター検索";
  }

  equipmentDbSortSelect.value = selectedEquipmentDbSort;

  if (isEquipmentDbDataLoading && !hasLoadedEquipmentDbData) {
    equipmentDbListWrap.innerHTML = `<p class="card">装備データを読み込み中です...</p>`;
    return;
  }
  if (!Array.isArray(equipmentDbEntries) || equipmentDbEntries.length === 0) {
    if (equipmentDbTypeFilterField) {
      equipmentDbTypeFilterField.hidden = selectedEquipmentDbGroup === "armor";
    }
    equipmentDbTypeFilterSelect.disabled = selectedEquipmentDbGroup === "armor";
    equipmentDbListWrap.innerHTML = `<p class="card">表示できる装備データがありません。CSV内容を確認してください。</p>`;
    equipmentDbTypeFilterSelect.innerHTML = `<option value="">すべて</option>`;
    return;
  }

  const isArmorGroup = selectedEquipmentDbGroup === "armor";
  const types = isArmorGroup
    ? []
    : Array.from(
        new Set(
          equipmentDbEntries
            .filter((entry) => String(entry.equipmentGroup || "weapon") === selectedEquipmentDbGroup)
            .map((entry) => String(entry.equipmentType || "").trim())
            .filter((type) => type !== "")
        )
      ).sort((a, b) => a.localeCompare(b, "ja"));

  if (isArmorGroup || (selectedEquipmentDbType !== "" && !types.includes(selectedEquipmentDbType))) {
    selectedEquipmentDbType = "";
  }
  if (equipmentDbTypeFilterField) {
    equipmentDbTypeFilterField.hidden = isArmorGroup;
  }
  equipmentDbTypeFilterSelect.disabled = isArmorGroup;
  if (!isArmorGroup) {
    equipmentDbTypeFilterSelect.innerHTML = `
      <option value="">すべて</option>
      ${types
        .map((type) => `<option value="${type}" ${selectedEquipmentDbType === type ? "selected" : ""}>${type}</option>`)
        .join("")}
    `;
  }

  const filteredEntries = getFilteredEquipmentDbEntries();
  equipmentDbListWrap.innerHTML = `
    <div class="equipment-db-card-grid">
      ${
        filteredEntries.length === 0
          ? `<p class="card equipment-db-empty">条件に一致する装備がありません。</p>`
          : filteredEntries
              .map((entry) => {
                const isExpanded = expandedEquipmentDbId === entry.id;
                const levelText = Number.isFinite(entry.equipmentLevel) ? `Lv${entry.equipmentLevel}` : "Lv-";
                const isArmor = String(entry.equipmentGroup || "") === "armor";
                const isArmorSet = isArmorSetEntry(entry);
                const typeLabel = isArmorSet ? "防具セット" : entry.equipmentType || "-";
                const typeIconPath = getEquipmentTypeIconPath(typeLabel);
                const typeMetaText = typeIconPath
                  ? `<span class="equipment-type-meta"><img src="${resolveProjectScopedAssetUrl(typeIconPath)}" alt="" class="equipment-type-icon" loading="lazy" decoding="async"><span>${typeLabel}</span></span>`
                  : typeLabel;
                const stats = buildEquipmentDbStatsHtml(entry);
                const collapsedTraitsHtml =
                  isArmor && entry.traits.length > 0
                    ? `<ul class="equipment-db-traits-list equipment-db-traits-list-collapsed">${entry.traits
                        .map((trait) => `<li>${trait}</li>`)
                        .join("")}</ul>`
                    : isArmor
                      ? `<p class="equipment-db-trait-empty equipment-db-trait-empty-collapsed">特性情報なし</p>`
                      : "";

                const traitsHtml =
                  entry.traits.length > 0
                    ? `<ul class="equipment-db-traits-list">${entry.traits.map((trait) => `<li>${trait}</li>`).join("")}</ul>`
                    : `<p class="equipment-db-trait-empty">特性情報なし</p>`;
                const armorStatsHtml =
                  isArmor && stats.length > 0
                    ? `<div class="equipment-db-detail-section ${isArmorSet ? "" : "equipment-db-detail-section-first"}">
                        <p class="equipment-db-traits-title">上昇能力値</p>
                        <ul class="equipment-db-stats-list">${stats.join("")}</ul>
                      </div>`
                    : isArmor
                      ? `<div class="equipment-db-detail-section ${isArmorSet ? "" : "equipment-db-detail-section-first"}">
                          <p class="equipment-db-traits-title">上昇能力値</p>
                          <p class="equipment-db-trait-empty">上昇能力値なし</p>
                        </div>`
                      : "";
                const armorSetTypeMetaHtml = isArmorSet
                  ? `<div class="equipment-db-detail-section equipment-db-detail-section-first">
                      <p class="equipment-db-traits-title">装備種別</p>
                      <p class="equipment-db-card-meta">${typeMetaText}</p>
                    </div>`
                  : "";
                const armorWhiteBoxDropHtml =
                  entry.whiteBoxHasDrop && Array.isArray(entry.whiteBoxArmorDropsBySlot) && entry.whiteBoxArmorDropsBySlot.length > 0
                    ? `<div class="equipment-db-armor-drop-list">${entry.whiteBoxArmorDropsBySlot
                        .map(
                          (slotEntry) => `
                          <section class="equipment-db-armor-drop-slot">
                            <p class="equipment-db-armor-drop-slot-title">${slotEntry.slot}</p>
                            <ul class="equipment-db-traits-list">
                              ${slotEntry.items
                                .map(
                                  (item) =>
                                    `<li><span class="equipment-db-armor-item-name">${item.itemName}</span><br>${item.monsterNames.join(" / ")}</li>`
                                )
                                .join("")}
                            </ul>
                          </section>`
                        )
                        .join("")}</div>`
                    : `<p class="equipment-db-trait-empty">白宝箱ドロップなし</p>`;
                const weaponWhiteBoxDropHtml =
                  entry.whiteBoxHasDrop && entry.whiteBoxMonsterNames.length > 0
                    ? `<ul class="equipment-db-traits-list">${entry.whiteBoxMonsterNames.map((monsterName) => `<li>${monsterName}</li>`).join("")}</ul>`
                    : `<p class="equipment-db-trait-empty">白宝箱ドロップなし</p>`;
                return `
                  <article class="card equipment-db-card equipment-db-card-${isArmor ? "armor" : "weapon"} ${isExpanded ? "is-expanded" : ""}">
                    <button type="button" class="equipment-db-card-toggle" data-equipment-db-id="${entry.id}" aria-expanded="${isExpanded ? "true" : "false"}">
                      <h3 class="equipment-db-card-name">${entry.equipmentName}</h3>
                      ${isArmor && isArmorSet ? `<p class="equipment-db-card-meta">${typeMetaText}</p>` : isArmor ? "" : `<p class="equipment-db-card-meta">${typeMetaText}</p>`}
                      <p class="equipment-db-card-meta">${levelText}</p>
                      ${!isArmor && stats.length > 0 ? `<ul class="equipment-db-stats-list">${stats.join("")}</ul>` : ""}
                      ${collapsedTraitsHtml}
                    </button>
                    <div class="equipment-db-card-actions">
                      <button type="button" class="equipment-db-open-profit-button" data-equipment-db-open-profit="${entry.id}">
                        職人アシストで開く
                      </button>
                    </div>
                    <div class="equipment-db-card-traits ${isExpanded ? "is-open" : ""}" ${isExpanded ? "" : "hidden"}>
                      ${armorSetTypeMetaHtml}
                      ${armorStatsHtml}
                      ${isArmor ? "" : `<p class="equipment-db-traits-title">特性</p>${traitsHtml}`}
                      <div class="equipment-db-detail-section">
                        <p class="equipment-db-traits-title">白宝箱ドロップモンスター</p>
                        ${isArmor ? armorWhiteBoxDropHtml : weaponWhiteBoxDropHtml}
                      </div>
                    </div>
                  </article>
                `;
              })
              .join("")
      }
    </div>
  `;

  equipmentDbListWrap.querySelectorAll("[data-equipment-db-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const clickedId = String(button.dataset.equipmentDbId || "");
      expandedEquipmentDbId = expandedEquipmentDbId === clickedId ? "" : clickedId;
      renderEquipmentDbCards();
    });
  });
  equipmentDbListWrap.querySelectorAll("[data-equipment-db-open-profit]").forEach((button) => {
    button.addEventListener("click", () => {
      const clickedId = String(button.dataset.equipmentDbOpenProfit || "");
      const targetEntry = filteredEntries.find((entry) => entry.id === clickedId);
      if (!targetEntry) return;
      openProfitFromEquipmentDb(targetEntry);
    });
  });
}

function parseBazaarHistoryDate(value) {
  const normalized = String(value || "").trim();
  if (normalized === "") return null;
  const matched = normalized.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (matched) {
    const year = Number(matched[1]);
    const month = Number(matched[2]);
    const day = Number(matched[3]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const parsedUtc = new Date(Date.UTC(year, month - 1, day));
    if (
      parsedUtc.getUTCFullYear() !== year ||
      parsedUtc.getUTCMonth() !== month - 1 ||
      parsedUtc.getUTCDate() !== day
    ) {
      return null;
    }
    return parsedUtc;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDateAsIsoText(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeHistoryDateKey(value) {
  const parsed = parseBazaarHistoryDate(value);
  return parsed ? parsed.toISOString().slice(0, 10) : "";
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function buildBazaarHistorySnapshotRows(snapshotDateText) {
  const normalizedDate = normalizeHistoryDateKey(snapshotDateText || formatDateAsIsoText(new Date()));
  return bazaarPrices
    .map((row) => {
      if (!row?.materialName) return null;
      if (Number.isFinite(row.todayPrice)) {
        return {
          date: normalizedDate,
          materialName: row.materialName,
          price: Math.round(row.todayPrice),
          listingCount: Number.isFinite(row.listingCount) ? Math.round(row.listingCount) : "",
          source: "today_price",
        };
      }
      if (Number.isFinite(row.shopPrice)) {
        return {
          date: normalizedDate,
          materialName: row.materialName,
          price: Math.round(row.shopPrice),
          listingCount: Number.isFinite(row.listingCount) ? Math.round(row.listingCount) : "",
          source: "shop_price",
        };
      }
      return null;
    })
    .filter((row) => row !== null);
}

function mergeBazaarHistoryLines(existingLines, incomingRows, options = {}) {
  const skipDuplicates = options.skipDuplicates !== false;
  const lines = Array.isArray(existingLines) ? existingLines : [];
  const hasHeader = lines.length > 0;
  const baseHeader = "date,material_name,price,listing_count,source";
  const outputLines = hasHeader ? [...lines] : [baseHeader];
  const existingKeys = new Set();
  const payloadLines = hasHeader ? lines.slice(1) : [];
  payloadLines.forEach((line) => {
    const cols = parseCsvLine(line);
    const key = `${normalizeHistoryDateKey(cols[0])}::${String(cols[1] || "").trim()}`;
    if (key !== "::") {
      existingKeys.add(key);
    }
  });

  const result = {
    appendedCount: 0,
    skippedDuplicateCount: 0,
    skippedInvalidCount: 0,
    lines: outputLines,
  };

  incomingRows.forEach((row) => {
    const dateKey = normalizeHistoryDateKey(row?.date);
    const materialName = String(row?.materialName || "").trim();
    const price = Number(row?.price);
    if (!dateKey || !materialName || !Number.isFinite(price)) {
      result.skippedInvalidCount += 1;
      return;
    }
    const uniqueKey = `${dateKey}::${materialName}`;
    if (skipDuplicates && existingKeys.has(uniqueKey)) {
      result.skippedDuplicateCount += 1;
      return;
    }
    const listingCount = row?.listingCount === "" ? "" : Number.isFinite(Number(row?.listingCount)) ? Math.round(Number(row.listingCount)) : "";
    const source = String(row?.source || "manual").trim() || "manual";
    const csvLine = [
      escapeCsvValue(dateKey),
      escapeCsvValue(materialName),
      escapeCsvValue(Math.round(price)),
      escapeCsvValue(listingCount),
      escapeCsvValue(source),
    ].join(",");
    outputLines.push(csvLine);
    existingKeys.add(uniqueKey);
    result.appendedCount += 1;
  });

  return result;
}

function setBazaarHistorySaveMessage(message, isError = false) {
  if (!bazaarHistorySaveMessage) return;
  bazaarHistorySaveMessage.textContent = message;
  bazaarHistorySaveMessage.style.color = isError ? "#d93025" : "#4f5d75";
}

async function handleSaveBazaarHistoryClick() {
  if (!saveBazaarHistoryButton) return;
  try {
    saveBazaarHistoryButton.disabled = true;
    setBazaarHistorySaveMessage("履歴CSVを作成中です…");
    const snapshotDate = bazaarHistorySnapshotDateInput?.value || formatDateAsIsoText(new Date());
    const snapshotRows = buildBazaarHistorySnapshotRows(snapshotDate);
    const existingLines = await fetchCsvLines(BAZAAR_HISTORY_CSV_PATH);
    const merged = mergeBazaarHistoryLines(existingLines, snapshotRows, { skipDuplicates: true });
    const csvText = `\uFEFF${merged.lines.join("\n")}\n`;
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bazaar_prices_history.csv";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    setBazaarHistorySaveMessage(
      `履歴CSVを作成しました（追加 ${merged.appendedCount} 件 / 重複スキップ ${merged.skippedDuplicateCount} 件）。ダウンロードしたCSVで data/bazaar_prices_history.csv を置き換えてください。`
    );
  } catch (error) {
    console.error("バザー履歴保存CSVの作成に失敗しました", error);
    setBazaarHistorySaveMessage(`履歴CSV作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`, true);
  } finally {
    saveBazaarHistoryButton.disabled = false;
  }
}

function parseBazaarPriceHistoryFromLines(lines) {
  if (lines.length <= 1) return new Map();

  const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const dateIndex = headers.indexOf("date");
  const materialNameIndex = headers.indexOf("material_name");
  const priceIndex = headers.indexOf("price");
  if (dateIndex < 0 || materialNameIndex < 0 || priceIndex < 0) {
    throw new Error("bazaar_prices_history.csv ヘッダーが想定と一致しません");
  }

  const historyMap = new Map();
  lines.slice(1).forEach((line) => {
    const row = parseCsvLine(line);
    const materialName = String(row[materialNameIndex] || "").trim();
    const materialKey = makeMaterialId(materialName);
    const price = parseNullableNumber(row[priceIndex]);
    const parsedDate = parseBazaarHistoryDate(row[dateIndex]);
    if (!materialName || !Number.isFinite(price) || !parsedDate) return;
    const dateText = parsedDate.toISOString().slice(0, 10);
    if (!historyMap.has(materialKey)) {
      historyMap.set(materialKey, []);
    }
    historyMap.get(materialKey).push({
      date: dateText,
      timestamp: parsedDate.getTime(),
      price,
    });
  });

  historyMap.forEach((rows, materialKey) => {
    const dedupedByDate = new Map();
    rows.forEach((row) => {
      dedupedByDate.set(row.date, row);
    });
    const sorted = Array.from(dedupedByDate.values()).sort((a, b) => a.timestamp - b.timestamp);
    historyMap.set(materialKey, sorted);
  });

  console.info(`[bazaar_prices_history.csv] parsed materials: ${historyMap.size}`);
  return historyMap;
}

async function loadBazaarPriceHistoryCsv() {
  const lines = await fetchCsvLines(BAZAAR_HISTORY_CSV_PATH);
  return parseBazaarPriceHistoryFromLines(lines);
}

function getBazaarHistoryForRange(materialKey, rangeDays = DEFAULT_BAZAAR_CHART_RANGE_DAYS) {
  const history = bazaarPriceHistoryByMaterialKey.get(materialKey) || [];
  if (history.length === 0) return [];
  const lastTimestamp = history[history.length - 1].timestamp;
  const rangeStartTimestamp = lastTimestamp - (Number(rangeDays) - 1) * 24 * 60 * 60 * 1000;
  return history.filter((point) => point.timestamp >= rangeStartTimestamp);
}

function formatBazaarChartDateLabel(timestamp) {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(parsed);
}

function buildBazaarSparklineSvg(history, options = {}) {
  const width = Number(options.width) || 320;
  const height = Number(options.height) || 108;
  const paddingTop = Number(options.paddingTop) || 8;
  const paddingRight = Number(options.paddingRight) || 8;
  const paddingBottom = Number(options.paddingBottom) || 20;
  const paddingLeft = Number(options.paddingLeft) || 12;
  const pointRadius = Number(options.pointRadius) || 2;
  const latestPointRadius = Number(options.latestPointRadius) || 4;
  const chartStroke = options.stroke || "#8b5e3c";
  const areaFill = options.areaFill || "rgba(139, 94, 60, 0.18)";
  const includeYAxisLabels = options.includeYAxisLabels !== false;
  const xAxisLabelCount = Math.max(1, Number(options.xAxisLabelCount) || 3);
  const yAxisTickCount = Math.max(2, Math.min(3, Number(options.yAxisTickCount) || 3));
  const points = Array.isArray(history)
    ? history
        .map((item) => ({
          ...item,
          price: Number(item?.price),
        }))
        .filter((item) => Number.isFinite(item?.price))
    : [];
  if (points.length === 0) return "";

  const prices = points.map((point) => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const middlePrice = (maxPrice + minPrice) / 2;
  const safeRange = Math.max(maxPrice - minPrice, 1);
  const xDivisor = Math.max(points.length - 1, 1);
  const chartHeight = Math.max(height - paddingTop - paddingBottom, 1);
  const chartWidth = Math.max(width - paddingLeft - paddingRight, 1);
  const yForPrice = (price) => {
    const normalizedY = (price - minPrice) / safeRange;
    return paddingTop + (1 - normalizedY) * chartHeight;
  };
  const coords = points.map((point, index) => {
    const x = paddingLeft + (index / xDivisor) * chartWidth;
    const y = yForPrice(point.price);
    return { x, y };
  });
  const polylinePoints = coords.map((coord) => `${coord.x.toFixed(2)},${coord.y.toFixed(2)}`).join(" ");
  const chartBottomY = height - paddingBottom;
  const areaPoints = [`${paddingLeft},${chartBottomY}`, polylinePoints, `${width - paddingRight},${chartBottomY}`].join(" ");
  const pointDots = coords
    .map(
      (coord) =>
        `<circle cx="${coord.x.toFixed(2)}" cy="${coord.y.toFixed(2)}" r="${pointRadius}" class="bazaar-mini-chart-point"></circle>`
    )
    .join("");
  const latestCoord = coords[coords.length - 1];
  const latestPointDot = latestCoord
    ? `<circle cx="${latestCoord.x.toFixed(2)}" cy="${latestCoord.y.toFixed(2)}" r="${latestPointRadius}" class="bazaar-mini-chart-latest-point"></circle>`
    : "";

  const yAxisLabels =
    yAxisTickCount >= 3
      ? [
          { price: maxPrice, className: "bazaar-mini-chart-axis-label-max" },
          { price: middlePrice, className: "bazaar-mini-chart-axis-label-middle" },
          { price: minPrice, className: "bazaar-mini-chart-axis-label-min" },
        ]
      : [
          { price: maxPrice, className: "bazaar-mini-chart-axis-label-max" },
          { price: minPrice, className: "bazaar-mini-chart-axis-label-min" },
        ];
  const yAxisLabelsHtml = includeYAxisLabels
    ? yAxisLabels
        .map(({ price, className }) => {
          const y = yForPrice(price);
          return `<text x="${paddingLeft + 2}" y="${y.toFixed(2)}" class="bazaar-mini-chart-axis-label ${className}">${formatBazaarPrice(price)} G</text>`;
        })
        .join("")
    : "";

  const xAxisIndexes =
    points.length <= 1
      ? [0]
      : xAxisLabelCount <= 2 || points.length === 2
        ? [0, points.length - 1]
        : [0, Math.floor((points.length - 1) / 2), points.length - 1];
  const xAxisLabelIndexes = Array.from(new Set(xAxisIndexes)).slice(0, xAxisLabelCount);
  const xAxisLabelsHtml = xAxisLabelIndexes
    .map((index, orderIndex, array) => {
      const point = points[index];
      const coord = coords[index];
      const isStart = orderIndex === 0;
      const isEnd = orderIndex === array.length - 1;
      const classNames = ["bazaar-mini-chart-axis-date"];
      if (!isStart && !isEnd) classNames.push("bazaar-mini-chart-axis-date-middle");
      const anchor = isStart ? "start" : isEnd ? "end" : "middle";
      return `<text x="${coord.x.toFixed(2)}" y="${height - 3}" text-anchor="${anchor}" class="${classNames.join(" ")}">${formatBazaarChartDateLabel(point.timestamp)}</text>`;
    })
    .join("");

  const topGridY = yForPrice(maxPrice).toFixed(2);
  const middleGridY = yForPrice(middlePrice).toFixed(2);
  const bottomGridY = yForPrice(minPrice).toFixed(2);
  const latestPrice = points[points.length - 1].price;
  const firstPrice = points[0].price;
  const trendClass = latestPrice > firstPrice ? "is-positive" : latestPrice < firstPrice ? "is-negative" : "is-neutral";
  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="bazaar-mini-chart-svg ${trendClass}" aria-hidden="true" focusable="false">
      <line x1="${paddingLeft}" y1="${topGridY}" x2="${width - paddingRight}" y2="${topGridY}" class="bazaar-mini-chart-grid-line is-edge"></line>
      <line x1="${paddingLeft}" y1="${middleGridY}" x2="${width - paddingRight}" y2="${middleGridY}" class="bazaar-mini-chart-grid-line"></line>
      <line x1="${paddingLeft}" y1="${bottomGridY}" x2="${width - paddingRight}" y2="${bottomGridY}" class="bazaar-mini-chart-grid-line is-edge"></line>
      <polyline points="${areaPoints}" class="bazaar-mini-chart-area" style="fill:${areaFill};"></polyline>
      <polyline points="${polylinePoints}" class="bazaar-mini-chart-line" style="stroke:${chartStroke};"></polyline>
      ${pointDots}
      ${latestPointDot}
      ${yAxisLabelsHtml}
      ${xAxisLabelsHtml}
    </svg>
  `;
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

function getBazaarPriceVisualTone(row) {
  const statusText = `${String(row?.comment || "")} ${String(row?.updateInfo || "")}`;
  if (statusText.includes("店売り価格固定")) return "shop-fixed";
  if (statusText.includes("現在固定") || statusText.includes("価格固定")) return "fixed";
  return "normal";
}

function getBazaarPriceStatusBadgeLabel(priceVisualTone) {
  if (priceVisualTone === "shop-fixed") return "店売り価格固定";
  if (priceVisualTone === "fixed") return "価格固定";
  return "";
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
  const categoryFilteredRows = bazaarPrices.filter((row) => selectedBazaarCategory === "" || row.itemCategory === selectedBazaarCategory);
  const normalizedKeyword = normalizeBazaarSearchText(bazaarSearchText);
  const keywordFilteredRows =
    normalizedKeyword === ""
      ? categoryFilteredRows
      : categoryFilteredRows.filter((row) => normalizeBazaarSearchText(row.materialName).includes(normalizedKeyword));
  const favoriteFilteredRows = showBazaarFavoritesOnly ? keywordFilteredRows.filter((row) => isBazaarFavoriteRow(row)) : keywordFilteredRows;
  const monitoringFilteredRows = showBazaarMonitoringOnly ? favoriteFilteredRows.filter((row) => isMonitoringByComment(row.comment)) : favoriteFilteredRows;
  return getSortedBazaarRows(monitoringFilteredRows, selectedBazaarCategory, selectedBazaarSort);
}

function renderBazaarPrices() {
  if (!bazaarListWrap) return;
  if (isBazaarLoading && !hasLoadedBazaarPrices) {
    bazaarListWrap.innerHTML = `<p>バザー価格データを読み込み中です...</p>`;
    return;
  }

  if (!Array.isArray(bazaarPrices) || bazaarPrices.length === 0) {
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
      <div class="bazaar-filter-toggle-row">
        <label class="field inline-field bazaar-favorite-filter-field">
          <input id="bazaarFavoritesOnlyToggle" type="checkbox" ${showBazaarFavoritesOnly ? "checked" : ""} />
          <span>お気に入りのみ表示</span>
        </label>
        <label class="field inline-field bazaar-monitoring-filter-field">
          <input id="bazaarMonitoringOnlyToggle" type="checkbox" ${showBazaarMonitoringOnly ? "checked" : ""} />
          <span>監視中のみ表示</span>
        </label>
      </div>
    </div>
    <div class="bazaar-list">
      ${
        visibleRows.length === 0
          ? `<p>${
              showBazaarMonitoringOnly
                ? "監視中の素材が見つかりません。"
                : showBazaarFavoritesOnly
                  ? "お気に入り登録された素材がありません。"
                  : "選択した条件のデータがありません。"
            }</p>`
          : visibleRows
              .map((row) => {
          const todayPriceHtml = formatBazaarPriceWithUnit(row.displayPrice);
          const changeRate = getBazaarRowChangeRate(row);
          const changePresentation = getBazaarChangePresentation(changeRate);
          const priceVisualTone = getBazaarPriceVisualTone(row);
          const priceVisualToneClass = `is-${priceVisualTone}`;
          const priceStatusBadgeLabel = getBazaarPriceStatusBadgeLabel(priceVisualTone);
          const isFavorite = isBazaarFavoriteRow(row);
          const hasOfficialUrl = row.officialUrl !== "";
          const history = getBazaarHistoryForRange(row.materialKey, selectedBazaarChartRangeDays);
          const hasHistory = history.length > 0;
          const sparklineSvgDesktop = hasHistory
            ? buildBazaarSparklineSvg(history, {
                includeYAxisLabels: true,
                paddingLeft: 48,
                xAxisLabelCount: 3,
              })
            : "";
          const priceStatusBadgeHtml =
            priceStatusBadgeLabel !== ""
              ? `<p class="bazaar-price-status-badge ${priceVisualToneClass}">${priceStatusBadgeLabel}</p>`
              : "";
          const updatedAtText = formatBazaarUpdatedAt(row.updatedAt);
          const changeArrowHtml = changePresentation.isComputable
            ? `<span class="bazaar-change-arrow ${changePresentation.toneClass}" aria-hidden="true">${changePresentation.arrow}</span>`
            : "";

          return `
            <article class="bazaar-card ${pendingBazaarFocusMaterialKey !== "" && row.materialKey === pendingBazaarFocusMaterialKey ? "is-focused" : ""}" data-bazaar-material-key="${row.materialKey}">
              <header class="bazaar-card-header">
                <div class="bazaar-card-title-group">
                  <h3>
                    <button
                      type="button"
                      class="bazaar-material-name-button"
                      data-bazaar-detail-open-key="${row.materialKey}"
                    >${row.materialName}</button>
                  </h3>
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
              <div
                class="bazaar-sub-row bazaar-card-summary-toggle"
                aria-label="ジャンル"
                data-bazaar-detail-open-key="${row.materialKey}"
                role="button"
                tabindex="0"
              >
                <p class="bazaar-category">${buildBazaarCategoryLabelHtml(row.itemCategory)}</p>
              </div>
              ${
                hasOfficialUrl
                  ? `<div class="bazaar-quick-actions">
                      <a
                        class="bazaar-official-link-button bazaar-official-link-button-compact"
                        href="${row.officialUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="${row.materialName}の公式相場サイトを新しいタブで開く"
                      >
                        公式相場
                      </a>
                    </div>`
                  : ""
              }
              <div
                class="bazaar-main bazaar-card-summary-toggle"
                data-bazaar-detail-open-key="${row.materialKey}"
                role="button"
                tabindex="0"
              >
                <div class="bazaar-primary">
                  <p class="bazaar-today-price ${priceVisualToneClass}">${todayPriceHtml}</p>
                  ${priceStatusBadgeHtml}
                  <p class="bazaar-change-rate">前日比: <span class="bazaar-change-value ${changePresentation.toneClass}">${changePresentation.text}</span>${changeArrowHtml}</p>
                </div>
                <div class="bazaar-mini-chart-wrap" aria-label="${row.materialName}の価格推移（直近${selectedBazaarChartRangeDays}日）">
                  ${
                    hasHistory
                      ? `
                        <div class="bazaar-mini-chart-plot">
                          <div class="bazaar-mini-chart-canvas">
                            ${sparklineSvgDesktop}
                          </div>
                        </div>
                        <p class="bazaar-mini-chart-meta">${history.length}件 / 直近${selectedBazaarChartRangeDays}日</p>
                      `
                      : `<p class="bazaar-mini-chart-empty">履歴なし</p>`
                  }
                </div>
              </div>
              <div class="bazaar-footer-row">
                <p class="bazaar-updated-at">更新: ${updatedAtText}</p>
                <p class="bazaar-previous-price">前日: ${formatBazaarPriceWithUnit(row.previousDayPrice)}</p>
              </div>
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

  const bazaarMonitoringOnlyToggle = bazaarListWrap.querySelector("#bazaarMonitoringOnlyToggle");
  if (bazaarMonitoringOnlyToggle) {
    bazaarMonitoringOnlyToggle.checked = showBazaarMonitoringOnly;
    bazaarMonitoringOnlyToggle.addEventListener("change", (event) => {
      showBazaarMonitoringOnly = Boolean(event.target.checked);
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

  bazaarListWrap.querySelectorAll("[data-bazaar-detail-open-key]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.touchMoved === "true") {
        delete button.dataset.touchMoved;
        delete button.dataset.touchY;
        return;
      }
      const materialKey = String(button.dataset.bazaarDetailOpenKey || "");
      openBazaarDetailModal(materialKey);
    });

    if (button.tagName !== "BUTTON") {
      button.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        const materialKey = String(button.dataset.bazaarDetailOpenKey || "");
        openBazaarDetailModal(materialKey);
      });
    }

    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") {
        button.dataset.touchY = String(event.clientY);
        button.dataset.touchMoved = "false";
      }
    });
    button.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "touch") return;
      const touchY = Number(button.dataset.touchY || "");
      if (!Number.isFinite(touchY)) return;
      if (Math.abs(event.clientY - touchY) > 12) {
        button.dataset.touchMoved = "true";
      }
    });
    button.addEventListener("pointerup", () => {
      delete button.dataset.touchY;
    });
    button.addEventListener("pointercancel", () => {
      delete button.dataset.touchY;
      delete button.dataset.touchMoved;
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

function formatPresentCodeReward(rewardText) {
  return String(rewardText || "")
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .join("<br>");
}

function getOrbFilteredRows() {
  const normalizedKeyword = String(orbSearchKeyword || "").trim().toLowerCase();
  return (orbEntries || []).filter((row) => {
    if (selectedOrbCategory !== "" && normalizeOrbCategoryName(row.orbCategory) !== selectedOrbCategory) return false;
    if (normalizedKeyword === "") return true;
    return [row.orbName, row.effect, row.monsterNames.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword);
  });
}

function renderOrbCards() {
  if (!orbListWrap || !orbCategoryFilterWrap) return;
  if (orbSearchInput && orbSearchInput.value !== orbSearchKeyword) {
    orbSearchInput.value = orbSearchKeyword;
  }
  if (isOrbDataLoading && !hasLoadedOrbData) {
    orbListWrap.innerHTML = `<p class="card">宝珠データを読み込み中です...</p>`;
    return;
  }
  if (!Array.isArray(orbEntries) || orbEntries.length === 0) {
    orbListWrap.innerHTML = `<p class="card">表示できる宝珠データがありません。CSV内容を確認してください。</p>`;
    orbCategoryFilterWrap.innerHTML = "";
    return;
  }

  const categories = ["炎", "水", "風", "光", "闇"].filter((category) =>
    orbEntries.some((row) => normalizeOrbCategoryName(row.orbCategory) === category)
  );
  orbCategoryFilterWrap.innerHTML = `
    <button type="button" class="orb-category-button ${selectedOrbCategory === "" ? "is-active" : ""}" data-orb-category="">すべて</button>
    ${categories
      .map(
        (category) => `
          <button type="button" class="orb-category-button ${selectedOrbCategory === category ? "is-active" : ""}" data-orb-category="${category}">${category}</button>
        `
      )
      .join("")}
  `;

  const filteredRows = getOrbFilteredRows();
  orbListWrap.innerHTML = `
    <div class="orb-card-grid">
      ${
        filteredRows.length === 0
          ? `<p class="card orb-empty">条件に一致する宝珠がありません。</p>`
          : filteredRows
              .map((row) => {
                const isExpanded = expandedOrbId === row.id;
                const orbCategoryClass = getOrbCategoryClassName(row.orbCategory);
                const monsterListHtml =
                  row.monsterNames.length > 0
                    ? `<ul class="orb-monster-list">${row.monsterNames.map((name) => `<li>${name}</li>`).join("")}</ul>`
                    : `<p class="orb-monster-empty">ドロップモンスター情報なし</p>`;
                return `
                  <article class="card orb-card orb-card-category-${orbCategoryClass} ${isExpanded ? "is-expanded" : ""}">
                    <button type="button" class="orb-card-toggle" data-orb-id="${row.id}" aria-expanded="${isExpanded ? "true" : "false"}">
                      <p class="orb-card-category">${buildOrbCategoryLabelHtml(row.orbCategory)}</p>
                      <h3 class="orb-card-name">${row.orbName}</h3>
                      <p class="orb-card-effect">${row.effect || "-"}</p>
                    </button>
                    <div class="orb-card-monsters ${isExpanded ? "is-open" : ""}" ${isExpanded ? "" : "hidden"}>
                      <p class="orb-monster-title">ドロップモンスター</p>
                      ${monsterListHtml}
                    </div>
                  </article>
                `;
              })
              .join("")
      }
    </div>
  `;

  orbCategoryFilterWrap.querySelectorAll("[data-orb-category]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOrbCategory = String(button.dataset.orbCategory || "");
      renderOrbCards();
    });
  });

  orbListWrap.querySelectorAll("[data-orb-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const clickedOrbId = String(button.dataset.orbId || "");
      expandedOrbId = expandedOrbId === clickedOrbId ? "" : clickedOrbId;
      renderOrbCards();
    });
  });
}

function renderPresentCodes() {
  if (!presentCodeListWrap) return;
  if (isPresentCodesLoading && !hasLoadedPresentCodes) {
    presentCodeListWrap.innerHTML = `<p class="card">プレゼントのじゅもんを読み込み中です...</p>`;
    return;
  }
  if (!Array.isArray(presentCodes) || presentCodes.length === 0) {
    presentCodeListWrap.innerHTML = `<p class="card">表示できるプレゼントのじゅもんがありません。CSV内容を確認してください。</p>`;
    return;
  }
  const normalizedKeyword = normalizeSearchKeyword(presentCodesKeyword);
  const filteredCodes = normalizedKeyword
    ? presentCodes.filter((row) =>
        [row.code, row.reward, row.expiresAt, row.note]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword)
      )
    : presentCodes;

  presentCodeListWrap.innerHTML = `
    <div class="present-code-list">
      ${filteredCodes
        .map(
          (row) => `
            <article class="present-code-card${row.linkType === "url" ? " is-url" : ""}">
              <p class="present-code-label">${getPresentCodePrimaryLabel(row)}</p>
              <p class="present-code-name">
                <a
                  class="present-code-link"
                  href="${buildPresentCodeLink(row)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >${row.code}</a>
              </p>
              ${
                row.linkType === "url"
                  ? '<p class="present-code-link-note">受け取りページへ</p>'
                  : ""
              }
              <p class="present-code-label">報酬</p>
              <p class="present-code-reward">${formatPresentCodeReward(row.reward)}</p>
              <p class="present-code-label">期限</p>
              <p class="present-code-expire">${row.expiresAt}</p>
              ${
                row.note
                  ? `
                    <p class="present-code-label">条件</p>
                    <p class="present-code-note">${row.note}</p>
                  `
                  : ""
              }
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function getFieldFarmingPriceByMaterialName() {
  const map = new Map();
  (bazaarPrices || []).forEach((row) => {
    const materialName = normalizeMaterialNameKey(row?.materialName);
    const preferredPrice = getPreferredBazaarUnitPrice(row);
    if (!materialName || !Number.isFinite(preferredPrice)) return;
    map.set(materialName, preferredPrice);
  });
  return map;
}

function renderFieldFarmingRanking() {
  if (!fieldFarmingListWrap) return;
  if (isFieldFarmingLoading && !hasLoadedFieldFarmingMonsters) {
    fieldFarmingListWrap.innerHTML = `<p class="card">フィールド狩りデータを読み込み中です...</p>`;
    return;
  }
  if (fieldFarmingSortSelect) {
    fieldFarmingSortSelect.value = selectedFieldFarmingSort;
  }
  if (!Array.isArray(fieldFarmingMonsters) || fieldFarmingMonsters.length === 0) {
    fieldFarmingListWrap.innerHTML = `<p class="card">表示できるフィールド狩りデータがありません。CSV内容を確認してください。</p>`;
    return;
  }

  const priceByMaterialName = getFieldFarmingPriceByMaterialName();
  const normalizedKeyword = normalizeSearchKeyword(fieldFarmingKeyword);
  const rankedRows = fieldFarmingMonsters
    .map((monster) => {
      const normalDropPrice = priceByMaterialName.get(normalizeMaterialNameKey(monster.normalDrop));
      const rareDropPrice = priceByMaterialName.get(normalizeMaterialNameKey(monster.rareDrop));
      return {
        ...monster,
        normalDropPrice: Number.isFinite(normalDropPrice) ? normalDropPrice : null,
        rareDropPrice: Number.isFinite(rareDropPrice) ? rareDropPrice : null,
      };
    })
    .sort((a, b) => {
      const targetPriceKey = selectedFieldFarmingSort === "rare_desc" ? "rareDropPrice" : "normalDropPrice";
      const aPrice = Number.isFinite(a[targetPriceKey]) ? a[targetPriceKey] : -1;
      const bPrice = Number.isFinite(b[targetPriceKey]) ? b[targetPriceKey] : -1;
      if (aPrice !== bPrice) return bPrice - aPrice;
      return a.monsterArea.localeCompare(b.monsterArea, "ja");
    })
    .filter((row) => {
      if (normalizedKeyword === "") return true;
      return [row.monsterName, row.monsterArea, row.area, row.normalDrop, row.rareDrop, row.note]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword);
    });

  fieldFarmingListWrap.innerHTML = `
    <div class="field-farming-list">
      ${rankedRows
        .map((row, index) => {
          const rank = index + 1;
          const normalPriceText = Number.isFinite(row.normalDropPrice) ? formatGold(row.normalDropPrice) : "価格不明";
          const rarePriceText = Number.isFinite(row.rareDropPrice) ? formatGold(row.rareDropPrice) : "価格不明";
          const normalDropOfficialUrl = getOfficialBazaarUrlByMaterialName(row.normalDrop);
          const rareDropOfficialUrl = getOfficialBazaarUrlByMaterialName(row.rareDrop);
          const hasRareDrop = row.rareDrop && row.rareDrop !== "-";
          const mapTriggerHtml = row.mapUrl
            ? `<button type="button" class="field-farming-map-trigger" data-field-map-row-id="${row.id}" aria-label="${row.monsterName || "モンスター"}の出現マップを表示">${row.monsterName || row.monsterArea}</button>`
            : `<span class="field-farming-map-trigger field-farming-map-trigger-disabled">${row.monsterName || row.monsterArea}</span>`;
          const areaLabelHtml = row.area ? `<span class="field-farming-area-label"> / ${row.area}</span>` : "";
          return `
            <article class="field-farming-card">
              <p class="field-farming-rank">${rank}位</p>
              <h3 class="field-farming-monster-area">${mapTriggerHtml}${areaLabelHtml}</h3>
              <p class="field-farming-hp">HP: ${Number.isFinite(row.hp) ? row.hp.toLocaleString("ja-JP") : "-"}</p>
              <p class="field-farming-drop field-farming-drop-normal">
                <span class="field-farming-drop-label">通常ドロップ:</span>
                <span class="field-farming-drop-material">${row.normalDrop}</span>
                <span class="field-farming-drop-divider">/</span>
                <strong>${normalPriceText}</strong>
                <a
                  class="field-farming-price-link field-farming-price-link-normal"
                  href="${normalDropOfficialUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="${row.normalDrop}の公式相場ページを新しいタブで開く"
                >通常相場</a>
              </p>
              <p class="field-farming-drop field-farming-drop-rare">
                <span class="field-farming-drop-label">レアドロップ:</span>
                <span class="field-farming-drop-material">${row.rareDrop || "-"}</span>
                <span class="field-farming-drop-divider">/</span>
                <span class="field-farming-rare-price">${rarePriceText}</span>
                ${
                  hasRareDrop
                    ? `
                      <a
                        class="field-farming-price-link field-farming-price-link-rare"
                        href="${rareDropOfficialUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="${row.rareDrop}の公式相場ページを新しいタブで開く"
                      >レア相場</a>
                    `
                    : `<span class="field-farming-price-link field-farming-price-link-disabled" aria-hidden="true">レア相場</span>`
                }
              </p>
              <p class="field-farming-note">備考: ${row.note || "-"}</p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  fieldFarmingListWrap.querySelectorAll("[data-field-map-row-id]").forEach((button) => {
    button.addEventListener("click", () => {
      openFieldFarmingMapModal(String(button.dataset.fieldMapRowId || ""));
    });
  });
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

function normalizeProfitCategoryLabel(value) {
  const normalized = String(value || "").trim();
  if (normalized === "") return "";
  const aliasMap = new Map([
    ["ムチ", "鞭"],
    ["やり", "槍"],
    ["ヤリ", "槍"],
    ["ツメ", "爪"],
    ["小盾", "盾"],
    ["大盾", "盾"],
  ]);
  return aliasMap.get(normalized) || normalized;
}

function resolveProfitEquipmentIdFromParams(params = {}) {
  const requestedEquipmentId = String(params.equipmentId || "").trim();
  if (requestedEquipmentId && state.equipments.some((equipment) => equipment.id === requestedEquipmentId)) {
    return requestedEquipmentId;
  }

  const requestedName = String(params.equipmentName || "").trim();
  if (!requestedName) return "";

  const nameMatchedEquipments = state.equipments.filter((equipment) => String(equipment?.name || "").trim() === requestedName);
  if (nameMatchedEquipments.length === 0) return "";
  if (nameMatchedEquipments.length === 1) return nameMatchedEquipments[0].id;

  const normalizedRequestedType = normalizeProfitCategoryLabel(params.equipmentType);
  if (normalizedRequestedType) {
    const matchedByType = nameMatchedEquipments.find(
      (equipment) => normalizeProfitCategoryLabel(equipment?.category) === normalizedRequestedType
    );
    if (matchedByType?.id) return matchedByType.id;
  }

  return nameMatchedEquipments[0].id;
}

function selectProfitEquipment(equipmentId) {
  const targetEquipment = state.equipments.find((equipment) => equipment.id === equipmentId);
  if (!targetEquipment) return false;
  selectedEquipmentId = targetEquipment.id;
  selectedCraftsman = String(targetEquipment.craftsman || "");
  selectedCategory = String(targetEquipment.category || "");
  return true;
}

function openRecipeFromFavorite(equipmentId) {
  if (!equipmentId) return;
  if (!selectProfitEquipment(equipmentId)) return;
  switchTab("profit");
  navigateByAppParams({ tab: "profit", equipmentId, materialKey: "" });
  rerenderAll();
  document.getElementById("profit")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function openProfitFromEquipmentDb(entry) {
  const payload = {
    equipmentId: resolveProfitEquipmentIdFromParams({
      equipmentName: entry?.equipmentName,
      equipmentType: entry?.equipmentType,
    }),
    equipmentName: String(entry?.equipmentName || "").trim(),
    equipmentType: String(entry?.equipmentType || "").trim(),
    equipmentGroup: String(entry?.equipmentGroup || "").trim(),
  };

  if (payload.equipmentId) {
    selectProfitEquipment(payload.equipmentId);
  }
  switchTab("profit");
  navigateByAppParams({
    tab: "profit",
    equipmentId: payload.equipmentId,
    materialKey: "",
    profitEquipmentName: payload.equipmentName,
    profitEquipmentType: payload.equipmentType,
    profitEquipmentGroup: payload.equipmentGroup,
  });
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

async function ensureSiteSearchDataLoaded() {
  if (hasLoadedSiteSearchData || isSiteSearchDataLoading) return;
  isSiteSearchDataLoading = true;
  try {
    await Promise.all([
      ensureBazaarPricesLoaded(),
      ensurePresentCodesLoaded(),
      ensureFieldFarmingMonstersLoaded(),
      ensureWhiteBoxDataLoaded(),
      ensureEquipmentDbDataLoaded(),
    ]);
    hasLoadedSiteSearchData = true;
  } finally {
    isSiteSearchDataLoading = false;
  }
}

function applySiteSearchNavigation(entry) {
  if (!entry) return;
  const keyword = String(entry.targetValue || "").trim();
  const resetSearchUi = () => {
    siteSearchKeyword = "";
    syncSiteSearchInputValues();
    if (siteSearchResultWrap) {
      siteSearchResultWrap.hidden = true;
      siteSearchResultWrap.innerHTML = "";
    }
    if (toolSiteSearchResultWrap) {
      toolSiteSearchResultWrap.hidden = true;
      toolSiteSearchResultWrap.innerHTML = "";
    }
  };
  if (entry.tabId === "updates") {
    resetSearchUi();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    const queryText = params.toString();
    window.location.href = `./updates.html${queryText ? `?${queryText}` : ""}`;
    return;
  }
  if (entry.tabId === "profit") {
    resetSearchUi();
    openRecipeFromFavorite(keyword);
    return;
  }
  if (entry.tabId === "equipment-db") {
    selectedEquipmentDbGroup = String(entry.equipmentGroup || "weapon") === "armor" ? "armor" : "weapon";
    selectedEquipmentDbType = "";
    expandedEquipmentDbId = "";
    equipmentDbNameKeyword = keyword;
    switchTab("equipment-db");
    navigateByAppParams({ tab: "equipment-db", equipmentId: "", materialKey: "", equipmentDbGroup: selectedEquipmentDbGroup });
    renderEquipmentDbCards();
    resetSearchUi();
    document.getElementById("equipment-db")?.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }
  if (entry.tabId === "bazaar") {
    switchTab("bazaar");
    bazaarSearchText = keyword;
    selectedBazaarMaterialName = keyword;
    pendingBazaarFocusMaterialKey = String(entry.materialKey || "");
    navigateByAppParams({
      tab: "bazaar",
      equipmentId: "",
      materialKey: pendingBazaarFocusMaterialKey,
    });
    renderBazaarPrices();
    resetSearchUi();
    document.getElementById("bazaar")?.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }
  if (entry.tabId === "white-boxes") {
    whiteBoxKeyword = keyword;
    switchTab("white-boxes");
    navigateByAppParams({ tab: "white-boxes", equipmentId: "", materialKey: "" });
    renderWhiteBoxCards();
    resetSearchUi();
    document.getElementById("white-boxes")?.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }
  if (entry.tabId === "field-farming") {
    fieldFarmingKeyword = keyword;
    switchTab("field-farming");
    navigateByAppParams({ tab: "field-farming", equipmentId: "", materialKey: "" });
    renderFieldFarmingRanking();
    resetSearchUi();
    document.getElementById("field-farming")?.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }
  if (entry.tabId === "present-codes") {
    presentCodesKeyword = keyword;
    switchTab("present-codes");
    navigateByAppParams({ tab: "present-codes", equipmentId: "", materialKey: "" });
    renderPresentCodes();
    resetSearchUi();
    document.getElementById("present-codes")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}

function renderSiteSearchCandidates() {
  const searchTargets = appMode === "home" ? [{ wrap: siteSearchResultWrap }] : [{ wrap: toolSiteSearchResultWrap }];
  const enabledTargets = searchTargets.filter((target) => target.wrap);
  if (enabledTargets.length === 0) return;
  const normalizedKeyword = normalizeSearchKeyword(siteSearchKeyword);
  if (normalizedKeyword === "") {
    enabledTargets.forEach(({ wrap }) => {
      wrap.hidden = true;
      wrap.innerHTML = "";
    });
    return;
  }
  const candidates = getSiteSearchCandidates(siteSearchKeyword);
  enabledTargets.forEach(({ wrap }) => {
    wrap.hidden = false;
  });
  if (isSiteSearchDataLoading && !hasLoadedSiteSearchData) {
    enabledTargets.forEach(({ wrap }) => {
      wrap.innerHTML = `<p class="site-search-empty">検索データを読み込み中です...</p>`;
    });
    return;
  }
  if (candidates.length === 0) {
    enabledTargets.forEach(({ wrap }) => {
      wrap.innerHTML = `<p class="site-search-empty">一致する候補がありません。</p>`;
    });
    return;
  }
  const candidatesHtml = candidates
    .map(
      (entry, index) => `
          <button type="button" class="site-search-result-item" data-site-search-candidate-index="${index}">
            <p class="site-search-result-main">${escapeHtml(entry.name)}</p>
            <p class="site-search-result-meta">
              <span class="site-search-chip site-search-chip-type">${escapeHtml(entry.type)}</span>
              <span class="site-search-chip">${escapeHtml(entry.subLabel)}</span>
            </p>
          </button>
        `
    )
    .join("");
  enabledTargets.forEach(({ wrap }) => {
    wrap.innerHTML = candidatesHtml;
    wrap.querySelectorAll("[data-site-search-candidate-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const candidateIndex = Number(button.dataset.siteSearchCandidateIndex || -1);
        const selected = candidates[candidateIndex];
        if (!selected) return;
        applySiteSearchNavigation(selected);
        wrap.hidden = true;
      });
    });
  });
}

function getBazaarRowByMaterialKey(materialKey) {
  const normalizedKey = String(materialKey || "").trim();
  if (normalizedKey === "") return null;
  return bazaarPrices.find((row) => row?.materialKey === normalizedKey) || null;
}

function syncBodyModalOpenState() {
  const hasOpenModal = Boolean(activeBazaarDetailModalKey || activeFavoriteMaterialModalKey || activeFieldFarmingMapModalRowId);
  document.body.classList.toggle("is-modal-open", hasOpenModal);
}

function closeBazaarDetailModal() {
  if (!bazaarDetailModalOverlay) return;
  bazaarDetailModalSwipeState = null;
  bazaarDetailModalDialog?.classList.remove("is-swipe-dragging");
  bazaarDetailModalDialog?.style.removeProperty("transform");
  bazaarDetailModalDialog?.style.removeProperty("opacity");
  bazaarDetailModalOverlay.hidden = true;
  bazaarDetailModalOverlay.classList.remove("is-open");
  activeBazaarDetailModalKey = "";
  syncBodyModalOpenState();
}

function openBazaarDetailModal(materialKey) {
  if (!bazaarDetailModalOverlay || !bazaarDetailModalBody) return;
  const row = getBazaarRowByMaterialKey(materialKey);
  if (!row) return;

  const history = getBazaarHistoryForRange(row.materialKey, selectedBazaarChartRangeDays);
  const updatedAtText = formatBazaarUpdatedAt(row.updatedAt);
  const chartHtml =
    history.length > 0
      ? `
        <div class="bazaar-detail-modal-chart">${buildBazaarSparklineSvg(history, {
          width: 320,
          height: 176,
          includeYAxisLabels: true,
          xAxisLabelCount: 2,
          yAxisTickCount: 4,
          pointRadius: 2,
        })}</div>
      `
      : `<p class="bazaar-detail-modal-chart-empty">表示できる履歴がありません。</p>`;

  bazaarDetailModalBody.innerHTML = `
    <h3 class="bazaar-detail-modal-title">${row.materialName}</h3>
    <p class="bazaar-detail-modal-updated-at">更新: ${updatedAtText}</p>
    <p class="bazaar-detail-modal-previous">前日価格: ${formatBazaarPriceWithUnit(row.previousDayPrice)}</p>
    ${chartHtml}
    <p class="bazaar-detail-modal-period">表示期間: 直近${selectedBazaarChartRangeDays}日（${history.length}件）</p>
    <p class="bazaar-detail-modal-latest">最新価格: <strong>${formatBazaarPriceWithUnit(row.displayPrice)}</strong></p>
    ${
      row.officialUrl
        ? `<a class="bazaar-detail-modal-link" href="${row.officialUrl}" target="_blank" rel="noopener noreferrer">公式相場で確認</a>`
        : ""
    }
  `;

  activeBazaarDetailModalKey = row.materialKey;
  bazaarDetailModalOverlay.hidden = false;
  bazaarDetailModalOverlay.classList.add("is-open");
  syncBodyModalOpenState();
  bazaarDetailModalDialog?.focus();
}

function handleBazaarDetailSwipeStart(event) {
  if (!bazaarDetailModalOverlay?.classList.contains("is-open")) return;
  if (!bazaarDetailModalDialog) return;
  if (event.pointerType !== "touch") return;
  if (bazaarDetailModalDialog.scrollTop > 0) return;

  bazaarDetailModalSwipeState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    latestY: event.clientY,
    isDragging: false,
    canceled: false,
  };
  bazaarDetailModalHandle?.setPointerCapture(event.pointerId);
}

function handleBazaarDetailSwipeMove(event) {
  if (!bazaarDetailModalSwipeState) return;
  if (event.pointerId !== bazaarDetailModalSwipeState.pointerId) return;
  if (!bazaarDetailModalDialog) return;
  if (bazaarDetailModalSwipeState.canceled) return;

  const deltaY = event.clientY - bazaarDetailModalSwipeState.startY;
  const absDeltaX = Math.abs(event.clientX - bazaarDetailModalSwipeState.startX);
  const absDeltaY = Math.abs(deltaY);
  bazaarDetailModalSwipeState.latestY = event.clientY;

  if (!bazaarDetailModalSwipeState.isDragging) {
    if (absDeltaX < BAZAAR_DETAIL_MODAL_SWIPE_START_SLOP_PX && absDeltaY < BAZAAR_DETAIL_MODAL_SWIPE_START_SLOP_PX) return;
    if (deltaY <= 0) {
      bazaarDetailModalSwipeState.canceled = true;
      return;
    }
    if (absDeltaY < absDeltaX * BAZAAR_DETAIL_MODAL_SWIPE_VERTICAL_DOMINANCE_RATIO) {
      bazaarDetailModalSwipeState.canceled = true;
      return;
    }
    if (bazaarDetailModalDialog.scrollTop > 0) {
      bazaarDetailModalSwipeState.canceled = true;
      return;
    }
    bazaarDetailModalSwipeState.isDragging = true;
    bazaarDetailModalDialog.classList.add("is-swipe-dragging");
  }

  const translateY = Math.min(Math.max(deltaY, 0), BAZAAR_DETAIL_MODAL_SWIPE_MAX_TRANSLATE_PX);
  const progress = Math.min(translateY / BAZAAR_DETAIL_MODAL_SWIPE_CLOSE_THRESHOLD_PX, 1);
  bazaarDetailModalDialog.style.transform = `translateY(${translateY.toFixed(2)}px)`;
  bazaarDetailModalDialog.style.opacity = `${(1 - progress * 0.14).toFixed(3)}`;
  event.preventDefault();
}

function finalizeBazaarDetailSwipe(event) {
  if (!bazaarDetailModalSwipeState) return;
  if (event.pointerId !== bazaarDetailModalSwipeState.pointerId) return;
  if (!bazaarDetailModalDialog) {
    bazaarDetailModalSwipeState = null;
    return;
  }
  bazaarDetailModalHandle?.releasePointerCapture?.(event.pointerId);

  const totalDeltaY = (bazaarDetailModalSwipeState.latestY || bazaarDetailModalSwipeState.startY) - bazaarDetailModalSwipeState.startY;
  const shouldClose =
    bazaarDetailModalSwipeState.isDragging &&
    !bazaarDetailModalSwipeState.canceled &&
    totalDeltaY >= BAZAAR_DETAIL_MODAL_SWIPE_CLOSE_THRESHOLD_PX;

  bazaarDetailModalSwipeState = null;

  bazaarDetailModalDialog.classList.remove("is-swipe-dragging");
  if (shouldClose) {
    closeBazaarDetailModal();
    return;
  }
  bazaarDetailModalDialog.style.removeProperty("transform");
  bazaarDetailModalDialog.style.removeProperty("opacity");
}

function closeFavoriteMaterialModal() {
  if (!favoriteMaterialModalOverlay) return;
  favoriteMaterialModalOverlay.hidden = true;
  favoriteMaterialModalOverlay.classList.remove("is-open");
  activeFavoriteMaterialModalKey = "";
  syncBodyModalOpenState();
}

function openFavoriteMaterialModal(materialKey) {
  if (!favoriteMaterialModalOverlay || !favoriteMaterialModalBody) return;
  const row = getBazaarRowByMaterialKey(materialKey);
  if (!row) return;

  const chartHistory = getBazaarHistoryForRange(row.materialKey, DEFAULT_BAZAAR_CHART_RANGE_DAYS);
  const chartSvg = buildBazaarSparklineSvg(chartHistory, { width: 228, height: 62, pointRadius: 1.9 });
  const chartHtml =
    chartHistory.length > 0
      ? `
        <div class="favorite-material-modal-chart">${chartSvg}</div>
        <p class="favorite-material-modal-chart-meta">価格履歴: 直近${DEFAULT_BAZAAR_CHART_RANGE_DAYS}日（${chartHistory.length}件）</p>
      `
      : `<p class="favorite-material-modal-chart-empty">表示できる価格履歴がありません。</p>`;

  favoriteMaterialModalBody.innerHTML = `
    <h3 class="favorite-material-modal-title">${row.materialName}</h3>
    <p class="favorite-material-modal-price">現在価格: <strong>${formatBazaarPriceWithUnit(row.displayPrice)}</strong></p>
    <p class="favorite-material-modal-previous">前日単価: ${formatBazaarPriceWithUnit(row.previousDayPrice)}</p>
    ${chartHtml}
    <a class="favorite-material-modal-link" href="${getOfficialBazaarUrlByMaterialName(row.materialName)}" target="_blank" rel="noopener noreferrer">公式相場サイトで確認</a>
  `;

  activeFavoriteMaterialModalKey = row.materialKey;
  favoriteMaterialModalOverlay.hidden = false;
  favoriteMaterialModalOverlay.classList.add("is-open");
  syncBodyModalOpenState();
  favoriteMaterialModalDialog?.focus();
}

function closeFieldFarmingMapModal() {
  if (!fieldFarmingMapModalOverlay) return;
  fieldFarmingMapModalOverlay.hidden = true;
  fieldFarmingMapModalOverlay.classList.remove("is-open");
  activeFieldFarmingMapModalRowId = "";
  syncBodyModalOpenState();
}

function openFieldFarmingMapModal(rowId) {
  if (!fieldFarmingMapModalOverlay || !fieldFarmingMapModalBody) return;
  const row = fieldFarmingMonsters.find((monster) => monster.id === rowId);
  if (!row?.mapUrl) return;

  const areaLabel = row.area ? `（${row.area}）` : "";
  fieldFarmingMapModalBody.innerHTML = `
    <h3 class="field-farming-map-modal-title">${row.monsterName || row.monsterArea}${areaLabel}</h3>
    <div class="field-farming-map-image-wrap">
      <img class="field-farming-map-image" alt="${row.monsterName || "モンスター"}の出現マップ" loading="lazy" decoding="async" fetchpriority="low" />
      <p class="field-farming-map-image-fallback" hidden>マップ画像を読み込めませんでした。</p>
    </div>
  `;
  const mapImage = fieldFarmingMapModalBody.querySelector(".field-farming-map-image");
  const fallbackMessage = fieldFarmingMapModalBody.querySelector(".field-farming-map-image-fallback");
  if (mapImage && fallbackMessage) {
    mapImage.classList.remove("is-hidden");
    fallbackMessage.hidden = true;
    mapImage.addEventListener("load", () => {
      mapImage.classList.remove("is-hidden");
      fallbackMessage.hidden = true;
    });
    mapImage.setAttribute("src", resolveProjectScopedAssetUrl(row.mapUrl));
    mapImage.addEventListener("error", () => {
      mapImage.classList.add("is-hidden");
      fallbackMessage.hidden = false;
    });
  }
  activeFieldFarmingMapModalRowId = row.id;
  fieldFarmingMapModalOverlay.hidden = false;
  fieldFarmingMapModalOverlay.classList.add("is-open");
  syncBodyModalOpenState();
  fieldFarmingMapModalDialog?.focus();
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
              <a href="#" class="favorite-link-button" data-favorite-recipe-link-id="${equipment.id}">職人アシストで開く</a>
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
                  aria-label="${row.materialName}の詳細を表示"
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
            </article>
          `;
        })
        .join("")}
    </div>
  `;

  favoriteMaterialsListWrap.querySelectorAll("[data-favorite-material-key]").forEach((button) => {
    button.addEventListener("click", () => {
      openFavoriteMaterialModal(String(button.dataset.favoriteMaterialKey || ""));
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

function setUiSettingsMessage(message, isError = false) {
  if (!uiSettingsMessage) return;
  uiSettingsMessage.textContent = message;
  uiSettingsMessage.style.color = isError ? "#8a2c2c" : "";
}

function normalizeUiSettingValue(definition, rawValue) {
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) return DEFAULT_UI_SETTINGS[definition.key];
  const stepped = Math.round(numeric / definition.step) * definition.step;
  const fixed = Number(stepped.toFixed(3));
  return Math.min(definition.max, Math.max(definition.min, fixed));
}

function normalizeUiSettings(rawSettings) {
  const normalized = {};
  UI_SETTING_DEFINITIONS.forEach((definition) => {
    const rawValue = rawSettings?.[definition.key];
    normalized[definition.key] = normalizeUiSettingValue(definition, rawValue ?? DEFAULT_UI_SETTINGS[definition.key]);
  });
  return normalized;
}

async function loadUiSettings() {
  try {
    const response = await fetch(UI_SETTINGS_JSON_PATH, { cache: "no-store" });
    if (!response.ok) throw new Error(`status=${response.status}`);
    const json = await response.json();
    uiSettings = normalizeUiSettings(json);
  } catch (error) {
    console.warn(`ui-settings.json の読み込みに失敗しました: path=${UI_SETTINGS_JSON_PATH}`, error);
    uiSettings = structuredClone(DEFAULT_UI_SETTINGS);
  }
}

function applyUiSettingsToRoot() {
  const root = document.documentElement;
  root.style.setProperty("--ui-section-vertical-space", `${uiSettings.sectionVerticalSpace}px`);
  root.style.setProperty("--ui-card-padding", `${uiSettings.cardPadding}px`);
  root.style.setProperty("--ui-card-radius", `${uiSettings.cardRadius}px`);
  root.style.setProperty("--ui-title-font-size", `${uiSettings.titleFontSize}rem`);
  root.style.setProperty("--ui-body-font-size", `${uiSettings.bodyFontSize}px`);
  root.style.setProperty("--ui-button-height", `${uiSettings.buttonHeight}px`);
  root.style.setProperty("--ui-button-radius", `${uiSettings.buttonRadius}px`);
  root.style.setProperty("--ui-icon-size", `${uiSettings.iconSize}px`);
  root.style.setProperty("--ui-mobile-card-columns", String(uiSettings.mobileCardColumns));
  root.style.setProperty("--ui-desktop-max-width", `${uiSettings.desktopMaxWidth}px`);
}

function buildUiSettingsControl(definition) {
  const wrapper = document.createElement("div");
  wrapper.className = "ui-setting-control";
  const value = uiSettings[definition.key];
  const valueLabel = `${value}${definition.unit}`;
  wrapper.innerHTML = `
    <label class="field">
      <span>${definition.label} <small>(${valueLabel})</small></span>
      <input type="range" min="${definition.min}" max="${definition.max}" step="${definition.step}" value="${value}" data-ui-setting-key="${definition.key}" data-input-type="range" />
    </label>
    <label class="field ui-setting-number-field">
      <span>値</span>
      <input type="number" min="${definition.min}" max="${definition.max}" step="${definition.step}" value="${value}" data-ui-setting-key="${definition.key}" data-input-type="number" />
    </label>
  `;
  return wrapper;
}

function renderUiSettingsPanel() {
  if (!uiSettingsControlList) return;
  uiSettingsControlList.innerHTML = "";
  UI_SETTING_DEFINITIONS.forEach((definition) => {
    uiSettingsControlList.append(buildUiSettingsControl(definition));
  });
}

function syncUiSettingRow(definition, value) {
  if (!uiSettingsControlList) return;
  const inputs = uiSettingsControlList.querySelectorAll(`[data-ui-setting-key="${definition.key}"]`);
  inputs.forEach((input) => {
    input.value = String(value);
  });
  const label = inputs[0]?.closest(".field")?.querySelector("small");
  if (label) label.textContent = `(${value}${definition.unit})`;
}

function updateUiSetting(definition, nextRawValue) {
  const normalized = normalizeUiSettingValue(definition, nextRawValue);
  uiSettings[definition.key] = normalized;
  applyUiSettingsToRoot();
  syncUiSettingRow(definition, normalized);
}

function downloadUiSettingsJson() {
  const payload = normalizeUiSettings(uiSettings);
  downloadJsonWithFixedFileName(payload, "ui-settings.json");
}

function setContentEditorMessage(message, isError = false) {
  if (!contentEditorMessage) return;
  contentEditorMessage.textContent = message;
  contentEditorMessage.style.color = isError ? "#8a2c2c" : "";
}

function setAdminFabMessage(message, isError = false) {
  if (!adminFabMessage) return;
  adminFabMessage.textContent = message;
  adminFabMessage.style.color = isError ? "#8a2c2c" : "";
}

function setUpdatesEditorMessage(message, isError = false) {
  if (!updatesEditorMessage) return;
  updatesEditorMessage.textContent = message;
  updatesEditorMessage.style.color = isError ? "#8a2c2c" : "";
}

function markImeComposing(target, composing) {
  if (!(target instanceof HTMLElement)) return;
  if (composing) {
    imeComposingTargets.add(target);
    return;
  }
  imeComposingTargets.delete(target);
}

function isImeComposing(target) {
  return target instanceof HTMLElement && imeComposingTargets.has(target);
}

function normalizeContent(rawContent) {
  const normalized = {};
  CONTENT_DEFINITIONS.forEach((definition) => {
    const value = rawContent?.[definition.key];
    normalized[definition.key] = typeof value === "string" && value.trim() !== "" ? value : DEFAULT_CONTENT[definition.key];
  });
  return normalized;
}

async function loadContentData() {
  try {
    const response = await fetch(CONTENT_JSON_PATH, { cache: "no-store" });
    if (!response.ok) throw new Error(`status=${response.status}`);
    const json = await response.json();
    const normalized = normalizeContent(json);
    contentData = structuredClone(normalized);
    initialContentData = structuredClone(normalized);
  } catch (error) {
    console.warn(`content.json の読み込みに失敗しました: path=${CONTENT_JSON_PATH}`, error);
    contentData = structuredClone(DEFAULT_CONTENT);
    initialContentData = structuredClone(DEFAULT_CONTENT);
  }
}

function applyContentToView() {
  CONTENT_DEFINITIONS.forEach((definition) => {
    const target = document.querySelector(definition.selector);
    if (!target) return;
    target.dataset.contentKey = definition.key;
    target.textContent = contentData[definition.key] || "";
  });
}

function buildContentEditorControl(definition) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";
  wrapper.innerHTML = `
    <span>${definition.label}</span>
    <textarea class="content-editor-textarea" data-content-key="${definition.key}">${contentData[definition.key] || ""}</textarea>
  `;
  return wrapper;
}

function renderContentEditorPanel() {
  if (!contentEditorControlList) return;
  contentEditorControlList.innerHTML = "";
  CONTENT_DEFINITIONS.forEach((definition) => {
    contentEditorControlList.append(buildContentEditorControl(definition));
  });
}

function syncContentEditorTextareaValue(contentKey, value) {
  if (!contentEditorControlList) return;
  const controls = contentEditorControlList.querySelectorAll("textarea[data-content-key]");
  controls.forEach((textarea) => {
    if (!(textarea instanceof HTMLTextAreaElement)) return;
    if (textarea.dataset.contentKey !== contentKey) return;
    if (textarea.value !== value) {
      textarea.value = value;
    }
  });
}

function downloadContentJson() {
  const payload = normalizeContent(contentData);
  downloadJsonWithFixedFileName(payload, "content.json");
}

function renderContentEditModeState() {
  const editableNodes = document.querySelectorAll("[data-content-key]");
  editableNodes.forEach((node) => {
    node.classList.toggle("is-content-edit-target", isContentEditModeEnabled);
    node.contentEditable = isContentEditModeEnabled ? "true" : "false";
    node.spellcheck = isContentEditModeEnabled;
  });
  if (contentEditorModeToggleButton) {
    contentEditorModeToggleButton.textContent = `本文編集モード: ${isContentEditModeEnabled ? "ON" : "OFF"}`;
  }
  if (adminToggleContentEditModeButton) {
    adminToggleContentEditModeButton.textContent = `本文編集モード: ${isContentEditModeEnabled ? "ON" : "OFF"}`;
  }
}

function setContentEditModeEnabled(enabled) {
  isContentEditModeEnabled = Boolean(enabled);
  renderContentEditModeState();
}

function downloadUpdatesJson() {
  const payload = normalizeUpdates(topUpdates);
  downloadJsonWithFixedFileName(payload, "updates.json");
}

function downloadJsonWithFixedFileName(payload, fileName) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function buildUpdatesEditorItem(entry, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "updates-editor-item";
  wrapper.innerHTML = `
    <div class="updates-editor-grid">
      <label class="field">
        <span>日付</span>
        <input type="date" value="${escapeHtml(entry.date)}" data-update-index="${index}" data-update-field="date" />
      </label>
      <label class="field">
        <span>リンクURL（任意）</span>
        <input type="url" value="${escapeHtml(entry.url || "")}" placeholder="https://example.com" data-update-index="${index}" data-update-field="url" />
      </label>
      <label class="field">
        <span>リンク文言（任意）</span>
        <input type="text" value="${escapeHtml(entry.link_label || "")}" placeholder="詳細を見る" data-update-index="${index}" data-update-field="link_label" />
      </label>
      <label class="field updates-editor-text-field">
        <span>本文</span>
        <textarea class="content-editor-textarea" data-update-index="${index}" data-update-field="text">${escapeHtml(entry.text)}</textarea>
      </label>
    </div>
    <div class="updates-editor-actions">
      <button type="button" data-update-action="move-up" data-update-index="${index}">↑ 上へ</button>
      <button type="button" data-update-action="move-down" data-update-index="${index}">↓ 下へ</button>
      <button type="button" data-update-action="delete" data-update-index="${index}">削除</button>
    </div>
  `;
  return wrapper;
}

function renderUpdatesEditorPanel() {
  if (!updatesEditorList) return;
  updatesEditorList.innerHTML = "";
  topUpdates.forEach((entry, index) => {
    updatesEditorList.append(buildUpdatesEditorItem(entry, index));
  });
}

function setAdminModeEnabled(enabled) {
  isAdminModeEnabled = enabled;
  localStorage.setItem(ADMIN_MODE_STORAGE_KEY, enabled ? "1" : "0");
  if (adminActionList) adminActionList.hidden = !enabled;
  if (adminPinGate) adminPinGate.hidden = enabled;
}

function toggleAdminFabPanel() {
  if (!adminFabPanel || !adminFabToggleButton) return;
  const nextOpen = adminFabPanel.hidden;
  adminFabPanel.hidden = !nextOpen;
  adminFabToggleButton.setAttribute("aria-expanded", nextOpen ? "true" : "false");
}

function scrollToHomeTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncSiteSearchInputValues() {
  if (siteSearchInput && siteSearchInput.value !== siteSearchKeyword) {
    siteSearchInput.value = siteSearchKeyword;
  }
  if (toolSiteSearchInput && toolSiteSearchInput.value !== siteSearchKeyword) {
    toolSiteSearchInput.value = siteSearchKeyword;
  }
}

function setToolSiteSearchOpen(isOpen) {
  isToolSiteSearchOpen = Boolean(isOpen);
  if (toolSiteSearchPanel) toolSiteSearchPanel.hidden = !isToolSiteSearchOpen;
  if (toolSiteSearchToggleButton) {
    toolSiteSearchToggleButton.setAttribute("aria-expanded", isToolSiteSearchOpen ? "true" : "false");
  }
  if (!isToolSiteSearchOpen && toolSiteSearchResultWrap) {
    toolSiteSearchResultWrap.hidden = true;
  }
}

function applyAppMode() {
  const isHomeMode = appMode === "home";
  appRoot?.classList.toggle("is-home-mode", isHomeMode);
  appHeader?.classList.toggle("is-collapsed", !isHomeMode);
  homeSiteSearch?.classList.toggle("is-hidden", !isHomeMode);
  toolSiteSearchDock?.classList.toggle("is-visible", !isHomeMode);
  if (isHomeMode) {
    setToolSiteSearchOpen(false);
  }
  topQuickAccessSection?.classList.toggle("is-collapsed", !isHomeMode);
  topUpdateSection?.classList.toggle("is-collapsed", !isHomeMode);
  mobileBottomNav?.classList.toggle("is-disabled", isHomeMode);
  if (isHomeMode) {
    setMobileBottomNavHidden(false);
  }
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function scrollToToolSection(target) {
  if (!target) return;
  const currentScrollY = window.scrollY || window.pageYOffset || 0;
  const targetRect = target.getBoundingClientRect();
  const targetTop = currentScrollY + targetRect.top;
  const viewportBasedOffset = window.innerHeight * TOOL_SCROLL_OFFSETS.preferredViewportRatio;
  let topOffset = clampNumber(viewportBasedOffset, TOOL_SCROLL_OFFSETS.min, TOOL_SCROLL_OFFSETS.max);

  if (topQuickAccessSection) {
    const quickAccessRect = topQuickAccessSection.getBoundingClientRect();
    const quickAccessOffset = clampNumber(
      quickAccessRect.height * 0.2,
      TOOL_SCROLL_OFFSETS.quickAccessVisibleMin,
      TOOL_SCROLL_OFFSETS.quickAccessVisibleMax
    );
    topOffset = Math.max(topOffset, quickAccessOffset + TOOL_SCROLL_OFFSETS.targetTopGap);
  }

  const destinationTop = Math.max(0, targetTop - topOffset);
  window.scrollTo({ top: destinationTop, behavior: "smooth" });
}

function switchToHomeMode(options = {}) {
  const { scroll = true } = options;
  appMode = "home";
  tabContents.forEach((tab) => tab.classList.remove("active"));
  applyAppMode();
  updateMobileBottomNavState();
  navigateByAppParams({ tab: "", equipmentId: "", materialKey: "" }, { replace: true });
  if (scroll) scrollToHomeTop();
}

function switchTab(target) {
  const requestedTarget = TAB_IDS.has(target) ? target : "profit";
  const normalizedTarget =
    (requestedTarget === "ui-settings" ||
      requestedTarget === "content-editor" ||
      requestedTarget === "updates-editor" ||
      requestedTarget === "bazaar-admin") &&
    !isAdminModeEnabled
      ? "profit"
      : requestedTarget;
  activeTabId = normalizedTarget;
  appMode = "tool";
  applyAppMode();
  updateMobileBottomNavState();
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === normalizedTarget));
  tabContents.forEach((tab) => tab.classList.toggle("active", tab.id === normalizedTarget));
  if (normalizedTarget === "present-codes") {
    renderPresentCodes();
  } else if (normalizedTarget === "field-farming") {
    renderFieldFarmingRanking();
  } else if (normalizedTarget === "bazaar") {
    renderBazaarPrices();
  } else if (normalizedTarget === "favorites") {
    renderFavoritesPage();
  } else if (normalizedTarget === "orbs") {
    renderOrbCards();
  } else if (normalizedTarget === "white-boxes") {
    renderWhiteBoxCards();
  } else if (normalizedTarget === "equipment-db") {
    renderEquipmentDbCards();
  } else if (normalizedTarget === "bazaar-admin") {
    renderBazaarAdminPanel();
  } else if (normalizedTarget === "profit") {
    renderCraftIdealValue();
  }
  prefetchDataForTab(normalizedTarget);
}

function buildAppQueryParams(nextValues = {}) {
  const currentParams = new URLSearchParams(window.location.search);
  const hasTabValue = Object.prototype.hasOwnProperty.call(nextValues, "tab");
  const currentTab = currentParams.get("tab");
  let tab = "";
  if (hasTabValue) {
    tab = TAB_IDS.has(nextValues.tab) ? nextValues.tab : "";
  } else if (TAB_IDS.has(currentTab)) {
    tab = currentTab;
  } else if (appMode === "tool" && TAB_IDS.has(activeTabId)) {
    tab = activeTabId;
  }
  const params = new URLSearchParams();
  if (tab) params.set("tab", tab);
  if (nextValues.equipmentId) params.set("equipmentId", nextValues.equipmentId);
  if (nextValues.materialKey) params.set("materialKey", nextValues.materialKey);
  if (nextValues.equipmentDbGroup === "armor" || nextValues.equipmentDbGroup === "weapon") {
    params.set("equipmentDbGroup", nextValues.equipmentDbGroup);
  }
  if (nextValues.profitEquipmentName) params.set("profitEquipmentName", nextValues.profitEquipmentName);
  if (nextValues.profitEquipmentType) params.set("profitEquipmentType", nextValues.profitEquipmentType);
  if (nextValues.profitEquipmentGroup === "armor" || nextValues.profitEquipmentGroup === "weapon") {
    params.set("profitEquipmentGroup", nextValues.profitEquipmentGroup);
  }
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
    switchToHomeMode({ scroll: false });
  }

  const equipmentId = String(params.get("equipmentId") || "").trim();
  const profitEquipmentName = String(params.get("profitEquipmentName") || "").trim();
  const profitEquipmentType = String(params.get("profitEquipmentType") || "").trim();
  const resolvedEquipmentId = resolveProfitEquipmentIdFromParams({
    equipmentId,
    equipmentName: profitEquipmentName,
    equipmentType: profitEquipmentType,
  });
  if (resolvedEquipmentId) {
    selectProfitEquipment(resolvedEquipmentId);
  }
  const equipmentDbGroupParam = String(params.get("equipmentDbGroup") || "").trim();
  if (equipmentDbGroupParam === "armor" || equipmentDbGroupParam === "weapon") {
    selectedEquipmentDbGroup = equipmentDbGroupParam;
  }

  pendingBazaarFocusMaterialKey = String(params.get("materialKey") || "").trim();
}

function setMenuOpen(isOpen) {
  if (!sideMenu || !menuOverlay || !menuToggleButton) return;
  sideMenu.classList.toggle("is-open", isOpen);
  sideMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  menuToggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menuOverlay.hidden = !isOpen;
  if (isOpen) {
    setMobileBottomNavHidden(false);
  }
  updateMobileBottomNavState();
}

function updateMobileBottomNavState() {
  mobileBottomNavItems.forEach((item) => {
    const action = String(item.dataset.bottomNavAction || "");
    const targetId = String(item.dataset.bottomNavTarget || "");
    const isActive =
      (action === "home" && appMode === "home") ||
      (action === "menu" && sideMenu?.classList.contains("is-open")) ||
      (targetId !== "" && appMode === "tool" && activeTabId === targetId);
    item.classList.toggle("is-active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

let lastScrollY = window.scrollY;
let mobileBottomNavRevealTimer = null;
const mobileBottomNavScrollThreshold = 12;
const mobileBottomNavRevealDelayMs = 140;

function setMobileBottomNavHidden(isHidden) {
  if (!mobileBottomNav) return;
  if (mobileBottomNav.classList.contains("is-disabled")) return;
  mobileBottomNav.classList.toggle("is-hidden", isHidden);
}

function handleMobileBottomNavScroll() {
  if (!mobileBottomNav || window.innerWidth >= 700) return;
  if (sideMenu?.classList.contains("is-open")) {
    setMobileBottomNavHidden(false);
    return;
  }

  const currentY = Math.max(window.scrollY, 0);
  const deltaY = currentY - lastScrollY;
  if (Math.abs(deltaY) < mobileBottomNavScrollThreshold) return;

  if (mobileBottomNavRevealTimer) {
    window.clearTimeout(mobileBottomNavRevealTimer);
    mobileBottomNavRevealTimer = null;
  }

  if (deltaY > 0 && currentY > 24) {
    setMobileBottomNavHidden(true);
  } else {
    setMobileBottomNavHidden(false);
  }
  lastScrollY = currentY;

  mobileBottomNavRevealTimer = window.setTimeout(() => {
    setMobileBottomNavHidden(false);
    mobileBottomNavRevealTimer = null;
  }, mobileBottomNavRevealDelayMs);
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
  window.requestAnimationFrame(() => {
    scrollToToolSection(target);
  });
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

if (favoriteMaterialModalOverlay) {
  favoriteMaterialModalOverlay.addEventListener("click", (event) => {
    if (event.target === favoriteMaterialModalOverlay) {
      closeFavoriteMaterialModal();
    }
  });
}

if (bazaarDetailModalOverlay) {
  bazaarDetailModalOverlay.addEventListener("click", (event) => {
    if (event.target === bazaarDetailModalOverlay) {
      closeBazaarDetailModal();
    }
  });
}

if (fieldFarmingMapModalOverlay) {
  fieldFarmingMapModalOverlay.addEventListener("click", (event) => {
    if (event.target === fieldFarmingMapModalOverlay) {
      closeFieldFarmingMapModal();
    }
  });
}

if (favoriteMaterialModalCloseButton) {
  favoriteMaterialModalCloseButton.addEventListener("click", () => {
    closeFavoriteMaterialModal();
  });
}

if (bazaarDetailModalCloseButton) {
  bazaarDetailModalCloseButton.addEventListener("click", () => {
    closeBazaarDetailModal();
  });
}

if (bazaarDetailModalHandle) {
  bazaarDetailModalHandle.addEventListener("pointerdown", handleBazaarDetailSwipeStart);
  bazaarDetailModalHandle.addEventListener("pointermove", handleBazaarDetailSwipeMove);
  bazaarDetailModalHandle.addEventListener("pointerup", finalizeBazaarDetailSwipe);
  bazaarDetailModalHandle.addEventListener("pointercancel", finalizeBazaarDetailSwipe);
}

if (fieldFarmingMapModalCloseButton) {
  fieldFarmingMapModalCloseButton.addEventListener("click", () => {
    closeFieldFarmingMapModal();
  });
}

sideMenuItems.forEach((item) => {
  item.addEventListener("click", () => {
    const action = String(item.dataset.menuAction || "");
    if (action === "home") {
      switchToHomeMode();
      setMenuOpen(false);
      return;
    }
    const targetId = item.dataset.menuTarget || "";
    scrollToBlock(targetId);
    setMenuOpen(false);
  });
});

if (homeQuickFeatureGrid) {
  homeQuickFeatureGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest(".side-menu-item[data-menu-target]");
    if (!(trigger instanceof HTMLElement)) return;
    const targetId = String(trigger.dataset.menuTarget || "");
    scrollToBlock(targetId);
  });
}

if (homeModeButton) {
  homeModeButton.addEventListener("click", () => {
    switchToHomeMode();
  });
}

mobileBottomNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    const action = String(item.dataset.bottomNavAction || "");
    if (action === "home") {
      switchToHomeMode();
      setMenuOpen(false);
      return;
    }
    if (action === "menu") {
      const next = menuToggleButton?.getAttribute("aria-expanded") !== "true";
      setMenuOpen(next);
      return;
    }
    const targetId = String(item.dataset.bottomNavTarget || "");
    if (!targetId) return;
    scrollToBlock(targetId);
    setMenuOpen(false);
  });
});

window.addEventListener("scroll", handleMobileBottomNavScroll, { passive: true });
window.addEventListener("resize", () => {
  lastScrollY = window.scrollY;
  setMobileBottomNavHidden(false);
});

if (uiSettingsControlList) {
  uiSettingsControlList.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const settingKey = String(input.dataset.uiSettingKey || "");
    const definition = UI_SETTING_DEFINITIONS.find((item) => item.key === settingKey);
    if (!definition) return;
    updateUiSetting(definition, input.value);
    setUiSettingsMessage("表示に反映しました。必要に応じてJSONをダウンロードして data/ui-settings.json を更新してください。");
  });
}

if (uiSettingsResetButton) {
  uiSettingsResetButton.addEventListener("click", () => {
    uiSettings = structuredClone(DEFAULT_UI_SETTINGS);
    applyUiSettingsToRoot();
    renderUiSettingsPanel();
    setUiSettingsMessage("初期値に戻しました。");
  });
}

if (uiSettingsExportButton) {
  uiSettingsExportButton.addEventListener("click", () => {
    downloadUiSettingsJson();
    setUiSettingsMessage("設定JSONをダウンロードしました。");
  });
}

if (contentEditorControlList) {
  contentEditorControlList.addEventListener("compositionstart", (event) => {
    markImeComposing(event.target, true);
  });
  contentEditorControlList.addEventListener("compositionend", (event) => {
    const input = event.target;
    markImeComposing(input, false);
    if (!(input instanceof HTMLTextAreaElement)) return;
    const contentKey = String(input.dataset.contentKey || "");
    const definition = CONTENT_DEFINITIONS.find((item) => item.key === contentKey);
    if (!definition) return;
    contentData[definition.key] = input.value;
    applyContentToView();
    setContentEditorMessage("本文をプレビューに反映しました。");
  });
  contentEditorControlList.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLTextAreaElement)) return;
    if (event.isComposing || isImeComposing(input)) return;
    const contentKey = String(input.dataset.contentKey || "");
    const definition = CONTENT_DEFINITIONS.find((item) => item.key === contentKey);
    if (!definition) return;
    contentData[definition.key] = input.value;
    applyContentToView();
    setContentEditorMessage("本文をプレビューに反映しました。");
  });
}

document.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
  if (event.isComposing || isImeComposing(target)) return;
  const contentKey = String(target.dataset.contentKey || "");
  if (!contentKey || !isContentEditModeEnabled || target.contentEditable !== "true") return;
  const definition = CONTENT_DEFINITIONS.find((item) => item.key === contentKey);
  if (!definition) return;
  contentData[definition.key] = target.textContent || "";
  syncContentEditorTextareaValue(definition.key, contentData[definition.key]);
  setContentEditorMessage("本文をその場編集で反映しました。");
});

document.addEventListener("compositionstart", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!isContentEditModeEnabled || target.contentEditable !== "true") return;
  if (!target.dataset.contentKey) return;
  markImeComposing(target, true);
});

document.addEventListener("compositionend", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.dataset.contentKey) return;
  markImeComposing(target, false);
  if (!isContentEditModeEnabled || target.contentEditable !== "true") return;
  const contentKey = String(target.dataset.contentKey || "");
  const definition = CONTENT_DEFINITIONS.find((item) => item.key === contentKey);
  if (!definition) return;
  contentData[definition.key] = target.textContent || "";
  syncContentEditorTextareaValue(definition.key, contentData[definition.key]);
  setContentEditorMessage("本文をその場編集で反映しました。");
});

if (contentEditorModeToggleButton) {
  contentEditorModeToggleButton.addEventListener("click", () => {
    setContentEditModeEnabled(!isContentEditModeEnabled);
    setContentEditorMessage(`本文編集モードを${isContentEditModeEnabled ? "ON" : "OFF"}にしました。`);
  });
}

if (contentEditorResetButton) {
  contentEditorResetButton.addEventListener("click", () => {
    contentData = structuredClone(initialContentData);
    applyContentToView();
    renderContentEditorPanel();
    setContentEditModeEnabled(false);
    setContentEditorMessage("読込時の本文に戻しました。");
  });
}

if (contentEditorExportButton) {
  contentEditorExportButton.addEventListener("click", () => {
    downloadContentJson();
    setContentEditorMessage("本文JSONをダウンロードしました。");
  });
}

if (updatesEditorList) {
  updatesEditorList.addEventListener("compositionstart", (event) => {
    markImeComposing(event.target, true);
  });
  updatesEditorList.addEventListener("compositionend", (event) => {
    const input = event.target;
    markImeComposing(input, false);
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return;
    const index = Number(input.dataset.updateIndex);
    const field = String(input.dataset.updateField || "");
    if (!Number.isInteger(index) || !topUpdates[index]) return;
    if (!["date", "text", "url", "link_label"].includes(field)) return;
    if (field === "url") {
      topUpdates[index][field] = parseOfficialUrl(input.value);
    } else {
      topUpdates[index][field] = input.value;
    }
    renderTopUpdates();
    setUpdatesEditorMessage("更新情報を反映しました。");
  });
  updatesEditorList.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return;
    if (event.isComposing || isImeComposing(input)) return;
    const index = Number(input.dataset.updateIndex);
    const field = String(input.dataset.updateField || "");
    if (!Number.isInteger(index) || !topUpdates[index]) return;
    if (!["date", "text", "url", "link_label"].includes(field)) return;
    if (field === "url") {
      topUpdates[index][field] = parseOfficialUrl(input.value);
    } else {
      topUpdates[index][field] = input.value;
    }
    renderTopUpdates();
    setUpdatesEditorMessage("更新情報を反映しました。");
  });

  updatesEditorList.addEventListener("focusout", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return;
    if (!["date", "text", "url", "link_label"].includes(String(input.dataset.updateField || ""))) return;
    topUpdates = normalizeUpdates(topUpdates);
    renderTopUpdates();
    renderUpdatesEditorPanel();
  });

  updatesEditorList.addEventListener("click", (event) => {
    const button = event.target;
    if (!(button instanceof HTMLButtonElement)) return;
    const action = String(button.dataset.updateAction || "");
    const index = Number(button.dataset.updateIndex);
    if (!Number.isInteger(index) || !topUpdates[index]) return;
    if (action === "delete") {
      topUpdates.splice(index, 1);
    } else if (action === "move-up" && index > 0) {
      [topUpdates[index - 1], topUpdates[index]] = [topUpdates[index], topUpdates[index - 1]];
    } else if (action === "move-down" && index < topUpdates.length - 1) {
      [topUpdates[index + 1], topUpdates[index]] = [topUpdates[index], topUpdates[index + 1]];
    }
    renderTopUpdates();
    renderUpdatesEditorPanel();
    setUpdatesEditorMessage("更新情報を更新しました。");
  });
}

if (updatesEditorAddButton) {
  updatesEditorAddButton.addEventListener("click", () => {
    const today = new Date().toISOString().slice(0, 10);
    topUpdates.unshift({ date: today, text: "新しい更新情報", url: "", link_label: "" });
    renderTopUpdates();
    renderUpdatesEditorPanel();
    setUpdatesEditorMessage("更新情報を追加しました。");
  });
}

if (updatesEditorResetButton) {
  updatesEditorResetButton.addEventListener("click", () => {
    topUpdates = structuredClone(initialTopUpdates);
    renderTopUpdates();
    renderUpdatesEditorPanel();
    setUpdatesEditorMessage("読込時の更新情報に戻しました。");
  });
}

if (updatesEditorExportButton) {
  updatesEditorExportButton.addEventListener("click", () => {
    downloadUpdatesJson();
    setUpdatesEditorMessage("更新情報JSONをダウンロードしました。");
  });
}

if (adminFabToggleButton) {
  adminFabToggleButton.addEventListener("click", () => {
    toggleAdminFabPanel();
  });
}

if (adminPinUnlockButton) {
  adminPinUnlockButton.addEventListener("click", () => {
    const inputPin = String(adminPinInput?.value || "").trim();
    if (inputPin !== ADMIN_PIN) {
      setAdminFabMessage("PINが正しくありません。", true);
      return;
    }
    if (adminPinInput) adminPinInput.value = "";
    setAdminModeEnabled(true);
    setAdminFabMessage("管理モードを有効化しました。");
  });
}

if (adminOpenManageModeButton) {
  adminOpenManageModeButton.addEventListener("click", () => {
    scrollToBlock("profit");
    setAdminFabMessage("管理モードを開きました。");
  });
}

if (adminOpenUiSettingsButton) {
  adminOpenUiSettingsButton.addEventListener("click", () => {
    scrollToBlock("ui-settings");
    setAdminFabMessage("UI設定を開きました。");
  });
}

if (adminOpenContentEditorButton) {
  adminOpenContentEditorButton.addEventListener("click", () => {
    scrollToBlock("content-editor");
    setAdminFabMessage("本文編集モードを開きました。");
  });
}

if (adminToggleContentEditModeButton) {
  adminToggleContentEditModeButton.addEventListener("click", () => {
    setContentEditModeEnabled(!isContentEditModeEnabled);
    setAdminFabMessage(`本文編集モードを${isContentEditModeEnabled ? "ON" : "OFF"}にしました。`);
  });
}

if (adminOpenUpdatesEditorButton) {
  adminOpenUpdatesEditorButton.addEventListener("click", () => {
    scrollToBlock("updates-editor");
    setAdminFabMessage("更新情報編集を開きました。");
  });
}

if (adminOpenBazaarAdminButton) {
  adminOpenBazaarAdminButton.addEventListener("click", async () => {
    try {
      if (!bazaarAdminCsvModel) {
        await reloadBazaarAdminCsvModel();
      }
      renderBazaarAdminPanel();
      scrollToBlock("bazaar-admin");
      setAdminFabMessage("バザー価格更新を開きました。");
    } catch (error) {
      console.error("バザー価格更新ページの初期化に失敗しました", error);
      setAdminFabMessage("バザー価格更新の読込に失敗しました。", true);
    }
  });
}

if (adminExportUiSettingsButton) {
  adminExportUiSettingsButton.addEventListener("click", () => {
    downloadUiSettingsJson();
    setAdminFabMessage("設定JSONをダウンロードしました。");
  });
}

if (adminExportContentButton) {
  adminExportContentButton.addEventListener("click", () => {
    downloadContentJson();
    setAdminFabMessage("本文JSONをダウンロードしました。");
  });
}

if (adminExportUpdatesButton) {
  adminExportUpdatesButton.addEventListener("click", () => {
    downloadUpdatesJson();
    setAdminFabMessage("更新情報JSONをダウンロードしました。");
  });
}

if (adminLockButton) {
  adminLockButton.addEventListener("click", () => {
    setAdminModeEnabled(false);
    setContentEditModeEnabled(false);
    if (activeTabId === "ui-settings" || activeTabId === "content-editor" || activeTabId === "updates-editor" || activeTabId === "bazaar-admin") {
      scrollToBlock("profit");
    }
    setAdminFabMessage("管理モードを閉じました。");
  });
}

if (bazaarAdminRefreshButton) {
  bazaarAdminRefreshButton.addEventListener("click", async () => {
    try {
      setBazaarAdminMessage("CSV再読込中...");
      await reloadBazaarAdminCsvModel();
      renderBazaarAdminPanel();
      setBazaarAdminMessage("bazaar_prices.csv を再読込しました。");
    } catch (error) {
      console.error("管理CSVの再読込に失敗しました", error);
      setBazaarAdminMessage(`CSV再読込に失敗しました: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  });
}

if (bazaarAdminUpdateAllButton) {
  bazaarAdminUpdateAllButton.addEventListener("click", async () => {
    await runBazaarAdminBatchUpdate({ category: "" });
  });
}

if (bazaarAdminCategorySelect) {
  bazaarAdminCategorySelect.addEventListener("change", (event) => {
    selectedBazaarAdminCategory = String(event.target?.value || "").trim();
    renderBazaarAdminPanel();
  });
}

if (bazaarAdminUpdateCategoryButton) {
  bazaarAdminUpdateCategoryButton.addEventListener("click", async () => {
    const category = String(bazaarAdminCategorySelect?.value || "").trim();
    await runBazaarAdminBatchUpdate({ category });
  });
}

if (bazaarAdminDownloadButton) {
  bazaarAdminDownloadButton.addEventListener("click", () => {
    if (!bazaarAdminCsvModel) {
      setBazaarAdminMessage("ダウンロード対象CSVがありません。", true);
      return;
    }
    const csvText = serializeBazaarAdminCsvModel(bazaarAdminCsvModel);
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bazaar_prices.csv";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    setBazaarAdminMessage("更新後CSVをダウンロードしました。");
  });
}

if (bazaarAdminListWrap) {
  bazaarAdminListWrap.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    const rowId = String(target.dataset.bazaarAdminPasteInput || "");
    if (!rowId) return;
    bazaarAdminPastedTextByRowId.set(rowId, target.value || "");
    if (!bazaarAdminAutoUpdateOnPaste || isBazaarAdminUpdating) return;
    const prevTimer = bazaarAdminAutoUpdateTimerByRowId.get(rowId);
    if (prevTimer) {
      window.clearTimeout(prevTimer);
    }
    const timerId = window.setTimeout(() => {
      bazaarAdminAutoUpdateTimerByRowId.delete(rowId);
      if (isBazaarAdminUpdating) return;
      runBazaarAdminSingleRowUpdateById(rowId, {
        scrollToNext: bazaarAdminAutoScrollNextRowAfterUpdate,
        autoOpenNextUrl: bazaarAdminAutoOpenNextUrlAfterUpdate,
      });
    }, 150);
    bazaarAdminAutoUpdateTimerByRowId.set(rowId, timerId);
  });

  bazaarAdminListWrap.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const openRowId = String(target.dataset.bazaarAdminOpenUrl || "");
    const updateRowId = String(target.dataset.bazaarAdminUpdateRow || "");
    if (!bazaarAdminCsvModel) return;

    if (openRowId) {
      const row = bazaarAdminCsvModel.rows.find((entry) => entry.id === openRowId);
      if (!row?.officialUrl) return;
      openBazaarAdminUrlInSharedWindow(row.officialUrl);
      return;
    }

    if (updateRowId && !isBazaarAdminUpdating) {
      await runBazaarAdminSingleRowUpdateById(updateRowId, {
        scrollToNext: bazaarAdminAutoScrollNextRowAfterUpdate,
        autoOpenNextUrl: bazaarAdminAutoOpenNextUrlAfterUpdate,
      });
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (activeBazaarDetailModalKey) {
      closeBazaarDetailModal();
      return;
    }
    if (activeFieldFarmingMapModalRowId) {
      closeFieldFarmingMapModal();
      return;
    }
    if (activeFavoriteMaterialModalKey) {
      closeFavoriteMaterialModal();
      return;
    }
    if (adminFabPanel && !adminFabPanel.hidden) {
      toggleAdminFabPanel();
      return;
    }
    setMenuOpen(false);
  }
});

window.addEventListener("popstate", () => {
  applyAppRouteFromUrl();
  rerenderAll();
});

function renderEquipmentSelectors() {
  if (!equipmentSelect || !recipeEquipmentSelect) return;

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
    equipmentSelect.add(new Option("装備を選択してください", ""));
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
    selectedEquipmentId = "";
  }

  if (filteredEquipments.length > 0 && !state.equipments.some((e) => e.id === selectedEquipmentId)) selectedEquipmentId = "";
  equipmentSelect.value = selectedEquipmentId;
  recipeEquipmentSelect.value = selectedEquipmentId || state.equipments[0]?.id || "";
  renderSelectedEquipmentTypeMeta();
  renderRecipeFavoriteAction();
}

function renderSelectedEquipmentTypeMeta() {
  if (!selectedEquipmentTypeMeta) return;

  const equipment = getSelectedEquipment();
  const typeLabel = String(equipment?.category || "").trim();
  const typeIconPath = getEquipmentTypeIconPath(typeLabel);

  if (!equipment || !typeLabel || !typeIconPath) {
    selectedEquipmentTypeMeta.innerHTML = "";
    selectedEquipmentTypeMeta.hidden = true;
    return;
  }

  selectedEquipmentTypeMeta.innerHTML = `
    <span class="equipment-type-meta selected-equipment-type-chip">
      <img src="${resolveProjectScopedAssetUrl(typeIconPath)}" alt="" class="equipment-type-icon" loading="lazy" decoding="async">
      <span>種別: ${typeLabel}</span>
    </span>
  `;
  selectedEquipmentTypeMeta.hidden = false;
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

  categoryFilterSelect.add(new Option("お気に入り", RECIPE_FAVORITE_CATEGORY_VALUE));
  categories.forEach((category) => {
    categoryFilterSelect.add(new Option(category, category));
  });

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
  const aLevel = Number(a.equipmentLevel || 0);
  const bLevel = Number(b.equipmentLevel || 0);
  if (aLevel !== bLevel) return bLevel - aLevel;
  const costDiff = getRoundedEquipmentMaterialCost(a.id) - getRoundedEquipmentMaterialCost(b.id);
  if (costDiff !== 0) return -costDiff;
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
    .sort(compareEquipmentsByBaseSort);

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

function getCraftIdealValueForSelectedEquipment() {
  const equipment = getSelectedEquipment();
  if (!equipment?.name || !equipment?.craftsman) return null;
  return (
    (state.craftIdealValues || []).find(
      (idealValue) => idealValue.itemName === equipment.name && idealValue.jobType === equipment.craftsman
    ) || null
  );
}

function renderCraftIdealValue() {
  if (!craftIdealValueWrap) return;

  const equipment = getSelectedEquipment();
  if (
    equipment &&
    CRAFT_IDEAL_TARGET_JOBS.has(String(equipment.craftsman || "")) &&
    !hasLoadedCraftIdealValues &&
    !isCraftIdealValuesLoading
  ) {
    void ensureCraftIdealValuesLoaded().then(() => {
      if (activeTabId === "profit") renderCraftIdealValue();
    });
  }
  const idealValue = getCraftIdealValueForSelectedEquipment();
  if (!equipment || !idealValue) {
    craftIdealValueWrap.innerHTML = "";
    craftIdealValueWrap.hidden = true;
    return;
  }

  const cellsHtml = idealValue.cells
    .map((cellValue) => {
      const isUnused = cellValue === null;
      return `
        <li class="craft-ideal-grid-cell ${isUnused ? "is-unused" : ""}">
          <span>${isUnused ? "" : cellValue}</span>
        </li>
      `;
    })
    .join("");

  craftIdealValueWrap.hidden = false;
  craftIdealValueWrap.innerHTML = `
    <section class="craft-ideal-card" aria-label="基準値カード">
      <p class="craft-ideal-tolerance">★3誤差: 0〜${idealValue.star3Tolerance}</p>
      <ol class="craft-ideal-grid" aria-label="3×3基準値">${cellsHtml}</ol>
    </section>
  `;
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

  if (!getSelectedEquipment()) {
    recipeTableWrap.innerHTML = "<p>装備を選ぶと必要素材が表示されます。</p>";
    return;
  }

  const rows = getRecipeRowsForSelectedEquipment();
  if (rows.length === 0) {
    recipeTableWrap.innerHTML = "<p>この装備のレシピが未登録です。</p>";
    return;
  }

  const productionCount = getProductionCountForCalculation();
  const htmlRows = rows
    .map((row) => {
      const material = state.materials.find((m) => m.id === row.materialId);
      const marketUrl = getOfficialBazaarUrlByMaterialName(material?.name);
      const price = getEffectiveMaterialPrice(row.materialId);
      const safePrice = Number.isFinite(price) ? price : 0;
      const totalRequired = row.quantity * productionCount;
      const subtotal = safePrice * totalRequired;
      return {
        subtotalRaw: subtotal,
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
                value="${safePrice}"
                data-temp-material-price-id="${row.materialId}"
              >
            </td>
            <td>${formatGold(subtotal)}</td>
            <td class="recipe-market-link-cell">
              <a
                class="market-link-button recipe-market-link-button"
                href="${marketUrl}"
                target="_blank"
                rel="noopener noreferrer"
              >
                相場確認
              </a>
            </td>
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
                  value="${safePrice}"
                  aria-label="単価"
                  data-temp-material-price-id="${row.materialId}"
                >
              </label>
              <p class="recipe-material-subtotal">
                <span>小計</span>
                <strong>${formatGold(subtotal)}</strong>
              </p>
            </div>
            <div class="recipe-material-market-link-wrap">
              <a
                class="market-link-button recipe-market-link-button"
                href="${marketUrl}"
                target="_blank"
                rel="noopener noreferrer"
              >
                相場確認
              </a>
            </div>
          </article>
        `,
      };
    });

  const totalMaterialCost = htmlRows.reduce((sum, row) => sum + row.subtotalRaw, 0);

  recipeTableWrap.innerHTML = `
    <div class="recipe-total-cost" aria-live="polite">
      <span>材料原価合計</span>
      <strong>${formatGold(totalMaterialCost)}</strong>
    </div>
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
            <th class="recipe-market-link-header">相場</th>
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

  if (!getSelectedEquipment()) {
    selectedToolId = "";
    toolSelect.innerHTML = "";
    toolSelect.add(new Option("装備を選ぶと候補が表示されます", ""));
    toolSelect.disabled = true;
    toolPurchasePriceInput.disabled = true;
    toolPurchasePriceInput.value = "";
    toolDurabilityInput.value = "";
    return;
  }

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

function renderToolSectionVisibility() {
  if (!toolSectionDetail || !toolSectionToggleButton) return;
  toolSectionDetail.hidden = !isToolCostIncluded;
  toolSectionToggleButton.setAttribute("aria-expanded", isToolCostIncluded ? "true" : "false");
  toolSectionToggleButton.textContent = isToolCostIncluded ? "－ 職人道具を原価から外す" : "＋ 職人道具を原価に含める";
}

function renderSearchFieldVisibility() {
  if (equipmentSearchField && equipmentSearchToggleButton) {
    equipmentSearchField.hidden = !isEquipmentSearchExpanded;
    equipmentSearchToggleButton.setAttribute("aria-expanded", isEquipmentSearchExpanded ? "true" : "false");
    equipmentSearchToggleButton.textContent = isEquipmentSearchExpanded ? "－ 装備名検索を閉じる" : "＋ 装備名で検索";
  }

  if (materialSearchField && materialSearchToggleButton) {
    materialSearchField.hidden = !isMaterialSearchExpanded;
    materialSearchToggleButton.setAttribute("aria-expanded", isMaterialSearchExpanded ? "true" : "false");
    materialSearchToggleButton.textContent = isMaterialSearchExpanded ? "－ 素材検索を閉じる" : "＋ 素材で検索";
  }
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
  const toolCostIfEnabled = tool && tool.durability > 0 ? toolPurchasePrice / tool.durability : 0;
  const perCraftToolCost = isToolCostIncluded ? toolCostIfEnabled : 0;
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
  renderCraftIdealValue();
  renderToolSectionVisibility();
  renderSearchFieldVisibility();
  renderToolSection();
  renderMaterialList();
  renderRecipeAdminList();
  calcAndRenderSummary();
  if (activeTabId === "present-codes") renderPresentCodes();
  if (activeTabId === "field-farming") renderFieldFarmingRanking();
  if (activeTabId === "bazaar") renderBazaarPrices();
  if (activeTabId === "favorites") renderFavoritesPage();
  if (activeTabId === "orbs") renderOrbCards();
  if (activeTabId === "white-boxes") renderWhiteBoxCards();
  if (activeTabId === "equipment-db") renderEquipmentDbCards();
  renderSiteSearchCandidates();
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
    renderCraftIdealValue();
    renderToolSection();
    calcAndRenderSummary();
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

if (toolSectionToggleButton) {
  toolSectionToggleButton.addEventListener("click", () => {
    isToolCostIncluded = !isToolCostIncluded;
    renderToolSectionVisibility();
    calcAndRenderSummary();
  });
}

if (equipmentSearchToggleButton) {
  equipmentSearchToggleButton.addEventListener("click", () => {
    isEquipmentSearchExpanded = !isEquipmentSearchExpanded;
    if (!isEquipmentSearchExpanded) {
      equipmentSearchKeyword = "";
      if (equipmentSearchInput) equipmentSearchInput.value = "";
      rerenderAll();
    }
    renderSearchFieldVisibility();
  });
}

if (materialSearchToggleButton) {
  materialSearchToggleButton.addEventListener("click", () => {
    isMaterialSearchExpanded = !isMaterialSearchExpanded;
    if (!isMaterialSearchExpanded) {
      materialSearchKeyword = "";
      if (materialSearchInput) materialSearchInput.value = "";
      rerenderAll();
    }
    renderSearchFieldVisibility();
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

if (saveBazaarHistoryButton) {
  saveBazaarHistoryButton.addEventListener("click", () => {
    handleSaveBazaarHistoryClick();
  });
}

if (bazaarHistorySnapshotDateInput) {
  bazaarHistorySnapshotDateInput.value = formatDateAsIsoText(new Date());
}

if (fieldFarmingSortSelect) {
  fieldFarmingSortSelect.addEventListener("change", (event) => {
    const nextSort = String(event.target.value || "normal_desc");
    selectedFieldFarmingSort = nextSort === "rare_desc" ? "rare_desc" : "normal_desc";
    renderFieldFarmingRanking();
  });
}

if (orbSearchInput) {
  orbSearchInput.addEventListener("input", (event) => {
    orbSearchKeyword = String(event.target.value || "");
    renderOrbCards();
  });
}

if (whiteBoxSortSelect) {
  whiteBoxSortSelect.addEventListener("change", (event) => {
    const nextSort = String(event.target.value || "level_desc");
    selectedWhiteBoxSort = nextSort === "level_desc" ? "level_desc" : "level_asc";
    renderWhiteBoxCards();
  });
}

if (whiteBoxSlotFilterSelect) {
  whiteBoxSlotFilterSelect.addEventListener("change", (event) => {
    selectedWhiteBoxSlot = String(event.target.value || "");
    renderWhiteBoxCards();
  });
}

whiteBoxTypeTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextType = String(button.dataset.whiteboxType || "");
    selectedWhiteBoxType = nextType === "armor" ? "armor" : "weapon";
    selectedWhiteBoxSlot = "";
    expandedWhiteBoxItemId = "";
    whiteBoxTypeTabButtons.forEach((tabButton) => {
      const isActive = tabButton === button;
      tabButton.classList.toggle("is-active", isActive);
      tabButton.setAttribute("aria-selected", isActive ? "true" : "false");
      tabButton.tabIndex = isActive ? 0 : -1;
    });
    renderWhiteBoxCards();
  });
});

if (equipmentDbNameSearchToggleButton) {
  equipmentDbNameSearchToggleButton.addEventListener("click", () => {
    isEquipmentDbNameSearchOpen = !isEquipmentDbNameSearchOpen;
    renderEquipmentDbCards();
  });
}

if (equipmentDbMonsterSearchToggleButton) {
  equipmentDbMonsterSearchToggleButton.addEventListener("click", () => {
    isEquipmentDbMonsterSearchOpen = !isEquipmentDbMonsterSearchOpen;
    renderEquipmentDbCards();
  });
}

if (equipmentDbSortSelect) {
  equipmentDbSortSelect.addEventListener("change", (event) => {
    const nextSort = String(event.target.value || "level_desc");
    selectedEquipmentDbSort = ["level_desc", "level_asc"].includes(nextSort) ? nextSort : "level_desc";
    renderEquipmentDbCards();
  });
}

if (equipmentDbTypeFilterSelect) {
  equipmentDbTypeFilterSelect.addEventListener("change", (event) => {
    selectedEquipmentDbType = String(event.target.value || "");
    renderEquipmentDbCards();
  });
}

if (equipmentDbNameSearchInput) {
  equipmentDbNameSearchInput.addEventListener("input", (event) => {
    equipmentDbNameKeyword = String(event.target.value || "");
    renderEquipmentDbCards();
  });
}

if (equipmentDbMonsterSearchInput) {
  equipmentDbMonsterSearchInput.addEventListener("input", (event) => {
    equipmentDbMonsterKeyword = String(event.target.value || "").trim();
    renderEquipmentDbCards();
  });
}

if (siteSearchInput) {
  siteSearchInput.addEventListener("input", (event) => {
    siteSearchKeyword = String(event.target.value || "");
    syncSiteSearchInputValues();
    if (normalizeSearchKeyword(siteSearchKeyword) !== "" && !hasLoadedSiteSearchData) {
      void ensureSiteSearchDataLoaded().then(() => {
        renderSiteSearchCandidates();
      });
    }
    renderSiteSearchCandidates();
  });
  siteSearchInput.addEventListener("focus", () => {
    renderSiteSearchCandidates();
  });
}

if (toolSiteSearchInput) {
  toolSiteSearchInput.addEventListener("input", (event) => {
    siteSearchKeyword = String(event.target.value || "");
    syncSiteSearchInputValues();
    if (normalizeSearchKeyword(siteSearchKeyword) !== "" && !hasLoadedSiteSearchData) {
      void ensureSiteSearchDataLoaded().then(() => {
        renderSiteSearchCandidates();
      });
    }
    renderSiteSearchCandidates();
  });
  toolSiteSearchInput.addEventListener("focus", () => {
    renderSiteSearchCandidates();
  });
}

if (toolSiteSearchToggleButton) {
  toolSiteSearchToggleButton.addEventListener("click", () => {
    const nextOpen = !isToolSiteSearchOpen;
    setToolSiteSearchOpen(nextOpen);
    if (nextOpen) {
      syncSiteSearchInputValues();
      toolSiteSearchInput?.focus({ preventScroll: true });
      renderSiteSearchCandidates();
    }
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Node)) return;
  const isInsideHomeSearch = Boolean(siteSearchResultWrap?.contains(target) || siteSearchInput?.contains(target));
  const isInsideToolSearch = Boolean(
    toolSiteSearchDock?.contains(target) || toolSiteSearchResultWrap?.contains(target) || toolSiteSearchInput?.contains(target)
  );
  if (isInsideHomeSearch || isInsideToolSearch) return;
  if (siteSearchResultWrap) siteSearchResultWrap.hidden = true;
  if (toolSiteSearchResultWrap) toolSiteSearchResultWrap.hidden = true;
});

equipmentDbGroupTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextGroup = String(button.dataset.equipmentDbGroup || "weapon");
    selectedEquipmentDbGroup = nextGroup === "armor" ? "armor" : "weapon";
    selectedEquipmentDbType = "";
    expandedEquipmentDbId = "";
    navigateByAppParams({ equipmentDbGroup: selectedEquipmentDbGroup });
    renderEquipmentDbCards();
  });
});

window.buildBazaarHistorySnapshotRows = buildBazaarHistorySnapshotRows;
window.mergeBazaarHistoryLines = mergeBazaarHistoryLines;

// 初期化処理。
// 1) CSVを読み込む
// 2) ローカル保存の価格情報をマージ
// 3) 画面描画
async function initialize() {
  await loadUiSettings();
  await loadContentData();
  applyUiSettingsToRoot();
  applyContentToView();
  renderUiSettingsPanel();
  renderContentEditorPanel();
  setContentEditModeEnabled(false);
  setAdminModeEnabled(isAdminModeEnabled);

  try {
    topUpdates = await loadTopUpdates();
    initialTopUpdates = structuredClone(topUpdates);
  } catch (error) {
    topUpdates = [];
    initialTopUpdates = [];
    console.warn("updates.json の読み込みに失敗したため更新情報は非表示にします", error);
  }
  renderTopUpdates();
  renderUpdatesEditorPanel();

  const storedData = loadStoredData();
  const favoriteState = loadBazaarFavoriteState();
  const loadedRecipeFavoriteKeys = loadRecipeFavoriteState();
  const loadedHomeFeatureIds = loadHomeFeatureState();

  try {
    const csvData = await loadDataFromCsv();
    state = mergeWithStoredData(csvData, storedData);
  } catch (error) {
    console.warn("recipe.csv の読み込みに失敗したため、フォールバックデータを使用します", error);
    state = mergeWithStoredData(structuredClone(defaultData), storedData);
  }

  // CSV側が空でも初期表示で一覧が空にならないようフォールバックを維持
  if ((state.equipments || []).length === 0 || (state.recipes || []).length === 0) {
    state = mergeWithStoredData(structuredClone(defaultData), storedData);
  }

  selectedEquipmentId = "";
  selectedToolId = "";
  showBazaarFavoritesOnly = favoriteState.showFavoritesOnly;
  bazaarFavoriteMaterialKeys = favoriteState.favoriteMaterialKeys;
  recipeFavoriteKeys = loadedRecipeFavoriteKeys;
  homeFeatureIds = loadedHomeFeatureIds;
  homeFeatureIdSet = new Set(homeFeatureIds);
  decorateSideMenuWithHomeActions();
  renderHomeQuickFeatures();
  applyAppRouteFromUrl();
  navigateByAppParams(
    {
      tab: appMode === "tool" ? activeTabId : "",
      equipmentId: activeTabId === "profit" ? selectedEquipmentId : "",
      materialKey: activeTabId === "bazaar" ? pendingBazaarFocusMaterialKey : "",
      equipmentDbGroup: activeTabId === "equipment-db" ? selectedEquipmentDbGroup : "",
    },
    { replace: true }
  );
  saveData();
  rerenderAll();
  prefetchDataForTab(activeTabId);
}

initialize();
