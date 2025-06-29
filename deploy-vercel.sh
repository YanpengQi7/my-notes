#!/bin/bash

echo "🚀 开始 Vercel 部署..."
echo "========================"

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请运行: npm install -g vercel"
    exit 1
fi

# 检查是否已登录
echo "🔍 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "🔑 请登录 Vercel..."
    vercel login
fi

# 构建项目
echo "🏗️ 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo "========================"
    echo "📝 下一步操作："
    echo "1. 在 Vercel 控制台配置环境变量："
    echo "   - GEMINI_API_KEY=你的Gemini API密钥"
    echo "   - NODE_ENV=production"
    echo ""
    echo "2. 测试部署的应用："
    echo "   - 访问主应用"
    echo "   - 测试 /api/health 端点"
    echo "   - 测试 /test-ai-frontend.html 页面"
    echo ""
    echo "3. 如果需要更新环境变量："
    echo "   vercel env add GEMINI_API_KEY"
    echo "   vercel --prod"
    echo ""
else
    echo "❌ 部署失败"
    echo "请检查错误信息并重试"
    exit 1
fi 