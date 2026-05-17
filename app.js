// DQ10ツールの最小実装。
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
const ROUTINE_TASKS_CSV_PATH = "./data/routine_tasks.csv";
const BOSS_CARDS_CSV_PATH = "./data/boss_cards.csv";
const ORB_DATA_CSV_PATH = "./data/orb_data.csv";
const MONSTER_DATA_CSV_PATH = "./data/monster_data.csv";
const ORB_MONSTERS_CSV_PATH = "./data/orb_monsters.csv";
const WHITE_BOX_CSV_PATH = "./data/white_box.csv";
const EQUIPMENT_DB_CSV_PATH = "./data/equipment_data.csv";
const MONSTER_DETAIL_DATA_CSV_PATH = "./data/monster_detail_data.csv";
const MAP_MASTER_CSV_PATH = "./data/map_master.csv";
const UPDATES_JSON_PATH = "./data/updates.json";
const UI_SETTINGS_JSON_PATH = "./data/ui-settings.json";
const CONTENT_JSON_PATH = "./data/content.json";
const OFFICIAL_PRESENT_CODE_URL = "https://hiroba.dqx.jp/sc/campaignCode/itemcode/";
const BAZAAR_FAVORITES_STORAGE_KEY = "dq10_toolweb_bazaar_favorites_v1";
const RECIPE_FAVORITES_STORAGE_KEY = "dq10_toolweb_recipe_favorites_v1";
const HOME_FEATURES_STORAGE_KEY = "dq10_toolweb_home_features_v1";
const MEMO_STORAGE_KEY = "dq10_toolweb_memos_v1";
const MEMO_HINT_STORAGE_KEY = "dq10_toolweb_memo_hint_dismissed_v1";
const ADMIN_CHECKLIST_STORAGE_KEY = "dq10_toolweb_admin_checklist_v1";
const ROUTINE_TASKS_STORAGE_KEY = "dq10_toolweb_routine_tasks_v1";
const BOSS_CARD_TIMER_STORAGE_KEY = "dq10_toolweb_boss_card_timer_v1";
const BOSS_CARD_NOTICE_SEEN_STORAGE_KEY = "dq10_toolweb_boss_card_notice_seen_v1";
const RECIPE_FAVORITE_CATEGORY_VALUE = "__favorites__";
const BOSS_CARD_NAME_CANDIDATES = Object.freeze([
  "アトラス",
  "バズズ",
  "ベリアル",
  "悪霊の神々",
  "ドラゴンガイア",
  "バラモス",
  "キングヒドラ",
  "グラコス",
  "伝説の三悪魔",
  "キラーマジンガ",
  "幻界の四諸侯",
  "ドン・モグーラ",
  "暗黒の魔人",
  "Sキラーマシン",
  "スライムジェネラル",
  "死神スライダーク",
  "ギュメイ将軍",
  "ゲルニック将軍",
  "ゴレオン将軍",
  "帝国三将軍",
  "ドラゴン",
  "魔犬レオパルド",
  "ムドー",
  "真・幻界諸侯",
  "アンドレアル",
  "エビルプリースト",
  "究極邪教司祭",
  "結界の守護者たち",
  "タイムマスター",
  "人食い火竜",
]);
const HOME_FEATURE_DEFINITIONS = [
  { id: "bazaar", tabId: "bazaar", title: "バザー情報", icon: "💰" },
  { id: "profit", tabId: "profit", title: "職人アシスト", icon: "🛠️" },
  { id: "favorites", tabId: "favorites", title: "お気に入り", icon: "📌" },
  { id: "routine", tabId: "routine", title: "日課・週課", icon: "📅" },
  { id: "boss-card", tabId: "boss-card", title: "ボスカード管理", icon: "⌛" },
  { id: "present-codes", tabId: "present-codes", title: "プレゼント", icon: "🎁" },
  { id: "monster-info", tabId: "monster-info", title: "モンスター情報", icon: "👾" },
  { id: "equipment-db", tabId: "equipment-db", title: "装備データ", icon: "🛡️" },
  { id: "orbs", tabId: "orbs", title: "宝珠", icon: "💎" },
  { id: "field-farming", tabId: "field-farming", title: "フィールド狩り", icon: "⚔️" },
];
const DEFAULT_DOCUMENT_TITLE = "DQ10ツール";
const DEFAULT_DOCUMENT_DESCRIPTION = "DQ10の職人アシスト、バザー情報、モンスター情報、装備情報、宝珠情報を確認できる支援サイトです。";
const TAB_DOCUMENT_LABELS = Object.freeze({
  profit: "職人アシスト",
  bazaar: "バザー情報",
  "monster-info": "モンスター情報",
  "equipment-db": "装備情報",
  orbs: "宝珠情報",
  favorites: "お気に入り",
  routine: "日課・週課",
  "boss-card": "ボスカード管理",
  "present-codes": "プレゼントのじゅもん",
  "field-farming": "フィールド狩り",
});
const DEFAULT_HOME_FEATURE_IDS = Object.freeze(["profit", "bazaar", "favorites", "boss-card", "equipment-db"]);
const HOME_FEATURE_ID_SET = new Set(HOME_FEATURE_DEFINITIONS.map((feature) => feature.id));
const SITE_SEARCH_MAX_RESULTS = 10;
const SITE_SEARCH_MATCH_RANK = Object.freeze({
  exact: 0,
  prefix: 1,
  partial: 2,
});
const ENTRY_ROUTE_SEGMENT_TO_TAB = Object.freeze({
  bazaar: "bazaar",
  craft: "profit",
  "field-farming": "field-farming",
  routine: "routine",
  "present-codes": "present-codes",
  monster: "monster-info",
  equipment: "equipment-db",
  orb: "orbs",
  favorites: "favorites",
  whitebox: "equipment-db",
  "admin-bazaar": "bazaar-admin",
});
const LEGACY_QUERY_TAB_ALIASES = Object.freeze({
  craft: "profit",
  "field-farming": "field-farming",
  routine: "routine",
  "present-codes": "present-codes",
  monster: "monster-info",
  equipment: "equipment-db",
  orb: "orbs",
  whitebox: "equipment-db",
  "white-boxes": "equipment-db",
});
const ENTRY_ROUTE_TAB_TO_SEGMENT = new Map();
Object.entries(ENTRY_ROUTE_SEGMENT_TO_TAB).forEach(([segment, tab]) => {
  if (!ENTRY_ROUTE_TAB_TO_SEGMENT.has(tab)) {
    ENTRY_ROUTE_TAB_TO_SEGMENT.set(tab, segment);
  }
});
const TAB_IDS = new Set([
  "profit",
  "present-codes",
  "bazaar",
  "favorites",
  "routine",
  "boss-card",
  "data",
  "field-farming",
  "orbs",
  "equipment-db",
  "monster-info",
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
const ADMIN_CHECKLIST_GROUPS = Object.freeze([
  {
    id: "daily-ops",
    title: "毎日更新リスト",
    resetLabel: "今日分をリセット",
    periodType: "daily",
    items: [
      {
        id: "bazaar-update",
        label: "バザー価格更新",
        memo: "/admin-bazaar/ を開き、公式ページの価格を確認して更新する",
      },
      {
        id: "bazaar-download",
        label: "更新CSVダウンロード",
        memo: "更新後に「更新CSVをダウンロード」を押して bazaar_prices.csv を保存する",
      },
      {
        id: "bazaar-history-save",
        label: "履歴CSV保存",
        memo: "価格更新後に履歴保存を行い、bazaar_prices_history.csv を保存する",
      },
      {
        id: "bazaar-list-check",
        label: "バザー価格一覧の表示確認",
        memo: "/bazaar/ を開き、価格・前日比・更新日時が表示されるか確認する",
      },
      {
        id: "bazaar-graph-check",
        label: "バザーグラフ確認",
        memo: "素材カードのグラフをタップし、月別グラフが開くか確認する",
      },
      {
        id: "bazaar-paused-check",
        label: "価格更新停止中リスト確認",
        memo: "バザー下部の停止中リストを開き、固定価格商品が混ざっていないか確認する",
      },
      {
        id: "present-expire-check",
        label: "プレゼントのじゅもん期限確認",
        memo: "期限切れがあれば非表示・削除・期限切れ扱いにする",
      },
      {
        id: "field-farming-price-check",
        label: "フィールド狩り価格確認",
        memo: "ドロップ品価格が大きくズレていないか確認する",
      },
      {
        id: "official-news-check",
        label: "公式お知らせ確認",
        memo: "DQ10公式のお知らせ・アップデート情報を確認する",
      },
      {
        id: "bug-report-check",
        label: "不具合・要望確認",
        memo: "Xや知り合いからの報告があればメモする",
      },
    ],
  },
  {
    id: "daily-display",
    title: "毎日表示チェックリスト",
    resetLabel: "今日分をリセット",
    periodType: "daily",
    items: [
      { id: "home", label: "ホーム", memo: "トップが表示され、主要カードが押せるか確認する" },
      {
        id: "craft",
        label: "職人アシスト",
        memo: "装備を1つ選び、素材・原価・利益計算が表示されるか確認する",
      },
      {
        id: "bazaar",
        label: "バザー価格",
        memo: "素材カード、公式相場リンク、グラフが表示されるか確認する",
      },
      {
        id: "favorites",
        label: "お気に入り",
        memo: "登録済み項目が残っているか、リンクで移動できるか確認する",
      },
      {
        id: "field-farming",
        label: "フィールド狩り",
        memo: "魔因細胞向けモンスターが表示されるか確認する",
      },
      {
        id: "present-codes",
        label: "プレゼントのじゅもん",
        memo: "じゅもん一覧と公式リンクが動くか確認する",
      },
      {
        id: "monster",
        label: "モンスター情報",
        memo: "/monster/ を開き、カード・モーダル・検索が動くか確認する",
      },
      {
        id: "equipment",
        label: "装備情報",
        memo: "/equipment/ を開き、ジャンル切替・検索・カード表示を確認する",
      },
      {
        id: "orb",
        label: "宝珠",
        memo: "/orb/ を開き、カテゴリ切替・カード表示を確認する",
      },
      {
        id: "memo",
        label: "メモ",
        memo: "メモボタンを押し、保存済みメモが開けるか確認する",
      },
      {
        id: "search",
        label: "検索",
        memo: "右上検索で1件検索し、該当ページへ移動できるか確認する",
      },
      {
        id: "nav-back",
        label: "戻る/下部ナビ",
        memo: "Web表示で下部ナビが1行、PWA表示で戻るが必要時だけ出るか確認する",
      },
      {
        id: "mobile-check",
        label: "スマホ表示",
        memo: "iPhone等で主要ページを開き、崩れや重さがないか確認する",
      },
    ],
  },
  {
    id: "weekly",
    title: "週1チェックリスト",
    resetLabel: "今週分をリセット",
    periodType: "weekly",
    items: [
      { id: "csv-backup", label: "CSVバックアップ", memo: "data内のCSVをバックアップ保存する" },
      {
        id: "present-weekly-cleanup",
        label: "プレゼントのじゅもん期限切れ整理",
        memo: "期限切れ・間近のものを整理する",
      },
      {
        id: "bazaar-monitoring-review",
        label: "バザー監視対象見直し",
        memo: "更新対象に追加/除外すべき素材がないか確認する",
      },
      {
        id: "paused-review",
        label: "更新停止中リスト見直し",
        memo: "固定価格・店売り商品が正しく停止中に入っているか確認する",
      },
      {
        id: "entry-url-review",
        label: "入口URL確認",
        memo: "/bazaar/ /craft/ /monster/ /equipment/ /orb/ が開くか確認する",
      },
      {
        id: "weekly-official-review",
        label: "公式アップデート情報確認",
        memo: "新素材・新装備・新モンスター追加がないか確認する",
      },
    ],
  },
  {
    id: "monthly",
    title: "月1チェックリスト",
    resetLabel: "今月分をリセット",
    periodType: "monthly",
    items: [
      {
        id: "monthly-graph",
        label: "月別グラフ確認",
        memo: "月初に前月・今月のグラフが正しく切り替わるか確認する",
      },
      {
        id: "monthly-history",
        label: "月初履歴データ確認",
        memo: "bazaar_prices_history.csv に新しい月のデータが保存されているか確認する",
      },
      {
        id: "history-policy",
        label: "古いデータ整理方針確認",
        memo: "履歴CSVが重くなっていないか確認する",
      },
      {
        id: "seo-entry-review",
        label: "SEO入口ページ確認",
        memo: "主要入口URLとタイトル表示を確認する",
      },
      {
        id: "moneymaking-ideas",
        label: "金策項目追加候補確認",
        memo: "フィールド狩り以外に追加する金策候補をメモする",
      },
      {
        id: "request-backlog",
        label: "不具合・要望の棚卸し",
        memo: "溜まった要望を分類し、対応する/保留するを決める",
      },
    ],
  },
]);
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
  site_intro: "職人・バザー・モンスター・装備をまとめて確認できます。",
  site_summary:
    "現在、試験運用中のWEBサイトです。不具合や不備がありましたら、お問い合わせよりご連絡いただけると助かります。今後、レイアウト変更や機能追加を行う場合があります。",
  site_notice: "",
  updates_heading: "更新情報",
  tools_heading: "サイト内便利ツール",
  tools_intro: "左上メニューから各ページへ移動できます。よく使うページは「ホームに追加」すると、このエリアに表示されてすぐ開けます。",
  menu_hint: "",
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
const PROFIT_EQUIPMENT_NAVIGATION_TYPES = Object.freeze({
  weapon: "weapon",
  armorSet: "armor_set",
});
const PROFIT_ARMOR_PART_ORDER = Object.freeze(["頭", "からだ上", "からだ下", "腕", "足"]);
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
  return resolveProjectScopedResourceUrl(path);
}

function getNormalizedPathname(pathname = window.location.pathname || "/") {
  return pathname.endsWith(".html") ? pathname.replace(/[^/]*$/, "/") : pathname;
}

function getPathSegments(pathname = window.location.pathname || "/") {
  return getNormalizedPathname(pathname).split("/").filter(Boolean);
}

function getProjectBasePath(pathname = window.location.pathname || "/") {
  const segments = getPathSegments(pathname);
  if (segments.length === 0) return "";
  return Object.prototype.hasOwnProperty.call(ENTRY_ROUTE_SEGMENT_TO_TAB, segments[0]) ? "" : `/${segments[0]}`;
}

function getProjectRootPath(pathname = window.location.pathname || "/") {
  return `${getProjectBasePath(pathname)}/`;
}

function resolveProjectScopedResourceUrl(path) {
  if (!path) return "";
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  const projectBasePath = getProjectBasePath();
  if (path.startsWith("/")) {
    if (!projectBasePath || path.startsWith(`${projectBasePath}/`)) {
      return path;
    }
    return `${projectBasePath}${path}`;
  }

  const sanitizedPath = String(path).replace(/^\.\//, "");
  return `${getProjectRootPath()}${sanitizedPath}`;
}

function getEntryRouteContext(pathname = window.location.pathname || "/") {
  const segments = getPathSegments(pathname);
  if (segments.length === 0) return null;

  let routeSegment = "";
  let projectBasePath = "";
  if (Object.prototype.hasOwnProperty.call(ENTRY_ROUTE_SEGMENT_TO_TAB, segments[0])) {
    routeSegment = segments[0];
  } else if (segments.length > 1 && Object.prototype.hasOwnProperty.call(ENTRY_ROUTE_SEGMENT_TO_TAB, segments[1])) {
    projectBasePath = `/${segments[0]}`;
    routeSegment = segments[1];
  } else {
    return null;
  }

  return {
    tab: ENTRY_ROUTE_SEGMENT_TO_TAB[routeSegment],
    routeSegment,
    projectBasePath,
    pathname: `${projectBasePath}/${routeSegment}/`,
  };
}

function resolveRouteTabFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const queryTab = String(params.get("tab") || "").trim();
  if (TAB_IDS.has(queryTab)) {
    return queryTab;
  }
  if (Object.prototype.hasOwnProperty.call(LEGACY_QUERY_TAB_ALIASES, queryTab)) {
    return LEGACY_QUERY_TAB_ALIASES[queryTab];
  }
  return String(getEntryRouteContext()?.tab || "");
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
  const resolvedPath = resolveProjectScopedResourceUrl(path);
  const response = await fetch(resolvedPath);
  if (!response.ok) {
    console.error(`[CSV] fetch failed: path=${resolvedPath}, original=${path}, status=${response.status}`);
    throw new Error(`CSVの読み込みに失敗しました: ${resolvedPath} (${response.status})`);
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
  if (lines.length > 1 && lines[1].includes("\uFFFD")) return false;
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
  const resolvedPath = resolveProjectScopedResourceUrl(UPDATES_JSON_PATH);
  const response = await fetch(resolvedPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`updates.json の読み込みに失敗しました: ${resolvedPath} (${response.status})`);
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
    if (normalized.length === 0) return [...DEFAULT_HOME_FEATURE_IDS];
    const shouldMigrateBossCard = Number(parsed?.version || 1) < 2 && !normalized.includes("boss-card");
    return shouldMigrateBossCard ? [...normalized, "boss-card"] : normalized;
  } catch {
    return [...DEFAULT_HOME_FEATURE_IDS];
  }
}

function saveHomeFeatureState() {
  localStorage.setItem(
    HOME_FEATURES_STORAGE_KEY,
    JSON.stringify({
      version: 2,
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

function loadMemoEntries() {
  const raw = localStorage.getItem(MEMO_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    return items
      .map((memo) => ({
        ...memo,
        id: String(memo?.id || ""),
        type: normalizeMemoValue(memo?.type),
        name: normalizeMemoValue(memo?.name),
        lines: Array.isArray(memo?.lines) ? memo.lines.map((line) => normalizeMemoValue(line)).filter(Boolean) : [],
        userNote: normalizeMemoValue(memo?.userNote),
        createdAt: memo?.createdAt || new Date().toISOString(),
        updatedAt: memo?.updatedAt || memo?.createdAt || "",
      }))
      .filter((memo) => memo.id !== "" && memo.name !== "");
  } catch {
    return [];
  }
}

function saveMemoEntries() {
  if (!memoEntries.length) {
    localStorage.removeItem(MEMO_STORAGE_KEY);
    return;
  }
  localStorage.setItem(
    MEMO_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      items: memoEntries,
    })
  );
}

function loadMemoHintDismissedState() {
  try {
    return localStorage.getItem(MEMO_HINT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveMemoHintDismissedState() {
  try {
    if (isMemoHintDismissed) {
      localStorage.setItem(MEMO_HINT_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(MEMO_HINT_STORAGE_KEY);
    }
  } catch {
    // no-op
  }
}

function dismissMemoDockHint() {
  isMemoHintDismissed = true;
  saveMemoHintDismissedState();
  if (memoDockHint) memoDockHint.hidden = true;
}

function updateMemoDockHintVisibility() {
  if (!memoDockHint) return;
  memoDockHint.hidden = isMemoHintDismissed;
}

function decorateMemoAddButtons(root = document) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll(".memo-add-button").forEach((button) => {
    if (!(button instanceof HTMLElement)) return;
    button.setAttribute("title", "この項目をメモに追加");
    button.setAttribute("aria-label", "この項目をメモに追加");
  });
}

function loadRoutineTaskState() {
  const raw = localStorage.getItem(ROUTINE_TASKS_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.checkedTokens === "object" && parsed.checkedTokens ? parsed.checkedTokens : {};
  } catch {
    return {};
  }
}

function saveRoutineTaskState() {
  localStorage.setItem(
    ROUTINE_TASKS_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      checkedTokens: routineTaskCheckedTokens,
    })
  );
}

function makeRoutineTaskId(value, index) {
  const normalized = String(value || "").trim();
  return normalized !== "" ? `routine:${normalized}` : `routine:row:${index + 1}`;
}

function normalizeRoutineType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "weekly") return "weekly";
  if (normalized === "monthly") return "monthly";
  return "daily";
}

function normalizeRoutineResetRule(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[　\s]+/g, "")
    .replace(/：/g, ":");
}

function parseRoutineResetTime(rule) {
  const match = rule.match(/(am|pm)?(\d{1,2})(?::?(\d{2}))?$/i);
  if (!match) return { hour: 6, minute: 0, suffix: "" };
  const suffix = String(match[1] || "").toLowerCase();
  let hour = Number(match[2] || 0);
  const minute = Number(match[3] || 0);
  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;
  return { hour, minute, suffix };
}

function formatRoutineResetToken(date, hour, minute) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}@${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function buildRoutineResetDate(baseDate, hour, minute) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, minute, 0, 0);
}

function getRoutineMonthlyResetToken(now, days, hour, minute) {
  const buildCandidates = (year, monthIndex) =>
    days
      .map((day) => Number(day))
      .filter((day) => Number.isFinite(day) && day > 0)
      .map((day) => {
        const lastDay = new Date(year, monthIndex + 1, 0).getDate();
        if (day > lastDay) return null;
        return new Date(year, monthIndex, day, hour, minute, 0, 0);
      })
      .filter(Boolean);

  const currentCandidates = buildCandidates(now.getFullYear(), now.getMonth()).filter((candidate) => candidate <= now);
  if (currentCandidates.length > 0) {
    const latest = currentCandidates[currentCandidates.length - 1];
    return formatRoutineResetToken(latest, hour, minute);
  }

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousCandidates = buildCandidates(previousMonth.getFullYear(), previousMonth.getMonth());
  const latestPrevious = previousCandidates[previousCandidates.length - 1];
  return latestPrevious ? formatRoutineResetToken(latestPrevious, hour, minute) : "manual";
}

function getRoutineResetToken(task, now = new Date()) {
  const normalizedRule = normalizeRoutineResetRule(task?.resetRule);
  if (normalizedRule === "") return `manual:${task.id}`;

  const { hour, minute } = parseRoutineResetTime(normalizedRule);
  if (normalizedRule.startsWith("daily")) {
    const resetDate = buildRoutineResetDate(now, hour, minute);
    if (now < resetDate) {
      resetDate.setDate(resetDate.getDate() - 1);
    }
    return formatRoutineResetToken(resetDate, hour, minute);
  }

  if (normalizedRule.startsWith("weekly_")) {
    const weeklyBase = normalizedRule.replace(/(am|pm)?\d{1,2}(?::?\d{2})?$/i, "").replace(/_+$/, "");
    const dayToken = weeklyBase.split("_")[1] || "sun";
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const targetDay = Object.prototype.hasOwnProperty.call(dayMap, dayToken) ? dayMap[dayToken] : 0;
    const candidate = buildRoutineResetDate(now, hour, minute);
    const diff = (candidate.getDay() - targetDay + 7) % 7;
    candidate.setDate(candidate.getDate() - diff);
    if (now < candidate) {
      candidate.setDate(candidate.getDate() - 7);
    }
    return formatRoutineResetToken(candidate, hour, minute);
  }

  if (normalizedRule.startsWith("monthly_")) {
    const monthlyBase = normalizedRule.replace(/(am|pm)?\d{1,2}(?::?\d{2})?$/i, "").replace(/_+$/, "");
    const dayNumbers = monthlyBase
      .split("_")
      .slice(1)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b);
    if (dayNumbers.length > 0) {
      return getRoutineMonthlyResetToken(now, dayNumbers, hour, minute);
    }
  }

  return `manual:${task.id}`;
}

function getDailyInfoResetDate(now = new Date()) {
  const resetDate = buildRoutineResetDate(now, 6, 0);
  if (now < resetDate) {
    resetDate.setDate(resetDate.getDate() - 1);
  }
  return resetDate;
}

function getPositiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function formatShortMonthDay(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getDaysBetweenResetDates(fromDate, toDate) {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((toDate.getTime() - fromDate.getTime()) / dayMs));
}

