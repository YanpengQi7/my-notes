# Vercel 部署指南

## 1. 准备工作

确保你已经：
- 安装了 Vercel CLI: `npm i -g vercel`
- 在 GitHub 上创建了仓库并推送了代码

## 2. 环境变量配置

在 Vercel 控制台中设置以下环境变量：

### 必需的环境变量：
```
OPENAI_API_KEY=你的OpenAI_API密钥
HUGGINGFACE_API_KEY=你的HuggingFace_API密钥
```

### 可选的环境变量：
```
REACT_APP_SUPABASE_URL=你的Supabase_URL
REACT_APP_SUPABASE_ANON_KEY=你的Supabase_ANON_KEY
REACT_APP_DEMO_MODE=true
```

## 3. 部署步骤

### 方法一：使用 Vercel CLI
```bash
# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

### 方法二：使用 GitHub 集成
1. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中点击 "New Project"
2. 导入你的 GitHub 仓库
3. 配置环境变量
4. 点击 "Deploy"

## 4. API 功能验证

部署完成后，测试以下端点：

### 测试 API 连接：
```
https://你的域名.vercel.app/api/test
```

### AI 功能测试：
```
POST https://你的域名.vercel.app/api/ai
POST https://你的域名.vercel.app/api/ai-huggingface
```

## 5. 常见问题解决

### 问题 1: API 返回 404
- 检查 `vercel.json` 配置是否正确
- 确保 API 文件在 `api/` 目录下
- 验证环境变量是否已设置

### 问题 2: CORS 错误
- API 文件已包含 CORS 头设置
- 检查前端请求 URL 是否正确

### 问题 3: 环境变量未生效
- 在 Vercel 控制台中重新设置环境变量
- 重新部署项目

## 6. 性能优化

- API 函数已设置 30 秒超时
- 建议使用 Hugging Face API（免费）进行测试
- 生产环境建议使用 OpenAI API

## 7. 监控和日志

在 Vercel Dashboard 中：
- 查看函数执行日志
- 监控 API 调用次数
- 检查错误报告

## 8. 更新部署

每次代码更新后：
```bash
git add .
git commit -m "更新说明"
git push origin main
```

Vercel 会自动重新部署（如果启用了自动部署）。

## 当前状态
✅ 代码已推送到 GitHub  
✅ Vercel 项目已创建  
❌ 环境变量需要配置

## 注意事项
- 环境变量配置后必须重新部署才能生效
- 本地开发使用 `.env` 文件，云端使用 Vercel 环境变量
- 确保所有环境（Production、Preview、Development）都配置了相同的变量

## 故障排除
如果 AI 功能不工作，检查：
1. 环境变量是否正确配置
2. API Key 是否有效
3. 部署日志中是否有错误信息 