/**
 * FlowDrafter Site Plan Generator
 *
 * Converts site analysis (with normalized 0-1 coordinates) into a clean
 * 2D architectural SVG site plan with proper CAD-style rendering.
 */

import { SiteAnalysis } from '../types';

// ============================================================================
// CAD-STYLE COLOR PALETTE
// ============================================================================

export const SITE_PLAN_COLORS = {
  // Background
  background: '#FFFFFF',

  // Buildings and structures - dark gray with heavy stroke
  building: {
    fill: '#6B7280',      // gray-500
    stroke: '#111827',    // gray-900
    strokeWidth: 2,
  },

  // Hardscape elements
  driveway: {
    fill: '#D1D5DB',      // gray-300
    stroke: '#374151',    // gray-700
    strokeWidth: 1.5,
  },
  walkway: {
    fill: '#E5E7EB',      // gray-200
    stroke: '#4B5563',    // gray-600
    strokeWidth: 1,
  },
  patio: {
    fill: '#D1D5DB',
    stroke: '#374151',
    strokeWidth: 1,
    pattern: 'patio-hatch',
  },
  parking: {
    fill: '#9CA3AF',      // gray-400
    stroke: '#374151',
    strokeWidth: 1.5,
  },

  // Landscape elements
  turf: {
    fill: '#86EFAC',      // green-300
    stroke: '#15803D',    // green-700
    strokeWidth: 1.5,
  },
  bed: {
    fill: '#D97706',      // amber-600
    fillOpacity: 0.35,
    stroke: '#92400E',    // amber-800
    strokeWidth: 1.5,
  },
  planter: {
    fill: '#B45309',      // amber-700
    fillOpacity: 0.4,
    stroke: '#78350F',
    strokeWidth: 1.5,
  },
  'tree-ring': {
    fill: '#D97706',
    fillOpacity: 0.25,
    stroke: '#92400E',
    strokeWidth: 1,
  },

  // Trees - dashed canopy circles
  tree: {
    fill: 'none',
    stroke: '#166534',    // green-800
    strokeWidth: 1,
    strokeDasharray: '3 2',
  },

  // Property boundary
  propertyLine: {
    fill: 'none',
    stroke: '#000000',
    strokeWidth: 2.5,
  },

  // Narrow strips
  narrowStrip: {
    fill: '#BEF264',      // lime-300
    fillOpacity: 0.6,
    stroke: '#4D7C0F',    // lime-700
    strokeWidth: 1,
  },

  // Water source marker
  waterSource: {
    fill: '#3B82F6',      // blue-500
    stroke: '#1E40AF',    // blue-800
    strokeWidth: 2,
  },

  // Controller marker
  controller: {
    fill: '#8B5CF6',      // violet-500
    stroke: '#5B21B6',    // violet-800
    strokeWidth: 2,
  },
};

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

/**
 * Convert normalized (0-1) coordinates to feet
 * The site analysis uses normalized coords where the property dimensions
 * tell us the actual feet measurements
 */
function normalizedToFeet(
  point: { x: number; y: number },
  widthFt: number,
  heightFt: number
): { x: number; y: number } {
  return {
    x: point.x * widthFt,
    y: point.y * heightFt,
  };
}

/**
 * Convert an array of normalized boundary points to SVG polygon points string (in feet)
 */
function boundaryToFeetPoints(
  boundary: Array<{ x: number; y: number }>,
  widthFt: number,
  heightFt: number
): string {
  if (!boundary || boundary.length === 0) return '';
  return boundary
    .map(p => {
      const ft = normalizedToFeet(p, widthFt, heightFt);
      return `${ft.x.toFixed(2)},${ft.y.toFixed(2)}`;
    })
    .join(' ');
}

/**
 * Create a rectangle polygon points string from position and dimensions
 */
function rectangleToPoints(
  position: { x: number; y: number },
  widthFt: number,
  heightFt: number,
  propWidthFt: number,
  propHeightFt: number
): string {
  // Position is normalized center, convert to top-left corner in feet
  const centerFt = normalizedToFeet(position, propWidthFt, propHeightFt);
  const x = centerFt.x - widthFt / 2;
  const y = centerFt.y - heightFt / 2;

  return `${x.toFixed(2)},${y.toFixed(2)} ${(x + widthFt).toFixed(2)},${y.toFixed(2)} ${(x + widthFt).toFixed(2)},${(y + heightFt).toFixed(2)} ${x.toFixed(2)},${(y + heightFt).toFixed(2)}`;
}