function getDailyInfoTogabitoBosses(now = new Date()) {
  const resetDate = getDailyInfoResetDate(now);
  const baseDate = new Date(2026, 4, 10, 6, 0, 0, 0);
  const daysFromBase = Math.floor((resetDate.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
  const shouldFlip = getPositiveModulo(daysFromBase, 2) === 1;
  const bosses = [
    { shortName: "ノクゼリア", baseLevel: 1 },
    { shortName: "ウィリーデ", baseLevel: 2 },
    { shortName: "フラウソン", baseLevel: 1 },
    { shortName: "アウルモッド", baseLevel: 2 },
  ];
  return bosses.map((boss) => ({
    ...boss,
    level: shouldFlip ? (boss.baseLevel === 1 ? 2 : 1) : boss.baseLevel,
  }));
}

function getWeeklyReminderText(now = new Date()) {
  const resetDate = getDailyInfoResetDate(now);
  if (resetDate.getDay() === 0) return { text: "週課が更新されました", isToday: true, daysUntil: 0 };
  const nextSunday = buildRoutineResetDate(resetDate, 6, 0);
  nextSunday.setDate(resetDate.getDate() + ((7 - resetDate.getDay()) % 7));
  if (nextSunday <= resetDate) nextSunday.setDate(nextSunday.getDate() + 7);
  const daysUntil = getDaysBetweenResetDates(resetDate, nextSunday);
  return { text: `週課更新まであと${daysUntil}日`, isToday: false, daysUntil };
}

function getPanigalmReminderText(now = new Date()) {
  const resetDate = getDailyInfoResetDate(now);
  const baseDate = new Date(2026, 4, 12, 6, 0, 0, 0);
  const nextDate = new Date(baseDate);
  while (nextDate < resetDate) {
    nextDate.setDate(nextDate.getDate() + 3);
  }
  if (nextDate.getTime() === resetDate.getTime()) {
    return { text: "パニガルムが更新されました", isToday: true, daysUntil: 0 };
  }
  const daysUntil = getDaysBetweenResetDates(resetDate, nextDate);
  return { text: `パニガルム更新まであと${daysUntil}日`, isToday: false, daysUntil };
}

function parseMonthlyResetDaysFromRule(resetRule) {
  const normalizedRule = normalizeRoutineResetRule(resetRule);
  if (!normalizedRule.startsWith("monthly_")) return [];
  const monthlyBase = normalizedRule.replace(/(am|pm)?\d{1,2}(?::?\d{2})?$/i, "").replace(/_+$/, "");
  return monthlyBase
    .split("_")
    .slice(1)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
}

function buildMonthlyDailyInfoCandidates(task, resetDate) {
  const days = parseMonthlyResetDaysFromRule(task.resetRule);
  if (days.length === 0) return [];
  const candidates = [];
  for (let monthOffset = 0; monthOffset <= 2; monthOffset += 1) {
    const monthDate = new Date(resetDate.getFullYear(), resetDate.getMonth() + monthOffset, 1, 6, 0, 0, 0);
    days.forEach((day) => {
      const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      if (day > lastDay) return;
      const candidateDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day, 6, 0, 0, 0);
      if (candidateDate >= resetDate) {
        candidates.push(candidateDate);
      }
    });
  }
  return candidates;
}

function getMonthlyDailyInfoGroups(now = new Date()) {
  const resetDate = getDailyInfoResetDate(now);
  const groupMap = new Map();
  getRoutineTasksByType("monthly").forEach((task) => {
    buildMonthlyDailyInfoCandidates(task, resetDate).forEach((candidateDate) => {
      const key = candidateDate.getTime();
      if (!groupMap.has(key)) {
        groupMap.set(key, { date: candidateDate, titles: [] });
      }
      const isToday = candidateDate.getTime() === resetDate.getTime();
      const title =
        String(task.title || "").includes("ドラクエ10の日") && isToday
          ? "ドラクエ10の日　本日23:59まで"
          : task.title;
      groupMap.get(key).titles.push(title);
    });
  });

  return [...groupMap.values()]
    .sort((a, b) => a.date - b.date)
    .slice(0, 3)
    .map((group) => {
      const daysUntil = getDaysBetweenResetDates(resetDate, group.date);
      const uniqueTitles = [...new Set(group.titles)];
      return {
        ...group,
        daysUntil,
        titles: uniqueTitles,
        isToday: daysUntil === 0,
      };
    });
}

function renderHomeDailyInfo() {
  if (!homeDailyInfoSection || !homeDailyInfoWrap) return;
  if (appMode !== "home") return;

  homeDailyInfoSection.hidden = false;
  if (routineTasksLoadError && routineTasks.length === 0) {
    homeDailyInfoWrap.innerHTML = `<p class="home-daily-info-status">月課データを読み込めませんでした。</p>`;
    return;
  }

  if (!hasLoadedRoutineTasks) {
    homeDailyInfoWrap.innerHTML = `<p class="home-daily-info-status">読み込み中です。</p>`;
    if (!isRoutineTasksLoading) void ensureRoutineTasksLoaded();
    return;
  }

  const bosses = getDailyInfoTogabitoBosses();
  const weeklyReminder = getWeeklyReminderText();
  const panigalmReminder = getPanigalmReminderText();
  const monthlyGroups = getMonthlyDailyInfoGroups();
  const monthlyHtml =
    monthlyGroups.length > 0
      ? monthlyGroups
          .map((group) => {
            const heading = group.isToday
              ? "本日更新"
              : `${formatShortMonthDay(group.date)}更新まであと${group.daysUntil}日`;
            const className = group.isToday ? "is-today" : group.daysUntil === 1 ? "is-soon" : "";
            return `<li class="${className}"><strong>${escapeHtml(heading)}</strong><span>${escapeHtml(group.titles.join(" / "))}</span></li>`;
          })
          .join("")
      : `<li><span>表示できる月課予定がありません。</span></li>`;

  homeDailyInfoWrap.innerHTML = `
    <div class="home-daily-info-block">
      <h3>咎人</h3>
      <p class="home-daily-info-bosses">
        ${bosses
          .map((boss) => `<span>${escapeHtml(boss.shortName)} Lv${boss.level}</span>`)
          .join("")}
      </p>
    </div>
    <div class="home-daily-info-block">
      <h3>更新リマインド</h3>
      <ul class="home-daily-info-reminders">
        <li class="${weeklyReminder.isToday ? "is-today" : weeklyReminder.daysUntil === 1 ? "is-soon" : ""}">${escapeHtml(weeklyReminder.text)}</li>
        <li class="${panigalmReminder.isToday ? "is-today" : panigalmReminder.daysUntil === 1 ? "is-soon" : ""}">${escapeHtml(panigalmReminder.text)}</li>
      </ul>
    </div>
    <div class="home-daily-info-block home-daily-info-monthly">
      <h3>月課予定</h3>
      <ul>${monthlyHtml}</ul>
    </div>
  `;
}

function isRoutineTaskChecked(task) {
  const currentToken = getRoutineResetToken(task);
  return routineTaskCheckedTokens[task.id] === currentToken;
}

function setRoutineTaskChecked(task, checked) {
  if (!task?.id) return;
  if (checked) {
    routineTaskCheckedTokens[task.id] = getRoutineResetToken(task);
  } else {
    delete routineTaskCheckedTokens[task.id];
  }
}

function pruneRoutineTaskCheckedState() {
  const validIds = new Set((routineTasks || []).map((task) => task.id));
  Object.keys(routineTaskCheckedTokens).forEach((taskId) => {
    if (!validIds.has(taskId)) {
      delete routineTaskCheckedTokens[taskId];
    }
  });
}

function expireRoutineTaskCheckedState() {
  let changed = false;
  (routineTasks || []).forEach((task) => {
    const savedToken = routineTaskCheckedTokens[task.id];
    if (!savedToken) return;
    const currentToken = getRoutineResetToken(task);
    if (savedToken !== currentToken) {
      delete routineTaskCheckedTokens[task.id];
      changed = true;
    }
  });
  if (changed) {
    saveRoutineTaskState();
  }
}

function getChecklistPeriodToken(periodType, date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  if (periodType === "daily") {
    return `${year}-${month}-${day}`;
  }
  if (periodType === "monthly") {
    return `${year}-${month}`;
  }
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const weekday = normalizedDate.getDay() || 7;
  normalizedDate.setDate(normalizedDate.getDate() + 4 - weekday);
  const weekYear = normalizedDate.getFullYear();
  const yearStart = new Date(weekYear, 0, 1);
  const weekNumber = Math.ceil((((normalizedDate - yearStart) / 86400000) + 1) / 7);
  return `${weekYear}-W${String(weekNumber).padStart(2, "0")}`;
}

function getChecklistPeriodLabel(group, token) {
  if (!token) return "";
  if (group.periodType === "daily") return `対象日: ${token}`;
  if (group.periodType === "monthly") return `対象月: ${token}`;
  return `対象週: ${token}`;
}

function formatChecklistDateLabel(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}/${month}/${day}`;
}

function getChecklistDeadlineLabel(group, date = new Date()) {
  if (group.periodType === "daily") {
    return `※${formatChecklistDateLabel(date)}中チェック`;
  }
  if (group.periodType === "monthly") {
    return `※${date.getFullYear()}/${date.getMonth() + 1}月中チェック`;
  }
  const deadline = new Date(date);
  const daysUntilSunday = (7 - deadline.getDay()) % 7 || 7;
  deadline.setDate(deadline.getDate() + daysUntilSunday);
  return `※${formatChecklistDateLabel(deadline)}中チェック`;
}

function saveAdminChecklistState() {
  try {
    localStorage.setItem(ADMIN_CHECKLIST_STORAGE_KEY, JSON.stringify(adminChecklistState));
  } catch (error) {
    console.warn("運用チェックリストの保存に失敗しました", error);
  }
}

function setAdminChecklistStatus(message) {
  if (!adminChecklistStatus) return;
  adminChecklistStatus.textContent = message || "";
}

function loadAdminChecklistState() {
  try {
    const raw = localStorage.getItem(ADMIN_CHECKLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    adminChecklistState = parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn("運用チェックリストの読込に失敗しました", error);
    adminChecklistState = {};
  }
}

function ensureAdminChecklistGroupState(groupId) {
  const group = ADMIN_CHECKLIST_GROUPS.find((entry) => entry.id === groupId);
  if (!group) return null;
  const token = getChecklistPeriodToken(group.periodType);
  const current = adminChecklistState[groupId];
  if (!current || typeof current !== "object") {
    adminChecklistState[groupId] = { token, checked: {}, isOpen: false };
    return adminChecklistState[groupId];
  }
  if (!current.checked || typeof current.checked !== "object") {
    current.checked = {};
  }
  if (typeof current.isOpen !== "boolean") {
    current.isOpen = false;
  }
  if (typeof current.token !== "string" || current.token === "") {
    current.token = token;
  } else if (current.token !== token) {
    current.token = token;
    current.checked = {};
    current.isOpen = false;
  }
  return current;
}

function resetAdminChecklistGroup(groupId) {
  const group = ADMIN_CHECKLIST_GROUPS.find((entry) => entry.id === groupId);
  if (!group) return;
  adminChecklistState[groupId] = {
    token: getChecklistPeriodToken(group.periodType),
    checked: {},
    isOpen: false,
  };
  saveAdminChecklistState();
  renderAdminChecklist();
  setAdminChecklistStatus(`${group.title} をリセットしました。`);
}

function toggleAdminChecklistItem(groupId, itemId, checked) {
  const groupState = ensureAdminChecklistGroupState(groupId);
  if (!groupState) return;
  groupState.checked[itemId] = Boolean(checked);
  saveAdminChecklistState();
}

function toggleAdminChecklistGroup(groupId) {
  const groupState = ensureAdminChecklistGroupState(groupId);
  if (!groupState) return;
  groupState.isOpen = !groupState.isOpen;
  saveAdminChecklistState();
}

function renderAdminChecklist() {
  if (!adminChecklistWrap) return;
  const html = ADMIN_CHECKLIST_GROUPS.map((group) => {
    const groupState = ensureAdminChecklistGroupState(group.id);
    const isOpen = Boolean(groupState?.isOpen);
    const token = groupState?.token || getChecklistPeriodToken(group.periodType);
    const checkedCount = group.items.filter((item) => Boolean(groupState?.checked?.[item.id])).length;
    const isComplete = checkedCount === group.items.length;
    const statusLabel = isComplete ? "チェック済み" : getChecklistDeadlineLabel(group);
    return `<section class="admin-checklist-group">
      <div class="admin-checklist-group-header">
        <button
          type="button"
          class="admin-checklist-toggle-button"
          data-admin-checklist-toggle="${escapeHtml(group.id)}"
          aria-expanded="${isOpen ? "true" : "false"}"
        >
          <div class="admin-checklist-toggle-copy">
          <h4>${escapeHtml(group.title)}</h4>
          <p class="admin-checklist-period">${escapeHtml(getChecklistPeriodLabel(group, token))}</p>
          </div>
          <div class="admin-checklist-toggle-summary">
            <span class="admin-checklist-deadline ${isComplete ? "is-complete" : ""}">${escapeHtml(statusLabel)}</span>
            <span class="admin-checklist-progress">${checkedCount}/${group.items.length}</span>
          </div>
        </button>
        <div class="admin-checklist-group-actions">
          <button type="button" class="admin-checklist-reset-button" data-admin-checklist-reset="${escapeHtml(group.id)}">${escapeHtml(
            group.resetLabel
          )}</button>
        </div>
      </div>
      <div class="admin-checklist-items" ${isOpen ? "" : "hidden"}>
        ${group.items
          .map((item) => {
            const inputId = `admin-checklist-${group.id}-${item.id}`;
            return `<label class="admin-checklist-item" for="${escapeHtml(inputId)}">
              <input
                id="${escapeHtml(inputId)}"
                type="checkbox"
                data-admin-checklist-group="${escapeHtml(group.id)}"
                data-admin-checklist-item="${escapeHtml(item.id)}"
                ${groupState?.checked?.[item.id] ? "checked" : ""}
              />
              <span class="admin-checklist-item-body">
                <span class="admin-checklist-item-label">${escapeHtml(item.label)}</span>
                <span class="admin-checklist-item-memo">※ やり方: ${escapeHtml(item.memo)}</span>
              </span>
            </label>`;
          })
          .join("")}
      </div>
    </section>`;
  }).join("");
  adminChecklistWrap.innerHTML = html;
}

function rebuildMemoEntryIdSet() {
  memoEntryIdSet = new Set((memoEntries || []).map((memo) => String(memo?.id || "")).filter((id) => id !== ""));
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
let isEquipmentSearchCandidateListOpen = false;
let materialSearchKeyword = "";
let isMaterialSearchCandidateListOpen = false;
// 利益計算画面の絞り込み条件（未選択なら全件）
let selectedCraftsman = "";
let selectedCategory = "";
let selectedToolId = "";
let pendingProfitArmorSetContext = null;
let isToolCostIncluded = false;
let isEquipmentSearchExpanded = false;
let isMaterialSearchExpanded = false;
let bazaarPrices = [];
let selectedBazaarCategory = "";
let selectedBazaarSort = "standard";
let bazaarSearchText = "";
let selectedBazaarMaterialName = "";
let selectedBazaarPausedCategory = "";
let isBazaarSearchComposing = false;
let shouldRefocusBazaarSearchInput = false;
let showBazaarFavoritesOnly = false;
let showBazaarMonitoringOnly = false;
let activeFavoritesTabId = "recipes";
let bazaarFavoriteMaterialKeys = new Set();
let recipeFavoriteKeys = new Set();
let pendingRemovedMaterialFavoriteKeys = new Set();
let pendingRemovedRecipeFavoriteKeys = new Set();
let homeFeatureIds = [...DEFAULT_HOME_FEATURE_IDS];
let homeFeatureIdSet = new Set(homeFeatureIds);
let activeTabId = "profit";
let appMode = "home";
let pendingBazaarFocusMaterialKey = "";
let pendingBazaarFocusMaterialName = "";
let pendingBazaarAutoOpenMaterialKey = "";
let pendingBazaarUrlItemName = "";
let bazaarRowById = new Map();
let bazaarRowByMaterialKey = new Map();
let bazaarRowByMaterialName = new Map();
let bazaarPriceHistoryByMaterialKey = new Map();
let selectedBazaarChartRangeDays = DEFAULT_BAZAAR_CHART_RANGE_DAYS;
let activeBazaarDetailModalKey = "";
let bazaarDetailModalSwipeState = null;
let bazaarDetailMonthByMaterialKey = new Map();
let bazaarRelatedRecipeExpandStateByMaterialKey = new Map();
let bazaarRelatedMonsterExpandStateByKey = new Map();
let isBazaarPausedSectionExpanded = false;
let memoEntries = [];
let memoEntryIdSet = new Set();
let memoPanelSwipeState = null;
const expandedMemoIds = new Set();
const editingMemoNoteIds = new Set();
let memoToastTimer = null;
let isMemoHintDismissed = false;
let activeFavoriteMaterialModalKey = "";
let presentCodes = [];
let fieldFarmingMonsters = [];
let routineTasks = [];
let orbEntries = [];
let orbEntryById = new Map();
let orbEntryByName = new Map();
let selectedOrbCategory = "";
let orbSearchKeyword = "";
let expandedOrbId = "";
let keepOrbCategoryCleared = false;
let whiteBoxEntries = [];
let whiteBoxEntryByItemName = new Map();
let selectedWhiteBoxType = "weapon";
let selectedWhiteBoxSlot = "";
let selectedWhiteBoxSort = "level_desc";
let whiteBoxKeyword = "";
let expandedWhiteBoxItemId = "";
let equipmentDbEntries = [];
let equipmentDbEntryById = new Map();
let equipmentDbEntryByName = new Map();
let equipmentDbWeaponEntryByName = new Map();
let selectedEquipmentDbGroup = "weapon";
let selectedEquipmentDbSort = "level_desc";
let selectedEquipmentDbType = "";
let isEquipmentDbTypeExplicitAll = false;
let equipmentDbNameKeyword = "";
let equipmentDbMonsterKeyword = "";
let pendingEquipmentDbFocusName = "";
let pendingEquipmentDbAutoOpenName = "";
let expandedEquipmentDbId = "";
let presentCodesKeyword = "";
let fieldFarmingKeyword = "";
let selectedRoutineType = "daily";
let routineTaskCheckedTokens = {};
let bossCardTimers = [];
let bossCardNameCandidateRecords = [];
let siteSearchKeyword = "";
let homeBazaarChangeRankingSort = "up";
let isSiteSearchDataLoading = false;
let hasLoadedSiteSearchData = false;
let topUpdates = [];
let initialTopUpdates = [];
let isContentEditModeEnabled = false;
let isEquipmentDbNameSearchOpen = false;
let isEquipmentDbMonsterSearchOpen = false;
let hasLoadedPresentCodes = false;
let hasLoadedFieldFarmingMonsters = false;
let hasLoadedRoutineTasks = false;
let hasLoadedOrbData = false;
let hasLoadedWhiteBoxData = false;
let hasLoadedEquipmentDbData = false;
let hasLoadedMonsterInfoData = false;
let hasLoadedBazaarPrices = false;
let hasLoadedBazaarPriceHistory = false;
let hasLoadedCraftIdealValues = false;
let bazaarLoadError = false;
let presentCodesLoadError = false;
let fieldFarmingLoadError = false;
let routineTasksLoadError = false;
let orbLoadError = false;
let whiteBoxLoadError = false;
let equipmentDbLoadError = false;
let monsterInfoLoadError = false;
let hasSyncedMaterialPricesWithBazaar = false;
let isPresentCodesLoading = false;
let isFieldFarmingLoading = false;
let isRoutineTasksLoading = false;
let isOrbDataLoading = false;
let isWhiteBoxDataLoading = false;
let isEquipmentDbDataLoading = false;
let isMonsterInfoDataLoading = false;
let isBazaarLoading = false;
let isBazaarHistoryLoading = false;
let isCraftIdealValuesLoading = false;
let isToolSiteSearchOpen = false;
let presentCodesLoadingPromise = null;
let fieldFarmingLoadingPromise = null;
let routineTasksLoadingPromise = null;
let orbDataLoadingPromise = null;
let whiteBoxDataLoadingPromise = null;
let equipmentDbDataLoadingPromise = null;
let monsterInfoDataLoadingPromise = null;
let monsterDetailEntries = [];
let monsterDetailEntryById = new Map();
let monsterDetailEntryByName = new Map();
let mapMasterByName = new Map();
let selectedMonsterInfoType = "";
let monsterInfoSearchKeyword = "";
let selectedMonsterInfoSort = "exp_asc";
let activeMonsterInfoId = "";
let pendingMonsterInfoFocusName = "";
let pendingMonsterInfoAutoOpenName = "";
let keepMonsterInfoTypeCleared = false;
let activeArmorSetDetailId = "";
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
let bazaarAdminClipboardReadStateByRowId = new Map();
let adminChecklistState = {};
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
const toolSiteSearchDock = document.getElementById("toolSiteSearchDock");
const toolSiteSearchToggleButton = document.getElementById("toolSiteSearchToggleButton");
const toolSiteSearchPanel = document.getElementById("toolSiteSearchPanel");
const toolSiteSearchInput = document.getElementById("toolSiteSearchInput");
const toolSiteSearchResultWrap = document.getElementById("toolSiteSearchResultWrap");
const topUpdateSection = document.getElementById("topUpdateSection");
const topUpdateList = document.getElementById("topUpdateList");
const topUpdateViewAllLink = document.getElementById("topUpdateViewAllLink");
const topQuickAccessSection = document.querySelector(".top-quick-access");
const homeDailyInfoSection = document.getElementById("homeDailyInfoSection");
const homeDailyInfoWrap = document.getElementById("homeDailyInfoWrap");
const homeBossCardNotice = document.getElementById("homeBossCardNotice");
const homeBossCardNoticeTitle = document.getElementById("homeBossCardNoticeTitle");
const homeBossCardNoticeBody = document.getElementById("homeBossCardNoticeBody");
const homeBossCardNoticeCloseButton = document.getElementById("homeBossCardNoticeCloseButton");
const homeBossCardNoticeOpenButton = document.getElementById("homeBossCardNoticeOpenButton");
const homeBazaarChangeRankingSection = document.getElementById("homeBazaarChangeRankingSection");
const homeBazaarChangeRankingSortSelect = document.getElementById("homeBazaarChangeRankingSortSelect");
const homeBazaarChangeRankingNote = document.getElementById("homeBazaarChangeRankingNote");
const homeBazaarChangeRankingUpdatedAt = document.getElementById("homeBazaarChangeRankingUpdatedAt");
const homeBazaarChangeRankingWrap = document.getElementById("homeBazaarChangeRankingWrap");
const homeShortcutNoteBottom = document.getElementById("homeShortcutNoteBottom");
const homeQuickFeatureGrid = getRequiredElementById("homeQuickFeatureGrid");
const homeModeButton = document.getElementById("homeModeButton");
const PAGE_AD_SECTION_IDS = [
  "bazaar",
  "profit",
  "favorites",
  "routine",
  "equipment-db",
  "monster-info",
  "orbs",
  "present-codes",
  "field-farming",
];

const equipmentSelect = getRequiredElementById("equipmentSelect");
const selectedEquipmentTypeMeta = getRequiredElementById("selectedEquipmentTypeMeta");
const recipeFavoriteActionWrap = getRequiredElementById("recipeFavoriteActionWrap");
const profitArmorSetAssistWrap = getRequiredElementById("profitArmorSetAssistWrap");
const craftIdealValueWrap = getRequiredElementById("craftIdealValueWrap");
const profitMemoAddButton = getRequiredElementById("profitMemoAddButton");
const equipmentSearchToggleButton = getRequiredElementById("equipmentSearchToggleButton");
const equipmentSearchField = getRequiredElementById("equipmentSearchField");
const equipmentSearchInput = getRequiredElementById("equipmentSearchInput");
const equipmentSearchCandidateWrap = getRequiredElementById("equipmentSearchCandidateWrap");
const materialSearchToggleButton = getRequiredElementById("materialSearchToggleButton");
const materialSearchField = getRequiredElementById("materialSearchField");
const materialSearchInput = getRequiredElementById("materialSearchInput");
const materialSearchCandidateWrap = getRequiredElementById("materialSearchCandidateWrap");
const craftsmanFilterSelect = getRequiredElementById("craftsmanFilterSelect");
const categoryFilterSelect = getRequiredElementById("categoryFilterSelect");
const productionCountInput = getRequiredElementById("productionCountInput");
const salePriceStar0Input = getRequiredElementById("salePriceStar0Input");
const salePriceStar1Input = getRequiredElementById("salePriceStar1Input");
const salePriceStar2Input = getRequiredElementById("salePriceStar2Input");
const salePriceStar3Input = getRequiredElementById("salePriceStar3Input");
const salePriceStar0ResetButton = getRequiredElementById("salePriceStar0ResetButton");
const salePriceStar1ResetButton = getRequiredElementById("salePriceStar1ResetButton");
const salePriceStar2ResetButton = getRequiredElementById("salePriceStar2ResetButton");
const salePriceStar3ResetButton = getRequiredElementById("salePriceStar3ResetButton");
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
const bazaarPageUpdatedAt = document.getElementById("bazaarPageUpdatedAt");
const bazaarDetailModalOverlay = getRequiredElementById("bazaarDetailModalOverlay");
const bazaarDetailModalDialog = getRequiredElementById("bazaarDetailModalDialog");
const bazaarDetailModalCloseButton = getRequiredElementById("bazaarDetailModalCloseButton");
const bazaarDetailModalHandle = getRequiredElementById("bazaarDetailModalHandle");
const bazaarDetailModalBody = getRequiredElementById("bazaarDetailModalBody");
const presentCodeListWrap = getRequiredElementById("presentCodeListWrap");
const fieldFarmingListWrap = getRequiredElementById("fieldFarmingListWrap");
const routineTypeTabButtons = Array.from(document.querySelectorAll("[data-routine-type]"));
const routineProgressText = getRequiredElementById("routineProgressText");
const routineCheckAllButton = getRequiredElementById("routineCheckAllButton");
const routineClearAllButton = getRequiredElementById("routineClearAllButton");
const routineResetDescription = getRequiredElementById("routineResetDescription");
const routineListWrap = getRequiredElementById("routineListWrap");
const bossCardForm = getRequiredElementById("bossCardForm");
const bossCardNameInput = getRequiredElementById("bossCardNameInput");
const bossCardNameCandidateWrap = getRequiredElementById("bossCardNameCandidateWrap");
const bossCardRemainingHoursInput = getRequiredElementById("bossCardRemainingHoursInput");
const bossCardCountInput = getRequiredElementById("bossCardCountInput");
const bossCardMemoInput = getRequiredElementById("bossCardMemoInput");
const bossCardListWrap = getRequiredElementById("bossCardListWrap");
const orbListWrap = getRequiredElementById("orbListWrap");
const orbSearchInput = getRequiredElementById("orbSearchInput");
const orbCategoryFilterWrap = getRequiredElementById("orbCategoryFilterWrap");
const orbClearFiltersButton = getRequiredElementById("orbClearFiltersButton");
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
const equipmentDbClearFiltersButton = getRequiredElementById("equipmentDbClearFiltersButton");
const monsterInfoSearchInput = getRequiredElementById("monsterInfoSearchInput");
const monsterInfoTypeFilterSelect = getRequiredElementById("monsterInfoTypeFilterSelect");
const monsterInfoSortSelect = getRequiredElementById("monsterInfoSortSelect");
const monsterInfoClearFiltersButton = getRequiredElementById("monsterInfoClearFiltersButton");
const monsterInfoLinkDirectory = document.getElementById("monsterInfoLinkDirectory");
const monsterInfoLinkDirectorySummary = document.getElementById("monsterInfoLinkDirectorySummary");
const monsterInfoLinkDirectoryList = document.getElementById("monsterInfoLinkDirectoryList");
const monsterInfoListWrap = getRequiredElementById("monsterInfoListWrap");
const monsterInfoModalOverlay = getRequiredElementById("monsterInfoModalOverlay");
const monsterInfoModalDialog = getRequiredElementById("monsterInfoModalDialog");
const monsterInfoModalCloseButton = getRequiredElementById("monsterInfoModalCloseButton");
const monsterInfoModalBody = getRequiredElementById("monsterInfoModalBody");
const armorSetDetailModalOverlay = getRequiredElementById("armorSetDetailModalOverlay");
const armorSetDetailModalDialog = getRequiredElementById("armorSetDetailModalDialog");
const armorSetDetailModalCloseButton = getRequiredElementById("armorSetDetailModalCloseButton");
const armorSetDetailModalBody = getRequiredElementById("armorSetDetailModalBody");
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
const historyBackButton = getRequiredElementById("historyBackButton");
const memoDockButton = getRequiredElementById("memoDockButton");
const memoDockHint = getRequiredElementById("memoDockHint");
const memoDockHintCloseButton = getRequiredElementById("memoDockHintCloseButton");
const memoToast = getRequiredElementById("memoToast");
const memoPanelBackdrop = getRequiredElementById("memoPanelBackdrop");
const memoPanel = getRequiredElementById("memoPanel");
const memoPanelHandle = getRequiredElementById("memoPanelHandle");
const memoPanelHeader = memoPanel?.querySelector(".memo-panel-header");
const memoPanelCloseButton = getRequiredElementById("memoPanelCloseButton");
const memoClearAllButton = getRequiredElementById("memoClearAllButton");
const memoPanelStatus = getRequiredElementById("memoPanelStatus");
const memoListWrap = getRequiredElementById("memoListWrap");
const bazaarAdminCategorySelect = getRequiredElementById("bazaarAdminCategorySelect");
const bazaarAdminRefreshButton = getRequiredElementById("bazaarAdminRefreshButton");
const bazaarAdminUpdateCategoryButton = getRequiredElementById("bazaarAdminUpdateCategoryButton");
const bazaarAdminUpdateAllButton = getRequiredElementById("bazaarAdminUpdateAllButton");
const bazaarAdminDownloadButton = getRequiredElementById("bazaarAdminDownloadButton");
const bazaarAdminMessage = getRequiredElementById("bazaarAdminMessage");
const bazaarAdminListWrap = getRequiredElementById("bazaarAdminListWrap");
const adminChecklistWrap = getRequiredElementById("adminChecklistWrap");
const adminChecklistStatus = getRequiredElementById("adminChecklistStatus");

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
const profitResetButton = getRequiredElementById("profitResetButton");

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

function normalizeMemoValue(value) {
  return String(value || "").trim();
}

function formatMemoList(values) {
  const items = Array.isArray(values) ? values.map(normalizeMemoValue).filter((value) => value !== "" && value !== "-") : [];
  return items.length ? items.join(" / ") : "なし";
}

function formatMemoLines(lines) {
  return lines
    .map((line) => ({
      label: normalizeMemoValue(line.label),
      value: Array.isArray(line.value) ? formatMemoList(line.value) : normalizeMemoValue(line.value),
    }))
    .filter((line) => line.label !== "" && line.value !== "" && line.value !== "-")
    .map((line) => `${line.label}: ${line.value}`);
}

function createMemoEntry(type, name, lines) {
  const normalizedType = normalizeMemoValue(type);
  const normalizedName = normalizeMemoValue(name);
  if (normalizedType === "" || normalizedName === "" || normalizedName === "-") return null;
  return {
    id: `${normalizedType}:${normalizedName}`,
    type: normalizedType,
    name: normalizedName,
    lines: formatMemoLines(lines),
    userNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: "",
  };
}

function setMemoStatus(message) {
  if (!memoPanelStatus) return;
  memoPanelStatus.textContent = message || "";
}

function showMemoToast(message) {
  if (!memoToast) return;
  memoToast.textContent = message || "";
  memoToast.hidden = !message;
  memoToast.classList.toggle("is-visible", Boolean(message));
  if (memoToastTimer) window.clearTimeout(memoToastTimer);
  if (!message) return;
  memoToastTimer = window.setTimeout(() => {
    memoToast.classList.remove("is-visible");
    memoToast.hidden = true;
  }, 1600);
}

function showMemoDockHintIfNeeded() {
  if (!memoDockHint || isMemoHintDismissed) return;
  memoDockHint.hidden = false;
}

function openMemoPanel(message = "") {
  if (!memoPanel) return;
  if (!isMemoHintDismissed) dismissMemoDockHint();
  memoPanelBackdrop && (memoPanelBackdrop.hidden = false);
  memoPanel.hidden = false;
  memoPanel.classList.add("is-open");
  document.body.classList.add("memo-panel-open");
  memoDockButton?.setAttribute("aria-expanded", "true");
  setMemoStatus(message);
  renderMemoList();
}

function closeMemoPanel() {
  if (!memoPanel) return;
  memoPanel.classList.remove("is-open", "is-swipe-dragging");
  memoPanel.style.transform = "";
  document.body.classList.remove("memo-panel-open");
  memoDockButton?.setAttribute("aria-expanded", "false");
  window.setTimeout(() => {
    if (!memoPanel.classList.contains("is-open")) memoPanel.hidden = true;
    if (!memoPanel.classList.contains("is-open") && memoPanelBackdrop) memoPanelBackdrop.hidden = true;
  }, 180);
}

function addMemoEntry(entry, options = {}) {
  const { openPanel = false, messageOnAdded = "メモに追加しました", messageOnExisting = "既にメモ済みです" } = options;
  if (!entry) return;
  if (memoEntryIdSet.has(entry.id)) {
    showMemoToast(messageOnExisting);
    setMemoStatus(messageOnExisting);
    if (openPanel) openMemoPanel(messageOnExisting);
    return false;
  }
  memoEntries = [entry, ...memoEntries];
  memoEntryIdSet.add(entry.id);
  saveMemoEntries();
  renderMemoList();
  showMemoToast(messageOnAdded);
  setMemoStatus(messageOnAdded);
  if (openPanel) openMemoPanel(messageOnAdded);
  return true;
}

function moveMemoEntry(memoId, direction) {
  const currentIndex = memoEntries.findIndex((memo) => memo.id === memoId);
  if (currentIndex < 0) return;
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= memoEntries.length) return;
  const nextEntries = [...memoEntries];
  [nextEntries[currentIndex], nextEntries[nextIndex]] = [nextEntries[nextIndex], nextEntries[currentIndex]];
  memoEntries = nextEntries;
  saveMemoEntries();
  renderMemoList();
}

function updateMemoUserNote(memoId, note) {
  const normalizedNote = normalizeMemoValue(note);
  const memo = memoEntries.find((entry) => entry.id === memoId);
  if (!memo) return;
  memo.userNote = normalizedNote;
  memo.updatedAt = new Date().toISOString();
  saveMemoEntries();
  setMemoStatus(normalizedNote ? "ユーザーメモを保存しました" : "ユーザーメモを空にしました");
  renderMemoList();
}

function renderMemoList() {
  if (!memoListWrap) return;
  if (!memoEntries.length) {
    memoListWrap.innerHTML = `<p class="memo-empty">メモはまだありません</p>`;
    if (memoClearAllButton) memoClearAllButton.disabled = true;
    return;
  }
  if (memoClearAllButton) memoClearAllButton.disabled = false;
  memoListWrap.innerHTML = memoEntries
    .map((memo, index) => {
      const isExpanded = expandedMemoIds.has(memo.id);
      const isEditingNote = editingMemoNoteIds.has(memo.id);
      const visibleLines = isExpanded ? memo.lines : memo.lines.slice(0, 3);
      const remainingCount = Math.max(memo.lines.length - visibleLines.length, 0);
      const userNote = normalizeMemoValue(memo.userNote);
      return `<article class="memo-card" role="button" tabindex="0" data-memo-card-id="${escapeHtml(memo.id)}" aria-expanded="${isExpanded ? "true" : "false"}">
        <header class="memo-card-header">
          <div>
            <p class="memo-card-type">${escapeHtml(memo.type)}</p>
            <h3>${escapeHtml(memo.name)}</h3>
          </div>
          <div class="memo-card-actions">
            <button type="button" class="memo-move-button" data-memo-move-id="${escapeHtml(memo.id)}" data-memo-move-direction="-1" ${index === 0 ? "disabled" : ""} aria-label="${escapeHtml(memo.name)}を上へ移動">↑</button>
            <button type="button" class="memo-move-button" data-memo-move-id="${escapeHtml(memo.id)}" data-memo-move-direction="1" ${index === memoEntries.length - 1 ? "disabled" : ""} aria-label="${escapeHtml(memo.name)}を下へ移動">↓</button>
            <button type="button" class="memo-note-toggle-button" data-memo-note-toggle-id="${escapeHtml(memo.id)}">${userNote ? "編集" : "追記"}</button>
            <button type="button" class="memo-delete-button" data-memo-delete-id="${escapeHtml(memo.id)}">削除</button>
          </div>
        </header>
        <div class="memo-card-body">
          ${visibleLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          ${remainingCount > 0 ? `<p class="memo-card-more">ほか${remainingCount}件</p>` : ""}
        </div>
        ${
          userNote
            ? `<div class="memo-user-note"><p class="memo-user-note-label">ユーザーメモ</p><p>${escapeHtml(userNote)}</p></div>`
            : ""
        }
        ${
          isEditingNote
            ? `<div class="memo-note-editor" data-memo-note-editor-id="${escapeHtml(memo.id)}">
                <label class="memo-note-editor-label" for="memoNoteInput-${escapeHtml(memo.id)}">ユーザーメモ</label>
                <textarea id="memoNoteInput-${escapeHtml(memo.id)}" data-memo-note-input-id="${escapeHtml(memo.id)}" rows="3" placeholder="あとで確認したいことを入力">${escapeHtml(userNote)}</textarea>
                <div class="memo-note-editor-actions">
                  <button type="button" class="memo-note-save-button" data-memo-note-save-id="${escapeHtml(memo.id)}">保存</button>
                  <button type="button" class="memo-note-cancel-button" data-memo-note-cancel-id="${escapeHtml(memo.id)}">キャンセル</button>
                </div>
              </div>`
            : ""
        }
        ${
          memo.lines.length > 3
            ? `<button type="button" class="memo-detail-button" data-memo-toggle-id="${escapeHtml(memo.id)}">${isExpanded ? "閉じる" : "詳細"}</button>`
            : ""
        }
      </article>`;
    })
    .join("");
  decorateMemoAddButtons(memoListWrap);
}

function toggleMemoExpanded(memoId) {
  if (!memoId) return;
  if (expandedMemoIds.has(memoId)) {
    expandedMemoIds.delete(memoId);
  } else {
    expandedMemoIds.add(memoId);
  }
  renderMemoList();
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

function formatBazaarChartPrice(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "-";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "-";
  return Math.ceil(parsed).toLocaleString("ja-JP");
}

function formatBazaarChartPriceWithUnit(value) {
  const text = formatBazaarChartPrice(value);
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

function formatBazaarPageUpdatedAt(rawValue) {
  const normalized = String(rawValue || "").trim();
  if (normalized === "") return "-";

  const slashNormalized = normalized
    .replace(/-/g, "/")
    .replace(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\/(\d{1,2}:\d{2})$/, "$1/$2/$3 $4");

  const directMatch = slashNormalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})$/);
  if (directMatch) {
    const [, year, month, day, hour, minute] = directMatch;
    return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${minute}`;
  }

  const parsed = new Date(slashNormalized);
  if (Number.isNaN(parsed.getTime())) return normalized;

  return `${parsed.getFullYear()}/${String(parsed.getMonth() + 1).padStart(2, "0")}/${String(parsed.getDate()).padStart(2, "0")} ${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
}

function getBazaarPageUpdatedAtLabel(rows) {
  const firstUpdatedAt = (Array.isArray(rows) ? rows : []).find((row) => String(row?.updatedAt || "").trim() !== "")?.updatedAt || "";
  return `ページ更新: ${formatBazaarPageUpdatedAt(firstUpdatedAt)}`;
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
    const hostname = String(parsed.hostname || "").toLowerCase();
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      if (hostname === "dqx-souba.game-blog.app" || hostname.endsWith(".dqx-souba.game-blog.app")) {
        return "";
      }
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

const BAZAAR_PAUSED_COMMENT_KEYWORDS = Object.freeze([
  "固定価格",
  "現在固定",
  "店売り価格固定",
  "店売り",
  "価格固定",
  "更新停止",
  "価格更新停止中",
  "自動更新対象外",
]);

function normalizeBazaarCommentText(comment) {
  return String(comment ?? "").trim();
}

function normalizeBazaarCommentForMatch(comment) {
  return normalizeBazaarCommentText(comment)
    .normalize("NFKC")
    .replace(/[ 　\t\r\n]+/g, "")
    .replace(/[・･、,，。.\-‐‑‒–—―_＿/／\\|｜:：;；()[\]{}「」『』【】'"`"]/g, "");
}

function hasBazaarPausedComment(comment) {
  const normalizedText = normalizeBazaarCommentForMatch(comment);
  if (normalizedText === "") return false;
  return BAZAAR_PAUSED_COMMENT_KEYWORDS.some((keyword) => normalizeBazaarCommentForMatch(keyword) !== "" && normalizedText.includes(normalizeBazaarCommentForMatch(keyword)));
}

function isExcludedByComment(comment) {
  const normalizedText = normalizeBazaarCommentForMatch(comment);
  return hasBazaarPausedComment(comment) || normalizedText.includes(normalizeBazaarCommentForMatch("除外"));
}

function isMonitoringByComment(comment) {
  return !hasBazaarPausedComment(comment) && normalizeBazaarCommentText(comment) === "";
}

function isBazaarPausedByComment(comment) {
  return hasBazaarPausedComment(comment);
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
        originalCells: [...cells],
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
        isUpdated: false,
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
    const rowCells = row?.isUpdated ? row.cells : row.originalCells || row.cells;
    lines.push(rowCells.map((value) => escapeCsvValue(value)).join(","));
  });
  return `\uFEFF${lines.join("\n")}\n`;
}

function setBazaarAdminMessage(message, isError = false) {
  if (!bazaarAdminMessage) return;
  bazaarAdminMessage.textContent = message;
  bazaarAdminMessage.style.color = isError ? "#d93025" : "#4f5d75";
}

function setBazaarAdminPasteStatus(rowId, message, isError = false) {
  const normalizedRowId = String(rowId || "").trim();
  if (normalizedRowId === "" || !bazaarAdminListWrap) return;
  const statusElement = bazaarAdminListWrap.querySelector(`[data-bazaar-admin-paste-status="${normalizedRowId}"]`);
  if (!(statusElement instanceof HTMLElement)) return;
  statusElement.textContent = String(message || "").trim();
  statusElement.classList.toggle("is-error", Boolean(isError) && statusElement.textContent !== "");
  statusElement.classList.toggle("is-success", !isError && statusElement.textContent !== "");
}

function dispatchBazaarAdminPasteInput(textarea) {
  const inputEvent = new Event("input", { bubbles: true });
  textarea.dispatchEvent(inputEvent);
}

