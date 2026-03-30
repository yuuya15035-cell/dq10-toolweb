// DQ10職人ツール（CSV読み込み対応版）
// ============================================================
// 目的:
// - recipe.csv を読み込んで装備・素材・レシピを自動構築する
// - 同じ equipmentName を1つの装備としてまとめる
// - 画面デザインは既存構成（3タブ）をなるべく維持する
// - 価格編集などの操作は localStorage に保存する
// ============================================================

const STORAGE_KEY = "dq10_toolweb_data_v3";
const CSV_PATH = "recipe.csv";

// DOM参照
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

const materialForm = document.getElementById("materialForm");
const equipmentForm = document.getElementById("equipmentForm");
const recipeForm = document.getElementById("recipeForm");

const recipeEquipmentSelect = document.getElementById("recipeEquipmentSelect");
const recipeMaterialSelect = document.getElementById("recipeMaterialSelect");

// アプリ状態
let state = {
  equipments: [],
  materials: [],
  recipes: [],
};
let selectedEquipmentId = "";

function formatGold(value) {
  return `${Math.round(value).toLocaleString("ja-JP")} G`;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// 文字列から扱いやすいIDを作る（日本語にも対応するためシンプル実装）
function createId(prefix, rawValue, index) {
  const cleaned = String(rawValue)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w\u3040-\u30ff\u3400-\u9fffー＿]/g, "");
  return `${prefix}_${cleaned || index}`;
}

// 最小CSVパーサー（今回のCSVは単純列を想定）
function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((key, idx) => {
      row[key] = values[idx] ?? "";
    });
    return row;
  });
}

// recipe.csv から装備/素材/レシピを組み立てる
function buildDataFromCsvRows(rows) {
  const equipmentMap = new Map();
  const materialMap = new Map();
  const recipeList = [];

  rows.forEach((row, idx) => {
    const equipmentName = row.equipmentName || "";
    const materialName = row.materialName || "";
    const quantity = Number(row.quantity || 0);

    if (!equipmentName || !materialName || quantity <= 0) return;

    // 同じ equipmentName は同一装備として扱う
    if (!equipmentMap.has(equipmentName)) {
      equipmentMap.set(equipmentName, {
        equipmentId: createId("eq", equipmentName, idx),
        name: equipmentName,
        // CSV列を活かす。カテゴリは最小構成なので固定
        category: "CSV取込",
        craftType: row.craftLevel || "未設定",
        equipmentLevel: row.equipmentLevel || "",
        salePrice: 0,
        feeRate: 5,
      });
    }

    if (!materialMap.has(materialName)) {
      materialMap.set(materialName, {
        materialId: createId("mat", materialName, idx),
        name: materialName,
        unitPrice: 0,
      });
    }

    const equipment = equipmentMap.get(equipmentName);
    const material = materialMap.get(materialName);

    // 同じ装備×素材がCSV内に複数行ある場合は合算
    const existing = recipeList.find(
      (r) => r.equipmentId === equipment.equipmentId && r.materialId === material.materialId
    );
    if (existing) {
      existing.requiredQty += quantity;
    } else {
      recipeList.push({ equipmentId: equipment.equipmentId, materialId: material.materialId, requiredQty: quantity });
    }
  });

  return {
    equipments: Array.from(equipmentMap.values()),
    materials: Array.from(materialMap.values()),
    recipes: recipeList,
  };
}

// localStorageの編集値をCSV初期値にマージする
function mergeWithSavedData(baseData, savedData) {
  if (!savedData) return baseData;

  // 装備の販売価格/手数料を引き継ぐ
  baseData.equipments.forEach((eq) => {
    const saved = savedData.equipments?.find((s) => s.equipmentId === eq.equipmentId);
    if (saved) {
      eq.salePrice = Number(saved.salePrice || 0);
      eq.feeRate = Number(saved.feeRate || 0);
    }
  });

  // 素材単価を引き継ぐ
  baseData.materials.forEach((mat) => {
    const saved = savedData.materials?.find((s) => s.materialId === mat.materialId);
    if (saved) mat.unitPrice = Number(saved.unitPrice || 0);
  });

  // 画面から追加したデータも残したいので、存在しないIDは追加する
  const baseEquipmentIds = new Set(baseData.equipments.map((e) => e.equipmentId));
  (savedData.equipments || []).forEach((eq) => {
    if (!baseEquipmentIds.has(eq.equipmentId)) baseData.equipments.push(eq);
  });

  const baseMaterialIds = new Set(baseData.materials.map((m) => m.materialId));
  (savedData.materials || []).forEach((mat) => {
    if (!baseMaterialIds.has(mat.materialId)) baseData.materials.push(mat);
  });

  const key = (r) => `${r.equipmentId}::${r.materialId}`;
  const baseRecipeKeys = new Set(baseData.recipes.map(key));
  (savedData.recipes || []).forEach((r) => {
    if (!baseRecipeKeys.has(key(r))) baseData.recipes.push(r);
  });

  return baseData;
}

