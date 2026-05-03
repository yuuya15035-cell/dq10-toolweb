(function () {
  const root = document.documentElement;
  const entryTitle = String(root.dataset.entryTitle || document.title || "").trim();
  const entryDescription = String(root.dataset.entryDescription || "").trim();
  const entryLoading = String(root.dataset.entryLoading || "ページを読み込み中です…").trim();
  const entryLoadFailed = String(root.dataset.entryLoadFailed || "ページを読み込めませんでした。下のリンクをお試しください。").trim();
  const fallbackLabel = String(root.dataset.entryFallbackLabel || "トップページを開く").trim();
  const currentCanonical = `${window.location.origin}${window.location.pathname}`;
  const fallbackLink = String(root.dataset.entryFallback || "../").trim();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  function upsertMetaTag(html, pattern, replacement, insertAfterHead = false) {
    if (pattern.test(html)) {
      return html.replace(pattern, replacement);
    }
    if (insertAfterHead) {
      return html.replace(/<head([^>]*)>/i, `<head$1>\n    ${replacement}`);
    }
    return html;
  }

  const status = document.getElementById("entryPageStatus");
  if (status) {
    status.textContent = entryLoading;
  }

  const fallback = document.getElementById("entryPageFallbackLink");
  if (fallback) {
    fallback.setAttribute("href", fallbackLink);
    fallback.textContent = fallbackLabel;
  }

  fetch("../index.html", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load index.html: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      let nextHtml = html.replace(/<head([^>]*)>/i, '<head$1>\n    <base href="../">');
      if (entryTitle) {
        nextHtml = nextHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(entryTitle)}</title>`);
      }
      if (entryDescription) {
        nextHtml = upsertMetaTag(
          nextHtml,
          /<meta\s+name=["']description["'][^>]*>/i,
          `<meta name="description" content="${escapeHtml(entryDescription)}">`,
          true
        );
      }
      nextHtml = upsertMetaTag(
        nextHtml,
        /<link\s+rel=["']canonical["'][^>]*>/i,
        `<link rel="canonical" href="${escapeHtml(currentCanonical)}">`,
        true
      );

      document.open();
      document.write(nextHtml);
      document.close();
    })
    .catch((error) => {
      console.error("Failed to load entry page shell", error);
      if (status) {
        status.textContent = entryLoadFailed;
      }
      if (fallback) {
        fallback.hidden = false;
        fallback.setAttribute("href", fallbackLink);
        fallback.textContent = fallbackLabel;
      }
    });
}());