async function tryAutoPasteBazaarAdminTextarea(textarea) {
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  const rowId = String(textarea.dataset.bazaarAdminPasteInput || "").trim();
  if (rowId === "") return;
  if (String(textarea.value || "").trim() !== "") return;
  if (!window.isSecureContext || !navigator.clipboard?.readText) {
    setBazaarAdminPasteStatus(rowId, "自動貼り付けできませんでした。Ctrl+Vで貼り付けてください。", true);
    return;
  }

  const currentState = bazaarAdminClipboardReadStateByRowId.get(rowId);
  if (currentState === "pending") return;
  bazaarAdminClipboardReadStateByRowId.set(rowId, "pending");

  try {
    const clipboardText = String(await navigator.clipboard.readText() || "");
    if (String(textarea.value || "").trim() !== "") {
      bazaarAdminClipboardReadStateByRowId.set(rowId, "filled");
      return;
    }
    if (clipboardText.trim() === "") {
      bazaarAdminClipboardReadStateByRowId.set(rowId, "idle");
      setBazaarAdminPasteStatus(rowId, "クリップボードが空です。Ctrl+Vでも貼り付けできます。", true);
      return;
    }
    textarea.value = clipboardText;
    bazaarAdminPastedTextByRowId.set(rowId, clipboardText);
    dispatchBazaarAdminPasteInput(textarea);
    bazaarAdminClipboardReadStateByRowId.set(rowId, "filled");
    setBazaarAdminPasteStatus(rowId, "クリップボードから貼り付けました。");
    setBazaarAdminMessage("クリップボードから貼り付けました。");
  } catch (error) {
    bazaarAdminClipboardReadStateByRowId.set(rowId, "idle");
    setBazaarAdminPasteStatus(rowId, "自動貼り付けできませんでした。Ctrl+Vで貼り付けてください。", true);
    setBazaarAdminMessage("自動貼り付けできませんでした。Ctrl+Vで貼り付けてください。", true);
    console.warn("クリップボードの自動貼り付けに失敗しました", error);
  }
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
  if (!row || row.excluded || !safePriceText) return false;
  const currentToday = String(row.cells[bazaarAdminCsvModel.indexes.todayPrice] || "").trim();
  row.cells[bazaarAdminCsvModel.indexes.previousDayPrice] = currentToday;
  row.cells[bazaarAdminCsvModel.indexes.todayPrice] = safePriceText;
  row.cells[bazaarAdminCsvModel.indexes.updatedAt] = formatBazaarAdminTimestamp(new Date());
  row.todayPriceText = safePriceText;
  row.previousDayPriceText = currentToday;
  row.updatedAtText = String(row.cells[bazaarAdminCsvModel.indexes.updatedAt] || "");
  row.isUpdated = true;
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
  return row?.isUpdated === true;
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
  renderAdminChecklist();
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
            <small class="bazaar-admin-paste-hint">公式ページでコピー後、この欄をクリックすると自動貼り付けできます</small>
            <small class="bazaar-admin-paste-status" data-bazaar-admin-paste-status="${escapeHtml(row.id)}" aria-live="polite"></small>
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


const ARMOR_SET_PART_DISPLAY_ORDER = ["頭", "からだ上", "からだ下", "腕", "足"];
const ARMOR_SET_REPRESENTATIVE_PART_WORDS = [
  "はちまき",
  "クラウン",
  "ヘルム",
  "帽子",
  "ぼうし",
  "かぶと",
  "ローブ",
  "装束",
  "よろい",
  "こて",
  "グローブ",
  "ブーツ",
  "くつ",
  "脚帯",
  "足袋",
];

function normalizeArmorPartCategory(category) {
  const normalized = String(category || "").trim();
  if (normalized === "") return "";
  if (normalized === "頭" || normalized === "アタマ") return "頭";
  if (normalized === "からだ上" || normalized === "体上") return "からだ上";
  if (normalized === "からだ下" || normalized === "体下") return "からだ下";
  if (normalized === "腕" || normalized === "うで") return "腕";
  if (normalized === "足" || normalized === "あし") return "足";
  return "";
}

function buildArmorSetRecipeSearchKeys(setName) {
  const baseName = stripArmorSetSuffix(setName);
  const keys = [];
  const addKey = (value) => {
    const key = String(value || "").trim();
    if (key.length < 2 || keys.includes(key)) return;
    keys.push(key);
  };

  addKey(baseName);
  ARMOR_SET_REPRESENTATIVE_PART_WORDS.forEach((word) => {
    if (!baseName.endsWith(word)) return;
    addKey(baseName.slice(0, -word.length).replace(/の$/, ""));
  });

  return keys;
}

function getArmorSetPartsFromRecipes(setName) {
  const setKeys = buildArmorSetRecipeSearchKeys(setName);
  if (setKeys.length === 0) return [];

  const slotMap = new Map();
  state.equipments.forEach((equipment) => {
    const equipmentName = String(equipment?.name || "").trim();
    const partCategory = normalizeArmorPartCategory(equipment?.category);
    if (!equipmentName || !partCategory) return;
    if (!setKeys.some((setKey) => equipmentName.includes(setKey))) return;
    if (!slotMap.has(partCategory)) {
      slotMap.set(partCategory, equipment);
    }
  });

  return ARMOR_SET_PART_DISPLAY_ORDER
    .filter((part) => slotMap.has(part))
    .map((part) => {
      const equipment = slotMap.get(part);
      const equipmentName = String(equipment?.name || "").trim();
      const equipmentId = String(equipment?.id || "").trim();
      const hasEstimatedCost = equipmentId !== "" && state.recipes.some((row) => row.equipmentId === equipmentId);
      const costValue = hasEstimatedCost ? getRoundedEquipmentMaterialCost(equipmentId) : null;
      return {
        part,
        name: equipmentName,
        equipmentId,
        costValue,
        costText: formatEstimatedMaterialCostText(equipmentId),
      };
    });
}

function getArmorSetPartsWithEstimatedCost(setName) {
  return getArmorSetPartsFromRecipes(setName);
}

function isArmorSetPartMatchedByKeyword(part, keyword) {
  const normalizedKeyword = String(keyword || "").trim().toLowerCase();
  if (normalizedKeyword === "") return false;
  const partName = String(part?.name || "").trim().toLowerCase();
  const partLabel = String(part?.part || "").trim().toLowerCase();
  return partName.includes(normalizedKeyword) || partLabel.includes(normalizedKeyword);
}

function buildArmorSetPartsHtml(setName, options = {}) {
  const { highlightKeyword = "", showMatchedBadge = false } = options;
  const parts = getArmorSetPartsFromRecipes(setName);
  if (parts.length === 0) {
    return `<p class="equipment-db-trait-empty">部位情報なし</p>`;
  }
  return `<dl class="equipment-db-armor-part-grid">${parts
    .map((part) => {
      const isMatched = isArmorSetPartMatchedByKeyword(part, highlightKeyword);
      return `<div class="${isMatched ? "is-highlighted" : ""}"><dt>${part.part}${showMatchedBadge && isMatched ? `<span class="equipment-db-armor-part-badge">白宝箱該当</span>` : ""}</dt><dd class="equipment-db-armor-part-name">${part.name}</dd><dd class="equipment-db-armor-part-cost">原価：${part.costText}</dd></div>`;
    })
    .join("")}</dl>`;
}

function getMeaningfulEquipmentTraits(entry) {
  const emptyLabels = new Set(["", "-", "なし", "未設定", "特性情報なし", "セット効果なし"]);
  return Array.isArray(entry?.traits)
    ? entry.traits
        .map((trait) => String(trait || "").trim())
        .filter((trait) => !emptyLabels.has(trait))
    : [];
}

function buildArmorSetDetailModalHtml(entry) {
  const levelText = Number.isFinite(entry?.equipmentLevel) ? `Lv${entry.equipmentLevel}` : "Lv-";
  const parts = getArmorSetPartsWithEstimatedCost(entry?.equipmentName || "");
  const stats = buildEquipmentDbStatsHtml(entry);
  const meaningfulTraits = getMeaningfulEquipmentTraits(entry);
  const whiteBoxDrops = Array.isArray(entry?.whiteBoxArmorDropsBySlot) ? entry.whiteBoxArmorDropsBySlot : [];
  const individualPageUrl = getEquipmentIndividualPageUrl(entry?.equipmentName || "");
  const whiteBoxHtml =
    entry?.whiteBoxHasDrop && whiteBoxDrops.length > 0
      ? `<div class="equipment-db-armor-drop-list">${whiteBoxDrops
          .map(
            (slotEntry) => `
          <section class="equipment-db-armor-drop-slot">
            <p class="equipment-db-armor-drop-slot-title">${escapeHtml(slotEntry.slot)}</p>
            <ul class="equipment-db-traits-list">
              ${slotEntry.items
                .map((item) => `<li><span class="equipment-db-armor-item-name">${escapeHtml(item.itemName)}</span><br>${buildEquipmentDbMonsterLinksHtml(item.monsterNames)}</li>`)
                .join("")}
            </ul>
          </section>`
          )
          .join("")}</div>`
      : `<p class="equipment-db-trait-empty">白宝箱ドロップなし</p>`;

  return `<div class="memo-target-header">
      <h3>${escapeHtml(entry?.equipmentName || "-")}</h3>
      <button type="button" class="memo-add-button" data-memo-armor-set-id="${escapeHtml(entry?.id || "")}">＋メモ</button>
    </div>
    <p><span class="monster-type">防具セット</span></p>
    <div class="equipment-db-detail-section equipment-db-detail-section-first">
      <p class="equipment-db-traits-title">基本情報</p>
      <p class="equipment-db-trait-empty equipment-db-armor-set-level">${levelText}</p>
    </div>
    <div class="equipment-db-detail-section">
      <p class="equipment-db-traits-title">各部位</p>
      ${
        parts.length > 0
          ? `<dl class="equipment-db-armor-part-grid equipment-db-armor-part-grid-modal">
              ${parts
                .map(
                  (part) => `<div>
                    <dt>${escapeHtml(part.part)}</dt>
                    <dd class="equipment-db-armor-part-name">${escapeHtml(part.name)}</dd>
                    <dd class="equipment-db-armor-part-cost">推定原価：${escapeHtml(part.costText)}</dd>
                    <dd class="equipment-db-armor-part-action"><button type="button" class="equipment-db-open-profit-button" data-armor-part-open-profit="${escapeHtml(part.equipmentId)}">職人アシスト</button></dd>
                  </div>`
                )
                .join("")}
            </dl>`
          : `<p class="equipment-db-trait-empty">部位情報なし</p>`
      }
    </div>
    <div class="equipment-db-detail-section">
      <p class="equipment-db-traits-title">上昇能力値</p>
      ${stats.length > 0 ? `<ul class="equipment-db-stats-list">${stats.join("")}</ul>` : `<p class="equipment-db-trait-empty">上昇能力値なし</p>`}
    </div>
    <div class="equipment-db-detail-section">
      <p class="equipment-db-traits-title">セット効果 / 特性</p>
      ${meaningfulTraits.length > 0 ? `<ul class="equipment-db-traits-list">${meaningfulTraits.map((trait) => `<li>${escapeHtml(trait)}</li>`).join("")}</ul>` : `<p class="equipment-db-trait-empty">セット効果なし</p>`}
    </div>
    <div class="equipment-db-detail-section">
      <p class="equipment-db-traits-title">白宝箱ドロップモンスター</p>
      ${whiteBoxHtml}
    </div>
    ${buildIndividualPageActionLink("個別ページを開く", individualPageUrl)}`;
}

function closeArmorSetDetailModal() {
  if (!armorSetDetailModalOverlay) return;
  armorSetDetailModalOverlay.hidden = true;
  if (armorSetDetailModalBody) armorSetDetailModalBody.innerHTML = "";
  activeArmorSetDetailId = "";
}

function formatEstimatedMaterialCostText(equipmentId) {
  if (!equipmentId) return "未計算";
  if (!state.recipes.some((row) => row.equipmentId === equipmentId)) return "未計算";
  const cost = getRoundedEquipmentMaterialCost(equipmentId);
  return `${cost.toLocaleString("ja-JP")} G`;
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

function isOneHandSwordCategory(categoryName) {
  const normalized = String(categoryName || "").trim().toLowerCase().replace(/[\s_\-]/g, "");
  return normalized === "片手剣" || normalized === "片手剣系" || normalized === "onehandsword" || normalized === "sword";
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
    const matchedRow = bazaarRowByMaterialName.get(normalizedMaterialName);
    if (matchedRow?.officialUrl) {
      return matchedRow.officialUrl;
    }
  }
  return "";
}

function getBazaarPriceInfoByMaterialName(materialName) {
  const normalizedMaterialName = normalizeMaterialNameKey(materialName);
  if (normalizedMaterialName === "" || normalizedMaterialName === "-") {
    return { priceText: "", hasDisplayPrice: false };
  }
  const matchedRow = bazaarRowByMaterialName.get(normalizedMaterialName);
  if (!matchedRow || !isMonitoringByComment(matchedRow.comment)) {
    return { priceText: "", hasDisplayPrice: false };
  }
  const price = getPreferredBazaarUnitPrice(matchedRow);
  return {
    priceText: Number.isFinite(price) ? formatGold(price).replace(/\s*G$/, "G") : "",
    hasDisplayPrice: Number.isFinite(price),
  };
}

function rebuildBazaarLookupMaps() {
  bazaarRowById = new Map();
  bazaarRowByMaterialKey = new Map();
  bazaarRowByMaterialName = new Map();
  (bazaarPrices || []).forEach((row) => {
    const id = String(row?.id || "");
    const materialKey = String(row?.materialKey || "");
    const materialName = normalizeMaterialNameKey(row?.materialName);
    if (id !== "") bazaarRowById.set(id, row);
    if (materialKey !== "") bazaarRowByMaterialKey.set(materialKey, row);
    if (materialName !== "") bazaarRowByMaterialName.set(materialName, row);
  });
}

function rebuildOrbLookupMaps() {
  orbEntryById = new Map();
  orbEntryByName = new Map();
  (orbEntries || []).forEach((entry) => {
    const id = String(entry?.id || "");
    const name = String(entry?.orbName || "").trim();
    if (id !== "") orbEntryById.set(id, entry);
    if (name !== "") orbEntryByName.set(name, entry);
  });
}

function rebuildEquipmentDbLookupMaps() {
  equipmentDbEntryById = new Map();
  equipmentDbEntryByName = new Map();
  equipmentDbWeaponEntryByName = new Map();
  (equipmentDbEntries || []).forEach((entry) => {
    const id = String(entry?.id || "");
    const name = String(entry?.equipmentName || "").trim();
    if (id !== "") equipmentDbEntryById.set(id, entry);
    if (name !== "") equipmentDbEntryByName.set(name, entry);
    if (name !== "" && String(entry?.equipmentGroup || "") === "weapon") {
      equipmentDbWeaponEntryByName.set(name, entry);
    }
  });
}

function rebuildWhiteBoxLookupMaps() {
  whiteBoxEntryByItemName = new Map();
  (whiteBoxEntries || []).forEach((entry) => {
    const name = String(entry?.itemName || "").trim();
    if (name !== "") whiteBoxEntryByItemName.set(name, entry);
  });
}

function rebuildMonsterInfoLookupMaps() {
  monsterDetailEntryById = new Map();
  monsterDetailEntryByName = new Map();
  (monsterDetailEntries || []).forEach((entry) => {
    const id = String(entry?.id || "");
    const name = String(entry?.name || "").trim();
    if (id !== "") monsterDetailEntryById.set(id, entry);
    if (name !== "") monsterDetailEntryByName.set(name, entry);
  });
}

function buildMonsterDropHtml(label, itemName, options = {}) {
  const { modal = false } = options;
  const normalizedItemName = String(itemName || "-").trim() || "-";
  const priceInfo = getBazaarPriceInfoByMaterialName(normalizedItemName);
  const priceHtml = priceInfo.hasDisplayPrice ? `<span class="monster-drop-price">${escapeHtml(priceInfo.priceText)}</span>` : "";
  const canOpenBazaar = normalizedItemName !== "" && normalizedItemName !== "-" && normalizedItemName !== "なし" && normalizedItemName !== "未登録";
  const bazaarLinkHtml =
    modal && canOpenBazaar
      ? `<button type="button" class="monster-info-chip monster-info-nav-link monster-drop-bazaar-link" data-monster-drop-bazaar-item="${escapeHtml(normalizedItemName)}">バザー情報</button>`
      : "";
  if (modal) {
    return `<div class="monster-drop-detail">
      <p class="monster-drop-title">${escapeHtml(label)}</p>
      <p class="monster-drop-row monster-drop-row-detail">
        <span class="monster-drop-item-name">${escapeHtml(normalizedItemName)}</span>
        ${priceHtml}
      </p>
      ${bazaarLinkHtml ? `<div class="monster-drop-action-row">${bazaarLinkHtml}</div>` : ""}
    </div>`;
  }
  return `<p class="monster-drop-row">
    <span class="monster-label">${escapeHtml(label)}：</span>
    <span class="monster-drop-item-name">${escapeHtml(normalizedItemName)}</span>
    ${priceHtml}
  </p>`;
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
      presentCodesLoadError = false;
    } catch (error) {
      console.error(`datapresent_codes.csv の読み込みに失敗しました: path=${PRESENT_CODES_CSV_PATH}`, error);
      presentCodes = [];
      presentCodesLoadError = true;
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
      rebuildBazaarLookupMaps();
      hasLoadedBazaarPrices = true;
      bazaarLoadError = false;
      if (!hasSyncedMaterialPricesWithBazaar) {
        const materialSyncResult = syncMaterialPricesWithBazaar(state.materials, bazaarPrices);
        state.materials = materialSyncResult.materials;
        hasSyncedMaterialPricesWithBazaar = true;
        saveData();
      }
    } catch (error) {
      console.error(`bazaar_prices.csv の読み込みに失敗しました: path=${BAZAAR_CSV_PATH}`, error);
      bazaarPrices = [];
      rebuildBazaarLookupMaps();
      bazaarLoadError = true;
    } finally {
      isBazaarLoading = false;
      if (activeTabId === "bazaar") {
        applyPendingBazaarUrlItemIfNeeded();
        renderBazaarPrices();
      }
      renderHomeBazaarChangeRanking();
      if (activeTabId === "field-farming") renderFieldFarmingRanking();
      if (activeTabId === "favorites") renderFavoritesPage();
      if (activeTabId === "monster-info") renderMonsterInfoCards();
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
      fieldFarmingLoadError = false;
    } catch (error) {
      console.error(`field_farming_monsters.csv の読み込みに失敗しました: path=${FIELD_FARMING_CSV_PATH}`, error);
      fieldFarmingMonsters = [];
      fieldFarmingLoadError = true;
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
      rebuildOrbLookupMaps();
      hasLoadedOrbData = true;
      orbLoadError = false;
    } catch (error) {
      console.error(`orb_data.csv の読み込みに失敗しました: path=${ORB_DATA_CSV_PATH}`, error);
      orbEntries = [];
      rebuildOrbLookupMaps();
      orbLoadError = true;
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
      rebuildWhiteBoxLookupMaps();
      hasLoadedWhiteBoxData = true;
      whiteBoxLoadError = false;
    } catch (error) {
      console.error(`white_box.csv の読み込みに失敗しました: path=${WHITE_BOX_CSV_PATH}`, error);
      whiteBoxEntries = [];
      rebuildWhiteBoxLookupMaps();
      whiteBoxLoadError = true;
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
          rebuildWhiteBoxLookupMaps();
          hasLoadedWhiteBoxData = true;
      whiteBoxLoadError = false;
        } catch (whiteBoxError) {
          console.error(`white_box.csv の読み込みに失敗しました: path=${WHITE_BOX_CSV_PATH}`, whiteBoxError);
          whiteBoxEntries = [];
      rebuildWhiteBoxLookupMaps();
      whiteBoxLoadError = true;
        }
      }
      const whiteBoxSummaryByName = buildWhiteBoxSummaryByItemName(whiteBoxEntries);
      equipmentDbEntries = attachWhiteBoxDropsToEquipmentEntries(loadedEquipmentDbEntries, whiteBoxSummaryByName);
      rebuildEquipmentDbLookupMaps();
      hasLoadedEquipmentDbData = true;
      equipmentDbLoadError = false;
    } catch (error) {
      console.error(`equipment_data.csv の読み込みに失敗しました: path=${EQUIPMENT_DB_CSV_PATH}`, error);
      equipmentDbEntries = [];
      rebuildEquipmentDbLookupMaps();
      equipmentDbLoadError = true;
    } finally {
      isEquipmentDbDataLoading = false;
      if (activeTabId === "equipment-db") renderEquipmentDbCards();
    }
  })();
  return equipmentDbDataLoadingPromise;
}

async function loadRoutineTasksCsv() {
  const lines = await fetchCsvLines(ROUTINE_TASKS_CSV_PATH);
  if (lines.length <= 1) return [];
  const headers = parseCsvLine(lines[0]);
  const idx = {
    id: findHeaderIndex(headers, ["routine_id", "id"]),
    toolAvailable: findHeaderIndex(headers, ["tool_available", "tool"]),
    resetRule: findHeaderIndex(headers, ["reset_rule", "reset"]),
    startVersion: findHeaderIndex(headers, ["start_version", "start_varsion", "version"]),
    type: findHeaderIndex(headers, ["type", "routine_type"]),
    title: findHeaderIndex(headers, ["title", "name"]),
    howTo: findHeaderIndex(headers, ["how_to", "hou_to", "method"]),
    reward: findHeaderIndex(headers, ["reward"]),
    estimatedTime: findHeaderIndex(headers, ["estimated_time", "time"]),
    comment: findHeaderIndex(headers, ["comment", "memo"]),
    sortOrder: findHeaderIndex(headers, ["sort_order", "sort"]),
  };
  return lines
    .slice(1)
    .map((line, index) => {
      const row = parseCsvLine(line);
      const title = String(row[idx.title] || "").trim();
      if (!title) return null;
      const type = normalizeRoutineType(row[idx.type]);
      const sortOrder = Number(row[idx.sortOrder] || Number.MAX_SAFE_INTEGER);
      return {
        id: makeRoutineTaskId(row[idx.id], index),
        csvId: String(row[idx.id] || "").trim(),
        type,
        title,
        toolAvailable: String(row[idx.toolAvailable] || "").trim(),
        resetRule: String(row[idx.resetRule] || "").trim(),
        startVersion: String(row[idx.startVersion] || "").trim(),
        howTo: String(row[idx.howTo] || "").trim(),
        reward: String(row[idx.reward] || "").trim(),
        estimatedTime: String(row[idx.estimatedTime] || "").trim(),
        comment: String(row[idx.comment] || "").trim(),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : Number.MAX_SAFE_INTEGER,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type, "ja");
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.title.localeCompare(b.title, "ja");
    });
}

async function ensureRoutineTasksLoaded() {
  if (hasLoadedRoutineTasks || isRoutineTasksLoading) return routineTasksLoadingPromise;
  isRoutineTasksLoading = true;
  routineTasksLoadingPromise = (async () => {
    try {
      routineTasks = await loadRoutineTasksCsv();
      hasLoadedRoutineTasks = true;
      routineTasksLoadError = false;
      pruneRoutineTaskCheckedState();
      expireRoutineTaskCheckedState();
    } catch (error) {
      console.error(`routine_tasks.csv の読み込みに失敗しました: path=${ROUTINE_TASKS_CSV_PATH}`, error);
      routineTasks = [];
      routineTasksLoadError = true;
    } finally {
      isRoutineTasksLoading = false;
      if (activeTabId === "routine") renderRoutineTasks();
      if (appMode === "home") renderHomeDailyInfo();
    }
  })();
  return routineTasksLoadingPromise;
}

function findHeaderIndex(headers, candidates) {
  const normalized = headers.map((h) => String(h || "").trim().toLowerCase());
  return candidates
    .map((name) => String(name || "").trim().toLowerCase())
    .map((name) => normalized.indexOf(name))
    .find((index) => index >= 0) ?? -1;
}

function parsePipeList(value) {
  return String(value || "")
    .split("｜")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRoutineTypeLabel(type) {
  if (type === "weekly") return "週課";
  if (type === "monthly") return "月課";
  return "日課";
}

function getRoutineResetDescriptionHtml(type) {
  if (type === "weekly") {
    return "週課は毎週日曜 6:00 にチェック状態を自動リセットします。";
  }
  if (type === "monthly") {
    return '月課は毎月1日 6:00 にチェック状態を自動リセットします。<span class="routine-reset-description-note">※一部コンテンツは更新日が異なる場合があります。</span>';
  }
  return "日課は毎日 6:00 にチェック状態を自動リセットします。";
}

function formatRoutineResetTimeLabel(hour, minute) {
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

function formatRoutineResetRuleLabel(rule) {
  const raw = String(rule || "").trim();
  if (!raw) return "手動リセット";
  const normalized = normalizeRoutineResetRule(raw);
  const { hour, minute } = parseRoutineResetTime(normalized);
  const timeLabel = formatRoutineResetTimeLabel(hour, minute);
  if (normalized.startsWith("daily")) {
    return `毎日 ${timeLabel} 更新`;
  }
  if (normalized.startsWith("weekly_")) {
    const weeklyBase = normalized.replace(/(am|pm)?\d{1,2}(?::?\d{2})?$/i, "").replace(/_+$/, "");
    const dayToken = weeklyBase.split("_")[1] || "sun";
    const dayMap = {
      sun: "日曜",
      mon: "月曜",
      tue: "火曜",
      wed: "水曜",
      thu: "木曜",
      fri: "金曜",
      sat: "土曜",
    };
    return `毎週${dayMap[dayToken] || "日曜"} ${timeLabel} 更新`;
  }
  if (normalized.startsWith("monthly_")) {
    const monthlyBase = normalized.replace(/(am|pm)?\d{1,2}(?::?\d{2})?$/i, "").replace(/_+$/, "");
    const dayNumbers = monthlyBase
      .split("_")
      .slice(1)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b);
    if (dayNumbers.length > 0) {
      return `毎月${dayNumbers.join("日・")}日 ${timeLabel} 更新`;
    }
  }
  return raw;
}

function formatRoutineVersionLabel(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "ver-";
  const compact = normalized.replace(/\s+/g, "");
  if (/^ver/i.test(compact)) {
    return compact.replace(/^ver+/i, "ver");
  }
  return `ver${compact}`;
}

function formatRoutineToolAvailableLabel(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "未対応";
  if (/[〇○◯]/.test(normalized) || /yes|ok|true|対応/i.test(normalized)) return "対応";
  return normalized;
}

function getRoutineTasksByType(type = selectedRoutineType) {
  return (routineTasks || []).filter((task) => task.type === type);
}

function getRoutineTaskById(taskId) {
  return (routineTasks || []).find((task) => task.id === taskId) || null;
}

function updateRoutineTypeTabState() {
  routineTypeTabButtons.forEach((button) => {
    const isActive = String(button.dataset.routineType || "") === selectedRoutineType;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });
}

function renderRoutineTasks() {
  updateRoutineTypeTabState();
  const currentTypeLabel = getRoutineTypeLabel(selectedRoutineType);
  const currentTasks = getRoutineTasksByType(selectedRoutineType);
  const completedCount = currentTasks.filter((task) => isRoutineTaskChecked(task)).length;
  if (routineProgressText) {
    routineProgressText.textContent = `${currentTypeLabel} ${completedCount}/${currentTasks.length} 完了`;
  }
  if (routineResetDescription) {
    routineResetDescription.innerHTML = getRoutineResetDescriptionHtml(selectedRoutineType);
  }
  if (routineCheckAllButton) routineCheckAllButton.disabled = currentTasks.length === 0;
  if (routineClearAllButton) routineClearAllButton.disabled = currentTasks.length === 0;

  if (!routineListWrap) return;
  if (isRoutineTasksLoading && !hasLoadedRoutineTasks && routineTasks.length === 0) {
    routineListWrap.innerHTML = '<div class="card routine-status-card">日課・週課・月課データを読み込んでいます…</div>';
    return;
  }
  if (routineTasksLoadError && routineTasks.length === 0) {
    routineListWrap.innerHTML = '<div class="card routine-status-card">データを読み込めませんでした。</div>';
    return;
  }

  const visibleTasks = currentTasks;
  if (visibleTasks.length === 0) {
    routineListWrap.innerHTML = `<div class="card routine-status-card">${
      `${currentTypeLabel}の項目はまだありません。`
    }</div>`;
    return;
  }

  routineListWrap.innerHTML = `
    <div class="routine-card-list">
      ${visibleTasks
        .map((task) => {
          const checked = isRoutineTaskChecked(task);
          const checkLabel = checked ? "完了済み" : "未完了";
          const startVersion = formatRoutineVersionLabel(task.startVersion);
          const comment = task.comment || "-";
          const estimatedTime = task.estimatedTime || "-";
          const reward = task.reward || "-";
          const howTo = task.howTo || "-";
          const toolAvailableLabel = formatRoutineToolAvailableLabel(task.toolAvailable);
          const resetTimingLabel = formatRoutineResetRuleLabel(task.resetRule);
          return `
            <article class="card routine-task-card${checked ? " is-complete" : ""}">
              <div class="routine-task-card-header">
                <div class="routine-task-title-wrap">
                  <div class="routine-task-title-line">
                    <h3 class="routine-task-title">${escapeHtml(task.title)}</h3>
                    <span class="routine-task-version">(${escapeHtml(startVersion)})</span>
                    ${toolAvailableLabel === "対応" ? '<span class="routine-task-tool-badge">ツール</span>' : ""}
                  </div>
                  <p class="routine-task-reset-timing">${escapeHtml(resetTimingLabel)}</p>
                  <p class="routine-task-summary">
                    <span class="routine-task-summary-item">${escapeHtml(howTo)}</span>
                    <span class="routine-task-summary-item">${escapeHtml(reward)}</span>
                    <span class="routine-task-summary-item">所要時間${escapeHtml(estimatedTime)}</span>
                    <span class="routine-task-summary-item">${escapeHtml(comment)}</span>
                  </p>
                </div>
                <label class="routine-task-check">
                  <input type="checkbox" data-routine-task-id="${escapeHtml(task.id)}" ${checked ? "checked" : ""} />
                  <span>${checkLabel}</span>
                </label>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function normalizeBossCardTimerEntry(value, index = 0) {
  const name = String(value?.name || "").trim();
  const expiry = String(value?.expiry || "").trim();
  if (!name || !expiry) return null;
  const parsedExpiry = new Date(expiry);
  if (Number.isNaN(parsedExpiry.getTime())) return null;
  const count = Math.max(1, Math.floor(Number(value?.count || 1)));
  return {
    id: String(value?.id || `boss-card-${index}-${parsedExpiry.getTime()}`),
    name,
    expiry,
    count,
    memo: String(value?.memo || "").trim(),
    createdAt: String(value?.createdAt || ""),
  };
}

function loadBossCardTimers() {
  const raw = localStorage.getItem(BOSS_CARD_TIMER_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.entries) ? parsed.entries : [];
    return entries.map(normalizeBossCardTimerEntry).filter(Boolean);
  } catch {
    return [];
  }
}

function saveBossCardTimers() {
  localStorage.setItem(
    BOSS_CARD_TIMER_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      entries: bossCardTimers,
    })
  );
}

