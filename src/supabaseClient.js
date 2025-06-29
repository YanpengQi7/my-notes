import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// 验证Supabase配置
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase配置缺失');
  console.log('请在.env文件中设置以下环境变量:');
  console.log('REACT_APP_SUPABASE_URL=your_supabase_url');
  console.log('REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error('Supabase配置缺失，请检查环境变量设置');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase }; 