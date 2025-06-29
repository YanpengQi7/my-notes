import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './TemplateManager.css';

const TemplateManager = ({ isOpen, onClose, user, currentNote }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom',
    icon: '📝'
  });

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

  const loadUserTemplates = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('note_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('加载模板失败:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadUserTemplates();
    }
  }, [isOpen, user, loadUserTemplates]);

  const saveAsTemplate = async () => {
    if (!currentNote || !newTemplate.name.trim()) {
      alert('请输入模板名称');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('note_templates')
        .insert([{
          name: newTemplate.name.trim(),
          description: newTemplate.description.trim(),
          content: currentNote.content,
          category: newTemplate.category,
          icon: newTemplate.icon,
          user_id: user.id,
          is_public: false,
          is_system: false
        }]);

      if (error) throw error;
      
      alert('模板保存成功！');
      setNewTemplate({
        name: '',
        description: '',
        category: 'custom',
        icon: '📝'
      });
      loadUserTemplates();
    } catch (error) {
      console.error('保存模板失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!window.confirm('确定要删除这个模板吗？')) return;

    try {
      const { error } = await supabase
        .from('note_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      alert('模板删除成功！');
      loadUserTemplates();
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
          {currentNote && (
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
          )}

          {/* 我的模板列表 */}
          <div className="my-templates-section">
            <h3>⭐ 我的模板</h3>
            {loading ? (
              <div className="loading-templates">
                <div className="loading-spinner"></div>
                <p>加载模板中...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="no-templates">
                <div className="no-templates-icon">📝</div>
                <p>还没有自定义模板</p>
                <p>将当前笔记保存为模板，便于重复使用</p>
              </div>
            ) : (
              <div className="templates-grid">
                {templates.map(template => (
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
                        onClick={() => deleteTemplate(template.id)}
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