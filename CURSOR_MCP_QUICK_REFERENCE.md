# 🚀 Cursor MCP 快速参考

## ⚡ 一键设置

```bash
# 运行自动设置脚本
./setup-cursor-mcp.sh
```

## 📋 手动设置步骤

### 1. 获取 Hugging Face Token
```bash
# 访问以下链接获取 token
open https://huggingface.co/settings/tokens
```

### 2. 创建配置文件
```bash
# 创建配置目录
mkdir -p ~/.cursor

# 创建配置文件
touch ~/.cursor/mcp.json
```

### 3. 编辑配置文件
```bash
# 使用编辑器打开配置文件
code ~/.cursor/mcp.json
# 或
nano ~/.cursor/mcp.json
```

### 4. 添加配置内容
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

## 🔧 常用命令

### 检查配置
```bash
# 查看配置文件
cat ~/.cursor/mcp.json

# 检查文件权限
ls -la ~/.cursor/mcp.json

# 测试 token
curl -H "Authorization: Bearer YOUR_TOKEN" https://huggingface.co/api/models
```

### 修复权限
```bash
# 设置正确的文件权限
chmod 700 ~/.cursor/
chmod 600 ~/.cursor/mcp.json
```

### 备份配置
```bash
# 备份现有配置
cp ~/.cursor/mcp.json ~/.cursor/mcp.json.backup.$(date +%Y%m%d_%H%M%S)
```

## 🎯 验证设置

### 1. 重启 Cursor
- 完全关闭 Cursor 应用
- 重新打开 Cursor

### 2. 测试功能
- 在 Cursor 中选择代码
- 使用 AI 功能（Cmd/Ctrl + K）
- 检查是否能获得 AI 建议

## 🚨 故障排除

### Token 问题
```bash
# 检查 token 格式
echo $HUGGINGFACE_API_KEY | head -c 10
# 应该显示: hf_

# 重新生成 token
open https://huggingface.co/settings/tokens
```

### 配置文件问题
```bash
# 检查配置文件是否存在
ls -la ~/.cursor/mcp.json

# 重新创建配置
rm ~/.cursor/mcp.json
./setup-cursor-mcp.sh
```

### 网络问题
```bash
# 测试网络连接
curl -I https://huggingface.co/mcp

# 检查防火墙设置
ping huggingface.co
```

## 📚 高级配置

### 多服务商配置
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
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export HUGGINGFACE_API_KEY="your_token_here"

# 在配置文件中使用
"Authorization": "Bearer ${HUGGINGFACE_API_KEY}"
```

## 🎉 完成检查清单

- [ ] 获取了 Hugging Face Token
- [ ] 创建了 `~/.cursor/mcp.json` 配置文件
- [ ] 配置了正确的 token
- [ ] 设置了正确的文件权限
- [ ] 重启了 Cursor 编辑器
- [ ] 测试了 AI 功能
- [ ] 备份了配置文件

## 📞 获取帮助

- **Hugging Face 文档**: https://huggingface.co/docs
- **Cursor 文档**: https://cursor.sh/docs
- **项目文档**: `./CURSOR_MCP_SETUP.md`
- **详细指南**: `./CURSOR_MCP_SETUP.md`

---

**💡 提示**: 定期更新你的 token 并保持配置文件的安全性！ 