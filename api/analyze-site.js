import { GoogleGenAI } from '@google/genai';

/**
 * Sanitize coordinates from Gemini response
 * - Converts percentage strings (e.g., "83.5%") to decimals (0.835)
 * - Ensures all coordinates are numbers between 0-1
 * - Handles nested objects and arrays
 */
function sanitizeCoordinates(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Convert percentage strings to decimals
    if (obj.endsWith('%')) {
      const num = parseFloat(obj.replace('%', '')) / 100;
      return isNaN(num) ? 0 : Math.max(0, Math.min(1, num));
    }
    return obj;
  }

  if (typeof obj === 'number') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeCoordinates(item));
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];

      // Special handling for x, y coordinates
      if ((key === 'x' || key === 'y') && value !== null && value !== undefined) {
        let numValue = value;

        // Handle percentage strings
        if (typeof value === 'string') {
          if (value.endsWith('%')) {
            numValue = parseFloat(value.replace('%', '')) / 100;
          } else {
            numValue = parseFloat(value);
          }
        }

        // If value is greater than 1, assume it's a percentage
        if (typeof numValue === 'number' && numValue > 1) {
          numValue = numValue / 100;
        }

        // Clamp to 0-1 range
        result[key] = isNaN(numValue) ? 0.5 : Math.max(0, Math.min(1, numValue));
      } else {
        result[key] = sanitizeCoordinates(value);
      }
    }
    return result;
  }

  return obj;
}

