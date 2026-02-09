import { IrrigationDesign } from '../types';
import { SPRINKLER_HEADS, VALVES, CONTROLLERS, SENSORS } from '../data/materials';

export function renderLegend(design: IrrigationDesign, x: number, y: number): string {
  const items: Array<{ symbol: string; label: string; description: string }> = [];
  const usedTypes = new Set(design.heads.map(h => h.type));
  const usedModels = new Set(design.heads.map(h => h.model));

  for (const spec of SPRINKLER_HEADS) {
    if (usedModels.has(spec.model)) {
      let sym = '';
      const sx = x + 15, sy = y + items.length * 22 + 30;
      if (spec.category === 'rotor') {
        sym = `<circle cx="${sx}" cy="${sy}" r="5" fill="#000" stroke="#000" stroke-width="0.5"/>`;
      } else if (spec.category === 'spray' || spec.category === 'strip') {
        sym = `<circle cx="${sx}" cy="${sy}" r="5" fill="none" stroke="#000" stroke-width="1"/>`;
      } else if (spec.category === 'rotary-nozzle') {
        sym = `<circle cx="${sx}" cy="${sy}" r="5" fill="none" stroke="#000" stroke-width="1"/><circle cx="${sx}" cy="${sy}" r="1.5" fill="#000"/>`;
      } else if (spec.category === 'drip') {
        sym = `<rect x="${sx-5}" y="${sy-4}" width="10" height="8" fill="none" stroke="#000" stroke-width="0.8" stroke-dasharray="2 1"/>`;
      } else if (spec.category === 'quick-coupler') {
        sym = `<polygon points="${sx},${sy-4} ${sx-4},${sy+4} ${sx+4},${sy+4}" fill="#000"/>`;
      }
      items.push({
        symbol: sym,
        label: spec.planLabel,
        description: `${spec.name} - ${spec.manufacturer} ${spec.model}`,
      });
    }
  }

  items.push({
    symbol: `<polygon points="${x+11},${y+items.length*22+26} ${x+15},${y+items.length*22+30} ${x+11},${y+items.length*22+34}" fill="#333" stroke="#000" stroke-width="0.5"/><polygon points="${x+19},${y+items.length*22+26} ${x+15},${y+items.length*22+30} ${x+19},${y+items.length*22+34}" fill="#333" stroke="#000" stroke-width="0.5"/>`,
    label: 'ZV',
    description: 'Zone Valve - Rain Bird PEB Series',
  });

  items.push({
    symbol: `<rect x="${x+5}" y="${y+items.length*22+26}" width="20" height="8" fill="#fff" stroke="#000" stroke-width="0.8"/><text x="${x+15}" y="${y+items.length*22+33}" font-size="5" text-anchor="middle" fill="#000">RPZ</text>`,
    label: 'RPZ',
    description: 'Backflow Preventer - Watts 009M2-QT',
  });

  items.push({
    symbol: `<rect x="${x+7}" y="${y+items.length*22+26}" width="16" height="10" fill="#fff" stroke="#000" stroke-width="0.8"/>`,
    label: 'CTRL',
    description: 'Controller - Rain Bird ESP-LXME2',
  });

  items.push({
    symbol: `<line x1="${x+5}" y1="${y+items.length*22+30}" x2="${x+25}" y2="${y+items.length*22+30}" stroke="#1E3A5F" stroke-width="2.5"/>`,
    label: 'ML',
    description: 'Mainline Pipe - Sch. 40 PVC',
  });

  items.push({
    symbol: `<line x1="${x+5}" y1="${y+items.length*22+30}" x2="${x+25}" y2="${y+items.length*22+30}" stroke="#666" stroke-width="1"/>`,
    label: 'LAT',
    description: 'Lateral Pipe - Class 200 PVC',
  });

  const headerH = 22;
  const totalH = headerH + items.length * 22 + 10;
  const w = 280;

  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${totalH}" fill="#fff" stroke="#000" stroke-width="1"/>`;
  svg += `<rect x="${x}" y="${y}" width="${w}" height="${headerH}" fill="#e5e5e5" stroke="#000" stroke-width="1"/>`;
  svg += `<text x="${x + w/2}" y="${y + 15}" font-size="9" text-anchor="middle" fill="#000" font-weight="bold" font-family="Arial">LEGEND</text>`;

  for (let i = 0; i < items.length; i++) {
    const iy = y + headerH + i * 22;
    svg += items[i].symbol;
    svg += `<text x="${x + 32}" y="${iy + 14}" font-size="7" fill="#000" font-weight="bold" font-family="Arial">${items[i].label}</text>`;
    svg += `<text x="${x + 55}" y="${iy + 14}" font-size="6" fill="#333" font-family="Arial">${items[i].description}</text>`;
  }

  return svg;
}