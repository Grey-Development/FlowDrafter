import { GoogleGenAI, Type } from '@google/genai';
import { SiteAnalysis, IrrigableZone, DesignRecommendations, ProjectInput } from '../types';
import { SPRINKLER_HEADS } from '../data/materials';
import { DESIGN_RULES } from '../data/designRules';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SITE_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    totalIrrigableSqFt: { type: Type.NUMBER, description: 'Total irrigable area in square feet' },
    propertyWidthFt: { type: Type.NUMBER, description: 'Approximate property width in feet' },
    propertyLengthFt: { type: Type.NUMBER, description: 'Approximate property length in feet' },
    turfZones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['turf'] },
          shape: { type: Type.STRING, enum: ['rectangular', 'irregular', 'circular', 'L-shaped', 'triangular'] },
          widthFt: { type: Type.NUMBER },
          lengthFt: { type: Type.NUMBER },
          areaFt2: { type: Type.NUMBER },
          exposure: { type: Type.STRING, enum: ['full-sun', 'partial-shade', 'full-shade'] },
          slopeRatio: { type: Type.STRING, nullable: true },
          centerX: { type: Type.NUMBER },
          centerY: { type: Type.NUMBER },
          boundaryPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
              required: ['x', 'y'],
            },
          },
        },
        required: ['id', 'type', 'shape', 'widthFt', 'lengthFt', 'areaFt2', 'exposure', 'centerX', 'centerY', 'boundaryPoints'],
      },
    },
    bedZones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['bed', 'planter', 'tree-ring'] },
          shape: { type: Type.STRING, enum: ['rectangular', 'irregular', 'circular', 'L-shaped', 'triangular'] },
          widthFt: { type: Type.NUMBER },
          lengthFt: { type: Type.NUMBER },
          areaFt2: { type: Type.NUMBER },
          exposure: { type: Type.STRING, enum: ['full-sun', 'partial-shade', 'full-shade'] },
          slopeRatio: { type: Type.STRING, nullable: true },
          centerX: { type: Type.NUMBER },
          centerY: { type: Type.NUMBER },
          boundaryPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
              required: ['x', 'y'],
            },
          },
        },
        required: ['id', 'type', 'shape', 'widthFt', 'lengthFt', 'areaFt2', 'exposure', 'centerX', 'centerY', 'boundaryPoints'],
      },
    },
    narrowStrips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['narrow-strip'] },
          shape: { type: Type.STRING },
          widthFt: { type: Type.NUMBER },
          lengthFt: { type: Type.NUMBER },
          areaFt2: { type: Type.NUMBER },
          exposure: { type: Type.STRING, enum: ['full-sun', 'partial-shade', 'full-shade'] },
          slopeRatio: { type: Type.STRING, nullable: true },
          centerX: { type: Type.NUMBER },
          centerY: { type: Type.NUMBER },
          boundaryPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
              required: ['x', 'y'],
            },
          },
        },
        required: ['id', 'type', 'shape', 'widthFt', 'lengthFt', 'areaFt2', 'exposure', 'centerX', 'centerY', 'boundaryPoints'],
      },
    },
    hardscapeBoundaries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['walkway', 'driveway', 'parking', 'building', 'patio', 'other'] },
          boundaryPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
              required: ['x', 'y'],
            },
          },
        },
        required: ['type', 'boundaryPoints'],
      },
    },
    structures: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          position: {
            type: Type.OBJECT,
            properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
            required: ['x', 'y'],
          },
          widthFt: { type: Type.NUMBER },
          lengthFt: { type: Type.NUMBER },
        },
        required: ['type', 'position', 'widthFt', 'lengthFt'],
      },
    },
    slopeIndicators: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.OBJECT,
            properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
            required: ['x', 'y'],
          },
          direction: { type: Type.STRING },
          ratio: { type: Type.STRING },
        },
        required: ['location', 'direction', 'ratio'],
      },
    },
    treeCanopyAreas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          position: {
            type: Type.OBJECT,
            properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
            required: ['x', 'y'],
          },
          radiusFt: { type: Type.NUMBER },
        },
        required: ['position', 'radiusFt'],
      },
    },
    waterSourceLocation: {
      type: Type.OBJECT,
      nullable: true,
      properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
    },
    controllerLocation: {
      type: Type.OBJECT,
      nullable: true,
      properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
    },
    nearestBuildingLocation: {
      type: Type.OBJECT,
      properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
      required: ['x', 'y'],
    },
  },
  required: [
    'totalIrrigableSqFt', 'propertyWidthFt', 'propertyLengthFt',
    'turfZones', 'bedZones', 'narrowStrips',
    'hardscapeBoundaries', 'structures', 'slopeIndicators',
    'treeCanopyAreas', 'nearestBuildingLocation',
  ],
};

