// Hugging Face AI API 服务（免费版本）
// 需要安装: npm install node-fetch

const fetch = require('node-fetch');

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/THUDM/chatglm2-6b';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    const { prompt, content, type } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    // 根据不同类型构建不同的提示词
    let userPrompt = '';

    switch (type) {
      case 'summary':
        userPrompt = `请为以下内容生成一个简洁的摘要（200字以内），突出主要观点和关键信息：\n\n${content}`;
        break;
      
      case 'keywords':
        userPrompt = `请从以下内容中提取5-10个最重要的关键词或短语，用逗号分隔：\n\n${content}`;
        break;
      
      case 'advice':
        userPrompt = `请分析以下内容的写作质量，并提供具体的改进建议，包括结构、表达、逻辑等方面：\n\n${content}`;
        break;
      
      case 'tags':
        userPrompt = `请为以下内容生成3-5个合适的标签，用于分类和搜索：\n\n${content}`;
        break;
      
      case 'topics':
        userPrompt = `基于以下内容，建议3-5个相关的主题或研究方向：\n\n${content}`;
        break;
      
      default:
        userPrompt = prompt || content;
    }

    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`,
      },
      body: JSON.stringify({
        inputs: userPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
        }
      })
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      data = { parse_error: true, raw };
    }

    if (!response.ok || data.error || data.detail) {
      return res.status(200).json({
        error: 'Hugging Face API 错误',
        status: response.status,
        data,
        raw,
        env: process.env.HUGGINGFACE_API_KEY ? 'env-exists' : 'env-missing',
      });
    }

    const aiResponse = Array.isArray(data) ? data[0].generated_text : data.generated_text;

    res.status(200).json({
      response: aiResponse,
      type: type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hugging Face AI API 错误:', error);
    
    // 返回演示响应
    const demoResponses = {
      summary: '这是一个演示摘要。在实际使用中，AI 会分析您的内容并生成准确的摘要。',
      keywords: '演示关键词, 示例标签, 测试词汇',
      advice: '这是演示写作建议。AI 会分析您的写作并提供具体的改进建议。',
      tags: '演示标签, 示例分类, 测试标签',
      topics: '相关主题1, 相关主题2, 相关主题3'
    };

    res.status(200).json({
      response: demoResponses[type] || 'AI 服务暂时不可用，请稍后重试。',
      type: type,
      timestamp: new Date().toISOString(),
      demo: true
    });
  }
}; 