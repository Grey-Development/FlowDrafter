import { renderBorder } from './border';
import { renderTitleBlock } from './titleBlock';

export function renderDetailSheet(
  sheetNumber: string,
  sheetTitle: string,
  projectName: string,
  scaleLabel: string,
  date: string,
  svgWidth: number,
  svgHeight: number,
  details: Array<{ title: string; description: string[] }>
): string {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
  svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="#fff"/>`;
  svg += renderBorder(svgWidth, svgHeight, scaleLabel, 30);

  const tbX = svgWidth - 394;
  const tbY = 48;
  svg += renderTitleBlock(tbX, tbY, svgHeight - 96, projectName, sheetTitle, sheetNumber, scaleLabel, date, 0, 0);

  const contentX = 60;
  let contentY = 80;
  const colWidth = (tbX - 80) / 2;

  for (let i = 0; i < details.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const dx = contentX + col * (colWidth + 20);
    const dy = 80 + row * 280;

    svg += `<rect x="${dx}" y="${dy}" width="${colWidth}" height="260" fill="#fafafa" stroke="#000" stroke-width="0.8" rx="2"/>`;
    svg += `<rect x="${dx}" y="${dy}" width="${colWidth}" height="24" fill="#e5e5e5" stroke="#000" stroke-width="0.8"/>`;
    svg += `<text x="${dx + colWidth/2}" y="${dy + 16}" font-size="9" text-anchor="middle" fill="#000" font-weight="bold" font-family="Arial">${details[i].title}</text>`;

    let ly = dy + 40;
    for (const line of details[i].description) {
      svg += `<text x="${dx + 10}" y="${ly}" font-size="7" fill="#333" font-family="Arial">${escapeXml(line)}</text>`;
      ly += 14;
    }
  }

  svg += '</svg>';
  return svg;
}

export function generateIR2(projectName: string, scaleLabel: string, date: string, svgWidth: number, svgHeight: number): string {
  const details = [
    { title: 'CONTROL VALVE ASSEMBLY', description: [
      'Install valve in Carson 1419-12 valve box',
      'Set valve box flush with finished grade',
      'Provide 4" gravel sump below valve box',
      'Connect zone valve per manufacturer specs',
      'Install flow control and manual bleed',
    ]},
    { title: 'TUBE BORDER / DRIP EDGE', description: [
      'Install polyethylene tubing along bed edges',
      'Secure with 6" landscape staples at 24" OC',
      'Connect to drip supply line via barb fitting',
      'Flush all lines before installing end caps',
    ]},
    { title: 'SHRUB SPRAY ASSEMBLY', description: [
      'Install Rain Bird 1804-SAM-PRS body',
      'Set nozzle height 2" above grade',
      'Connect via Hunter SJ-506 swing joint',
      'Adjust arc and radius after backfill',
    ]},
    { title: 'PRESSURE REDUCING VALVE', description: [
      'Install PRV at drip zone supply point',
      'Set outlet pressure to 30 PSI',
      'Install 150-mesh filter upstream of PRV',
      'Provide isolation valve for maintenance',
    ]},
    { title: 'MANUAL DRAIN VALVE', description: [
      'Install at low points in mainline',
      'Use 3/4" ball valve in valve box',
      'Provide 12" x 12" gravel sump',
      'Mark location for winter maintenance',
    ]},
    { title: 'QUICK COUPLING VALVE', description: [
      'Install Rain Bird 44RC at designated locations',
      'Set top of valve 1" below finished grade',
      'Provide locking rubber cover',
      'Connect to mainline via tee fitting',
    ]},
    { title: 'WIRE CONNECTION DETAIL', description: [
      'Use waterproof wire connectors only',
      'Strip 3/4" insulation from each wire',
      'Fill connector with dielectric grease',
      'Tuck splice into valve box, not in soil',
    ]},
    { title: 'SLEEVING DETAIL', description: [
      'Install PVC sleeve under all paved surfaces',
      'Sleeve diameter = 2x carrier pipe diameter',
      'Extend sleeve 12" beyond each edge of paving',
      'Cap open ends of unused sleeves',
    ]},
  ];
  return renderDetailSheet('IR-2', 'IRRIGATION DETAILS', projectName, scaleLabel, date, svgWidth, svgHeight, details);
}

export function generateIR3(projectName: string, scaleLabel: string, date: string, svgWidth: number, svgHeight: number): string {
  const details = [
    { title: 'RAIN / FREEZE SENSOR', description: [
      'Install Hunter Rain-Clik on exposed surface',
      'Mount minimum 6\' above grade on building',
      'Wire directly to controller sensor terminals',
      'Set threshold per local water authority requirements',
      'Verify operation before system acceptance',
    ]},
    { title: 'ISOLATION VALVE', description: [
      'Install gate valve at POC downstream of meter',
      'Provide valve box flush with grade',
      'Full-port valve matching mainline size',
      'Accessible for emergency shutoff',
    ]},
    { title: 'WINTERIZATION ASSEMBLY', description: [
      'Install quick-connect air fitting at mainline',
      'Rated for 80 PSI minimum',
      'Located upstream of backflow preventer',
      'Mark clearly for seasonal maintenance',
      'Note: Zone 7b/8a - winterization optional',
    ]},
    { title: 'THRUST BLOCK DETAIL', description: [
      'Install concrete thrust blocks at all:',
      '  - 90-degree elbows (2" and larger)',
      '  - Tee fittings on mainline',
      '  - Dead-end caps',
      'Minimum 2 sq ft bearing area in undisturbed soil',
    ]},
    { title: 'CONTROLLER GROUNDING', description: [
      'Install 8\' copper ground rod at controller',
      'Connect with #6 AWG bare copper wire',
      'Ground rod resistance < 25 ohms',
      'Bond to controller grounding terminal',
    ]},
    { title: 'SURGE PROTECTION', description: [
      'Install surge protector at controller',
      'Lightning rated for zone valve circuits',
      'Replace after any lightning strike event',
      'Test annually with system inspection',
    ]},
    { title: 'LAWN ROTOR ASSEMBLY', description: [
      'Install rotor body per manufacturer instructions',
      'Use Hunter SJ-506 triple swing joint',
      'Set top of head flush with finished grade',
      'Adjust arc, radius, and nozzle after backfill',
      'Verify head-to-head coverage pattern',
    ]},
    { title: 'TRENCHING DETAIL', description: [
      'Mainline trench: 12" wide x 18" deep minimum',
      'Lateral trench: 8" wide x 12" deep minimum',
      'Remove rocks and debris from trench bottom',
      'Backfill in 6" lifts with compaction',
      'Restore surface to match adjacent grade',
    ]},
  ];
  return renderDetailSheet('IR-3', 'IRRIGATION DETAILS', projectName, scaleLabel, date, svgWidth, svgHeight, details);
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}