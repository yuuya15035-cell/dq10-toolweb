#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');

const LAST_UPDATED_PATH = path.join(__dirname, '..', 'data', 'last-updated.json');

function formatJstNow() {
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}

async function main() {
  const content = await fs.readFile(LAST_UPDATED_PATH, 'utf8');
  const data = JSON.parse(content);

  data.bazaarCsvUpdatedAt = formatJstNow();

  await fs.writeFile(
    LAST_UPDATED_PATH,
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8'
  );

  console.log(`Updated bazaarCsvUpdatedAt: ${data.bazaarCsvUpdatedAt}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
