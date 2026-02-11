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
    const { designSummary } = req.body;

    if (!designSummary) {
      return res.status(400).json({ error: 'Missing design summary' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContent({
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
