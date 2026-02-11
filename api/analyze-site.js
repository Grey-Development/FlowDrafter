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

    // Extract markup data for scale and reference points
    const markup = projectInput?.imageMarkup || {};
    const scaleRef = markup.scaleReference;
    const controllerLoc = markup.controllerLocation;
    const waterSourceLoc = markup.waterSourceLocation;
    const irrigationAreas = markup.irrigationAreas || [];

    // Build scale instruction if user provided scale reference
    let scaleInstruction = '';
    if (scaleRef) {
      const p1 = scaleRef.point1;
      const p2 = scaleRef.point2;
      const distFt = scaleRef.distanceFt;
      scaleInstruction = `
CRITICAL SCALE REFERENCE (user-provided):
The user has marked two points on the image:
- Point 1: (${(p1.x * 100).toFixed(1)}%, ${(p1.y * 100).toFixed(1)}%) from top-left
- Point 2: (${(p2.x * 100).toFixed(1)}%, ${(p2.y * 100).toFixed(1)}%) from top-left
- Distance between these points: ${distFt} feet

Use this scale reference to accurately measure ALL distances and areas in the image.
Calculate the pixels-per-foot ratio from these reference points.`;
    }

    // Build user-marked locations
    let userMarkedLocations = '';
    if (controllerLoc) {
      userMarkedLocations += `
- Controller location: (${(controllerLoc.x * 100).toFixed(1)}%, ${(controllerLoc.y * 100).toFixed(1)}%) from top-left`;
    }
    if (waterSourceLoc) {
      userMarkedLocations += `
- Water source/POC location: (${(waterSourceLoc.x * 100).toFixed(1)}%, ${(waterSourceLoc.y * 100).toFixed(1)}%) from top-left`;
    }

    // Build irrigation areas if marked
    let irrigationAreasInstruction = '';
    if (irrigationAreas.length > 0) {
      irrigationAreasInstruction = `
USER-MARKED IRRIGATION AREAS (${irrigationAreas.length} area(s)):
These polygons represent areas the user wants irrigated:`;
      irrigationAreas.forEach((polygon, i) => {
        const points = polygon.map(p => `(${(p.x * 100).toFixed(1)}%, ${(p.y * 100).toFixed(1)}%)`).join(', ');
        irrigationAreasInstruction += `
  Area ${i + 1}: ${points}`;
      });
      irrigationAreasInstruction += `
Prioritize these marked areas in your zone analysis.`;
    }

    const prompt = `Analyze this drone/aerial image of a property for irrigation design.

TASK: Identify all irrigable zones, hardscape areas, structures, and obstacles.
${scaleInstruction}
${userMarkedLocations ? `
USER-MARKED REFERENCE POINTS:${userMarkedLocations}
Use these locations in your analysis - they are accurate user inputs.` : ''}
${irrigationAreasInstruction}

REQUIREMENTS:
1. Measure all areas in FEET using the scale reference provided
2. Identify turf zones with boundaries (polygon coordinates as 0-1 normalized values)
3. Identify bed/planter zones
4. Mark hardscape (driveways, walks, patios)
5. Locate structures and trees
6. Note any slopes or drainage patterns
7. Return coordinates as normalized 0-1 values (percentage of image width/height)

PROJECT CONTEXT:
- Application type: ${projectInput?.applicationType || 'commercial'}
- Turf type: ${projectInput?.turfType || 'bermudagrass'}
- Soil type: ${projectInput?.soilType || 'clay'}

Return a complete site analysis JSON with:
- totalIrrigableSqFt: total area in square feet
- propertyWidthFt: estimated width
- propertyLengthFt: estimated length
- turfZones: array of zones with id, type, shape, widthFt, lengthFt, areaFt2, centerX (0-1), centerY (0-1), boundaryPoints [{x, y}]
- bedZones: similar structure
- narrowStrips: similar structure
- hardscapeBoundaries: array with type and boundaryPoints
- structures: array with type, position {x, y}, widthFt, lengthFt
- treeCanopyAreas: array with position {x, y} and radiusFt
- waterSourceLocation: {x, y} (use user-marked if provided)
- controllerLocation: {x, y} (use user-marked if provided)
- nearestBuildingLocation: {x, y}`;

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