function makeBossCardTimerId() {
  return `boss-card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeBossCardSearchText(value) {
  return String(value || "")
    .trim()
    .normalize("NFKC")
    .replace(/[\s\u3000]/g, "")
    .replace(/[ぁ-ん]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60))
    .toLowerCase();
}

function createBossCardNameCandidateRecord(cardName, reading = "", category = "") {
  const name = String(cardName || "").trim();
  if (!name) return null;
  const normalizedVariants = new Set(
    [name, reading, name.replace(/カード$/u, ""), name.replace(/強カード$/u, ""), name.replace(/強$/u, "")]
      .map(normalizeBossCardSearchText)
      .filter(Boolean)
  );
  return {
    name,
    reading: String(reading || "").trim(),
    category: String(category || "").trim(),
    searchKeys: Array.from(normalizedVariants),
  };
}

async function loadBossCardNameCandidateRecords() {
  try {
    const lines = await fetchCsvLines(BOSS_CARDS_CSV_PATH);
    const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
    const nameIndex = headers.indexOf("card_name");
    const readingIndex = headers.indexOf("reading");
    const categoryIndex = headers.indexOf("category");
    if (nameIndex < 0) throw new Error("boss_cards.csv に card_name 列がありません");
    return lines
      .slice(1)
      .map((line) => {
        const row = parseCsvLine(line);
        return createBossCardNameCandidateRecord(row[nameIndex], readingIndex >= 0 ? row[readingIndex] : "", categoryIndex >= 0 ? row[categoryIndex] : "");
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("boss_cards.csv の読み込みに失敗したため固定候補を使用します", error);
    return BOSS_CARD_NAME_CANDIDATES.map((name) => createBossCardNameCandidateRecord(name)).filter(Boolean);
  }
}

function getBossCardNameCandidates(keyword) {
  const normalizedKeyword = normalizeBossCardSearchText(keyword);
  if (!normalizedKeyword) return [];
  const records = bossCardNameCandidateRecords.length
    ? bossCardNameCandidateRecords
    : BOSS_CARD_NAME_CANDIDATES.map((name) => createBossCardNameCandidateRecord(name)).filter(Boolean);
  return records
    .filter((record) => record.searchKeys.some((key) => key.includes(normalizedKeyword)))
    .map((record) => record.name)
    .slice(0, 10);
}

function renderBossCardNameCandidates() {
  if (!bossCardNameCandidateWrap || !bossCardNameInput) return;
  const candidates = getBossCardNameCandidates(bossCardNameInput.value);
  if (candidates.length === 0) {
    bossCardNameCandidateWrap.hidden = true;
    bossCardNameCandidateWrap.innerHTML = "";
    return;
  }
  bossCardNameCandidateWrap.innerHTML = candidates
    .map(
      (name) =>
        `<button type="button" class="boss-card-name-candidate" data-boss-card-name-candidate="${escapeHtml(name)}">${escapeHtml(
          name
        )}</button>`
    )
    .join("");
  bossCardNameCandidateWrap.hidden = false;
}

function buildBossCardExpiryFromHours(hoursValue) {
  const hours = Number(hoursValue);
  if (!Number.isFinite(hours) || hours <= 0) return "";
  const expiry = new Date(Date.now() + Math.floor(hours) * 60 * 60 * 1000);
  return expiry.toISOString();
}

function formatBossCardExpiry(expiry) {
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

function getBossCardTimerStatus(entry, now = new Date()) {
  const expiry = new Date(entry?.expiry || "");
  const remainingMs = expiry.getTime() - now.getTime();
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return "expired";
  if (remainingMs <= 24 * 60 * 60 * 1000) return "soon";
  return "normal";
}

function formatBossCardRemaining(entry, now = new Date()) {
  const expiry = new Date(entry?.expiry || "");
  const remainingMs = expiry.getTime() - now.getTime();
  if (!Number.isFinite(remainingMs)) return "-";
  if (remainingMs <= 0) return "期限切れ";
  const totalMinutes = Math.ceil(remainingMs / 60000);
  const totalHours = Math.ceil(remainingMs / (60 * 60 * 1000));
  if (totalHours >= 24) return `あと${totalHours}時間`;
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `あと${days}日${hours > 0 ? `${hours}時間` : ""}`;
  if (hours > 0) return `あと${hours}時間${minutes > 0 ? `${minutes}分` : ""}`;
  return `あと${minutes}分`;
}

function getBossCardNoticeDateText(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadBossCardNoticeSeenState() {
  try {
    return JSON.parse(localStorage.getItem(BOSS_CARD_NOTICE_SEEN_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveBossCardNoticeSeenState(dateText = getBossCardNoticeDateText()) {
  localStorage.setItem(BOSS_CARD_NOTICE_SEEN_STORAGE_KEY, JSON.stringify({ date: dateText }));
}

function pruneExpiredBossCardTimers(now = new Date()) {
  const beforeCount = bossCardTimers.length;
  bossCardTimers = bossCardTimers.filter((entry) => {
    const expiryTime = new Date(entry?.expiry || "").getTime();
    return Number.isFinite(expiryTime) && expiryTime > now.getTime();
  });
  const removedCount = beforeCount - bossCardTimers.length;
  if (removedCount > 0) saveBossCardTimers();
  return removedCount;
}

function getBossCardNoticeCandidates(now = new Date()) {
  const maxNoticeMs = 240 * 60 * 60 * 1000;
  return bossCardTimers
    .map((entry) => {
      const expiryTime = new Date(entry?.expiry || "").getTime();
      const remainingMs = expiryTime - now.getTime();
      return { entry, expiryTime, remainingMs };
    })
    .filter(({ expiryTime, remainingMs }) => Number.isFinite(expiryTime) && remainingMs > 0 && remainingMs <= maxNoticeMs)
    .sort((a, b) => a.expiryTime - b.expiryTime);
}

function getBossCardNoticeSummary(candidates) {
  const nearestHours = Math.ceil((candidates[0]?.remainingMs || 0) / (60 * 60 * 1000));
  if (nearestHours <= 24) {
    return { title: "本日で期限が切れるカードがあります", level: "urgent" };
  }
  if (nearestHours <= 72) {
    return { title: "3日以内に期限が切れるカードがあります", level: "high" };
  }
  if (nearestHours <= 120) {
    return { title: "5日以内に期限が切れるカードがあります", level: "medium" };
  }
  return { title: "10日以内に期限が切れるカードがあります", level: "low" };
}

function hideHomeBossCardNotice() {
  if (!homeBossCardNotice) return;
  homeBossCardNotice.hidden = true;
  homeBossCardNotice.classList.add("is-collapsed");
}

function renderHomeBossCardNotice() {
  if (!homeBossCardNotice || !homeBossCardNoticeTitle || !homeBossCardNoticeBody) return;
  if (appMode !== "home") {
    hideHomeBossCardNotice();
    return;
  }
  const todayText = getBossCardNoticeDateText();
  const seenState = loadBossCardNoticeSeenState();
  if (seenState?.date === todayText) {
    hideHomeBossCardNotice();
    return;
  }
  const now = new Date();
  pruneExpiredBossCardTimers(now);
  const candidates = getBossCardNoticeCandidates(now);
  if (candidates.length === 0) {
    hideHomeBossCardNotice();
    return;
  }
  const summary = getBossCardNoticeSummary(candidates);
  const visibleCandidates = candidates.slice(0, 5);
  const hiddenCount = Math.max(0, candidates.length - visibleCandidates.length);

  homeBossCardNoticeTitle.textContent = summary.title;
  homeBossCardNotice.classList.remove("is-collapsed", "is-urgent", "is-high", "is-medium", "is-low");
  homeBossCardNotice.classList.add(`is-${summary.level}`);
  homeBossCardNotice.hidden = false;
  homeBossCardNoticeBody.innerHTML = `
    <ul class="home-boss-card-notice-list">
      ${visibleCandidates
        .map(
          ({ entry }) => `
            <li>
              <strong>${escapeHtml(entry.name)}</strong>
              <span>${Number(entry.count || 1)}枚</span>
              <span>${escapeHtml(formatBossCardRemaining(entry, now))}</span>
            </li>
          `
        )
        .join("")}
    </ul>
    ${hiddenCount > 0 ? `<p class="home-boss-card-notice-more">ほか${hiddenCount}件</p>` : ""}
  `;
  saveBossCardNoticeSeenState(todayText);
}

function renderBossCardTimers() {
  if (!bossCardListWrap) return;
  const now = new Date();
  pruneExpiredBossCardTimers(now);
  const sortedEntries = [...bossCardTimers].sort((a, b) => {
    const aTime = new Date(a.expiry).getTime();
    const bTime = new Date(b.expiry).getTime();
    return aTime - bTime;
  });
  if (sortedEntries.length === 0) {
    bossCardListWrap.innerHTML = '<div class="card boss-card-empty">登録中のボスカードはありません。</div>';
    return;
  }
  bossCardListWrap.innerHTML = `
    <div class="boss-card-list">
      ${sortedEntries
        .map((entry) => {
          const status = getBossCardTimerStatus(entry, now);
          const statusLabel = status === "expired" ? "期限切れ" : status === "soon" ? "24時間以内" : "通常";
          return `
            <article class="card boss-card-timer-card is-${status}">
              <div class="boss-card-timer-header">
                <div>
                  <h3>${escapeHtml(entry.name)}</h3>
                  <p class="boss-card-timer-expiry">${escapeHtml(formatBossCardExpiry(entry.expiry))}</p>
                </div>
                <span class="boss-card-timer-status">${escapeHtml(statusLabel)}</span>
              </div>
              <div class="boss-card-timer-meta">
                <span>枚数 <strong>${entry.count}</strong></span>
                <span>残り <strong>${escapeHtml(formatBossCardRemaining(entry, now))}</strong></span>
              </div>
              ${entry.memo ? `<p class="boss-card-timer-memo">${escapeHtml(entry.memo)}</p>` : ""}
              <div class="boss-card-timer-actions">
                <button type="button" data-boss-card-delete-id="${escapeHtml(entry.id)}">削除</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

const MONSTER_TYPE_ORDER = [
  "スライム系",
  "あくま系",
  "エレメント系",
  "けもの系",
  "ゾンビ系",
  "ドラゴン系",
  "マシン系",
  "怪人系",
  "植物系",
  "水系",
  "虫系",
  "鳥系",
  "物質系",
];

const MONSTER_TYPE_ICON_MAP = {
  "スライム系": "icons/slime.png",
  "けもの系": "icons/beast.png",
  "あくま系": "icons/demon.png",
  "植物系": "icons/plant.png",
  "物質系": "icons/material.png",
  "マシン系": "icons/machine.png",
  "鳥系": "icons/bird.png",
  "怪人系": "icons/humanoid.png",
  "ドラゴン系": "icons/dragon.png",
  "エレメント系": "icons/element.png",
  "ゾンビ系": "icons/undead.png",
  "水系": "icons/water.png",
  "虫系": "icons/beetle.png",
};

function normalizeMonsterTypeLabel(type) {
  const trimmed = String(type || "").trim();
  const compact = trimmed.replace(/\s+/g, "");
  if (compact === "水" || compact === "水系") return "水系";
  if (compact === "虫" || compact === "虫系") return "虫系";
  return trimmed;
}

function getMonsterTypeThemeClass(type) {
  const label = normalizeMonsterTypeLabel(type);
  const themeMap = {
    "スライム系": "slime",
    "あくま系": "demon",
    "エレメント系": "element",
    "けもの系": "beast",
    "ゾンビ系": "undead",
    "ドラゴン系": "dragon",
    "マシン系": "machine",
    "物質系": "material",
    "怪人系": "humanoid",
    "植物系": "plant",
    "水系": "water",
    "虫系": "bug",
    "鳥系": "bird",
  };
  return themeMap[label] || "default";
}

function formatMonsterHabitatVersion(value) {
  const normalized = String(value || "").trim();
  if (normalized === "") return "ver未設定";
  const compact = normalized.replace(/\s+/g, "");
  if (/^ver/i.test(compact)) {
    return compact.replace(/^ver+/i, "ver");
  }
  return `ver${compact}`;
}

function buildMonsterTypeLabelHtml(type) {
  const label = normalizeMonsterTypeLabel(type) || "不明";
  const iconPath = MONSTER_TYPE_ICON_MAP[label];
  if (!iconPath) {
    return `<span class="monster-type" data-type="${escapeHtml(label)}">${escapeHtml(label)}</span>`;
  }
  return `<span class="monster-type monster-type-with-icon" data-type="${escapeHtml(label)}">
    <img src="${escapeHtml(resolveProjectScopedResourceUrl(iconPath))}" alt="${escapeHtml(label)}" class="monster-type-icon" loading="lazy" decoding="async" fetchpriority="low" onerror="this.style.display='none'" />
    <span class="monster-type-text">${escapeHtml(label)}</span>
  </span>`;
}

async function loadMonsterDetailDataCsv() {
  const lines = await fetchCsvLines(MONSTER_DETAIL_DATA_CSV_PATH);
  if (lines.length <= 1) return [];
  const headers = parseCsvLine(lines[0]);
  const idx = {
    id: findHeaderIndex(headers, ["monster_id", "id"]),
    name: findHeaderIndex(headers, ["monster_name", "name", "monster"]),
    type: findHeaderIndex(headers, ["monster_type", "type"]),
    exp: findHeaderIndex(headers, ["exp", "experience"]),
    gold: findHeaderIndex(headers, ["gold"]),
    normalDrop: findHeaderIndex(headers, ["normal_drop", "drop_normal"]),
    rareDrop: findHeaderIndex(headers, ["rare_drop", "drop_rare"]),
    whiteBox: findHeaderIndex(headers, ["white_box", "whitebox"]),
    orbs: findHeaderIndex(headers, ["orbs", "orb"]),
    habitats: findHeaderIndex(headers, ["habitats", "habitat"]),
  };
  return lines.slice(1).map((line, index) => {
    const row = parseCsvLine(line);
    const name = row[idx.name] || "";
    const habitats = parsePipeList(row[idx.habitats]);
    return {
      id: row[idx.id] || `monster:${index}:${name}`,
      name,
      type: row[idx.type] || "不明",
      exp: row[idx.exp] || "-",
      gold: row[idx.gold] || "-",
      normalDrop: row[idx.normalDrop] || "-",
      rareDrop: row[idx.rareDrop] || "-",
      whiteBoxList: parsePipeList(row[idx.whiteBox]),
      orbList: parsePipeList(row[idx.orbs]),
      habitats,
      searchText: [name, row[idx.normalDrop], row[idx.rareDrop], habitats.join(" "), row[idx.type]].join(" ").toLowerCase(),
    };
  }).filter((row) => row.name);
}

async function loadMapMasterCsv() {
  const lines = await fetchCsvLines(MAP_MASTER_CSV_PATH);
  const byName = new Map();
  if (lines.length <= 1) return byName;
  const headers = parseCsvLine(lines[0]);
  const mapNameIndex = findHeaderIndex(headers, ["map_name", "name"]);
  const verIndex = findHeaderIndex(headers, ["unlock_version", "version"]);
  const groupIndex = findHeaderIndex(headers, ["area_group", "area"]);
  for (const line of lines.slice(1)) {
    const row = parseCsvLine(line);
    const mapName = String(row[mapNameIndex] || "").trim();
    if (!mapName) continue;
    byName.set(mapName, { version: String(row[verIndex] || "").trim(), areaGroup: String(row[groupIndex] || "").trim() });
  }
  return byName;
}

async function ensureMonsterInfoDataLoaded() {
  if (hasLoadedMonsterInfoData || isMonsterInfoDataLoading) return monsterInfoDataLoadingPromise;
  isMonsterInfoDataLoading = true;
  monsterInfoDataLoadingPromise = (async () => {
    try {
      monsterDetailEntries = await loadMonsterDetailDataCsv();
      rebuildMonsterInfoLookupMaps();
      hasLoadedMonsterInfoData = true;
      monsterInfoLoadError = false;
      try {
        mapMasterByName = await loadMapMasterCsv();
      } catch (error) {
        console.warn(`map_master.csv の読み込みに失敗しました: path=${MAP_MASTER_CSV_PATH}`, error);
        mapMasterByName = new Map();
      }
    } catch (error) {
      console.error(`monster_detail_data.csv の読み込みに失敗しました: path=${MONSTER_DETAIL_DATA_CSV_PATH}`, error);
      monsterDetailEntries = [];
      rebuildMonsterInfoLookupMaps();
      mapMasterByName = new Map();
      monsterInfoLoadError = true;
    } finally {
      isMonsterInfoDataLoading = false;
      if (activeTabId === "monster-info") renderMonsterInfoCards();
    }
  })();
  return monsterInfoDataLoadingPromise;
}

function prefetchDataForTab(tabId) {
  if (tabId === "profit") {
    void ensureBazaarPricesLoaded();
    return;
  }
  if (tabId === "routine") {
    void ensureRoutineTasksLoaded();
    return;
  }
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
  if (tabId === "monster-info") {
    void ensureBazaarPricesLoaded();
    void ensureMonsterInfoDataLoaded();
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

function getFilteredMonsterDetailEntries() {
  const keyword = normalizeSearchKeyword(monsterInfoSearchKeyword);
  return monsterDetailEntries.filter((entry) => {
    if (!keyword && selectedMonsterInfoType && entry.type !== selectedMonsterInfoType) return false;
    if (!keyword) return true;
    return entry.searchText.includes(keyword);
  });
}

function getMonsterInfoSortPrice(itemName) {
  const normalizedItemName = normalizeMaterialNameKey(itemName);
  if (normalizedItemName === "" || normalizedItemName === "-") return 0;
  const matchedRow = bazaarRowByMaterialName.get(normalizedItemName);
  if (!matchedRow || !isMonitoringByComment(matchedRow.comment)) return 0;
  const price = getPreferredBazaarUnitPrice(matchedRow);
  return Number.isFinite(price) ? price : 0;
}

function getMonsterExpValue(entry) {
  const raw = String(entry?.exp || "").replace(/,/g, "").trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSortedMonsterDetailEntries(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (selectedMonsterInfoSort === "exp_asc") {
      return getMonsterExpValue(a) - getMonsterExpValue(b);
    }
    if (selectedMonsterInfoSort === "exp_desc") {
      return getMonsterExpValue(b) - getMonsterExpValue(a);
    }
    if (selectedMonsterInfoSort === "normal_drop_price_desc") {
      return getMonsterInfoSortPrice(b?.normalDrop) - getMonsterInfoSortPrice(a?.normalDrop);
    }
    if (selectedMonsterInfoSort === "rare_drop_price_desc") {
      return getMonsterInfoSortPrice(b?.rareDrop) - getMonsterInfoSortPrice(a?.rareDrop);
    }
    return 0;
  });
  return sorted;
}

function getDefaultMonsterInfoType() {
  const detectedTypes = Array.from(new Set(monsterDetailEntries.map((entry) => entry.type).filter(Boolean)));
  const priorityTypes = MONSTER_TYPE_ORDER.filter((type) => detectedTypes.includes(type));
  const trailingTypes = detectedTypes
    .filter((type) => !MONSTER_TYPE_ORDER.includes(type))
    .sort((a, b) => a.localeCompare(b, "ja"));
  const types = [...priorityTypes, ...trailingTypes];
  return types.includes("スライム系") ? "スライム系" : types[0] || "";
}

function updateMonsterInfoClearButtonVisibility() {
  if (!monsterInfoClearFiltersButton) return;
  const hasActiveSearch = String(monsterInfoSearchKeyword || "").trim() !== "";
  const defaultType = getDefaultMonsterInfoType();
  const hasActiveType = String(selectedMonsterInfoType || "") !== "" && String(selectedMonsterInfoType || "") !== defaultType;
  const hasActiveSort = selectedMonsterInfoSort !== "exp_asc";
  monsterInfoClearFiltersButton.hidden = !(hasActiveSearch || hasActiveType || hasActiveSort);
}

function clearMonsterInfoFilters() {
  closeMonsterInfoModal();
  monsterInfoSearchKeyword = "";
  selectedMonsterInfoType = "";
  selectedMonsterInfoSort = "exp_asc";
  activeMonsterInfoId = "";
  keepMonsterInfoTypeCleared = false;
  syncMonsterInfoUrl("", { replace: true });
  renderMonsterInfoCards();
}

function renderMonsterInfoCards() {
  if (!monsterInfoListWrap || !monsterInfoTypeFilterSelect) return;
  if (monsterInfoSortSelect && monsterInfoSortSelect.value !== selectedMonsterInfoSort) {
    monsterInfoSortSelect.value = selectedMonsterInfoSort;
  }
  if (isMonsterInfoDataLoading && !hasLoadedMonsterInfoData) {
    renderMonsterInfoLinkDirectory();
    monsterInfoListWrap.innerHTML = `<p class="card">読み込み中です。しばらくお待ちください。</p>`;
    return;
  }
  if (!monsterDetailEntries.length) {
    renderMonsterInfoLinkDirectory();
    monsterInfoListWrap.innerHTML = monsterInfoLoadError ? `<p class="card">モンスターデータを読み込めませんでした。</p>` : `<p class="card">表示できるデータがありません。</p>`;
    return;
  }
  const detectedTypes = Array.from(new Set(monsterDetailEntries.map((entry) => entry.type).filter(Boolean)));
  const priorityTypes = MONSTER_TYPE_ORDER.filter((type) => detectedTypes.includes(type));
  const trailingTypes = detectedTypes
    .filter((type) => !MONSTER_TYPE_ORDER.includes(type))
    .sort((a, b) => a.localeCompare(b, "ja"));
  const types = [...priorityTypes, ...trailingTypes];
  if (selectedMonsterInfoType && !types.includes(selectedMonsterInfoType)) selectedMonsterInfoType = "";
  if (!keepMonsterInfoTypeCleared && selectedMonsterInfoType === "" && String(monsterInfoSearchKeyword || "").trim() === "") {
    selectedMonsterInfoType = getDefaultMonsterInfoType();
  }
  monsterInfoTypeFilterSelect.innerHTML = `<option value="">すべて</option>${types.map((type) => `<option value="${escapeHtml(type)}" ${selectedMonsterInfoType === type ? "selected" : ""}>${escapeHtml(type)}</option>`).join("")}`;
  updateMonsterInfoClearButtonVisibility();
  renderMonsterInfoLinkDirectory();
  const filtered = getSortedMonsterDetailEntries(getFilteredMonsterDetailEntries());
  if (!filtered.length) {
    monsterInfoListWrap.innerHTML = `<p class="card monster-info-empty">該当するモンスターが見つかりませんでした。</p>`;
    decorateMemoAddButtons(monsterInfoListWrap);
    updateDocumentMetadata();
    return;
  }
  monsterInfoListWrap.innerHTML = `<div class="monster-info-grid">${filtered.map((entry) => {
    const firstHabitat = entry.habitats[0] || "-";
    const remain = Math.max(entry.habitats.length - 1, 0);
    const monsterThemeClass = getMonsterTypeThemeClass(entry.type);
    return `<article class="card monster-info-card monster-info-card-theme-${monsterThemeClass}" data-monster-type="${escapeHtml(normalizeMonsterTypeLabel(entry.type))}">
      <div class="monster-info-card-toggle" role="button" tabindex="0" data-monster-info-id="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.name)}の詳細を開く">
        <div class="monster-info-title-area">
          <h3 class="monster-info-name">${escapeHtml(entry.name)}</h3>
        </div>
        <p class="monster-info-line">${buildMonsterTypeLabelHtml(entry.type)}</p>
        <p>経験値：${escapeHtml(entry.exp)}</p>
        <div class="monster-drop-normal">${buildMonsterDropHtml("通常", entry.normalDrop)}</div>
        <div class="monster-drop-rare">${buildMonsterDropHtml("レア", entry.rareDrop)}</div>
        <p class="monster-info-habitat">生息地：${escapeHtml(firstHabitat)}</p>
        ${remain > 0 ? `<p class="monster-info-more">ほか${remain}件</p>` : ""}
      </div>
      <button type="button" class="memo-add-button monster-info-card-memo-button" data-memo-monster-id="${escapeHtml(entry.id)}">＋メモ</button>
    </article>`;
  }).join("")}</div>`;
  if (pendingMonsterInfoFocusName !== "") {
    const normalizedName = String(pendingMonsterInfoFocusName || "").trim();
    const targetEntry =
      monsterDetailEntryByName.get(normalizedName) ||
      (monsterDetailEntries || []).find((entry) => String(entry?.name || "").includes(normalizedName));
    if (targetEntry?.id) {
      const focusTarget = Array.from(monsterInfoListWrap.querySelectorAll("[data-monster-info-id]")).find(
        (element) => String(element.dataset.monsterInfoId || "") === String(targetEntry.id)
      );
      focusTarget?.closest(".monster-info-card")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    pendingMonsterInfoFocusName = "";
  }
  if (pendingMonsterInfoAutoOpenName !== "") {
    const normalizedName = String(pendingMonsterInfoAutoOpenName || "").trim();
    const targetEntry =
      monsterDetailEntryByName.get(normalizedName) ||
      (monsterDetailEntries || []).find((entry) => String(entry?.name || "").includes(normalizedName));
    pendingMonsterInfoAutoOpenName = "";
    if (targetEntry?.id && activeMonsterInfoId !== String(targetEntry.id || "")) {
      openMonsterInfoDetailModal(targetEntry);
    }
  }
  decorateMemoAddButtons(monsterInfoListWrap);
  updateDocumentMetadata();
}

function renderMonsterInfoLinkDirectory() {
  if (!monsterInfoLinkDirectory || !monsterInfoLinkDirectorySummary || !monsterInfoLinkDirectoryList) return;
  if (isMonsterInfoDataLoading && !hasLoadedMonsterInfoData) {
    monsterInfoLinkDirectory.hidden = true;
    monsterInfoLinkDirectoryList.innerHTML = "";
    return;
  }
  const names = Array.from(
    new Set(
      (monsterDetailEntries || [])
        .map((entry) => String(entry?.name || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "ja"));
  if (!names.length) {
    monsterInfoLinkDirectory.hidden = true;
    monsterInfoLinkDirectoryList.innerHTML = "";
    return;
  }
  monsterInfoLinkDirectory.hidden = false;
  monsterInfoLinkDirectorySummary.textContent = `モンスター個別リンク一覧（${names.length}件）`;
  monsterInfoLinkDirectoryList.innerHTML = names
    .map((name) => `<a class="monster-link-directory-item" href="${escapeHtml(getMonsterShareUrl(name))}">${escapeHtml(name)}</a>`)
    .join("");
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
    whiteBoxListWrap.innerHTML = `<p class="card">読み込み中です。しばらくお待ちください。</p>`;
    return;
  }
  if (!Array.isArray(whiteBoxEntries) || whiteBoxEntries.length === 0) {
    whiteBoxListWrap.innerHTML = whiteBoxLoadError
      ? `<p class="card">データを読み込めませんでした。<br>時間をおいて再度お試しください。</p>`
      : `<p class="card">現在表示できるデータがありません。</p>`;
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
  if (selectedWhiteBoxSlot === "") {
    selectedWhiteBoxSlot = slots.find((slot) => isOneHandSwordCategory(slot)) || "";
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
          ? `<p class="card whitebox-empty">条件に一致するデータが見つかりませんでした。<br>検索条件を変えてお試しください。</p>`
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

function getEquipmentDbAvailableTypes(group = selectedEquipmentDbGroup) {
  return Array.from(
    new Set(
      (equipmentDbEntries || [])
        .filter((entry) => String(entry.equipmentGroup || "weapon") === group)
        .map((entry) => String(entry.equipmentType || "").trim())
        .filter((type) => type !== "")
    )
  ).sort((a, b) => a.localeCompare(b, "ja"));
}

function getDefaultEquipmentDbType(group = selectedEquipmentDbGroup) {
  if (group === "armor") return "";
  const types = getEquipmentDbAvailableTypes(group);
  return types.find((type) => isOneHandSwordCategory(type)) || "";
}

function updateEquipmentDbClearButtonVisibility() {
  if (!equipmentDbClearFiltersButton) return;
  const hasNameSearch = String(equipmentDbNameKeyword || "").trim() !== "";
  const hasMonsterSearch = String(equipmentDbMonsterKeyword || "").trim() !== "";
  const hasSortFilter = selectedEquipmentDbSort !== "level_desc";
  const hasTypeFilter = isEquipmentDbTypeExplicitAll || String(selectedEquipmentDbType || "") !== getDefaultEquipmentDbType(selectedEquipmentDbGroup);
  equipmentDbClearFiltersButton.hidden = !(hasNameSearch || hasMonsterSearch || hasSortFilter || hasTypeFilter);
}

function clearEquipmentDbFilters() {
  closeArmorSetDetailModal();
  selectedEquipmentDbGroup = "weapon";
  selectedEquipmentDbSort = "level_desc";
  selectedEquipmentDbType = "";
  isEquipmentDbTypeExplicitAll = false;
  equipmentDbNameKeyword = "";
  equipmentDbMonsterKeyword = "";
  expandedEquipmentDbId = "";
  navigateByFeatureRoute({
    tab: "equipment-db",
    equipmentId: "",
    materialKey: "",
    equipmentSearch: "",
    orbSearch: "",
    monsterSearch: "",
    equipmentDbGroup: selectedEquipmentDbGroup,
  });
  renderEquipmentDbCards();
}

function getFilteredEquipmentDbEntries() {
  const normalizedKeyword = String(equipmentDbNameKeyword || "").trim().toLowerCase();
  const normalizedMonsterKeyword = String(equipmentDbMonsterKeyword || "").trim().toLowerCase();
  const hasCrossSearch = normalizedKeyword !== "" || normalizedMonsterKeyword !== "";
  return (equipmentDbEntries || [])
    .filter((entry) => (hasCrossSearch ? true : String(entry.equipmentGroup || "weapon") === selectedEquipmentDbGroup))
    .filter((entry) => (hasCrossSearch || selectedEquipmentDbType === "" ? true : String(entry.equipmentType || "") === selectedEquipmentDbType))
    .filter((entry) => {
      if (normalizedKeyword === "") return true;
      const equipmentName = String(entry.equipmentName || "").toLowerCase();
      if (equipmentName.includes(normalizedKeyword)) return true;
      if (!isArmorSetEntry(entry)) return false;
      return getArmorSetPartsFromRecipes(entry.equipmentName).some((part) => isArmorSetPartMatchedByKeyword(part, normalizedKeyword));
    })
    .filter((entry) => {
      if (normalizedMonsterKeyword === "") return true;
      return (Array.isArray(entry.whiteBoxMonsterNames) ? entry.whiteBoxMonsterNames : []).some((monsterName) =>
        String(monsterName || "").toLowerCase().includes(normalizedMonsterKeyword)
      );
    })
    .sort(compareEquipmentDbEntries);
}

function findEquipmentDbEntryByDirectName(equipmentName) {
  const normalizedName = String(equipmentName || "").trim();
  if (normalizedName === "") return null;
  const exactEntry = equipmentDbEntryByName.get(normalizedName);
  if (exactEntry) return exactEntry;
  const directNameEntry = (equipmentDbEntries || []).find((entry) => String(entry?.equipmentName || "").includes(normalizedName));
  if (directNameEntry) return directNameEntry;
  return (
    (equipmentDbEntries || []).find(
      (entry) =>
        isArmorSetEntry(entry) &&
        getArmorSetPartsFromRecipes(entry.equipmentName).some((part) => String(part?.name || "").includes(normalizedName))
    ) || null
  );
}

function resetEquipmentDbTypeToDefaultIfNeeded() {
  if (selectedEquipmentDbGroup === "armor") {
    selectedEquipmentDbType = "";
    isEquipmentDbTypeExplicitAll = false;
    return;
  }
  if (selectedEquipmentDbType === "" && !isEquipmentDbTypeExplicitAll) {
    selectedEquipmentDbType = getDefaultEquipmentDbType(selectedEquipmentDbGroup);
  }
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

function getEquipmentDbStatsMemoLines(entry) {
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
  return statDefinitions
    .map((definition) => {
      const value = entry?.[definition.key];
      if (!Number.isFinite(value) || Number(value) === 0) return "";
      const displayValue = definition.isRate ? formatEquipmentDbGuardRate(value) : value;
      return `${definition.label} ${displayValue}`;
    })
    .filter(Boolean);
}

function createMonsterMemoEntry(entry) {
  return createMemoEntry("モンスター", entry?.name, [
    { label: "通常ドロップ", value: entry?.normalDrop },
    { label: "レアドロップ", value: entry?.rareDrop },
    { label: "白宝箱", value: entry?.whiteBoxList },
    { label: "宝珠", value: entry?.orbList },
    { label: "生息地", value: entry?.habitats },
  ]);
}

function createOrbMemoEntry(row) {
  return createMemoEntry("宝珠", row?.orbName, [
    { label: "属性", value: normalizeOrbCategoryName(row?.orbCategory) || row?.orbCategory },
    { label: "効果", value: row?.effect },
    { label: "ドロップモンスター", value: row?.monsterNames },
  ]);
}

function createEquipmentMemoEntry(entry) {
  const stats = getEquipmentDbStatsMemoLines(entry);
  const traits = getMeaningfulEquipmentTraits(entry);
  return createMemoEntry("装備", entry?.equipmentName, [
    { label: "装備ジャンル", value: entry?.equipmentType },
    { label: "装備レベル", value: Number.isFinite(entry?.equipmentLevel) ? `Lv${entry.equipmentLevel}` : "" },
    { label: "主要ステータス", value: stats },
    { label: "特性", value: traits },
    { label: "白宝箱ドロップモンスター", value: entry?.whiteBoxMonsterNames },
  ]);
}

function createArmorSetMemoEntry(entry) {
  const parts = getArmorSetPartsWithEstimatedCost(entry?.equipmentName || "");
  const stats = getEquipmentDbStatsMemoLines(entry);
  const traits = getMeaningfulEquipmentTraits(entry);
  const whiteBoxMonsterNames = Array.isArray(entry?.whiteBoxArmorDropsBySlot)
    ? entry.whiteBoxArmorDropsBySlot.flatMap((slotEntry) => slotEntry.items.flatMap((item) => item.monsterNames || []))
    : [];
  return createMemoEntry("防具セット", entry?.equipmentName, [
    { label: "装備レベル", value: Number.isFinite(entry?.equipmentLevel) ? `Lv${entry.equipmentLevel}` : "" },
    { label: "各部位", value: parts.map((part) => `${part.part}: ${part.name}`) },
    { label: "上昇能力値", value: stats },
    { label: "セット効果/特性", value: traits },
    { label: "白宝箱ドロップモンスター", value: Array.from(new Set(whiteBoxMonsterNames)) },
  ]);
}

function createBazaarMemoEntry(row) {
  const updatedAt = formatBazaarUpdatedAt(row?.updatedAt);
  return createMemoEntry("バザー", row?.materialName, [
    {
      label: "現在価格",
      value:
        row && row.displayPrice !== null && row.displayPrice !== undefined && formatBazaarPriceWithUnit(row.displayPrice) !== "-"
          ? formatBazaarPriceWithUnit(row.displayPrice)
          : "価格なし",
    },
    { label: "更新日時", value: updatedAt !== "-" ? updatedAt : "" },
  ]);
}

function createCraftAssistMemoEntry() {
  const equipment = getSelectedEquipment();
  if (!equipment) return null;
  const rows = getRecipeRowsForSelectedEquipment();
  const productionCount = getProductionCountForCalculation();
  const totalMaterialCost = rows.reduce((sum, row) => {
    const price = getEffectiveMaterialPrice(row.materialId);
    return sum + (Number.isFinite(price) ? price : 0) * row.quantity * productionCount;
  }, 0);
  const materialLines = rows.map((row) => {
    const material = state.materials.find((item) => item.id === row.materialId);
    const price = getEffectiveMaterialPrice(row.materialId);
    const safePrice = Number.isFinite(price) ? price : 0;
    const totalRequired = row.quantity * productionCount;
    const subtotal = safePrice * totalRequired;
    return `${material?.name ?? "(削除済み素材)"} x${totalRequired} 単価${formatGold(safePrice)} 小計${formatGold(subtotal)}`;
  });
  const idealValue = getCraftIdealValueForSelectedEquipment();
  const idealValueText = idealValue
    ? `★3誤差 0〜${idealValue.star3Tolerance} / ${idealValue.cells.filter((cell) => normalizeMemoValue(cell) !== "").join(" / ")}`
    : "";
  return createMemoEntry("職人アシスト", `${equipment.name} ×${productionCount}`, [
    { label: "装備名", value: equipment.name },
    { label: "制作数", value: `${productionCount}` },
    { label: "必要素材一覧", value: materialLines.length > 0 ? materialLines : "必要素材なし" },
    { label: "合計原価", value: formatGold(totalMaterialCost) },
    { label: "基準値", value: idealValueText },
  ]);
}

function buildEquipmentDbCollapsedTraitSummaryHtml(entry) {
  const traits = getMeaningfulEquipmentTraits(entry);
  if (traits.length === 0) return `<p class="equipment-db-trait-empty equipment-db-trait-empty-collapsed">セット効果なし</p>`;
  const visibleTraits = traits.slice(0, 3);
  const remainingCount = traits.length - visibleTraits.length;
  return `<ul class="equipment-db-traits-list equipment-db-traits-list-collapsed">
    ${visibleTraits.map((trait) => `<li>${escapeHtml(trait)}</li>`).join("")}
    ${remainingCount > 0 ? `<li>ほか${remainingCount}件</li>` : ""}
  </ul>`;
}

function findEquipmentDbEntryById(entryId) {
  const normalizedEntryId = String(entryId || "");
  return equipmentDbEntryById.get(normalizedEntryId) || null;
}

function openArmorSetDetailModal(entry) {
  if (!entry || !armorSetDetailModalOverlay || !armorSetDetailModalBody) return;
  activeArmorSetDetailId = String(entry.id || "");
  armorSetDetailModalBody.innerHTML = buildArmorSetDetailModalHtml(entry);
  decorateMemoAddButtons(armorSetDetailModalBody);
  armorSetDetailModalOverlay.hidden = false;
  armorSetDetailModalDialog.scrollTop = 0;
  armorSetDetailModalBody.scrollTop = 0;
  window.requestAnimationFrame(() => {
    armorSetDetailModalDialog.scrollTop = 0;
    armorSetDetailModalBody.scrollTop = 0;
  });
  armorSetDetailModalDialog?.focus();
  updateDocumentMetadata();
}

function openMonsterInfoDetailModal(entry) {
  if (!entry || !monsterInfoModalOverlay || !monsterInfoModalBody) return;
  activeMonsterInfoId = String(entry.id || "");
  const habitatsHtml = entry.habitats
    .map((name) => {
      const meta = mapMasterByName.get(name);
      const version = formatMonsterHabitatVersion(meta?.version);
      const area = meta?.areaGroup ? escapeHtml(meta.areaGroup) : "";
      return `<li><strong>${escapeHtml(name)}</strong><br>${escapeHtml(version)}${area ? ` / ${area}` : ""}</li>`;
    })
    .join("");
  monsterInfoModalBody.innerHTML = `<div class="memo-target-header">
        <h3>${escapeHtml(entry.name)}</h3>
        <button type="button" class="memo-add-button" data-memo-monster-id="${escapeHtml(entry.id)}">＋メモ</button>
      </div>
      <p class="monster-info-modal-type monster-info-modal-type-${escapeHtml(getMonsterTypeThemeClass(entry.type))}">${buildMonsterTypeLabelHtml(entry.type)}</p>
      <p>経験値：${escapeHtml(entry.exp)} / ゴールド：${escapeHtml(entry.gold)}</p>
      <div class="monster-drop-normal">${buildMonsterDropHtml("通常ドロップ", entry.normalDrop, { modal: true })}</div>
      <div class="monster-drop-rare">${buildMonsterDropHtml("レアドロップ", entry.rareDrop, { modal: true })}</div>
      <div><p>白宝箱</p><div class="monster-info-chip-list">${buildMonsterWhiteBoxLinksHtml(entry.whiteBoxList)}</div></div>
      <div><p>宝珠 / オーブ</p><div class="monster-info-chip-list">${buildMonsterOrbLinksHtml(entry.orbList)}</div></div>
      <div><p>生息地</p><ul class="monster-info-habitat-list">${habitatsHtml || "<li>なし</li>"}</ul></div>
      <div class="monster-info-modal-footer-actions">
        <button type="button" class="monster-info-share-link" data-monster-share-name="${escapeHtml(entry.name)}">このモンスターのリンクをコピー</button>
      </div>
      ${buildIndividualPageActionLink("個別ページを開く", getMonsterIndividualPageUrl(entry.name))}`;
  decorateMemoAddButtons(monsterInfoModalBody);
  monsterInfoModalOverlay.hidden = false;
  monsterInfoModalDialog.scrollTop = 0;
  monsterInfoModalBody.scrollTop = 0;
  window.requestAnimationFrame(() => {
    monsterInfoModalDialog.scrollTop = 0;
    monsterInfoModalBody.scrollTop = 0;
  });
  monsterInfoModalDialog?.focus();
  updateDocumentMetadata();
}

async function copyMonsterShareUrl(monsterName) {
  const normalizedName = String(monsterName || "").trim();
  if (!normalizedName) return;
  const shareUrl = getMonsterShareUrl(normalizedName);
  if (!navigator.clipboard?.writeText) {
    showMemoToast("リンクをコピーできませんでした");
    return;
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    showMemoToast("リンクをコピーしました");
  } catch (error) {
    showMemoToast("リンクをコピーできませんでした");
  }
}

function activateEquipmentDbCard(entryId) {
  const targetEntry = findEquipmentDbEntryById(entryId);
  if (!targetEntry) return;
  syncEquipmentUrl(String(targetEntry.equipmentName || "").trim());
  if (isArmorSetEntry(targetEntry)) {
    openArmorSetDetailModal(targetEntry);
    return;
  }
  expandedEquipmentDbId = expandedEquipmentDbId === entryId ? "" : entryId;
  renderEquipmentDbCards();
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
    equipmentDbListWrap.innerHTML = `<p class="card">読み込み中です。しばらくお待ちください。</p>`;
    return;
  }
  if (!Array.isArray(equipmentDbEntries) || equipmentDbEntries.length === 0) {
    if (equipmentDbTypeFilterField) {
      equipmentDbTypeFilterField.hidden = selectedEquipmentDbGroup === "armor";
    }
    equipmentDbTypeFilterSelect.disabled = selectedEquipmentDbGroup === "armor";
    equipmentDbListWrap.innerHTML = equipmentDbLoadError
      ? `<p class="card">データを読み込めませんでした。<br>時間をおいて再度お試しください。</p>`
      : `<p class="card">現在表示できるデータがありません。</p>`;
    equipmentDbTypeFilterSelect.innerHTML = `<option value="">すべて</option>`;
    return;
  }

  const isArmorGroup = selectedEquipmentDbGroup === "armor";
  const types = isArmorGroup ? [] : getEquipmentDbAvailableTypes(selectedEquipmentDbGroup);

  if (isArmorGroup || (selectedEquipmentDbType !== "" && !types.includes(selectedEquipmentDbType))) {
    selectedEquipmentDbType = "";
    isEquipmentDbTypeExplicitAll = false;
  }
  resetEquipmentDbTypeToDefaultIfNeeded();
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
  updateEquipmentDbClearButtonVisibility();

  const filteredEntries = getFilteredEquipmentDbEntries();
  equipmentDbListWrap.innerHTML = `
    <div class="equipment-db-card-grid">
      ${
        filteredEntries.length === 0
          ? `<p class="card equipment-db-empty">条件に一致するデータが見つかりませんでした。<br>検索条件を変えてお試しください。</p>`
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
                const collapsedTraitsHtml = isArmorSet ? buildEquipmentDbCollapsedTraitSummaryHtml(entry) : "";

                const traitsHtml =
                  getMeaningfulEquipmentTraits(entry).length > 0
                    ? `<ul class="equipment-db-traits-list">${getMeaningfulEquipmentTraits(entry).map((trait) => `<li>${escapeHtml(trait)}</li>`).join("")}</ul>`
                    : `<p class="equipment-db-trait-empty">セット効果なし</p>`;
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
                      <p class="equipment-db-traits-title">部位</p>
                      ${buildArmorSetPartsHtml(entry.equipmentName, {
                        highlightKeyword: equipmentDbNameKeyword,
                        showMatchedBadge: selectedEquipmentDbGroup === "armor" && equipmentDbNameKeyword.trim() !== "",
                      })}
                    </div>`
                  : "";
                const armorSetPartsHtml = "";
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
                                    `<li><span class="equipment-db-armor-item-name">${escapeHtml(item.itemName)}</span><br>${buildEquipmentDbMonsterLinksHtml(item.monsterNames)}</li>`
                                )
                                .join("")}
                            </ul>
                          </section>`
                        )
                        .join("")}</div>`
                    : `<p class="equipment-db-trait-empty">白宝箱ドロップなし</p>`;
                const weaponWhiteBoxDropHtml =
                  entry.whiteBoxHasDrop && entry.whiteBoxMonsterNames.length > 0
                    ? `<ul class="equipment-db-traits-list">${entry.whiteBoxMonsterNames.map((monsterName) => `<li>${buildEquipmentDbMonsterLinkHtml(monsterName)}</li>`).join("")}</ul>`
                    : `<p class="equipment-db-trait-empty">白宝箱ドロップなし</p>`;
                const profitEquipmentId = resolveProfitEquipmentIdFromParams({
                  equipmentName: entry?.equipmentName,
                  equipmentType: entry?.equipmentType,
                });
                const estimatedCostText = formatEstimatedMaterialCostText(profitEquipmentId);
                return `
                  <article class="card equipment-db-card equipment-db-card-${isArmor ? "armor" : "weapon"} ${isExpanded ? "is-expanded" : ""}">
                    <div class="equipment-db-card-toggle" role="button" tabindex="0" data-equipment-db-id="${entry.id}" aria-expanded="${isExpanded ? "true" : "false"}">
                      <h3 class="equipment-db-card-name">${entry.equipmentName}</h3>
                      ${isArmor ? "" : `<p class="equipment-db-card-meta">${typeMetaText}</p>`}
                      <div class="equipment-db-card-meta-row">
                        <p class="equipment-db-card-meta">${levelText}</p>
                        ${isArmor ? "" : `<button type="button" class="equipment-db-open-profit-button" data-equipment-db-open-profit="${entry.id}">職人アシスト</button>`}
                      </div>
                      ${!isArmor && stats.length > 0 ? `<ul class="equipment-db-stats-list">${stats.join("")}</ul>` : ""}
                      ${collapsedTraitsHtml}
                    </div>
                    ${isArmorSet ? "" : `<div class="equipment-db-card-actions">
                      <p class="equipment-db-material-cost">推定原価: ${estimatedCostText}</p>
                    </div>`}
                    <div class="equipment-db-card-traits ${isExpanded ? "is-open" : ""}" ${isExpanded ? "" : "hidden"}>
                      ${!isArmorSet ? `<button type="button" class="memo-add-button equipment-db-memo-button" data-memo-equipment-id="${escapeHtml(entry.id)}">＋メモ</button>` : ""}
                      ${armorSetTypeMetaHtml}
                      ${armorStatsHtml}
                      ${armorSetPartsHtml}
                      ${isArmor ? "" : `<p class="equipment-db-traits-title">特性</p>${traitsHtml}`}
                      <div class="equipment-db-detail-section">
                        <p class="equipment-db-traits-title">白宝箱ドロップモンスター</p>
                        ${isArmor ? armorWhiteBoxDropHtml : weaponWhiteBoxDropHtml}
                      </div>
                      ${buildIndividualPageActionLink("個別ページを開く", getEquipmentIndividualPageUrl(entry.equipmentName))}
                    </div>
                  </article>
                `;
              })
              .join("")
      }
    </div>
  `;
  if (pendingEquipmentDbFocusName !== "") {
    const targetEntry = findEquipmentDbEntryByDirectName(pendingEquipmentDbFocusName);
    if (targetEntry?.id) {
      const focusTarget = Array.from(equipmentDbListWrap.querySelectorAll("[data-equipment-db-id]")).find(
        (element) => String(element.dataset.equipmentDbId || "") === String(targetEntry.id)
      );
      focusTarget?.closest(".equipment-db-card")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    pendingEquipmentDbFocusName = "";
  }
  if (pendingEquipmentDbAutoOpenName !== "") {
    const targetEntry = findEquipmentDbEntryByDirectName(pendingEquipmentDbAutoOpenName);
    pendingEquipmentDbAutoOpenName = "";
    if (targetEntry?.id) {
      if (isArmorSetEntry(targetEntry)) {
        openArmorSetDetailModal(targetEntry);
      } else if (expandedEquipmentDbId !== String(targetEntry.id || "")) {
        expandedEquipmentDbId = String(targetEntry.id || "");
        renderEquipmentDbCards();
        return;
      }
    }
  }

  decorateMemoAddButtons(equipmentDbListWrap);
  updateDocumentMetadata();
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

function getBazaarHistoryMonthKeys(materialKey) {
  const history = bazaarPriceHistoryByMaterialKey.get(materialKey) || [];
  const monthKeys = new Set();
  history.forEach((point) => {
    const dateText = String(point?.date || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
      monthKeys.add(dateText.slice(0, 7));
    }
  });
  return Array.from(monthKeys).sort((a, b) => a.localeCompare(b, "ja"));
}

function getLatestBazaarHistoryMonthKey(materialKey) {
  const monthKeys = getBazaarHistoryMonthKeys(materialKey);
  return monthKeys.length > 0 ? monthKeys[monthKeys.length - 1] : "";
}

function getBazaarHistoryForMonth(materialKey, monthKey) {
  const normalizedMonthKey = String(monthKey || "").trim();
  const history = bazaarPriceHistoryByMaterialKey.get(materialKey) || [];
  if (normalizedMonthKey === "") return history;
  return history.filter((point) => String(point?.date || "").startsWith(`${normalizedMonthKey}-`));
}

function formatBazaarHistoryMonthLabel(monthKey) {
  const normalized = String(monthKey || "").trim();
  if (!/^\d{4}-\d{2}$/.test(normalized)) return "-";
  const [year, month] = normalized.split("-");
  return `${year}年${Number(month)}月`;
}

function shiftBazaarHistoryMonthKey(monthKey, diff) {
  const normalized = String(monthKey || "").trim();
  if (!/^\d{4}-\d{2}$/.test(normalized)) return "";
  const [yearText, monthText] = normalized.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return "";
  const shifted = new Date(year, month - 1 + diff, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

function getBazaarHistorySummary(history) {
  const prices = Array.isArray(history) ? history.map((point) => Number(point?.price)).filter((price) => Number.isFinite(price)) : [];
  if (prices.length === 0) {
    return { count: 0, average: null, min: null, max: null };
  }
  const total = prices.reduce((sum, price) => sum + price, 0);
  return {
    count: prices.length,
    average: total / prices.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
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
  const chartStroke = options.stroke || "#6b4122";
  const areaFill = options.areaFill || "rgba(183, 138, 85, 0.22)";
  const includeYAxisLabels = options.includeYAxisLabels !== false;
  const xAxisLabelCount = Math.max(1, Number(options.xAxisLabelCount) || 3);
  const yAxisTickCount = Math.max(2, Math.min(3, Number(options.yAxisTickCount) || 3));
  const referencePrice = Number(options.referencePrice);
  const hasReferencePrice = Number.isFinite(referencePrice);
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
  if (hasReferencePrice) prices.push(referencePrice);
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
  const referenceLineHtml = hasReferencePrice
    ? `<line
        x1="${paddingLeft}"
        y1="${yForPrice(referencePrice).toFixed(2)}"
        x2="${width - paddingRight}"
        y2="${yForPrice(referencePrice).toFixed(2)}"
        class="bazaar-mini-chart-reference-line"
      ></line>`
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
          return `<text x="${Math.max(paddingLeft - 4, 8)}" y="${y.toFixed(2)}" text-anchor="end" class="bazaar-mini-chart-axis-label ${className}">${formatBazaarChartPrice(price)} G</text>`;
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
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" class="bazaar-mini-chart-svg ${trendClass}" aria-hidden="true" focusable="false">
      <line x1="${paddingLeft}" y1="${topGridY}" x2="${width - paddingRight}" y2="${topGridY}" class="bazaar-mini-chart-grid-line is-edge"></line>
      <line x1="${paddingLeft}" y1="${middleGridY}" x2="${width - paddingRight}" y2="${middleGridY}" class="bazaar-mini-chart-grid-line"></line>
      <line x1="${paddingLeft}" y1="${bottomGridY}" x2="${width - paddingRight}" y2="${bottomGridY}" class="bazaar-mini-chart-grid-line is-edge"></line>
      ${referenceLineHtml}
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
  return getSortedBazaarRows(favoriteFilteredRows, selectedBazaarCategory, selectedBazaarSort);
}

function findBazaarRowByDirectName(itemName) {
  const normalizedName = normalizeMaterialNameKey(itemName);
  if (normalizedName === "") return null;
  return (
    bazaarRowByMaterialName.get(normalizedName) ||
    (bazaarPrices || []).find((row) => normalizeMaterialNameKey(row?.materialName).includes(normalizedName)) ||
    null
  );
}

function getVisibleBazaarPausedRows() {
  const normalizedKeyword = normalizeBazaarSearchText(bazaarSearchText);
  const keywordFilteredRows =
    normalizedKeyword === ""
      ? bazaarPrices
      : bazaarPrices.filter((row) => normalizeBazaarSearchText(row.materialName).includes(normalizedKeyword));
  const favoriteFilteredRows = showBazaarFavoritesOnly ? keywordFilteredRows.filter((row) => isBazaarFavoriteRow(row)) : keywordFilteredRows;
  const pausedRows = favoriteFilteredRows.filter((row) => isBazaarPausedByComment(row.comment));
  const categoryFilteredRows =
    selectedBazaarPausedCategory === "" ? pausedRows : pausedRows.filter((row) => row.itemCategory === selectedBazaarPausedCategory);
  return getSortedBazaarRows(categoryFilteredRows, selectedBazaarPausedCategory, "standard");
}

function queueBazaarUrlItemApplication(itemName) {
  const normalizedName = String(itemName || "").trim();
  if (normalizedName === "") {
    pendingBazaarUrlItemName = "";
    return;
  }
  pendingBazaarUrlItemName = normalizedName;
  selectedBazaarCategory = "";
  showBazaarFavoritesOnly = false;
  bazaarSearchText = normalizedName;
  selectedBazaarMaterialName = normalizedName;
  pendingBazaarFocusMaterialName = normalizedName;
  shouldRefocusBazaarSearchInput = false;
  pendingBazaarAutoOpenMaterialKey = "";
}

function applyPendingBazaarUrlItemIfNeeded() {
  const normalizedName = String(pendingBazaarUrlItemName || "").trim();
  if (normalizedName === "") return false;
  selectedBazaarCategory = "";
  showBazaarFavoritesOnly = false;
  bazaarSearchText = normalizedName;
  selectedBazaarMaterialName = normalizedName;
  pendingBazaarFocusMaterialName = normalizedName;
  pendingBazaarUrlItemName = "";
  return true;
}

function hasActiveBazaarFilters() {
  return (
    String(selectedBazaarCategory || "").trim() !== "" ||
    String(selectedBazaarSort || "").trim() !== "standard" ||
    String(bazaarSearchText || "").trim() !== "" ||
    showBazaarFavoritesOnly
  );
}

function clearBazaarFilters() {
  selectedBazaarCategory = "";
  selectedBazaarSort = "standard";
  bazaarSearchText = "";
  selectedBazaarMaterialName = "";
  showBazaarFavoritesOnly = false;
  pendingBazaarFocusMaterialKey = "";
  pendingBazaarFocusMaterialName = "";
  pendingBazaarAutoOpenMaterialKey = "";
  pendingBazaarUrlItemName = "";
  shouldRefocusBazaarSearchInput = false;
  syncBazaarItemUrl("", { replace: true });
  saveBazaarFavoriteState();
  renderBazaarPrices();
}

function renderBazaarPrices() {
  if (!bazaarListWrap) return;
  applyPendingBazaarUrlItemIfNeeded();
  if (isBazaarLoading && !hasLoadedBazaarPrices) {
    bazaarListWrap.innerHTML = `<p>読み込み中です。しばらくお待ちください。</p>`;
    return;
  }

  if (!Array.isArray(bazaarPrices) || bazaarPrices.length === 0) {
    bazaarListWrap.innerHTML = bazaarLoadError
      ? `<p>データを読み込めませんでした。<br>時間をおいて再度お試しください。</p>`
      : `<p>現在表示できるデータがありません。</p>`;
    return;
  }
  if (bazaarPageUpdatedAt) {
    bazaarPageUpdatedAt.textContent = getBazaarPageUpdatedAtLabel(bazaarPrices);
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

  if (pendingBazaarFocusMaterialName !== "") {
    const focusRow = findBazaarRowByDirectName(pendingBazaarFocusMaterialName);
    if (focusRow?.materialKey) {
      pendingBazaarFocusMaterialKey = String(focusRow.materialKey || "");
      pendingBazaarAutoOpenMaterialKey = String(focusRow.materialKey || "");
      if (isBazaarPausedByComment(focusRow.comment)) {
        isBazaarPausedSectionExpanded = true;
        selectedBazaarPausedCategory = "";
      }
    }
    pendingBazaarFocusMaterialName = "";
  }

  const visibleRows = getVisibleBazaarRows();
  const activeRows = visibleRows.filter((row) => !isBazaarPausedByComment(row.comment));
  const pausedCategorySet = new Set(
    bazaarPrices
      .filter((row) => isBazaarPausedByComment(row.comment))
      .map((row) => String(row.itemCategory || "").trim())
      .filter((category) => category !== "")
  );
  const pausedCategories = Array.from(pausedCategorySet).sort((a, b) => {
    const priorityDiff = getBazaarCategoryPriority(a) - getBazaarCategoryPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return a.localeCompare(b, "ja");
  });
  if (selectedBazaarPausedCategory !== "" && !pausedCategorySet.has(selectedBazaarPausedCategory)) {
    selectedBazaarPausedCategory = "";
  }
  const pausedRows = getVisibleBazaarPausedRows();
  const pausedRowsTotalCount = bazaarPrices.filter((row) => {
    if (!isBazaarPausedByComment(row.comment)) return false;
    const normalizedKeyword = normalizeBazaarSearchText(bazaarSearchText);
    if (normalizedKeyword !== "" && !normalizeBazaarSearchText(row.materialName).includes(normalizedKeyword)) return false;
    if (showBazaarFavoritesOnly && !isBazaarFavoriteRow(row)) return false;
    return true;
  }).length;
  const searchText = String(bazaarSearchText || "");
  const trimmedSearchText = searchText.trim();
  const searchCandidates = getBazaarSearchCandidates(trimmedSearchText);
  const showSearchCandidates = trimmedSearchText !== "";
  const buildBazaarCardHtml = (row) => {
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
          paddingLeft: 52,
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
    const pausedCardClass = isBazaarPausedByComment(row.comment) ? " is-paused" : "";

    return `
      <article class="bazaar-card${pausedCardClass} ${pendingBazaarFocusMaterialKey !== "" && row.materialKey === pendingBazaarFocusMaterialKey ? "is-focused" : ""}" data-bazaar-material-key="${row.materialKey}">
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
          <div class="bazaar-card-header-actions">
            <button
              type="button"
              class="memo-add-button bazaar-card-memo-button"
              data-memo-bazaar-key="${row.materialKey}"
              aria-label="${row.materialName}をメモに追加"
            >
              ＋メモ
            </button>
            <button
              type="button"
              class="bazaar-favorite-button ${isFavorite ? "is-active" : ""}"
              aria-label="${row.materialName}をお気に入り${isFavorite ? "解除" : "登録"}"
              aria-pressed="${isFavorite ? "true" : "false"}"
              data-bazaar-row-id="${row.id}"
            >
              ♥
            </button>
          </div>
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
            <div class="bazaar-price-stack">
              <p class="bazaar-today-price ${priceVisualToneClass}"><span class="bazaar-price-label">本日</span><strong>${todayPriceHtml}</strong></p>
              <p class="bazaar-previous-price"><span class="bazaar-price-label">前日</span><span class="bazaar-price-sub-value">${formatBazaarPriceWithUnit(row.previousDayPrice)}</span></p>
              <div class="bazaar-meta-row">
                <p class="bazaar-updated-at"><span class="bazaar-meta-label">更新</span><span>${updatedAtText}</span></p>
                <p class="bazaar-change-rate"><span class="bazaar-meta-label">前日比</span><span class="bazaar-change-value ${changePresentation.toneClass}">${changePresentation.text}</span>${changeArrowHtml}</p>
              </div>
            </div>
            ${priceStatusBadgeHtml}
            ${
              hasOfficialUrl
                ? `<a
                    class="bazaar-official-link-button bazaar-official-link-button-desktop"
                    href="${row.officialUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="${row.materialName}の公式相場サイトを新しいタブで開く"
                    data-bazaar-official-link="true"
                  >
                    公式相場
                  </a>`
                : ""
            }
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
      </article>
    `;
  };
  bazaarListWrap.innerHTML = `
    <div class="bazaar-page-note card">
      <p class="bazaar-page-note-highlight">グラフをタップすると詳細確認できます。</p>
      <p>価格更新中の素材のみ表示しています。更新停止中の商品は下部の「現在価格更新停止中リスト」にまとめています。</p>
      <p>すべて公式サイトを確認して手入力しているため、価格更新対象は絞っています。</p>
    </div>
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
        <div class="bazaar-search-toolbar">
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
          </div>
          <label class="field inline-field bazaar-favorite-filter-field bazaar-favorite-filter-inline">
            <input id="bazaarFavoritesOnlyToggle" type="checkbox" ${showBazaarFavoritesOnly ? "checked" : ""} />
            <span>お気に入りのみ表示</span>
          </label>
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
      <div class="filter-reset-wrap">
        <button
          id="bazaarClearFiltersButton"
          type="button"
          class="filter-reset-button"
          ${hasActiveBazaarFilters() ? "" : "hidden"}
        >
          × 絞り込み解除
        </button>
      </div>
    </div>
    ${
      visibleRows.length === 0
          ? `<p>${
              showBazaarMonitoringOnly
                ? "条件に一致するデータが見つかりませんでした。検索条件を変えてお試しください。"
                : showBazaarFavoritesOnly
                  ? "条件に一致するデータが見つかりませんでした。検索条件を変えてお試しください。"
                  : "条件に一致するデータが見つかりませんでした。検索条件を変えてお試しください。"
            }</p>`
          : `
            <div class="bazaar-list">
              ${activeRows.map((row) => buildBazaarCardHtml(row)).join("")}
            </div>
            ${
              pausedRows.length > 0
                ? `
                  <section class="bazaar-paused-section">
                    <button
                      type="button"
                      class="bazaar-paused-toggle"
                      aria-expanded="${isBazaarPausedSectionExpanded ? "true" : "false"}"
                      aria-controls="bazaarPausedList"
                    >
                      <span>現在価格更新停止中リスト（${pausedRowsTotalCount}件）</span>
                      <span class="bazaar-paused-toggle-icon" aria-hidden="true">${isBazaarPausedSectionExpanded ? "−" : "+"}</span>
                    </button>
                    <p class="bazaar-paused-note">※価格固定・店売り・一時停止中など、通常の相場更新対象外の商品です。</p>
                    ${
                      isBazaarPausedSectionExpanded
                        ? `
                          <div class="bazaar-paused-controls">
                            <label class="field bazaar-paused-category-field">
                              <span>停止中リスト種類</span>
                              <select id="bazaarPausedCategorySelect" aria-label="停止中リストの種類">
                                <option value="">すべて</option>
                                ${pausedCategories
                                  .map(
                                    (category) => `
                                      <option value="${category}" ${selectedBazaarPausedCategory === category ? "selected" : ""}>${category}</option>
                                    `
                                  )
                                  .join("")}
                              </select>
                            </label>
                          </div>
                        `
                        : ""
                    }
                    <div id="bazaarPausedList" class="bazaar-list bazaar-list-paused" ${isBazaarPausedSectionExpanded ? "" : "hidden"}>
                      ${
                        isBazaarPausedSectionExpanded
                          ? pausedRows.length > 0
                            ? pausedRows.map((row) => buildBazaarCardHtml(row)).join("")
                            : `<p class="bazaar-paused-empty">条件に一致する停止中商品がありません。</p>`
                          : ""
                      }
                    </div>
                  </section>
                `
                : ""
            }
          `
      }
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

  const bazaarPausedToggle = bazaarListWrap.querySelector(".bazaar-paused-toggle");
  if (bazaarPausedToggle) {
    bazaarPausedToggle.addEventListener("click", () => {
      isBazaarPausedSectionExpanded = !isBazaarPausedSectionExpanded;
      renderBazaarPrices();
    });
  }

  const bazaarPausedCategorySelect = bazaarListWrap.querySelector("#bazaarPausedCategorySelect");
  if (bazaarPausedCategorySelect) {
    bazaarPausedCategorySelect.value = selectedBazaarPausedCategory;
    bazaarPausedCategorySelect.addEventListener("change", (event) => {
      selectedBazaarPausedCategory = String(event.target.value || "");
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

  const bazaarClearFiltersButton = bazaarListWrap.querySelector("#bazaarClearFiltersButton");
  if (bazaarClearFiltersButton) {
    bazaarClearFiltersButton.addEventListener("click", () => {
      clearBazaarFilters();
    });
  }

  bazaarListWrap.querySelectorAll(".bazaar-search-candidate-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBazaarMaterialName = String(button.textContent || "").trim();
      bazaarSearchText = selectedBazaarMaterialName;
      shouldRefocusBazaarSearchInput = true;
      syncBazaarItemUrl(selectedBazaarMaterialName);
      renderBazaarPrices();
    });
  });

  bazaarListWrap.querySelectorAll("[data-bazaar-row-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const rowId = String(button.dataset.bazaarRowId || "");
      const row = bazaarRowById.get(rowId);
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

  decorateMemoAddButtons(bazaarListWrap);
  bazaarListWrap.querySelectorAll("[data-memo-bazaar-key]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const materialKey = String(button.dataset.memoBazaarKey || "");
      const row = getBazaarRowByMaterialKey(materialKey);
      if (!row) return;
      addMemoEntry(createBazaarMemoEntry(row));
    });
  });

  bazaarListWrap.querySelectorAll("[data-bazaar-official-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.stopPropagation();
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
  if (pendingBazaarAutoOpenMaterialKey !== "") {
    const materialKeyToOpen = String(pendingBazaarAutoOpenMaterialKey || "").trim();
    pendingBazaarAutoOpenMaterialKey = "";
    if (materialKeyToOpen !== "" && activeBazaarDetailModalKey !== materialKeyToOpen) {
      void openBazaarDetailModal(materialKeyToOpen);
      return;
    }
  }
  updateDocumentMetadata();
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
    if (normalizedKeyword === "" && selectedOrbCategory !== "" && normalizeOrbCategoryName(row.orbCategory) !== selectedOrbCategory) return false;
    if (normalizedKeyword === "") return true;
    return [row.orbName, row.effect, row.monsterNames.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword);
  });
}

function getDefaultOrbCategory() {
  const categories = ["炎", "水", "風", "光", "闇"].filter((category) =>
    (orbEntries || []).some((row) => normalizeOrbCategoryName(row.orbCategory) === category)
  );
  return categories.includes("炎") ? "炎" : categories[0] || "";
}

function updateOrbClearButtonVisibility() {
  if (!orbClearFiltersButton) return;
  const hasActiveSearch = String(orbSearchKeyword || "").trim() !== "";
  const defaultCategory = getDefaultOrbCategory();
  const hasActiveCategory = String(selectedOrbCategory || "") !== "" && String(selectedOrbCategory || "") !== defaultCategory;
  orbClearFiltersButton.hidden = !(hasActiveSearch || hasActiveCategory);
}

function clearOrbFilters() {
  orbSearchKeyword = "";
  selectedOrbCategory = "";
  expandedOrbId = "";
  keepOrbCategoryCleared = false;
  navigateByFeatureRoute({ tab: "orbs", orbSearch: "", equipmentId: "", materialKey: "" });
  renderOrbCards();
}

function renderOrbCards() {
  if (!orbListWrap || !orbCategoryFilterWrap) return;
  if (orbSearchInput && orbSearchInput.value !== orbSearchKeyword) {
    orbSearchInput.value = orbSearchKeyword;
  }
  if (isOrbDataLoading && !hasLoadedOrbData) {
    orbListWrap.innerHTML = `<p class="card">読み込み中です。しばらくお待ちください。</p>`;
    return;
  }
  if (!Array.isArray(orbEntries) || orbEntries.length === 0) {
    orbListWrap.innerHTML = orbLoadError
      ? `<p class="card">データを読み込めませんでした。<br>時間をおいて再度お試しください。</p>`
      : `<p class="card">現在表示できるデータがありません。</p>`;
    orbCategoryFilterWrap.innerHTML = "";
    return;
  }

  const categories = ["炎", "水", "風", "光", "闇"].filter((category) =>
    orbEntries.some((row) => normalizeOrbCategoryName(row.orbCategory) === category)
  );
  if (!keepOrbCategoryCleared && selectedOrbCategory === "" && String(orbSearchKeyword || "").trim() === "") {
    selectedOrbCategory = getDefaultOrbCategory();
  }
  updateOrbClearButtonVisibility();
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
          ? `<p class="card orb-empty">条件に一致するデータが見つかりませんでした。<br>検索条件を変えてお試しください。</p>`
          : filteredRows
              .map((row) => {
                const isExpanded = expandedOrbId === row.id;
                const orbCategoryClass = getOrbCategoryClassName(row.orbCategory);
                const monsterListHtml = buildOrbMonsterLinksHtml(row.monsterNames);
                return `
                  <article class="card orb-card orb-card-category-${orbCategoryClass} ${isExpanded ? "is-expanded" : ""}">
                    <button type="button" class="orb-card-toggle" data-orb-id="${row.id}" aria-expanded="${isExpanded ? "true" : "false"}">
                      <p class="orb-card-category">${buildOrbCategoryLabelHtml(row.orbCategory)}</p>
                      <h3 class="orb-card-name">${row.orbName}</h3>
                      <p class="orb-card-effect">${row.effect || "-"}</p>
                    </button>
                    <button type="button" class="memo-add-button orb-memo-button" data-memo-orb-id="${escapeHtml(row.id)}">＋メモ</button>
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
      keepOrbCategoryCleared = selectedOrbCategory === "";
      renderOrbCards();
    });
  });

  orbListWrap.querySelectorAll("[data-orb-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const clickedOrbId = String(button.dataset.orbId || "");
      const targetOrb = orbEntryById.get(clickedOrbId);
      expandedOrbId = expandedOrbId === clickedOrbId ? "" : clickedOrbId;
      if (targetOrb?.orbName) {
        syncOrbUrl(String(targetOrb.orbName || "").trim());
      }
      renderOrbCards();
    });
  });
  decorateMemoAddButtons(orbListWrap);
  orbListWrap.querySelectorAll("[data-memo-orb-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const orb = orbEntryById.get(String(button.dataset.memoOrbId || ""));
      addMemoEntry(createOrbMemoEntry(orb));
    });
  });
  orbListWrap.querySelectorAll("[data-orb-monster-name]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void openMonsterInfoFromOrb(String(button.dataset.orbMonsterName || ""));
    });
  });
  updateDocumentMetadata();
}

