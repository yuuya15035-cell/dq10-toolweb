// DQ10職人ツール（データ分離版）
// ------------------------------------------------------------
// このファイルには、装備・素材・レシピの具体データを直書きしません。
// 初期データは /data/*.json から読み込み、編集結果は localStorage に保存します。
// ------------------------------------------------------------

const STORAGE_KEY = "dq10_toolweb_data_v2";

const DATA_FILES = {
  equipments: "data/equipments.json",
  materials: "data/materials.json",
  recipes: "data/recipes.json",
};

// 画面DOMの参照をまとめておく（可読性向上）
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

// 状態（state）
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

async function loadDefaultDataFromJson() {
  // JSONを分離して読み込む。
  // 将来的にデータ量が増えても、各ファイルを独立管理しやすくする狙い。
  const [equipments, materials, recipes] = await Promise.all([
    fetch(DATA_FILES.equipments).then((r) => r.json()),
    fetch(DATA_FILES.materials).then((r) => r.json()),
    fetch(DATA_FILES.recipes).then((r) => r.json()),
  ]);

  return { equipments, materials, recipes };
}

async function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const defaults = await loadDefaultDataFromJson();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function switchTab(target) {
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === target));
  tabContents.forEach((tab) => tab.classList.toggle("active", tab.id === target));
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

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
    const label = `${equipment.name}（${equipment.category} / ${equipment.craftType}）`;
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
    <p>装備ID: <strong>${eq.equipmentId}</strong></p>
    <p>カテゴリ: <strong>${eq.category}</strong> / 職人種別: <strong>${eq.craftType}</strong></p>
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
          <td>${material?.materialId ?? "-"}</td>
          <td>${material?.name ?? "(削除済み素材)"}</td>
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
          <th>素材ID</th>
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
  feeRateInput.value = eq?.feeRate ?? 0;

  renderRecipeTable();
  renderMaterialList();
  renderRecipeAdminList();
  calcAndRenderSummary();
}

// ---- イベント ----

equipmentSelect.addEventListener("change", (e) => {
  selectedEquipmentId = e.target.value;
  const eq = getSelectedEquipment();

  salePriceInput.value = eq?.salePrice ?? 0;
  feeRateInput.value = eq?.feeRate ?? 0;

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
    alert("素材IDが重複しています。別のIDを使ってください。");
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
    alert("装備IDが重複しています。別のIDを使ってください。");
    return;
  }

  state.equipments.push({ equipmentId, name, category, craftType, salePrice, feeRate });
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

  // 同じ装備ID+素材IDが既にある場合は必要数を加算する
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
    alert("データ読み込みに失敗しました。data/*.json を確認してください。");
  }
}

init();
