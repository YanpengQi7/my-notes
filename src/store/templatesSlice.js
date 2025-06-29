import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../supabaseClient';

// 异步action：加载所有模板
export const loadAllTemplates = createAsyncThunk(
  'templates/loadAll',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Redux: 开始加载所有模板，用户ID:', userId || '未登录');
      
      // 查询所有模板
      const { data, error } = await supabase
        .from('note_templates')
        .select('*')
        .order('is_system', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Redux: 查询模板失败:', error);
        return rejectWithValue(error.message);
      }

      console.log('Redux: 成功加载模板，数量:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Redux: 加载模板异常:', error);
      return rejectWithValue(error.message);
    }
  }
);

// 异步action：加载用户模板
export const loadUserTemplates = createAsyncThunk(
  'templates/loadUser',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) return [];

      console.log('Redux: 开始加载用户模板，用户ID:', userId);
      
      const { data, error } = await supabase
        .from('note_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Redux: 查询用户模板失败:', error);
        return rejectWithValue(error.message);
      }

      console.log('Redux: 成功加载用户模板，数量:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Redux: 加载用户模板异常:', error);
      return rejectWithValue(error.message);
    }
  }
);

// 异步action：创建模板
export const createTemplate = createAsyncThunk(
  'templates/create',
  async (templateData, { rejectWithValue }) => {
    try {
      const { error, data } = await supabase
        .from('note_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error('Redux: 创建模板失败:', error);
        return rejectWithValue(error.message);
      }

      console.log('Redux: 成功创建模板:', data);
      return data;
    } catch (error) {
      console.error('Redux: 创建模板异常:', error);
      return rejectWithValue(error.message);
    }
  }
);

// 异步action：删除模板
export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  async ({ templateId, userId }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('note_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', userId);

      if (error) {
        console.error('Redux: 删除模板失败:', error);
        return rejectWithValue(error.message);
      }

      console.log('Redux: 成功删除模板:', templateId);
      return templateId;
    } catch (error) {
      console.error('Redux: 删除模板异常:', error);
      return rejectWithValue(error.message);
    }
  }
);

const templatesSlice = createSlice({
  name: 'templates',
  initialState: {
    allTemplates: [],
    userTemplates: [],
    loading: false,
    error: null,
    lastUpdated: null,
    cacheTimeout: 5 * 60 * 1000, // 5分钟缓存
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCache: (state) => {
      state.allTemplates = [];
      state.userTemplates = [];
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadAllTemplates
      .addCase(loadAllTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAllTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.allTemplates = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(loadAllTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // loadUserTemplates  
      .addCase(loadUserTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.userTemplates = action.payload;
      })
      .addCase(loadUserTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createTemplate
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.userTemplates.unshift(action.payload);
        // 如果是系统模板，也添加到所有模板中
        if (action.payload.is_system || action.payload.is_public) {
          state.allTemplates.unshift(action.payload);
        }
      })
      // deleteTemplate
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        const templateId = action.payload;
        state.userTemplates = state.userTemplates.filter(t => t.id !== templateId);
        state.allTemplates = state.allTemplates.filter(t => t.id !== templateId);
      });
  },
});

export const { clearError, clearCache } = templatesSlice.actions;

// 选择器
export const selectAllTemplates = (state) => state.templates.allTemplates;
export const selectUserTemplates = (state) => state.templates.userTemplates;
export const selectTemplatesLoading = (state) => state.templates.loading;
export const selectTemplatesError = (state) => state.templates.error;
export const selectLastUpdated = (state) => state.templates.lastUpdated;
export const selectCacheTimeout = (state) => state.templates.cacheTimeout;

// 检查缓存是否过期
export const selectIsCacheExpired = (state) => {
  const { lastUpdated, cacheTimeout } = state.templates;
  if (!lastUpdated) return true;
  return Date.now() - lastUpdated > cacheTimeout;
};

// 根据分类过滤模板
export const selectTemplatesByCategory = (state, category, userId) => {
  const templates = state.templates.allTemplates;
  
  if (category === 'all') return templates;
  if (category === 'custom') return templates.filter(t => t.user_id === userId);
  return templates.filter(t => t.category === category);
};

export default templatesSlice.reducer; 