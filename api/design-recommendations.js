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
    const { siteAnalysis, projectInput } = req.body;

    if (!siteAnalysis) {
      return res.status(400).json({ error: 'Missing site analysis data' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContent({
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
