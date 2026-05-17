(function () {
  const MEMO_STORAGE_KEY = "dq10_toolweb_memos_v1";
  const UI = {
    addError: "\u30e1\u30e2\u306b\u8ffd\u52a0\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f",
    added: "\u30e1\u30e2\u306b\u8ffd\u52a0\u3057\u307e\u3057\u305f",
    exists: "\u65e2\u306b\u30e1\u30e2\u6e08\u307f\u3067\u3059",
    memoButton: "\u3053\u306e\u30da\u30fc\u30b8\u3092\u30e1\u30e2",
    memoAria: "\u3053\u306e\u30da\u30fc\u30b8\u3092\u30e1\u30e2\u306b\u8ffd\u52a0",
    bottomNav: "\u4e0b\u90e8\u30ca\u30d3\u30b2\u30fc\u30b7\u30e7\u30f3",
    home: "\u30db\u30fc\u30e0",
    craft: "\u8077\u4eba",
    bazaar: "\u30d0\u30b6\u30fc",
    other: "\u305d\u306e\u4ed6",
    basic: "\u57fa\u672c\u60c5\u5831",
    detail: "\u8a73\u7d30",
    url: "URL",
  };
  const body = document.body;
  const pageType = String(body?.dataset?.individualType || "").trim();
  const pageName = String(body?.dataset?.individualName || "").trim();

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function limitText(value, maxLength = 360) {
    const text = cleanText(value);
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  function makeLink(href, icon, label) {
    const link = document.createElement("a");
    link.href = href;
    link.innerHTML = `<span class="individual-bottom-nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>`;
    return link;
  }

  function showToast(message) {
    const toast = document.createElement("p");
    toast.className = "individual-memo-toast";
    toast.textContent = message;
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 1600);
  }

  function loadMemoItems() {
    try {
      const raw = localStorage.getItem(MEMO_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveMemoItems(items) {
    localStorage.setItem(
      MEMO_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items,
      })
    );
  }

  function pushLine(lines, label, value) {
    const normalizedLabel = cleanText(label);
    const normalizedValue = limitText(value);
    if (!normalizedLabel || !normalizedValue || normalizedValue === "-") return;
    const line = `${normalizedLabel}: ${normalizedValue}`;
    if (!lines.includes(line)) lines.push(line);
  }

  function collectListLines(lines) {
    document.querySelectorAll("main li").forEach((item) => {
      const strong = item.querySelector("strong");
      if (!strong) return;
      const label = cleanText(strong.textContent).replace(/[：:]\s*$/, "");
      const cloned = item.cloneNode(true);
      cloned.querySelector("strong")?.remove();
      pushLine(lines, label, cloned.textContent);
    });
  }

  function collectSectionLines(lines) {
    document.querySelectorAll("main .card").forEach((card, index) => {
      const title = cleanText(card.querySelector("h2")?.textContent);
      if (!title) return;
      const cloned = card.cloneNode(true);
      cloned.querySelector("h2")?.remove();
      cloned.querySelectorAll(".actions, .note").forEach((element) => element.remove());
      pushLine(lines, title || `${UI.detail}${index + 1}`, cloned.textContent);
    });
  }

  function collectTableLines(lines) {
    document.querySelectorAll("main table").forEach((table) => {
      const rows = Array.from(table.querySelectorAll("tbody tr"))
        .map((row) => cleanText(row.textContent))
        .filter(Boolean)
        .slice(0, 20);
      if (rows.length) pushLine(lines, "\u5fc5\u8981\u7d20\u6750", rows.join(" / "));
    });
  }

  function collectMemoLines() {
    const lines = [];
    const meta = Array.from(document.querySelectorAll("main .meta span")).map((item) => cleanText(item.textContent)).filter(Boolean);
    if (meta.length) pushLine(lines, UI.basic, meta.join(" / "));
    collectListLines(lines);
    collectTableLines(lines);
    collectSectionLines(lines);
    pushLine(lines, UI.url, window.location.href);
    return lines;
  }

  function addCurrentPageMemo() {
    if (!pageType || !pageName) {
      showToast(UI.addError);
      return;
    }
    const items = loadMemoItems();
    const id = `${pageType}:${pageName}`;
    if (items.some((item) => String(item?.id || "") === id)) {
      showToast(UI.exists);
      return;
    }
    const now = new Date().toISOString();
    items.unshift({
      id,
      type: pageType,
      name: pageName,
      lines: collectMemoLines(),
      userNote: "",
      createdAt: now,
      updatedAt: "",
    });
    saveMemoItems(items);
    showToast(UI.added);
  }

  function installBottomNav() {
    if (document.querySelector(".individual-bottom-nav")) return;
    const nav = document.createElement("nav");
    nav.className = "individual-bottom-nav";
    nav.setAttribute("aria-label", UI.bottomNav);
    nav.append(makeLink("/", "\u2302", UI.home), makeLink("/craft/", "\u2692", UI.craft), makeLink("/bazaar/", "\u25c6", UI.bazaar));
    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.innerHTML = `<span class="individual-bottom-nav-icon" aria-hidden="true">\u2630</span><span>${UI.other}</span>`;
    menuButton.addEventListener("click", () => {
      const details = document.querySelector(".page-menu details");
      if (details) {
        details.open = true;
        details.querySelector("summary")?.focus();
      }
    });
    nav.append(menuButton);
    document.body.append(nav);
  }

  function installMemoButton() {
    if (!pageType || !pageName || document.querySelector(".individual-memo-button")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "individual-memo-button";
    button.textContent = UI.memoButton;
    button.setAttribute("aria-label", UI.memoAria);
    button.addEventListener("click", addCurrentPageMemo);
    document.body.append(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      installBottomNav();
      installMemoButton();
    });
  } else {
    installBottomNav();
    installMemoButton();
  }
})();
