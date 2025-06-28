import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'demo-key';

// 检查是否为演示模式
const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || !supabaseUrl || supabaseUrl === 'your_supabase_url_here';

if (!isDemoMode && (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here')) {
  console.warn('Supabase 配置缺失！将使用演示模式。请设置 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY 环境变量。');
}

// 创建Supabase客户端（在演示模式下使用虚拟配置）
const supabase = isDemoMode 
  ? null 
  : createClient(supabaseUrl, supabaseKey);

export { supabase, isDemoMode }; 