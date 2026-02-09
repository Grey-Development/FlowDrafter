export function renderBorder(svgWidth: number, svgHeight: number, scaleLabel: string, feetPerInch: number): string {
  const m = 24;
  const m2 = 28;
  let svg = '';
  svg += `<rect x="${m}" y="${m}" width="${svgWidth - 2*m}" height="${svgHeight - 2*m}" fill="none" stroke="#000" stroke-width="2"/>`;
  svg += `<rect x="${m2}" y="${m2}" width="${svgWidth - 2*m2}" height="${svgHeight - 2*m2}" fill="none" stroke="#000" stroke-width="0.5"/>`;

  const sbX = m + 20;
  const sbY = svgHeight - m - 30;
  const segLen = 96;
  const segs = 4;

  svg += `<text x="${sbX}" y="${sbY - 8}" font-size="7" fill="#000" font-family="Arial">GRAPHIC SCALE: ${scaleLabel}</text>`;

  for (let i = 0; i < segs; i++) {
    const sx = sbX + i * segLen;
    const fill = i % 2 === 0 ? '#000' : '#fff';
    svg += `<rect x="${sx}" y="${sbY}" width="${segLen}" height="6" fill="${fill}" stroke="#000" stroke-width="0.5"/>`;
    svg += `<text x="${sx}" y="${sbY + 16}" font-size="6" text-anchor="middle" fill="#000" font-family="Arial">${i * feetPerInch}'</text>`;
  }
  svg += `<text x="${sbX + segs * segLen}" y="${sbY + 16}" font-size="6" text-anchor="middle" fill="#000" font-family="Arial">${segs * feetPerInch}'</text>`;

  return svg;
}