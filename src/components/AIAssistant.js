import React, { useState } from 'react';
import './AIAssistant.css';

const AIAssistant = ({ content, onApply }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiProvider, setAiProvider] = useState('gemini');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const aiTabs = [
    { id: 'summary', name: '📝 摘要', description: '智能总结文本要点' },
    { id: 'keywords', name: '🏷️ 关键词', description: '提取核心关键词' },
    { id: 'advice', name: '✍️ 建议', description: '获取实用学习建议' },
    { id: 'search', name: '🔍 搜索', description: '查询词汇含义和解释' },
    { id: 'topics', name: '🎯 主题', description: '分析内容主题' }
  ];

  const handleAIRequest = async () => {
    let requestContent = content;
    
    // 如果是搜索模式，检查搜索词
    if (activeTab === 'search') {
      if (!searchQuery || searchQuery.trim() === '') {
        alert('请输入要搜索的词汇或概念');
        return;
      }
      requestContent = searchQuery.trim();
    } else {
      // 其他模式需要笔记内容
      if (!content || content.trim() === '') {
        alert('请先输入一些内容');
        return;
      }
    }

    setLoading(true);
    setAiResponse('');

    try {
      const endpoint = aiProvider === 'openai' ? '/api/ai' : '/api/ai-gemini';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: requestContent,
          type: activeTab
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAiResponse(data.result);
      } else {
        setAiResponse(`处理失败: ${data.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('AI请求失败:', error);
      setAiResponse('AI服务暂时无法使用，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  const applyResponse = () => {
    if (aiResponse && onApply) {
      const prefix = activeTab === 'search' ? `\n\n### 🔍 ${searchQuery} 的解释\n\n` : '\n\n---\n\n';
      onApply(content + prefix + aiResponse);
      setAiResponse('');
      if (activeTab === 'search') {
        setSearchQuery('');
      }
    }
  };

  // 处理回车键搜索
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAIRequest();
    }
  };

  const currentTab = aiTabs.find(tab => tab.id === activeTab);

  return (
    <>
      {/* 侧边栏触发按钮 */}
      <button 
        className={`ai-sidebar-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI助手"
      >
        🤖
      </button>

      {/* 遮罩层 */}
      {isOpen && <div className="ai-sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* AI助手侧边栏 */}
      <div className={`ai-assistant-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="ai-assistant">
          <div className="ai-header">
            <div className="ai-header-top">
              <h3>🤖 AI 助手</h3>
              <button 
                className="ai-close-btn"
                onClick={() => setIsOpen(false)}
                title="关闭"
              >
                ✕
              </button>
            </div>
            <p>让 AI 帮你分析和改进内容</p>
            
            <div className="ai-provider-selector">
              <label>AI 引擎:</label>
              <select 
                value={aiProvider} 
                onChange={(e) => setAiProvider(e.target.value)}
                className="ai-provider-select"
              >
                <option value="gemini">🧠 Google Gemini</option>
                <option value="openai">🚀 OpenAI GPT</option>
              </select>
            </div>
          </div>
          
          <div className="ai-tabs">
            {aiTabs.map(tab => (
              <button
                key={tab.id}
                className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          
          <div className="ai-content">
            <div className="ai-section">
              {/* 搜索模式显示搜索输入框 */}
              {activeTab === 'search' && (
                <div className="search-input-section">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="输入要搜索的词汇、概念或问题..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                </div>
              )}
              
              <button 
                className="ai-action-btn"
                onClick={handleAIRequest}
                disabled={loading}
              >
                {loading ? '处理中...' : 
                 activeTab === 'search' ? '🔍 搜索解释' : 
                 `生成${currentTab?.name.replace(/.*\s/, '')}`}
              </button>
              <p className="ai-description">{currentTab?.description}</p>
            </div>
            
            {aiResponse && (
              <div className="ai-response">
                <h4>
                  {activeTab === 'search' ? `🔍 "${searchQuery}" 的解释` : 'AI 分析结果'}
                </h4>
                <div className="response-content">{aiResponse}</div>
                <div className="response-actions">
                  <button className="apply-btn" onClick={applyResponse}>
                    应用到笔记
                  </button>
                  <button className="copy-btn" onClick={() => copyToClipboard(aiResponse)}>
                    复制结果
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;