async function loadData() {
  const csvText = await fetch(CSV_PATH).then((r) => {
    if (!r.ok) throw new Error("recipe.csv の読み込みに失敗しました。");
    return r.text();
  });

  const csvRows = parseCsv(csvText);
  const base = buildDataFromCsvRows(csvRows);

  const savedRaw = localStorage.getItem(STORAGE_KEY);
  const saved = savedRaw ? JSON.parse(savedRaw) : null;

  const merged = mergeWithSavedData(base, saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

function switchTab(target) {
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === target));
  tabContents.forEach((tab) => tab.classList.toggle("active", tab.id === target));
}

tabButtons.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

function getSelectedEquipment() {
  return state.equipments.find((e) => e.equipmentId === selectedEquipmentId);
}

function getRecipeRowsForSelectedEquipment() {
  return state.recipes.filter((row) => row.equipmentId === selectedEquipmentId);
}

function renderEquipmentSelectors() {
  equipmentSelect.innerHTML = "";
  recipeEquipmentSelect.innerHTML = "";

  state.equipments.forEach((equipment) => {
    const label = `${equipment.name}（装備Lv:${equipment.equipmentLevel || "-"} / 職人Lv:${equipment.craftType}）`;
    equipmentSelect.add(new Option(label, equipment.equipmentId));
    recipeEquipmentSelect.add(new Option(label, equipment.equipmentId));
  });

  if (!state.equipments.some((e) => e.equipmentId === selectedEquipmentId)) {
    selectedEquipmentId = state.equipments[0]?.equipmentId || "";
  }

  equipmentSelect.value = selectedEquipmentId;
  recipeEquipmentSelect.value = selectedEquipmentId;
}

