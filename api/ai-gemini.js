const { GoogleGenerativeAI } = require('@google/generative-ai');

// Vercel Serverless 函数处理器
export default async function handler(req, res) {
  // 添加 CORS 支持
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, type } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const result = await generateWithGemini(query, type);
    res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 免费的 Google Gemini API 配置
// 你可以在 https://aistudio.google.com/ 获取免费 API Key
// 注意：在函数内动态实例化以确保环境变量正确加载

async function generateWithGemini(content, type) {
  try {
    // 如果没有配置 API Key，使用智能备用响应
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('🔄 使用智能备用系统 - 如需真正的AI响应，请配置有效的GEMINI_API_KEY');
      return generateSmartFallback(content, type);
    }

    console.log('🤖 正在调用 Google Gemini API...');
    console.log('🔑 使用的API Key:', process.env.GEMINI_API_KEY);

    // 动态实例化以确保使用最新的环境变量
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 根据类型构建提示词
    let prompt = '';
    switch (type) {
      case 'summary':
        prompt = `请为以下内容生成一个简洁的摘要（50字以内）：\n\n${content}`;
        break;
      case 'keywords':
        prompt = `请从以下内容中提取5-8个关键词，用逗号分隔：\n\n${content}`;
        break;
      case 'advice':
        prompt = `基于以下内容，给出3条实用的学习建议：\n\n${content}`;
        break;
      case 'expand':
        prompt = `请扩展以下内容，添加更多相关信息和细节：\n\n${content}`;
        break;
      default:
        prompt = `请分析以下内容并提供有用的见解：\n\n${content}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      result: text,
      source: 'Google Gemini AI',
      type: type
    };

  } catch (error) {
    console.log('Gemini API 错误:', error.message);
    // API 失败时使用智能备用响应
    return generateSmartFallback(content, type);
  }
}

// 智能备用响应函数
function generateSmartFallback(content, type) {
  
  switch (type) {
    case 'summary':
      return {
        success: true,
        result: `📝 ${content.length > 100 ? content.substring(0, 100) + '...' : content}`,
        source: '智能备用系统',
        type: 'summary'
      };
      
    case 'keywords':
      // 简单的关键词提取逻辑
      const words = content.split(/[\s，。！？；：、]+/)
        .filter(word => word.length > 1)
        .slice(0, 6);
      return {
        success: true,
        result: words.join(', '),
        source: '智能备用系统',
        type: 'keywords'
      };
      
    case 'advice':
      return {
        success: true,
        result: '1. 定期复习和总结学习内容\n2. 结合实际案例加深理解\n3. 与他人交流分享学习心得',
        source: '智能备用系统',
        type: 'advice'
      };
      
    case 'expand':
      return {
        success: true,
        result: `${content}\n\n💡 建议深入了解相关概念，通过实践加强理解，并关注最新发展动态。`,
        source: '智能备用系统',
        type: 'expand'
      };
      
    default:
      return {
        success: true,
        result: `内容分析：这是一段关于${content.substring(0, 20)}...的内容，建议进一步学习和实践。`,
        source: '智能备用系统',
        type: type
      };
  }
}