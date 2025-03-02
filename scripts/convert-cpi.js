const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

const inputFile = path.join(__dirname, '../src/data/cpi_all.csv');
const outputFile = path.join(__dirname, '../src/data/cpi_all.json');

const csvContent = fs.readFileSync(inputFile, 'utf-8');
const records = csv.parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

// 数値の整形（空文字列はそのまま残す）
const formattedRecords = records.map(record => ({
  year: record.year,
  usd: record.usd || '',
  jpy: record.jpy || '',
  gbp: record.gbp || '',
  eur: record.eur || ''
}));

fs.writeFileSync(
  outputFile,
  JSON.stringify(formattedRecords, null, 2),
  'utf-8'
);

console.log('✨ 変換が完了しました'); 