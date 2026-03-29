// DQ10職人ツールの最小実装。
// 日本語コメントを多めに入れて、将来の拡張をしやすくしています。

const STORAGE_KEY = "dq10_toolweb_data_v1";

// 初期データ（最初は最小構成）
const defaultData = {
  feeRate: 5,
  materials: [
    { id: crypto.randomUUID(), name: "てっこうせき", price: 120 },
    { id: crypto.randomUUID(), name: "ぎんのこうせき", price: 320 },
    { id: crypto.randomUUID(), name: "ようせいのひだね", price: 450 },
  ],
  equipments: [
    { id: crypto.randomUUID(), name: "はがねのつるぎ", salePrice: 3200 },
    { id: crypto.randomUUID(), name: "ぎんのレイピア", salePrice: 5800 },
  ],
  recipes: [],
};

// 初期レシピをID確定後に設定する
function fillDefaultRecipes(data) {
  if (data.recipes.length > 0) return data;
  const sword = data.equipments.find((e) => e.name === "はがねのつるぎ");
  const rapier = data.equipments.find((e) => e.name === "ぎんのレイピア");
  const iron = data.materials.find((m) => m.name === "てっこうせき");
  const silver = data.materials.find((m) => m.name === "ぎんのこうせき");
  const fire = data.materials.find((m) => m.name === "ようせいのひだね");

  data.recipes = [
    { id: crypto.randomUUID(), equipmentId: sword?.id, materialId: iron?.id, quantity: 5 },
    { id: crypto.randomUUID(), equipmentId: sword?.id, materialId: fire?.id, quantity: 1 },
    { id: crypto.randomUUID(), equipmentId: rapier?.id, materialId: silver?.id, quantity: 4 },
    { id: crypto.randomUUID(), equipmentId: rapier?.id, materialId: fire?.id, quantity: 2 },
  ].filter((r) => r.equipmentId && r.materialId);

  return data;
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = fillDefaultRecipes(defaultData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return structuredClone(seeded);
  }
  return fillDefaultRecipes(JSON.parse(raw));
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadData();
let selectedEquipmentId = state.equipments[0]?.id || "";

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

const equipmentSelect = document.getElementById("equipmentSelect");
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
  equipmentSelect.innerHTML = "";
  recipeEquipmentSelect.innerHTML = "";

  state.equipments.forEach((equipment) => {
    const o1 = new Option(equipment.name, equipment.id);
    const o2 = new Option(equipment.name, equipment.id);
    equipmentSelect.add(o1);
    recipeEquipmentSelect.add(o2);
  });

  if (!state.equipments.some((e) => e.id === selectedEquipmentId)) {
    selectedEquipmentId = state.equipments[0]?.id || "";
  }
  equipmentSelect.value = selectedEquipmentId;
  recipeEquipmentSelect.value = selectedEquipmentId;
}

function renderMaterialSelector() {
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
  renderEquipmentSelectors();
  renderMaterialSelector();

  const eq = getSelectedEquipment();
  salePriceInput.value = eq?.salePrice ?? 0;
  feeRateInput.value = state.feeRate ?? 5;

  renderRecipeTable();
  renderMaterialList();
  renderRecipeAdminList();
  calcAndRenderSummary();
}

// --- イベント定義 ---
equipmentSelect.addEventListener("change", (e) => {
  selectedEquipmentId = e.target.value;
  const eq = getSelectedEquipment();
  salePriceInput.value = eq?.salePrice ?? 0;
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
  state.feeRate = Number(e.target.value || 0);
  saveData();
  calcAndRenderSummary();
});

materialForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("newMaterialName").value.trim();
  const price = Number(document.getElementById("newMaterialPrice").value || 0);
  if (!name) return;

  state.materials.push({ id: crypto.randomUUID(), name, price });
  saveData();
  materialForm.reset();
  rerenderAll();
});

equipmentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("newEquipmentName").value.trim();
  const salePrice = Number(document.getElementById("newEquipmentPrice").value || 0);
  if (!name) return;

  const added = { id: crypto.randomUUID(), name, salePrice };
  state.equipments.push(added);
  selectedEquipmentId = added.id;
  saveData();
  equipmentForm.reset();
  rerenderAll();
});

recipeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const equipmentId = recipeEquipmentSelect.value;
  const materialId = recipeMaterialSelect.value;
  const quantity = Number(document.getElementById("recipeQuantity").value || 0);
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

// 初期描画
rerenderAll();
