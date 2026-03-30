// DQ10職人ツール（recipe.csv 読込シンプル版）
// =====================================================
// - recipe.csv を読み込む
// - 同じ equipmentName を1つにまとめて装備一覧を作る
// - 装備選択時に必要素材と必要数を表示する
// - 画面デザインは既存の3タブを維持
// - 価格系の入力値だけ localStorage に保存
// =====================================================

const STORAGE_KEY = "dq10_toolweb_csv_prices_v1";
const CSV_PATH = "recipe.csv";

// --- DOM参照 ---
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

const equipmentSelect = document.getElementById("equipmentSelect");
const equipmentInfo = document.getElementById("equipmentInfo");
const salePriceInput = document.getElementById("salePriceInput");
const feeRateInput = document.getElementById("feeRateInput");
const recipeTableWrap = document.getElementById("recipeTableWrap");
const materialListWrap = document.getElementById("materialListWrap");
const recipeAdminListWrap = document.getElementById("recipeAdminListWrap");

const totalCostEl = document.getElementById("totalCost");
const netSalesEl = document.getElementById("netSales");
const profitValueEl = document.getElementById("profitValue");
const profitRateEl = document.getElementById("profitRate");

// 既存HTMLにあるフォーム（見た目維持のため利用）
const materialForm = document.getElementById("materialForm");
const equipmentForm = document.getElementById("equipmentForm");
const recipeForm = document.getElementById("recipeForm");
const recipeEquipmentSelect = document.getElementById("recipeEquipmentSelect");
const recipeMaterialSelect = document.getElementById("recipeMaterialSelect");

// --- 状態 ---
let state = {
  equipments: [], // [{ equipmentId, name, equipmentLevel, craftLevel }]
  materials: [], // [{ materialId, name }]
  recipes: [], // [{ equipmentId, materialId, quantity }]
  prices: {
    materialPrices: {}, // { [materialId]: number }
    salePrices: {}, // { [equipmentId]: number }
    feeRates: {}, // { [equipmentId]: number }
  },
};
let selectedEquipmentId = "";

function formatGold(value) {
  return `${Math.round(value).toLocaleString("ja-JP")} G`;
}

function makeId(prefix, name) {
  // 日本語でも壊れにくいよう、エンコード値を短縮利用
  return `${prefix}_${encodeURIComponent(name).replace(/%/g, "")}`;
}

function parseCsv(csvText) {
  // 今回の前提CSVは「単純なカンマ区切り」で扱う
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

function buildStateFromCsvRows(rows) {
  const equipmentByName = new Map();
  const materialByName = new Map();
  const recipes = [];

  rows.forEach((row) => {
    const equipmentName = row.equipmentName;
    const materialName = row.materialName;
    const quantity = Number(row.quantity || 0);

    if (!equipmentName || !materialName || quantity <= 0) return;

    if (!equipmentByName.has(equipmentName)) {
      equipmentByName.set(equipmentName, {
        equipmentId: makeId("eq", equipmentName),
        name: equipmentName,
        equipmentLevel: row.equipmentLevel || "",
        craftLevel: row.craftLevel || "",
      });
    }

    if (!materialByName.has(materialName)) {
      materialByName.set(materialName, {
        materialId: makeId("mat", materialName),
        name: materialName,
      });
    }

    const eq = equipmentByName.get(equipmentName);
    const mat = materialByName.get(materialName);

    // 同じ装備×素材が複数行ある場合は必要数を合算
    const exists = recipes.find((r) => r.equipmentId === eq.equipmentId && r.materialId === mat.materialId);
    if (exists) {
      exists.quantity += quantity;
    } else {
      recipes.push({ equipmentId: eq.equipmentId, materialId: mat.materialId, quantity });
    }
  });

  return {
    equipments: Array.from(equipmentByName.values()),
    materials: Array.from(materialByName.values()),
    recipes,
  };
}

function loadSavedPrices() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { materialPrices: {}, salePrices: {}, feeRates: {} };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      materialPrices: parsed.materialPrices || {},
      salePrices: parsed.salePrices || {},
      feeRates: parsed.feeRates || {},
    };
  } catch {
    return { materialPrices: {}, salePrices: {}, feeRates: {} };
  }
}

function savePrices() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prices));
}

function getSelectedEquipment() {
  return state.equipments.find((e) => e.equipmentId === selectedEquipmentId);
}

function getRecipeRowsForSelectedEquipment() {
  return state.recipes.filter((r) => r.equipmentId === selectedEquipmentId);
}

function switchTab(target) {
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === target));
  tabContents.forEach((tab) => tab.classList.toggle("active", tab.id === target));
}

tabButtons.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

function renderEquipmentSelectors() {
  equipmentSelect.innerHTML = "";
  recipeEquipmentSelect.innerHTML = "";

  state.equipments.forEach((eq) => {
    const label = `${eq.name}（装備Lv:${eq.equipmentLevel || "-"} / 職人Lv:${eq.craftLevel || "-"}）`;
    equipmentSelect.add(new Option(label, eq.equipmentId));
    recipeEquipmentSelect.add(new Option(label, eq.equipmentId));
  });

  if (!state.equipments.some((eq) => eq.equipmentId === selectedEquipmentId)) {
    selectedEquipmentId = state.equipments[0]?.equipmentId || "";
  }

  equipmentSelect.value = selectedEquipmentId;
  recipeEquipmentSelect.value = selectedEquipmentId;
}

function renderMaterialSelector() {
  recipeMaterialSelect.innerHTML = "";
  state.materials.forEach((mat) => {
    recipeMaterialSelect.add(new Option(mat.name, mat.materialId));
  });
}