// ============================================================================
// SITE PLAN GENERATION
// ============================================================================

export interface SitePlanSvgData {
  viewBox: string;
  widthFt: number;
  heightFt: number;
  buildings: Array<{ id: string; points: string; label?: string }>;
  hardscape: Array<{ id: string; type: string; points: string }>;
  turfAreas: Array<{ id: string; points: string; label?: string }>;
  bedAreas: Array<{ id: string; type: string; points: string }>;
  narrowStrips: Array<{ id: string; points: string }>;
  trees: Array<{ id: string; cx: number; cy: number; radius: number }>;
  waterSource?: { x: number; y: number };
  controllerLocation?: { x: number; y: number };
}

/**
 * Generate site plan SVG from site analysis
 * Converts normalized coordinates to feet and creates CAD-style output
 */
export function generateSitePlanFromAnalysis(siteAnalysis: SiteAnalysis): string {
  const widthFt = siteAnalysis.propertyWidthFt || 100;
  const heightFt = siteAnalysis.propertyLengthFt || 100;

  // Convert all elements from normalized coords to feet
  const svgData: SitePlanSvgData = {
    viewBox: `0 0 ${widthFt} ${heightFt}`,
    widthFt,
    heightFt,

    // Buildings - use boundaryPoints if available, otherwise create from position/dimensions
    buildings: siteAnalysis.structures.map((s, i) => {
      let points: string;
      if (s.boundaryPoints && s.boundaryPoints.length >= 3) {
        points = boundaryToFeetPoints(s.boundaryPoints, widthFt, heightFt);
      } else {
        points = rectangleToPoints(s.position, s.widthFt, s.lengthFt, widthFt, heightFt);
      }
      return {
        id: `building-${i}`,
        points,
        label: s.type,
      };
    }),

    // Hardscape
    hardscape: siteAnalysis.hardscapeBoundaries.map((h, i) => ({
      id: `hardscape-${i}`,
      type: h.type,
      points: boundaryToFeetPoints(h.boundaryPoints, widthFt, heightFt),
    })),

    // Turf zones
    turfAreas: siteAnalysis.turfZones.map(z => ({
      id: z.id,
      points: boundaryToFeetPoints(z.boundaryPoints, widthFt, heightFt),
      label: z.id,
    })),

    // Bed zones
    bedAreas: siteAnalysis.bedZones.map(z => ({
      id: z.id,
      type: z.type,
      points: boundaryToFeetPoints(z.boundaryPoints, widthFt, heightFt),
    })),

    // Narrow strips
    narrowStrips: siteAnalysis.narrowStrips.map(z => ({
      id: z.id,
      points: boundaryToFeetPoints(z.boundaryPoints, widthFt, heightFt),
    })),

    // Trees - convert position to feet, radius stays in feet
    trees: siteAnalysis.treeCanopyAreas.map((t, i) => {
      const posFt = normalizedToFeet(t.position, widthFt, heightFt);
      return {
        id: `tree-${i}`,
        cx: posFt.x,
        cy: posFt.y,
        radius: t.radiusFt,
      };
    }),

    // Water source
    waterSource: siteAnalysis.waterSourceLocation
      ? normalizedToFeet(siteAnalysis.waterSourceLocation, widthFt, heightFt)
      : undefined,

    // Controller
    controllerLocation: siteAnalysis.controllerLocation
      ? normalizedToFeet(siteAnalysis.controllerLocation, widthFt, heightFt)
      : undefined,
  };

  return renderSitePlanSvg(svgData);
}

/**
 * Render SVG content from site plan data (all coordinates now in feet)
 */