export async function analyzeSite(
  base64Image: string,
  mimeType: string,
  projectInput: Partial<ProjectInput>
): Promise<SiteAnalysis> {
  const prompt = `You are a senior landscape architect and irrigation designer analyzing a drone aerial photograph of a property.

Analyze this image and identify all irrigable areas, hardscapes, structures, and site features. Return structured JSON data.

IMPORTANT COORDINATE SYSTEM:
- Use feet as units for all dimensions
- Origin (0,0) is the top-left corner of the property
- X increases to the right, Y increases downward
- Estimate dimensions based on visible features (buildings, roads, parking areas provide scale reference)
- For boundary points, trace the outline of each zone as a polygon

Project context:
- Application type: ${projectInput.applicationType || 'commercial'}
- Turf type: ${projectInput.turfType || 'bermudagrass'}

Identify:
1. All turf areas (open grass) with approximate dimensions and shape
2. All landscape bed areas (planted beds, planter boxes, tree rings)
3. Any narrow strips less than 8 feet wide
4. All hardscape boundaries (walkways, driveways, parking, buildings, patios)
5. Structures with approximate footprints
6. Slope indicators if visible
7. Tree canopy areas that may need separate irrigation treatment
8. The nearest building location (for controller placement)
9. Any visible water source, utility connection, or water meter location
10. Suggested controller location near nearest building`;

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
      responseSchema: SITE_ANALYSIS_SCHEMA,
      systemInstruction: 'You are a senior landscape architect and certified irrigation designer with 20 years of experience in commercial irrigation system design in the Southeast United States. You specialize in analyzing aerial drone photography to identify irrigable zones, hardscape boundaries, and site conditions for irrigation plan development. Always provide realistic dimension estimates in feet.',
    },
  });

  const parsed = JSON.parse(response.text || '{}') as SiteAnalysis;

  if (!parsed.turfZones) parsed.turfZones = [];
  if (!parsed.bedZones) parsed.bedZones = [];
  if (!parsed.narrowStrips) parsed.narrowStrips = [];
  if (!parsed.hardscapeBoundaries) parsed.hardscapeBoundaries = [];
  if (!parsed.structures) parsed.structures = [];
  if (!parsed.slopeIndicators) parsed.slopeIndicators = [];
  if (!parsed.treeCanopyAreas) parsed.treeCanopyAreas = [];
  if (!parsed.nearestBuildingLocation) parsed.nearestBuildingLocation = { x: 10, y: 10 };

  return parsed;
}

export async function getDesignRecommendations(
  siteAnalysis: SiteAnalysis,
  projectInput: Partial<ProjectInput>
): Promise<DesignRecommendations> {
  const availableHeads = SPRINKLER_HEADS.map(h => `${h.name}: ${h.manufacturer} ${h.model} (${h.minRadiusFt}-${h.maxRadiusFt}ft radius, ${h.gpmAtDefaultRadius} GPM)`).join('\n');

  const prompt = `Based on this site analysis data, provide irrigation design recommendations.

SITE ANALYSIS:
${JSON.stringify(siteAnalysis, null, 2)}

PROJECT DETAILS:
- Application: ${projectInput.applicationType}
- Water supply: ${projectInput.waterSupplySize}"
- Static pressure: ${projectInput.staticPressurePSI} PSI
- Turf type: ${projectInput.turfType}

AVAILABLE SPRINKLER HEADS:
${availableHeads}

DESIGN RULES:
- Max GPM per zone (1" lateral): 15 GPM
- Max GPM per zone (1.25" lateral): 22 GPM
- Max pipe velocity: 5 fps
- Head-to-head spacing = manufacturer radius
- Separate zones for: turf vs beds, full-sun vs shade, slopes > 4:1
- Narrow strips < 8ft: use strip nozzles

Recommend:
1. Head type for each identified zone
2. Suggested total zone count
3. Valve cluster locations (central to served zones)
4. Controller location
5. Mainline route suggestions`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json',
      systemInstruction: 'You are a senior irrigation designer providing design recommendations based on site analysis. Be practical and follow industry best practices for commercial irrigation in the Southeast US.',
    },
  });

  return JSON.parse(response.text || '{}') as DesignRecommendations;
}
