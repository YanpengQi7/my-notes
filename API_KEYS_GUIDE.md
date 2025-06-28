# 🔑 API 密钥获取指南

## 🆓 免费选项（推荐新手）

### 1. **Hugging Face（完全免费）**

**获取步骤：**
1. 访问：https://huggingface.co/
2. 点击 "Sign Up" 注册账户
3. 登录后，进入 Settings → Access Tokens
4. 点击 "New token" 创建新令牌
5. 选择 "Read" 权限即可
6. 复制生成的令牌

**优点：**
- ✅ 完全免费
- ✅ 无需信用卡
- ✅ 每月有免费配额
- ✅ 支持多种AI模型

**配置：**
```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

### 2. **OpenAI 免费额度**

**获取步骤：**
1. 访问：https://platform.openai.com/
2. 注册新账户
3. 验证邮箱和手机号
4. 进入 API Keys 页面
5. 创建新的 API 密钥
6. 获得 $5 免费额度（约 2500 次请求）

**优点：**
- ✅ 新用户有免费额度
- ✅ GPT-3.5-turbo 成本很低
- ✅ 响应质量高

**配置：**
```env
OPENAI_API_KEY=sk-your_key_here
```

## 💰 付费选项（适合商业使用）

### 3. **Anthropic Claude**

**获取步骤：**
1. 访问：https://console.anthropic.com/
2. 注册账户
3. 添加支付方式
4. 创建 API 密钥

**价格：** $0.15/1M tokens

### 4. **Google Gemini**

**获取步骤：**
1. 访问：https://makersuite.google.com/app/apikey
2. 使用 Google 账户登录
3. 创建 API 密钥

**价格：** 每月有免费配额

## 🚀 快速开始（推荐）

### 方案一：仅使用 Hugging Face（免费）

1. **获取 Hugging Face 令牌**
   ```bash
   # 访问 https://huggingface.co/settings/tokens
   # 创建新令牌
   ```

2. **配置环境变量**
   ```bash
   cp env.example .env
   # 编辑 .env 文件，只添加：
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

3. **启动应用**
   ```bash
   npm run dev
   ```

### 方案二：OpenAI + Hugging Face（推荐）

1. **获取两个API密钥**
   - OpenAI: https://platform.openai.com/api-keys
   - Hugging Face: https://huggingface.co/settings/tokens

2. **配置环境变量**
   ```bash
   cp env.example .env
   # 编辑 .env 文件：
   OPENAI_API_KEY=sk-your_openai_key
   HUGGINGFACE_API_KEY=hf_your_hf_token
   ```

3. **启动应用**
   ```bash
   npm run dev
   ```

## 💡 使用建议

### 开发阶段
- 使用 Hugging Face（免费）
- 测试基本功能
- 验证用户体验

### 生产阶段
- 使用 OpenAI（质量更好）
- 设置使用限制
- 监控成本

### 成本控制
```javascript
// 在 server.js 中添加使用限制
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100次请求
  message: '请求过于频繁，请稍后重试'
});

app.use('/api/ai', aiLimiter);
```

## 🔧 故障排除

### 常见问题

1. **"API 密钥无效"**
   - 检查密钥是否正确复制
   - 确认账户有足够余额
   - 验证API密钥权限

2. **"请求被拒绝"**
   - 检查网络连接
   - 确认API服务状态
   - 查看错误日志

3. **"配额已用完"**
   - 等待下月重置
   - 升级付费计划
   - 切换到其他服务商

### 调试技巧

```javascript
// 在 server.js 中添加详细日志
app.post('/api/ai', async (req, res) => {
  console.log('收到AI请求:', {
    type: req.body.type,
    contentLength: req.body.content?.length,
    timestamp: new Date().toISOString()
  });
  
  // ... 处理逻辑
});
```

## 📊 成本对比

| 服务商 | 免费额度 | 付费价格 | 质量 | 推荐度 |
|--------|----------|----------|------|--------|
| Hugging Face | 每月免费 | 免费 | 中等 | ⭐⭐⭐⭐⭐ |
| OpenAI | $5 免费 | $0.002/1K tokens | 高 | ⭐⭐⭐⭐ |
| Anthropic | 试用 | $0.15/1M tokens | 高 | ⭐⭐⭐ |
| Google Gemini | 免费配额 | 按量计费 | 高 | ⭐⭐⭐⭐ |

## 🎯 创业建议

### MVP阶段
- 使用 Hugging Face（免费）
- 快速验证产品概念
- 收集用户反馈

### 增长阶段
- 升级到 OpenAI
- 提升用户体验
- 实现付费功能

### 规模化阶段
- 多服务商备份
- 智能路由选择
- 成本优化策略

---

**💡 提示：** 建议先使用 Hugging Face 免费版本开始，等产品验证成功后再考虑升级到付费服务！

# AI 服务 API 密钥配置指南

## 🤖 为什么 AI 服务不可用？

你的应用目前处于演示模式，AI 功能需要配置真实的 API 密钥才能正常工作。

## 🔑 配置步骤

### 1. OpenAI API（推荐）

1. 访问 [OpenAI API](https://platform.openai.com/api-keys)
2. 注册账号并登录
3. 创建新的 API 密钥
4. 复制密钥到环境变量

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

**费用**: 按使用量计费，新用户有免费额度

### 2. Hugging Face API（免费）

1. 访问 [Hugging Face](https://huggingface.co/settings/tokens)
2. 注册账号并登录
3. 创建新的 Access Token
4. 复制 token 到环境变量

```bash
HUGGINGFACE_API_KEY=hf-your-token-here
```

**费用**: 免费，但有使用限制

## 🚀 部署配置

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量
2. 添加以下变量：
   - `OPENAI_API_KEY`
   - `HUGGINGFACE_API_KEY`

### 本地开发

1. 复制 `env.example` 为 `.env.local`
2. 填入你的 API 密钥
3. 重启开发服务器

## 💡 演示模式

如果不想配置 API 密钥，应用会自动进入演示模式：
- AI 功能会显示示例响应
- 所有其他功能正常工作
- 数据保存在本地存储中

## 🔧 故障排除

### 常见问题

1. **"API 密钥无效"**
   - 检查密钥是否正确复制
   - 确认密钥没有多余的空格

2. **"配额已用完"**
   - OpenAI: 检查账户余额
   - Hugging Face: 等待配额重置

3. **"网络错误"**
   - 检查网络连接
   - 确认 API 服务可用

### 测试 API

可以使用以下命令测试 API 是否正常工作：

```bash
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## 📞 支持

如果遇到问题，请检查：
1. API 密钥是否正确配置
2. 网络连接是否正常
3. API 服务是否可用 