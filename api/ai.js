// AI API 服务
// 需要安装: npm install openai

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'summary':
        systemPrompt = '你是一个专业的文本摘要助手。请为用户提供简洁、准确的摘要，突出主要观点和关键信息。';
        userPrompt = `请为以下内容生成一个简洁的摘要（200字以内），突出主要观点和关键信息：\n\n${content}`;
        break;
      
      case 'keywords':
        systemPrompt = '你是一个关键词提取专家。请从文本中提取最重要的关键词或短语。';
        userPrompt = `请从以下内容中提取5-10个最重要的关键词或短语，用逗号分隔：\n\n${content}`;
        break;
      
      case 'advice':
        systemPrompt = '你是一个写作顾问。请分析文本的写作质量并提供改进建议。';
        userPrompt = `请分析以下内容的写作质量，并提供具体的改进建议，包括结构、表达、逻辑等方面：\n\n${content}`;
        break;
      
      case 'tags':
        systemPrompt = '你是一个标签生成专家。请为内容生成合适的标签用于分类。';
        userPrompt = `请为以下内容生成3-5个合适的标签，用于分类和搜索：\n\n${content}`;
        break;
      
      case 'topics':
        systemPrompt = '你是一个主题推荐专家。请基于内容推荐相关的研究主题。';
        userPrompt = `基于以下内容，建议3-5个相关的主题或研究方向：\n\n${content}`;
        break;
      
      default:
        systemPrompt = '你是一个智能助手，请根据用户的需求提供帮助。';
        userPrompt = prompt || content;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    res.status(200).json({
      response: response,
      type: type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI API 错误:', error);
    
    if (error.code === 'insufficient_quota') {
      res.status(429).json({ 
        error: 'API 配额已用完，请稍后重试或联系管理员' 
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({ 
        error: 'API 密钥无效，请检查配置' 
      });
    } else {
      res.status(500).json({ 
        error: 'AI 服务暂时不可用，请稍后重试' 
      });
    }
  }
}; 