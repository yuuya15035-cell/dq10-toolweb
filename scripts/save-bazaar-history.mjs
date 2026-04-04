#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_BAZAAR_CSV_PATH = "data/bazaar_prices.csv";
const DEFAULT_HISTORY_CSV_PATH = "data/bazaar_prices_history.csv";

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function parseNullableNumber(value) {
  const normalized = String(value ?? "").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDateToIso(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  const parsed = new Date(normalized.replace(/-/g, "/"));
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function formatDateAsIsoText(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseArgs(argv) {
  const options = {
    bazaarPath: DEFAULT_BAZAAR_CSV_PATH,
    historyPath: DEFAULT_HISTORY_CSV_PATH,
    date: formatDateAsIsoText(new Date()),
    mode: "skip",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--date") {
      options.date = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--bazaar") {
      options.bazaarPath = argv[i + 1] || DEFAULT_BAZAAR_CSV_PATH;
      i += 1;
      continue;
    }
    if (arg === "--history") {
      options.historyPath = argv[i + 1] || DEFAULT_HISTORY_CSV_PATH;
      i += 1;
      continue;
    }
    if (arg === "--mode") {
      const mode = argv[i + 1] || "skip";
      options.mode = mode === "overwrite" ? "overwrite" : "skip";
      i += 1;
      continue;
    }
  }

  const normalizedDate = parseDateToIso(options.date);
  if (!normalizedDate) {
    throw new Error(`不正な日付です: ${options.date}`);
  }
  options.date = normalizedDate;
  return options;
}

function parseBazaarRows(lines, snapshotDate) {
  const headers = parseCsvLine(lines[0]).map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  const materialNameIndex = headers.indexOf("materialName");
  const todayPriceIndex = headers.indexOf("today_price");
  const shopPriceIndex = headers.indexOf("shop_price");
  const listingCountIndex = headers.indexOf("listing_count");

  if (materialNameIndex < 0 || todayPriceIndex < 0) {
    throw new Error("bazaar_prices.csv の必須ヘッダーが不足しています（materialName,today_price）");
  }

  return lines
    .slice(1)
    .map((line) => parseCsvLine(line))
    .map((row) => {
      const materialName = String(row[materialNameIndex] || "").trim();
      const todayPrice = parseNullableNumber(row[todayPriceIndex]);
      const shopPrice = shopPriceIndex >= 0 ? parseNullableNumber(row[shopPriceIndex]) : null;
      const listingCount = listingCountIndex >= 0 ? parseNullableNumber(row[listingCountIndex]) : null;
      if (!materialName) return null;
      if (Number.isFinite(todayPrice)) {
        return {
          date: snapshotDate,
          materialName,
          price: Math.round(todayPrice),
          listingCount: Number.isFinite(listingCount) ? Math.round(listingCount) : "",
          source: "today_price",
        };
      }
      if (Number.isFinite(shopPrice)) {
        return {
          date: snapshotDate,
          materialName,
          price: Math.round(shopPrice),
          listingCount: Number.isFinite(listingCount) ? Math.round(listingCount) : "",
          source: "shop_price",
        };
      }
      return null;
    })
    .filter(Boolean);
}

function mergeHistoryLines(historyLines, snapshotRows, mode) {
  const header = "date,material_name,price,listing_count,source";
  const output = historyLines.length > 0 ? [...historyLines] : [header];
  const bodyLines = output.slice(1);
  const existingByKey = new Map();

  bodyLines.forEach((line, index) => {
    const cols = parseCsvLine(line);
    const key = `${parseDateToIso(cols[0])}::${String(cols[1] || "").trim()}`;
    if (key !== "::") {
      existingByKey.set(key, index + 1);
    }
  });

  const stats = {
    appendedCount: 0,
    skippedDuplicateCount: 0,
    overwrittenCount: 0,
  };

  snapshotRows.forEach((row) => {
    const key = `${row.date}::${row.materialName}`;
    const line = [
      escapeCsvValue(row.date),
      escapeCsvValue(row.materialName),
      escapeCsvValue(row.price),
      escapeCsvValue(row.listingCount),
      escapeCsvValue(row.source || "manual"),
    ].join(",");

    if (existingByKey.has(key)) {
      if (mode === "overwrite") {
        const replaceIndex = existingByKey.get(key);
        output[replaceIndex] = line;
        stats.overwrittenCount += 1;
      } else {
        stats.skippedDuplicateCount += 1;
      }
      return;
    }

    output.push(line);
    existingByKey.set(key, output.length - 1);
    stats.appendedCount += 1;
  });

  return { lines: output, stats };
}

async function main() {
  const options = parseArgs(process.argv);
  const bazaarPath = path.resolve(options.bazaarPath);
  const historyPath = path.resolve(options.historyPath);

  const bazaarText = await fs.readFile(bazaarPath, "utf8");
  const historyText = await fs.readFile(historyPath, "utf8");

  const bazaarLines = bazaarText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  const historyLines = historyText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (bazaarLines.length <= 1) {
    throw new Error("bazaar_prices.csv に有効なデータ行がありません");
  }

  const snapshotRows = parseBazaarRows(bazaarLines, options.date);
  const { lines, stats } = mergeHistoryLines(historyLines, snapshotRows, options.mode);

  await fs.writeFile(historyPath, `${lines.join("\n")}\n`, "utf8");

  console.log(
    `[save-bazaar-history] done: date=${options.date}, appended=${stats.appendedCount}, skippedDuplicate=${stats.skippedDuplicateCount}, overwritten=${stats.overwrittenCount}, totalSnapshotRows=${snapshotRows.length}`
  );
}

main().catch((error) => {
  console.error(`[save-bazaar-history] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
