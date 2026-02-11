/**
 * FlowDrafter Site Plan Generator
 *
 * Step 1 of the 3-step visual pipeline:
 * Converts site analysis into a clean 2D architectural SVG site plan
 */

import { SiteAnalysis } from '../types';

// ============================================================================
// ARCHITECTURAL COLOR PALETTE
// ============================================================================

export const SITE_PLAN_COLORS = {
  // Buildings and structures
  building: {
    fill: '#9CA3AF',      // gray-400
    stroke: '#1F2937',    // gray-800
    strokeWidth: 2,
  },

  // Hardscape elements
  driveway: {
    fill: '#D1D5DB',      // gray-300
    stroke: '#6B7280',    // gray-500
    strokeWidth: 1,
  },
  walkway: {
    fill: '#E5E7EB',      // gray-200
    stroke: '#9CA3AF',    // gray-400
    strokeWidth: 1,
  },
  patio: {
    fill: '#D1D5DB',      // gray-300
    stroke: '#6B7280',
    strokeWidth: 1,
    pattern: 'patio-hatch',
  },
  parking: {
    fill: '#D1D5DB',
    stroke: '#6B7280',
    strokeWidth: 1,
  },

  // Landscape elements
  turf: {
    fill: '#86EFAC',      // green-300
    stroke: '#22C55E',    // green-500
    strokeWidth: 1,
  },
  bed: {
    fill: '#A16207',      // amber-700
    fillOpacity: 0.3,
    stroke: '#78350F',    // amber-900
    strokeWidth: 1,
  },
  planter: {
    fill: '#A16207',
    fillOpacity: 0.4,
    stroke: '#78350F',
    strokeWidth: 1.5,
  },
  treeRing: {
    fill: '#A16207',
    fillOpacity: 0.2,
    stroke: '#78350F',
    strokeWidth: 1,
  },

  // Trees
  tree: {
    fill: 'none',
    stroke: '#15803D',    // green-700
    strokeWidth: 1,
    strokeDasharray: '4 2',
  },

  // Property boundary
  propertyLine: {
    fill: 'none',
    stroke: '#000000',
    strokeWidth: 2,
  },

  // Narrow strips
  narrowStrip: {
    fill: '#A3E635',      // lime-400
    fillOpacity: 0.5,
    stroke: '#65A30D',    // lime-600
    strokeWidth: 1,
  },

  // Water features
  waterSource: {
    fill: '#3B82F6',      // blue-500
    stroke: '#1D4ED8',    // blue-700
    strokeWidth: 2,
  },
};

// ============================================================================
// SITE PLAN GENERATION
// ============================================================================

export interface SitePlanSvgData {
  viewBox: string;
  propertyBoundary?: { points: string };
  buildings: Array<{ id: string; points: string; label?: string }>;
  hardscape: Array<{ id: string; type: string; points: string }>;
  turfAreas: Array<{ id: string; points: string; label?: string }>;
  bedAreas: Array<{ id: string; type: string; points: string }>;
  narrowStrips: Array<{ id: string; points: string }>;
  trees: Array<{ id: string; cx: number; cy: number; radius: number }>;
  waterSource?: { x: number; y: number };
  northArrow?: { x: number; y: number; rotation: number };
}

/**
 * Generate site plan SVG from existing site analysis (no AI call)
 * Creates a clean architectural-style site plan from analyzed zone boundaries
 */
export function generateSitePlanFromAnalysis(siteAnalysis: SiteAnalysis): string {
  const svgData: SitePlanSvgData = {
    viewBox: `0 0 ${siteAnalysis.propertyWidthFt} ${siteAnalysis.propertyLengthFt}`,
    buildings: siteAnalysis.structures.map((s, i) => ({
      id: `building-${i}`,
      points: rectangleToPoints(s.position.x, s.position.y, s.widthFt, s.lengthFt),
      label: s.type,
    })),
    hardscape: siteAnalysis.hardscapeBoundaries.map((h, i) => ({
      id: `hardscape-${i}`,
      type: h.type,
      points: boundaryToPoints(h.boundaryPoints),
    })),
    turfAreas: siteAnalysis.turfZones.map(z => ({
      id: z.id,
      points: boundaryToPoints(z.boundaryPoints),
      label: `Turf ${z.id}`,
    })),
    bedAreas: siteAnalysis.bedZones.map(z => ({
      id: z.id,
      type: z.type,
      points: boundaryToPoints(z.boundaryPoints),
    })),
    narrowStrips: siteAnalysis.narrowStrips.map(z => ({
      id: z.id,
      points: boundaryToPoints(z.boundaryPoints),
    })),
    trees: siteAnalysis.treeCanopyAreas.map((t, i) => ({
      id: `tree-${i}`,
      cx: t.position.x,
      cy: t.position.y,
      radius: t.radiusFt,
    })),
    waterSource: siteAnalysis.waterSourceLocation || undefined,
  };

  return renderSitePlanSvg(svgData, siteAnalysis);
}

/**
 * Render SVG content from site plan data
 */
