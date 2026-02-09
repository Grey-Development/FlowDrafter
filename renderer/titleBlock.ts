export function renderTitleBlock(
  x: number, y: number, height: number,
  projectName: string,
  sheetTitle: string,
  sheetNumber: string,
  scaleLabel: string,
  date: string,
  totalGPM: number,
  totalZones: number
): string {
  const w = 370;
  const sections: string[] = [];

  sections.push(`<rect x="${x}" y="${y}" width="${w}" height="${height}" fill="#fff" stroke="#000" stroke-width="1.5"/>`);

  let cy = y + 25;
  sections.push(`<rect x="${x}" y="${y}" width="${w}" height="50" fill="#1a1a2e" stroke="#000" stroke-width="1"/>`);
  sections.push(`<text x="${x + w/2}" y="${cy}" font-size="14" text-anchor="middle" fill="#fff" font-weight="bold" font-family="Arial">GREY DEVELOPMENT</text>`);
  sections.push(`<text x="${x + w/2}" y="${cy + 16}" font-size="8" text-anchor="middle" fill="#ccc" font-family="Arial">Lawn Capital Enhancement Division</text>`);

  cy = y + 70;
  sections.push(`<line x1="${x}" y1="${y + 50}" x2="${x + w}" y2="${y + 50}" stroke="#000" stroke-width="1"/>`);
  sections.push(`<text x="${x + 10}" y="${cy}" font-size="7" fill="#666" font-family="Arial">PREPARED BY:</text>`);
  sections.push(`<text x="${x + 10}" y="${cy + 14}" font-size="9" fill="#000" font-weight="bold" font-family="Arial">Grey Development</text>`);
  sections.push(`<text x="${x + 10}" y="${cy + 26}" font-size="7" fill="#333" font-family="Arial">Atlanta, Georgia</text>`);

  cy = y + 120;
  sections.push(`<line x1="${x}" y1="${cy - 5}" x2="${x + w}" y2="${cy - 5}" stroke="#000" stroke-width="1"/>`);
  sections.push(`<text x="${x + 10}" y="${cy + 8}" font-size="7" fill="#666" font-family="Arial">PREPARED FOR:</text>`);
  sections.push(`<text x="${x + 10}" y="${cy + 22}" font-size="9" fill="#000" font-weight="bold" font-family="Arial">${escapeXml(projectName)}</text>`);

  cy = y + 160;
  sections.push(`<line x1="${x}" y1="${cy - 5}" x2="${x + w}" y2="${cy - 5}" stroke="#000" stroke-width="1"/>`);
  sections.push(`<rect x="${x + 10}" y="${cy}" width="${w - 20}" height="24" fill="#f0f0f0" stroke="#000" stroke-width="0.5"/>`);
  sections.push(`<text x="${x + w/2}" y="${cy + 16}" font-size="9" text-anchor="middle" fill="#000" font-weight="bold" font-family="Arial">ISSUED FOR CONSTRUCTION</text>`);

  cy = y + 200;
  sections.push(`<line x1="${x}" y1="${cy - 5}" x2="${x + w}" y2="${cy - 5}" stroke="#000" stroke-width="1"/>`);
  sections.push(`<text x="${x + 10}" y="${cy + 12}" font-size="7" fill="#666" font-family="Arial">SHEET TITLE:</text>`);
  sections.push(`<text x="${x + 10}" y="${cy + 28}" font-size="12" fill="#000" font-weight="bold" font-family="Arial">${escapeXml(sheetTitle)}</text>`);

  cy = y + 245;
  sections.push(`<line x1="${x}" y1="${cy - 5}" x2="${x + w}" y2="${cy - 5}" stroke="#000" stroke-width="1"/>`);

  const fields = [
    { label: 'SHEET NO:', value: sheetNumber },
    { label: 'SCALE:', value: scaleLabel },
    { label: 'DATE:', value: date },
    { label: 'DRAWN BY:', value: 'FlowDrafter AI Engine' },
    { label: 'REVIEWED BY:', value: '' },
  ];

  let fy = cy + 5;
  for (const field of fields) {
    sections.push(`<text x="${x + 10}" y="${fy + 10}" font-size="6" fill="#666" font-family="Arial">${field.label}</text>`);
    sections.push(`<text x="${x + 100}" y="${fy + 10}" font-size="8" fill="#000" font-weight="bold" font-family="Arial">${escapeXml(field.value)}</text>`);
    fy += 18;
  }

  fy += 10;
  sections.push(`<line x1="${x}" y1="${fy}" x2="${x + w}" y2="${fy}" stroke="#000" stroke-width="1"/>`);
  fy += 15;
  sections.push(`<text x="${x + 10}" y="${fy}" font-size="7" fill="#666" font-family="Arial">SYSTEM SUMMARY:</text>`);
  sections.push(`<text x="${x + 10}" y="${fy + 14}" font-size="8" fill="#000" font-family="Arial">Total GPM: ${totalGPM} | Zones: ${totalZones}</text>`);

  // North arrow
  fy += 30;
  const nax = x + w / 2;
  const nay = fy + 20;
  sections.push(`<polygon points="${nax},${nay - 15} ${nax - 6},${nay + 5} ${nax + 6},${nay + 5}" fill="#000"/>`);
  sections.push(`<text x="${nax}" y="${nay + 18}" font-size="10" text-anchor="middle" fill="#000" font-weight="bold" font-family="Arial">N</text>`);

  return sections.join('\n');
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}