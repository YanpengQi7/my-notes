import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  loadAllTemplates, 
  selectAllTemplates, 
  selectTemplatesLoading, 
  selectTemplatesError,
  selectIsCacheExpired,
  selectTemplatesByCategory,
  clearError 
} from '../store/templatesSlice';
import './TemplateSelector.css';

const TemplateSelector = ({ isOpen, onClose, onSelectTemplate, user }) => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  // Redux selectors
  const allTemplates = useSelector(selectAllTemplates);
  const loading = useSelector(selectTemplatesLoading);
  const error = useSelector(selectTemplatesError);
  const isCacheExpired = useSelector(selectIsCacheExpired);
  
  // 根据分类过滤模板
  const filteredTemplates = useSelector(state => 
    selectTemplatesByCategory(state, selectedCategory, user?.id)
  );

  // 模板分类
  const categories = [
    { id: 'all', name: '全部模板', icon: '📋' },
    { id: 'study', name: '学习记录', icon: '📚' },
    { id: 'work', name: '工作事务', icon: '💼' },
    { id: 'personal', name: '个人生活', icon: '🏠' },
    { id: 'tech', name: '技术文档', icon: '💻' },
    { id: 'custom', name: '我的模板', icon: '⭐' }
  ];

  // 使用Redux加载模板
  useEffect(() => {
    if (isOpen && (allTemplates.length === 0 || isCacheExpired)) {
      console.log('Redux: 开始加载模板，缓存过期或无数据');
      dispatch(loadAllTemplates(user?.id));
    }
  }, [isOpen, dispatch, user?.id, allTemplates.length, isCacheExpired]);

  // 清除错误
  useEffect(() => {
    if (error) {
      console.error('Redux: 模板加载错误:', error);
    }
  }, [error]);

  // 重新加载模板
  const handleRetry = () => {
    dispatch(clearError());
    dispatch(loadAllTemplates(user?.id));
  };

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
                  onClick={handleRetry}
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
                      {template.is_system ? (
                        <span className="system-badge">系统</span>
                      ) : template.user_id === user?.id ? (
                        <span className="custom-badge">我的</span>
                      ) : null}
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