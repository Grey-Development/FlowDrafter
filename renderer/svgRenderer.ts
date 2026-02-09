import { IrrigationDesign, ProjectInput, SiteAnalysis, PlanSheet } from '../types';
import { calculateScale, feetToSvgUnits, getDrawingOrigin, getTitleBlockOrigin } from '../utils/scaling';
import { headSymbol, coverageCircle, zoneValveSymbol, masterValveSymbol, rpzSymbol, controllerSymbol, pocSymbol, rainSensorSymbol, valveBoxSymbol } from './symbols';
import { renderTitleBlock } from './titleBlock';
import { renderLegend } from './legend';
import { renderBorder } from './border';
import { GENERAL_NOTES } from '../data/generalNotes';
import { MAINLINE_COLOR } from '../data/zoneColors';
import { generateIR2, generateIR3 } from './detailSheets';

export function renderAllSheets(
  design: IrrigationDesign,
  siteAnalysis: SiteAnalysis,
  projectInput: ProjectInput,
  droneImageDataUrl: string
): PlanSheet[] {
  const scaleConfig = calculateScale(siteAnalysis.propertyWidthFt, siteAnalysis.propertyLengthFt);
  const { svgWidth, svgHeight, pixelsPerFoot, label: scaleLabel, feetPerInch } = scaleConfig;
  const origin = getDrawingOrigin();
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const dateStr = `Rev 1 - ${today}`;

  const ir1Svg = renderIR1(design, siteAnalysis, projectInput, droneImageDataUrl, svgWidth, svgHeight, pixelsPerFoot, origin, scaleLabel, feetPerInch, dateStr);
  const ir2Svg = generateIR2(projectInput.projectName, scaleLabel, dateStr, svgWidth, svgHeight);
  const ir3Svg = generateIR3(projectInput.projectName, scaleLabel, dateStr, svgWidth, svgHeight);

  return [
    { sheetNumber: 'IR-1', title: 'Irrigation Plan', svgContent: ir1Svg, pageType: 'plan' },
    { sheetNumber: 'IR-2', title: 'Irrigation Details', svgContent: ir2Svg, pageType: 'details' },
    { sheetNumber: 'IR-3', title: 'Irrigation Details', svgContent: ir3Svg, pageType: 'details' },
  ];
}