function renderSitePlanSvg(data: SitePlanSvgData, siteAnalysis: SiteAnalysis): string {
  const width = siteAnalysis.propertyWidthFt;
  const height = siteAnalysis.propertyLengthFt;

  const layers: string[] = [];

  // SVG definitions (patterns, etc.)
  layers.push(`
    <defs>
      <pattern id="patio-hatch" patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M0,0 L4,4 M4,0 L0,4" stroke="#9CA3AF" stroke-width="0.5"/>
      </pattern>
    </defs>
  `);

  // Layer 1: Property boundary (if provided)
  if (data.propertyBoundary?.points) {
    const c = SITE_PLAN_COLORS.propertyLine;
    layers.push(`
      <g class="property-boundary">
        <polygon points="${data.propertyBoundary.points}"
          fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
      </g>
    `);
  }

  // Layer 2: Turf areas (drawn first so they're behind everything)
  if (data.turfAreas.length > 0) {
    const c = SITE_PLAN_COLORS.turf;
    const turfElements = data.turfAreas.map(t => `
      <polygon id="${t.id}" points="${t.points}"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
    `).join('');
    layers.push(`<g class="turf-areas">${turfElements}</g>`);
  }

  // Layer 3: Bed areas
  if (data.bedAreas.length > 0) {
    const bedElements = data.bedAreas.map(b => {
      const c = SITE_PLAN_COLORS[b.type as keyof typeof SITE_PLAN_COLORS] || SITE_PLAN_COLORS.bed;
      const opacity = 'fillOpacity' in c ? c.fillOpacity : 1;
      return `
        <polygon id="${b.id}" points="${b.points}"
          fill="${c.fill}" fill-opacity="${opacity}"
          stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
      `;
    }).join('');
    layers.push(`<g class="bed-areas">${bedElements}</g>`);
  }

  // Layer 4: Narrow strips
  if (data.narrowStrips.length > 0) {
    const c = SITE_PLAN_COLORS.narrowStrip;
    const stripElements = data.narrowStrips.map(s => `
      <polygon id="${s.id}" points="${s.points}"
        fill="${c.fill}" fill-opacity="${c.fillOpacity}"
        stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
    `).join('');
    layers.push(`<g class="narrow-strips">${stripElements}</g>`);
  }

  // Layer 5: Hardscape
  if (data.hardscape.length > 0) {
    const hardscapeElements = data.hardscape.map(h => {
      const colorKey = h.type as keyof typeof SITE_PLAN_COLORS;
      const c = SITE_PLAN_COLORS[colorKey] || SITE_PLAN_COLORS.driveway;
      const pattern = 'pattern' in c ? `url(#${c.pattern})` : c.fill;
      return `
        <polygon id="${h.id}" points="${h.points}"
          fill="${pattern}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
      `;
    }).join('');
    layers.push(`<g class="hardscape">${hardscapeElements}</g>`);
  }

  // Layer 6: Buildings (on top of landscape)
  if (data.buildings.length > 0) {
    const c = SITE_PLAN_COLORS.building;
    const buildingElements = data.buildings.map(b => `
      <polygon id="${b.id}" points="${b.points}"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
      ${b.label ? `<text x="${getCentroid(b.points).x}" y="${getCentroid(b.points).y}"
        text-anchor="middle" font-size="3" fill="#374151">${b.label}</text>` : ''}
    `).join('');
    layers.push(`<g class="buildings">${buildingElements}</g>`);
  }

  // Layer 7: Trees (canopy circles)
  if (data.trees.length > 0) {
    const c = SITE_PLAN_COLORS.tree;
    const treeElements = data.trees.map(t => `
      <circle id="${t.id}" cx="${t.cx}" cy="${t.cy}" r="${t.radius}"
        fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"
        stroke-dasharray="${c.strokeDasharray}"/>
    `).join('');
    layers.push(`<g class="trees">${treeElements}</g>`);
  }

  // Layer 8: Water source marker
  if (data.waterSource) {
    const c = SITE_PLAN_COLORS.waterSource;
    layers.push(`
      <g class="water-source">
        <circle cx="${data.waterSource.x}" cy="${data.waterSource.y}" r="2"
          fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}"/>
        <text x="${data.waterSource.x}" y="${data.waterSource.y + 5}"
          text-anchor="middle" font-size="2.5" fill="${c.stroke}">POC</text>
      </g>
    `);
  }

  // Layer 9: North arrow
  if (data.northArrow) {
    const { x, y, rotation } = data.northArrow;
    layers.push(`
      <g class="north-arrow" transform="translate(${x}, ${y}) rotate(${rotation})">
        <polygon points="0,-5 2,3 0,1 -2,3" fill="#374151"/>
        <text y="-7" text-anchor="middle" font-size="3" fill="#374151">N</text>
      </g>
    `);
  }

  // Assemble final SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#FFFFFF"/>
    ${layers.join('\n')}
  </svg>`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert boundary points array to SVG polygon points string
 */
function boundaryToPoints(boundary: Array<{ x: number; y: number }>): string {
  return boundary.map(p => `${p.x},${p.y}`).join(' ');
}

/**
 * Convert rectangle to polygon points
 */
function rectangleToPoints(x: number, y: number, width: number, height: number): string {
  return `${x},${y} ${x + width},${y} ${x + width},${y + height} ${x},${y + height}`;
}

/**
 * Get centroid of polygon for label placement
 */
function getCentroid(points: string): { x: number; y: number } {
  const coords = points.split(' ').map(p => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  });

  if (coords.length === 0) return { x: 0, y: 0 };

  const sum = coords.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / coords.length, y: sum.y / coords.length };
}

/**
 * Scale SVG content to pixel dimensions
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
