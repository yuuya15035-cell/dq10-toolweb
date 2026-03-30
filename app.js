// DQ10職人ツールの最小実装。
// 日本語コメントを多めに入れて、将来の拡張をしやすくしています。

const STORAGE_KEY = "dq10_toolweb_data_v1";
// recipe.csv の配置先。data ディレクトリ配下を正として扱います。
const RECIPE_CSV_PATH = "./data/recipe.csv";
const TOOLS_CSV_PATH = "./data/tools.csv";

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
  return line.split(",").map((cell) => cell.trim());
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
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`CSVの読み込みに失敗しました: ${path} (${response.status})`);
  }
  const csvText = await response.text();
  const normalized = csvText.replace(/^\uFEFF/, "");
  return normalized.split(/\r?\n/).filter((line) => line.trim().length > 0);
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
// 利益計算画面の絞り込み条件（未選択なら全件）
let selectedCraftsman = "";
let selectedCategory = "";
let selectedToolId = "";
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

const equipmentSelect = getRequiredElementById("equipmentSelect");
const equipmentSearchInput = getRequiredElementById("equipmentSearchInput");
const craftsmanFilterSelect = getRequiredElementById("craftsmanFilterSelect");
const categoryFilterSelect = getRequiredElementById("categoryFilterSelect");
const productionCountInput = getRequiredElementById("productionCountInput");
const salePriceStar0Input = getRequiredElementById("salePriceStar0Input");
const salePriceStar1Input = getRequiredElementById("salePriceStar1Input");
const salePriceStar2Input = getRequiredElementById("salePriceStar2Input");
const salePriceStar3Input = getRequiredElementById("salePriceStar3Input");
const recipeTableWrap = getRequiredElementById("recipeTableWrap");
const toolWrap = getRequiredElementById("toolWrap");
const toolSelect = getRequiredElementById("toolSelect");
const toolDurabilityInput = getRequiredElementById("toolDurabilityInput");
const toolPurchasePriceInput = getRequiredElementById("toolPurchasePriceInput");
const materialListWrap = getRequiredElementById("materialListWrap");
const recipeAdminListWrap = getRequiredElementById("recipeAdminListWrap");

const perCraftToolCostEl = getRequiredElementById("perCraftToolCost");
const totalToolCostEl = getRequiredElementById("totalToolCost");
const totalMaterialCostEl = getRequiredElementById("totalMaterialCost");
const grandTotalMaterialCostEl = getRequiredElementById("grandTotalMaterialCost");
const salePriceStar0El = getRequiredElementById("salePriceStar0");
const salePriceStar1El = getRequiredElementById("salePriceStar1");
const salePriceStar2El = getRequiredElementById("salePriceStar2");
const salePriceStar3El = getRequiredElementById("salePriceStar3");
const profitStar0ValueEl = getRequiredElementById("profitStar0Value");
const profitStar1ValueEl = getRequiredElementById("profitStar1Value");
const profitStar2ValueEl = getRequiredElementById("profitStar2Value");
const profitStar3ValueEl = getRequiredElementById("profitStar3Value");

const materialForm = getRequiredElementById("materialForm");
const equipmentForm = getRequiredElementById("equipmentForm");
const recipeForm = getRequiredElementById("recipeForm");

const recipeEquipmentSelect = getRequiredElementById("recipeEquipmentSelect");
const recipeMaterialSelect = getRequiredElementById("recipeMaterialSelect");

function formatGold(value) {
  return `${Math.round(value).toLocaleString("ja-JP")} G`;
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

function switchTab(target) {
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === target));
  tabContents.forEach((tab) => tab.classList.toggle("active", tab.id === target));
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

