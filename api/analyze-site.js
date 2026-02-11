import { GoogleGenAI } from '@google/genai';

const EXPERT_SYSTEM_INSTRUCTION = `You are a Certified Irrigation Designer (CID) with 25 years of experience in commercial and residential irrigation design. You specialize in water-efficient systems that meet local codes and industry best practices.

Key expertise:
- Head selection and spacing for optimal coverage
- Hydraulic calculations and pipe sizing
- Zone design and valve placement
- Controller programming and smart irrigation
- Local water regulations and backflow requirements
- Precipitation rate matching and pressure management`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Image, mimeType, projectInput } = req.body;

    if (!base64Image || !mimeType) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    res.status(200).json(parsed);
  } catch (error) {
    console.error('Site analysis error:', error);
    res.status(500).json({ error: 'Site analysis failed', message: error.message });
  }
}
