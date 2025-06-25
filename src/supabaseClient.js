import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// 检查是否为演示模式
const isDemoMode = !supabaseUrl || !supabaseKey || 
  supabaseUrl === 'your-supabase-project-url' || 
  supabaseKey === 'your-supabase-anon-key';

if (isDemoMode) {
  console.warn('⚠️ 演示模式：Supabase 配置未设置');
  console.warn('应用将以演示模式运行，数据保存在浏览器本地存储中');
}

// 创建 Supabase 客户端
let supabase;

try {
  if (isDemoMode) {
    // 演示模式：创建一个模拟的 Supabase 客户端
    supabase = {
      auth: {
        getUser: async () => ({ data: { user: null } }),
        signInWithPassword: async () => ({ error: new Error('演示模式不支持真实认证') }),
        signUp: async () => ({ error: new Error('演示模式不支持真实认证') }),
        signInWithOAuth: async () => ({ error: new Error('演示模式不支持真实认证') }),
        signOut: async () => ({ error: new Error('演示模式不支持真实认证') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null })
          })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('演示模式') })
          })
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: new Error('演示模式') })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: new Error('演示模式') })
        })
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ error: new Error('演示模式不支持图片上传') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    };
  } else {
    // 正常模式：创建真实的 Supabase 客户端
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.error('Supabase 客户端创建失败:', error);
  // 如果创建失败，使用演示模式
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      signInWithPassword: async () => ({ error: new Error('演示模式不支持真实认证') }),
      signUp: async () => ({ error: new Error('演示模式不支持真实认证') }),
      signInWithOAuth: async () => ({ error: new Error('演示模式不支持真实认证') }),
      signOut: async () => ({ error: new Error('演示模式不支持真实认证') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: new Error('演示模式') })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: new Error('演示模式') })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: new Error('演示模式') })
      })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: new Error('演示模式不支持图片上传') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
}

export { supabase }; 