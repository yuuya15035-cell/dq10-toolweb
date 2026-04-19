const UPDATES_JSON_PATH = "./data/updates.json";

function parseOfficialUrl(value) {
  const raw = String(value || "").trim();
  if (raw === "") return "";
  try {
    const url = new URL(raw);
    return /^https?:$/i.test(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatTopUpdateDate(dateText) {
  const normalized = String(dateText || "").trim();
  const matched = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return normalized;
  return `${matched[1]}/${matched[2]}/${matched[3]}`;
}

async function loadTopUpdates() {
  const response = await fetch(UPDATES_JSON_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`updates.json の読み込みに失敗しました: ${response.status}`);
  }
  const parsed = await response.json();
  return normalizeUpdates(parsed);
}

function renderUpdateList(updates) {
  const list = document.getElementById("allUpdateList");
  if (!list) return;

  if (!Array.isArray(updates) || updates.length === 0) {
    list.innerHTML = "<li>表示できる更新情報がありません。</li>";
    return;
  }

  list.innerHTML = updates
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

function getUpdateSearchKeywordFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get("q") || "").trim();
}

function renderUpdateSearchStatus(keyword, totalCount, filteredCount) {
  const status = document.getElementById("updatesSearchStatus");
  if (!status) return;
  if (!keyword) {
    status.textContent = "";
    return;
  }
  status.textContent = `検索: 「${keyword}」 / ${filteredCount}件（全${totalCount}件）`;
}

async function initUpdatesPage() {
  try {
    const updates = await loadTopUpdates();
    const keyword = getUpdateSearchKeywordFromUrl();
    const normalizedKeyword = keyword.toLowerCase();
    const filteredUpdates = normalizedKeyword
      ? updates.filter((entry) => [entry.date, entry.text].join(" ").toLowerCase().includes(normalizedKeyword))
      : updates;
    renderUpdateSearchStatus(keyword, updates.length, filteredUpdates.length);
    renderUpdateList(filteredUpdates);
  } catch (error) {
    console.error("更新情報一覧の初期化に失敗しました", error);
    renderUpdateList([]);
  }
}

void initUpdatesPage();
