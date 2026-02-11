/**
 * Gemini AI Service
 *
 * In production: Uses Catalyst serverless function as proxy (secure)
 * In development: Can use direct Gemini API with local API key
 */

import { GoogleGenAI, Type } from '@google/genai';
import { SiteAnalysis, DesignRecommendations, ProjectInput } from '../types';
import {
  EXPERT_SYSTEM_INSTRUCTION,
  getSiteAnalysisPrompt,
  getDesignRecommendationPrompt,
  getHeadSelectionContext,
  getZoneDesignContext,
  getHydraulicContext,
} from './knowledgePrompts';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_PROXY = API_BASE_URL.includes('/server/') || import.meta.env.PROD;

// Direct Gemini client for local development
let directAI: GoogleGenAI | null = null;
function getDirectAI(): GoogleGenAI {
  if (!directAI) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured for local development');
    }
    directAI = new GoogleGenAI({ apiKey });
  }
  return directAI;
}

// ============================================================================
// PROXY API CLIENT (Production)
// ============================================================================

async function proxyRequest<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.message || error.error || 'API request failed');
  }

  return response.json();
}

// ============================================================================
// SITE ANALYSIS SCHEMA (for direct API calls)
// ============================================================================

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

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Analyze a site from drone imagery
 */
export async function analyzeSite(
  base64Image: string,
  mimeType: string,
  projectInput: Partial<ProjectInput>
): Promise<SiteAnalysis> {
  // Use proxy in production
  if (USE_PROXY) {
    const result = await proxyRequest<SiteAnalysis>('/analyze-site', {
      base64Image,
      mimeType,
      projectInput,
    });
    return ensureDefaults(result);
  }

  // Direct API call for local development
  const ai = getDirectAI();
  const prompt = getSiteAnalysisPrompt({
    applicationType: projectInput.applicationType || 'commercial',
    turfType: projectInput.turfType || 'bermudagrass',
    soilType: projectInput.soilType,
  });

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
      systemInstruction: EXPERT_SYSTEM_INSTRUCTION,
    },
  });

  const parsed = JSON.parse(response.text || '{}') as SiteAnalysis;
  return ensureDefaults(parsed);
}

/**
 * Get design recommendations based on site analysis
 */
export async function getDesignRecommendations(
  siteAnalysis: SiteAnalysis,
  projectInput: Partial<ProjectInput>
): Promise<DesignRecommendations> {
  // Use proxy in production
  if (USE_PROXY) {
    return proxyRequest<DesignRecommendations>('/design-recommendations', {
      siteAnalysis,
      projectInput,
    });
  }

  // Direct API call for local development
  const ai = getDirectAI();
  const prompt = getDesignRecommendationPrompt(siteAnalysis, {
    applicationType: projectInput.applicationType || 'commercial',
    turfType: projectInput.turfType || 'bermudagrass',
    soilType: projectInput.soilType || 'clay',
    waterSupplySize: projectInput.waterSupplySize || 1.5,
    staticPressurePSI: projectInput.staticPressurePSI || 60,
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json',
      systemInstruction: EXPERT_SYSTEM_INSTRUCTION,
    },
  });

  return JSON.parse(response.text || '{}') as DesignRecommendations;
}

/**
 * Validate a completed design against professional standards
 */
export async function validateDesign(
  designSummary: {
    totalZones: number;
    totalGPM: number;
    headTypes: string[];
    mainlineSize: number;
    hasRainSensor: boolean;
    hasBackflow: boolean;
  }
): Promise<{ valid: boolean; issues: string[]; recommendations: string[] }> {
  // Use proxy in production
  if (USE_PROXY) {
    return proxyRequest<{ valid: boolean; issues: string[]; recommendations: string[] }>('/validate-design', {
      designSummary,
    });
  }

  // Direct API call for local development
  const ai = getDirectAI();
  const prompt = `Validate this irrigation design against professional standards and Georgia regulations.

DESIGN SUMMARY:
- Total zones: ${designSummary.totalZones}
- Peak demand: ${designSummary.totalGPM} GPM
- Head types used: ${designSummary.headTypes.join(', ')}
- Mainline size: ${designSummary.mainlineSize}"
- Rain sensor included: ${designSummary.hasRainSensor ? 'Yes' : 'NO - REQUIRED BY LAW'}
- Backflow preventer included: ${designSummary.hasBackflow ? 'Yes' : 'NO - REQUIRED'}

KNOWLEDGE CONTEXT:
${getHeadSelectionContext()}

${getZoneDesignContext()}

${getHydraulicContext()}

Evaluate this design and provide:
1. Whether it passes professional standards (valid: true/false)
2. List of specific issues found
3. Recommendations for improvement

Return JSON format: { valid: boolean, issues: string[], recommendations: string[] }`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json',
      systemInstruction: EXPERT_SYSTEM_INSTRUCTION,
    },
  });

  const result = JSON.parse(response.text || '{}');
  return {
    valid: result.valid ?? false,
    issues: result.issues ?? [],
    recommendations: result.recommendations ?? [],
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function ensureDefaults(parsed: SiteAnalysis): SiteAnalysis {
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
