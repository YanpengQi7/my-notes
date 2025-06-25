# 我的笔记应用

一个功能完整的 React 笔记应用，支持用户登录、富文本编辑、代码编辑、图片上传等功能。

## 功能特性

- 🔐 用户认证（邮箱密码 + Google OAuth）
- 📝 富文本编辑器（支持格式化、列表、链接等）
- 💻 代码编辑器（支持多种编程语言，语法高亮）
- 🖼️ 图片上传（支持拖拽上传到 Supabase Storage）
- 🔍 实时搜索笔记
- 💾 自动保存到 Supabase 数据库
- 📱 响应式设计，支持移动端
- 🎨 现代化 UI 设计
- ⚡ 实时数据同步

## 技术栈

- React 19
- Supabase (数据库、认证、存储)
- React Quill (富文本编辑器)
- React Syntax Highlighter (代码语法高亮)
- CSS3 (样式和响应式设计)

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd my-notes
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建一个新项目
2. 在项目设置中获取 URL 和匿名密钥
3. 在项目根目录创建 `.env` 文件：

```env
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. 创建数据库表

在 Supabase SQL 编辑器中运行以下 SQL：

```sql
-- 创建笔记表
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '新笔记',
  content TEXT DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的笔记
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. 配置 Storage

1. 在 Supabase 控制台中，进入 Storage 页面
2. 创建一个名为 `notes-images` 的 bucket
3. 设置 bucket 为公开访问
4. 在 Storage 策略中添加以下策略：

```sql
-- 允许认证用户上传图片
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'notes-images' AND 
    auth.role() = 'authenticated'
  );

-- 允许所有人查看图片
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'notes-images');
```

### 6. 配置认证

1. 在 Supabase 控制台中，进入 Authentication > Settings
2. 启用邮箱确认（可选）
3. 配置 Google OAuth（可选）：
   - 在 Google Cloud Console 创建 OAuth 2.0 客户端
   - 在 Supabase 中添加 Google 提供商
   - 设置重定向 URL

### 7. 启动应用

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

## 使用说明

### 用户认证
1. **注册/登录**: 使用邮箱密码或 Google 账号登录
2. **退出登录**: 点击侧边栏的"退出"按钮

### 笔记管理
1. **创建笔记**: 点击"新建笔记"按钮
2. **编辑笔记**: 点击侧边栏中的笔记，在右侧编辑器中修改
3. **搜索笔记**: 在搜索框中输入关键词
4. **删除笔记**: 悬停在笔记上，点击"删除"按钮

### 编辑器功能
1. **富文本模式**: 支持格式化、列表、链接、图片等
2. **代码模式**: 支持多种编程语言，语法高亮
3. **图片上传**: 在富文本模式下，可以拖拽或点击上传图片

## 项目结构

```
src/
├── App.js                    # 主应用组件
├── App.css                   # 应用样式
├── supabaseClient.js         # Supabase 客户端配置
├── components/
│   ├── Auth.js              # 登录注册组件
│   ├── Auth.css             # 认证组件样式
│   ├── CodeEditor.js        # 代码编辑器组件
│   ├── CodeEditor.css       # 代码编辑器样式
│   ├── ImageUpload.js       # 图片上传组件
│   ├── ImageUpload.css      # 图片上传样式
│   ├── ConfirmDialog.js     # 确认对话框组件
│   └── ConfirmDialog.css    # 确认对话框样式
├── index.js                 # 应用入口
└── index.css                # 全局样式
```

## 部署

### 构建生产版本

```bash
npm run build
```

### 部署到 Vercel

1. 安装 Vercel CLI: `npm i -g vercel`
2. 运行: `vercel`
3. 在 Vercel 项目设置中添加环境变量：
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

### 部署到 Netlify

1. 连接 GitHub 仓库到 Netlify
2. 构建命令: `npm run build`
3. 发布目录: `build`
4. 在环境变量中添加 Supabase 配置

## 自定义配置

### 修改编辑器工具栏

在 `App.js` 中修改 `modules.toolbar` 配置：

```javascript
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
```

### 添加新的编程语言

在 `CodeEditor.js` 中的 `languages` 数组中添加新语言：

```javascript
const languages = [
  // ... 现有语言
  { value: 'typescript', label: 'TypeScript' },
  { value: 'swift', label: 'Swift' },
];
```

### 修改样式

编辑相应的 CSS 文件来自定义应用外观。

## 故障排除

### 常见问题

1. **无法连接到 Supabase**
   - 检查环境变量是否正确设置
   - 确认 Supabase 项目是否正常运行

2. **数据库表不存在**
   - 运行上述 SQL 语句创建表
   - 检查 RLS 策略是否正确设置

3. **图片上传失败**
   - 确认 Storage bucket 已创建
   - 检查 Storage 策略是否正确设置
   - 确认 bucket 为公开访问

4. **用户认证失败**
   - 检查 Supabase 认证设置
   - 确认邮箱确认是否已启用（如果使用邮箱注册）

5. **编辑器不显示**
   - 确认已安装所有依赖
   - 检查 CSS 文件是否正确导入

### 调试技巧

1. 打开浏览器开发者工具查看控制台错误
2. 检查 Supabase 控制台中的日志
3. 确认网络请求是否正常

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
