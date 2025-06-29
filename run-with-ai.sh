#!/bin/bash

echo "🚀 启动 AI 服务器..."
echo "========================"

# 检查环境变量
if [ -f .env ]; then
    echo "✅ 找到 .env 文件"
    echo "🔍 检查 API Keys:"
    
    if grep -q "GEMINI_API_KEY=" .env; then
        echo "   ✅ GEMINI_API_KEY: 已配置"
    else
        echo "   ❌ GEMINI_API_KEY: 未配置"
    fi
    
    if grep -q "OPENAI_API_KEY=" .env; then
        echo "   ✅ OPENAI_API_KEY: 已配置"
    else
        echo "   ❌ OPENAI_API_KEY: 未配置"
    fi
else
    echo "❌ 未找到 .env 文件"
    exit 1
fi

echo ""
echo "🛑 停止现有服务器..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "⏳ 等待端口释放..."
sleep 3

echo "🚀 启动新服务器..."
echo "========================"

# 显式加载环境变量并启动服务器
export $(cat .env | grep -v '^#' | xargs)
node server.js 