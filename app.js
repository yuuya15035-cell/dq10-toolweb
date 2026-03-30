// DQ10職人ツールの最小実装。
// 日本語コメントを多めに入れて、将来の拡張をしやすくしています。

const STORAGE_KEY = "dq10_toolweb_data_v1";
// recipe.csv の配置先。data ディレクトリ配下を正として扱います。
const RECIPE_CSV_PATH = "./data/recipe.csv";

// 初期データ（CSVが読み込めない場合のフォールバック）
const defaultData = {
  feeRate: 5,
  materials: [
    { id: "m:てっこうせき", name: "てっこうせき", price: 120 },
    { id: "m:ぎんのこうせき", name: "ぎんのこうせき", price: 320 },
    { id: "m:ようせいのひだね", name: "ようせいのひだね", price: 450 },
  ],
  equipments: [
    { id: "e:はがねのつるぎ", name: "はがねのつるぎ", salePrice: 3200 },
    { id: "e:ぎんのレイピア", name: "ぎんのレイピア", salePrice: 5800 },
  ],
  recipes: [
    { id: crypto.randomUUID(), equipmentId: "e:はがねのつるぎ", materialId: "m:ぎんのこうせき", quantity: 1 },
    { id: crypto.randomUUID(), equipmentId: "e:はがねのつるぎ", materialId: "m:てっこうせき", quantity: 1 },
    { id: crypto.randomUUID(), equipmentId: "e:ぎんのレイピア", materialId: "m:ぎんのこうせき", quantity: 1 },
  ],
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

// recipe.csvを読み込み、画面で使うデータ構造に変換します。
async function loadDataFromCsv() {
  const response = await fetch(RECIPE_CSV_PATH);
  if (!response.ok) {
    throw new Error(`CSVの読み込みに失敗しました: ${response.status}`);
  }

  const csvText = await response.text();
  // UTF-8 BOMが入っている場合があるので除去しておきます。
  const normalized = csvText.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/).filter((line) => line.trim().length > 0);
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
        salePrice: 0,
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

  return {
    feeRate: 5,
    equipments: Array.from(equipmentMap.values()),
    materials: Array.from(materialMap.values()),
    recipes,
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
  const salePriceByName = new Map((storedData.equipments || []).map((e) => [e.name, Number(e.salePrice || 0)]));

  return {
    feeRate: Number(storedData.feeRate ?? csvData.feeRate ?? 5),
    materials: csvData.materials.map((m) => ({
      ...m,
      price: materialPriceByName.get(m.name) ?? m.price,
    })),
    equipments: csvData.equipments.map((e) => ({
      ...e,
      salePrice: salePriceByName.get(e.name) ?? e.salePrice,
    })),
    recipes: csvData.recipes,
  };
}

let state = structuredClone(defaultData);
let selectedEquipmentId = state.equipments[0]?.id || "";
// 装備検索キーワード（利益計算画面の装備プルダウン用）
let equipmentSearchKeyword = "";
// 利益計算画面の絞り込み条件（未選択なら全件）
let selectedCraftsman = "";
let selectedCategory = "";

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
const salePriceInput = getRequiredElementById("salePriceInput");
const feeRateInput = getRequiredElementById("feeRateInput");
const recipeTableWrap = getRequiredElementById("recipeTableWrap");
const materialListWrap = getRequiredElementById("materialListWrap");
const recipeAdminListWrap = getRequiredElementById("recipeAdminListWrap");

const totalCostEl = getRequiredElementById("totalCost");
const netSalesEl = getRequiredElementById("netSales");
const profitValueEl = getRequiredElementById("profitValue");
const profitRateEl = getRequiredElementById("profitRate");

const materialForm = getRequiredElementById("materialForm");
const equipmentForm = getRequiredElementById("equipmentForm");
const recipeForm = getRequiredElementById("recipeForm");

const recipeEquipmentSelect = getRequiredElementById("recipeEquipmentSelect");
const recipeMaterialSelect = getRequiredElementById("recipeMaterialSelect");

function formatGold(value) {
  return `${Math.round(value).toLocaleString("ja-JP")} G`;
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

function getRecipeRowsForSelectedEquipment() {
  return state.recipes.filter((row) => row.equipmentId === selectedEquipmentId);
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
      const price = material?.price || 0;
      const subtotal = price * row.quantity;
      return `
        <tr>
          <td>${material?.name ?? "(削除済み素材)"}</td>
          <td>${row.quantity}</td>
          <td>${formatGold(price)}</td>
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
          <th>必要個数</th>
          <th>単価</th>
          <th>小計</th>
        </tr>
      </thead>
      <tbody>${htmlRows}</tbody>
    </table>
  `;
}

function calcAndRenderSummary() {
  if (!salePriceInput || !feeRateInput || !totalCostEl || !netSalesEl || !profitValueEl || !profitRateEl) return;

  const eq = getSelectedEquipment();
  const salePrice = Number(salePriceInput.value || eq?.salePrice || 0);
  const feeRate = Number(feeRateInput.value || state.feeRate || 0);

  const totalCost = getRecipeRowsForSelectedEquipment().reduce((sum, row) => {
    const material = state.materials.find((m) => m.id === row.materialId);
    return sum + (material?.price || 0) * row.quantity;
  }, 0);

  const netSales = salePrice * (1 - feeRate / 100);
  const profit = netSales - totalCost;
  const profitRate = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  totalCostEl.textContent = formatGold(totalCost);
  netSalesEl.textContent = formatGold(netSales);
  profitValueEl.textContent = formatGold(profit);
  profitRateEl.textContent = `${profitRate.toFixed(2)} %`;
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
  if (salePriceInput) salePriceInput.value = eq?.salePrice ?? 0;
  if (feeRateInput) feeRateInput.value = state.feeRate ?? 5;

  renderRecipeTable();
  renderMaterialList();
  renderRecipeAdminList();
  calcAndRenderSummary();
}

// --- イベント定義 ---
if (equipmentSelect) {
  equipmentSelect.addEventListener("change", (e) => {
    selectedEquipmentId = e.target.value;
    const eq = getSelectedEquipment();
    if (salePriceInput) salePriceInput.value = eq?.salePrice ?? 0;
    renderRecipeTable();
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

if (salePriceInput) {
  salePriceInput.addEventListener("change", (e) => {
    const eq = getSelectedEquipment();
    if (!eq) return;
    eq.salePrice = Number(e.target.value || 0);
    saveData();
    calcAndRenderSummary();
  });
}

if (feeRateInput) {
  feeRateInput.addEventListener("change", (e) => {
    state.feeRate = Number(e.target.value || 0);
    saveData();
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
    const added = { id: makeEquipmentId(name), name, salePrice, craftsman: "", category: "" };
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
  saveData();
  rerenderAll();
}

initialize();
