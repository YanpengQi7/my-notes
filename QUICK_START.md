# 🚀 快速启动指南

## ✅ 当前状态
你的笔记本应用已经成功启动并运行在 **http://localhost:3000**

## 🎯 演示模式
由于还没有配置 Supabase，应用现在运行在**演示模式**下：
- ✅ 所有功能都可以正常使用
- ✅ 数据保存在浏览器本地存储中
- ✅ 无需配置数据库即可体验

## 🔧 如何配置 Supabase（可选）

如果你想使用完整的云存储功能，请按以下步骤配置：

### 1. 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 点击 "New Project"
3. 填写项目信息并创建

### 2. 获取配置信息
1. 在项目仪表板中，进入 Settings > API
2. 复制以下信息：
   - Project URL
   - anon public key

### 3. 更新环境变量
编辑 `.env.local` 文件，替换为你的实际配置：
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 4. 创建数据库表
在 Supabase SQL 编辑器中运行：
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '新笔记',
  content TEXT DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. 重启应用
```bash
npm start
```

## 🎉 现在你可以：

### 在演示模式下：
- ✅ 注册/登录（任意邮箱）
- ✅ 创建和编辑笔记
- ✅ 使用富文本编辑器
- ✅ 使用代码编辑器
- ✅ 搜索笔记
- ✅ 删除笔记

### 配置 Supabase 后：
- ✅ 真实的用户认证
- ✅ 云存储数据
- ✅ 图片上传功能
- ✅ 多设备同步

## 📱 功能说明

### 编辑器模式
- **富文本模式**：支持格式化、列表、链接、图片等
- **代码模式**：支持多种编程语言，语法高亮

### 笔记管理
- 实时搜索
- 自动保存
- 删除确认

### 用户界面
- 响应式设计
- 现代化 UI
- 流畅交互

## 🔍 故障排除

### 应用无法启动
```bash
# 重新安装依赖
npm install --legacy-peer-deps

# 启动应用
npm start
```

### 功能异常
- 检查浏览器控制台错误
- 清除浏览器缓存
- 重新加载页面

## 📞 获取帮助
如果遇到问题，可以：
1. 查看浏览器控制台错误信息
2. 检查 `setup.md` 文件中的详细设置指南
3. 查看 Supabase 官方文档

---

**🎯 现在就去体验你的笔记本应用吧！**
访问：http://localhost:3000 