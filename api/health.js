export default function handler(req, res) {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: hasApiKey,
    message: hasApiKey ? 'Ready' : 'WARNING: GEMINI_API_KEY not configured',
  });
}
