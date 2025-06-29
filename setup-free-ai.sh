#!/bin/bash

echo "🤖 免费 AI API 设置助手"
echo "========================"

# 检查 .env 文件
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ 已创建 .env 文件"
fi

echo ""
echo "🚀 可用的免费 AI 服务："
echo ""
echo "1. 🤖 Google Gemini (推荐)"
echo "   - 完全免费，每月大量请求额度"
echo "   - 获取地址: https://makersuite.google.com/app/apikey"
echo "   - 支持中文，响应质量高"
echo ""
echo "2. 🦙 Ollama 本地 AI"
echo "   - 完全离线，无限制使用"
echo "   - 下载地址: https://ollama.ai/download"
echo "   - 需要下载模型，但完全免费"
echo ""
echo "3. 🔄 Cohere API"
echo "   - 免费试用额度"
echo "   - 注册地址: https://cohere.ai/"
echo ""

read -p "是否要自动打开 Google Gemini API 获取页面？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 正在打开 Google Gemini API 页面..."
    open "https://makersuite.google.com/app/apikey"
fi

echo ""
echo "📝 获取 API Key 后，请按以下步骤配置："
echo "1. 复制你的 API Key"
echo "2. 编辑 .env 文件"
echo "3. 添加: GEMINI_API_KEY=your_api_key_here"
echo "4. 重启服务器: npm run server"
echo ""

read -p "是否现在就配置 Gemini API Key？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "请输入你的 Gemini API Key:"
    read -r api_key
    
    if [ ! -z "$api_key" ]; then
        # 更新 .env 文件
        if grep -q "GEMINI_API_KEY" .env; then
            sed -i.bak "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$api_key/" .env
        else
            echo "GEMINI_API_KEY=$api_key" >> .env
        fi
        echo "✅ API Key 已配置到 .env 文件"
    fi
fi

echo ""
echo "🧪 测试命令："
echo "curl -X POST http://localhost:3001/api/ai-gemini \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"content\":\"测试内容\",\"type\":\"summary\"}'"
echo ""
echo "🎉 设置完成！重启服务器即可使用免费 AI 功能。" 