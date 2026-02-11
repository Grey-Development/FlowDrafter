/**
 * FlowDrafter Plan Compositor
 *
 * Step 3 of the 3-step visual pipeline:
 * Combines site plan layer + irrigation layer into a complete professional plan sheet
 * with annotations (legend, material schedule, zone schedule, title block)
 */

import { IrrigationDesign, ProjectInput, SiteAnalysis, PlanSheet, MaterialScheduleItem } from '../types';
import { calculateScale, getDrawingOrigin, getTitleBlockOrigin, feetToSvgUnits } from '../utils/scaling';
import { renderTitleBlock } from '../renderer/titleBlock';
import { renderLegend } from '../renderer/legend';
import { renderBorder } from '../renderer/border';
import { GENERAL_NOTES } from '../data/generalNotes';
import { generateIR2, generateIR3 } from '../renderer/detailSheets';
import { renderIrrigationLayer, IrrigationLayerConfig } from '../renderer/svgRenderer';
import { generateSitePlanFromAnalysis, scaleSitePlanSvg } from './sitePlanGenerator';

// ============================================================================
// COMPOSITOR INTERFACES
// ============================================================================

export interface CompositorInput {
  sitePlanSvg?: string;          // Pre-generated site plan SVG (optional)
  design: IrrigationDesign;
  siteAnalysis: SiteAnalysis;
  projectInput: ProjectInput;
}

export interface CompositorOutput {
  sheets: PlanSheet[];
  sitePlanLayer: string;
  irrigationLayer: string;
}

// ============================================================================
// MAIN COMPOSITOR
// ============================================================================

/**
 * Compose all plan sheets from site plan and irrigation design
 */
export function composePlanSheets(input: CompositorInput): CompositorOutput {
  const { design, siteAnalysis, projectInput, sitePlanSvg } = input;

  // Calculate scale and dimensions
  const scaleConfig = calculateScale(siteAnalysis.propertyWidthFt, siteAnalysis.propertyLengthFt);
  const { svgWidth, svgHeight, pixelsPerFoot, label: scaleLabel, feetPerInch } = scaleConfig;
  const origin = getDrawingOrigin();
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const dateStr = `Rev 1 - ${today}`;

  // Generate or use provided site plan
  const sitePlanLayer = sitePlanSvg || generateSitePlanFromAnalysis(siteAnalysis);

  // Generate irrigation layer
  const irrigationLayerConfig: IrrigationLayerConfig = {
    pixelsPerFoot,
    originX: 0,
    originY: 0,
  };
  const irrigationLayer = renderIrrigationLayer(
    design,
    siteAnalysis.propertyWidthFt,
    siteAnalysis.propertyLengthFt,
    irrigationLayerConfig
  );

  // Compose IR-1 with both layers
  const ir1Svg = composeIR1(
    sitePlanLayer,
    design,
    siteAnalysis,
    projectInput,
    svgWidth,
    svgHeight,
    pixelsPerFoot,
    origin,
    scaleLabel,
    feetPerInch,
    dateStr
  );

  // Generate detail sheets (unchanged)
  const ir2Svg = generateIR2(projectInput.projectName, scaleLabel, dateStr, svgWidth, svgHeight);
  const ir3Svg = generateIR3(projectInput.projectName, scaleLabel, dateStr, svgWidth, svgHeight);

  // Generate material schedule sheet (IR-4)
  const ir4Svg = generateMaterialScheduleSheet(
    design.materialSchedule,
    projectInput.projectName,
    scaleLabel,
    dateStr,
    svgWidth,
    svgHeight
  );

  return {
    sheets: [
      { sheetNumber: 'IR-1', title: 'Irrigation Plan', svgContent: ir1Svg, pageType: 'plan' },
      { sheetNumber: 'IR-2', title: 'Irrigation Details', svgContent: ir2Svg, pageType: 'details' },
      { sheetNumber: 'IR-3', title: 'Irrigation Details', svgContent: ir3Svg, pageType: 'details' },
      { sheetNumber: 'IR-4', title: 'Material Schedule', svgContent: ir4Svg, pageType: 'schedule' },
    ],
    sitePlanLayer,
    irrigationLayer,
  };
}

// ============================================================================
// IR-1 COMPOSITION
// ============================================================================

