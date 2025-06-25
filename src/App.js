import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Auth from './components/Auth';
import ConfirmDialog from './components/ConfirmDialog';
import DemoNotice from './components/DemoNotice';
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
  const quillRef = useRef(null);

  // 检查是否为演示模式
  const isDemoMode = process.env.REACT_APP_SUPABASE_URL === 'your-supabase-project-url';

  // 获取用户笔记
  const fetchNotes = useCallback(async () => {
    if (!user) return;
    
    try {
      // 检查是否为演示模式
      if (process.env.REACT_APP_SUPABASE_URL === 'your-supabase-project-url') {
        // 演示模式：从本地存储加载
        const localNotes = JSON.parse(localStorage.getItem('demo-notes') || '[]');
        setNotes(localNotes);
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('获取笔记失败:', error);
    }
  }, [user]);

  // 监听用户状态
  useEffect(() => {
    // 检查是否为演示模式
    if (process.env.REACT_APP_SUPABASE_URL === 'your-supabase-project-url') {
      // 演示模式：检查本地存储中是否有用户信息
      const demoUser = localStorage.getItem('demo-user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        setLoading(false);
        return;
      }
      setLoading(false);
      return;
    }

    // 获取当前用户
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // 直接调用 fetchNotes，不依赖它
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
  }, []); // 移除 fetchNotes 依赖

  // 切换笔记时同步内容
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setEditorContent(currentNote ? currentNote.content || '' : '');
  }, [currentNote?.id]);

  // 创建新笔记
  const createNote = async () => {
    if (!user) return;
    
    try {
      const newNote = {
        id: Date.now().toString(), // 使用时间戳作为临时ID
        title: '新笔记',
        content: '',
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 检查是否为演示模式
      if (process.env.REACT_APP_SUPABASE_URL === 'your-supabase-project-url') {
        // 演示模式：使用本地存储
        const localNotes = JSON.parse(localStorage.getItem('demo-notes') || '[]');
        localNotes.unshift(newNote);
        localStorage.setItem('demo-notes', JSON.stringify(localNotes));
        setNotes([newNote, ...notes]);
        setCurrentNote(newNote);
        return;
      }

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
  };

  // 更新笔记
  const updateNote = async (id, updates) => {
    try {
      // 检查是否为演示模式
      if (process.env.REACT_APP_SUPABASE_URL === 'your-supabase-project-url') {
        // 演示模式：使用本地存储
        const localNotes = JSON.parse(localStorage.getItem('demo-notes') || '[]');
        const updatedNotes = localNotes.map(note => 
          note.id === id ? { ...note, ...updates, updated_at: new Date().toISOString() } : note
        );
        localStorage.setItem('demo-notes', JSON.stringify(updatedNotes));
        setNotes(notes.map(note => 
          note.id === id ? { ...note, ...updates } : note
        ));
        return;
      }

      const { error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setNotes(notes.map(note => 
        note.id === id ? { ...note, ...updates } : note
      ));
    } catch (error) {
      console.error('更新笔记失败:', error);
    }
  };

  // 删除笔记
  const deleteNote = async (id) => {
    try {
      // 检查是否为演示模式
      if (process.env.REACT_APP_SUPABASE_URL === 'your-supabase-project-url') {
        // 演示模式：使用本地存储
        const localNotes = JSON.parse(localStorage.getItem('demo-notes') || '[]');
        const filteredNotes = localNotes.filter(note => note.id !== id);
        localStorage.setItem('demo-notes', JSON.stringify(filteredNotes));
        setNotes(notes.filter(note => note.id !== id));
        if (currentNote && currentNote.id === id) {
          setCurrentNote(null);
        }
        return;
      }

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
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      // 检查是否为演示模式
      if (process.env.REACT_APP_SUPABASE_URL === 'your-supabase-project-url') {
        // 演示模式：清除本地存储
        localStorage.removeItem('demo-user');
        localStorage.removeItem('demo-notes');
        setUser(null);
        setNotes([]);
        setCurrentNote(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 过滤笔记
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!user) {
    return <Auth onAuthSuccess={(user) => {
      // 检查是否为演示模式
      if (process.env.REACT_APP_SUPABASE_URL === 'your-supabase-project-url') {
        // 演示模式：保存用户信息到本地存储
        localStorage.setItem('demo-user', JSON.stringify(user));
        setUser(user);
      }
    }} />;
  }

  return (
    <div className="App">
      {isDemoMode && <DemoNotice />}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>我的笔记</h1>
          <div className="user-info">
            <span>{user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              退出
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
            <h2>欢迎使用笔记应用</h2>
            <p>点击"新建笔记"开始记录你的想法</p>
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
