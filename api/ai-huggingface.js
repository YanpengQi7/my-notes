// Hugging Face AI API 服务（免费版本）
// 需要安装: npm install node-fetch

const fetch = require('node-fetch');

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

  const { prompt, content, type, model = 'gpt2' } = req.body;
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Hugging Face API Key 未配置' });
  }
  
  // 支持前端传递的 content 参数
  const inputText = content || prompt;
  if (!inputText) {
    return res.status(400).json({ error: '缺少内容参数' });
  }

  // 根据不同类型构建不同的提示词
  let userPrompt = '';
  switch (type) {
    case 'summary':
      userPrompt = `请为以下内容生成一个简洁的摘要（200字以内），突出主要观点和关键信息：\n\n${inputText}`;
      break;
    case 'keywords':
      userPrompt = `请从以下内容中提取5-10个最重要的关键词或短语，用逗号分隔：\n\n${inputText}`;
      break;
    case 'advice':
      userPrompt = `请分析以下内容的写作质量，并提供具体的改进建议，包括结构、表达、逻辑等方面：\n\n${inputText}`;
      break;
    case 'tags':
      userPrompt = `请为以下内容生成3-5个合适的标签，用于分类和搜索：\n\n${inputText}`;
      break;
    case 'topics':
      userPrompt = `基于以下内容，建议3-5个相关的主题或研究方向：\n\n${inputText}`;
      break;
    default:
      userPrompt = inputText;
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: userPrompt }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    // Hugging Face 返回格式兼容
    const text = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : JSON.stringify(data);
    res.status(200).json({ response: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 