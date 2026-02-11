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

    // Build scale context
    let scaleContext = '';
    if (projectInput?.propertyWidthFt && projectInput?.propertyLengthFt) {
      scaleContext = `PROPERTY DIMENSIONS (use these for accurate scale):
- Property Width: ${projectInput.propertyWidthFt} feet
- Property Length: ${projectInput.propertyLengthFt} feet
- Total Property Area: ${projectInput.propertyWidthFt * projectInput.propertyLengthFt} square feet

Use these dimensions to calculate all other measurements proportionally.`;
    } else if (projectInput?.scaleReferenceFt && projectInput?.scaleReferenceDescription) {
      scaleContext = `SCALE REFERENCE (use this for accurate measurements):
- The "${projectInput.scaleReferenceDescription}" in this image is ${projectInput.scaleReferenceFt} feet
- Use this known distance to calculate all other measurements proportionally`;
    }

    const prompt = `Analyze this drone/aerial image of a property for irrigation design.

${scaleContext}

TASK: Identify all irrigable zones, hardscape areas, structures, and obstacles.

REQUIREMENTS:
1. Use the scale reference provided above to measure all areas in FEET accurately
2. Identify turf zones with boundaries (as polygon coordinates)
3. Identify bed/planter zones
4. Mark hardscape (driveways, walks, patios)
5. Locate structures and trees with their positions
6. Note any slopes or drainage patterns
7. Return propertyWidthFt and propertyLengthFt based on the scale

PROJECT CONTEXT:
- Application type: ${projectInput?.applicationType || 'commercial'}
- Turf type: ${projectInput?.turfType || 'bermudagrass'}
- Soil type: ${projectInput?.soilType || 'clay'}

Return a complete site analysis JSON with:
- propertyWidthFt, propertyLengthFt, totalIrrigableSqFt
- turfZones array with id, type, shape, widthFt, lengthFt, areaFt2, exposure, centerX, centerY, boundaryPoints
- bedZones, narrowStrips, hardscapeBoundaries, structures, treeCanopyAreas
- nearestBuildingLocation, waterSourceLocation (if visible)`;

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

    // Use provided dimensions as fallback, or defaults
    if (!parsed.propertyWidthFt) {
      parsed.propertyWidthFt = projectInput?.propertyWidthFt || 100;
    }
    if (!parsed.propertyLengthFt) {
      parsed.propertyLengthFt = projectInput?.propertyLengthFt || 100;
    }
    if (!parsed.totalIrrigableSqFt) {
      parsed.totalIrrigableSqFt = parsed.propertyWidthFt * parsed.propertyLengthFt * 0.7; // Estimate 70% irrigable
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error('Site analysis error:', error);
    res.status(500).json({ error: 'Site analysis failed', message: error.message });
  }
}