function renderPresentCodes() {
  if (!presentCodeListWrap) return;
  if (isPresentCodesLoading && !hasLoadedPresentCodes) {
    presentCodeListWrap.innerHTML = `<p class="card">読み込み中です。しばらくお待ちください。</p>`;
    return;
  }
  if (!Array.isArray(presentCodes) || presentCodes.length === 0) {
    presentCodeListWrap.innerHTML = presentCodesLoadError
      ? `<p class="card">データを読み込めませんでした。<br>時間をおいて再度お試しください。</p>`
      : `<p class="card">現在表示できるデータがありません。</p>`;
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
    fieldFarmingListWrap.innerHTML = `<p class="card">読み込み中です。しばらくお待ちください。</p>`;
    return;
  }
  if (fieldFarmingSortSelect) {
    fieldFarmingSortSelect.value = selectedFieldFarmingSort;
  }
  if (!Array.isArray(fieldFarmingMonsters) || fieldFarmingMonsters.length === 0) {
    fieldFarmingListWrap.innerHTML = fieldFarmingLoadError
      ? `<p class="card">データを読み込めませんでした。<br>時間をおいて再度お試しください。</p>`
      : `<p class="card">現在表示できるデータがありません。</p>`;
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

function clearProfitArmorSetContext() {
  pendingProfitArmorSetContext = null;
}

function getArmorSetPartCandidates(setName, part) {
  const normalizedSetName = String(setName || "").trim();
  const normalizedPart = String(part || "").trim();
  const setBaseName = stripArmorSetSuffix(normalizedSetName);
  if (setBaseName === "" || normalizedPart === "") return [];
  return state.equipments.filter((equipment) => {
    if (String(equipment?.category || "").trim() !== normalizedPart) return false;
    if (!["防具職人", "裁縫職人"].includes(String(equipment?.craftsman || "").trim())) return false;
    return String(equipment?.name || "").trim().startsWith(setBaseName);
  });
}

function buildProfitArmorSetContext(setName, options = {}) {
  const normalizedSetName = String(setName || "").trim();
  if (normalizedSetName === "") return null;
  const setBaseName = stripArmorSetSuffix(normalizedSetName);
  if (setBaseName === "") return null;

  const availableParts = PROFIT_ARMOR_PART_ORDER.filter((part) => getArmorSetPartCandidates(normalizedSetName, part).length > 0);
  return {
    type: PROFIT_EQUIPMENT_NAVIGATION_TYPES.armorSet,
    setName: normalizedSetName,
    availableParts,
    errorMessage: String(options.errorMessage || "").trim(),
  };
}

function resolveArmorSetPartEquipmentId(setName, part) {
  const candidates = getArmorSetPartCandidates(setName, part);
  if (candidates.length !== 1) return "";
  return String(candidates[0]?.id || "");
}

function openProfitArmorSetPart(setName, part) {
  const normalizedSetName = String(setName || "").trim();
  const normalizedPart = String(part || "").trim();
  if (normalizedSetName === "" || normalizedPart === "") return;

  const resolvedEquipmentId = resolveArmorSetPartEquipmentId(normalizedSetName, normalizedPart);
  if (!resolvedEquipmentId) {
    pendingProfitArmorSetContext = buildProfitArmorSetContext(normalizedSetName, {
      errorMessage: "該当部位のレシピを特定できませんでした。別の部位を選ぶか、手動で装備を選択してください。",
    });
    navigateByAppParams({
      tab: "profit",
      equipmentId: "",
      materialKey: "",
      profitEntryType: PROFIT_EQUIPMENT_NAVIGATION_TYPES.armorSet,
      profitArmorSetName: normalizedSetName,
      profitArmorPart: normalizedPart,
    });
    rerenderAll();
    return;
  }

  clearProfitArmorSetContext();
  selectProfitEquipment(resolvedEquipmentId);
  syncProfitEquipmentUrl(resolvedEquipmentId);
  rerenderAll();
}

function openRecipeFromFavorite(equipmentId) {
  if (!equipmentId) return;
  clearProfitArmorSetContext();
  if (!selectProfitEquipment(equipmentId)) return;
  switchTab("profit");
  syncProfitEquipmentUrl(equipmentId);
  rerenderAll();
  document.getElementById("profit")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function openProfitFromEquipmentId(equipmentId) {
  if (!equipmentId) return;
  clearProfitArmorSetContext();
  if (!selectProfitEquipment(equipmentId)) return;
  closeArmorSetDetailModal();
  switchTab("profit");
  syncProfitEquipmentUrl(equipmentId);
  rerenderAll();
  document.getElementById("profit")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function openProfitFromEquipmentDb(entry) {
  const normalizedGroup = String(entry?.equipmentGroup || "").trim();
  const normalizedName = String(entry?.equipmentName || "").trim();
  const isArmorSet = normalizedGroup === "armor" && normalizedName !== "";

  if (isArmorSet) {
    pendingProfitArmorSetContext = buildProfitArmorSetContext(normalizedName);
    switchTab("profit");
    navigateByFeatureRoute({
      tab: "profit",
      equipmentId: "",
      materialKey: "",
      profitEntryType: PROFIT_EQUIPMENT_NAVIGATION_TYPES.armorSet,
      profitArmorSetName: normalizedName,
      profitEquipmentGroup: normalizedGroup,
    });
    rerenderAll();
    document.getElementById("profit")?.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }

  clearProfitArmorSetContext();
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
  if (payload.equipmentId) {
    syncProfitEquipmentUrl(payload.equipmentId);
  } else {
    navigateByFeatureRoute({
      tab: "profit",
      equipmentId: payload.equipmentId,
      materialKey: "",
      profitEntryType: PROFIT_EQUIPMENT_NAVIGATION_TYPES.weapon,
      profitEquipmentName: payload.equipmentName,
      profitEquipmentType: payload.equipmentType,
      profitEquipmentGroup: payload.equipmentGroup,
    });
  }
  rerenderAll();
  document.getElementById("profit")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function openBazaarFromFavorite(materialKey) {
  switchTab("bazaar");
  pendingBazaarFocusMaterialKey = materialKey || "";
  bazaarSearchText = "";
  selectedBazaarMaterialName = "";
  navigateByFeatureRoute({ tab: "bazaar", equipmentId: "", materialKey: materialKey || "" });
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
    isEquipmentDbTypeExplicitAll = false;
    expandedEquipmentDbId = "";
    equipmentDbNameKeyword = keyword;
    switchTab("equipment-db");
    navigateByFeatureRoute({ tab: "equipment-db", equipmentSearch: keyword, equipmentId: "", materialKey: "" });
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
    syncBazaarItemUrl(keyword);
    renderBazaarPrices();
    resetSearchUi();
    document.getElementById("bazaar")?.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }
  if (entry.tabId === "field-farming") {
    fieldFarmingKeyword = keyword;
    switchTab("field-farming");
    navigateByFeatureRoute({ tab: "field-farming", equipmentId: "", materialKey: "" });
    renderFieldFarmingRanking();
    resetSearchUi();
    document.getElementById("field-farming")?.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }
  if (entry.tabId === "present-codes") {
    presentCodesKeyword = keyword;
    switchTab("present-codes");
    navigateByFeatureRoute({ tab: "present-codes", equipmentId: "", materialKey: "" });
    renderPresentCodes();
    resetSearchUi();
    document.getElementById("present-codes")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}

function renderSiteSearchCandidates() {
  const searchTargets = [{ wrap: toolSiteSearchResultWrap }];
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
  return bazaarRowByMaterialKey.get(normalizedKey) || null;
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

function getBazaarRelatedRecipeEntries(materialName) {
  const normalizedName = String(materialName || "").trim();
  if (normalizedName === "") return { items: [], total: 0 };
  const matchedMaterial = state.materials.find((material) => String(material?.name || "").trim() === normalizedName);
  if (!matchedMaterial?.id) return { items: [], total: 0 };

  const equipmentById = new Map((state.equipments || []).map((equipment) => [String(equipment?.id || ""), equipment]));
  const seenEquipmentIds = new Set();
  const items = [];

  (state.recipes || []).forEach((recipeRow) => {
    if (String(recipeRow?.materialId || "") !== String(matchedMaterial.id || "")) return;
    const equipmentId = String(recipeRow?.equipmentId || "").trim();
    if (equipmentId === "" || seenEquipmentIds.has(equipmentId)) return;
    const equipment = equipmentById.get(equipmentId);
    const equipmentName = String(equipment?.name || "").trim();
    if (equipmentName === "") return;
    seenEquipmentIds.add(equipmentId);
    items.push({
      equipmentName,
      equipmentLevel: Number(equipment?.equipmentLevel || 0),
    });
  });

  items.sort((a, b) => {
    if (b.equipmentLevel !== a.equipmentLevel) return b.equipmentLevel - a.equipmentLevel;
    return a.equipmentName.localeCompare(b.equipmentName, "ja");
  });

  return { items, total: items.length };
}

function getBazaarRelatedMonsterEntries(materialName) {
  const normalizedName = String(materialName || "").trim();
  if (normalizedName === "") {
    return {
      normalItems: [],
      rareItems: [],
      normalTotal: 0,
      rareTotal: 0,
      total: 0,
    };
  }

  const normalMatches = [];
  const rareMatches = [];
  (monsterDetailEntries || []).forEach((entry) => {
    const monsterName = String(entry?.name || "").trim();
    if (monsterName === "") return;
    if (String(entry?.normalDrop || "").trim() === normalizedName) {
      normalMatches.push({ monsterName, dropType: "通常ドロップ" });
    }
    if (String(entry?.rareDrop || "").trim() === normalizedName) {
      rareMatches.push({ monsterName, dropType: "レアドロップ" });
    }
  });

  normalMatches.sort((a, b) => a.monsterName.localeCompare(b.monsterName, "ja"));
  rareMatches.sort((a, b) => a.monsterName.localeCompare(b.monsterName, "ja"));
  return {
    normalItems: normalMatches,
    rareItems: rareMatches,
    normalTotal: normalMatches.length,
    rareTotal: rareMatches.length,
    total: normalMatches.length + rareMatches.length,
  };
}

function buildBazaarRelatedToggleHtml(toggleKey, isExpanded, remainCount) {
  if (remainCount <= 0) return "";
  return `<button type="button" class="bazaar-detail-related-toggle" data-bazaar-related-toggle="${escapeHtml(toggleKey)}">${isExpanded ? "閉じる" : `すべて表示（ほか${remainCount}件）`}</button>`;
}

function buildBazaarRelatedMonsterChipHtml(monsterName) {
  return `<button type="button" class="monster-info-chip bazaar-detail-related-chip" data-bazaar-related-monster-name="${escapeHtml(monsterName)}">${escapeHtml(monsterName)}</button>`;
}

function buildBazaarRelatedMonsterGroupHtml(materialKey, groupKey, label, items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const visibleLimit = 5;
  const toggleKey = `${materialKey}:${groupKey}`;
  const isExpanded = bazaarRelatedMonsterExpandStateByKey.get(toggleKey) === true;
  const visibleItems = isExpanded ? items : items.slice(0, visibleLimit);
  const remainCount = Math.max(items.length - visibleItems.length, 0);
  return `
    <section class="bazaar-detail-related-group">
      <p class="bazaar-detail-related-group-title">${escapeHtml(label)}：${items.length}体</p>
      <div class="monster-info-chip-list bazaar-detail-related-chip-list">
        ${visibleItems.map((item) => buildBazaarRelatedMonsterChipHtml(item.monsterName)).join("")}
      </div>
      ${buildBazaarRelatedToggleHtml(toggleKey, isExpanded, remainCount)}
    </section>
  `;
}

function buildBazaarRelatedRecipesHtml(materialKey, materialName) {
  const { items, total } = getBazaarRelatedRecipeEntries(materialName);
  if (total === 0) {
    return `<p class="bazaar-detail-related-empty">この素材を使うレシピは登録されていません。</p>`;
  }
  const toggleKey = `${materialKey}:recipes`;
  const isExpanded = bazaarRelatedRecipeExpandStateByMaterialKey.get(toggleKey) === true;
  const visibleLimit = 5;
  const visibleItems = isExpanded ? items : items.slice(0, visibleLimit);
  const remainCount = Math.max(total - visibleItems.length, 0);
  return `
    <div class="bazaar-detail-related-list">
      <p class="bazaar-detail-related-count">${total}件</p>
      ${visibleItems
        .map(
          (item) => `
            <article class="bazaar-detail-related-item">
              <p class="bazaar-detail-related-name">${escapeHtml(item.equipmentName)}</p>
              <div class="bazaar-detail-related-links">
                <button type="button" class="bazaar-detail-related-link" data-bazaar-related-equipment-name="${escapeHtml(item.equipmentName)}">装備情報</button>
                <button type="button" class="bazaar-detail-related-link" data-bazaar-related-craft-name="${escapeHtml(item.equipmentName)}">職人アシスト</button>
              </div>
            </article>
          `
        )
        .join("")}
      ${buildBazaarRelatedToggleHtml(toggleKey, isExpanded, remainCount)}
    </div>
  `;
}

function buildBazaarRelatedMonstersHtml(materialKey, materialName) {
  const { normalItems, rareItems, total } = getBazaarRelatedMonsterEntries(materialName);
  if (total === 0) {
    return `<p class="bazaar-detail-related-empty">この素材を落とすモンスターは登録されていません。</p>`;
  }
  return `
    <div class="bazaar-detail-related-list bazaar-detail-related-list-compact">
      ${buildBazaarRelatedMonsterGroupHtml(materialKey, "normal", "通常ドロップ", normalItems)}
      ${buildBazaarRelatedMonsterGroupHtml(materialKey, "rare", "レアドロップ", rareItems)}
    </div>
  `;
}

function openBazaarPageForItem(itemName) {
  const normalizedName = String(itemName || "").trim();
  if (normalizedName === "" || normalizedName === "-" || normalizedName === "なし") return;
  closeMonsterInfoModal();
  switchTab("bazaar");
  queueBazaarUrlItemApplication(normalizedName);
  syncBazaarItemUrl(normalizedName);
  renderBazaarPrices();
  document.getElementById("bazaar")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function resetBazaarDetailModalScrollPosition() {
  bazaarDetailModalDialog?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
  bazaarDetailModalBody?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
  if (bazaarDetailModalDialog) bazaarDetailModalDialog.scrollTop = 0;
  if (bazaarDetailModalBody) bazaarDetailModalBody.scrollTop = 0;
}

async function openBazaarDetailModal(materialKey) {
  if (!bazaarDetailModalOverlay || !bazaarDetailModalBody) return;
  const row = getBazaarRowByMaterialKey(materialKey);
  if (!row) return;
  syncBazaarItemUrl(row.materialName);
  await ensureMonsterInfoDataLoaded();
  await ensureBazaarPriceHistoryLoaded();

  const monthOptions = getBazaarHistoryMonthKeys(row.materialKey);
  const latestMonthKey = monthOptions.length > 0 ? monthOptions[monthOptions.length - 1] : "";
  const requestedMonthKey = String(bazaarDetailMonthByMaterialKey.get(row.materialKey) || "").trim();
  const selectedMonthKey = monthOptions.includes(requestedMonthKey) ? requestedMonthKey : latestMonthKey;
  if (selectedMonthKey) {
    bazaarDetailMonthByMaterialKey.set(row.materialKey, selectedMonthKey);
  } else {
    bazaarDetailMonthByMaterialKey.delete(row.materialKey);
  }

  const history = selectedMonthKey ? getBazaarHistoryForMonth(row.materialKey, selectedMonthKey) : [];
  const historySummary = getBazaarHistorySummary(history);
  const previousMonthKey = selectedMonthKey ? shiftBazaarHistoryMonthKey(selectedMonthKey, -1) : "";
  const previousMonthHistory = previousMonthKey ? getBazaarHistoryForMonth(row.materialKey, previousMonthKey) : [];
  const previousMonthSummary = getBazaarHistorySummary(previousMonthHistory);
  const previousMonthAverage = previousMonthSummary.average;
  const averageDiffRate =
    Number.isFinite(historySummary.average) && Number.isFinite(previousMonthAverage) && previousMonthAverage !== 0
      ? ((historySummary.average - previousMonthAverage) / previousMonthAverage) * 100
      : null;
  const updatedAtText = formatBazaarUpdatedAt(row.updatedAt);
  const monthSelectHtml =
    monthOptions.length > 0
      ? `
        <div class="bazaar-detail-month-control">
          <label class="field bazaar-detail-month-field" for="bazaarDetailMonthSelect">
            <span>確認月</span>
            <select id="bazaarDetailMonthSelect" data-bazaar-history-month-select="${row.materialKey}">
              ${monthOptions
                .map(
                  (monthKey) =>
                    `<option value="${monthKey}"${monthKey === selectedMonthKey ? " selected" : ""}>${formatBazaarHistoryMonthLabel(monthKey)}</option>`
                )
                .join("")}
            </select>
          </label>
        </div>
      `
      : "";
  const summaryHtml =
    historySummary.count > 0
      ? `
        <div class="bazaar-detail-month-summary" aria-label="月別集計">
          <p><span>平均</span><strong>${formatBazaarChartPriceWithUnit(historySummary.average)}</strong></p>
          <p><span>最高</span><strong>${formatBazaarChartPriceWithUnit(historySummary.max)}</strong></p>
          <p><span>最安</span><strong>${formatBazaarChartPriceWithUnit(historySummary.min)}</strong></p>
          <p><span>前月平均比</span><strong>${
            Number.isFinite(averageDiffRate)
              ? `${averageDiffRate >= 0 ? "+" : ""}${averageDiffRate.toFixed(1)}%`
              : "-"
          }</strong></p>
        </div>
      `
      : "";
  const chartHtml =
    history.length > 0
      ? `
        <div class="bazaar-detail-modal-chart">${buildBazaarSparklineSvg(history, {
          width: 320,
          height: 176,
          includeYAxisLabels: true,
          paddingLeft: 58,
          xAxisLabelCount: 2,
          yAxisTickCount: 4,
          pointRadius: 2,
          referencePrice: previousMonthAverage,
        })}</div>
      `
      : `<p class="bazaar-detail-modal-chart-empty">表示できる履歴がありません。</p>`;
  const relatedRecipesHtml = buildBazaarRelatedRecipesHtml(row.materialKey, row.materialName);
  const relatedMonstersHtml = buildBazaarRelatedMonstersHtml(row.materialKey, row.materialName);

  bazaarDetailModalBody.innerHTML = `
    <div class="memo-target-header bazaar-detail-modal-header">
      <h3 class="bazaar-detail-modal-title">${row.materialName}</h3>
      <button
        type="button"
        class="memo-add-button bazaar-detail-memo-button"
        data-memo-bazaar-key="${row.materialKey}"
        aria-label="${row.materialName}をメモに追加"
      >
        ＋メモ
      </button>
    </div>
    <p class="bazaar-detail-modal-updated-at">更新: ${updatedAtText}</p>
    <p class="bazaar-detail-modal-previous">前日価格: ${formatBazaarPriceWithUnit(row.previousDayPrice)}</p>
    ${monthSelectHtml}
    ${summaryHtml}
    ${chartHtml}
    <p class="bazaar-detail-modal-period">${
      selectedMonthKey ? `${formatBazaarHistoryMonthLabel(selectedMonthKey)}` : "対象月なし"
    }（${history.length}件）${
      Number.isFinite(previousMonthAverage) ? ` / 破線: 前月平均 ${formatBazaarChartPriceWithUnit(previousMonthAverage)}` : ""
    }</p>
    <p class="bazaar-detail-modal-latest">最新価格: <strong>${formatBazaarPriceWithUnit(row.displayPrice)}</strong></p>
    ${
      row.officialUrl
        ? `<a class="bazaar-detail-modal-link" href="${row.officialUrl}" target="_blank" rel="noopener noreferrer">公式相場で確認</a>`
        : ""
    }
    <section class="bazaar-detail-related-section" aria-label="この素材を使うレシピ">
      <h4 class="bazaar-detail-related-title">この素材を使うレシピ</h4>
      ${relatedRecipesHtml}
    </section>
    <section class="bazaar-detail-related-section" aria-label="この素材を落とすモンスター">
      <h4 class="bazaar-detail-related-title">この素材を落とすモンスター</h4>
      ${relatedMonstersHtml}
    </section>
    ${buildIndividualPageActionLink("個別ページを開く", getBazaarIndividualPageUrl(row.materialName))}
  `;
  decorateMemoAddButtons(bazaarDetailModalBody);

  activeBazaarDetailModalKey = row.materialKey;
  bazaarDetailModalOverlay.hidden = false;
  bazaarDetailModalOverlay.classList.add("is-open");
  syncBodyModalOpenState();
  resetBazaarDetailModalScrollPosition();
  bazaarDetailModalDialog?.focus();
  requestAnimationFrame(() => {
    resetBazaarDetailModalScrollPosition();
  });
  updateDocumentMetadata();
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

function commitPendingFavoriteRemovals() {
  let hasChanged = false;
  pendingRemovedRecipeFavoriteKeys.forEach((key) => {
    if (recipeFavoriteKeys.delete(key)) hasChanged = true;
  });
  pendingRemovedMaterialFavoriteKeys.forEach((key) => {
    if (bazaarFavoriteMaterialKeys.delete(key)) hasChanged = true;
  });
  pendingRemovedRecipeFavoriteKeys.clear();
  pendingRemovedMaterialFavoriteKeys.clear();
  if (!hasChanged) return;
  saveRecipeFavoriteState();
  saveBazaarFavoriteState();
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
          const favoriteKey = getRecipeFavoriteKey(equipment);
          const isPendingRemoval = favoriteKey !== "" && pendingRemovedRecipeFavoriteKeys.has(favoriteKey);
          return `
            <article class="favorite-item-card ${isPendingRemoval ? "is-pending-removal" : ""}">
              <header class="favorite-item-header">
                <button type="button" class="favorite-item-title-button" data-favorite-recipe-id="${equipment.id}">
                  ${equipment.name}
                </button>
              </header>
              <p class="favorite-item-meta">原価目安: ${formatGold(getRoundedEquipmentMaterialCost(equipment.id))}</p>
              <p class="favorite-item-meta">必要素材: ${getFavoriteRecipeMaterialSummary(equipment.id)}</p>
              <a href="#" class="favorite-link-button" data-favorite-recipe-link-id="${equipment.id}">職人アシストで開く</a>
              <button
                type="button"
                class="favorite-sub-action-button ${isPendingRemoval ? "is-restore" : ""}"
                data-favorite-recipe-toggle-key="${favoriteKey}"
                aria-label="${equipment.name}をお気に入り${isPendingRemoval ? "再登録" : "解除"}"
              >
                ${isPendingRemoval ? "★ もう一度登録" : "☆ お気に入り解除"}
              </button>
              ${
                isPendingRemoval
                  ? `<p class="favorite-pending-note">このページを離れると一覧から外れます。</p>`
                  : ""
              }
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
  favoriteRecipesListWrap.querySelectorAll("[data-favorite-recipe-toggle-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = String(button.dataset.favoriteRecipeToggleKey || "");
      if (key === "") return;
      if (pendingRemovedRecipeFavoriteKeys.has(key)) {
        pendingRemovedRecipeFavoriteKeys.delete(key);
      } else {
        pendingRemovedRecipeFavoriteKeys.add(key);
      }
      renderFavoriteRecipesSection();
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
          const isPendingRemoval = pendingRemovedMaterialFavoriteKeys.has(row.materialKey);
          const changeRate = getBazaarRowChangeRate(row);
          const changePresentation = getBazaarChangePresentation(changeRate);
          const changeArrowHtml =
            changePresentation.arrow && changePresentation.isComputable
              ? `<span class="favorite-material-change-arrow ${changePresentation.toneClass}" aria-hidden="true">${changePresentation.arrow}</span>`
              : "";
          return `
            <article class="favorite-material-card ${isPendingRemoval ? "is-pending-removal" : ""}">
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
              <button
                type="button"
                class="favorite-sub-action-button ${isPendingRemoval ? "is-restore" : ""}"
                data-favorite-material-toggle-key="${row.materialKey}"
                aria-label="${row.materialName}をお気に入り${isPendingRemoval ? "再登録" : "解除"}"
              >
                ${isPendingRemoval ? "★ もう一度登録" : "☆ お気に入り解除"}
              </button>
              ${
                isPendingRemoval
                  ? `<p class="favorite-pending-note">このページを離れると一覧から外れます。</p>`
                  : ""
              }
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
  favoriteMaterialsListWrap.querySelectorAll("[data-favorite-material-toggle-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = String(button.dataset.favoriteMaterialToggleKey || "");
      if (key === "") return;
      if (pendingRemovedMaterialFavoriteKeys.has(key)) {
        pendingRemovedMaterialFavoriteKeys.delete(key);
      } else {
        pendingRemovedMaterialFavoriteKeys.add(key);
      }
      renderFavoriteMaterialsSection();
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

function setSalePriceInputValue(input, value, options = {}) {
  if (!input) return;
  const force = options.force === true;
  if (!force && document.activeElement === input) return;
  const normalizedValue = Number(value || 0);
  const nextValue = String(Number.isFinite(normalizedValue) ? normalizedValue : 0);
  if (input.value !== nextValue) {
    input.value = nextValue;
  }
}

function syncSalePriceInputs(options = {}) {
  const eq = getSelectedEquipment();
  const salePrices = getSalePricesForEquipment(eq);
  setSalePriceInputValue(salePriceStar0Input, salePrices.star0, options);
  setSalePriceInputValue(salePriceStar1Input, salePrices.star1, options);
  setSalePriceInputValue(salePriceStar2Input, salePrices.star2, options);
  setSalePriceInputValue(salePriceStar3Input, salePrices.star3, options);
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
    const resolvedPath = resolveProjectScopedResourceUrl(UI_SETTINGS_JSON_PATH);
    const response = await fetch(resolvedPath, { cache: "no-store" });
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
    const resolvedPath = resolveProjectScopedResourceUrl(CONTENT_JSON_PATH);
    const response = await fetch(resolvedPath, { cache: "no-store" });
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
  if (adminFabToggleButton) adminFabToggleButton.textContent = "管理者メニュー";
  if (adminFabPanel) adminFabPanel.setAttribute("aria-label", "管理者メニュー");
  adminFabPanel?.querySelector(".admin-fab-note") && (adminFabPanel.querySelector(".admin-fab-note").textContent = "※簡易PIN保護です。本番用の強固な認証ではありません。");
  const pinLabel = adminPinGate?.querySelector("label span");
  if (pinLabel) pinLabel.textContent = "管理PIN";
  if (adminPinInput) adminPinInput.placeholder = "PINを入力";
  if (adminPinUnlockButton) adminPinUnlockButton.textContent = "管理モードを開く";
  if (adminOpenManageModeButton) adminOpenManageModeButton.textContent = "管理モードを開く";
  if (adminOpenUiSettingsButton) adminOpenUiSettingsButton.textContent = "UI設定を開く";
  if (adminOpenContentEditorButton) adminOpenContentEditorButton.textContent = "本文編集モードを開く";
  if (adminOpenUpdatesEditorButton) adminOpenUpdatesEditorButton.textContent = "更新情報編集を開く";
  if (adminOpenBazaarAdminButton) adminOpenBazaarAdminButton.textContent = "バザー価格更新を開く";
  if (adminExportUiSettingsButton) adminExportUiSettingsButton.textContent = "設定JSONをダウンロード";
  if (adminExportContentButton) adminExportContentButton.textContent = "本文JSONをダウンロード";
  if (adminExportUpdatesButton) adminExportUpdatesButton.textContent = "更新情報JSONをダウンロード";
  if (adminLockButton) adminLockButton.textContent = "管理モードを閉じる";
  document.getElementById("ui-settings")?.setAttribute("aria-label", "UI設定画面");
  document.getElementById("content-editor")?.setAttribute("aria-label", "本文編集画面");
  document.getElementById("updates-editor")?.setAttribute("aria-label", "更新情報編集画面");
  const bazaarAdminSection = document.getElementById("bazaar-admin");
  if (bazaarAdminSection) {
    bazaarAdminSection.setAttribute("aria-label", "バザー価格更新管理画面");
    const heading = bazaarAdminSection.querySelector("h2");
    if (heading) heading.textContent = "バザー価格更新（管理）";
    const note = bazaarAdminSection.querySelector(".bazaar-admin-panel .helper-text");
    if (note) note.textContent = "※ 固定価格・店売り・更新停止中の商品は通常更新対象から除外します。公式ページを開き、出品情報を貼り付けてから更新してください。";
    const categoryLabel = bazaarAdminSection.querySelector(".bazaar-admin-category-field span");
    if (categoryLabel) categoryLabel.textContent = "カテゴリ指定更新";
    if (bazaarAdminRefreshButton) bazaarAdminRefreshButton.textContent = "CSV再読込";
    if (bazaarAdminUpdateCategoryButton) bazaarAdminUpdateCategoryButton.textContent = "カテゴリ更新";
    if (bazaarAdminUpdateAllButton) bazaarAdminUpdateAllButton.textContent = "全件更新";
    if (bazaarAdminDownloadButton) bazaarAdminDownloadButton.textContent = "更新CSVをダウンロード";
    const checklistHeading = bazaarAdminSection.querySelector("#adminChecklistHeading");
    if (checklistHeading) checklistHeading.textContent = "運用チェックリスト";
    const checklistNote = bazaarAdminSection.querySelector(".admin-checklist-note");
    if (checklistNote) checklistNote.textContent = "毎日・週次・月次の確認用メモです。チェック状態はこのブラウザに保存されます。";
  }
  const dataSection = document.getElementById("data");
  if (dataSection) {
    dataSection.setAttribute("aria-label", "データ追加画面");
    const dataHeading = dataSection.querySelector("h2");
    if (dataHeading) dataHeading.textContent = "データ追加";
    const dataCards = dataSection.querySelectorAll(".card");
    dataCards[0]?.querySelector("h3") && (dataCards[0].querySelector("h3").textContent = "素材追加");
    dataCards[1]?.querySelector("h3") && (dataCards[1].querySelector("h3").textContent = "装備追加");
    dataSection.querySelector("#recipeForm h3") && (dataSection.querySelector("#recipeForm h3").textContent = "レシピ追加");
    dataCards[2]?.querySelector("h3") && (dataCards[2].querySelector("h3").textContent = "素材一覧・価格編集");
    dataCards[3]?.querySelector("h3") && (dataCards[3].querySelector("h3").textContent = "登録済みレシピ一覧");
    dataCards[4]?.querySelector("h3") && (dataCards[4].querySelector("h3").textContent = "バザー履歴保存（運用）");
    const materialNameLabel = dataSection.querySelector('label[for="newMaterialName"] span') || document.querySelector("#newMaterialName")?.closest("label")?.querySelector("span");
    if (materialNameLabel) materialNameLabel.textContent = "素材名";
    const materialPriceLabel = document.querySelector("#newMaterialPrice")?.closest("label")?.querySelector("span");
    if (materialPriceLabel) materialPriceLabel.textContent = "単価（G）";
    const equipmentNameLabel = document.querySelector("#newEquipmentName")?.closest("label")?.querySelector("span");
    if (equipmentNameLabel) equipmentNameLabel.textContent = "装備名";
    const equipmentPriceLabel = document.querySelector("#newEquipmentPrice")?.closest("label")?.querySelector("span");
    if (equipmentPriceLabel) equipmentPriceLabel.textContent = "販売価格（G）";
    const recipeEquipmentLabel = document.querySelector("#recipeEquipmentSelect")?.closest("label")?.querySelector("span");
    if (recipeEquipmentLabel) recipeEquipmentLabel.textContent = "装備";
    const recipeMaterialLabel = document.querySelector("#recipeMaterialSelect")?.closest("label")?.querySelector("span");
    if (recipeMaterialLabel) recipeMaterialLabel.textContent = "素材";
    const recipeQuantityLabel = document.querySelector("#recipeQuantity")?.closest("label")?.querySelector("span");
    if (recipeQuantityLabel) recipeQuantityLabel.textContent = "必要個数";
    const historyDateLabel = document.querySelector("#bazaarHistorySnapshotDateInput")?.closest("label")?.querySelector("span");
    if (historyDateLabel) historyDateLabel.textContent = "保存日付";
    const materialSubmit = document.querySelector("#materialForm button[type='submit']");
    if (materialSubmit) materialSubmit.textContent = "素材を追加";
    const equipmentSubmit = document.querySelector("#equipmentForm button[type='submit']");
    if (equipmentSubmit) equipmentSubmit.textContent = "装備を追加";
    const recipeSubmit = document.querySelector("#recipeForm button[type='submit']");
    if (recipeSubmit) recipeSubmit.textContent = "レシピ行を追加";
    const exportMaterialPricesButton = document.getElementById("exportMaterialPricesButton");
    if (exportMaterialPricesButton) exportMaterialPricesButton.textContent = "単価を保存";
    const importMaterialPricesButton = document.getElementById("importMaterialPricesButton");
    if (importMaterialPricesButton) importMaterialPricesButton.textContent = "単価を読込";
    const saveBazaarHistoryButton = document.getElementById("saveBazaarHistoryButton");
    if (saveBazaarHistoryButton) saveBazaarHistoryButton.textContent = "履歴保存CSVを作成";
  }
  if (uiSettingsResetButton) uiSettingsResetButton.textContent = "初期値に戻す";
  if (uiSettingsExportButton) uiSettingsExportButton.textContent = "設定JSONをダウンロード";
  if (contentEditorResetButton) contentEditorResetButton.textContent = "読込時の本文に戻す";
  if (contentEditorExportButton) contentEditorExportButton.textContent = "本文JSONをダウンロード";
  if (updatesEditorAddButton) updatesEditorAddButton.textContent = "更新情報を追加";
  if (updatesEditorResetButton) updatesEditorResetButton.textContent = "読込時の更新情報に戻す";
  if (updatesEditorExportButton) updatesEditorExportButton.textContent = "更新情報JSONをダウンロード";
  if (adminActionList) adminActionList.hidden = !enabled;
  if (adminPinGate) adminPinGate.hidden = enabled;
}

function isStandaloneDisplayMode() {
  return (
    (typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

function isDirectBazaarAdminRoute() {
  return String(getEntryRouteContext()?.routeSegment || "") === "admin-bazaar";
}

function canAccessAdminTab(tabId) {
  if (tabId === "bazaar-admin") {
    return isAdminModeEnabled || isDirectBazaarAdminRoute();
  }
  if (tabId === "ui-settings" || tabId === "content-editor" || tabId === "updates-editor") {
    return isAdminModeEnabled;
  }
  return true;
}

function shouldUseBottomNavBackButton() {
  return window.innerWidth < 700 && isStandaloneDisplayMode() && appMode !== "home";
}

function shouldShowFloatingHistoryBackButton() {
  if (!isStandaloneDisplayMode()) return false;
  return !shouldUseBottomNavBackButton();
}

function updateHistoryBackButtonVisibility() {
  const bottomNavBackButton = mobileBottomNav?.querySelector('[data-bottom-nav-action="back"]');
  const useBottomNavBackButton = shouldUseBottomNavBackButton();
  const showFloatingHistoryBackButton = shouldShowFloatingHistoryBackButton();
  if (historyBackButton) {
    historyBackButton.hidden = !showFloatingHistoryBackButton;
  }
  if (bottomNavBackButton) {
    bottomNavBackButton.hidden = !useBottomNavBackButton;
  }
  mobileBottomNav?.classList.toggle("has-back-slot", useBottomNavBackButton);
}

function handleHistoryBackNavigation() {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  switchToHomeMode();
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
  const isAdminBazaarMode = appMode === "tool" && activeTabId === "bazaar-admin";
  document.body.classList.toggle("is-home-mode", isHomeMode);
  appRoot?.classList.toggle("is-home-mode", isHomeMode);
  appRoot?.classList.toggle("is-admin-bazaar-mode", isAdminBazaarMode);
  appHeader?.classList.toggle("is-collapsed", !isHomeMode);
  toolSiteSearchDock?.classList.add("is-visible");
  homeDailyInfoSection?.classList.toggle("is-collapsed", !isHomeMode);
  if (!isHomeMode) hideHomeBossCardNotice();
  topQuickAccessSection?.classList.toggle("is-collapsed", !isHomeMode);
  homeBazaarChangeRankingSection?.classList.toggle("is-collapsed", !isHomeMode);
  topUpdateSection?.classList.toggle("is-collapsed", !isHomeMode);
  homeShortcutNoteBottom?.classList.toggle("is-collapsed", !isHomeMode);
  mobileBottomNav?.classList.toggle("is-disabled", isHomeMode);
  if (isHomeMode) {
    setMobileBottomNavHidden(false);
    renderHomeDailyInfo();
    renderHomeBossCardNotice();
    renderHomeBazaarChangeRanking();
  }
  updateHistoryBackButtonVisibility();
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createAdSlotElement(slotName, labelText = "") {
  const wrapper = document.createElement("section");
  wrapper.className = `ad-slot ${slotName}`;
  wrapper.dataset.adSlot = slotName;
  wrapper.setAttribute("aria-label", "ad slot");
  wrapper.innerHTML = `
    <p class="ad-slot-label">${labelText}</p>
    <div class="ad-slot-placeholder" aria-hidden="true">
      <span class="ad-slot-placeholder-text"></span>
    </div>
  `;
  return wrapper;
}

function injectPageAdSlots() {
  if (homeShortcutNoteBottom && !homeShortcutNoteBottom.querySelector('[data-ad-slot="home-bottom"]')) {
    homeShortcutNoteBottom.appendChild(createAdSlotElement("ad-slot-home-bottom"));
  }

  PAGE_AD_SECTION_IDS.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!(section instanceof HTMLElement)) return;

    if (!section.querySelector(`[data-ad-slot="${sectionId}-top"]`)) {
      const topSlot = createAdSlotElement("ad-slot-page-top");
      topSlot.dataset.adSlot = `${sectionId}-top`;
      const heading = section.querySelector("h2");
      if (heading?.nextSibling) {
        section.insertBefore(topSlot, heading.nextSibling);
      } else {
        section.appendChild(topSlot);
      }
    }

    if (!section.querySelector(`[data-ad-slot="${sectionId}-bottom"]`)) {
      const bottomSlot = createAdSlotElement("ad-slot-page-bottom");
      bottomSlot.dataset.adSlot = `${sectionId}-bottom`;
      section.appendChild(bottomSlot);
    }
  });
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
  if (appMode === "tool" && activeTabId === "favorites") {
    commitPendingFavoriteRemovals();
  }
  appMode = "home";
  tabContents.forEach((tab) => tab.classList.remove("active"));
  tabContents.forEach((tab) => {
    tab.hidden = true;
  });
  applyAppMode();
  updateMobileBottomNavState();
  navigateByAppParams({ tab: "", equipmentId: "", materialKey: "" }, { replace: true });
  updateDocumentMetadata();
  if (scroll) scrollToHomeTop();
}

function switchTab(target) {
  const requestedTarget = TAB_IDS.has(target) ? target : "profit";
  const migratedTarget = requestedTarget === "white-boxes" ? "equipment-db" : requestedTarget;
  const normalizedTarget =
    (migratedTarget === "ui-settings" ||
      migratedTarget === "content-editor" ||
      migratedTarget === "updates-editor" ||
      migratedTarget === "bazaar-admin") &&
    !canAccessAdminTab(migratedTarget)
      ? "profit"
      : migratedTarget;
  if (activeTabId === "favorites" && normalizedTarget !== "favorites") {
    commitPendingFavoriteRemovals();
  }
  if (normalizedTarget !== "monster-info") {
    closeMonsterInfoModal();
  }
  if (normalizedTarget !== "equipment-db") {
    closeArmorSetDetailModal();
  }
  activeTabId = normalizedTarget;
  appMode = "tool";
  applyAppMode();
  updateMobileBottomNavState();
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === normalizedTarget));
  tabContents.forEach((tab) => {
    const isActive = tab.id === normalizedTarget;
    tab.classList.toggle("active", isActive);
    tab.hidden = !isActive;
  });
  if (normalizedTarget === "present-codes") {
    renderPresentCodes();
  } else if (normalizedTarget === "field-farming") {
    renderFieldFarmingRanking();
  } else if (normalizedTarget === "routine") {
    renderRoutineTasks();
  } else if (normalizedTarget === "boss-card") {
    renderBossCardTimers();
  } else if (normalizedTarget === "bazaar") {
    renderBazaarPrices();
  } else if (normalizedTarget === "favorites") {
    renderFavoritesPage();
  } else if (normalizedTarget === "orbs") {
    renderOrbCards();
  } else if (normalizedTarget === "white-boxes") {
    selectedEquipmentDbGroup = "weapon";
    renderEquipmentDbCards();
  } else if (normalizedTarget === "equipment-db") {
    renderEquipmentDbCards();
  } else if (normalizedTarget === "monster-info") {
    renderMonsterInfoCards();
  } else if (normalizedTarget === "bazaar-admin") {
    renderBazaarAdminPanel();
  } else if (normalizedTarget === "profit") {
    renderCraftIdealValue();
  }
  prefetchDataForTab(normalizedTarget);
  updateDocumentMetadata();
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
  if (nextValues.itemSearch) params.set("itemSearch", nextValues.itemSearch);
  if (nextValues.equipmentSearch) params.set("equipmentSearch", nextValues.equipmentSearch);
  if (nextValues.orbSearch) params.set("orbSearch", nextValues.orbSearch);
  if (nextValues.monsterSearch) params.set("monsterSearch", nextValues.monsterSearch);
  if (nextValues.equipmentDbGroup === "armor") {
    params.set("equipmentDbGroup", nextValues.equipmentDbGroup);
  }
  if (nextValues.profitEquipmentName) params.set("profitEquipmentName", nextValues.profitEquipmentName);
  if (nextValues.profitEquipmentType) params.set("profitEquipmentType", nextValues.profitEquipmentType);
  if (nextValues.profitEquipmentGroup === "armor" || nextValues.profitEquipmentGroup === "weapon") {
    params.set("profitEquipmentGroup", nextValues.profitEquipmentGroup);
  }
  if (Object.values(PROFIT_EQUIPMENT_NAVIGATION_TYPES).includes(nextValues.profitEntryType)) {
    params.set("profitEntryType", nextValues.profitEntryType);
  }
  if (nextValues.profitArmorSetName) params.set("profitArmorSetName", nextValues.profitArmorSetName);
  if (PROFIT_ARMOR_PART_ORDER.includes(nextValues.profitArmorPart)) params.set("profitArmorPart", nextValues.profitArmorPart);
  return params;
}

function navigateByAppParams(nextValues = {}, options = {}) {
  const { replace = false, preferEntryRoutePath = false } = options;
  const params = buildAppQueryParams(nextValues);
  const currentParams = new URLSearchParams(window.location.search);
  const tab = String(params.get("tab") || "").trim();
  const useEntryRoutePath = preferEntryRoutePath || (Boolean(getEntryRouteContext()) && !currentParams.has("tab"));
  let pathname = getProjectRootPath();

  if (tab && useEntryRoutePath) {
    const routeSegment = ENTRY_ROUTE_TAB_TO_SEGMENT.get(tab);
    if (routeSegment) {
      pathname = `${getProjectBasePath()}/${routeSegment}/`;
      params.delete("tab");
    }
  } else if (!tab) {
    params.delete("tab");
  }

  const query = params.toString();
  const nextUrl = `${pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (replace) {
    window.history.replaceState({}, "", nextUrl);
  } else {
    window.history.pushState({}, "", nextUrl);
  }
}

function navigateByFeatureRoute(nextValues = {}, options = {}) {
  const tab = String(nextValues.tab || "").trim();
  navigateByAppParams(nextValues, {
    ...options,
    preferEntryRoutePath:
      Object.prototype.hasOwnProperty.call(options, "preferEntryRoutePath")
        ? options.preferEntryRoutePath
        : ENTRY_ROUTE_TAB_TO_SEGMENT.has(tab),
  });
}

function buildFeatureRouteUrl(tab, params = new URLSearchParams()) {
  const normalizedTab = String(tab || "").trim();
  const routeSegment = ENTRY_ROUTE_TAB_TO_SEGMENT.get(normalizedTab);
  const pathname = routeSegment ? `${getProjectBasePath()}/${routeSegment}/` : getProjectRootPath();
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}

function getBazaarItemUrl(itemName) {
  const params = new URLSearchParams();
  const normalizedName = String(itemName || "").trim();
  if (normalizedName) params.set("item", normalizedName);
  return buildFeatureRouteUrl("bazaar", params);
}

function getMonsterUrl(monsterName) {
  const params = new URLSearchParams();
  const normalizedName = String(monsterName || "").trim();
  if (normalizedName) params.set("monsterSearch", normalizedName);
  return buildFeatureRouteUrl("monster-info", params);
}

function getMonsterShareUrl(monsterName) {
  const params = new URLSearchParams();
  const normalizedName = String(monsterName || "").trim();
  if (normalizedName) params.set("q", normalizedName);
  return new URL(buildFeatureRouteUrl("monster-info", params), "https://dq10tools.com").href;
}

function getOrbUrl(orbName) {
  const params = new URLSearchParams();
  const normalizedName = String(orbName || "").trim();
  if (normalizedName) params.set("orbSearch", normalizedName);
  return buildFeatureRouteUrl("orbs", params);
}

function getEquipmentUrl(equipmentName) {
  const params = new URLSearchParams();
  const normalizedName = String(equipmentName || "").trim();
  if (normalizedName) params.set("equipmentSearch", normalizedName);
  return buildFeatureRouteUrl("equipment-db", params);
}

function getCraftUrl(equipmentName) {
  const params = new URLSearchParams();
  const normalizedName = String(equipmentName || "").trim();
  if (normalizedName) params.set("equipment", normalizedName);
  return buildFeatureRouteUrl("profit", params);
}

function buildStaticIndividualPageUrl(segment, itemName) {
  const normalizedName = String(itemName || "").trim();
  if (!segment || !normalizedName) return "";
  return `${getProjectBasePath()}/${segment}/${encodeURIComponent(normalizedName)}/`;
}

function buildDirectSearchFallbackUrl(segment, queryKey, itemName) {
  const normalizedName = String(itemName || "").trim();
  if (!segment || !queryKey || !normalizedName) return "";
  const params = new URLSearchParams();
  params.set(queryKey, normalizedName);
  return `${getProjectBasePath()}/${segment}/?${params.toString()}`;
}

function buildIndividualPageActionLink(label, url) {
  const normalizedUrl = String(url || "").trim();
  if (!normalizedUrl) return "";
  return `
    <div class="individual-page-action">
      <a class="individual-page-link" href="${escapeHtml(normalizedUrl)}">${escapeHtml(label || "個別ページを開く")}</a>
    </div>
  `;
}

function getMonsterIndividualPageUrl(monsterName) {
  const normalizedName = String(monsterName || "").trim();
  if (!normalizedName) return "";
  return monsterDetailEntryByName.has(normalizedName)
    ? buildStaticIndividualPageUrl("monster", normalizedName)
    : buildDirectSearchFallbackUrl("monster", "q", normalizedName);
}

function getEquipmentIndividualPageUrl(equipmentName) {
  const normalizedName = String(equipmentName || "").trim();
  if (!normalizedName) return "";
  return equipmentDbEntryByName.has(normalizedName)
    ? buildStaticIndividualPageUrl("equipment", normalizedName)
    : buildDirectSearchFallbackUrl("equipment", "q", normalizedName);
}

function getBazaarIndividualPageUrl(materialName) {
  const normalizedName = String(materialName || "").trim();
  if (!normalizedName) return "";
  return bazaarRowByMaterialName.has(normalizedName)
    ? buildStaticIndividualPageUrl("bazaar", normalizedName)
    : buildDirectSearchFallbackUrl("bazaar", "q", normalizedName);
}

function getRecipeIndividualPageUrl(equipmentName) {
  const normalizedName = String(equipmentName || "").trim();
  if (!normalizedName) return "";
  const hasRecipe = (state.equipments || []).some((equipment) => String(equipment?.name || "").trim() === normalizedName);
  return hasRecipe
    ? buildStaticIndividualPageUrl("recipe", normalizedName)
    : buildDirectSearchFallbackUrl("craft", "q", normalizedName);
}

function getFieldFarmingUrl() {
  return buildFeatureRouteUrl("field-farming");
}

function navigateByDirectFeatureQuery(tab, queryKey, queryValue, options = {}) {
  const normalizedTab = String(tab || "").trim();
  const normalizedKey = String(queryKey || "").trim();
  const normalizedValue = String(queryValue || "").trim();
  const { replace = false } = options;
  const params = new URLSearchParams();

  if (normalizedKey && normalizedValue) {
    params.set(normalizedKey, normalizedValue);
  }

  if (!ENTRY_ROUTE_TAB_TO_SEGMENT.has(normalizedTab) && normalizedTab) {
    params.set("tab", normalizedTab);
  }

  const nextUrl = `${buildFeatureRouteUrl(normalizedTab, params)}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl === currentUrl) return;

  if (replace) {
    window.history.replaceState({}, "", nextUrl);
  } else {
    window.history.pushState({}, "", nextUrl);
  }
}

function syncProfitEquipmentUrl(equipmentId, options = {}) {
  const normalizedEquipmentId = String(equipmentId || "").trim();
  const equipment = state.equipments.find((entry) => String(entry?.id || "") === normalizedEquipmentId);
  const equipmentName = String(equipment?.name || "").trim();
  if (equipmentName) {
    navigateByDirectFeatureQuery("profit", "equipment", equipmentName, options);
    return;
  }
  navigateByFeatureRoute({ tab: "profit", equipmentId: normalizedEquipmentId, materialKey: "" }, options);
}

function syncBazaarItemUrl(materialName, options = {}) {
  const normalizedName = String(materialName || "").trim();
  if (normalizedName) {
    navigateByDirectFeatureQuery("bazaar", "item", normalizedName, options);
    return;
  }
  navigateByFeatureRoute({ tab: "bazaar", equipmentId: "", materialKey: "" }, options);
}

function syncMonsterInfoUrl(monsterName, options = {}) {
  const normalizedName = String(monsterName || "").trim();
  if (normalizedName) {
    const nextUrl = `${getMonsterUrl(normalizedName)}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      if (options.replace) {
        window.history.replaceState({}, "", nextUrl);
      } else {
        window.history.pushState({}, "", nextUrl);
      }
    }
    return;
  }
  navigateByFeatureRoute({ tab: "monster-info", monsterSearch: "", equipmentId: "", materialKey: "" }, options);
}

function syncOrbUrl(orbName, options = {}) {
  const normalizedName = String(orbName || "").trim();
  if (normalizedName) {
    const nextUrl = `${getOrbUrl(normalizedName)}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      if (options.replace) {
        window.history.replaceState({}, "", nextUrl);
      } else {
        window.history.pushState({}, "", nextUrl);
      }
    }
    return;
  }
  navigateByFeatureRoute({ tab: "orbs", orbSearch: "", equipmentId: "", materialKey: "" }, options);
}

function syncEquipmentUrl(equipmentName, options = {}) {
  const normalizedName = String(equipmentName || "").trim();
  if (normalizedName) {
    const nextUrl = `${getEquipmentUrl(normalizedName)}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      if (options.replace) {
        window.history.replaceState({}, "", nextUrl);
      } else {
        window.history.pushState({}, "", nextUrl);
      }
    }
    return;
  }
  navigateByFeatureRoute({ tab: "equipment-db", equipmentSearch: "", equipmentId: "", materialKey: "" }, options);
}

function syncFieldFarmingUrl(options = {}) {
  const nextUrl = `${getFieldFarmingUrl()}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl === currentUrl) return;
  if (options.replace) {
    window.history.replaceState({}, "", nextUrl);
  } else {
    window.history.pushState({}, "", nextUrl);
  }
}

function getDocumentDescriptionMeta() {
  return document.querySelector('meta[name="description"]');
}

function getDefaultTabDocumentDescription(tabId) {
  switch (String(tabId || "").trim()) {
    case "bazaar":
      return "バザー価格、前日比、更新日時を確認できるDQ10ツールです。価格・情報は参考用としてご利用ください。";
    case "monster-info":
      return "モンスターの通常ドロップ、レアドロップ、白宝箱、宝珠、生息地を確認できるDQ10ツールです。";
    case "orbs":
      return "宝珠の効果とドロップモンスターを確認できるDQ10ツールです。";
    case "equipment-db":
      return "装備情報、白宝箱ドロップモンスター、防具セット詳細を確認できるDQ10ツールです。";
    case "profit":
      return "装備の素材、原価、職人アシスト計算を確認できるDQ10ツールです。";
    case "field-farming":
      return "フィールド狩りのおすすめモンスターとドロップ相場を確認できるDQ10ツールです。";
    default:
      return DEFAULT_DOCUMENT_DESCRIPTION;
  }
}

function getTargetDocumentDescription(tabId, targetName) {
  const normalizedName = String(targetName || "").trim();
  if (!normalizedName) return getDefaultTabDocumentDescription(tabId);
  switch (String(tabId || "").trim()) {
    case "bazaar":
      return `${normalizedName}のバザー価格、前日比、更新日時を確認できます。`;
    case "monster-info":
      return `${normalizedName}の通常ドロップ、レアドロップ、白宝箱、宝珠、生息地を確認できます。`;
    case "orbs":
      return `${normalizedName}の効果とドロップモンスターを確認できます。`;
    case "equipment-db":
      return `${normalizedName}の装備情報と白宝箱ドロップモンスターを確認できます。`;
    case "profit":
      return `${normalizedName}の素材、原価、職人アシスト計算を確認できます。`;
    default:
      return `${normalizedName}の情報を確認できるDQ10ツールです。`;
  }
}

function getActiveDocumentTargetName() {
  if (appMode !== "tool") return "";
  if (activeTabId === "profit") {
    return String(getSelectedEquipment()?.name || "").trim();
  }
  if (activeTabId === "bazaar") {
    const detailRow = activeBazaarDetailModalKey ? getBazaarRowByMaterialKey(activeBazaarDetailModalKey) : null;
    return String(detailRow?.materialName || selectedBazaarMaterialName || "").trim();
  }
  if (activeTabId === "monster-info") {
    const activeEntry = activeMonsterInfoId ? monsterDetailEntryById.get(String(activeMonsterInfoId || "")) : null;
    return String(activeEntry?.name || monsterInfoSearchKeyword || "").trim();
  }
  if (activeTabId === "orbs") {
    const activeEntry = expandedOrbId ? orbEntryById.get(String(expandedOrbId || "")) : null;
    return String(activeEntry?.orbName || orbSearchKeyword || "").trim();
  }
  if (activeTabId === "equipment-db") {
    const activeArmorSetEntry = activeArmorSetDetailId ? findEquipmentDbEntryById(String(activeArmorSetDetailId || "")) : null;
    const expandedEntry = expandedEquipmentDbId ? findEquipmentDbEntryById(String(expandedEquipmentDbId || "")) : null;
    return String(activeArmorSetEntry?.equipmentName || expandedEntry?.equipmentName || equipmentDbNameKeyword || "").trim();
  }
  return "";
}

function updateDocumentMetadata() {
  const descriptionMeta = getDocumentDescriptionMeta();
  if (appMode !== "tool") {
    document.title = DEFAULT_DOCUMENT_TITLE;
    if (descriptionMeta) descriptionMeta.setAttribute("content", DEFAULT_DOCUMENT_DESCRIPTION);
    return;
  }

  const pageLabel = String(TAB_DOCUMENT_LABELS[activeTabId] || "").trim();
  const targetName = getActiveDocumentTargetName();
  if (targetName && pageLabel) {
    document.title = `${targetName}｜${pageLabel}｜${DEFAULT_DOCUMENT_TITLE}`;
    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", getTargetDocumentDescription(activeTabId, targetName));
    }
    return;
  }

  document.title = pageLabel ? `${pageLabel}｜${DEFAULT_DOCUMENT_TITLE}` : DEFAULT_DOCUMENT_TITLE;
  if (descriptionMeta) {
    descriptionMeta.setAttribute("content", pageLabel ? getDefaultTabDocumentDescription(activeTabId) : DEFAULT_DOCUMENT_DESCRIPTION);
  }
}

function hasDirectDataQueryParams(params = new URLSearchParams(window.location.search)) {
  return params.has("equipment") || params.has("item") || params.has("name");
}

function applyAppRouteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const tab = resolveRouteTabFromLocation();
  if (TAB_IDS.has(tab)) {
    switchTab(tab);
  } else {
    switchToHomeMode({ scroll: false });
  }

  const equipmentId = String(params.get("equipmentId") || "").trim();
  const profitEntryType = String(params.get("profitEntryType") || "").trim();
  const profitArmorSetName = String(params.get("profitArmorSetName") || "").trim();
  const profitArmorPart = String(params.get("profitArmorPart") || "").trim();
  const profitEquipmentName = String(params.get("profitEquipmentName") || (tab === "profit" ? params.get("equipment") || params.get("q") || "" : "")).trim();
  const profitEquipmentType = String(params.get("profitEquipmentType") || "").trim();
  clearProfitArmorSetContext();
  if (profitEntryType === PROFIT_EQUIPMENT_NAVIGATION_TYPES.armorSet && profitArmorSetName) {
    pendingProfitArmorSetContext = buildProfitArmorSetContext(profitArmorSetName);
    if (profitArmorPart) {
      const resolvedArmorPartEquipmentId = resolveArmorSetPartEquipmentId(profitArmorSetName, profitArmorPart);
      if (resolvedArmorPartEquipmentId) {
        selectProfitEquipment(resolvedArmorPartEquipmentId);
      } else {
        pendingProfitArmorSetContext = buildProfitArmorSetContext(profitArmorSetName, {
          errorMessage: "指定された部位レシピを見つけられませんでした。部位を選び直してください。",
        });
      }
    }
  } else {
    const resolvedEquipmentId = resolveProfitEquipmentIdFromParams({
      equipmentId,
      equipmentName: profitEquipmentName,
      equipmentType: profitEquipmentType,
    });
    if (resolvedEquipmentId) {
      selectProfitEquipment(resolvedEquipmentId);
    }
  }
  const equipmentDbGroupParam = String(params.get("equipmentDbGroup") || "").trim();
  if (equipmentDbGroupParam === "armor" || equipmentDbGroupParam === "weapon") {
    selectedEquipmentDbGroup = equipmentDbGroupParam;
  } else if (tab === "equipment-db") {
    selectedEquipmentDbGroup = "weapon";
    selectedEquipmentDbSort = "level_desc";
    equipmentDbMonsterKeyword = "";
    expandedEquipmentDbId = "";
  }
  const directEquipmentNameParam = String(tab === "equipment-db" ? params.get("name") || "" : "").trim();
  const equipmentSearchParam = String(params.get("equipmentSearch") || directEquipmentNameParam).trim();
  if (equipmentSearchParam) {
    equipmentDbNameKeyword = equipmentSearchParam;
    pendingEquipmentDbFocusName = directEquipmentNameParam || equipmentSearchParam;
    pendingEquipmentDbAutoOpenName = directEquipmentNameParam || equipmentSearchParam;
  } else if (tab === "equipment-db") {
    equipmentDbNameKeyword = "";
    pendingEquipmentDbFocusName = "";
    pendingEquipmentDbAutoOpenName = "";
  }
  const directItemParam = String(tab === "bazaar" ? params.get("item") || "" : "").trim();
  const itemSearchParam = String(params.get("itemSearch") || directItemParam).trim();
  if (itemSearchParam) {
    queueBazaarUrlItemApplication(itemSearchParam);
    if (directItemParam) {
      pendingBazaarFocusMaterialName = directItemParam;
      pendingBazaarAutoOpenMaterialKey = "";
    }
  } else if (tab === "bazaar") {
    bazaarSearchText = "";
    selectedBazaarMaterialName = "";
    pendingBazaarFocusMaterialName = "";
    pendingBazaarAutoOpenMaterialKey = "";
    pendingBazaarUrlItemName = "";
  }
  const orbSearchParam = String(params.get("orbSearch") || "").trim();
  if (orbSearchParam) {
    orbSearchKeyword = orbSearchParam;
    selectedOrbCategory = "";
  } else if (tab === "orbs") {
    orbSearchKeyword = "";
    selectedOrbCategory = "";
    expandedOrbId = "";
  }
  const directMonsterNameParam = String(tab === "monster-info" ? params.get("name") || params.get("q") || "" : "").trim();
  const monsterSearchParam = String(params.get("monsterSearch") || directMonsterNameParam).trim();
  if (monsterSearchParam) {
    monsterInfoSearchKeyword = monsterSearchParam;
    selectedMonsterInfoType = "";
    pendingMonsterInfoFocusName = directMonsterNameParam || monsterSearchParam;
    pendingMonsterInfoAutoOpenName = directMonsterNameParam || monsterSearchParam;
  } else if (tab === "monster-info") {
    monsterInfoSearchKeyword = "";
    selectedMonsterInfoType = "";
    selectedMonsterInfoSort = "exp_asc";
    activeMonsterInfoId = "";
    pendingMonsterInfoFocusName = "";
    pendingMonsterInfoAutoOpenName = "";
  }

  pendingBazaarFocusMaterialKey = String(params.get("materialKey") || "").trim();
  if (
    tab === "field-farming" &&
    window.location.pathname === getProjectRootPath() &&
    String(params.get("tab") || "").trim() === "field-farming" &&
    params.size === 1
  ) {
    syncFieldFarmingUrl({ replace: true });
  }
  updateDocumentMetadata();
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
  updateHistoryBackButtonVisibility();
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
  navigateByFeatureRoute({
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

if (bazaarDetailModalBody) {
  bazaarDetailModalBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const closeButton = target.closest(".bazaar-detail-modal-close");
    if (closeButton && bazaarDetailModalDialog?.contains(closeButton)) {
      event.preventDefault();
      event.stopPropagation();
      closeBazaarDetailModal();
      return;
    }
  });
  bazaarDetailModalBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const memoButton = target.closest("[data-memo-bazaar-key]");
    if (!memoButton || !bazaarDetailModalBody.contains(memoButton)) return;
    const materialKey = String(memoButton.dataset.memoBazaarKey || "");
    const row = getBazaarRowByMaterialKey(materialKey);
    if (!row) return;
    event.stopPropagation();
    addMemoEntry(createBazaarMemoEntry(row));
  });
  bazaarDetailModalBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const toggleButton = target.closest("[data-bazaar-related-toggle]");
    if (toggleButton && bazaarDetailModalBody.contains(toggleButton)) {
      event.preventDefault();
      const toggleKey = String(toggleButton.dataset.bazaarRelatedToggle || "").trim();
      if (toggleKey === "" || !activeBazaarDetailModalKey) return;
      const isRecipeToggle = toggleKey.endsWith(":recipes");
      const targetMap = isRecipeToggle ? bazaarRelatedRecipeExpandStateByMaterialKey : bazaarRelatedMonsterExpandStateByKey;
      targetMap.set(toggleKey, !(targetMap.get(toggleKey) === true));
      void openBazaarDetailModal(activeBazaarDetailModalKey);
      return;
    }
    const monsterButton = target.closest("[data-bazaar-related-monster-name]");
    if (monsterButton && bazaarDetailModalBody.contains(monsterButton)) {
      event.preventDefault();
      event.stopPropagation();
      const monsterName = String(monsterButton.dataset.bazaarRelatedMonsterName || "").trim();
      if (!monsterName) return;
      closeBazaarDetailModal();
      void openMonsterInfoFromOrb(monsterName);
      return;
    }
    const equipmentButton = target.closest("[data-bazaar-related-equipment-name]");
    if (equipmentButton && bazaarDetailModalBody.contains(equipmentButton)) {
      event.preventDefault();
      event.stopPropagation();
      const equipmentName = String(equipmentButton.dataset.bazaarRelatedEquipmentName || "").trim();
      if (!equipmentName) return;
      closeBazaarDetailModal();
      void openEquipmentDbFromMonsterWhiteBox(equipmentName);
      return;
    }
    const craftButton = target.closest("[data-bazaar-related-craft-name]");
    if (craftButton && bazaarDetailModalBody.contains(craftButton)) {
      event.preventDefault();
      event.stopPropagation();
      const equipmentName = String(craftButton.dataset.bazaarRelatedCraftName || "").trim();
      if (!equipmentName) return;
      const equipmentId = resolveProfitEquipmentIdFromParams({ equipmentName });
      if (equipmentId) {
        closeBazaarDetailModal();
        openProfitFromEquipmentId(equipmentId);
      } else {
        closeBazaarDetailModal();
        clearProfitArmorSetContext();
        switchTab("profit");
        navigateByFeatureRoute({
          tab: "profit",
          equipmentId: "",
          materialKey: "",
          profitEntryType: PROFIT_EQUIPMENT_NAVIGATION_TYPES.weapon,
          profitEquipmentName: equipmentName,
        });
        rerenderAll();
      }
    }
  });
  bazaarDetailModalBody.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    const materialKey = String(target.dataset.bazaarHistoryMonthSelect || "");
    if (materialKey === "") return;
    bazaarDetailMonthByMaterialKey.set(materialKey, String(target.value || "").trim());
    openBazaarDetailModal(materialKey);
  });
}

