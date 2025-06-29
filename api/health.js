// 健康检查 API 端点 - Vercel格式
export default async function handler(req, res) {
  // 添加 CORS 支持
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 检查环境变量
  const envCheck = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'production'
  };

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    },
    message: 'AI 服务健康检查通过',
    endpoints: {
      test: '/api/test',
      ai: '/api/ai',
      'ai-huggingface': '/api/ai-huggingface',
      'ai-gemini': '/api/ai-gemini'
    }
  });
} 