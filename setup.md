# 笔记本应用设置指南

## 快速设置步骤

### 1. 环境准备

确保你的系统已安装：
- Node.js (版本 16 或更高)
- npm 或 yarn
- Git

### 2. 项目初始化

```bash
# 克隆项目（如果是从 GitHub）
git clone <your-repo-url>
cd my-notes

# 安装依赖
npm install
```

### 3. Supabase 项目设置

#### 3.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 点击 "New Project"
3. 选择组织或创建新组织
4. 填写项目信息：
   - 项目名称：`my-notes`
   - 数据库密码：设置一个强密码
   - 地区：选择离你最近的地区
5. 点击 "Create new project"

#### 3.2 获取项目配置

1. 在项目仪表板中，点击左侧菜单的 "Settings"
2. 点击 "API"
3. 复制以下信息：
   - Project URL
   - anon public key

#### 3.3 创建环境变量文件

在项目根目录创建 `.env` 文件：

```env
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 数据库设置

#### 4.1 创建数据库表

1. 在 Supabase 控制台中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制并粘贴以下 SQL 代码：

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

4. 点击 "Run" 执行 SQL

#### 4.2 设置 Storage

1. 点击左侧菜单的 "Storage"
2. 点击 "Create a new bucket"
3. 填写信息：
   - Name: `notes-images`
   - Public bucket: 勾选
4. 点击 "Create bucket"

#### 4.3 设置 Storage 策略

1. 在 Storage 页面，点击 "Policies"
2. 点击 "New Policy"
3. 选择 "Create a policy from scratch"
4. 添加以下策略：

**上传策略：**
- Policy name: `Users can upload images`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'notes-images' AND auth.role() = 'authenticated'
```

**查看策略：**
- Policy name: `Anyone can view images`
- Allowed operation: `SELECT`
- Target roles: `*`
- Policy definition:
```sql
bucket_id = 'notes-images'
```

### 5. 认证设置

#### 5.1 基本设置

1. 点击左侧菜单的 "Authentication"
2. 点击 "Settings"
3. 在 "Auth Providers" 部分：
   - 确保 "Email" 已启用
   - 可选：启用 "Google" 提供商

#### 5.2 Google OAuth 设置（可选）

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID
5. 在 Supabase 中添加 Google 提供商：
   - Client ID: 你的 Google OAuth 客户端 ID
   - Client Secret: 你的 Google OAuth 客户端密钥
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 6. 启动应用

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 7. 测试功能

1. **注册/登录测试**：
   - 访问应用
   - 点击注册，使用邮箱创建账号
   - 或使用 Google 登录

2. **笔记功能测试**：
   - 创建新笔记
   - 编辑笔记内容
   - 测试富文本编辑器
   - 测试代码编辑器
   - 上传图片

3. **搜索功能测试**：
   - 创建多个笔记
   - 使用搜索框查找笔记

## 常见问题解决

### 问题 1: 环境变量未生效

**解决方案：**
- 确保 `.env` 文件在项目根目录
- 重启开发服务器
- 检查变量名是否正确（必须以 `REACT_APP_` 开头）

### 问题 2: 数据库连接失败

**解决方案：**
- 检查 Supabase URL 和密钥是否正确
- 确认 Supabase 项目是否正常运行
- 检查网络连接

### 问题 3: 图片上传失败

**解决方案：**
- 确认 Storage bucket 已创建
- 检查 Storage 策略是否正确设置
- 确认 bucket 为公开访问

### 问题 4: 用户认证失败

**解决方案：**
- 检查 Supabase 认证设置
- 确认邮箱确认是否已启用
- 检查 Google OAuth 配置（如果使用）

## 生产环境部署

### Vercel 部署

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 部署：
```bash
vercel
```

3. 在 Vercel 项目设置中添加环境变量

### Netlify 部署

1. 连接 GitHub 仓库到 Netlify
2. 设置构建命令：`npm run build`
3. 设置发布目录：`build`
4. 添加环境变量

## 下一步

- 自定义应用样式
- 添加更多功能（如笔记分类、标签等）
- 优化性能
- 添加测试
- 配置 CI/CD

## 获取帮助

如果遇到问题，可以：
1. 查看 Supabase 文档
2. 检查浏览器控制台错误
3. 查看 Supabase 控制台日志
4. 提交 Issue 到项目仓库 