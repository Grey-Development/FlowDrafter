/**
 * FlowDrafter Site Plan Generator
 *
 * Step 1 of the 3-step visual pipeline:
 * Converts drone aerial image + site analysis into a clean 2D architectural SVG site plan
 *
 * Uses Gemini AI to generate professional civil engineering style drawings
 */

import { GoogleGenAI, Type } from '@google/genai';
import { SiteAnalysis, ProjectInput } from '../types';
import { EXPERT_SYSTEM_INSTRUCTION } from './knowledgePrompts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
// SVG GENERATION SCHEMA
// ============================================================================

const SITE_PLAN_SVG_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    viewBox: {
      type: Type.STRING,
      description: 'SVG viewBox attribute, format: "0 0 width height" in feet',
    },
    propertyBoundary: {
      type: Type.OBJECT,
      properties: {
        points: {
          type: Type.STRING,
          description: 'SVG polygon points for property boundary, space-separated x,y pairs',
        },
      },
      required: ['points'],
    },
    buildings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          points: { type: Type.STRING, description: 'SVG polygon points' },
          label: { type: Type.STRING },
        },
        required: ['id', 'points'],
      },
    },
    hardscape: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['driveway', 'walkway', 'patio', 'parking', 'other'] },
          points: { type: Type.STRING },
        },
        required: ['id', 'type', 'points'],
      },
    },
    turfAreas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          points: { type: Type.STRING },
          label: { type: Type.STRING },
        },
        required: ['id', 'points'],
      },
    },
    bedAreas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['bed', 'planter', 'tree-ring'] },
          points: { type: Type.STRING },
        },
        required: ['id', 'type', 'points'],
      },
    },
    narrowStrips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          points: { type: Type.STRING },
        },
        required: ['id', 'points'],
      },
    },
    trees: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          cx: { type: Type.NUMBER, description: 'Center X in feet' },
          cy: { type: Type.NUMBER, description: 'Center Y in feet' },
          radius: { type: Type.NUMBER, description: 'Canopy radius in feet' },
        },
        required: ['id', 'cx', 'cy', 'radius'],
      },
    },
    waterSource: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
      },
    },
    northArrow: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        rotation: { type: Type.NUMBER, description: 'Rotation in degrees, 0 = up' },
      },
      required: ['x', 'y', 'rotation'],
    },
  },
  required: ['viewBox', 'buildings', 'hardscape', 'turfAreas', 'bedAreas', 'trees'],
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
 * Generate a clean 2D architectural site plan SVG from drone image and analysis
 */
export async function generateSitePlanSvg(
  base64Image: string,
  mimeType: string,
  siteAnalysis: SiteAnalysis,
  projectInput: Partial<ProjectInput>
): Promise<{ svgContent: string; svgData: SitePlanSvgData }> {
  const prompt = `You are generating a clean 2D architectural site plan SVG from this drone aerial photograph.

EXISTING SITE ANALYSIS (use these dimensions and positions):
${JSON.stringify(siteAnalysis, null, 2)}

PROJECT CONTEXT:
- Application: ${projectInput.applicationType || 'commercial'}
- Property dimensions: ${siteAnalysis.propertyWidthFt} ft × ${siteAnalysis.propertyLengthFt} ft

REQUIREMENTS:
1. Generate SVG polygon/circle data for a clean architectural site plan
2. Use the coordinate system from the site analysis (origin at top-left, Y increases downward)
3. All measurements in feet
4. Trace clean, simplified outlines - no complex curves, just straight polygon edges
5. Buildings should be solid rectangles/polygons
6. Turf areas should be closed polygons
7. Trees should be circles with their canopy radius

OUTPUT FORMAT:
- viewBox should be "0 0 {propertyWidthFt} {propertyLengthFt}"
- All polygon points as SVG-compatible strings: "x1,y1 x2,y2 x3,y3..."
- Coordinates in feet from origin

Generate the architectural site plan elements based on what you see in the image and the provided analysis.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: SITE_PLAN_SVG_SCHEMA,
      systemInstruction: `${EXPERT_SYSTEM_INSTRUCTION}

You are also an expert in civil engineering site plan drafting. Generate clean, professional SVG data that would be suitable for a landscape architecture plan set. Use simple polygons with straight edges. Avoid unnecessary complexity.`,
    },
  });

  const svgData = JSON.parse(response.text || '{}') as SitePlanSvgData;

  // Ensure defaults
  if (!svgData.buildings) svgData.buildings = [];
  if (!svgData.hardscape) svgData.hardscape = [];
  if (!svgData.turfAreas) svgData.turfAreas = [];
  if (!svgData.bedAreas) svgData.bedAreas = [];
  if (!svgData.narrowStrips) svgData.narrowStrips = [];
  if (!svgData.trees) svgData.trees = [];
  if (!svgData.viewBox) svgData.viewBox = `0 0 ${siteAnalysis.propertyWidthFt} ${siteAnalysis.propertyLengthFt}`;

  // Generate the actual SVG content
  const svgContent = renderSitePlanSvg(svgData, siteAnalysis);

  return { svgContent, svgData };
}

/**
 * Generate site plan SVG from existing site analysis (no AI call)
 * Useful when site analysis already has detailed zone boundaries
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
