/**
 * Zoho Catalyst Serverless Function - Gemini API Proxy
 * Securely proxies requests to Google Gemini API
 */

import { GoogleGenAI, Type } from '@google/genai';
import catalyst from 'zcatalyst-sdk-node';

// Initialize Gemini AI (API key from Catalyst Secrets)
let ai = null;

async function getAI(catalystApp) {
  if (!ai) {
    // Get API key from Catalyst Secrets
    const segments = catalystApp.cache().segment();
    let apiKey;
    try {
      const cached = await segments.get('gemini_api_key');
      apiKey = cached?.cache_value;
    } catch (e) {
      // Fallback to environment variable
      apiKey = process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// Site Analysis Schema
const SITE_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    totalIrrigableSqFt: { type: Type.NUMBER },
    propertyWidthFt: { type: Type.NUMBER },
    propertyLengthFt: { type: Type.NUMBER },
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

// Expert system instruction
const EXPERT_SYSTEM_INSTRUCTION = `You are a Certified Irrigation Designer (CID) with 25 years of experience in commercial irrigation design...`;

// Route handlers
async function handleAnalyzeSite(req, res, catalystApp) {
  try {
    const { base64Image, mimeType, projectInput } = req.body;

    if (!base64Image || !mimeType) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const genAI = await getAI(catalystApp);

    const prompt = `Analyze this drone/aerial image of a property for irrigation design.
Identify all irrigable zones (turf, beds, planters), hardscape areas, structures, and obstacles.
Return measurements in feet. Use the scale reference if visible.
Application type: ${projectInput?.applicationType || 'commercial'}
Turf type: ${projectInput?.turfType || 'bermudagrass'}`;

    const response = await genAI.models.generateContent({
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

    const parsed = JSON.parse(response.text || '{}');

    // Ensure arrays exist
    if (!parsed.turfZones) parsed.turfZones = [];
    if (!parsed.bedZones) parsed.bedZones = [];
    if (!parsed.narrowStrips) parsed.narrowStrips = [];
    if (!parsed.hardscapeBoundaries) parsed.hardscapeBoundaries = [];
    if (!parsed.structures) parsed.structures = [];
    if (!parsed.slopeIndicators) parsed.slopeIndicators = [];
    if (!parsed.treeCanopyAreas) parsed.treeCanopyAreas = [];
    if (!parsed.nearestBuildingLocation) parsed.nearestBuildingLocation = { x: 10, y: 10 };

    res.status(200).json(parsed);
  } catch (error) {
    console.error('Site analysis error:', error);
    res.status(500).json({ error: 'Site analysis failed', message: error.message });
  }
}

async function handleDesignRecommendations(req, res, catalystApp) {
  try {
    const { siteAnalysis, projectInput } = req.body;

    if (!siteAnalysis) {
      return res.status(400).json({ error: 'Missing site analysis data' });
    }

    const genAI = await getAI(catalystApp);

    const prompt = `Based on this site analysis, provide irrigation design recommendations.
Site Analysis: ${JSON.stringify(siteAnalysis)}
Application: ${projectInput?.applicationType || 'commercial'}
Water supply: ${projectInput?.waterSupplySize || 1.5}" at ${projectInput?.staticPressurePSI || 60} PSI
Soil type: ${projectInput?.soilType || 'clay'}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        systemInstruction: EXPERT_SYSTEM_INSTRUCTION,
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.status(200).json(result);
  } catch (error) {
    console.error('Design recommendations error:', error);
    res.status(500).json({ error: 'Design recommendations failed', message: error.message });
  }
}

async function handleValidateDesign(req, res, catalystApp) {
  try {
    const { designSummary } = req.body;

    if (!designSummary) {
      return res.status(400).json({ error: 'Missing design summary' });
    }

    const genAI = await getAI(catalystApp);

    const prompt = `Validate this irrigation design against professional standards.
Design Summary:
- Total zones: ${designSummary.totalZones}
- Peak demand: ${designSummary.totalGPM} GPM
- Head types: ${designSummary.headTypes?.join(', ')}
- Rain sensor: ${designSummary.hasRainSensor ? 'Yes' : 'NO'}
- Backflow: ${designSummary.hasBackflow ? 'Yes' : 'NO'}

Return: { valid: boolean, issues: string[], recommendations: string[] }`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        systemInstruction: EXPERT_SYSTEM_INSTRUCTION,
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.status(200).json({
      valid: result.valid ?? false,
      issues: result.issues ?? [],
      recommendations: result.recommendations ?? [],
    });
  } catch (error) {
    console.error('Validate design error:', error);
    res.status(500).json({ error: 'Design validation failed', message: error.message });
  }
}

// Main handler for Catalyst Advanced I/O function
export default async function handler(req, res) {
  const catalystApp = catalyst.initialize(req);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url?.split('?')[0] || '';

  try {
    switch (path) {
      case '/analyze-site':
        return handleAnalyzeSite(req, res, catalystApp);
      case '/design-recommendations':
        return handleDesignRecommendations(req, res, catalystApp);
      case '/validate-design':
        return handleValidateDesign(req, res, catalystApp);
      case '/health':
        return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      default:
        return res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