function composeIR1(
  sitePlanSvg: string,
  design: IrrigationDesign,
  siteAnalysis: SiteAnalysis,
  projectInput: ProjectInput,
  svgWidth: number,
  svgHeight: number,
  pixelsPerFoot: number,
  origin: { x: number; y: number },
  scaleLabel: string,
  feetPerInch: number,
  dateStr: string
): string {
  const layers: string[] = [];

  // SVG header
  layers.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`);
  layers.push(`<rect width="${svgWidth}" height="${svgHeight}" fill="#fff"/>`);

  // Layer 1: Border
  layers.push(renderBorder(svgWidth, svgHeight, scaleLabel, feetPerInch));

  // Calculate drawing area dimensions
  const drawW = svgWidth - 48 - 370 - 20; // Account for margins and title block
  const drawH = svgHeight - 96;

  // Layer 2: Site plan (scaled to fit drawing area)
  layers.push(`<g class="site-plan-layer" transform="translate(${origin.x}, ${origin.y})">`);
  // Extract inner SVG content and embed
  const sitePlanInner = extractSvgContent(sitePlanSvg);
  // Scale the site plan to fit the drawing area
  const scaleX = drawW / siteAnalysis.propertyWidthFt;
  const scaleY = drawH / siteAnalysis.propertyLengthFt;
  const scale = Math.min(scaleX, scaleY);
  layers.push(`<g transform="scale(${scale})">`);
  layers.push(sitePlanInner);
  layers.push('</g>');
  layers.push('</g>');

  // Layer 3: Irrigation elements (pipes, heads, valves)
  const toX = (ft: number) => origin.x + feetToSvgUnits(ft, pixelsPerFoot);
  const toY = (ft: number) => origin.y + feetToSvgUnits(ft, pixelsPerFoot);
  const toLen = (ft: number) => feetToSvgUnits(ft, pixelsPerFoot);

  layers.push('<g class="irrigation-layer">');

  // Pipes
  const { MAINLINE_COLOR } = require('../data/zoneColors');
  for (const pipe of design.pipes) {
    const color = pipe.type === 'mainline' ? MAINLINE_COLOR : pipe.type === 'drip-supply' ? '#92400E' : '#666';
    const weight = pipe.type === 'mainline' ? 2.5 : 1;
    const dash = pipe.type === 'drip-supply' ? ' stroke-dasharray="6 3"' : '';
    layers.push(`<line x1="${toX(pipe.startX)}" y1="${toY(pipe.startY)}" x2="${toX(pipe.endX)}" y2="${toY(pipe.endY)}" stroke="${color}" stroke-width="${weight}"${dash}/>`);
  }

  // Coverage circles
  const { coverageCircle, headSymbol, zoneValveSymbol, masterValveSymbol, rpzSymbol, controllerSymbol, pocSymbol, rainSensorSymbol, valveBoxSymbol } = require('../renderer/symbols');
  for (const head of design.heads) {
    if (head.radiusFt > 0) {
      const zone = design.zones.find(z => z.id === head.zoneId);
      const color = zone?.color || '#999';
      layers.push(coverageCircle(toX(head.x), toY(head.y), toLen(head.radiusFt), color));
    }
  }

  // Head symbols
  for (const head of design.heads) {
    const zone = design.zones.find(z => z.id === head.zoneId);
    const color = zone?.color || '#000';
    layers.push(headSymbol(toX(head.x), toY(head.y), head.type, head.arc, toLen(head.radiusFt), color));
  }

  // Valves
  for (const valve of design.valves) {
    if (valve.type === 'master') {
      layers.push(masterValveSymbol(toX(valve.x), toY(valve.y)));
    } else {
      const zone = design.zones.find(z => z.id === valve.zoneId);
      layers.push(zoneValveSymbol(toX(valve.x), toY(valve.y), zone?.color || '#333'));
      layers.push(valveBoxSymbol(toX(valve.x), toY(valve.y) + 10));
    }
  }

  // Equipment
  layers.push(pocSymbol(toX(design.poc.x), toY(design.poc.y)));
  layers.push(rpzSymbol(toX(design.backflow.x), toY(design.backflow.y)));
  layers.push(controllerSymbol(toX(design.controller.x), toY(design.controller.y)));
  layers.push(rainSensorSymbol(toX(design.rainSensor.x), toY(design.rainSensor.y)));

  layers.push('</g>');

  // Layer 4: Zone schedule
  const zsX = origin.x;
  const zsY = svgHeight - 200;
  layers.push(renderZoneSchedule(design, zsX, zsY));

  // Layer 5: General notes
  const gnX = origin.x + 350;
  const gnY = svgHeight - 200;
  layers.push(renderGeneralNotes(gnX, gnY));

  // Layer 6: Legend
  const tbOrigin = getTitleBlockOrigin(svgWidth);
  const lgX = tbOrigin.x - 290;
  const lgY = svgHeight - 380;
  layers.push(renderLegend(design, lgX, lgY));

  // Layer 7: Title block
  layers.push(renderTitleBlock(
    tbOrigin.x, tbOrigin.y, svgHeight - 96,
    projectInput.projectName, 'IRRIGATION PLAN', 'IR-1',
    scaleLabel, dateStr, design.totalSystemGPM, design.totalZones
  ));

  layers.push('</svg>');
  return layers.join('\n');
}

// ============================================================================
// ZONE SCHEDULE
// ============================================================================

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

// ============================================================================
// GENERAL NOTES
// ============================================================================

function renderGeneralNotes(x: number, y: number): string {
  let svg = `<text x="${x}" y="${y - 4}" font-size="8" fill="#000" font-weight="bold" font-family="Arial">GENERAL NOTES</text>`;
  for (let i = 0; i < GENERAL_NOTES.length; i++) {
    const ny = y + 10 + i * 14;
    const noteText = GENERAL_NOTES[i].length > 90 ? GENERAL_NOTES[i].substring(0, 90) + '...' : GENERAL_NOTES[i];
    svg += `<text x="${x}" y="${ny}" font-size="5.5" fill="#333" font-family="Arial">${i + 1}. ${escapeXml(noteText)}</text>`;
  }
  return svg;
}

// ============================================================================
// MATERIAL SCHEDULE SHEET (IR-4)
// ============================================================================

function generateMaterialScheduleSheet(
  materials: MaterialScheduleItem[],
  projectName: string,
  scaleLabel: string,
  dateStr: string,
  svgWidth: number,
  svgHeight: number
): string {
  const layers: string[] = [];

  // SVG header
  layers.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`);
  layers.push(`<rect width="${svgWidth}" height="${svgHeight}" fill="#fff"/>`);

  // Border
  layers.push(renderBorder(svgWidth, svgHeight, scaleLabel, 0));

  // Title
  layers.push(`<text x="${svgWidth/2}" y="80" font-size="24" text-anchor="middle" fill="#000" font-weight="bold" font-family="Arial">MATERIAL SCHEDULE</text>`);
  layers.push(`<text x="${svgWidth/2}" y="105" font-size="14" text-anchor="middle" fill="#333" font-family="Arial">${escapeXml(projectName)}</text>`);

  // Table
  const tableX = 100;
  const tableY = 150;
  const colWidths = [60, 300, 150, 120, 60, 60];
  const headers = ['Item', 'Description', 'Manufacturer', 'Model', 'Qty', 'Unit'];
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const rowH = 24;

  // Header row
  layers.push(`<rect x="${tableX}" y="${tableY}" width="${totalW}" height="${rowH}" fill="#1F2937" stroke="#000" stroke-width="1"/>`);
  let cx = tableX;
  for (let i = 0; i < headers.length; i++) {
    layers.push(`<text x="${cx + colWidths[i]/2}" y="${tableY + 16}" font-size="10" text-anchor="middle" fill="#fff" font-weight="bold" font-family="Arial">${headers[i]}</text>`);
    cx += colWidths[i];
  }

  // Data rows
  for (let mi = 0; mi < materials.length; mi++) {
    const m = materials[mi];
    const ry = tableY + rowH + mi * rowH;
    const fillColor = mi % 2 === 0 ? '#fff' : '#F3F4F6';

    layers.push(`<rect x="${tableX}" y="${ry}" width="${totalW}" height="${rowH}" fill="${fillColor}" stroke="#D1D5DB" stroke-width="0.5"/>`);

    const vals = [
      (mi + 1).toString(),
      m.item,
      m.manufacturer,
      m.model,
      m.quantity.toString(),
      m.unit,
    ];

    cx = tableX;
    for (let i = 0; i < vals.length; i++) {
      const align = i === 1 ? 'start' : 'middle';
      const xPos = i === 1 ? cx + 8 : cx + colWidths[i]/2;
      const text = vals[i].length > 40 ? vals[i].substring(0, 40) + '...' : vals[i];
      layers.push(`<text x="${xPos}" y="${ry + 16}" font-size="9" text-anchor="${align}" fill="#000" font-family="Arial">${escapeXml(text)}</text>`);
      cx += colWidths[i];
    }
  }

  // Summary box
  const summaryY = tableY + rowH + materials.length * rowH + 40;
  layers.push(`<rect x="${tableX}" y="${summaryY}" width="300" height="80" fill="#F9FAFB" stroke="#D1D5DB" stroke-width="1"/>`);
  layers.push(`<text x="${tableX + 10}" y="${summaryY + 20}" font-size="10" fill="#000" font-weight="bold" font-family="Arial">SUMMARY</text>`);
  layers.push(`<text x="${tableX + 10}" y="${summaryY + 40}" font-size="9" fill="#333" font-family="Arial">Total Line Items: ${materials.length}</text>`);

  // Count heads
  const headCount = materials.filter(m => m.item.toLowerCase().includes('head') || m.item.toLowerCase().includes('rotor') || m.item.toLowerCase().includes('spray')).reduce((sum, m) => sum + m.quantity, 0);
  layers.push(`<text x="${tableX + 10}" y="${summaryY + 55}" font-size="9" fill="#333" font-family="Arial">Total Sprinkler Heads: ${headCount}</text>`);

  // Title block
  const tbOrigin = getTitleBlockOrigin(svgWidth);
  layers.push(renderTitleBlock(
    tbOrigin.x, tbOrigin.y, svgHeight - 96,
    projectName, 'MATERIAL SCHEDULE', 'IR-4',
    'N/A', dateStr, 0, 0
  ));

  layers.push('</svg>');
  return layers.join('\n');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract inner content from SVG (remove outer svg tags)
 */
function extractSvgContent(svg: string): string {
  // Remove opening svg tag
  let content = svg.replace(/<svg[^>]*>/, '');
  // Remove closing svg tag
  content = content.replace(/<\/svg>/, '');
  // Remove any rect that fills the background
  content = content.replace(/<rect width="[^"]*" height="[^"]*" fill="#[Ww][Ff]+"\s*\/?>/, '');
  return content.trim();
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
