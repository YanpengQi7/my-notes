import React, { useState } from 'react';
import './AIAssistant.css';

// 工具函数：去除HTML标签
function stripHtml(html) {
  if (!html) return '';
  // 利用浏览器DOM解析，安全去除标签
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

const AIAssistant = ({ content, onApplySuggestion, onGenerateSummary, onExtractKeywords }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [aiResponse, setAiResponse] = useState('');
  const [aiProvider, setAiProvider] = useState('huggingface'); // 默认使用 Hugging Face

  // AI功能调用
  const callAI = async (prompt, content) => {
    setIsLoading(true);
    try {
      let response;
      
      // 根据环境选择API端点
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001' 
        : '';
      
      // 统一：先去除HTML标签
      const pureText = stripHtml(content);
      
      if (aiProvider === 'openai') {
        // OpenAI可以保留prompt
        response = await fetch(`${baseUrl}/api/ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            content: pureText,
            type: activeTab
          })
        });
      } else {
        // Hugging Face 只传纯文本，不拼prompt
        response = await fetch(`${baseUrl}/api/ai-huggingface`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: pureText,
            type: activeTab
          })
        });
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAiResponse(data.response);
    } catch (error) {
      console.error('AI调用失败:', error);
      
      // 演示模式响应
      const demoResponses = {
        summary: '这是一个演示摘要。在实际使用中，AI 会分析您的内容并生成准确的摘要，突出主要观点和关键信息。',
        keywords: '演示关键词, 示例标签, 测试词汇, 重要概念, 核心术语',
        advice: '这是演示写作建议。AI 会分析您的写作并提供具体的改进建议，包括结构优化、表达改进、逻辑完善等方面。',
        tags: '演示标签, 示例分类, 测试标签, 内容标签',
        topics: '相关主题1, 相关主题2, 相关主题3, 研究方向A, 研究方向B'
      };
      
      setAiResponse(demoResponses[activeTab] || 'AI 服务暂时不可用，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  // 生成摘要
  const handleGenerateSummary = () => {
    // Hugging Face 只传内容，不拼prompt
    if (aiProvider === 'huggingface') {
      callAI('', content);
    } else {
      const prompt = `请为以下内容生成一个简洁的摘要，突出主要观点和关键信息：\n\n${stripHtml(content)}`;
      callAI(prompt, content);
    }
  };

  // 提取关键词
  const handleExtractKeywords = () => {
    if (aiProvider === 'huggingface') {
      callAI('', content);
    } else {
      const prompt = `请从以下内容中提取5-10个最重要的关键词或短语，用逗号分隔：\n\n${stripHtml(content)}`;
      callAI(prompt, content);
    }
  };

  // 写作建议
  const handleWritingAdvice = () => {
    if (aiProvider === 'huggingface') {
      callAI('', content);
    } else {
      const prompt = `请分析以下内容的写作质量，并提供改进建议，包括结构、表达、逻辑等方面：\n\n${stripHtml(content)}`;
      callAI(prompt, content);
    }
  };

  // 智能标签
  const handleGenerateTags = () => {
    if (aiProvider === 'huggingface') {
      callAI('', content);
    } else {
      const prompt = `请为以下内容生成3-5个合适的标签，用于分类和搜索：\n\n${stripHtml(content)}`;
      callAI(prompt, content);
    }
  };

  // 相关主题建议
  const handleRelatedTopics = () => {
    if (aiProvider === 'huggingface') {
      callAI('', content);
    } else {
      const prompt = `基于以下内容，建议3-5个相关的主题或研究方向：\n\n${stripHtml(content)}`;
      callAI(prompt, content);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h3>🤖 AI 智能助手</h3>
        <p>让AI帮你优化笔记内容</p>
        
        {/* AI提供商选择 */}
        <div className="ai-provider-selector">
          <label>AI服务：</label>
          <select 
            value={aiProvider} 
            onChange={(e) => setAiProvider(e.target.value)}
            className="ai-provider-select"
          >
            <option value="huggingface">Hugging Face (免费)</option>
            <option value="openai">OpenAI GPT (需要API密钥)</option>
          </select>
        </div>
      </div>

      <div className="ai-tabs">
        <button 
          className={`ai-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          智能摘要
        </button>
        <button 
          className={`ai-tab ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
        >
          关键词提取
        </button>
        <button 
          className={`ai-tab ${activeTab === 'advice' ? 'active' : ''}`}
          onClick={() => setActiveTab('advice')}
        >
          写作建议
        </button>
        <button 
          className={`ai-tab ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          智能标签
        </button>
        <button 
          className={`ai-tab ${activeTab === 'topics' ? 'active' : ''}`}
          onClick={() => setActiveTab('topics')}
        >
          相关主题
        </button>
      </div>

      <div className="ai-content">
        {activeTab === 'summary' && (
          <div className="ai-section">
            <button 
              className="ai-action-btn"
              onClick={handleGenerateSummary}
              disabled={isLoading || !content}
            >
              {isLoading ? '生成中...' : '生成摘要'}
            </button>
            <p className="ai-description">自动提取内容要点，生成简洁摘要</p>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="ai-section">
            <button 
              className="ai-action-btn"
              onClick={handleExtractKeywords}
              disabled={isLoading || !content}
            >
              {isLoading ? '提取中...' : '提取关键词'}
            </button>
            <p className="ai-description">识别内容中的关键概念和重要词汇</p>
          </div>
        )}

        {activeTab === 'advice' && (
          <div className="ai-section">
            <button 
              className="ai-action-btn"
              onClick={handleWritingAdvice}
              disabled={isLoading || !content}
            >
              {isLoading ? '分析中...' : '获取写作建议'}
            </button>
            <p className="ai-description">提供内容结构、表达方式的改进建议</p>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="ai-section">
            <button 
              className="ai-action-btn"
              onClick={handleGenerateTags}
              disabled={isLoading || !content}
            >
              {isLoading ? '生成中...' : '生成标签'}
            </button>
            <p className="ai-description">自动生成合适的标签用于分类</p>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="ai-section">
            <button 
              className="ai-action-btn"
              onClick={handleRelatedTopics}
              disabled={isLoading || !content}
            >
              {isLoading ? '分析中...' : '推荐相关主题'}
            </button>
            <p className="ai-description">基于当前内容推荐相关研究方向</p>
          </div>
        )}

        {aiResponse && (
          <div className="ai-response">
            <h4>AI 分析结果：</h4>
            <div className="response-content">
              {typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse, null, 2)}
            </div>
            {/* 如果 aiResponse 是对象且有 error 字段，显示详细内容 */}
            {typeof aiResponse === 'object' && aiResponse.error && (
              <pre style={{color: 'red', background: '#fff3f3', padding: 10, borderRadius: 6, marginTop: 10}}>
                {JSON.stringify(aiResponse, null, 2)}
              </pre>
            )}
            <div className="response-actions">
              <button 
                className="apply-btn"
                onClick={() => onApplySuggestion && onApplySuggestion(typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse))}
              >
                应用到笔记
              </button>
              <button 
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse))}
              >
                复制结果
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;