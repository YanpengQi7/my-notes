const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 条件初始化OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// AI API 路由 (OpenAI)
app.post('/api/ai', async (req, res) => {
  if (!openai) {
    return res.status(400).json({ 
      error: 'OpenAI API 未配置，请使用 Hugging Face 服务或配置 OpenAI API 密钥' 
    });
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
    console.error('OpenAI API 错误:', error);
    
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
});

// 免费AI API 路由 (Hugging Face)
app.post('/api/ai-huggingface', async (req, res) => {
  try {
    const { prompt, content, type } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    // 使用 Hugging Face Inference API - 使用更可靠的模型
    const modelUrl = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
    
    console.log('发送请求到:', modelUrl);
    console.log('请求内容:', content);
    console.log('API密钥:', process.env.HUGGINGFACE_API_KEY ? '已配置' : '未配置');
    
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: content,
        parameters: {
          max_length: 200,
          min_length: 50,
          do_sample: false
        }
      })
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API 错误: ${response.status} - ${response.statusText}`);
      console.error('错误详情:', errorText);
      throw new Error(`Hugging Face API 错误: ${response.status}`);
    }

    const data = await response.json();
    console.log('API响应数据:', JSON.stringify(data, null, 2));
    
    let aiResponse = '';

    // 处理响应
    if (Array.isArray(data) && data.length > 0) {
      aiResponse = data[0].summary_text || data[0].generated_text || '无法生成响应';
    } else if (typeof data === 'string') {
      aiResponse = data;
    } else {
      aiResponse = 'AI 响应格式异常';
    }

    res.status(200).json({
      response: aiResponse,
      type: type,
      provider: 'huggingface',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hugging Face API 错误:', error);
    
    // 提供备用响应
    const fallbackResponses = {
      summary: '这是一个基于内容的摘要。由于AI服务暂时不可用，建议手动总结主要观点。',
      keywords: '关键词提取功能暂时不可用，请手动识别重要概念。',
      advice: '写作建议功能暂时不可用，建议检查语法和结构。',
      tags: '标签生成功能暂时不可用，请手动添加标签。',
      topics: '主题推荐功能暂时不可用，请根据内容自行扩展。'
    };

    res.status(200).json({
      response: fallbackResponses[req.body.type] || 'AI服务暂时不可用，请稍后重试。',
      type: req.body.type,
      provider: 'fallback',
      timestamp: new Date().toISOString()
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      huggingface: !!process.env.HUGGINGFACE_API_KEY
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 AI 服务器运行在端口 ${port}`);
  console.log(`📝 OpenAI API 端点: http://localhost:${port}/api/ai ${process.env.OPENAI_API_KEY ? '(已配置)' : '(未配置)'}`);
  console.log(`🆓 Hugging Face API 端点: http://localhost:${port}/api/ai-huggingface ${process.env.HUGGINGFACE_API_KEY ? '(已配置)' : '(未配置)'}`);
  console.log(`💡 健康检查: http://localhost:${port}/api/health`);
}); 