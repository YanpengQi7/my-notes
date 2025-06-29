const { GoogleGenerativeAI } = require('@google/generative-ai');

// 免费的 Google Gemini API 配置
// 你可以在 https://makersuite.google.com/app/apikey 获取免费 API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

async function generateWithGemini(content, type) {
  try {
    // 调试信息
    console.log('🔍 Gemini API Key 检查:', process.env.GEMINI_API_KEY ? '已配置' : '未配置');
    console.log('🔍 API Key 长度:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    
    // 如果没有配置 API Key，使用智能备用响应
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo-key') {
      console.log('Gemini API Key 未配置，使用智能备用响应');
      return generateSmartFallback(content, type);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 根据类型构建提示词
    let prompt = '';
    switch (type) {
      case 'summary':
        prompt = `请为以下内容生成一个简洁的摘要（200字以内）：\n\n${content}`;
        break;
      case 'keywords':
        prompt = `请从以下内容中提取5-10个最重要的关键词，用逗号分隔：\n\n${content}`;
        break;
      case 'advice':
        prompt = `请分析以下内容的写作质量并提供改进建议：\n\n${content}`;
        break;
      case 'tags':
        prompt = `请为以下内容生成3-5个合适的标签：\n\n${content}`;
        break;
      case 'topics':
        prompt = `基于以下内容，建议3-5个相关的主题或研究方向：\n\n${content}`;
        break;
      default:
        prompt = content;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      response: text,
      provider: 'gemini',
      model: 'gemini-1.5-flash'
    };

  } catch (error) {
    console.error('Gemini API 错误:', error.message);
    
    // API 失败时使用智能备用响应
    return generateSmartFallback(content, type);
  }
}

function generateSmartFallback(content, type) {
  // 智能备用响应 - 基于内容分析
  const contentWords = content.split(/\s+/).length;
  const contentPreview = content.substring(0, 150);
  const chineseWords = content.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  
  const fallbackResponses = {
    summary: `📝 智能摘要（${contentWords}词）：\n\n${contentPreview}${content.length > 150 ? '...' : ''}\n\n🔍 内容特点：\n• 长度：${contentWords}词\n• 密度：${contentWords > 100 ? '内容丰富' : '简洁明了'}\n• 建议：${contentWords > 200 ? '可适当精简' : '可进一步扩展'}`,
    
    keywords: `🏷️ 关键词提取：\n${chineseWords.slice(0, 8).join(', ')}\n\n💡 补充概念：学习笔记, 知识管理, 效率工具`,
    
    advice: `✍️ 写作分析：\n• 字数统计：${contentWords}词 ${contentWords > 100 ? '(详细)' : '(简洁)'}\n• 结构建议：${contentWords > 50 ? '注意段落层次' : '可增加更多细节'}\n• 表达优化：${content.includes('？') ? '问题引导良好' : '可适当增加疑问'}\n• 可读性：${content.includes('、') ? '列举清晰' : '建议使用列举'}`,
    
    tags: `🏷️ 推荐标签：${content.length > 100 ? '详细记录' : '简要笔记'}, ${content.includes('学习') ? '学习心得' : '知识整理'}, ${content.includes('问题') ? '问题解决' : '思考总结'}`,
    
    topics: `🎯 相关主题：\n• ${content.includes('学习') ? '学习方法论' : '知识管理'}\n• ${content.includes('技术') ? '技术深度学习' : '概念理解'}\n• ${contentWords > 100 ? '复杂问题简化' : '概念深度扩展'}\n• 个人知识体系建设`
  };

  return {
    success: true,
    response: fallbackResponses[type] || '智能分析功能暂时不可用，请稍后重试。',
    provider: 'smart-fallback',
    model: 'local-analysis'
  };
}

module.exports = { generateWithGemini }; 