function renderIR1(
  design: IrrigationDesign,
  siteAnalysis: SiteAnalysis,
  projectInput: ProjectInput,
  droneImageDataUrl: string,
  svgWidth: number, svgHeight: number,
  pixelsPerFoot: number,
  origin: { x: number; y: number },
  scaleLabel: string,
  feetPerInch: number,
  dateStr: string
): string {
  const layers: string[] = [];

  layers.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`);
  layers.push(`<rect width="${svgWidth}" height="${svgHeight}" fill="#fff"/>`);

  // Layer 1: Border
  layers.push(renderBorder(svgWidth, svgHeight, scaleLabel, feetPerInch));

  // Layer 2: Drone image background
  const drawW = (svgWidth - 48 - 370 - 20);
  const drawH = svgHeight - 96;
  if (droneImageDataUrl) {
    layers.push(`<image href="${droneImageDataUrl}" x="${origin.x}" y="${origin.y}" width="${drawW}" height="${drawH}" opacity="0.3" preserveAspectRatio="xMidYMid slice"/>`);
  }

  const toX = (ft: number) => origin.x + feetToSvgUnits(ft, pixelsPerFoot);
  const toY = (ft: number) => origin.y + feetToSvgUnits(ft, pixelsPerFoot);
  const toLen = (ft: number) => feetToSvgUnits(ft, pixelsPerFoot);

  // Layer 3: Pipes
  for (const pipe of design.pipes) {
    const color = pipe.type === 'mainline' ? MAINLINE_COLOR : pipe.type === 'drip-supply' ? '#92400E' : '#666';
    const weight = pipe.type === 'mainline' ? 2.5 : 1;
    const dash = pipe.type === 'drip-supply' ? ' stroke-dasharray="6 3"' : '';
    layers.push(`<line x1="${toX(pipe.startX)}" y1="${toY(pipe.startY)}" x2="${toX(pipe.endX)}" y2="${toY(pipe.endY)}" stroke="${color}" stroke-width="${weight}"${dash}/>`);
  }

  // Layer 4: Coverage circles
  for (const head of design.heads) {
    if (head.radiusFt > 0) {
      const zone = design.zones.find(z => z.id === head.zoneId);
      const color = zone?.color || '#999';
      layers.push(coverageCircle(toX(head.x), toY(head.y), toLen(head.radiusFt), color));
    }
  }

  // Layer 5: Head symbols
  for (const head of design.heads) {
    const zone = design.zones.find(z => z.id === head.zoneId);
    const color = zone?.color || '#000';
    layers.push(headSymbol(toX(head.x), toY(head.y), head.type, head.arc, toLen(head.radiusFt), color));
  }

  // Layer 6: Valves, controller, RPZ, POC
  for (const valve of design.valves) {
    if (valve.type === 'master') {
      layers.push(masterValveSymbol(toX(valve.x), toY(valve.y)));
    } else {
      const zone = design.zones.find(z => z.id === valve.zoneId);
      layers.push(zoneValveSymbol(toX(valve.x), toY(valve.y), zone?.color || '#333'));
      layers.push(valveBoxSymbol(toX(valve.x), toY(valve.y) + 10));
    }
  }

  layers.push(pocSymbol(toX(design.poc.x), toY(design.poc.y)));
  layers.push(rpzSymbol(toX(design.backflow.x), toY(design.backflow.y)));
  layers.push(controllerSymbol(toX(design.controller.x), toY(design.controller.y)));
  layers.push(rainSensorSymbol(toX(design.rainSensor.x), toY(design.rainSensor.y)));

  // Layer 7: Zone schedule table
  const zsX = origin.x;
  const zsY = svgHeight - 200;
  layers.push(renderZoneSchedule(design, zsX, zsY));

  // Layer 8: General notes
  const gnX = origin.x + 350;
  const gnY = svgHeight - 200;
  layers.push(renderGeneralNotes(gnX, gnY));

  // Layer 9: Legend
  const tbOrigin = getTitleBlockOrigin(svgWidth);
  const lgX = tbOrigin.x - 290;
  const lgY = svgHeight - 380;
  layers.push(renderLegend(design, lgX, lgY));

  // Layer 10: Title block
  layers.push(renderTitleBlock(
    tbOrigin.x, tbOrigin.y, svgHeight - 96,
    projectInput.projectName, 'IRRIGATION PLAN', 'IR-1',
    scaleLabel, dateStr, design.totalSystemGPM, design.totalZones
  ));

  layers.push('</svg>');
  return layers.join('\n');
}

function renderZoneSchedule(design: IrrigationDesign, x: number, y: number): string {
  const colWidths = [40, 60, 40, 50, 60, 50];
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const rowH = 16;
  const headers = ['Zone', 'Head Type', 'Heads', 'GPM', 'Precip Rate', 'Runtime'];
  let svg = '';

  svg += `<rect x="${x}" y="${y}" width="${totalW}" height="${rowH}" fill="#e5e5e5" stroke="#000" stroke-width="0.5"/>`;
  svg += `<text x="${x + totalW/2}" y="${y - 4}" font-size="8" text-anchor="middle" fill="#000" font-weight="bold" font-family="Arial">ZONE SCHEDULE</text>`;

  let cx = x;
  for (let i = 0; i < headers.length; i++) {
    svg += `<text x="${cx + colWidths[i]/2}" y="${y + 11}" font-size="6" text-anchor="middle" fill="#000" font-weight="bold" font-family="Arial">${headers[i]}</text>`;
    cx += colWidths[i];
  }

  for (let zi = 0; zi < design.zones.length; zi++) {
    const z = design.zones[zi];
    const ry = y + rowH + zi * rowH;
    svg += `<rect x="${x}" y="${ry}" width="${totalW}" height="${rowH}" fill="${zi % 2 === 0 ? '#fff' : '#f9f9f9'}" stroke="#000" stroke-width="0.3"/>`;
    const vals = [
      `Zone ${z.number}`,
      z.headType,
      z.heads.length.toString(),
      z.totalGPM.toString(),
      z.precipRateInPerHr + ' in/hr',
      z.runtimeMinutes + ' min',
    ];
    cx = x;
    for (let i = 0; i < vals.length; i++) {
      svg += `<text x="${cx + colWidths[i]/2}" y="${ry + 11}" font-size="5.5" text-anchor="middle" fill="#000" font-family="Arial">${vals[i]}</text>`;
      cx += colWidths[i];
    }
  }

  return svg;
}

function renderGeneralNotes(x: number, y: number): string {
  let svg = `<text x="${x}" y="${y - 4}" font-size="8" fill="#000" font-weight="bold" font-family="Arial">GENERAL NOTES</text>`;
  for (let i = 0; i < GENERAL_NOTES.length; i++) {
    const ny = y + 10 + i * 14;
    const noteText = GENERAL_NOTES[i].length > 90 ? GENERAL_NOTES[i].substring(0, 90) + '...' : GENERAL_NOTES[i];
    svg += `<text x="${x}" y="${ny}" font-size="5.5" fill="#333" font-family="Arial">${i + 1}. ${escapeXml(noteText)}</text>`;
  }
  return svg;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}