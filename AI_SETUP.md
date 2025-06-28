# 🤖 AI 智能助手功能设置指南

## 功能概述

你的笔记应用现在集成了强大的AI功能，包括：

- **智能摘要生成**：自动提取笔记要点
- **关键词提取**：识别重要概念和词汇
- **写作建议**：提供内容改进建议
- **智能标签**：自动生成分类标签
- **相关主题推荐**：发现相关研究方向

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 文件为 `.env`：

```bash
cp env.example .env
```

编辑 `.env` 文件，填入你的API密钥：

```env
# Supabase 配置
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key_here

# 服务器配置
PORT=3001
```

### 3. 获取 OpenAI API 密钥

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册或登录账户
3. 进入 API Keys 页面
4. 创建新的 API 密钥
5. 复制密钥到 `.env` 文件

### 4. 启动应用

开发模式（同时启动前端和后端）：

```bash
npm run dev
```

或者分别启动：

```bash
# 启动后端服务器
npm run server

# 启动前端应用
npm start
```

## 📝 使用方法

1. **打开AI助手**：在笔记编辑界面点击"显示 AI 助手"按钮
2. **选择功能**：点击不同的标签页选择AI功能
3. **输入内容**：在编辑器中输入或粘贴文本
4. **获取分析**：点击相应的按钮获取AI分析结果
5. **应用建议**：点击"应用到笔记"将AI建议添加到笔记中

## 💡 AI 功能详解

### 智能摘要
- 自动提取文章主要观点
- 生成200字以内的简洁摘要
- 突出关键信息和结论

### 关键词提取
- 识别文本中的重要概念
- 提取5-10个核心关键词
- 便于搜索和分类

### 写作建议
- 分析内容结构和逻辑
- 提供表达方式改进建议
- 检查语法和用词

### 智能标签
- 自动生成3-5个分类标签
- 便于笔记管理和搜索
- 提高内容发现性

### 相关主题
- 基于当前内容推荐研究方向
- 发现知识连接点
- 扩展学习视野

## 🔧 技术架构

```
前端 (React) ←→ 后端 (Express) ←→ OpenAI API
     ↓              ↓
  Supabase      AI 处理
  数据库        服务
```

## 💰 成本控制

- 使用 GPT-3.5-turbo 模型（成本较低）
- 限制每次请求的 token 数量
- 实现请求频率限制
- 提供免费和付费版本

## 🛠️ 自定义配置

### 修改AI模型

在 `server.js` 中修改模型配置：

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4", // 或 "gpt-3.5-turbo"
  max_tokens: 1000,
  temperature: 0.7,
});
```

### 调整提示词

在 `server.js` 中修改系统提示词：

```javascript
case 'summary':
  systemPrompt = '你的自定义提示词';
  userPrompt = `你的自定义用户提示词：\n\n${content}`;
  break;
```

## 🚨 注意事项

1. **API 密钥安全**：不要将 `.env` 文件提交到版本控制
2. **使用限制**：注意 OpenAI API 的使用配额和限制
3. **数据隐私**：确保用户数据的安全性和隐私保护
4. **错误处理**：应用已包含完善的错误处理机制

## 🆘 故障排除

### 常见问题

1. **API 密钥无效**
   - 检查 `.env` 文件中的密钥是否正确
   - 确认 OpenAI 账户有足够的余额

2. **服务器连接失败**
   - 确认后端服务器正在运行
   - 检查端口是否被占用

3. **AI 响应缓慢**
   - 检查网络连接
   - 考虑升级到更快的模型

### 调试模式

启用详细日志：

```javascript
// 在 server.js 中添加
console.log('请求内容:', content);
console.log('AI 响应:', response);
```

## 📈 未来扩展

- [ ] 支持更多AI模型（Claude、Gemini等）
- [ ] 添加语音转文字功能
- [ ] 实现智能笔记关联
- [ ] 支持多语言AI分析
- [ ] 添加个性化AI训练

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进AI功能！

---

**享受你的智能笔记体验！** ✨ 