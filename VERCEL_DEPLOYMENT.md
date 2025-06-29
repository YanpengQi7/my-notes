# 🚀 Vercel 部署指南

## 准备工作

### 1. 确保你有 Vercel 账户
- 访问 [vercel.com](https://vercel.com) 注册账户
- 连接你的 GitHub 账户

### 2. 安装 Vercel CLI（可选）
```bash
npm install -g vercel
```

## 部署方法

### 方法一：通过 GitHub 自动部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备Vercel部署"
   git push origin main
   ```

2. **在 Vercel 中导入项目**
   - 登录 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   GEMINI_API_KEY=你的Gemini_API密钥
   OPENAI_API_KEY=你的OpenAI_API密钥（可选）
   HUGGINGFACE_API_KEY=你的HuggingFace_API密钥（可选）
   NODE_ENV=production
   ```

4. **部署**
   - Vercel 会自动检测配置并开始部署
   - 等待部署完成（通常1-3分钟）

### 方法二：通过 CLI 部署

1. **登录 Vercel**
   ```bash
   vercel login
   ```

2. **部署项目**
   ```bash
   vercel
   ```

3. **设置环境变量**
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add OPENAI_API_KEY
   vercel env add NODE_ENV
   ```

4. **重新部署**
   ```bash
   vercel --prod
   ```

## 环境变量配置

### 必需的环境变量
- `GEMINI_API_KEY`: Google Gemini API 密钥（免费）
- `NODE_ENV`: 设置为 `production`

### 可选的环境变量
- `OPENAI_API_KEY`: OpenAI API 密钥（付费）
- `HUGGINGFACE_API_KEY`: Hugging Face API 密钥（免费但当前无效）

### 获取 API 密钥

#### Google Gemini API Key（推荐）
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录你的 Google 账户
3. 创建新的 API 密钥
4. 复制密钥并添加到 Vercel 环境变量

#### OpenAI API Key（可选）
1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录你的 OpenAI 账户
3. 创建新的 API 密钥
4. 复制密钥并添加到 Vercel 环境变量

## 部署后验证

### 1. 检查部署状态
- 访问你的 Vercel 项目 URL
- 确认前端应用正常加载

### 2. 测试 API 端点
访问以下 URL 验证 API 功能：
- `https://your-app.vercel.app/api/health` - 健康检查
- `https://your-app.vercel.app/test-ai-frontend.html` - AI 功能测试

### 3. 测试 AI 功能
1. 在主应用中创建或编辑笔记
2. 使用右侧的 AI 助手面板
3. 测试各种 AI 功能（摘要、关键词、建议等）

## 故障排除

### 常见问题

#### 1. API 端点 404 错误
- 检查 `vercel.json` 配置是否正确
- 确认 API 文件在 `api/` 目录中

#### 2. 环境变量未生效
- 在 Vercel 控制台检查环境变量设置
- 重新部署项目以应用新的环境变量

#### 3. 构建失败
- 检查 `package.json` 中的依赖项
- 查看 Vercel 构建日志获取详细错误信息

#### 4. AI 功能不工作
- 检查 Gemini API 密钥是否正确配置
- 访问 `/api/health` 检查服务状态

### 调试命令
```bash
# 本地测试构建
npm run build

# 检查 Vercel 项目状态
vercel ls

# 查看部署日志
vercel logs
```

## 性能优化

### 1. 函数配置
- API 函数超时时间已设置为 30 秒
- 支持并发请求处理

### 2. 静态资源优化
- 前端资源通过 Vercel CDN 分发
- 自动压缩和缓存

### 3. 环境配置
- 生产环境优化构建
- 禁用开发工具以提高性能

## 更新部署

### 自动更新
- 推送到 main 分支会自动触发重新部署
- 支持预览部署（其他分支）

### 手动更新
```bash
# 通过 CLI 手动部署
vercel --prod
```

## 成本说明

### Vercel 免费计划包括：
- ✅ 无限静态部署
- ✅ Serverless 函数（每月 100GB-hours）
- ✅ 自定义域名
- ✅ SSL 证书

### Google Gemini API：
- ✅ 免费使用额度
- ✅ 高质量 AI 响应

---

**🎉 部署成功后，你将拥有一个完全功能的在线 AI 笔记应用！** 