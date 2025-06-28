// 测试API端点
module.exports = async (req, res) => {
  // 添加 CORS 支持
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    message: 'API 服务正常运行',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    method: req.method
  });
}; 