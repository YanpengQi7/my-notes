import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './TemplateSelector.css';

const TemplateSelector = ({ isOpen, onClose, onSelectTemplate, user }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  // 模板分类
  const categories = [
    { id: 'all', name: '全部模板', icon: '📋' },
    { id: 'study', name: '学习记录', icon: '📚' },
    { id: 'work', name: '工作事务', icon: '💼' },
    { id: 'personal', name: '个人生活', icon: '🏠' },
    { id: 'tech', name: '技术文档', icon: '💻' },
    { id: 'custom', name: '我的模板', icon: '⭐' }
  ];

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    console.log('开始加载模板，用户:', user?.id || '未登录');
    
    // 添加测试：简单查询所有模板
    try {
      console.log('测试：尝试查询所有模板...');
      const { data: allData, error: allError } = await supabase
        .from('note_templates')
        .select('*');
      
      console.log('所有模板查询结果:', { 
        data: allData, 
        error: allError,
        count: allData?.length || 0 
      });
      
      if (allError) {
        console.error('查询所有模板失败:', allError);
        setTemplates([]);
        return;
      }
      
      if (allData && allData.length > 0) {
        console.log('找到模板，设置到状态中');
        setTemplates(allData);
        return;
      }
      
      console.warn('数据库中没有模板数据');
      setTemplates([]);
      
    } catch (error) {
      console.error('模板加载异常:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, loadTemplates]);

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return template.user_id === user?.id;
    return template.category === selectedCategory;
  });

  const handleTemplateSelect = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const extractTitle = (content) => {
    if (!content) return '模板预览';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const h1 = tempDiv.querySelector('h1');
    return h1 ? h1.textContent : '模板预览';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="template-overlay" onClick={onClose} />
      
      {/* 模板选择器主界面 */}
      <div className="template-selector">
        <div className="template-header">
          <h2>📝 选择笔记模板</h2>
          <button className="template-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="template-content">
          {/* 分类选择 */}
          <div className="template-categories">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          {/* 模板列表 */}
          <div className="template-list">
            {loading ? (
              <div className="template-loading">
                <div className="loading-spinner"></div>
                <p>加载模板中...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="no-templates">
                <div className="no-templates-icon">📝</div>
                <h3>暂无模板</h3>
                <p>
                  {selectedCategory === 'custom' 
                    ? '你还没有创建自定义模板。创建第一个笔记后，可以将其保存为模板。'
                    : '该分类下暂无可用模板。'
                  }
                </p>
                <button 
                  className="retry-btn"
                  onClick={loadTemplates}
                >
                  🔄 重新加载
                </button>
              </div>
            ) : (
              <div className="template-grid">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="template-card">
                    <div className="template-card-header">
                      <div className="template-icon">{template.icon || '📝'}</div>
                      <div className="template-info">
                        <h3 className="template-name">{template.name}</h3>
                        <p className="template-description">{template.description}</p>
                      </div>
                      {template.is_system && (
                        <span className="system-badge">系统</span>
                      )}
                      {template.user_id === user?.id && (
                        <span className="custom-badge">我的</span>
                      )}
                    </div>
                    
                    <div className="template-actions">
                      <button 
                        className="preview-btn"
                        onClick={() => handlePreview(template)}
                      >
                        预览
                      </button>
                      <button 
                        className="use-btn"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        使用模板
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="template-footer">
          <button className="blank-note-btn" onClick={() => onSelectTemplate(null)}>
            ✨ 空白笔记
          </button>
        </div>
      </div>

      {/* 模板预览弹窗 */}
      {previewTemplate && (
        <>
          <div className="preview-overlay" onClick={closePreview} />
          <div className="template-preview">
            <div className="preview-header">
              <h3>{extractTitle(previewTemplate.content)}</h3>
              <button className="preview-close-btn" onClick={closePreview}>✕</button>
            </div>
            <div className="preview-content">
              <div 
                className="preview-html"
                dangerouslySetInnerHTML={{ __html: previewTemplate.content || '<p>暂无内容</p>' }}
              />
            </div>
            <div className="preview-footer">
              <button className="preview-use-btn" onClick={() => handleTemplateSelect(previewTemplate)}>
                使用此模板
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TemplateSelector; 