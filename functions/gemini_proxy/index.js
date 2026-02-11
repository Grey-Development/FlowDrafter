/**
 * Zoho Catalyst Serverless Function - Gemini API Proxy
 * Securely proxies requests to Google Gemini API
 */

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI (API key from Catalyst environment variable)
let ai = null;

function getAI() {
  if (!ai) {
    // Get API key from Catalyst environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured. Please set it in Catalyst Console > Functions > gemini_proxy > Configuration > Environment Variables');
    }

    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// Expert system instruction for irrigation design
const EXPERT_SYSTEM_INSTRUCTION = `You are a Certified Irrigation Designer (CID) with 25 years of experience in commercial and residential irrigation design. You specialize in water-efficient systems that meet local codes and industry best practices.

Key expertise:
- Head selection and spacing for optimal coverage
- Hydraulic calculations and pipe sizing
- Zone design and valve placement
- Controller programming and smart irrigation
- Local water regulations and backflow requirements
- Precipitation rate matching and pressure management`;

// Route handlers
async function handleAnalyzeSite(body) {
  const { base64Image, mimeType, projectInput } = body;

  if (!base64Image || !mimeType) {
    return { status: 400, body: { error: 'Missing image data' } };
  }

  const genAI = getAI();

  const prompt = `Analyze this drone/aerial image of a property for irrigation design.

TASK: Identify all irrigable zones, hardscape areas, structures, and obstacles.

REQUIREMENTS:
1. Measure all areas in FEET (estimate from visual scale)
2. Identify turf zones with boundaries
3. Identify bed/planter zones
4. Mark hardscape (driveways, walks, patios)
5. Locate structures and trees
6. Note any slopes or drainage patterns

PROJECT CONTEXT:
- Application type: ${projectInput?.applicationType || 'commercial'}
- Turf type: ${projectInput?.turfType || 'bermudagrass'}
- Soil type: ${projectInput?.soilType || 'clay'}

Return a complete site analysis with all zone boundaries as polygon coordinates.`;

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
  if (!parsed.propertyWidthFt) parsed.propertyWidthFt = 100;
  if (!parsed.propertyLengthFt) parsed.propertyLengthFt = 100;
  if (!parsed.totalIrrigableSqFt) parsed.totalIrrigableSqFt = 5000;

  return { status: 200, body: parsed };
}

async function handleDesignRecommendations(body) {
  const { siteAnalysis, projectInput } = body;

  if (!siteAnalysis) {
    return { status: 400, body: { error: 'Missing site analysis data' } };
  }

  const genAI = getAI();

  const prompt = `Based on this site analysis, provide irrigation design recommendations.

SITE ANALYSIS:
${JSON.stringify(siteAnalysis, null, 2)}

PROJECT PARAMETERS:
- Application: ${projectInput?.applicationType || 'commercial'}
- Water supply: ${projectInput?.waterSupplySize || 1.5}" meter at ${projectInput?.staticPressurePSI || 60} PSI
- Soil type: ${projectInput?.soilType || 'clay'}
- Turf type: ${projectInput?.turfType || 'bermudagrass'}

Provide recommendations for:
1. Head types for each zone
2. Suggested zone groupings
3. Mainline and lateral sizing
4. Special considerations

Return as JSON with: headRecommendations, zoneStrategy, pipeSizing, specialNotes`;

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json',
      systemInstruction: EXPERT_SYSTEM_INSTRUCTION,
    },
  });

  const result = JSON.parse(response.text || '{}');
  return { status: 200, body: result };
}

async function handleValidateDesign(body) {
  const { designSummary } = body;

  if (!designSummary) {
    return { status: 400, body: { error: 'Missing design summary' } };
  }

  const genAI = getAI();

  const prompt = `Validate this irrigation design against professional standards and Georgia regulations.

DESIGN SUMMARY:
- Total zones: ${designSummary.totalZones}
- Peak demand: ${designSummary.totalGPM} GPM
- Head types: ${designSummary.headTypes?.join(', ') || 'unknown'}
- Mainline size: ${designSummary.mainlineSize}"
- Rain sensor: ${designSummary.hasRainSensor ? 'Yes' : 'NO - REQUIRED BY GEORGIA LAW'}
- Backflow preventer: ${designSummary.hasBackflow ? 'Yes' : 'NO - REQUIRED'}

VALIDATION CRITERIA:
1. Georgia requires rain sensors on all automatic irrigation systems
2. Backflow prevention is required per plumbing code
3. Zone GPM should not exceed 75% of available supply
4. Head types should not be mixed within zones
5. Precipitation rates should be matched

Return JSON: { valid: boolean, issues: string[], recommendations: string[] }`;

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json',
      systemInstruction: EXPERT_SYSTEM_INSTRUCTION,
    },
  });

  const result = JSON.parse(response.text || '{}');
  return {
    status: 200,
    body: {
      valid: result.valid ?? false,
      issues: result.issues ?? [],
      recommendations: result.recommendations ?? [],
    },
  };
}

// Main handler for Catalyst Advanced I/O function
export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).send();
  }

  // Get the path - Catalyst provides the path after the function name
  const url = request.url || '';
  const path = url.split('?')[0];

  console.log(`[gemini_proxy] ${request.method} ${path}`);

  try {
    // Health check
    if (path === '/health' || path === '') {
      const hasApiKey = !!process.env.GEMINI_API_KEY;
      return response.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: hasApiKey,
        message: hasApiKey ? 'Ready' : 'WARNING: GEMINI_API_KEY not configured',
      });
    }

    // Parse body for POST requests
    let body = {};
    if (request.method === 'POST') {
      body = request.body || {};
    }

    let result;

    switch (path) {
      case '/analyze-site':
        result = await handleAnalyzeSite(body);
        break;
      case '/design-recommendations':
        result = await handleDesignRecommendations(body);
        break;
      case '/validate-design':
        result = await handleValidateDesign(body);
        break;
      default:
        result = { status: 404, body: { error: `Endpoint not found: ${path}` } };
    }

    return response.status(result.status).json(result.body);
  } catch (error) {
    console.error('[gemini_proxy] Error:', error.message);

    // Check if it's an API key error
    if (error.message.includes('GEMINI_API_KEY')) {
      return response.status(500).json({
        error: 'API key not configured',
        message: 'Please set GEMINI_API_KEY in Catalyst Console > Functions > gemini_proxy > Configuration',
      });
    }

    return response.status(500).json({
      error: 'Request failed',
      message: error.message,
    });
  }
}
