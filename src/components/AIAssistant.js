import React, { useState } from 'react';
import './AIAssistant.css';

const AIAssistant = ({ content, onApply }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiProvider, setAiProvider] = useState('gemini');

  const aiTabs = [
    { id: 'summary', name: '📝 摘要', description: '生成内容摘要' },
    { id: 'keywords', name: '🏷️ 关键词', description: '提取关键词' },
    { id: 'advice', name: '✍️ 建议', description: '写作建议' },
    { id: 'tags', name: '🏷️ 标签', description: '内容标签' },
    { id: 'topics', name: '🎯 主题', description: '主题分析' }
  ];

  const handleAIRequest = async () => {
    if (!content || content.trim() === '') {
      alert('请先输入一些内容');
      return;
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
          content: content,
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
      onApply(content + '\n\n---\n\n' + aiResponse);
      setAiResponse('');
    }
  };

  const currentTab = aiTabs.find(tab => tab.id === activeTab);

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h3>🤖 AI 助手</h3>
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
          <button 
            className="ai-action-btn"
            onClick={handleAIRequest}
            disabled={loading}
          >
            {loading ? '处理中...' : `生成${currentTab?.name.replace(/.*\s/, '')}`}
          </button>
          <p className="ai-description">{currentTab?.description}</p>
        </div>
        
        {aiResponse && (
          <div className="ai-response">
            <h4>AI 分析结果</h4>
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
  );
};

export default AIAssistant;