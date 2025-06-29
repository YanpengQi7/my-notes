# 🚀 Cursor 和 Hugging Face MCP 设置指南

## 📋 概述

本指南将帮助你设置 Cursor 编辑器的 Hugging Face MCP（Model Context Protocol）集成，让你能够直接在 Cursor 中使用 Hugging Face 的 AI 模型。

## 🎯 设置步骤

### 第一步：创建 Hugging Face Token

1. **访问 Hugging Face**
   ```bash
   # 打开浏览器访问
   https://huggingface.co/
   ```

2. **注册/登录账户**
   - 如果没有账户，点击 "Sign Up" 注册
   - 如果已有账户，点击 "Sign In" 登录

3. **创建 Access Token**
   - 登录后，点击右上角头像
   - 选择 "Settings"（设置）
   - 在左侧菜单找到 "Access Tokens"
   - 点击 "New token"
   - 选择 "Read" 权限（对于 MCP 使用足够）
   - 给 token 起名（如 "Cursor MCP"）
   - 点击 "Generate token"
   - **⚠️ 重要：立即复制生成的 token，它只会显示一次！**

### 第二步：创建 Cursor MCP 配置

1. **创建配置目录**
   ```bash
   mkdir -p ~/.cursor
   ```

2. **创建 MCP 配置文件**
   ```bash
   touch ~/.cursor/mcp.json
   ```

3. **编辑配置文件**
   ```bash
   # 使用你喜欢的编辑器
   code ~/.cursor/mcp.json
   # 或者
   nano ~/.cursor/mcp.json
   # 或者
   vim ~/.cursor/mcp.json
   ```

4. **添加配置内容**
   ```json
   {
     "mcpServers": {
       "hf-mcp-server": {
         "url": "https://huggingface.co/mcp",
         "headers": {
           "Authorization": "Bearer YOUR_HF_TOKEN_HERE"
         }
       }
     }
   }
   ```

   **⚠️ 重要：将 `YOUR_HF_TOKEN_HERE` 替换为你实际的 Hugging Face token**

### 第三步：验证配置

1. **检查配置文件**
   ```bash
   cat ~/.cursor/mcp.json
   ```

2. **重启 Cursor**
   - 完全关闭 Cursor 应用
   - 重新打开 Cursor

3. **测试连接**
   - 在 Cursor 中，你应该能够访问 Hugging Face 的功能
   - 可以通过 Cursor 的 AI 功能来测试

## 🔧 故障排除

### 常见问题

1. **"Token 无效"**
   ```bash
   # 检查 token 格式是否正确
   # Hugging Face token 应该以 "hf_" 开头
   echo $HUGGINGFACE_API_KEY | head -c 10
   ```

2. **"配置文件不存在"**
   ```bash
   # 确保配置文件存在且有正确权限
   ls -la ~/.cursor/mcp.json
   chmod 600 ~/.cursor/mcp.json
   ```

3. **"权限被拒绝"**
   ```bash
   # 检查文件权限
   ls -la ~/.cursor/
   # 如果需要，修复权限
   chmod 700 ~/.cursor/
   chmod 600 ~/.cursor/mcp.json
   ```

### 调试步骤

1. **检查 Cursor 日志**
   ```bash
   # 在 Cursor 中打开开发者工具
   # 查看控制台是否有错误信息
   ```

2. **验证网络连接**
   ```bash
   # 测试到 Hugging Face 的连接
   curl -I https://huggingface.co/mcp
   ```

3. **检查 token 有效性**
   ```bash
   # 使用你的 token 测试 API
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://huggingface.co/api/models
   ```

## 🎯 在你的项目中使用

基于你的项目结构，你已经有了 AI 集成。现在你可以：

1. **在 Cursor 中直接使用 AI 功能**
   - 选中代码
   - 使用 Cursor 的 AI 功能进行解释、优化或重构

2. **结合你的现有 AI 服务**
   - 你的项目已经有 Hugging Face 和 OpenAI 集成
   - MCP 设置可以增强 Cursor 的 AI 能力

3. **开发工作流优化**
   ```bash
   # 在 Cursor 中，你可以：
   # - 使用 AI 生成代码
   # - 获取编程建议
   # - 自动重构代码
   # - 生成文档
   ```

## 📚 高级配置

### 多服务商配置

如果你想要配置多个 AI 服务商：

```json
{
  "mcpServers": {
    "hf-mcp-server": {
      "url": "https://huggingface.co/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_HF_TOKEN"
      }
    },
    "openai-mcp-server": {
      "url": "https://api.openai.com/v1",
      "headers": {
        "Authorization": "Bearer YOUR_OPENAI_KEY"
      }
    }
  }
}
```

### 环境变量配置

为了更好的安全性，你可以使用环境变量：

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export HUGGINGFACE_API_KEY="your_token_here"
```

然后在配置文件中使用：

```json
{
  "mcpServers": {
    "hf-mcp-server": {
      "url": "https://huggingface.co/mcp",
      "headers": {
        "Authorization": "Bearer ${HUGGINGFACE_API_KEY}"
      }
    }
  }
}
```

## 🎉 完成！

设置完成后，你将能够：

- ✅ 在 Cursor 中直接使用 Hugging Face 的 AI 模型
- ✅ 获得更好的代码生成和建议
- ✅ 提升开发效率
- ✅ 与你的项目 AI 功能协同工作

## 📞 需要帮助？

如果遇到问题，可以：

1. 检查 Hugging Face 的官方文档
2. 查看 Cursor 的 MCP 文档
3. 在项目 Issues 中提问

---

**💡 提示：** 建议定期更新你的 Hugging Face token，并保持配置文件的安全性！ 