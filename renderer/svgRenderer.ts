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

// ============================================================================
// IRRIGATION LAYER RENDERER (Step 2 of 3-step pipeline)
// ============================================================================

export interface IrrigationLayerConfig {
  pixelsPerFoot: number;
  originX: number;
  originY: number;
}

/**
 * Render ONLY irrigation elements as a standalone SVG layer
 * This is Step 2 of the 3-step visual pipeline:
 * 1. Site plan (base layer)
 * 2. Irrigation layer (this function)
 * 3. Composited final plan
 *
 * The output is a transparent SVG that can be overlaid on the site plan
 */
export function renderIrrigationLayer(
  design: IrrigationDesign,
  widthFt: number,
  heightFt: number,
  config: IrrigationLayerConfig
): string {
  const { pixelsPerFoot, originX, originY } = config;

  // Calculate SVG dimensions
  const svgWidth = widthFt * pixelsPerFoot;
  const svgHeight = heightFt * pixelsPerFoot;

  const layers: string[] = [];

  // Coordinate transformation functions
  const toX = (ft: number) => originX + feetToSvgUnits(ft, pixelsPerFoot);
  const toY = (ft: number) => originY + feetToSvgUnits(ft, pixelsPerFoot);
  const toLen = (ft: number) => feetToSvgUnits(ft, pixelsPerFoot);

  // SVG header with transparent background
  layers.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`);

  // Layer 1: Pipes (mainline, lateral, drip-supply)
  layers.push('<g class="pipes">');
  for (const pipe of design.pipes) {
    const color = pipe.type === 'mainline' ? MAINLINE_COLOR : pipe.type === 'drip-supply' ? '#92400E' : '#666';
    const weight = pipe.type === 'mainline' ? 2.5 : 1;
    const dash = pipe.type === 'drip-supply' ? ' stroke-dasharray="6 3"' : '';
    layers.push(`<line class="${pipe.type}" x1="${toX(pipe.startX)}" y1="${toY(pipe.startY)}" x2="${toX(pipe.endX)}" y2="${toY(pipe.endY)}" stroke="${color}" stroke-width="${weight}"${dash}/>`);
  }
  layers.push('</g>');

  // Layer 2: Coverage circles (semi-transparent)
  layers.push('<g class="coverage-circles">');
  for (const head of design.heads) {
    if (head.radiusFt > 0) {
      const zone = design.zones.find(z => z.id === head.zoneId);
      const color = zone?.color || '#999';
      layers.push(coverageCircle(toX(head.x), toY(head.y), toLen(head.radiusFt), color));
    }
  }
  layers.push('</g>');

  // Layer 3: Head symbols
  layers.push('<g class="heads">');
  for (const head of design.heads) {
    const zone = design.zones.find(z => z.id === head.zoneId);
    const color = zone?.color || '#000';
    layers.push(headSymbol(toX(head.x), toY(head.y), head.type, head.arc, toLen(head.radiusFt), color));
  }
  layers.push('</g>');

  // Layer 4: Valves
  layers.push('<g class="valves">');
  for (const valve of design.valves) {
    if (valve.type === 'master') {
      layers.push(masterValveSymbol(toX(valve.x), toY(valve.y)));
    } else {
      const zone = design.zones.find(z => z.id === valve.zoneId);
      layers.push(zoneValveSymbol(toX(valve.x), toY(valve.y), zone?.color || '#333'));
      layers.push(valveBoxSymbol(toX(valve.x), toY(valve.y) + 10));
    }
  }
  layers.push('</g>');

  // Layer 5: Equipment (POC, backflow, controller, rain sensor)
  layers.push('<g class="equipment">');
  layers.push(pocSymbol(toX(design.poc.x), toY(design.poc.y)));
  layers.push(rpzSymbol(toX(design.backflow.x), toY(design.backflow.y)));
  layers.push(controllerSymbol(toX(design.controller.x), toY(design.controller.y)));
  layers.push(rainSensorSymbol(toX(design.rainSensor.x), toY(design.rainSensor.y)));
  layers.push('</g>');

  layers.push('</svg>');
  return layers.join('\n');
}

/**
 * Render irrigation layer using viewBox in feet (for overlay on site plan)
 * This version uses feet coordinates directly, matching the site plan coordinate system
 */
export function renderIrrigationLayerFeet(
  design: IrrigationDesign,
  widthFt: number,
  heightFt: number
): string {
  const layers: string[] = [];

  // SVG header - viewBox in feet to match site plan
  layers.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${widthFt} ${heightFt}">`);

  // Layer 1: Pipes
  layers.push('<g class="pipes">');
  for (const pipe of design.pipes) {
    const color = pipe.type === 'mainline' ? MAINLINE_COLOR : pipe.type === 'drip-supply' ? '#92400E' : '#666';
    const weight = pipe.type === 'mainline' ? 0.5 : 0.2; // Thinner for feet scale
    const dash = pipe.type === 'drip-supply' ? ' stroke-dasharray="1 0.5"' : '';
    layers.push(`<line class="${pipe.type}" x1="${pipe.startX}" y1="${pipe.startY}" x2="${pipe.endX}" y2="${pipe.endY}" stroke="${color}" stroke-width="${weight}"${dash}/>`);
  }
  layers.push('</g>');

  // Layer 2: Coverage circles
  layers.push('<g class="coverage-circles">');
  for (const head of design.heads) {
    if (head.radiusFt > 0) {
      const zone = design.zones.find(z => z.id === head.zoneId);
      const color = zone?.color || '#999';
      layers.push(`<circle cx="${head.x}" cy="${head.y}" r="${head.radiusFt}" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="0.1" stroke-dasharray="0.5 0.25"/>`);
    }
  }
  layers.push('</g>');

  // Layer 3: Head symbols (scaled for feet)
  layers.push('<g class="heads">');
  for (const head of design.heads) {
    const zone = design.zones.find(z => z.id === head.zoneId);
    const color = zone?.color || '#000';
    // Simple circles for heads at feet scale
    const radius = head.type === 'rotor' ? 1.2 : head.type === 'drip' ? 0.8 : 1;
    layers.push(`<circle cx="${head.x}" cy="${head.y}" r="${radius}" fill="${color}" stroke="#000" stroke-width="0.1"/>`);
  }
  layers.push('</g>');

  // Layer 4: Valves
  layers.push('<g class="valves">');
  for (const valve of design.valves) {
    const size = valve.type === 'master' ? 2 : 1.5;
    layers.push(`<rect x="${valve.x - size/2}" y="${valve.y - size/2}" width="${size}" height="${size}" fill="${valve.type === 'master' ? '#000' : '#333'}" stroke="#000" stroke-width="0.1"/>`);
  }
  layers.push('</g>');

  // Layer 5: Equipment
  layers.push('<g class="equipment">');
  // POC
  layers.push(`<circle cx="${design.poc.x}" cy="${design.poc.y}" r="1.5" fill="none" stroke="#000" stroke-width="0.2"/>`);
  layers.push(`<line x1="${design.poc.x - 1}" y1="${design.poc.y}" x2="${design.poc.x + 1}" y2="${design.poc.y}" stroke="#000" stroke-width="0.2"/>`);
  layers.push(`<line x1="${design.poc.x}" y1="${design.poc.y - 1}" x2="${design.poc.x}" y2="${design.poc.y + 1}" stroke="#000" stroke-width="0.2"/>`);
  // RPZ
  layers.push(`<rect x="${design.backflow.x - 2}" y="${design.backflow.y - 1}" width="4" height="2" fill="#fff" stroke="#000" stroke-width="0.2"/>`);
  // Controller
  layers.push(`<rect x="${design.controller.x - 1.5}" y="${design.controller.y - 2}" width="3" height="4" fill="#fff" stroke="#000" stroke-width="0.2"/>`);
  layers.push('</g>');

  layers.push('</svg>');
  return layers.join('\n');
}