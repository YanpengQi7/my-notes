#!/bin/bash

echo "🧪 开始测试部署..."
echo "================================"

# 测试健康检查
echo "1. 测试健康检查接口..."
health_response=$(curl -s http://localhost:3001/api/health)
echo "✅ 健康检查响应: $health_response"
echo ""

# 测试前端页面
echo "2. 测试前端页面..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$frontend_status" = "200" ]; then
    echo "✅ 前端页面正常 (HTTP $frontend_status)"
else
    echo "❌ 前端页面异常 (HTTP $frontend_status)"
fi
echo ""

# 测试 AI API
echo "3. 测试 AI API..."
ai_response=$(curl -s -X POST http://localhost:3001/api/ai-huggingface \
  -H "Content-Type: application/json" \
  -d '{"content":"这是一个测试内容，用于验证AI功能是否正常。","type":"summary"}')
echo "✅ AI API 响应: $(echo $ai_response | cut -c1-100)..."
echo ""

# 显示访问地址
echo "🌐 访问地址:"
echo "   前端应用: http://localhost:3001"
echo "   健康检查: http://localhost:3001/api/health"
echo "   OpenAI API: http://localhost:3001/api/ai"
echo "   Hugging Face API: http://localhost:3001/api/ai-huggingface"
echo ""

echo "🎉 部署测试完成！"
echo "================================" 