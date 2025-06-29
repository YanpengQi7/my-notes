#!/bin/bash

# 🚀 Cursor MCP 自动设置脚本
# 用于快速配置 Cursor 和 Hugging Face MCP 集成

echo "🚀 开始设置 Cursor MCP..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 检测到 macOS 系统"
    CURSOR_CONFIG_DIR="$HOME/.cursor"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 检测到 Linux 系统"
    CURSOR_CONFIG_DIR="$HOME/.cursor"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo "🪟 检测到 Windows 系统"
    CURSOR_CONFIG_DIR="$APPDATA/Cursor/User"
else
    echo -e "${RED}❌ 不支持的操作系统: $OSTYPE${NC}"
    exit 1
fi

# 创建配置目录
echo -e "${BLUE}📁 创建配置目录...${NC}"
mkdir -p "$CURSOR_CONFIG_DIR"

# 检查是否已有配置文件
if [ -f "$CURSOR_CONFIG_DIR/mcp.json" ]; then
    echo -e "${YELLOW}⚠️  发现现有配置文件: $CURSOR_CONFIG_DIR/mcp.json${NC}"
    read -p "是否要备份现有配置？(y/n): " backup_choice
    if [[ $backup_choice == "y" || $backup_choice == "Y" ]]; then
        cp "$CURSOR_CONFIG_DIR/mcp.json" "$CURSOR_CONFIG_DIR/mcp.json.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ 配置文件已备份${NC}"
    fi
fi

# 获取 Hugging Face Token
echo -e "${BLUE}🔑 请输入你的 Hugging Face Token:${NC}"
echo -e "${YELLOW}💡 提示：Token 应该以 'hf_' 开头${NC}"
read -s HF_TOKEN

# 验证 token 格式
if [[ ! $HF_TOKEN =~ ^hf_ ]]; then
    echo -e "${RED}❌ Token 格式错误！Hugging Face Token 应该以 'hf_' 开头${NC}"
    echo -e "${YELLOW}💡 请访问 https://huggingface.co/settings/tokens 获取正确的 token${NC}"
    exit 1
fi

# 创建配置文件
echo -e "${BLUE}📝 创建 MCP 配置文件...${NC}"
cat > "$CURSOR_CONFIG_DIR/mcp.json" << EOF
{
  "mcpServers": {
    "hf-mcp-server": {
      "url": "https://huggingface.co/mcp",
      "headers": {
        "Authorization": "Bearer $HF_TOKEN"
      }
    }
  }
}
EOF

# 设置文件权限
chmod 600 "$CURSOR_CONFIG_DIR/mcp.json"
chmod 700 "$CURSOR_CONFIG_DIR"

# 验证配置文件
echo -e "${BLUE}🔍 验证配置文件...${NC}"
if [ -f "$CURSOR_CONFIG_DIR/mcp.json" ]; then
    echo -e "${GREEN}✅ 配置文件创建成功！${NC}"
    echo -e "${BLUE}📄 配置文件内容:${NC}"
    cat "$CURSOR_CONFIG_DIR/mcp.json"
else
    echo -e "${RED}❌ 配置文件创建失败！${NC}"
    exit 1
fi

# 测试 token 有效性
echo -e "${BLUE}🧪 测试 Hugging Face Token...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/models)

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Token 验证成功！${NC}"
else
    echo -e "${YELLOW}⚠️  Token 验证失败 (HTTP $response)，但配置已完成${NC}"
    echo -e "${YELLOW}💡 请检查你的 token 是否正确${NC}"
fi

# 显示完成信息
echo -e "${GREEN}🎉 Cursor MCP 设置完成！${NC}"
echo ""
echo -e "${BLUE}📋 下一步操作：${NC}"
echo "1. 重启 Cursor 编辑器"
echo "2. 在 Cursor 中测试 AI 功能"
echo "3. 享受增强的开发体验！"
echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo "- 配置文件位置: $CURSOR_CONFIG_DIR/mcp.json"
echo "- 如需修改配置，请编辑上述文件"
echo "- 定期更新你的 Hugging Face token"
echo ""
echo -e "${BLUE}🔗 相关链接：${NC}"
echo "- Hugging Face: https://huggingface.co/"
echo "- Cursor 文档: https://cursor.sh/docs"
echo "- 项目文档: ./CURSOR_MCP_SETUP.md" 