import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index';
import { supabase } from './supabaseClient';
import './App.css';
import Auth from './components/Auth';
import AIAssistant from './components/AIAssistant';
import ConfirmDialog from './components/ConfirmDialog';
import TemplateSelector from './components/TemplateSelector';
import TemplateManager from './components/TemplateManager';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, noteId: null });
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  useEffect(() => {
    // 获取当前用户
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadNotes(user.id);
      }
      setLoading(false);
    };

    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadNotes(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNotes([]);
        setCurrentNote(null);
        setEditorContent('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentNote) {
      setEditorContent(currentNote.content || '');
    }
  }, [currentNote]);

  const loadNotes = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('加载笔记失败:', error);
      setNotes([]);
    }
  };

  const saveNote = async (noteId, content, title) => {
    if (!user) return;

    try {
      const noteData = {
        title: title || '无标题',
        content: content,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      let result;
      if (noteId) {
        result = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', noteId)
          .select()
          .single();
      } else {
        noteData.created_at = new Date().toISOString();
        result = await supabase
          .from('notes')
          .insert([noteData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const updatedNote = result.data;
      const updatedNotes = noteId 
        ? notes.map(note => note.id === noteId ? updatedNote : note)
        : [updatedNote, ...notes];
      
      setNotes(updatedNotes);
      if (!noteId) {
        setCurrentNote(updatedNote);
      }
    } catch (error) {
      console.error('保存笔记失败:', error);
      alert('保存失败，请重试');
    }
  };

  const createNewNote = () => {
    setShowTemplateSelector(true);
  };

  const createNoteFromTemplate = async (template) => {
    const title = template ? extractTitle(template.content) : '新笔记';
    const content = template ? template.content : '';
    await saveNote(null, content, title);
  };

  const deleteNote = async (noteId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setEditorContent('');
      }
    } catch (error) {
      console.error('删除笔记失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  const handleEditorChange = (content) => {
    setEditorContent(content);
    if (currentNote) {
      const title = extractTitle(content);
      saveNote(currentNote.id, content, title);
    }
  };

  const extractTitle = (content) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    return textContent.substring(0, 50).trim() || '无标题';
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showDeleteConfirm = (noteId) => {
    setConfirmDialog({ show: true, noteId });
  };

  const handleDeleteConfirm = () => {
    if (confirmDialog.noteId) {
      deleteNote(confirmDialog.noteId);
    }
    setConfirmDialog({ show: false, noteId: null });
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ show: false, noteId: null });
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <>
      <Auth 
        onAuth={setUser} 
        isVisible={!user}
      />
      <div className={`App ${user ? 'show' : 'hide'}`}>
        <div className="sidebar">
        <div className="sidebar-header">
          <h1>📝 智能笔记</h1>
          <div className="user-info">
            <span>{user?.email || ''}</span>
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              退出
            </button>
          </div>
          <button className="new-note-btn" onClick={createNewNote}>
            + 新建笔记
          </button>
        </div>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索笔记..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="notes-list">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
              onClick={() => setCurrentNote(note)}
            >
              <div className="note-title">{note.title}</div>
              <div className="note-preview">
                {note.content ? extractTitle(note.content) : '无内容'}
              </div>
              <div className="note-actions">
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    showDeleteConfirm(note.id);
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        {currentNote ? (
          <div className="editor-container">
            <div className="editor-header">
              <h2>{currentNote.title}</h2>
              <div className="editor-actions">
                <button
                  className="template-manager-btn"
                  onClick={() => setShowTemplateManager(true)}
                  title="模板管理"
                >
                  🛠️ 模板
                </button>
                <button
                  className="ai-toggle-btn"
                  onClick={() => setShowAI(!showAI)}
                >
                  {showAI ? '隐藏 AI' : '显示 AI'}
                </button>
              </div>
            </div>
            
            <ReactQuill
              value={editorContent}
              onChange={handleEditorChange}
              placeholder="开始写作..."
            />
            
            {showAI && (
              <AIAssistant 
                content={editorContent}
                onApply={(newContent) => {
                  setEditorContent(newContent);
                  const title = extractTitle(newContent);
                  saveNote(currentNote.id, newContent, title);
                }}
              />
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h2>欢迎使用智能笔记</h2>
            <p>选择一个笔记开始编辑，或创建一个新笔记</p>
            <div className="ai-features-preview">
              <h3>✨ AI 功能</h3>
              <ul>
                <li>智能摘要生成</li>
                <li>关键词提取</li>
                <li>写作建议</li>
                <li>内容标签</li>
                <li>主题分析</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="确认删除"
        message="确定要删除这个笔记吗？此操作无法撤销。"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={createNoteFromTemplate}
        user={user}
      />

      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        user={user}
        currentNote={currentNote}
      />
      </div>
    </>
  );
}

// 包装Redux Provider的根组件
function AppWithRedux() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default AppWithRedux;
