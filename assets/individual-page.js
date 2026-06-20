(function () {
  const MEMO_STORAGE_KEY = "dq10_toolweb_memos_v1";
  const MEMO_LIMIT = 10;
  const UI = {
    addError: "\u30e1\u30e2\u306b\u8ffd\u52a0\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f",
    added: "\u30e1\u30e2\u306b\u8ffd\u52a0\u3057\u307e\u3057\u305f",
    exists: "\u65e2\u306b\u30e1\u30e2\u6e08\u307f\u3067\u3059",
    addMemo: "\uff0b\u30e1\u30e2",
    openMemo: "\u30e1\u30e2",
    close: "\u9589\u3058\u308b",
    empty: "\u30e1\u30e2\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093",
    bottomNav: "\u4e0b\u90e8\u30ca\u30d3\u30b2\u30fc\u30b7\u30e7\u30f3",
    home: "\u30db\u30fc\u30e0",
    craft: "\u8077\u4eba",
    bazaar: "\u30d0\u30b6\u30fc",
    other: "\u305d\u306e\u4ed6",
    type: "\u7a2e\u5225",
    name: "\u540d\u524d",
    basic: "\u57fa\u672c\u60c5\u5831",
    url: "URL",
  };
  const body = document.body;
  const pageType = String(body?.dataset?.individualType || "").trim();
  const pageName = String(body?.dataset?.individualName || "").trim();

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function limitText(value, maxLength = 480) {
    const text = cleanText(value);
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function unique(values) {
    const seen = new Set();
    return values
      .map(cleanText)
      .filter((value) => value && value !== "-")
      .filter((value) => {
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      });
  }

  function summarize(values, limit = MEMO_LIMIT) {
    const list = unique(values);
    if (!list.length) return "";
    const head = list.slice(0, limit).join("\u3001");
    const rest = list.length - limit;
    return rest > 0 ? `${head} \u307b\u304b${rest}\u4ef6\u306f\u8a73\u7d30\u30da\u30fc\u30b8\u3067\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002` : head;
  }

  function pushLine(lines, label, value) {
    const normalizedLabel = cleanText(label).replace(/[：:]\s*$/, "");
    const normalizedValue = limitText(value);
    if (!normalizedLabel || !normalizedValue || normalizedValue === "-") return;
    const line = `${normalizedLabel}\uff1a${normalizedValue}`;
    if (!lines.includes(line)) lines.push(line);
  }

  function getCards() {
    return Array.from(document.querySelectorAll("main .card"));
  }

  function findCardByTitle(patterns) {
    const list = Array.isArray(patterns) ? patterns : [patterns];
    return getCards().find((card) => {
      const title = cleanText(card.querySelector("h2")?.textContent);
      return list.some((pattern) => (pattern instanceof RegExp ? pattern.test(title) : title.includes(pattern)));
    });
  }

  function getListValues(card) {
    if (!card) return [];
    return Array.from(card.querySelectorAll("li")).map((item) => {
      const linkText = cleanText(item.querySelector("a")?.textContent);
      if (linkText) return linkText;
      const cloned = item.cloneNode(true);
      cloned.querySelector("strong")?.remove();
      return cleanText(cloned.textContent);
    });
  }

  function getStrongListLines(lines) {
    document.querySelectorAll("main li").forEach((item) => {
      const strong = item.querySelector("strong");
      if (!strong) return;
      const label = cleanText(strong.textContent).replace(/[：:]\s*$/, "");
      const cloned = item.cloneNode(true);
      cloned.querySelector("strong")?.remove();
      const values = cleanText(cloned.textContent)
        .split(/\s*\/\s*|\s*、\s*/)
        .map(cleanText)
        .filter(Boolean);
      pushLine(lines, label, summarize(values));
    });
  }

  function getDefinitionLine(lines, label, card) {
    if (!card) return;
    const values = [];
    const children = Array.from(card.querySelectorAll("dt"));
    children.forEach((dt) => {
      const dd = dt.nextElementSibling;
      if (dd) values.push(`${cleanText(dt.textContent)} ${cleanText(dd.textContent)}`);
    });
    pushLine(lines, label, values.join(" / "));
  }

  function getTableLine(lines, label) {
    const rows = Array.from(document.querySelectorAll("main table tbody tr")).map((row) => {
      const cells = Array.from(row.querySelectorAll("td")).map((cell) => cleanText(cell.textContent));
      if (!cells.length) return "";
      return cells.slice(0, 4).join(" / ");
    });
    pushLine(lines, label, summarize(rows));
  }

  function getSectionText(lines, label, patterns) {
    const card = findCardByTitle(patterns);
    if (!card) return;
    const values = getListValues(card);
    if (values.length) {
      pushLine(lines, label, summarize(values));
      return;
    }
    const cloned = card.cloneNode(true);
    cloned.querySelector("h2")?.remove();
    cloned.querySelectorAll(".actions, .note, table").forEach((element) => element.remove());
    pushLine(lines, label, cloned.textContent);
  }

  function getMaterialDropLines(lines) {
    const card = findCardByTitle([/\u843d\u3068\u3059/, /\u30c9\u30ed\u30c3\u30d7/]);
    if (!card) return;
    const normal = [];
    const rare = [];
    getListValues(card);
    card.querySelectorAll("li").forEach((item) => {
      const name = cleanText(item.querySelector("a")?.textContent);
      const type = cleanText(item.querySelector("span")?.textContent);
      if (!name) return;
      if (/\u30ec\u30a2|rare/i.test(type)) rare.push(name);
      else normal.push(name);
    });
    pushLine(lines, "\u901a\u5e38\u30c9\u30ed\u30c3\u30d7\u3067\u843d\u3068\u3059\u30e2\u30f3\u30b9\u30bf\u30fc", summarize(normal));
    pushLine(lines, "\u30ec\u30a2\u30c9\u30ed\u30c3\u30d7\u3067\u843d\u3068\u3059\u30e2\u30f3\u30b9\u30bf\u30fc", summarize(rare));
  }

  function collectMemoLines() {
    const lines = [];
    pushLine(lines, UI.type, pageType);
    pushLine(lines, UI.name, pageName);

    const meta = Array.from(document.querySelectorAll("main .meta span")).map((item) => cleanText(item.textContent));
    pushLine(lines, UI.basic, meta.join(" / "));

    if (pageType === "\u7d20\u6750") {
      getDefinitionLine(lines, "\u4fa1\u683c", findCardByTitle(/\u4fa1\u683c/));
      getSectionText(lines, "\u95a2\u9023\u30ec\u30b7\u30d4", [/\u30ec\u30b7\u30d4/, /\u4f7f\u3044\u9053/]);
      getMaterialDropLines(lines);
    } else if (pageType === "\u30e2\u30f3\u30b9\u30bf\u30fc") {
      getStrongListLines(lines);
    } else if (pageType === "\u88c5\u5099") {
      getSectionText(lines, "\u6027\u80fd", "\u6027\u80fd");
      getSectionText(lines, "\u57fa\u672c\u6027\u80fd", ["\u57fa\u672c\u6027\u80fd", "\u57fa\u790e\u52b9\u679c", "\u30bb\u30c3\u30c8\u52b9\u679c"]);
      getTableLine(lines, "\u5fc5\u8981\u7d20\u6750");
      getSectionText(lines, "\u767d\u5b9d\u7bb1\u30c9\u30ed\u30c3\u30d7\u30e2\u30f3\u30b9\u30bf\u30fc", "\u767d\u5b9d\u7bb1");
    } else if (pageType === "\u30ec\u30b7\u30d4") {
      getTableLine(lines, "\u5fc5\u8981\u7d20\u6750");
      getSectionText(lines, "\u63a8\u5b9a\u539f\u4fa1", /\u539f\u4fa1/);
    } else if (pageType === "\u5b9d\u73e0") {
      getSectionText(lines, "\u52b9\u679c", "\u52b9\u679c");
      getSectionText(lines, "\u5165\u624b\u30e2\u30f3\u30b9\u30bf\u30fc", ["\u5165\u624b", "\u30e2\u30f3\u30b9\u30bf\u30fc"]);
    }

    if (lines.length <= 3) {
      getStrongListLines(lines);
      getSectionText(lines, "\u8a73\u7d30", /./);
    }

    pushLine(lines, UI.url, window.location.href);
    return lines;
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
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify({ version: 1, items }));
  }

  function showToast(message) {
    const toast = document.createElement("p");
    toast.className = "individual-memo-toast";
    toast.textContent = message;
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 1600);
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
    items.unshift({ id, type: pageType, name: pageName, lines: collectMemoLines(), userNote: "", createdAt: now, updatedAt: "" });
    saveMemoItems(items);
    showToast(UI.added);
    renderMemoPanel();
  }

  function makeLink(href, icon, label) {
    const link = document.createElement("a");
    link.href = href;
    link.innerHTML = `<span class="individual-bottom-nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>`;
    return link;
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

  function renderMemoPanel() {
    const list = document.querySelector(".individual-memo-panel-list");
    if (!list) return;
    const items = loadMemoItems().slice(0, 20);
    list.innerHTML = items.length
      ? items
          .map((item) => {
            const lines = Array.isArray(item.lines) ? item.lines.slice(0, 4) : [];
            return `<article class="individual-memo-panel-card"><p>${escapeHtml(cleanText(item.type))}</p><h3>${escapeHtml(cleanText(item.name))}</h3>${lines
              .map((line) => `<span>${escapeHtml(cleanText(line))}</span>`)
              .join("")}</article>`;
          })
          .join("")
      : `<p class="individual-memo-panel-empty">${UI.empty}</p>`;
  }

  function installMemoPanel() {
    if (document.querySelector(".individual-memo-dock-button")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "individual-memo-dock-button";
    button.textContent = UI.openMemo;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "individualMemoPanel");

    const panel = document.createElement("section");
    panel.id = "individualMemoPanel";
    panel.className = "individual-memo-panel";
    panel.hidden = true;
    panel.innerHTML = `<header><h2>\u30e1\u30e2\u5e33</h2><button type="button">${UI.close}</button></header><div class="individual-memo-panel-list"></div>`;
    panel.querySelector("button")?.addEventListener("click", () => {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
    });
    button.addEventListener("click", () => {
      const nextOpen = panel.hidden;
      panel.hidden = !nextOpen;
      button.setAttribute("aria-expanded", String(nextOpen));
      if (nextOpen) renderMemoPanel();
    });
    document.body.append(button, panel);
  }

  function installMemoAddButton() {
    if (!pageType || !pageName || document.querySelector(".individual-memo-add-button")) return;
    const titleCard = document.querySelector("main .card");
    if (!titleCard) return;
    titleCard.classList.add("individual-title-card");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "individual-memo-add-button";
    button.textContent = UI.addMemo;
    button.setAttribute("aria-label", "\u3053\u306e\u30da\u30fc\u30b8\u3092\u30e1\u30e2\u306b\u8ffd\u52a0");
    button.addEventListener("click", addCurrentPageMemo);
    titleCard.append(button);
  }

  function installPageGuide() {
    if (window.DQ10PageGuide?.init) {
      window.DQ10PageGuide.init();
      return;
    }
    if (document.querySelector('script[src="/assets/page-guide.js"]')) return;
    const script = document.createElement("script");
    script.src = "/assets/page-guide.js";
    script.defer = true;
    document.body.appendChild(script);
  }

  function start() {
    installBottomNav();
    installMemoAddButton();
    installMemoPanel();
    installPageGuide();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
