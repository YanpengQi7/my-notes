import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase 配置缺失！请设置 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY 环境变量。');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase }; 