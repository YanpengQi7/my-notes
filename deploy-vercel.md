# Vercel 部署指南

## 当前状态
✅ 代码已推送到 GitHub  
✅ Vercel 项目已创建  
❌ 环境变量需要配置

## 部署步骤

### 1. 访问 Vercel 项目
打开 [https://vercel.com/yanpengqi7s-projects/my-notes](https://vercel.com/yanpengqi7s-projects/my-notes)

### 2. 配置环境变量
1. 点击 **Settings** 标签页
2. 在左侧菜单找到 **Environment Variables**
3. 点击 **Add New** 按钮

#### 必需的环境变量：

**Hugging Face API Key**
- Name: `HUGGINGFACE_API_KEY`
- Value: 你的 Hugging Face API Token
- Environment: Production, Preview, Development（全选）

**Supabase 配置（如果使用）**
- Name: `SUPABASE_URL`
- Value: 你的 Supabase 项目 URL
- Environment: Production, Preview, Development

- Name: `SUPABASE_KEY`
- Value: 你的 Supabase anon key
- Environment: Production, Preview, Development

**OpenAI API Key（可选）**
- Name: `OPENAI_API_KEY`
- Value: 你的 OpenAI API Key
- Environment: Production, Preview, Development

### 3. 重新部署
1. 回到 **Deployments** 标签页
2. 找到最新部署
3. 点击 **Redeploy** 按钮

### 4. 验证部署
部署完成后，访问你的 Vercel 域名测试 AI 功能。

## 注意事项
- 环境变量配置后必须重新部署才能生效
- 本地开发使用 `.env` 文件，云端使用 Vercel 环境变量
- 确保所有环境（Production、Preview、Development）都配置了相同的变量

## 故障排除
如果 AI 功能不工作，检查：
1. 环境变量是否正确配置
2. API Key 是否有效
3. 部署日志中是否有错误信息 