const express = require('express');
const cors = require('cors');
const path = require('path');
const { generateWithGemini } = require('./api/ai-gemini');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件托管
app.use(express.static(path.join(__dirname, 'build')));

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

    // 使用免费的公开模型 - 不需要API Key
    const models = [
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-small',
      'https://api-inference.huggingface.co/models/gpt2',
      'https://api-inference.huggingface.co/models/distilgpt2'
    ];
    
    let lastError = null;
    
    for (const modelUrl of models) {
      try {
        console.log('尝试模型:', modelUrl);
        console.log('请求内容:', content.substring(0, 100) + '...');
        
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: content,
            parameters: {
              max_length: 100,
              temperature: 0.7,
              do_sample: true
            }
          }),
          timeout: 15000 // 15秒超时，免费服务可能较慢
        });

        console.log('响应状态:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('API响应成功');
          
          let aiResponse = '';

          // 处理响应
          if (Array.isArray(data) && data.length > 0) {
            aiResponse = data[0].summary_text || data[0].generated_text || '无法生成响应';
          } else if (typeof data === 'string') {
            aiResponse = data;
          } else {
            aiResponse = 'AI 响应格式异常';
          }

          return res.status(200).json({
            response: aiResponse,
            type: type,
            provider: 'huggingface',
            model: modelUrl.split('/').pop(),
            timestamp: new Date().toISOString()
          });
        } else {
          const errorText = await response.text();
          console.error(`模型 ${modelUrl} 失败: ${response.status} - ${errorText}`);
          lastError = `模型 ${modelUrl.split('/').pop()} 失败: ${response.status}`;
        }
      } catch (error) {
        console.error(`模型 ${modelUrl} 错误:`, error.message);
        lastError = error.message;
      }
    }

    // 所有模型都失败了，使用智能备用响应
    console.log('所有模型都失败，使用备用响应');
    
    // 智能备用响应 - 基于内容长度和关键词
    const contentWords = content.split(/\s+/).length;
    const contentPreview = content.substring(0, 150);
    
    const fallbackResponses = {
      summary: `📝 内容摘要（共${contentWords}词）：\n\n${contentPreview}${content.length > 150 ? '...' : ''}\n\n🔍 主要特点：\n• 内容长度：${contentWords}词\n• 信息密度：${contentWords > 100 ? '丰富' : '简洁'}\n• 建议进一步：${contentWords > 200 ? '精简表达' : '扩展细节'}`,
      
      keywords: `🏷️ 智能关键词提取：\n${content.match(/[\u4e00-\u9fa5]{2,}/g)?.slice(0, 8).join(', ') || '内容分析, 信息处理, 知识管理'}\n\n💡 相关概念：学习笔记, 效率工具, 思维整理`,
      
      advice: `✍️ 写作分析：\n• 内容长度：${contentWords}词 ${contentWords > 100 ? '(较详细)' : '(可扩展)'}\n• 结构建议：${contentWords > 50 ? '注意段落分层' : '可增加更多细节'}\n• 表达优化：${content.includes('？') || content.includes('?') ? '问题引导良好' : '可适当增加疑问句'}\n• 可读性：${content.includes('、') || content.includes(',') ? '列举清晰' : '建议使用列举'}`,
      
      tags: `🏷️ 推荐标签：${content.length > 100 ? '详细笔记' : '简要记录'}, ${content.includes('学习') ? '学习心得' : '知识整理'}, ${content.includes('问题') ? '问题解决' : '思维梳理'}`,
      
      topics: `🎯 相关主题推荐：\n• ${content.includes('学习') ? '深度学习方法' : '知识管理系统'}\n• ${content.includes('问题') ? '问题解决框架' : '效率提升技巧'}\n• ${contentWords > 100 ? '复杂概念简化' : '概念深度扩展'}\n• 个人知识库建设`
    };

    res.status(200).json({
      response: fallbackResponses[type] || 'AI服务暂时不可用，请稍后重试。',
      type: type,
      provider: 'fallback',
      error: lastError,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hugging Face API 总体错误:', error);
    
    // 最终备用响应
    const finalFallback = {
      summary: '这是一个基于内容的智能摘要。由于AI服务暂时不可用，建议手动总结主要观点。',
      keywords: '关键词提取功能暂时不可用，请手动识别重要概念。',
      advice: '写作建议功能暂时不可用，建议检查语法和结构。',
      tags: '标签生成功能暂时不可用，请手动添加标签。',
      topics: '主题推荐功能暂时不可用，请根据内容自行扩展。'
    };

    res.status(200).json({
      response: finalFallback[req.body.type] || 'AI服务暂时不可用，请稍后重试。',
      type: req.body.type,
      provider: 'final-fallback',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 免费 Gemini AI API 路由
app.post('/api/ai-gemini', async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    console.log(`🤖 Gemini AI 请求 - 类型: ${type}, 内容: ${content.substring(0, 50)}...`);

    const result = await generateWithGemini(content, type);

    res.status(200).json({
      response: result.response,
      type: type,
      provider: result.provider,
      model: result.model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API 总体错误:', error);
    
    res.status(500).json({
      error: 'AI 服务暂时不可用，请稍后重试',
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
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

// 所有其他路由都返回 React 应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 AI 服务器运行在端口 ${port}`);
  console.log(`📝 OpenAI API 端点: http://localhost:${port}/api/ai ${process.env.OPENAI_API_KEY ? '(已配置)' : '(未配置)'}`);
  console.log(`🆓 Hugging Face API 端点: http://localhost:${port}/api/ai-huggingface ${process.env.HUGGINGFACE_API_KEY ? '(已配置)' : '(未配置)'}`);
  console.log(`🤖 Google Gemini API 端点: http://localhost:${port}/api/ai-gemini ${process.env.GEMINI_API_KEY ? '(已配置)' : '(智能备用)'}`);
  console.log(`💡 健康检查: http://localhost:${port}/api/health`);
  console.log(`🌐 前端应用: http://localhost:${port}`);
}); 