function renderMaterialSelector() {
  recipeMaterialSelect.innerHTML = "";
  state.materials.forEach((material) => {
    recipeMaterialSelect.add(new Option(`${material.name}（${material.materialId}）`, material.materialId));
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
    <p>装備Lv: <strong>${eq.equipmentLevel || "-"}</strong> / 必要職人Lv: <strong>${eq.craftType}</strong></p>
  `;
}

function renderRecipeTable() {
  const rows = getRecipeRowsForSelectedEquipment();
  if (rows.length === 0) {
    recipeTableWrap.innerHTML = "<p>この装備のレシピが未登録です。</p>";
    return;
  }

  const htmlRows = rows
    .map((row) => {
      const material = state.materials.find((m) => m.materialId === row.materialId);
      const unitPrice = material?.unitPrice || 0;
      const subtotal = unitPrice * row.requiredQty;
      return `
        <tr>
          <td>${material?.name ?? "(不明素材)"}</td>
          <td>${row.requiredQty}</td>
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
      <tbody>${htmlRows}</tbody>
    </table>
  `;
}

function calcAndRenderSummary() {
  const eq = getSelectedEquipment();
  const salePrice = Number(salePriceInput.value || eq?.salePrice || 0);
  const feeRate = Number(feeRateInput.value || eq?.feeRate || 0);

  const totalCost = getRecipeRowsForSelectedEquipment().reduce((sum, row) => {
    const material = state.materials.find((m) => m.materialId === row.materialId);
    return sum + (material?.unitPrice || 0) * row.requiredQty;
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
    .map(
      (m) => `
      <tr>
        <td>${m.materialId}</td>
        <td>${m.name}</td>
        <td><input class="inline-input" type="number" min="0" step="1" value="${m.unitPrice}" data-material-id="${m.materialId}"></td>
      </tr>`
    )
    .join("");

  materialListWrap.innerHTML = `
    <table class="table">
      <thead><tr><th>素材ID</th><th>素材名</th><th>単価（G）</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  materialListWrap.querySelectorAll("[data-material-id]").forEach((input) => {
    input.addEventListener("change", (e) => {
      const materialId = e.target.dataset.materialId;
      const target = state.materials.find((m) => m.materialId === materialId);
      if (!target) return;

      target.unitPrice = Number(e.target.value || 0);
      saveData();
      renderRecipeTable();
      calcAndRenderSummary();
    });
  });
}

function renderRecipeAdminList() {
  const rows = state.recipes
    .map((r, idx) => {
      const eq = state.equipments.find((e) => e.equipmentId === r.equipmentId);
      const mat = state.materials.find((m) => m.materialId === r.materialId);
      return `
      <tr>
        <td>${eq?.name ?? "(削除済み装備)"}</td>
        <td>${mat?.name ?? "(削除済み素材)"}</td>
        <td>${r.requiredQty}</td>
        <td><button class="small-btn" data-delete-recipe-index="${idx}">削除</button></td>
      </tr>`;
    })
    .join("");

  recipeAdminListWrap.innerHTML = `
    <table class="table">
      <thead><tr><th>装備</th><th>素材</th><th>必要数</th><th>操作</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  recipeAdminListWrap.querySelectorAll("[data-delete-recipe-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.deleteRecipeIndex);
      state.recipes.splice(idx, 1);
      saveData();
      rerenderAll();
    });
  });
}

function rerenderAll() {
  renderEquipmentSelectors();
  renderMaterialSelector();
  renderEquipmentInfo();

  const eq = getSelectedEquipment();
  salePriceInput.value = eq?.salePrice ?? 0;
  feeRateInput.value = eq?.feeRate ?? 5;

  renderRecipeTable();
  renderMaterialList();
  renderRecipeAdminList();
  calcAndRenderSummary();
}

// イベント

equipmentSelect.addEventListener("change", (e) => {
  selectedEquipmentId = e.target.value;
  const eq = getSelectedEquipment();
  salePriceInput.value = eq?.salePrice ?? 0;
  feeRateInput.value = eq?.feeRate ?? 5;
  renderEquipmentInfo();
  renderRecipeTable();
  calcAndRenderSummary();
});

salePriceInput.addEventListener("change", (e) => {
  const eq = getSelectedEquipment();
  if (!eq) return;
  eq.salePrice = Number(e.target.value || 0);
  saveData();
  calcAndRenderSummary();
});

feeRateInput.addEventListener("change", (e) => {
  const eq = getSelectedEquipment();
  if (!eq) return;
  eq.feeRate = Number(e.target.value || 0);
  saveData();
  calcAndRenderSummary();
});

materialForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const materialId = document.getElementById("newMaterialId").value.trim();
  const name = document.getElementById("newMaterialName").value.trim();
  const unitPrice = Number(document.getElementById("newMaterialPrice").value || 0);

  if (!materialId || !name) return;
  if (state.materials.some((m) => m.materialId === materialId)) {
    alert("素材IDが重複しています。");
    return;
  }

  state.materials.push({ materialId, name, unitPrice });
  saveData();
  materialForm.reset();
  rerenderAll();
});

equipmentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const equipmentId = document.getElementById("newEquipmentId").value.trim();
  const name = document.getElementById("newEquipmentName").value.trim();
  const category = document.getElementById("newEquipmentCategory").value.trim();
  const craftType = document.getElementById("newEquipmentCraftType").value.trim();
  const salePrice = Number(document.getElementById("newEquipmentPrice").value || 0);
  const feeRate = Number(document.getElementById("newEquipmentFeeRate").value || 0);

  if (!equipmentId || !name || !category || !craftType) return;
  if (state.equipments.some((eq) => eq.equipmentId === equipmentId)) {
    alert("装備IDが重複しています。");
    return;
  }

  state.equipments.push({
    equipmentId,
    name,
    category,
    craftType,
    equipmentLevel: "",
    salePrice,
    feeRate,
  });
  selectedEquipmentId = equipmentId;
  saveData();
  equipmentForm.reset();
  rerenderAll();
});

recipeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const equipmentId = recipeEquipmentSelect.value;
  const materialId = recipeMaterialSelect.value;
  const requiredQty = Number(document.getElementById("recipeQuantity").value || 0);
  if (!equipmentId || !materialId || requiredQty <= 0) return;

  const existing = state.recipes.find((r) => r.equipmentId === equipmentId && r.materialId === materialId);
  if (existing) {
    existing.requiredQty += requiredQty;
  } else {
    state.recipes.push({ equipmentId, materialId, requiredQty });
  }

  selectedEquipmentId = equipmentId;
  saveData();
  recipeForm.reset();
  rerenderAll();
});

async function init() {
  try {
    state = await loadData();
    selectedEquipmentId = state.equipments[0]?.equipmentId || "";
    rerenderAll();
  } catch (error) {
    console.error(error);
    alert("recipe.csv の読込に失敗しました。列名を確認してください。");
  }
}

init();