function renderEquipmentInfo() {
  const eq = getSelectedEquipment();
  if (!eq) {
    equipmentInfo.innerHTML = "<p>装備データがありません。</p>";
    return;
  }

  equipmentInfo.innerHTML = `
    <h3>選択中の装備情報</h3>
    <p>装備名: <strong>${eq.name}</strong></p>
    <p>装備Lv: <strong>${eq.equipmentLevel || "-"}</strong> / 職人Lv: <strong>${eq.craftLevel || "-"}</strong></p>
  `;
}

function renderRecipeTable() {
  const rows = getRecipeRowsForSelectedEquipment();
  if (rows.length === 0) {
    recipeTableWrap.innerHTML = "<p>この装備の素材データはありません。</p>";
    return;
  }

  const html = rows
    .map((row) => {
      const material = state.materials.find((m) => m.materialId === row.materialId);
      const unitPrice = Number(state.prices.materialPrices[row.materialId] || 0);
      const subtotal = unitPrice * row.quantity;
      return `
        <tr>
          <td>${material?.name ?? "(不明素材)"}</td>
          <td>${row.quantity}</td>
          <td>${formatGold(unitPrice)}</td>
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
          <th>必要数</th>
          <th>単価</th>
          <th>小計</th>
        </tr>
      </thead>
      <tbody>${html}</tbody>
    </table>
  `;
}

function calcAndRenderSummary() {
  const salePrice = Number(salePriceInput.value || 0);
  const feeRate = Number(feeRateInput.value || 0);

  const totalCost = getRecipeRowsForSelectedEquipment().reduce((sum, row) => {
    const unitPrice = Number(state.prices.materialPrices[row.materialId] || 0);
    return sum + unitPrice * row.quantity;
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
  const rows = state.materials
    .map((mat) => {
      const price = Number(state.prices.materialPrices[mat.materialId] || 0);
      return `
        <tr>
          <td>${mat.name}</td>
          <td><input class="inline-input" type="number" min="0" step="1" value="${price}" data-material-id="${mat.materialId}" /></td>
        </tr>
      `;
    })
    .join("");

  materialListWrap.innerHTML = `
    <table class="table">
      <thead><tr><th>素材名</th><th>単価（G）</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  materialListWrap.querySelectorAll("[data-material-id]").forEach((input) => {
    input.addEventListener("change", (e) => {
      const materialId = e.target.dataset.materialId;
      state.prices.materialPrices[materialId] = Number(e.target.value || 0);
      savePrices();
      renderRecipeTable();
      calcAndRenderSummary();
    });
  });
}

function renderRecipeAdminList() {
  // 既存画面枠は維持しつつ、CSVソースであることを表示
  const rows = getRecipeRowsForSelectedEquipment()
    .map((r) => {
      const mat = state.materials.find((m) => m.materialId === r.materialId);
      return `<tr><td>${mat?.name ?? "-"}</td><td>${r.quantity}</td></tr>`;
    })
    .join("");

  recipeAdminListWrap.innerHTML = `
    <p>※ レシピ元データは <code>recipe.csv</code> です（この画面は参照表示）。</p>
    <table class="table">
      <thead><tr><th>素材名</th><th>必要数</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function rerenderAll() {
  renderEquipmentSelectors();
  renderMaterialSelector();
  renderEquipmentInfo();

  const sale = Number(state.prices.salePrices[selectedEquipmentId] || 0);
  const fee = Number(state.prices.feeRates[selectedEquipmentId] ?? 5);
  salePriceInput.value = sale;
  feeRateInput.value = fee;

  renderRecipeTable();
  renderMaterialList();
  renderRecipeAdminList();
  calcAndRenderSummary();
}

// --- イベント ---
equipmentSelect.addEventListener("change", (e) => {
  selectedEquipmentId = e.target.value;
  salePriceInput.value = Number(state.prices.salePrices[selectedEquipmentId] || 0);
  feeRateInput.value = Number(state.prices.feeRates[selectedEquipmentId] ?? 5);
  renderEquipmentInfo();
  renderRecipeTable();
  renderRecipeAdminList();
  calcAndRenderSummary();
});

salePriceInput.addEventListener("change", (e) => {
  state.prices.salePrices[selectedEquipmentId] = Number(e.target.value || 0);
  savePrices();
  calcAndRenderSummary();
});

feeRateInput.addEventListener("change", (e) => {
  state.prices.feeRates[selectedEquipmentId] = Number(e.target.value || 0);
  savePrices();
  calcAndRenderSummary();
});

// 既存のフォームは「シンプル実装」優先でCSV管理へ誘導
[materialForm, equipmentForm, recipeForm].forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("この版では recipe.csv 管理を前提にしています。データ追加は recipe.csv を編集してください。");
  });
});

async function init() {
  try {
    const csvText = await fetch(CSV_PATH).then((res) => {
      if (!res.ok) throw new Error("recipe.csv の読み込みに失敗しました。");
      return res.text();
    });

    const rows = parseCsv(csvText);
    const csvData = buildStateFromCsvRows(rows);

    state.equipments = csvData.equipments;
    state.materials = csvData.materials;
    state.recipes = csvData.recipes;
    state.prices = loadSavedPrices();

    selectedEquipmentId = state.equipments[0]?.equipmentId || "";
    rerenderAll();
  } catch (error) {
    console.error(error);
    alert("recipe.csv の読み込みに失敗しました。ファイル配置と列名を確認してください。");
  }
}

init();
