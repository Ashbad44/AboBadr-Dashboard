'use client';

import * as XLSX from 'xlsx';

// sheets: [{ name: 'sheet name', rows: [{...}, {...}] }]
// Each row is a plain object; keys become column headers.
export function exportToExcel(filename, sheets) {
  const wb = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    const ws = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31)); // Excel sheet-name limit
  });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
