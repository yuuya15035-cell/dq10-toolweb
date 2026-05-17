(function () {
  const MEMO_STORAGE_KEY = "dq10_toolweb_memos_v1";
  const body = document.body;
  const pageType = String(body?.dataset?.individualType || "").trim();
  const pageName = String(body?.dataset?.individualName || "").trim();

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

  function addCurrentPageMemo() {
    if (!pageType || !pageName) {
      showToast("メモに追加できませんでした");
      return;
    }
    const items = loadMemoItems();
    const id = `${pageType}:${pageName}`;
    if (items.some((item) => String(item?.id || "") === id)) {
      showToast("既にメモ済みです");
      return;
    }
    const now = new Date().toISOString();
    items.unshift({
      id,
      type: pageType,
      name: pageName,
      lines: [`URL: ${window.location.href}`],
      userNote: "",
      createdAt: now,
      updatedAt: "",
    });
    saveMemoItems(items);
    showToast("メモに追加しました");
  }

  function installBottomNav() {
    if (document.querySelector(".individual-bottom-nav")) return;
    const nav = document.createElement("nav");
    nav.className = "individual-bottom-nav";
    nav.setAttribute("aria-label", "下部ナビゲーション");
    nav.append(
      makeLink("/", "⌂", "ホーム"),
      makeLink("/craft/", "🛠", "職人"),
      makeLink("/bazaar/", "◆", "バザー")
    );
    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.innerHTML = `<span class="individual-bottom-nav-icon" aria-hidden="true">☰</span><span>その他</span>`;
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
    button.textContent = "このページをメモ";
    button.setAttribute("aria-label", "このページをメモに追加");
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
