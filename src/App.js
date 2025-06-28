import React, { useState, useEffect, useRef } from 'react';
import { supabase, isDemoMode } from './supabaseClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Auth from './components/Auth';
import ConfirmDialog from './components/ConfirmDialog';
import AIAssistant from './components/AIAssistant';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const quillRef = useRef(null);

  // 演示模式下的模拟用户
  const demoUser = {
    id: 'demo-user-id',
    email: 'demo@example.com',
    created_at: new Date().toISOString()
  };

  // 监听用户状态
  useEffect(() => {
    if (isDemoMode) {
      // 演示模式：直接设置模拟用户
      setUser(demoUser);
      setLoading(false);
      
      // 从本地存储加载演示笔记
      const savedNotes = localStorage.getItem('demo-notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } else {
      // 正常模式：使用Supabase认证
      const getUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
          setLoading(false);
        } catch (error) {
          console.error('获取用户失败:', error);
          setLoading(false);
        }
      };

      getUser();

      // 监听认证状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
          
          if (session?.user) {
            try {
              const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', session.user.id)
                .order('updated_at', { ascending: false });
              
              if (error) throw error;
              setNotes(data || []);
            } catch (error) {
              console.error('获取笔记失败:', error);
            }
          } else {
            setNotes([]);
            setCurrentNote(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []); // 移除 fetchNotes 依赖

  // 切换笔记时同步内容
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setEditorContent(currentNote ? currentNote.content || '' : '');
  }, [currentNote?.id]);

  // 创建新笔记
  const createNote = async () => {
    if (!user) return;
    
    const newNote = {
      id: Date.now().toString(), // 演示模式使用时间戳作为ID
      title: '新笔记',
      content: '',
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isDemoMode) {
      // 演示模式：保存到本地存储
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      setCurrentNote(newNote);
      localStorage.setItem('demo-notes', JSON.stringify(updatedNotes));
    } else {
      // 正常模式：保存到Supabase
      try {
        const { data, error } = await supabase
          .from('notes')
          .insert([newNote])
          .select()
          .single();

        if (error) throw error;
        
        setNotes([data, ...notes]);
        setCurrentNote(data);
      } catch (error) {
        console.error('创建笔记失败:', error);
      }
    }
  };

  // 更新笔记
  const updateNote = async (id, updates) => {
    const updatedNote = { ...updates, updated_at: new Date().toISOString() };
    
    if (isDemoMode) {
      // 演示模式：更新本地存储
      const updatedNotes = notes.map(note => 
        note.id === id ? { ...note, ...updatedNote } : note
      );
      setNotes(updatedNotes);
      localStorage.setItem('demo-notes', JSON.stringify(updatedNotes));
    } else {
      // 正常模式：更新Supabase
      try {
        const { error } = await supabase
          .from('notes')
          .update(updatedNote)
          .eq('id', id);

        if (error) throw error;
        
        setNotes(notes.map(note => 
          note.id === id ? { ...note, ...updatedNote } : note
        ));
      } catch (error) {
        console.error('更新笔记失败:', error);
      }
    }
  };

  // 删除笔记
  const deleteNote = async (id) => {
    if (isDemoMode) {
      // 演示模式：从本地存储删除
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem('demo-notes', JSON.stringify(updatedNotes));
      if (currentNote && currentNote.id === id) {
        setCurrentNote(null);
      }
    } else {
      // 正常模式：从Supabase删除
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setNotes(notes.filter(note => note.id !== id));
        if (currentNote && currentNote.id === id) {
          setCurrentNote(null);
        }
      } catch (error) {
        console.error('删除笔记失败:', error);
      }
    }
  };

  // 退出登录
  const handleLogout = async () => {
    if (isDemoMode) {
      // 演示模式：清除本地数据
      setUser(null);
      setNotes([]);
      setCurrentNote(null);
      localStorage.removeItem('demo-notes');
    } else {
      // 正常模式：调用Supabase登出
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('退出登录失败:', error);
      }
    }
  };

  // 过滤笔记
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 应用AI建议到笔记
  const handleApplyAISuggestion = (suggestion) => {
    if (currentNote) {
      // 将AI建议添加到笔记内容中
      const newContent = currentNote.content + '\n\n--- AI 建议 ---\n' + suggestion;
      setEditorContent(newContent);
      updateNote(currentNote.id, { content: newContent });
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div>加载中...</div>
        <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
          正在检查用户登录状态...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={(user) => {
      setUser(user);
    }} />;
  }

  return (
    <div className="App">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>我的笔记</h1>
          <div className="user-info">
            <span>{user.email}</span>
            {isDemoMode && (
              <span className="demo-badge" style={{
                background: '#ff6b6b',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                marginLeft: '8px'
              }}>
                演示模式
              </span>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              {isDemoMode ? '重置' : '退出'}
            </button>
          </div>
          <button className="new-note-btn" onClick={createNote}>
            新建笔记
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
                {note.content.replace(/<[^>]*>/g, '').substring(0, 50)}...
              </div>
              <div className="note-actions">
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteToDelete(note);
                    setShowDeleteDialog(true);
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
                  className="ai-toggle-btn"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                >
                  {showAIAssistant ? '隐藏' : '显示'} AI 助手
                </button>
              </div>
            </div>
            
            {showAIAssistant && (
              <AIAssistant 
                content={editorContent}
                onApplySuggestion={handleApplyAISuggestion}
              />
            )}
            
            <ReactQuill
              ref={quillRef}
              value={editorContent}
              onChange={setEditorContent}
              onBlur={() => {
                if (currentNote && editorContent !== currentNote.content) {
                  updateNote(currentNote.id, { content: editorContent });
                }
              }}
              placeholder="开始写笔记..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'color': [] }, { 'background': [] }],
                  ['link', 'image'],
                  ['code-block'],
                  ['clean']
                ]
              }}
            />
          </div>
        ) : (
          <div className="empty-state">
            <h2>欢迎使用智能笔记应用</h2>
            <p>点击"新建笔记"开始记录你的想法</p>
            <div className="ai-features-preview">
              <h3>🤖 AI 智能功能</h3>
              <ul>
                <li>智能摘要生成</li>
                <li>关键词自动提取</li>
                <li>写作质量分析</li>
                <li>智能标签推荐</li>
                <li>相关主题发现</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="确认删除"
        message="确定要删除这个笔记吗？此操作无法撤销。"
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete.id);
          }
          setShowDeleteDialog(false);
          setNoteToDelete(null);
        }}
        onCancel={() => {
          setShowDeleteDialog(false);
          setNoteToDelete(null);
        }}
      />
    </div>
  );
}

export default App;