function renderSitePlanSvg(data: SitePlanSvgData): string {
  const { widthFt, heightFt } = data;
  const layers: string[] = [];

  // SVG definitions (patterns, gradients)
  layers.push(`
    <defs>
      <pattern id="patio-hatch" patternUnits="userSpaceOnUse" width="2" height="2">
        <path d="M0,0 L2,2 M2,0 L0,2" stroke="#6B7280" stroke-width="0.25"/>
      </pattern>
      <pattern id="parking-stripe" patternUnits="userSpaceOnUse" width="4" height="1">
        <rect width="4" height="1" fill="#9CA3AF"/>
        <line x1="0" y1="0.5" x2="4" y2="0.5" stroke="#6B7280" stroke-width="0.1"/>
      </pattern>
    </defs>
  `);

  // Layer 1: Background
  layers.push(`<rect width="${widthFt}" height="${heightFt}" fill="${SITE_PLAN_COLORS.background}"/>`);

  // Layer 2: Turf areas (base layer - behind everything except background)
  if (data.turfAreas.length > 0) {
    const c = SITE_PLAN_COLORS.turf;
    const turfElements = data.turfAreas
      .filter(t => t.points && t.points.trim() !== '')
      .map(t => `
        <polygon id="${t.id}" points="${t.points}"
          fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
      `).join('');
    if (turfElements) {
      layers.push(`<g class="turf-areas">${turfElements}</g>`);
    }
  }

  // Layer 3: Narrow strips
  if (data.narrowStrips.length > 0) {
    const c = SITE_PLAN_COLORS.narrowStrip;
    const stripElements = data.narrowStrips
      .filter(s => s.points && s.points.trim() !== '')
      .map(s => `
        <polygon id="${s.id}" points="${s.points}"
          fill="${c.fill}" fill-opacity="${c.fillOpacity}"
          stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
      `).join('');
    if (stripElements) {
      layers.push(`<g class="narrow-strips">${stripElements}</g>`);
    }
  }

  // Layer 4: Bed areas
  if (data.bedAreas.length > 0) {
    const bedElements = data.bedAreas
      .filter(b => b.points && b.points.trim() !== '')
      .map(b => {
        const colorKey = b.type as keyof typeof SITE_PLAN_COLORS;
        const c = SITE_PLAN_COLORS[colorKey] || SITE_PLAN_COLORS.bed;
        const opacity = 'fillOpacity' in c ? c.fillOpacity : 1;
        return `
          <polygon id="${b.id}" points="${b.points}"
            fill="${c.fill}" fill-opacity="${opacity}"
            stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
        `;
      }).join('');
    if (bedElements) {
      layers.push(`<g class="bed-areas">${bedElements}</g>`);
    }
  }

  // Layer 5: Hardscape (driveways, walkways, patios)
  if (data.hardscape.length > 0) {
    const hardscapeElements = data.hardscape
      .filter(h => h.points && h.points.trim() !== '')
      .map(h => {
        const colorKey = h.type as keyof typeof SITE_PLAN_COLORS;
        const c = SITE_PLAN_COLORS[colorKey] || SITE_PLAN_COLORS.driveway;
        const fillValue = 'pattern' in c ? `url(#${c.pattern})` : c.fill;
        return `
          <polygon id="${h.id}" points="${h.points}"
            fill="${fillValue}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
        `;
      }).join('');
    if (hardscapeElements) {
      layers.push(`<g class="hardscape">${hardscapeElements}</g>`);
    }
  }

  // Layer 6: Buildings (on top)
  if (data.buildings.length > 0) {
    const c = SITE_PLAN_COLORS.building;
    const buildingElements = data.buildings
      .filter(b => b.points && b.points.trim() !== '')
      .map(b => {
        const centroid = getCentroid(b.points);
        return `
          <polygon id="${b.id}" points="${b.points}"
            fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
          ${b.label ? `<text x="${centroid.x}" y="${centroid.y}"
            text-anchor="middle" dominant-baseline="middle"
            font-size="${Math.min(widthFt, heightFt) * 0.02}" font-family="Arial, sans-serif"
            fill="#FFFFFF" font-weight="bold">${b.label.toUpperCase()}</text>` : ''}
        `;
      }).join('');
    if (buildingElements) {
      layers.push(`<g class="buildings">${buildingElements}</g>`);
    }
  }

  // Layer 7: Trees (canopy circles)
  if (data.trees.length > 0) {
    const c = SITE_PLAN_COLORS.tree;
    const treeElements = data.trees.map(t => `
      <circle id="${t.id}" cx="${t.cx.toFixed(2)}" cy="${t.cy.toFixed(2)}" r="${t.radius}"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"
        stroke-dasharray="${c.strokeDasharray}"/>
    `).join('');
    layers.push(`<g class="trees">${treeElements}</g>`);
  }

  // Layer 8: Water source marker (POC)
  if (data.waterSource) {
    const c = SITE_PLAN_COLORS.waterSource;
    const markerSize = Math.min(widthFt, heightFt) * 0.015;
    layers.push(`
      <g class="water-source">
        <circle cx="${data.waterSource.x.toFixed(2)}" cy="${data.waterSource.y.toFixed(2)}" r="${markerSize}"
          fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
        <text x="${data.waterSource.x.toFixed(2)}" y="${(data.waterSource.y + markerSize * 2.5).toFixed(2)}"
          text-anchor="middle" font-size="${markerSize * 1.2}" font-family="Arial, sans-serif"
          fill="${c.stroke}" font-weight="bold">POC</text>
      </g>
    `);
  }

  // Layer 9: Controller marker
  if (data.controllerLocation) {
    const c = SITE_PLAN_COLORS.controller;
    const markerSize = Math.min(widthFt, heightFt) * 0.012;
    layers.push(`
      <g class="controller">
        <rect x="${(data.controllerLocation.x - markerSize).toFixed(2)}"
              y="${(data.controllerLocation.y - markerSize).toFixed(2)}"
              width="${(markerSize * 2).toFixed(2)}" height="${(markerSize * 2).toFixed(2)}"
              fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
        <text x="${data.controllerLocation.x.toFixed(2)}" y="${(data.controllerLocation.y + markerSize * 3).toFixed(2)}"
          text-anchor="middle" font-size="${markerSize * 1.2}" font-family="Arial, sans-serif"
          fill="${c.stroke}" font-weight="bold">CTRL</text>
      </g>
    `);
  }

  // Layer 10: Scale bar
  const scaleBarLength = Math.round(widthFt / 5); // 1/5 of property width
  const scaleBarY = heightFt - (heightFt * 0.05);
  const scaleBarX = widthFt * 0.05;
  const scaleBarHeight = heightFt * 0.01;
  layers.push(`
    <g class="scale-bar">
      <rect x="${scaleBarX}" y="${scaleBarY}" width="${scaleBarLength}" height="${scaleBarHeight}"
        fill="#000000" stroke="none"/>
      <text x="${scaleBarX + scaleBarLength / 2}" y="${scaleBarY - scaleBarHeight}"
        text-anchor="middle" font-size="${heightFt * 0.02}" font-family="Arial, sans-serif"
        fill="#000000">${scaleBarLength} ft</text>
    </g>
  `);

  // Layer 11: North arrow
  const arrowSize = Math.min(widthFt, heightFt) * 0.04;
  const arrowX = widthFt - (widthFt * 0.08);
  const arrowY = heightFt * 0.08;
  layers.push(`
    <g class="north-arrow" transform="translate(${arrowX}, ${arrowY})">
      <polygon points="0,${-arrowSize} ${arrowSize * 0.35},${arrowSize * 0.5} 0,${arrowSize * 0.2} ${-arrowSize * 0.35},${arrowSize * 0.5}"
        fill="#374151" stroke="#111827" stroke-width="0.5"/>
      <text y="${-arrowSize * 1.3}" text-anchor="middle"
        font-size="${arrowSize * 0.6}" font-family="Arial, sans-serif" font-weight="bold"
        fill="#111827">N</text>
    </g>
  `);

  // Assemble final SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${widthFt} ${heightFt}" preserveAspectRatio="xMidYMid meet">
    ${layers.join('\n')}
  </svg>`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get centroid of polygon for label placement
 */
function getCentroid(points: string): { x: number; y: number } {
  const coords = points.split(' ').map(p => {
    const parts = p.split(',').map(Number);
    return { x: parts[0] || 0, y: parts[1] || 0 };
  }).filter(p => !isNaN(p.x) && !isNaN(p.y));

  if (coords.length === 0) return { x: 0, y: 0 };

  const sum = coords.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / coords.length, y: sum.y / coords.length };
}

/**
 * Scale SVG content to pixel dimensions (for embedding in plan sheets)
 */
export function scaleSitePlanSvg(
  svgContent: string,
  targetWidth: number,
  targetHeight: number,
  pixelsPerFoot: number
): string {
  // Replace viewBox to use pixel dimensions
  const scaledSvg = svgContent.replace(
    /viewBox="[^"]*"/,
    `viewBox="0 0 ${targetWidth / pixelsPerFoot} ${targetHeight / pixelsPerFoot}"`
  );

  return scaledSvg;
}
