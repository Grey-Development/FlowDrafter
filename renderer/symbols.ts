export function rotorSymbol(x: number, y: number, arc: number, radius: number, color: string): string {
  const r = 6;
  const arcStart = -arc / 2;
  const arcEnd = arc / 2;
  let arcPath = '';
  if (arc < 360) {
    const startAngle = (arcStart * Math.PI) / 180;
    const endAngle = (arcEnd * Math.PI) / 180;
    const x1 = x + radius * 0.3 * Math.cos(startAngle);
    const y1 = y + radius * 0.3 * Math.sin(startAngle);
    const x2 = x + radius * 0.3 * Math.cos(endAngle);
    const y2 = y + radius * 0.3 * Math.sin(endAngle);
    arcPath = `<line x1="${x}" y1="${y}" x2="${x1}" y2="${y1}" stroke="${color}" stroke-width="0.5" opacity="0.6"/>
    <line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="0.5" opacity="0.6"/>`;
  }
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="#000" stroke-width="0.8"/>
  ${arcPath}`;
}

export function spraySymbol(x: number, y: number, arc: number, color: string): string {
  const r = 5;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
}

export function rotaryNozzleSymbol(x: number, y: number, color: string): string {
  const r = 5;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="1.5"/>
  <circle cx="${x}" cy="${y}" r="1.5" fill="${color}"/>`;
}

export function dripSymbol(x: number, y: number, width: number, height: number, color: string): string {
  return `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="4 2"/>
  <pattern id="drip-${x}-${y}" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="0.8" fill="${color}" opacity="0.4"/>
  </pattern>
  <rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" fill="url(#drip-${x}-${y})"/>`;
}

export function quickCouplerSymbol(x: number, y: number): string {
  const h = 8;
  const w = 7;
  return `<polygon points="${x},${y - h/2} ${x - w/2},${y + h/2} ${x + w/2},${y + h/2}" fill="#000" stroke="#000" stroke-width="0.5"/>`;
}

export function zoneValveSymbol(x: number, y: number, color: string): string {
  const w = 8, h = 6;
  return `<polygon points="${x - w/2},${y - h/2} ${x},${y} ${x - w/2},${y + h/2}" fill="${color}" stroke="#000" stroke-width="0.8"/>
  <polygon points="${x + w/2},${y - h/2} ${x},${y} ${x + w/2},${y + h/2}" fill="${color}" stroke="#000" stroke-width="0.8"/>`;
}

export function masterValveSymbol(x: number, y: number): string {
  const base = zoneValveSymbol(x, y, '#333');
  return `${base}
  <text x="${x}" y="${y + 1}" font-size="5" text-anchor="middle" fill="white" font-weight="bold">M</text>`;
}

export function rpzSymbol(x: number, y: number): string {
  return `<rect x="${x - 12}" y="${y - 6}" width="24" height="12" fill="#fff" stroke="#000" stroke-width="1"/>
  <text x="${x}" y="${y + 2}" font-size="6" text-anchor="middle" fill="#000" font-weight="bold">RPZ</text>`;
}

export function controllerSymbol(x: number, y: number): string {
  return `<rect x="${x - 10}" y="${y - 8}" width="20" height="16" fill="#fff" stroke="#000" stroke-width="1"/>
  <line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y - 12}" stroke="#000" stroke-width="1.5"/>
  <line x1="${x - 3}" y1="${y - 11}" x2="${x + 3}" y2="${y - 11}" stroke="#000" stroke-width="1"/>
  <text x="${x}" y="${y + 2}" font-size="4" text-anchor="middle" fill="#000">CTRL</text>`;
}

export function pocSymbol(x: number, y: number): string {
  const r = 7;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#000" stroke-width="1.5"/>
  <line x1="${x - 4}" y1="${y - 4}" x2="${x + 4}" y2="${y + 4}" stroke="#000" stroke-width="1"/>
  <line x1="${x + 4}" y1="${y - 4}" x2="${x - 4}" y2="${y + 4}" stroke="#000" stroke-width="1"/>`;
}

export function rainSensorSymbol(x: number, y: number): string {
  return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 10}" stroke="#000" stroke-width="1"/>
  <line x1="${x - 3}" y1="${y - 8}" x2="${x + 3}" y2="${y - 8}" stroke="#000" stroke-width="1"/>
  <line x1="${x - 2}" y1="${y - 6}" x2="${x + 2}" y2="${y - 6}" stroke="#000" stroke-width="0.8"/>
  <circle cx="${x}" cy="${y - 10}" r="1.5" fill="#000"/>`;
}

export function valveBoxSymbol(x: number, y: number): string {
  return `<rect x="${x - 5}" y="${y - 4}" width="10" height="8" fill="#ccc" stroke="#000" stroke-width="0.5"/>`;
}

export function coverageCircle(x: number, y: number, radiusPx: number, color: string): string {
  return `<circle cx="${x}" cy="${y}" r="${radiusPx}" fill="none" stroke="${color}" stroke-width="0.5" stroke-dasharray="3 2" opacity="0.15"/>`;
}

export function headSymbol(x: number, y: number, type: string, arc: number, radius: number, color: string): string {
  switch (type) {
    case 'rotor': return rotorSymbol(x, y, arc, radius, color);
    case 'spray': return spraySymbol(x, y, arc, color);
    case 'rotary-nozzle': return rotaryNozzleSymbol(x, y, color);
    case 'strip': return spraySymbol(x, y, arc, color);
    case 'drip': return dripSymbol(x, y, 20, 20, color);
    case 'quick-coupler': return quickCouplerSymbol(x, y);
    default: return rotorSymbol(x, y, arc, radius, color);
  }
}