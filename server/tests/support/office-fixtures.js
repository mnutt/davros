const archiver = require('archiver');

const namespaces = {
  w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  s: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  p: 'http://schemas.openxmlformats.org/presentationml/2006/main',
  a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
};

async function officeFixture(kind, text = 'Selectable preview text', { spreadsheetPrefix, wideSheet = false } = {}) {
  const files = {};
  const types = [];
  const part = (name, type, xml) => {
    files[name] = xml;
    types.push(
      `<Override PartName="/${name}" ContentType="application/vnd.openxmlformats-officedocument.${type}+xml"/>`,
    );
  };
  const relationships = (entries) =>
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${entries.map(([id, type, target]) => `<Relationship Id="${id}" Type="${namespaces.r}/${type}" Target="${target}"/>`).join('')}</Relationships>`;
  let main;
  if (kind === 'docx') {
    main = 'word/document.xml';
    part(
      main,
      'wordprocessingml.document.main',
      `<w:document xmlns:w="${namespaces.w}"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p><w:p><w:r><w:br w:type="page"/><w:t>Second page</w:t></w:r></w:p><w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`,
    );
  } else if (kind === 'xlsx') {
    main = 'xl/workbook.xml';
    part(
      main,
      'spreadsheetml.sheet.main',
      `<workbook xmlns="${namespaces.s}" xmlns:r="${namespaces.r}"><sheets><sheet name="First" sheetId="1" r:id="rId1"/><sheet name="Hidden" state="hidden" sheetId="2" r:id="rId2"/><sheet name="Last" sheetId="3" r:id="rId3"/></sheets></workbook>`,
    );
    files['xl/_rels/workbook.xml.rels'] = relationships([
      ...[1, 2, 3].map((i) => [`rId${i}`, 'worksheet', `worksheets/sheet${i}.xml`]),
      ['rId4', 'styles', 'styles.xml'],
      ['rId5', 'sharedStrings', 'sharedStrings.xml'],
    ]);
    part(
      'xl/sharedStrings.xml',
      'spreadsheetml.sharedStrings',
      `<sst xmlns="${namespaces.s}" count="3" uniqueCount="1"><si><t>Shared namespace value</t></si></sst>`,
    );
    part(
      'xl/styles.xml',
      'spreadsheetml.styles',
      `<styleSheet xmlns="${namespaces.s}"><numFmts count="2"><numFmt numFmtId="164" formatCode="0.0%"/><numFmt numFmtId="165" formatCode="$#,##0.00"/></numFmts><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`,
    );
    for (const i of [1, 2, 3]) {
      const rows = Array.from(
        { length: i === 1 ? 205 : 1 },
        (_, row) =>
          `<row r="${row + 1}"><c r="A${row + 1}" t="inlineStr"><is><t>${text} ${row + 1}</t></is></c><c r="B${row + 1}" s="1"><v>0.125</v></c><c r="C${row + 1}" s="2"><v>12.5</v></c>${row === 0 ? '<c r="D1" t="s"><v>0</v></c>' : ''}</row>`,
      ).join('');
      part(
        `xl/worksheets/sheet${i}.xml`,
        'spreadsheetml.worksheet',
        `<worksheet xmlns="${namespaces.s}">${wideSheet ? '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><cols><col min="1" max="4" width="80" customWidth="1"/></cols>' : ''}<sheetData>${rows}</sheetData>${wideSheet ? '<pageSetup fitToWidth="1" fitToHeight="1"/>' : ''}</worksheet>`,
      );
    }
  } else {
    main = 'ppt/presentation.xml';
    part(
      main,
      'presentationml.presentation.main',
      `<p:presentation xmlns:p="${namespaces.p}" xmlns:r="${namespaces.r}"><p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst><p:sldSz cx="9144000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`,
    );
    files['ppt/_rels/presentation.xml.rels'] = relationships([
      ['rId1', 'slide', 'slides/slide1.xml'],
    ]);
    part(
      'ppt/slides/slide1.xml',
      'presentationml.slide',
      `<p:sld xmlns:p="${namespaces.p}" xmlns:a="${namespaces.a}" xmlns:r="${namespaces.r}"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:sp><p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm rot="600000"><a:off x="914400" y="914400"/><a:ext cx="7315200" cy="1828800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="2400"/><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`,
    );
  }
  files['_rels/.rels'] = relationships([['rId1', 'officeDocument', main]]);
  files['[Content_Types].xml'] =
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${types.join('')}</Types>`;
  const archive = archiver('zip');
  const chunks = [];
  const complete = new Promise((resolve, reject) => {
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('error', reject);
    archive.on('end', () => resolve(Buffer.concat(chunks)));
  });
  for (const [name, content] of Object.entries(files)) {
    let xml = content;
    if (spreadsheetPrefix && xml.includes(`xmlns="${namespaces.s}"`)) {
      xml = xml.replace(`xmlns="${namespaces.s}"`, `xmlns:${spreadsheetPrefix}="${namespaces.s}"`)
        .replace(/(<\/?)([A-Za-z][\w]*)(?=[\s/>])/g, `$1${spreadsheetPrefix}:$2`);
      // Rebinding the same prefix to an unrelated namespace must not create a sheet.
      xml = xml.replace(`<${spreadsheetPrefix}:sheets>`, `<${spreadsheetPrefix}:sheets><${spreadsheetPrefix}:sheet xmlns:${spreadsheetPrefix}="urn:davros:foreign" name="Foreign" sheetId="99" r:id="missing"/>`);
      // A second, locally scoped alias must work within the first prefix's scope.
      xml = xml.replace(`<${spreadsheetPrefix}:c r="D1" t="s"><${spreadsheetPrefix}:v>0</${spreadsheetPrefix}:v></${spreadsheetPrefix}:c>`, `<local:c xmlns:local="${namespaces.s}" r="D1" t="s"><local:v>0</local:v></local:c>`);
    }
    archive.append(xml, { name });
  }
  await archive.finalize();
  return complete;
}

module.exports = { officeFixture };
