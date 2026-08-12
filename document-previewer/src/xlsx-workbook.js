export const XLSX_PREVIEW_MAX_ROWS = 200;
export const XLSX_PREVIEW_MAX_COLUMNS = 40;

export function visibleWorksheetEntries(parsed) {
  return parsed.workbook.sheets
    .filter((sheet) => !sheet.visibility)
    .map((sheet) => ({
      sheet,
      worksheet: parsed.worksheets[sheet.name],
    }));
}

export function worksheetPreviewWindow(worksheet) {
  const rows = worksheet.rows.slice(0, XLSX_PREVIEW_MAX_ROWS);
  const maxColumnInWindow = Math.max(
    1,
    ...rows.flatMap((row) => row.cells.map((cell) => cell.col))
  );
  const columnCount = Math.min(XLSX_PREVIEW_MAX_COLUMNS, maxColumnInWindow);
  const truncated =
    worksheet.rows.length > rows.length ||
    worksheet.rows.some((row) => row.cells.some((cell) => cell.col > columnCount));

  return { rows, columnCount, truncated };
}
