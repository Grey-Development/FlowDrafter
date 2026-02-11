/**
 * Gemini AI Service
 *
 * In production: Uses Catalyst serverless function as proxy (secure)
 * In development: Can use direct Gemini API with local API key
 */

import { SiteAnalysis, DesignRecommendations, ProjectInput } from '../types';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_PROXY = API_BASE_URL.includes('/server/') || import.meta.env.PROD;

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
// DIRECT API CLIENT (Development only - dynamically imported)
// ============================================================================

let directAI: any = null;

async function getDirectAI(): Promise<any> {
  if (!directAI) {
    // Dynamic import to avoid loading SDK in production
    const { GoogleGenAI } = await import('@google/genai');
    const apiKey = (globalThis as any).process?.env?.GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured for local development');
    }
    directAI = new GoogleGenAI({ apiKey });
  }
  return directAI;
}

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
  const { getSiteAnalysisPrompt, EXPERT_SYSTEM_INSTRUCTION } = await import('./knowledgePrompts');
  const { Type } = await import('@google/genai');
  const ai = await getDirectAI();

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
      responseSchema: getSiteAnalysisSchema(Type),
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
  const { getDesignRecommendationPrompt, EXPERT_SYSTEM_INSTRUCTION } = await import('./knowledgePrompts');
  const ai = await getDirectAI();

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
  const { getHeadSelectionContext, getZoneDesignContext, getHydraulicContext, EXPERT_SYSTEM_INSTRUCTION } = await import('./knowledgePrompts');
  const ai = await getDirectAI();

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

function getSiteAnalysisSchema(Type: any) {
  return {
    type: Type.OBJECT,
    properties: {
      totalIrrigableSqFt: { type: Type.NUMBER },
      propertyWidthFt: { type: Type.NUMBER },
      propertyLengthFt: { type: Type.NUMBER },
      turfZones: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      bedZones: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      narrowStrips: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      hardscapeBoundaries: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      structures: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      slopeIndicators: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      treeCanopyAreas: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      waterSourceLocation: { type: Type.OBJECT, nullable: true },
      controllerLocation: { type: Type.OBJECT, nullable: true },
      nearestBuildingLocation: { type: Type.OBJECT },
    },
    required: [
      'totalIrrigableSqFt', 'propertyWidthFt', 'propertyLengthFt',
      'turfZones', 'bedZones', 'narrowStrips',
      'hardscapeBoundaries', 'structures', 'slopeIndicators',
      'treeCanopyAreas', 'nearestBuildingLocation',
    ],
  };
}
