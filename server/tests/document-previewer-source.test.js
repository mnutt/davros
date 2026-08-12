/* eslint-env node */

describe('document previewer source', function () {
  it('selects every visible workbook sheet', async function () {
    const { visibleWorksheetEntries } = await import(
      '../../document-previewer/src/xlsx-workbook.js'
    );
    const first = { rows: [] };
    const third = { rows: [] };
    const entries = visibleWorksheetEntries({
      workbook: {
        sheets: [
          { name: 'First' },
          { name: 'Hidden', visibility: 'hidden' },
          { name: 'Third' },
        ],
      },
      worksheets: { First: first, Hidden: { rows: [] }, Third: third },
    });

    expect(entries).toEqual([
      { sheet: { name: 'First' }, worksheet: first },
      { sheet: { name: 'Third' }, worksheet: third },
    ]);
  });

  it('reports row and column truncation', async function () {
    const { worksheetPreviewWindow } = await import(
      '../../document-previewer/src/xlsx-workbook.js'
    );
    const rows = Array.from({ length: 201 }, (_value, index) => ({
      index: index + 1,
      cells: index === 0 ? [{ col: 41 }] : [],
    }));
    const preview = worksheetPreviewWindow({ rows });

    expect(preview.rows).toHaveLength(200);
    expect(preview.columnCount).toBe(40);
    expect(preview.truncated).toBe(true);
  });

  it('does not retain an unused object URL for document bytes', async function () {
    const { loadDocument } = await import('../../document-previewer/src/document-source.js');
    const loaded = await loadDocument({
      id: 'document-1',
      fileName: 'report.docx',
      source: { kind: 'bytes', bytes: new ArrayBuffer(8) },
    });

    expect(loaded).not.toHaveProperty('objectUrl');
  });
});
