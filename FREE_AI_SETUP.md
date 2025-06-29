# 🆓 免费 AI API 设置指南

## 🤖 Google Gemini API（推荐）

### 1. 获取免费 API Key
1. 访问：https://makersuite.google.com/app/apikey
2. 使用 Google 账号登录
3. 点击 "Create API Key"
4. 复制生成的 API Key

### 2. 配置环境变量
在项目根目录的 `.env` 文件中添加：
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 使用说明
- **完全免费**：每月 60 次/分钟请求
- **支持中文**：对中文内容理解很好
- **多功能**：支持摘要、关键词、建议等

## 🔄 其他免费选项

### Ollama 本地 AI（完全离线）
1. 下载：https://ollama.ai/download
2. 安装后运行：`ollama run llama2`
3. 完全免费，无限使用

### Cohere API
1. 访问：https://cohere.ai/
2. 注册免费账号
3. 获取 API Key

## 🚀 快速测试

重启服务器后测试：
```bash
# 测试 Gemini API
curl -X POST http://localhost:3001/api/ai-gemini \
  -H "Content-Type: application/json" \
  -d '{"content":"测试内容","type":"summary"}'
```

## 💡 使用建议

1. **优先使用 Gemini**：免费额度大，响应质量好
2. **备用智能响应**：即使没有 API Key 也能工作
3. **本地 Ollama**：完全离线，无限制使用

## 🔧 故障排除

如果 API 不工作：
1. 检查 API Key 是否正确配置
2. 查看控制台错误信息
3. 系统会自动使用智能备用响应 