import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  createTemplate, 
  deleteTemplate as deleteTemplateAction, 
  loadUserTemplates,
  selectUserTemplates, 
  selectTemplatesLoading
} from '../store/templatesSlice';
import './TemplateManager.css';

const TemplateManager = ({ isOpen, onClose, user, currentNote }) => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom',
    icon: '📝'
  });

  // Redux selectors
  const userTemplates = useSelector(selectUserTemplates);
  const loading = useSelector(selectTemplatesLoading);

  // 图标选项
  const iconOptions = [
    '📝', '📚', '💼', '🏠', '💻', '📊', '🎯', '💡',
    '🔬', '🎨', '📋', '📌', '⭐', '🚀', '🔥', '💎'
  ];

  // 分类选项
  const categories = [
    { id: 'study', name: '学习记录', icon: '📚' },
    { id: 'work', name: '工作事务', icon: '💼' },
    { id: 'personal', name: '个人生活', icon: '🏠' },
    { id: 'tech', name: '技术文档', icon: '💻' },
    { id: 'custom', name: '自定义', icon: '⭐' }
  ];

  // 使用Redux加载用户模板
  useEffect(() => {
    if (isOpen && user) {
      console.log('TemplateManager Redux: 开始加载用户模板，用户ID:', user.id);
      dispatch(loadUserTemplates(user.id));
    }
  }, [isOpen, user, dispatch]);

  const saveAsTemplate = async () => {
    if (!currentNote || !newTemplate.name.trim()) {
      alert('请输入模板名称');
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim(),
        content: currentNote.content,
        category: newTemplate.category,
        icon: newTemplate.icon,
        user_id: user.id,
        is_public: false,
        is_system: false
      };

      const result = await dispatch(createTemplate(templateData));
      
      if (result.type === 'templates/create/fulfilled') {
        alert('模板保存成功！');
        setNewTemplate({
          name: '',
          description: '',
          category: 'custom',
          icon: '📝'
        });
      } else {
        throw new Error('保存模板失败');
      }
    } catch (error) {
      console.error('保存模板失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('确定要删除这个模板吗？')) return;

    try {
      const result = await dispatch(deleteTemplateAction({ templateId, userId: user.id }));
      
      if (result.type === 'templates/delete/fulfilled') {
        alert('模板删除成功！');
      } else {
        throw new Error('删除模板失败');
      }
    } catch (error) {
      console.error('删除模板失败:', error);
      alert('删除失败，请重试');
    }
  };

  const extractTitle = (content) => {
    if (!content) return '模板内容';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    return textContent.substring(0, 100).trim() || '模板内容';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="template-manager-overlay" onClick={onClose} />
      <div className="template-manager">
        <div className="template-manager-header">
          <h2>🛠️ 模板管理</h2>
          <button className="template-manager-close" onClick={onClose}>✕</button>
        </div>

        <div className="template-manager-content">
          {/* 保存当前笔记为模板 */}
          {currentNote ? (
            <div className="save-template-section">
              <h3>📝 保存当前笔记为模板</h3>
              <div className="template-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>模板名称</label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="输入模板名称..."
                    />
                  </div>
                  <div className="form-group icon-group">
                    <label>图标</label>
                    <div className="icon-selector">
                      {iconOptions.map(icon => (
                        <button
                          key={icon}
                          className={`icon-option ${newTemplate.icon === icon ? 'selected' : ''}`}
                          onClick={() => setNewTemplate(prev => ({ ...prev, icon }))}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>分类</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>描述</label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述这个模板的用途..."
                    rows={3}
                  />
                </div>

                <button 
                  className="save-template-btn"
                  onClick={saveAsTemplate}
                  disabled={saving || !newTemplate.name.trim()}
                >
                  {saving ? '保存中...' : '💾 保存为模板'}
                </button>
              </div>
            </div>
          ) : (
            <div className="no-current-note">
              <div className="no-current-note-icon">📝</div>
              <h3>没有当前笔记</h3>
              <p>请先选择或创建一个笔记，然后就可以将其保存为模板了。</p>
            </div>
          )}

          {/* 我的模板列表 */}
          <div className="my-templates-section">
            <h3>⭐ 我的模板</h3>
            {loading ? (
              <div className="loading-templates">
                <div className="loading-spinner"></div>
                <p>加载模板中...</p>
              </div>
            ) : userTemplates.length === 0 ? (
              <div className="no-templates">
                <div className="no-templates-icon">📝</div>
                <p>还没有自定义模板</p>
                <p>将当前笔记保存为模板，便于重复使用</p>
              </div>
            ) : (
              <div className="templates-grid">
                {userTemplates.map(template => (
                  <div key={template.id} className="template-item">
                    <div className="template-item-header">
                      <div className="template-icon">{template.icon || '📝'}</div>
                      <div className="template-meta">
                        <h4>{template.name}</h4>
                        <p className="template-category">
                          {categories.find(cat => cat.id === template.category)?.name || '自定义'}
                        </p>
                      </div>
                      <button
                        className="delete-template-btn"
                        onClick={() => handleDeleteTemplate(template.id)}
                        title="删除模板"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="template-item-content">
                      <p className="template-preview">
                        {extractTitle(template.content)}
                      </p>
                      {template.description && (
                        <p className="template-desc">{template.description}</p>
                      )}
                      <p className="template-date">
                        创建于: {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateManager; 