if (fieldFarmingMapModalOverlay) {
  fieldFarmingMapModalOverlay.addEventListener("click", (event) => {
    if (event.target === fieldFarmingMapModalOverlay) {
      closeFieldFarmingMapModal();
    }
  });
}
function closeMonsterInfoModal() {
  if (!monsterInfoModalOverlay) return;
  monsterInfoModalOverlay.hidden = true;
  if (monsterInfoModalBody) monsterInfoModalBody.innerHTML = "";
  activeMonsterInfoId = "";
}

if (monsterInfoModalOverlay) {
  monsterInfoModalOverlay.addEventListener("click", (event) => {
    if (event.target === monsterInfoModalOverlay) {
      closeMonsterInfoModal();
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

if (bazaarDetailModalDialog) {
  bazaarDetailModalDialog.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest(".bazaar-detail-modal-close")) return;
    event.preventDefault();
    event.stopPropagation();
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
if (monsterInfoModalCloseButton) {
  monsterInfoModalCloseButton.addEventListener("click", () => {
    closeMonsterInfoModal();
  });
}
if (monsterInfoModalBody) {
  monsterInfoModalBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const memoButton = target.closest("[data-memo-monster-id]");
    if (memoButton && monsterInfoModalBody.contains(memoButton)) {
      event.preventDefault();
      event.stopPropagation();
      const entry = monsterDetailEntryById.get(String(memoButton.dataset.memoMonsterId || ""));
      addMemoEntry(createMonsterMemoEntry(entry));
      closeMonsterInfoModal();
      return;
    }
    const shareButton = target.closest("[data-monster-share-name]");
    if (shareButton && monsterInfoModalBody.contains(shareButton)) {
      event.preventDefault();
      event.stopPropagation();
      void copyMonsterShareUrl(String(shareButton.dataset.monsterShareName || ""));
      return;
    }
    const orbButton = target.closest("[data-monster-orb-name]");
    if (orbButton && monsterInfoModalBody.contains(orbButton)) {
      event.preventDefault();
      void openOrbFromMonsterInfo(String(orbButton.dataset.monsterOrbName || ""));
      return;
    }
    const bazaarButton = target.closest("[data-monster-drop-bazaar-item]");
    if (bazaarButton && monsterInfoModalBody.contains(bazaarButton)) {
      event.preventDefault();
      event.stopPropagation();
      openBazaarPageForItem(String(bazaarButton.dataset.monsterDropBazaarItem || ""));
      return;
    }
    const button = target.closest("[data-monster-white-box-equipment]");
    if (!button || !monsterInfoModalBody.contains(button)) return;
    event.preventDefault();
    void openEquipmentDbFromMonsterWhiteBox(String(button.dataset.monsterWhiteBoxEquipment || ""));
  });
}
if (armorSetDetailModalOverlay) {
  armorSetDetailModalOverlay.addEventListener("click", (event) => {
    if (event.target === armorSetDetailModalOverlay) {
      closeArmorSetDetailModal();
    }
  });
}
if (armorSetDetailModalCloseButton) {
  armorSetDetailModalCloseButton.addEventListener("click", () => {
    closeArmorSetDetailModal();
  });
}
if (monsterInfoSearchInput) {
  monsterInfoSearchInput.addEventListener("input", () => {
    monsterInfoSearchKeyword = monsterInfoSearchInput.value;
    if (String(monsterInfoSearchKeyword || "").trim() !== "") {
      selectedMonsterInfoType = "";
      keepMonsterInfoTypeCleared = false;
    }
    renderMonsterInfoCards();
  });
}
if (monsterInfoClearFiltersButton) {
  monsterInfoClearFiltersButton.addEventListener("click", () => {
    clearMonsterInfoFilters();
  });
}
if (monsterInfoTypeFilterSelect) {
  monsterInfoTypeFilterSelect.addEventListener("change", () => {
    selectedMonsterInfoType = monsterInfoTypeFilterSelect.value;
    keepMonsterInfoTypeCleared = selectedMonsterInfoType === "";
    renderMonsterInfoCards();
  });
}
if (monsterInfoSortSelect) {
  monsterInfoSortSelect.addEventListener("change", () => {
    selectedMonsterInfoSort = String(monsterInfoSortSelect.value || "exp_asc");
    renderMonsterInfoCards();
  });
}
if (monsterInfoListWrap) {
  monsterInfoListWrap.addEventListener("click", (event) => {
    const memoButton = event.target.closest("[data-memo-monster-id]");
    if (memoButton && monsterInfoListWrap.contains(memoButton)) {
      event.preventDefault();
      event.stopPropagation();
      const entry = monsterDetailEntryById.get(String(memoButton.dataset.memoMonsterId || ""));
      addMemoEntry(createMonsterMemoEntry(entry));
      return;
    }
    const button = event.target.closest("[data-monster-info-id]");
    if (!(button instanceof HTMLElement)) return;
    const targetId = String(button.dataset.monsterInfoId || "");
    const entry = monsterDetailEntryById.get(targetId);
    if (!entry || !monsterInfoModalOverlay || !monsterInfoModalBody || activeTabId !== "monster-info") return;
    syncMonsterInfoUrl(String(entry.name || "").trim());
    openMonsterInfoDetailModal(entry);
  });

  monsterInfoListWrap.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-memo-monster-id]")) return;
    const button = target.closest("[data-monster-info-id]");
    if (!(button instanceof HTMLElement) || !monsterInfoListWrap.contains(button)) return;
    event.preventDefault();
    button.click();
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

if (homeBazaarChangeRankingSortSelect) {
  homeBazaarChangeRankingSortSelect.addEventListener("change", (event) => {
    homeBazaarChangeRankingSort = String(event.target.value || "up") === "down" ? "down" : "up";
    renderHomeBazaarChangeRanking();
  });
}

if (homeBossCardNoticeCloseButton) {
  homeBossCardNoticeCloseButton.addEventListener("click", () => {
    saveBossCardNoticeSeenState();
    hideHomeBossCardNotice();
  });
}

if (homeBossCardNoticeOpenButton) {
  homeBossCardNoticeOpenButton.addEventListener("click", () => {
    saveBossCardNoticeSeenState();
    hideHomeBossCardNotice();
    scrollToBlock("boss-card");
  });
}

mobileBottomNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    const action = String(item.dataset.bottomNavAction || "");
    if (action === "back") {
      handleHistoryBackNavigation();
      setMenuOpen(false);
      return;
    }
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
  updateHistoryBackButtonVisibility();
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
    bazaarAdminClipboardReadStateByRowId.set(rowId, String(target.value || "").trim() === "" ? "idle" : "filled");
    if (String(target.value || "").trim() === "") {
      setBazaarAdminPasteStatus(rowId, "");
    }
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

  bazaarAdminListWrap.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    void tryAutoPasteBazaarAdminTextarea(target);
  });

  bazaarAdminListWrap.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement) {
      void tryAutoPasteBazaarAdminTextarea(target);
      return;
    }
    const textarea = target instanceof Element ? target.closest("[data-bazaar-admin-paste-input]") : null;
    if (textarea instanceof HTMLTextAreaElement) {
      void tryAutoPasteBazaarAdminTextarea(textarea);
      return;
    }
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
    if (activeMonsterInfoId) {
      closeMonsterInfoModal();
      return;
    }
    if (activeArmorSetDetailId) {
      closeArmorSetDetailModal();
      return;
    }
    if (isMaterialSearchCandidateListOpen) {
      isMaterialSearchCandidateListOpen = false;
      renderMaterialSearchCandidates();
      return;
    }
    if (isEquipmentSearchCandidateListOpen) {
      isEquipmentSearchCandidateListOpen = false;
      renderEquipmentSearchCandidates();
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
  closeBazaarDetailModal();
  closeMonsterInfoModal();
  closeArmorSetDetailModal();
  applyAppRouteFromUrl();
  rerenderActiveTabOnly();
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

function getEquipmentSearchCandidates() {
  const normalizedKeyword = equipmentSearchKeyword.trim().toLowerCase();
  if (normalizedKeyword === "") return [];
  // 装備名検索の候補は、職人/カテゴリ絞り込みに左右されず名称一致を優先します。
  return state.equipments
    .filter((equipment) => String(equipment?.name || "").trim().toLowerCase().includes(normalizedKeyword))
    .sort(compareEquipmentsByBaseSort)
    .slice(0, 30);
}

function renderEquipmentSearchCandidates() {
  if (!equipmentSearchCandidateWrap) return;
  const shouldShow =
    isEquipmentSearchExpanded &&
    isEquipmentSearchCandidateListOpen &&
    equipmentSearchKeyword.trim() !== "";

  if (!shouldShow) {
    equipmentSearchCandidateWrap.hidden = true;
    equipmentSearchCandidateWrap.innerHTML = "";
    return;
  }

  const candidates = getEquipmentSearchCandidates();
  equipmentSearchCandidateWrap.hidden = false;

  if (candidates.length === 0) {
    equipmentSearchCandidateWrap.innerHTML = `<p class="site-search-empty assist-search-empty">該当する装備がありません。</p>`;
    return;
  }

  equipmentSearchCandidateWrap.innerHTML = candidates
    .map((equipment) => {
      const roundedMaterialCost = getRoundedEquipmentMaterialCost(equipment.id);
      const costText = roundedMaterialCost.toLocaleString("ja-JP");
      return `
        <button type="button" class="site-search-result-item assist-search-candidate-item" data-equipment-search-candidate-id="${escapeHtml(equipment.id)}">
          <p class="site-search-result-main">${escapeHtml(equipment.name)}</p>
          <p class="site-search-result-meta">
            <span class="site-search-chip site-search-chip-type">レシピ</span>
            <span class="site-search-chip">職人アシスト</span>
            ${equipment.category ? `<span class="site-search-chip">${escapeHtml(equipment.category)}</span>` : ""}
            <span class="site-search-chip">原価：${costText} G</span>
          </p>
        </button>
      `;
    })
    .join("");
}

function getHomeBazaarChangeRankingRows() {
  if (!Array.isArray(bazaarPrices) || bazaarPrices.length === 0) return [];
  const filteredRows = bazaarPrices.filter((row) => {
    if (!row || !row.materialName) return false;
    if (!isMonitoringByComment(row.comment)) return false;
    if (!Number.isFinite(row.todayPrice)) return false;
    if (!Number.isFinite(row.previousDayPrice) || row.previousDayPrice === 0) return false;
    const changeRate = getBazaarRowChangeRate(row);
    if (!Number.isFinite(changeRate)) return false;
    if (homeBazaarChangeRankingSort === "down") return changeRate < 0;
    return changeRate > 0;
  });
  return filteredRows
    .slice()
    .sort((a, b) => {
      const aRate = getBazaarRowChangeRate(a);
      const bRate = getBazaarRowChangeRate(b);
      return homeBazaarChangeRankingSort === "down" ? aRate - bRate : bRate - aRate;
    })
    .slice(0, 10);
}

function getHomeBazaarLatestUpdatedAtText() {
  if (!Array.isArray(bazaarPrices) || bazaarPrices.length === 0) return "";
  const updatedValues = bazaarPrices
    .filter((row) => row?.materialName && isMonitoringByComment(row.comment))
    .map((row) => String(row.updatedAt || "").trim())
    .filter(Boolean);
  if (updatedValues.length === 0) return "";

  const latest = updatedValues.reduce((currentLatest, value) => {
    const currentTime = new Date(currentLatest.replace(/-/g, "/")).getTime();
    const nextTime = new Date(value.replace(/-/g, "/")).getTime();
    if (Number.isFinite(nextTime) && (!Number.isFinite(currentTime) || nextTime > currentTime)) return value;
    return currentLatest;
  }, updatedValues[0]);

  return formatBazaarPageUpdatedAt(latest);
}

function renderHomeBazaarChangeRanking() {
  if (!homeBazaarChangeRankingSection || !homeBazaarChangeRankingWrap) return;
  if (appMode !== "home") return;
  if (homeBazaarChangeRankingSortSelect) {
    homeBazaarChangeRankingSortSelect.value = homeBazaarChangeRankingSort;
  }
  if (homeBazaarChangeRankingNote) {
    homeBazaarChangeRankingNote.textContent =
      homeBazaarChangeRankingSort === "down"
        ? "前日比で下落率が大きい素材を10件表示しています。"
        : "前日比で上昇率が高い素材を10件表示しています。";
  }
  if (homeBazaarChangeRankingUpdatedAt) {
    const updatedAtText = hasLoadedBazaarPrices ? getHomeBazaarLatestUpdatedAtText() : "";
    homeBazaarChangeRankingUpdatedAt.hidden = updatedAtText === "";
    homeBazaarChangeRankingUpdatedAt.textContent =
      updatedAtText === "" ? "" : `更新時刻：${updatedAtText}　※価格は更新時刻時点の最安値目安です`;
  }
  if (isBazaarLoading && !hasLoadedBazaarPrices) {
    homeBazaarChangeRankingSection.hidden = false;
    homeBazaarChangeRankingWrap.innerHTML = `<p class="home-bazaar-change-ranking-empty">読み込み中です。しばらくお待ちください。</p>`;
    return;
  }
  if (!hasLoadedBazaarPrices) {
    homeBazaarChangeRankingSection.hidden = false;
    homeBazaarChangeRankingWrap.innerHTML = `<p class="home-bazaar-change-ranking-empty">読み込み中です。しばらくお待ちください。</p>`;
    void ensureBazaarPricesLoaded();
    return;
  }
  const rows = getHomeBazaarChangeRankingRows();
  if (rows.length === 0) {
    homeBazaarChangeRankingSection.hidden = false;
    homeBazaarChangeRankingWrap.innerHTML = `<p class="home-bazaar-change-ranking-empty">現在表示できる変動データがありません。</p>`;
    return;
  }
  homeBazaarChangeRankingSection.hidden = false;
  homeBazaarChangeRankingWrap.innerHTML = `
    <div class="home-bazaar-change-ranking-list">
      ${rows
        .map((row, index) => {
          const rank = index + 1;
          const changePresentation = getBazaarChangePresentation(getBazaarRowChangeRate(row));
          return `
            <button
              type="button"
              class="home-bazaar-change-item"
              data-home-bazaar-material-key="${escapeHtml(row.materialKey)}"
              aria-label="${escapeHtml(row.materialName)}のバザー詳細を開く"
            >
              <span class="home-bazaar-change-rank">${rank}位</span>
              <span class="home-bazaar-change-main">
                <strong class="home-bazaar-change-name">${escapeHtml(row.materialName)}</strong>
                <span class="home-bazaar-change-prices">本日 ${formatGold(row.todayPrice)} / 前日 ${formatGold(row.previousDayPrice)}</span>
              </span>
              <span class="home-bazaar-change-rate ${changePresentation.toneClass}">前日比 ${escapeHtml(changePresentation.text)}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
  homeBazaarChangeRankingWrap.querySelectorAll("[data-home-bazaar-material-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const materialKey = String(button.dataset.homeBazaarMaterialKey || "");
      if (materialKey === "") return;
      void openBazaarDetailModal(materialKey);
    });
  });
}

