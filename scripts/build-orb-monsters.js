#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT_DIR = path.join(__dirname, '..');
const MONSTER_CSV_PATH = path.join(ROOT_DIR, 'data', 'monster_data.csv');
const ORB_CSV_PATH = path.join(ROOT_DIR, 'data', 'orb_data.csv');
const OUTPUT_MATCHED_PATH = path.join(ROOT_DIR, 'data', 'orb_monsters.csv');
const OUTPUT_UNMATCHED_PATH = path.join(ROOT_DIR, 'data', 'orb_monsters_unmatched.csv');

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const normalized = text.replace(/^\uFEFF/, '');
  const lines = normalized.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((header) => String(header || '').trim());

  return lines.slice(1).map((line) => {
    const row = parseCsvLine(line);
    const record = {};

    headers.forEach((header, index) => {
      record[header] = String(row[index] || '').trim();
    });

    return record;
  });
}

function escapeCsvValue(value) {
  const text = String(value ?? '');
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(headers, rows) {
  const headerLine = headers.map((header) => escapeCsvValue(header)).join(',');
  const bodyLines = rows.map((row) => (
    headers.map((header) => escapeCsvValue(row[header] ?? '')).join(',')
  ));

  return `${[headerLine, ...bodyLines].join('\n')}\n`;
}

function buildMonsterNameIndex(monsterRows) {
  const byFirstChar = new Map();

  monsterRows
    .map((row) => String(row.monster_name || '').trim())
    .filter((name) => name.length > 0)
    .sort((a, b) => b.length - a.length)
    .forEach((name) => {
      const firstChar = name[0];
      if (!byFirstChar.has(firstChar)) {
        byFirstChar.set(firstChar, []);
      }
      byFirstChar.get(firstChar).push(name);
    });

  return byFirstChar;
}

function splitMonsterNames(rawText, nameIndex) {
  let remaining = String(rawText || '').trim();
  const resolvedNames = [];

  while (remaining.length > 0) {
    const candidates = nameIndex.get(remaining[0]) || [];
    const matched = candidates.find((name) => remaining.startsWith(name));

    if (!matched) {
      return {
        ok: false,
        resolvedNames,
        remainingText: remaining,
      };
    }

    resolvedNames.push(matched);
    remaining = remaining.slice(matched.length);
  }

  return {
    ok: true,
    resolvedNames,
    remainingText: '',
  };
}

async function main() {
  const [monsterText, orbText] = await Promise.all([
    fs.readFile(MONSTER_CSV_PATH, 'utf8'),
    fs.readFile(ORB_CSV_PATH, 'utf8'),
  ]);

  const monsterRows = parseCsv(monsterText);
  const orbRows = parseCsv(orbText);
  const monsterNameIndex = buildMonsterNameIndex(monsterRows);

  const matchedRows = [];
  const unmatchedRows = [];

  orbRows.forEach((orbRow) => {
    const orbId = String(orbRow.orb_id || '').trim();
    const orbName = String(orbRow.orb_name || '').trim();
    const effect = String(orbRow.effect || '').trim();
    const raw = String(orbRow.monster_names_raw || '').trim();

    const result = splitMonsterNames(raw, monsterNameIndex);

    if (!result.ok) {
      unmatchedRows.push({
        orb_id: orbId,
        orb_name: orbName,
        effect,
        monster_names_raw: raw,
        remaining_text: result.remainingText,
        error_note: 'monster_data.csv に存在しない名称で分解が停止しました',
      });
      return;
    }

    result.resolvedNames.forEach((monsterName) => {
      matchedRows.push({
        orb_id: orbId,
        orb_name: orbName,
        effect,
        monster_name: monsterName,
      });
    });
  });

  await Promise.all([
    fs.writeFile(
      OUTPUT_MATCHED_PATH,
      toCsv(['orb_id', 'orb_name', 'effect', 'monster_name'], matchedRows),
      'utf8'
    ),
    fs.writeFile(
      OUTPUT_UNMATCHED_PATH,
      toCsv(
        ['orb_id', 'orb_name', 'effect', 'monster_names_raw', 'remaining_text', 'error_note'],
        unmatchedRows
      ),
      'utf8'
    ),
  ]);

  console.log(`正常件数: ${matchedRows.length} 行`);
  console.log(`未分解件数: ${unmatchedRows.length} 件`);
  console.log(`出力: ${path.relative(ROOT_DIR, OUTPUT_MATCHED_PATH)}`);
  console.log(`出力: ${path.relative(ROOT_DIR, OUTPUT_UNMATCHED_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