const EXPERT_SYSTEM_INSTRUCTION = `You are an expert CAD technician and surveyor specializing in converting aerial/drone imagery to precise 2D site plans. Your outputs must be accurate enough for construction documents.

Key expertise:
- Precise boundary tracing from aerial imagery
- Scale calculation and dimensional accuracy
- Material identification (concrete, asphalt, turf, mulch, gravel)
- Structure footprint measurement
- Tree canopy estimation`;

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

    // Calculate scale from user reference points
    let scaleInstruction = '';
    let feetPerNormalizedUnit = 100; // Default assumption

    if (scaleRef) {
      const p1 = scaleRef.point1;
      const p2 = scaleRef.point2;
      const distFt = scaleRef.distanceFt;

      // Calculate the normalized distance between the two points
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const normalizedDist = Math.sqrt(dx * dx + dy * dy);

      // This tells us how many feet per normalized unit
      if (normalizedDist > 0) {
        feetPerNormalizedUnit = distFt / normalizedDist;
      }

      scaleInstruction = `
CRITICAL - SCALE CALIBRATION:
The user has marked a known distance on the image:
- Point 1: (${(p1.x * 100).toFixed(2)}%, ${(p1.y * 100).toFixed(2)}%)
- Point 2: (${(p2.x * 100).toFixed(2)}%, ${(p2.y * 100).toFixed(2)}%)
- This distance = ${distFt} feet

CALCULATED SCALE: ${feetPerNormalizedUnit.toFixed(2)} feet per 100% of image
Use this scale to calculate ALL dimensions accurately.`;
    }

    // Build user-marked locations
    let userMarkedLocations = '';
    if (controllerLoc) {
      userMarkedLocations += `\n- Controller: (${(controllerLoc.x).toFixed(4)}, ${(controllerLoc.y).toFixed(4)})`;
    }
    if (waterSourceLoc) {
      userMarkedLocations += `\n- Water source/POC: (${(waterSourceLoc.x).toFixed(4)}, ${(waterSourceLoc.y).toFixed(4)})`;
    }

    // Build irrigation areas if marked
    let irrigationAreasInstruction = '';
    if (irrigationAreas.length > 0) {
      irrigationAreasInstruction = `\n\nUSER-MARKED IRRIGATION AREAS (${irrigationAreas.length} area(s)):`;
      irrigationAreas.forEach((polygon, i) => {
        const points = polygon.map(p => `(${p.x.toFixed(4)}, ${p.y.toFixed(4)})`).join(', ');
        irrigationAreasInstruction += `\n  Area ${i + 1}: ${points}`;
      });
    }

    const prompt = `TASK: Create a precise CAD-ready site analysis from this drone/aerial image.

You must TRACE the exact visible boundaries of every element in the image. This will be used to generate construction documents, so accuracy is critical.
${scaleInstruction}
${userMarkedLocations ? `\nUSER-MARKED REFERENCE POINTS:${userMarkedLocations}` : ''}
${irrigationAreasInstruction}

TRACING INSTRUCTIONS:
1. For each visible element (building, driveway, turf area, bed, walkway, etc.), trace its EXACT boundary
2. Use normalized coordinates as DECIMAL NUMBERS from 0.0 to 1.0 (NOT percentages, NO % symbols)
   - (0.0, 0.0) is top-left corner
   - (1.0, 1.0) is bottom-right corner
   - Example: {"x": 0.25, "y": 0.75} NOT {"x": "25%", "y": "75%"}
3. Trace boundaries with enough points to capture the actual shape (use 4+ points for rectangles, 6+ for irregular shapes)
4. Follow visible edges precisely - do not simplify or approximate
5. For turf areas, trace the actual grass/lawn edges where they meet hardscape or beds
6. For hardscape, trace where concrete/asphalt visibly ends

ELEMENTS TO IDENTIFY AND TRACE:

1. STRUCTURES (buildings, sheds, structures):
   - Trace exact footprint as polygon
   - Note the structure type

2. HARDSCAPE (driveways, sidewalks, patios, parking areas):
   - Trace exact edges of each paved surface
   - Identify material type: 'driveway', 'walkway', 'patio', 'parking'

3. TURF ZONES (lawn/grass areas):
   - Trace the exact edge where grass meets other materials
   - Each separate turf area should be its own zone

4. BED ZONES (mulched beds, planter beds, landscape beds):
   - Trace the bed boundary precisely
   - Type: 'bed', 'planter', or 'tree-ring'

5. TREES:
   - Mark center position
   - Estimate canopy radius in feet using the scale

6. NARROW STRIPS (grass strips between sidewalk and curb, etc.):
   - Trace boundaries of narrow landscaped areas

PROJECT CONTEXT:
- Application: ${projectInput?.applicationType || 'commercial'}
- Turf type: ${projectInput?.turfType || 'bermudagrass'}
- Soil: ${projectInput?.soilType || 'clay'}

RESPONSE FORMAT (JSON):
{
  "propertyWidthFt": <calculated from scale>,
  "propertyLengthFt": <calculated from scale>,
  "totalIrrigableSqFt": <sum of turf + bed areas>,

  "structures": [
    {
      "type": "building|shed|structure",
      "position": {"x": 0.0-1.0, "y": 0.0-1.0},
      "widthFt": <feet>,
      "lengthFt": <feet>,
      "boundaryPoints": [{"x": 0.0-1.0, "y": 0.0-1.0}, ...]
    }
  ],

  "hardscapeBoundaries": [
    {
      "type": "driveway|walkway|patio|parking",
      "boundaryPoints": [{"x": 0.0-1.0, "y": 0.0-1.0}, ...]
    }
  ],

  "turfZones": [
    {
      "id": "turf-1",
      "type": "turf",
      "shape": "rectangular|irregular|L-shaped",
      "areaFt2": <calculated>,
      "widthFt": <estimated>,
      "lengthFt": <estimated>,
      "centerX": 0.0-1.0,
      "centerY": 0.0-1.0,
      "exposure": "full-sun|partial-shade|full-shade",
      "boundaryPoints": [{"x": 0.0-1.0, "y": 0.0-1.0}, ...]
    }
  ],

  "bedZones": [
    {
      "id": "bed-1",
      "type": "bed|planter|tree-ring",
      "areaFt2": <calculated>,
      "centerX": 0.0-1.0,
      "centerY": 0.0-1.0,
      "boundaryPoints": [{"x": 0.0-1.0, "y": 0.0-1.0}, ...]
    }
  ],

  "narrowStrips": [
    {
      "id": "strip-1",
      "widthFt": <feet>,
      "lengthFt": <feet>,
      "areaFt2": <calculated>,
      "centerX": 0.0-1.0,
      "centerY": 0.0-1.0,
      "boundaryPoints": [{"x": 0.0-1.0, "y": 0.0-1.0}, ...]
    }
  ],

  "treeCanopyAreas": [
    {
      "position": {"x": 0.0-1.0, "y": 0.0-1.0},
      "radiusFt": <feet>
    }
  ],

  "waterSourceLocation": {"x": 0.0-1.0, "y": 0.0-1.0} or null,
  "controllerLocation": {"x": 0.0-1.0, "y": 0.0-1.0} or null,
  "nearestBuildingLocation": {"x": 0.0-1.0, "y": 0.0-1.0}
}

CRITICAL: All boundaryPoints must trace the ACTUAL visible edges. Do not use simplified rectangles for irregular shapes. Accuracy is paramount.`;

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

    // Clean up response text - remove any markdown code fences and fix common issues
    let responseText = response.text || '{}';

    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    // Try to extract JSON if there's extra text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Response text (first 500 chars):', responseText.substring(0, 500));
      // Return a minimal valid response
      parsed = {
        propertyWidthFt: feetPerNormalizedUnit || 100,
        propertyLengthFt: feetPerNormalizedUnit || 100,
        totalIrrigableSqFt: 5000,
        turfZones: [],
        bedZones: [],
        narrowStrips: [],
        hardscapeBoundaries: [],
        structures: [],
        treeCanopyAreas: [],
      };
    }

    // Sanitize all coordinates - convert percentages to decimals
    parsed = sanitizeCoordinates(parsed);

    // Calculate property dimensions from scale if not provided
    if (scaleRef && feetPerNormalizedUnit) {
      // Image is 1.0 normalized units wide and tall
      // Adjust for aspect ratio if needed - assume square for now
      if (!parsed.propertyWidthFt || parsed.propertyWidthFt < 10) {
        parsed.propertyWidthFt = feetPerNormalizedUnit;
      }
      if (!parsed.propertyLengthFt || parsed.propertyLengthFt < 10) {
        parsed.propertyLengthFt = feetPerNormalizedUnit;
      }
    }

    // Use user-marked locations if provided
    if (controllerLoc) {
      parsed.controllerLocation = { x: controllerLoc.x, y: controllerLoc.y };
    }
    if (waterSourceLoc) {
      parsed.waterSourceLocation = { x: waterSourceLoc.x, y: waterSourceLoc.y };
    }

    // Ensure arrays exist with defaults
    if (!parsed.turfZones) parsed.turfZones = [];
    if (!parsed.bedZones) parsed.bedZones = [];
    if (!parsed.narrowStrips) parsed.narrowStrips = [];
    if (!parsed.hardscapeBoundaries) parsed.hardscapeBoundaries = [];
    if (!parsed.structures) parsed.structures = [];
    if (!parsed.slopeIndicators) parsed.slopeIndicators = [];
    if (!parsed.treeCanopyAreas) parsed.treeCanopyAreas = [];
    if (!parsed.nearestBuildingLocation) parsed.nearestBuildingLocation = { x: 0.5, y: 0.5 };
    if (!parsed.propertyWidthFt) parsed.propertyWidthFt = 100;
    if (!parsed.propertyLengthFt) parsed.propertyLengthFt = 100;
    if (!parsed.totalIrrigableSqFt) parsed.totalIrrigableSqFt = 5000;

    // Store the scale factor for downstream use
    parsed._scaleInfo = {
      feetPerNormalizedUnit,
      hasUserScale: !!scaleRef,
    };

    res.status(200).json(parsed);
  } catch (error) {
    console.error('Site analysis error:', error);
    res.status(500).json({ error: 'Site analysis failed', message: error.message });
  }
}