function getMaterialSearchCandidates() {
  const keyword = materialSearchKeyword.trim().toLowerCase();
  if (keyword === "") return { materials: [], equipments: [] };

  const materials = state.materials
    .filter((material) => String(material?.name || "").trim().toLowerCase().includes(keyword))
    .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "ja"))
    .slice(0, 8);

  const { filteredEquipments, matchedRecipeByEquipmentId } = getFilteredEquipmentContext();
  const equipments = filteredEquipments.slice(0, 10).map((equipment) => ({
    equipment,
    matchedMaterials: matchedRecipeByEquipmentId.get(equipment.id) || [],
  }));

  return { materials, equipments };
}

function renderMaterialSearchCandidates() {
  if (!materialSearchCandidateWrap) return;
  const shouldShow =
    isMaterialSearchExpanded &&
    isMaterialSearchCandidateListOpen &&
    materialSearchKeyword.trim() !== "";

  if (!shouldShow) {
    materialSearchCandidateWrap.hidden = true;
    materialSearchCandidateWrap.innerHTML = "";
    return;
  }

  const { materials, equipments } = getMaterialSearchCandidates();
  materialSearchCandidateWrap.hidden = false;

  if (materials.length === 0 && equipments.length === 0) {
    materialSearchCandidateWrap.innerHTML = `<p class="site-search-empty assist-search-empty">該当する素材・装備がありません。</p>`;
    return;
  }

  const materialHtml = materials
    .map((material) => {
      const relatedEquipmentCount = state.recipes.filter((row) => row.materialId === material.id).length;
      return `
        <button type="button" class="site-search-result-item assist-search-candidate-item" data-material-search-candidate-material-id="${escapeHtml(material.id)}">
          <p class="site-search-result-main">${escapeHtml(material.name)}</p>
          <p class="site-search-result-meta">
            <span class="site-search-chip site-search-chip-type">素材</span>
            <span class="site-search-chip">該当装備 ${relatedEquipmentCount}件</span>
          </p>
        </button>
      `;
    })
    .join("");

  const equipmentHtml = equipments
    .map(({ equipment, matchedMaterials }) => {
      const roundedMaterialCost = getRoundedEquipmentMaterialCost(equipment.id);
      const materialSummary = matchedMaterials
        .map((material) => `${material.materialName}×${material.quantity}`)
        .join(" / ");
      return `
        <button type="button" class="site-search-result-item assist-search-candidate-item" data-material-search-candidate-equipment-id="${escapeHtml(equipment.id)}">
          <p class="site-search-result-main">${escapeHtml(equipment.name)}</p>
          <p class="site-search-result-meta">
            <span class="site-search-chip site-search-chip-type">装備</span>
            <span class="site-search-chip">この装備に使用</span>
            ${equipment.category ? `<span class="site-search-chip">${escapeHtml(equipment.category)}</span>` : ""}
            <span class="site-search-chip">原価：${roundedMaterialCost.toLocaleString("ja-JP")} G</span>
          </p>
          ${materialSummary ? `<p class="assist-search-candidate-note">${escapeHtml(materialSummary)}</p>` : ""}
        </button>
      `;
    })
    .join("");

  materialSearchCandidateWrap.innerHTML = `${materialHtml}${equipmentHtml}`;
}

function applyProfitEquipmentSelection(equipmentId, options = {}) {
  const normalizedEquipmentId = String(equipmentId || "");
  selectedEquipmentId = normalizedEquipmentId;
  clearProfitArmorSetContext();
  void ensureBazaarPricesLoaded();
  if (activeTabId === "profit") {
    syncProfitEquipmentUrl(selectedEquipmentId);
  }
  const eq = getSelectedEquipment();
  syncSalePriceInputs({ force: true });
  renderRecipeTable();
  renderCraftIdealValue();
  renderToolSection();
  calcAndRenderSummary();
  renderEquipmentSelectors();
  if (options.closeCandidates) {
    isEquipmentSearchCandidateListOpen = false;
    isMaterialSearchCandidateListOpen = false;
    renderEquipmentSearchCandidates();
    renderMaterialSearchCandidates();
  }
}

function getEquipmentDbGroupForWhiteBoxItem(itemName) {
  const normalizedName = String(itemName || "").trim();
  if (normalizedName === "") return "weapon";

  const matchedEquipment =
    equipmentDbEntryByName.get(normalizedName) ||
    (equipmentDbEntries || []).find((entry) => String(entry?.equipmentName || "").includes(normalizedName));
  if (matchedEquipment) {
    return String(matchedEquipment.equipmentGroup || "weapon") === "armor" ? "armor" : "weapon";
  }

  const matchedWhiteBox = whiteBoxEntryByItemName.get(normalizedName);
  return getWhiteBoxTypeBySlot(matchedWhiteBox?.itemSlot) === "armor" ? "armor" : "weapon";
}

function getEquipmentDbTypeForWhiteBoxItem(itemName, equipmentGroup) {
  if (equipmentGroup === "armor") return "";
  const normalizedName = String(itemName || "").trim();
  const matchedEquipment = equipmentDbWeaponEntryByName.get(normalizedName);
  if (matchedEquipment?.equipmentType) return String(matchedEquipment.equipmentType || "").trim();
  const matchedWhiteBox = whiteBoxEntryByItemName.get(normalizedName);
  return String(matchedWhiteBox?.itemSlot || "").trim();
}

async function openEquipmentDbFromMonsterWhiteBox(itemName) {
  const normalizedName = String(itemName || "").trim();
  if (normalizedName === "" || normalizedName === "-") return;

  closeMonsterInfoModal();
  await ensureEquipmentDbDataLoaded();
  const equipmentGroup = getEquipmentDbGroupForWhiteBoxItem(normalizedName);
  selectedEquipmentDbGroup = equipmentGroup;
  selectedEquipmentDbType = getEquipmentDbTypeForWhiteBoxItem(normalizedName, equipmentGroup);
  expandedEquipmentDbId = "";
  equipmentDbNameKeyword = normalizedName;
  pendingEquipmentDbFocusName = normalizedName;
  pendingEquipmentDbAutoOpenName = normalizedName;
  isEquipmentDbNameSearchOpen = true;
  switchTab("equipment-db");
  syncEquipmentUrl(normalizedName);
  renderEquipmentDbCards();
  document.getElementById("equipment-db")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

function buildMonsterWhiteBoxLinksHtml(values) {
  const items = Array.isArray(values) ? values.filter((value) => String(value || "").trim() !== "" && String(value || "").trim() !== "-") : [];
  if (items.length === 0) return "なし";
  return items
    .map(
      (itemName) =>
        `<button type="button" class="monster-info-chip monster-info-equipment-link" data-monster-white-box-equipment="${escapeHtml(itemName)}">${escapeHtml(itemName)}</button>`
    )
    .join("");
}

function buildMonsterOrbLinksHtml(values) {
  const items = Array.isArray(values) ? values.filter((value) => String(value || "").trim() !== "" && String(value || "").trim() !== "-") : [];
  if (items.length === 0) return "なし";
  return items
    .map(
      (orbName) =>
        `<button type="button" class="monster-info-chip monster-info-nav-link" data-monster-orb-name="${escapeHtml(orbName)}">${escapeHtml(orbName)}</button>`
    )
    .join("");
}

function buildEquipmentDbMonsterLinkHtml(monsterName) {
  const normalizedName = String(monsterName || "").trim();
  if (normalizedName === "" || normalizedName === "-") return "";
  return `<button type="button" class="monster-info-chip monster-info-nav-link equipment-db-monster-link" data-equipment-db-monster-name="${escapeHtml(normalizedName)}">${escapeHtml(normalizedName)}</button>`;
}

function buildEquipmentDbMonsterLinksHtml(monsterNames) {
  const items = Array.isArray(monsterNames)
    ? monsterNames.map((name) => buildEquipmentDbMonsterLinkHtml(name)).filter((html) => html !== "")
    : [];
  if (items.length === 0) return "";
  return `<span class="equipment-db-monster-link-list">${items.join("")}</span>`;
}

function buildOrbMonsterLinksHtml(monsterNames) {
  const names = Array.isArray(monsterNames) ? monsterNames.filter((name) => String(name || "").trim() !== "" && String(name || "").trim() !== "-") : [];
  if (names.length === 0) return `<p class="orb-monster-empty">ドロップモンスター情報なし</p>`;
  return `<ul class="orb-monster-list">${names
    .map(
      (name) =>
        `<li><button type="button" class="orb-monster-link" data-orb-monster-name="${escapeHtml(name)}">${escapeHtml(name)}</button></li>`
    )
    .join("")}</ul>`;
}

async function openOrbFromMonsterInfo(orbName) {
  const normalizedOrbName = String(orbName || "").trim();
  if (normalizedOrbName === "" || normalizedOrbName === "-") return;
  closeMonsterInfoModal();
  await ensureOrbDataLoaded();
  const matchedOrb = orbEntryByName.get(normalizedOrbName);
  selectedOrbCategory = matchedOrb ? normalizeOrbCategoryName(matchedOrb.orbCategory) : "";
  orbSearchKeyword = normalizedOrbName;
  expandedOrbId = matchedOrb?.id || "";
  switchTab("orbs");
  syncOrbUrl(normalizedOrbName);
  renderOrbCards();
  document.getElementById("orbs")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

async function openMonsterInfoFromOrb(monsterName) {
  const normalizedMonsterName = String(monsterName || "").trim();
  if (normalizedMonsterName === "" || normalizedMonsterName === "-") return;
  await ensureMonsterInfoDataLoaded();
  const matchedMonster = monsterDetailEntryByName.get(normalizedMonsterName);
  selectedMonsterInfoType = matchedMonster?.type || "";
  monsterInfoSearchKeyword = normalizedMonsterName;
  pendingMonsterInfoFocusName = normalizedMonsterName;
  pendingMonsterInfoAutoOpenName = normalizedMonsterName;
  switchTab("monster-info");
  syncMonsterInfoUrl(normalizedMonsterName);
  renderMonsterInfoCards();
  document.getElementById("monster-info")?.scrollIntoView({ block: "start", behavior: "smooth" });
}

async function openMonsterInfoFromEquipmentDbMonster(monsterName) {
  closeArmorSetDetailModal();
  await openMonsterInfoFromOrb(monsterName);
}

function renderProfitArmorSetAssist() {
  if (!profitArmorSetAssistWrap) return;
  if (!pendingProfitArmorSetContext || pendingProfitArmorSetContext.type !== PROFIT_EQUIPMENT_NAVIGATION_TYPES.armorSet) {
    profitArmorSetAssistWrap.hidden = true;
    profitArmorSetAssistWrap.innerHTML = "";
    return;
  }

  const setName = String(pendingProfitArmorSetContext.setName || "").trim();
  const availableParts = Array.isArray(pendingProfitArmorSetContext.availableParts)
    ? pendingProfitArmorSetContext.availableParts.filter((part) => PROFIT_ARMOR_PART_ORDER.includes(part))
    : [];
  const parts = availableParts.length > 0 ? availableParts : PROFIT_ARMOR_PART_ORDER;
  const helperText =
    availableParts.length > 0
      ? "部位を選ぶと、その部位のレシピを開けます。"
      : "部位候補を特定できませんでした。部位を選ぶか、通常の装備検索をご利用ください。";
  const errorMessage = String(pendingProfitArmorSetContext.errorMessage || "").trim();

  profitArmorSetAssistWrap.hidden = false;
  profitArmorSetAssistWrap.innerHTML = `
    <section class="card profit-armor-set-assist-card" aria-live="polite">
      <h3 class="profit-armor-set-assist-title">防具セットから移動: ${setName}</h3>
      <p class="profit-armor-set-assist-note">${helperText}</p>
      ${errorMessage ? `<p class="profit-armor-set-assist-error">${errorMessage}</p>` : ""}
      <div class="profit-armor-set-assist-parts">
        ${parts
          .map((part) => `<button type="button" class="profit-armor-set-part-button" data-profit-armor-set-part="${part}">${part}</button>`)
          .join("")}
      </div>
    </section>
  `;

  profitArmorSetAssistWrap.querySelectorAll("[data-profit-armor-set-part]").forEach((button) => {
    button.addEventListener("click", () => {
      openProfitArmorSetPart(setName, String(button.dataset.profitArmorSetPart || ""));
    });
  });
}

function renderSelectedEquipmentTypeMeta() {
  if (!selectedEquipmentTypeMeta) return;

  const equipment = getSelectedEquipment();
  const typeLabel = String(equipment?.category || "").trim();
  const equipmentDbEntry = resolveProfitEquipmentDetailEntry(equipment);
  const typeIconPath =
    getEquipmentTypeIconPath(typeLabel) ||
    getEquipmentTypeIconPath(equipmentDbEntry?.equipmentType);

  if (!equipment || !typeLabel) {
    selectedEquipmentTypeMeta.innerHTML = "";
    selectedEquipmentTypeMeta.hidden = true;
    return;
  }

  if (!hasLoadedEquipmentDbData && !isEquipmentDbDataLoading) {
    void ensureEquipmentDbDataLoaded().then(() => {
      if (activeTabId === "profit") renderSelectedEquipmentTypeMeta();
    });
  }

  const performanceHtml = buildProfitEquipmentPerformanceHtml(equipment, equipmentDbEntry);

  selectedEquipmentTypeMeta.innerHTML = `
    <div class="selected-equipment-summary">
      <span class="equipment-type-meta selected-equipment-type-chip">
        ${typeIconPath ? `<img src="${resolveProjectScopedAssetUrl(typeIconPath)}" alt="" class="equipment-type-icon" loading="lazy" decoding="async">` : ""}
        <span>種別: ${typeLabel}</span>
      </span>
      ${performanceHtml}
    </div>
  `;
  selectedEquipmentTypeMeta.hidden = false;
}

function resolveProfitEquipmentDetailEntry(equipment) {
  const normalizedName = String(equipment?.name || "").trim();
  if (normalizedName === "") return null;
  const exactEntry = equipmentDbEntryByName.get(normalizedName);
  if (exactEntry) return exactEntry;

  const normalizedCategory = normalizeArmorPartCategory(equipment?.category);
  if (normalizedCategory !== "") {
    const armorEntry = (equipmentDbEntries || []).find((entry) => {
      if (String(entry?.equipmentGroup || "").trim() !== "armor") return false;
      const parts = getArmorSetPartsFromRecipes(entry?.equipmentName || "");
      return parts.some((part) => String(part?.name || "").trim() === normalizedName);
    });
    if (armorEntry) return armorEntry;
  }
  return null;
}

function isProfitShieldCategory(value) {
  const normalized = String(value || "").trim();
  return normalized === "盾" || normalized === "小盾" || normalized === "大盾";
}

function buildProfitEquipmentPerformanceHtml(equipment, entry) {
  if (!entry) return "";
  const normalizedCategory = normalizeArmorPartCategory(equipment?.category);
  const isArmor = normalizedCategory !== "";
  const isShield = isProfitShieldCategory(equipment?.category) || isProfitShieldCategory(entry?.equipmentType);
  const stats = [];
  const pushStat = (label, value, formatter = (raw) => String(raw)) => {
    if (!Number.isFinite(value) || Number(value) === 0) return;
    stats.push(`<li><span>${label}</span><strong>${formatter(value)}</strong></li>`);
  };

  if (isArmor) {
    // 防具は主要ステータスではなくセット効果だけを簡易表示する
  } else if (isShield) {
    pushStat("守備力", entry?.defense);
    pushStat("盾ガード率", entry?.shieldGuardRate, (raw) => formatEquipmentDbGuardRate(raw));
  } else {
    pushStat("攻撃力", entry?.attack);
  }

  const traits = getMeaningfulEquipmentTraits(entry).slice(0, 4);
  const traitsTitle = isArmor ? "セット効果" : "特性";
  const hasStats = stats.length > 0;
  const hasTraits = traits.length > 0;
  if (!hasStats && !hasTraits) return "";

  return `
    <div class="profit-equipment-performance">
      ${hasStats ? `<ul class="profit-equipment-stat-list">${stats.join("")}</ul>` : ""}
      ${hasTraits ? `<div class="profit-equipment-traits"><span class="profit-equipment-traits-label">${traitsTitle}</span><ul class="profit-equipment-traits-list">${traits.map((trait) => `<li>${escapeHtml(trait)}</li>`).join("")}</ul></div>` : ""}
    </div>
  `;
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
  const showProfitResetButton = hasActiveProfitSelectionFilters();
  if (!equipment) {
    recipeFavoriteActionWrap.innerHTML = `
      <div class="recipe-favorite-action">
        <button type="button" class="recipe-favorite-toggle-button" disabled>☆ お気に入り</button>
        ${
          showProfitResetButton
            ? `<button type="button" class="filter-reset-button recipe-filter-reset-button" data-reset-profit-selection="true">× 絞り込み解除</button>`
            : ""
        }
        <p class="helper-text">装備を選択すると、お気に入り登録できます。</p>
      </div>
    `;
  } else {
    const isFavorite = isRecipeFavorite(equipment);
    recipeFavoriteActionWrap.innerHTML = `
      <div class="recipe-favorite-action">
        <button
          type="button"
          class="recipe-favorite-toggle-button ${isFavorite ? "is-active" : ""}"
          data-toggle-selected-recipe-favorite="true"
          aria-label="${equipment.name}をお気に入り${isFavorite ? "解除" : "登録"}"
        >
          ${isFavorite ? "★ お気に入り中" : "☆ お気に入り"}
        </button>
        ${
          showProfitResetButton
            ? `<button type="button" class="filter-reset-button recipe-filter-reset-button" data-reset-profit-selection="true">× 絞り込み解除</button>`
            : ""
        }
      </div>
    `;
  }

  const toggleButton = recipeFavoriteActionWrap.querySelector("[data-toggle-selected-recipe-favorite]");
  if (toggleButton && equipment) {
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

  const resetButton = recipeFavoriteActionWrap.querySelector("[data-reset-profit-selection]");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetProfitSelectionFilters();
    });
  }
}