function renderEquipmentSelectors() {
  if (!equipmentSelect || !recipeEquipmentSelect) return;

  // 利益計算画面の装備候補は、職人種別・ジャンル・検索キーワードをAND条件で絞り込みます。
  // - 職人種別未選択: 全職人対象
  // - ジャンル未選択: 全ジャンル対象
  // - 検索欄空: 文字条件は無効（他の絞り込み条件のみで表示）
  const filteredEquipments = state.equipments.filter((equipment) =>
    (selectedCraftsman === "" || equipment.craftsman === selectedCraftsman) &&
    (selectedCategory === "" || equipment.category === selectedCategory) &&
    (equipmentSearchKeyword === "" || equipment.name.toLowerCase().includes(equipmentSearchKeyword.toLowerCase()))
  );

  equipmentSelect.innerHTML = "";
  recipeEquipmentSelect.innerHTML = "";

  filteredEquipments.forEach((equipment) => {
    const option = new Option(equipment.name, equipment.id);
    equipmentSelect.add(option);
  });

  // レシピ管理側の装備選択は従来どおり全件表示にしておく
  state.equipments.forEach((equipment) => {
    recipeEquipmentSelect.add(new Option(equipment.name, equipment.id));
  });

  // 現在選択中の装備がフィルタ結果に存在しない場合は先頭に寄せる
  if (!filteredEquipments.some((e) => e.id === selectedEquipmentId)) {
    selectedEquipmentId = filteredEquipments[0]?.id || "";
  }

  if (!state.equipments.some((e) => e.id === selectedEquipmentId)) {
    selectedEquipmentId = state.equipments[0]?.id || "";
  }
  equipmentSelect.value = selectedEquipmentId;
  recipeEquipmentSelect.value = selectedEquipmentId;
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

  // 選択中の値が候補になければ未選択（全件）へ戻す。
  // 職人を変更したときにカテゴリが無効化された場合も、ここで自然に「全ジャンル」へ戻ります。
  if (!craftsmen.includes(selectedCraftsman)) selectedCraftsman = "";
  if (!categories.includes(selectedCategory)) selectedCategory = "";

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

function renderRecipeTable() {
  if (!recipeTableWrap) return;

  const rows = getRecipeRowsForSelectedEquipment();
  if (rows.length === 0) {
    recipeTableWrap.innerHTML = "<p>この装備のレシピが未登録です。</p>";
    return;
  }

  const htmlRows = rows
    .map((row) => {
      const material = state.materials.find((m) => m.id === row.materialId);
      const price = getEffectiveMaterialPrice(row.materialId);
      const productionCount = normalizeProductionCount(productionCountInput?.value);
      const totalRequired = row.quantity * productionCount;
      const subtotal = price * totalRequired;
      return `
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
      `;
    })
    .join("");

  recipeTableWrap.innerHTML = `
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
      <tbody>${htmlRows}</tbody>
    </table>
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
  const productionCount = normalizeProductionCount(productionCountInput?.value);
  if (productionCountInput) productionCountInput.value = String(productionCount);

  const salePrices = getSalePricesForEquipment(eq);
  const perItemMaterialCost = getRecipeRowsForSelectedEquipment().reduce(
    (sum, row) => sum + getEffectiveMaterialPrice(row.materialId) * row.quantity,
    0
  );
  const grandTotalMaterialCost = perItemMaterialCost * productionCount;

  const tool = getSelectedTool();
  const toolPurchasePrice = tool ? getToolPurchasePrice(tool.id) : 0;
  const perCraftToolCost = tool && tool.durability > 0 ? toolPurchasePrice / tool.durability : 0;
  const totalToolCost = perCraftToolCost * productionCount;

  const profitStar0 = salePrices.star0 - perItemMaterialCost - perCraftToolCost;
  const profitStar1 = salePrices.star1 - perItemMaterialCost - perCraftToolCost;
  const profitStar2 = salePrices.star2 - perItemMaterialCost - perCraftToolCost;
  const profitStar3 = salePrices.star3 - perItemMaterialCost - perCraftToolCost;

  if (perCraftToolCostEl) perCraftToolCostEl.textContent = formatGold(perCraftToolCost);
  if (totalToolCostEl) totalToolCostEl.textContent = formatGold(totalToolCost);
  if (totalMaterialCostEl) totalMaterialCostEl.textContent = formatGold(perItemMaterialCost);
  if (grandTotalMaterialCostEl) grandTotalMaterialCostEl.textContent = formatGold(grandTotalMaterialCost);
  if (salePriceStar0El) salePriceStar0El.textContent = formatGold(salePrices.star0);
  if (salePriceStar1El) salePriceStar1El.textContent = formatGold(salePrices.star1);
  if (salePriceStar2El) salePriceStar2El.textContent = formatGold(salePrices.star2);
  if (salePriceStar3El) salePriceStar3El.textContent = formatGold(salePrices.star3);
  if (profitStar0ValueEl) profitStar0ValueEl.textContent = formatGold(profitStar0);
  if (profitStar1ValueEl) profitStar1ValueEl.textContent = formatGold(profitStar1);
  if (profitStar2ValueEl) profitStar2ValueEl.textContent = formatGold(profitStar2);
  if (profitStar3ValueEl) profitStar3ValueEl.textContent = formatGold(profitStar3);

  applyProfitColor(profitStar0ValueEl, profitStar0);
  applyProfitColor(profitStar1ValueEl, profitStar1);
  applyProfitColor(profitStar2ValueEl, profitStar2);
  applyProfitColor(profitStar3ValueEl, profitStar3);
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
}

// --- イベント定義 ---
if (equipmentSelect) {
  equipmentSelect.addEventListener("change", (e) => {
    selectedEquipmentId = e.target.value;
    const eq = getSelectedEquipment();
    const salePrices = getSalePricesForEquipment(eq);
    if (salePriceStar0Input) salePriceStar0Input.value = salePrices.star0;
    if (salePriceStar1Input) salePriceStar1Input.value = salePrices.star1;
    if (salePriceStar2Input) salePriceStar2Input.value = salePrices.star2;
    if (salePriceStar3Input) salePriceStar3Input.value = salePrices.star3;
    renderRecipeTable();
    renderToolSection();
    calcAndRenderSummary();
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
  productionCountInput.addEventListener("change", () => {
    const normalized = normalizeProductionCount(productionCountInput.value);
    productionCountInput.value = String(normalized);
    renderRecipeTable();
    calcAndRenderSummary();
  });
}

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

// 初期化処理。
// 1) CSVを読み込む
// 2) ローカル保存の価格情報をマージ
// 3) 画面描画
async function initialize() {
  const storedData = loadStoredData();

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

  selectedEquipmentId = state.equipments[0]?.id || "";
  selectedToolId = "";
  saveData();
  rerenderAll();
}

initialize();