function hasActiveProfitSelectionFilters() {
  return (
    String(selectedCraftsman || "").trim() !== "" ||
    String(selectedCategory || "").trim() !== "" ||
    String(selectedEquipmentId || "").trim() !== "" ||
    String(equipmentSearchKeyword || "").trim() !== "" ||
    String(materialSearchKeyword || "").trim() !== "" ||
    isEquipmentSearchExpanded ||
    isMaterialSearchExpanded ||
    isEquipmentSearchCandidateListOpen ||
    isMaterialSearchCandidateListOpen ||
    String(window.location.search || "").includes("equipment=")
  );
}

function resetProfitSelectionFilters() {
  clearProfitArmorSetContext();
  selectedCraftsman = "";
  selectedCategory = "";
  selectedEquipmentId = "";
  equipmentSearchKeyword = "";
  materialSearchKeyword = "";
  isEquipmentSearchExpanded = false;
  isMaterialSearchExpanded = false;
  isEquipmentSearchCandidateListOpen = false;
  isMaterialSearchCandidateListOpen = false;

  if (equipmentSearchInput) equipmentSearchInput.value = "";
  if (materialSearchInput) materialSearchInput.value = "";

  navigateByFeatureRoute(
    {
      tab: "profit",
      equipmentId: "",
      materialKey: "",
      profitEntryType: "",
      profitArmorSetName: "",
      profitArmorPart: "",
      profitEquipmentName: "",
      profitEquipmentType: "",
      equipment: "",
    },
    { replace: true }
  );
  rerenderAll();
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

  const selectedEquipment = getSelectedEquipment();
  if (!selectedEquipment) {
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
      const materialName = material?.name ?? "(削除済み素材)";
      const marketUrl = getOfficialBazaarUrlByMaterialName(material?.name);
      const bazaarItemUrl = material?.name ? getBazaarItemUrl(material.name) : "";
      const hasMarketUrl = marketUrl !== "";
      const price = getEffectiveMaterialPrice(row.materialId);
      const safePrice = Number.isFinite(price) ? price : 0;
      const totalRequired = row.quantity * productionCount;
      const subtotal = safePrice * totalRequired;
      return {
        subtotalRaw: subtotal,
        table: `
          <tr>
            <td>${
              bazaarItemUrl
                ? `<a class="recipe-material-link" href="${escapeHtml(bazaarItemUrl)}">${escapeHtml(materialName)}</a>`
                : escapeHtml(materialName)
            }</td>
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
              ${
                hasMarketUrl
                  ? `<a
                      class="market-link-button recipe-market-link-button"
                      href="${marketUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      相場確認
                    </a>`
                  : ""
              }
            </td>
          </tr>
        `,
        card: `
          <article class="recipe-material-card">
            <div class="recipe-material-header">
              <h4 class="recipe-material-name">${
                bazaarItemUrl
                  ? `<a class="recipe-material-link" href="${escapeHtml(bazaarItemUrl)}">${escapeHtml(materialName)}</a>`
                  : escapeHtml(materialName)
              }</h4>
              ${
                hasMarketUrl
                  ? `<a
                      class="market-link-button recipe-market-link-button recipe-market-link-button-mobile"
                      href="${marketUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      相場確認
                    </a>`
                  : ""
              }
            </div>
            <p class="recipe-material-count-line">
              <span>必要 <strong>${row.quantity}</strong></span>
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
    ${buildIndividualPageActionLink("個別ページを開く", getRecipeIndividualPageUrl(selectedEquipment.name))}
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
    equipmentSearchToggleButton.hidden = false;
    equipmentSearchField.hidden = !isEquipmentSearchExpanded;
    equipmentSearchToggleButton.setAttribute("aria-expanded", isEquipmentSearchExpanded ? "true" : "false");
    equipmentSearchToggleButton.textContent = isEquipmentSearchExpanded ? "－ 装備名検索を閉じる" : "＋ 装備名で検索";
  }

  if (materialSearchField && materialSearchToggleButton) {
    materialSearchToggleButton.hidden = false;
    materialSearchField.hidden = !isMaterialSearchExpanded;
    materialSearchToggleButton.setAttribute("aria-expanded", isMaterialSearchExpanded ? "true" : "false");
    materialSearchToggleButton.textContent = isMaterialSearchExpanded ? "－ 素材検索を閉じる" : "＋ 素材で検索";
  }
}

function resetProfitAssistState() {
  const currentEquipment = getSelectedEquipment();
  const currentToolId = selectedToolId;

  if (currentEquipment) {
    currentEquipment.salePrices = normalizeSalePrices(null, 0);
  }
  if (currentToolId) {
    setToolPurchasePrice(currentToolId, 0);
  }

  temporaryMaterialPrices.clear();
  clearProfitArmorSetContext();
  selectedEquipmentId = "";
  selectedCraftsman = "";
  selectedCategory = "";
  selectedToolId = "";
  isToolCostIncluded = false;
  isEquipmentSearchExpanded = false;
  isMaterialSearchExpanded = false;
  isEquipmentSearchCandidateListOpen = false;
  isMaterialSearchCandidateListOpen = false;
  equipmentSearchKeyword = "";
  materialSearchKeyword = "";

  if (equipmentSearchInput) equipmentSearchInput.value = "";
  if (materialSearchInput) materialSearchInput.value = "";
  if (productionCountInput) productionCountInput.value = "1";
  if (salePriceStar0Input) salePriceStar0Input.value = "0";
  if (salePriceStar1Input) salePriceStar1Input.value = "0";
  if (salePriceStar2Input) salePriceStar2Input.value = "0";
  if (salePriceStar3Input) salePriceStar3Input.value = "0";
  if (countStar0Input) countStar0Input.value = "0";
  if (countStar1Input) countStar1Input.value = "0";
  if (countStar2Input) countStar2Input.value = "0";
  if (countStar3Input) countStar3Input.value = "0";
  if (toolPurchasePriceInput) toolPurchasePriceInput.value = "";

  navigateByAppParams(
    {
      tab: "profit",
      equipmentId: "",
      materialKey: "",
      profitEntryType: "",
      profitArmorSetName: "",
      profitArmorPart: "",
      profitEquipmentName: "",
      profitEquipmentType: "",
    },
    { replace: true }
  );
  saveData();
  rerenderAll();
  document.getElementById("profit")?.scrollIntoView({ block: "start", behavior: "smooth" });
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
  renderProfitArmorSetAssist();
  renderFilterSelectors();
  renderEquipmentSelectors();
  renderEquipmentSearchCandidates();
  renderMaterialSearchCandidates();
  renderMaterialSelector();

  syncSalePriceInputs();
  renderRecipeTable();
  renderCraftIdealValue();
  renderToolSectionVisibility();
  renderSearchFieldVisibility();
  renderToolSection();
  renderMaterialList();
  renderRecipeAdminList();
  calcAndRenderSummary();
  if (activeTabId === "routine") renderRoutineTasks();
  if (activeTabId === "boss-card") renderBossCardTimers();
  if (activeTabId === "present-codes") renderPresentCodes();
  if (activeTabId === "field-farming") renderFieldFarmingRanking();
  if (activeTabId === "bazaar") renderBazaarPrices();
  if (activeTabId === "favorites") renderFavoritesPage();
  if (activeTabId === "orbs") renderOrbCards();
  if (activeTabId === "white-boxes") renderWhiteBoxCards();
  if (activeTabId === "equipment-db") renderEquipmentDbCards();
  if (activeTabId === "monster-info") renderMonsterInfoCards();
  renderSiteSearchCandidates();
  decorateMemoAddButtons(document);
  updateDocumentMetadata();
}

function rerenderActiveTabOnly() {
  if (activeTabId === "profit") {
    rerenderAll();
    return;
  }
  if (activeTabId === "routine") renderRoutineTasks();
  if (activeTabId === "boss-card") renderBossCardTimers();
  if (activeTabId === "present-codes") renderPresentCodes();
  if (activeTabId === "field-farming") renderFieldFarmingRanking();
  if (activeTabId === "bazaar") renderBazaarPrices();
  if (activeTabId === "favorites") renderFavoritesPage();
  if (activeTabId === "orbs") renderOrbCards();
  if (activeTabId === "white-boxes") renderWhiteBoxCards();
  if (activeTabId === "equipment-db") renderEquipmentDbCards();
  if (activeTabId === "monster-info") renderMonsterInfoCards();
  renderSiteSearchCandidates();
  updateDocumentMetadata();
}

// --- イベント定義 ---
if (equipmentSelect) {
  equipmentSelect.addEventListener("change", (e) => {
    applyProfitEquipmentSelection(e.target.value, { closeCandidates: true });
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
      isEquipmentSearchCandidateListOpen = false;
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
      isMaterialSearchCandidateListOpen = false;
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
    isEquipmentSearchCandidateListOpen = equipmentSearchKeyword !== "";
    rerenderAll();
  });
  equipmentSearchInput.addEventListener("focus", () => {
    if (equipmentSearchKeyword !== "") {
      isEquipmentSearchCandidateListOpen = true;
      renderEquipmentSearchCandidates();
    }
  });
  equipmentSearchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    isEquipmentSearchCandidateListOpen = false;
    renderEquipmentSearchCandidates();
  });
}

if (equipmentSearchCandidateWrap) {
  equipmentSearchCandidateWrap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest("[data-equipment-search-candidate-id]");
    if (!button || !equipmentSearchCandidateWrap.contains(button)) return;
    event.preventDefault();
    const equipmentId = String(button.dataset.equipmentSearchCandidateId || "");
    const equipment = state.equipments.find((entry) => entry.id === equipmentId);
    if (!equipment) return;
    equipmentSearchKeyword = String(equipment.name || "");
    if (equipmentSearchInput) equipmentSearchInput.value = equipmentSearchKeyword;
    applyProfitEquipmentSelection(equipmentId, { closeCandidates: true });
  });
}

if (materialSearchInput) {
  materialSearchInput.addEventListener("input", (e) => {
    materialSearchKeyword = e.target.value.trim();
    isMaterialSearchCandidateListOpen = materialSearchKeyword !== "";
    rerenderAll();
  });
  materialSearchInput.addEventListener("focus", () => {
    if (materialSearchKeyword !== "") {
      isMaterialSearchCandidateListOpen = true;
      renderMaterialSearchCandidates();
    }
  });
  materialSearchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    isMaterialSearchCandidateListOpen = false;
    renderMaterialSearchCandidates();
  });
}

if (materialSearchCandidateWrap) {
  materialSearchCandidateWrap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const materialButton = target.closest("[data-material-search-candidate-material-id]");
    if (materialButton && materialSearchCandidateWrap.contains(materialButton)) {
      event.preventDefault();
      const materialId = String(materialButton.dataset.materialSearchCandidateMaterialId || "");
      const material = state.materials.find((entry) => entry.id === materialId);
      if (!material) return;
      materialSearchKeyword = String(material.name || "");
      if (materialSearchInput) materialSearchInput.value = materialSearchKeyword;
      isMaterialSearchCandidateListOpen = true;
      rerenderAll();
      return;
    }

    const equipmentButton = target.closest("[data-material-search-candidate-equipment-id]");
    if (!equipmentButton || !materialSearchCandidateWrap.contains(equipmentButton)) return;
    event.preventDefault();
    const equipmentId = String(equipmentButton.dataset.materialSearchCandidateEquipmentId || "");
    applyProfitEquipmentSelection(equipmentId, { closeCandidates: true });
    isMaterialSearchCandidateListOpen = false;
    renderMaterialSearchCandidates();
  });
}

if (craftsmanFilterSelect) {
  craftsmanFilterSelect.addEventListener("change", (e) => {
    selectedCraftsman = e.target.value;
    clearProfitArmorSetContext();
    rerenderAll();
  });
}

if (categoryFilterSelect) {
  categoryFilterSelect.addEventListener("change", (e) => {
    selectedCategory = e.target.value;
    clearProfitArmorSetContext();
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

[
  { button: salePriceStar0ResetButton, input: salePriceStar0Input, key: "star0" },
  { button: salePriceStar1ResetButton, input: salePriceStar1Input, key: "star1" },
  { button: salePriceStar2ResetButton, input: salePriceStar2Input, key: "star2" },
  { button: salePriceStar3ResetButton, input: salePriceStar3Input, key: "star3" },
].forEach(({ button, input, key }) => {
  if (!button || !input) return;
  button.addEventListener("click", () => {
    const eq = getSelectedEquipment();
    if (!eq) return;
    eq.salePrices = getSalePricesForEquipment(eq);
    eq.salePrices[key] = 0;
    input.value = "0";
    saveData();
    calcAndRenderSummary();
  });
});

if (profitResetButton) {
  profitResetButton.addEventListener("click", () => {
    resetProfitAssistState();
  });
}

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
    if (String(orbSearchKeyword || "").trim() !== "") {
      selectedOrbCategory = "";
      keepOrbCategoryCleared = false;
    }
    renderOrbCards();
  });
}
if (orbClearFiltersButton) {
  orbClearFiltersButton.addEventListener("click", () => {
    clearOrbFilters();
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
    isEquipmentDbTypeExplicitAll = selectedEquipmentDbType === "";
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
if (equipmentDbClearFiltersButton) {
  equipmentDbClearFiltersButton.addEventListener("click", () => {
    clearEquipmentDbFilters();
  });
}

if (equipmentDbListWrap) {
  equipmentDbListWrap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const memoButton = target.closest("[data-memo-equipment-id]");
    if (memoButton && equipmentDbListWrap.contains(memoButton)) {
      event.preventDefault();
      event.stopPropagation();
      const entry = findEquipmentDbEntryById(String(memoButton.dataset.memoEquipmentId || ""));
      addMemoEntry(createEquipmentMemoEntry(entry));
      return;
    }

    const monsterButton = target.closest("[data-equipment-db-monster-name]");
    if (monsterButton && equipmentDbListWrap.contains(monsterButton)) {
      event.preventDefault();
      event.stopPropagation();
      void openMonsterInfoFromEquipmentDbMonster(String(monsterButton.dataset.equipmentDbMonsterName || ""));
      return;
    }

    const profitButton = target.closest("[data-equipment-db-open-profit]");
    if (profitButton && equipmentDbListWrap.contains(profitButton)) {
      event.preventDefault();
      event.stopPropagation();
      const targetEntry = findEquipmentDbEntryById(profitButton.dataset.equipmentDbOpenProfit);
      if (targetEntry) openProfitFromEquipmentDb(targetEntry);
      return;
    }

    const cardToggle = target.closest("[data-equipment-db-id]");
    if (!cardToggle || !equipmentDbListWrap.contains(cardToggle)) return;
    activateEquipmentDbCard(String(cardToggle.dataset.equipmentDbId || ""));
  });

  equipmentDbListWrap.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-memo-equipment-id]")) return;
    if (target.closest("[data-equipment-db-monster-name]")) return;
    if (target.closest("[data-equipment-db-open-profit]")) return;
    const cardToggle = target.closest("[data-equipment-db-id]");
    if (!cardToggle || !equipmentDbListWrap.contains(cardToggle)) return;
    event.preventDefault();
    activateEquipmentDbCard(String(cardToggle.dataset.equipmentDbId || ""));
  });
}

if (armorSetDetailModalBody) {
  armorSetDetailModalBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const memoButton = target.closest("[data-memo-armor-set-id]");
    if (memoButton && armorSetDetailModalBody.contains(memoButton)) {
      event.preventDefault();
      event.stopPropagation();
      const entry = findEquipmentDbEntryById(String(memoButton.dataset.memoArmorSetId || ""));
      addMemoEntry(createArmorSetMemoEntry(entry));
      closeArmorSetDetailModal();
      return;
    }
    const monsterButton = target.closest("[data-equipment-db-monster-name]");
    if (monsterButton && armorSetDetailModalBody.contains(monsterButton)) {
      event.preventDefault();
      event.stopPropagation();
      void openMonsterInfoFromEquipmentDbMonster(String(monsterButton.dataset.equipmentDbMonsterName || ""));
      return;
    }
    const button = target.closest("[data-armor-part-open-profit]");
    if (!button || !armorSetDetailModalBody.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    openProfitFromEquipmentId(String(button.dataset.armorPartOpenProfit || ""));
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

if (memoDockButton) {
  memoDockButton.addEventListener("click", () => {
    if (memoPanel?.classList.contains("is-open")) {
      closeMemoPanel();
    } else {
      openMemoPanel();
    }
  });
}

if (memoDockHintCloseButton) {
  memoDockHintCloseButton.addEventListener("click", () => {
    dismissMemoDockHint();
  });
}

if (adminChecklistWrap) {
  adminChecklistWrap.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const groupId = String(target.dataset.adminChecklistGroup || "");
    const itemId = String(target.dataset.adminChecklistItem || "");
    if (!groupId || !itemId) return;
    toggleAdminChecklistItem(groupId, itemId, target.checked);
    renderAdminChecklist();
    setAdminChecklistStatus("チェック状態を保存しました。");
  });

  adminChecklistWrap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const toggleButton = target.closest("[data-admin-checklist-toggle]");
    if (toggleButton instanceof HTMLElement) {
      toggleAdminChecklistGroup(String(toggleButton.dataset.adminChecklistToggle || ""));
      renderAdminChecklist();
      return;
    }
    const resetButton = target.closest("[data-admin-checklist-reset]");
    if (!(resetButton instanceof HTMLElement)) return;
    resetAdminChecklistGroup(String(resetButton.dataset.adminChecklistReset || ""));
  });
}

if (historyBackButton) {
  historyBackButton.addEventListener("click", () => {
    handleHistoryBackNavigation();
  });
}

if (profitMemoAddButton) {
  profitMemoAddButton.addEventListener("click", () => {
    addMemoEntry(createCraftAssistMemoEntry());
  });
}

if (memoPanelCloseButton) {
  memoPanelCloseButton.addEventListener("click", () => {
    closeMemoPanel();
  });
}

if (memoClearAllButton) {
  memoClearAllButton.addEventListener("click", () => {
    if (!memoEntries.length) return;
    if (!window.confirm("メモをすべて削除しますか？")) return;
    memoEntries = [];
    memoEntryIdSet.clear();
    expandedMemoIds.clear();
    editingMemoNoteIds.clear();
    saveMemoEntries();
    setMemoStatus("メモをすべて削除しました");
    renderMemoList();
  });
}

if (memoListWrap) {
  memoListWrap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const deleteButton = target.closest("[data-memo-delete-id]");
    if (deleteButton && memoListWrap.contains(deleteButton)) {
      const memoId = String(deleteButton.dataset.memoDeleteId || "");
      memoEntries = memoEntries.filter((memo) => memo.id !== memoId);
      memoEntryIdSet.delete(memoId);
      expandedMemoIds.delete(memoId);
      editingMemoNoteIds.delete(memoId);
      saveMemoEntries();
      setMemoStatus("メモを削除しました");
      renderMemoList();
      return;
    }
    const moveButton = target.closest("[data-memo-move-id]");
    if (moveButton && memoListWrap.contains(moveButton)) {
      const memoId = String(moveButton.dataset.memoMoveId || "");
      const direction = Number(moveButton.dataset.memoMoveDirection || 0);
      moveMemoEntry(memoId, direction < 0 ? -1 : 1);
      return;
    }
    const noteToggleButton = target.closest("[data-memo-note-toggle-id]");
    if (noteToggleButton && memoListWrap.contains(noteToggleButton)) {
      const memoId = String(noteToggleButton.dataset.memoNoteToggleId || "");
      if (editingMemoNoteIds.has(memoId)) {
        editingMemoNoteIds.delete(memoId);
      } else {
        editingMemoNoteIds.add(memoId);
      }
      renderMemoList();
      return;
    }
    const noteSaveButton = target.closest("[data-memo-note-save-id]");
    if (noteSaveButton && memoListWrap.contains(noteSaveButton)) {
      const memoId = String(noteSaveButton.dataset.memoNoteSaveId || "");
      const input = Array.from(memoListWrap.querySelectorAll("[data-memo-note-input-id]")).find(
        (element) => element instanceof HTMLTextAreaElement && element.dataset.memoNoteInputId === memoId
      );
      editingMemoNoteIds.delete(memoId);
      updateMemoUserNote(memoId, input instanceof HTMLTextAreaElement ? input.value : "");
      return;
    }
    const noteCancelButton = target.closest("[data-memo-note-cancel-id]");
    if (noteCancelButton && memoListWrap.contains(noteCancelButton)) {
      editingMemoNoteIds.delete(String(noteCancelButton.dataset.memoNoteCancelId || ""));
      renderMemoList();
      return;
    }
    const toggleButton = target.closest("[data-memo-toggle-id]");
    if (toggleButton && memoListWrap.contains(toggleButton)) {
      toggleMemoExpanded(String(toggleButton.dataset.memoToggleId || ""));
      return;
    }
    if (target.closest(".memo-note-editor")) return;
    const memoCard = target.closest("[data-memo-card-id]");
    if (memoCard && memoListWrap.contains(memoCard)) {
      toggleMemoExpanded(String(memoCard.dataset.memoCardId || ""));
    }
  });

  memoListWrap.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("button, textarea")) return;
    const memoCard = target.closest("[data-memo-card-id]");
    if (!memoCard || !memoListWrap.contains(memoCard)) return;
    event.preventDefault();
    toggleMemoExpanded(String(memoCard.dataset.memoCardId || ""));
  });
}

function startMemoPanelSwipe(event) {
  if (!memoPanel) return;
  if (memoPanelSwipeState) return;
  if (event.pointerType && event.pointerType !== "touch") return;
  if (event.target instanceof Element) {
    if (event.target.closest("button, a, input, select, textarea, label")) return;
    const listWrap = event.target.closest(".memo-list-wrap");
    if (listWrap instanceof HTMLElement && listWrap.scrollTop > 0) return;
  }
  memoPanelSwipeState = {
    pointerId: event.pointerId,
    startY: event.clientY,
    currentY: event.clientY,
    startTime: Date.now(),
    isDragging: false,
  };
  memoPanel.classList.add("is-swipe-dragging");
  event.currentTarget?.setPointerCapture?.(event.pointerId);
}

function moveMemoPanelSwipe(event) {
  if (!memoPanel || !memoPanelSwipeState) return;
  if (memoPanelSwipeState.pointerId !== undefined && event.pointerId !== memoPanelSwipeState.pointerId) return;
  memoPanelSwipeState.currentY = event.clientY;
  const deltaY = Math.max(0, event.clientY - memoPanelSwipeState.startY);
  if (deltaY <= 0) return;
  memoPanelSwipeState.isDragging = true;
  if (event.pointerType === "touch") event.preventDefault();
  memoPanel.style.transform = `translateY(${deltaY}px)`;
}

function endMemoPanelSwipe(event) {
  if (!memoPanel || !memoPanelSwipeState) return;
  if (event?.pointerId !== undefined && memoPanelSwipeState.pointerId !== undefined && event.pointerId !== memoPanelSwipeState.pointerId) {
    return;
  }
  const deltaY = Math.max(0, memoPanelSwipeState.currentY - memoPanelSwipeState.startY);
  const elapsed = Math.max(Date.now() - memoPanelSwipeState.startTime, 1);
  const velocity = deltaY / elapsed;
  memoPanelSwipeState = null;
  memoPanel.classList.remove("is-swipe-dragging");
  memoPanel.style.transform = "";
  if (deltaY >= 50 || (deltaY >= 18 && velocity >= 0.45)) {
    closeMemoPanel();
  }
}

function cancelMemoPanelSwipe() {
  if (!memoPanel) return;
  memoPanelSwipeState = null;
  memoPanel.classList.remove("is-swipe-dragging");
  memoPanel.style.transform = "";
}

if (memoPanelHandle && memoPanel) {
  memoPanelHandle.addEventListener("pointerdown", (event) => {
    startMemoPanelSwipe(event);
  });
  memoPanelHandle.addEventListener("pointermove", (event) => {
    moveMemoPanelSwipe(event);
  });
  memoPanelHandle.addEventListener("pointerup", (event) => {
    endMemoPanelSwipe(event);
  });
  memoPanelHandle.addEventListener("pointercancel", () => {
    cancelMemoPanelSwipe();
  });
}

if (memoPanelHeader && memoPanel) {
  memoPanelHeader.addEventListener("pointerdown", (event) => {
    startMemoPanelSwipe(event);
  });
  memoPanelHeader.addEventListener("pointermove", (event) => {
    moveMemoPanelSwipe(event);
  });
  memoPanelHeader.addEventListener("pointerup", (event) => {
    endMemoPanelSwipe(event);
  });
  memoPanelHeader.addEventListener("pointercancel", () => {
    cancelMemoPanelSwipe();
  });
}

if (memoPanel) {
  memoPanel.addEventListener("pointerdown", (event) => {
    startMemoPanelSwipe(event);
  });
  memoPanel.addEventListener("pointermove", (event) => {
    moveMemoPanelSwipe(event);
  });
  memoPanel.addEventListener("pointerup", (event) => {
    endMemoPanelSwipe(event);
  });
  memoPanel.addEventListener("pointercancel", () => {
    cancelMemoPanelSwipe();
  });
}

if (memoPanelBackdrop) {
  memoPanelBackdrop.addEventListener("click", () => {
    closeMemoPanel();
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Node)) return;
  const isInsideEquipmentSearch = Boolean(equipmentSearchField?.contains(target) || equipmentSearchCandidateWrap?.contains(target));
  if (!isInsideEquipmentSearch && isEquipmentSearchCandidateListOpen) {
    isEquipmentSearchCandidateListOpen = false;
    renderEquipmentSearchCandidates();
  }
  const isInsideMaterialSearch = Boolean(materialSearchField?.contains(target) || materialSearchCandidateWrap?.contains(target));
  if (!isInsideMaterialSearch && isMaterialSearchCandidateListOpen) {
    isMaterialSearchCandidateListOpen = false;
    renderMaterialSearchCandidates();
  }
  const isInsideBossCardNameSearch = Boolean(bossCardNameInput?.contains(target) || bossCardNameCandidateWrap?.contains(target));
  if (!isInsideBossCardNameSearch && bossCardNameCandidateWrap) {
    bossCardNameCandidateWrap.hidden = true;
  }
  const isInsideToolSearch = Boolean(
    toolSiteSearchDock?.contains(target) || toolSiteSearchResultWrap?.contains(target) || toolSiteSearchInput?.contains(target)
  );
  if (isInsideToolSearch) return;
  if (toolSiteSearchResultWrap) toolSiteSearchResultWrap.hidden = true;
});

equipmentDbGroupTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextGroup = String(button.dataset.equipmentDbGroup || "weapon");
    selectedEquipmentDbGroup = nextGroup === "armor" ? "armor" : "weapon";
    selectedEquipmentDbType = "";
    isEquipmentDbTypeExplicitAll = false;
    expandedEquipmentDbId = "";
    navigateByAppParams({ equipmentDbGroup: selectedEquipmentDbGroup });
    renderEquipmentDbCards();
  });
});

routineTypeTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedRoutineType = normalizeRoutineType(button.dataset.routineType);
    renderRoutineTasks();
  });
});

if (routineCheckAllButton) {
  routineCheckAllButton.addEventListener("click", () => {
    getRoutineTasksByType(selectedRoutineType).forEach((task) => {
      setRoutineTaskChecked(task, true);
    });
    saveRoutineTaskState();
    renderRoutineTasks();
  });
}

if (routineClearAllButton) {
  routineClearAllButton.addEventListener("click", () => {
    getRoutineTasksByType(selectedRoutineType).forEach((task) => {
      setRoutineTaskChecked(task, false);
    });
    saveRoutineTaskState();
    renderRoutineTasks();
  });
}

if (routineListWrap) {
  routineListWrap.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;
    const taskId = String(target.dataset.routineTaskId || "");
    if (!taskId) return;
    const task = getRoutineTaskById(taskId);
    if (!task) return;
    setRoutineTaskChecked(task, target.checked);
    saveRoutineTaskState();
    renderRoutineTasks();
  });
}

if (bossCardForm) {
  bossCardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = String(bossCardNameInput?.value || "").trim();
    const expiry = buildBossCardExpiryFromHours(bossCardRemainingHoursInput?.value);
    const count = Math.max(1, Math.floor(Number(bossCardCountInput?.value || 1)));
    const memo = String(bossCardMemoInput?.value || "").trim();
    if (!name || !expiry) return;
    bossCardTimers = [
      ...bossCardTimers,
      {
        id: makeBossCardTimerId(),
        name,
        expiry,
        count,
        memo,
        createdAt: new Date().toISOString(),
      },
    ];
    saveBossCardTimers();
    bossCardForm.reset();
    if (bossCardCountInput) bossCardCountInput.value = "1";
    if (bossCardNameCandidateWrap) {
      bossCardNameCandidateWrap.hidden = true;
      bossCardNameCandidateWrap.innerHTML = "";
    }
    renderBossCardTimers();
  });
}

if (bossCardNameInput) {
  bossCardNameInput.addEventListener("input", renderBossCardNameCandidates);
  bossCardNameInput.addEventListener("focus", renderBossCardNameCandidates);
}

if (bossCardNameCandidateWrap) {
  bossCardNameCandidateWrap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest("[data-boss-card-name-candidate]");
    if (!(button instanceof HTMLElement)) return;
    if (bossCardNameInput) bossCardNameInput.value = String(button.dataset.bossCardNameCandidate || "");
    bossCardNameCandidateWrap.hidden = true;
    bossCardNameCandidateWrap.innerHTML = "";
    bossCardRemainingHoursInput?.focus();
  });
}

if (bossCardListWrap) {
  bossCardListWrap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const deleteButton = target.closest("[data-boss-card-delete-id]");
    if (!(deleteButton instanceof HTMLElement) || !bossCardListWrap.contains(deleteButton)) return;
    const targetId = String(deleteButton.dataset.bossCardDeleteId || "");
    bossCardTimers = bossCardTimers.filter((entry) => entry.id !== targetId);
    saveBossCardTimers();
    renderBossCardTimers();
  });
}

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
  injectPageAdSlots();
  renderUiSettingsPanel();
  renderContentEditorPanel();
  setContentEditModeEnabled(false);
  setAdminModeEnabled(isAdminModeEnabled);
  loadAdminChecklistState();
  memoEntries = loadMemoEntries();
  isMemoHintDismissed = loadMemoHintDismissedState();
  routineTaskCheckedTokens = loadRoutineTaskState();
  bossCardTimers = loadBossCardTimers();
  bossCardNameCandidateRecords = await loadBossCardNameCandidateRecords();
  rebuildMemoEntryIdSet();
  renderMemoList();
  updateMemoDockHintVisibility();
  decorateMemoAddButtons(document);
  renderAdminChecklist();

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
  if (!hasDirectDataQueryParams()) {
    navigateByAppParams(
      {
        tab: appMode === "tool" ? activeTabId : "",
        equipmentId: activeTabId === "profit" ? selectedEquipmentId : "",
        materialKey: activeTabId === "bazaar" ? pendingBazaarFocusMaterialKey : "",
        itemSearch: activeTabId === "bazaar" ? bazaarSearchText : "",
        equipmentSearch: activeTabId === "equipment-db" ? equipmentDbNameKeyword : "",
        orbSearch: activeTabId === "orbs" ? orbSearchKeyword : "",
        monsterSearch: activeTabId === "monster-info" ? monsterInfoSearchKeyword : "",
        equipmentDbGroup: activeTabId === "equipment-db" ? selectedEquipmentDbGroup : "",
        profitEntryType:
          activeTabId === "profit" && pendingProfitArmorSetContext?.type === PROFIT_EQUIPMENT_NAVIGATION_TYPES.armorSet
            ? PROFIT_EQUIPMENT_NAVIGATION_TYPES.armorSet
            : "",
        profitArmorSetName: activeTabId === "profit" ? String(pendingProfitArmorSetContext?.setName || "") : "",
      },
      { replace: true }
    );
  }
  saveData();
  rerenderAll();
  showMemoDockHintIfNeeded();
  prefetchDataForTab(activeTabId);
}

initialize();




