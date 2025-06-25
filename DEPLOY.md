# 🚀 部署指南

## 推荐方案：Vercel（免费且最简单）

### 步骤 1：准备代码
确保你的代码已经推送到 GitHub 仓库。

### 步骤 2：访问 Vercel
1. 打开 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"

### 步骤 3：导入项目
1. 选择你的 GitHub 仓库 `my-notes`
2. Vercel 会自动检测到这是一个 React 项目
3. 保持默认设置，点击 "Deploy"

### 步骤 4：配置环境变量（如果需要）
如果你的 Supabase 配置不是演示模式，需要在 Vercel 项目设置中添加环境变量：
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

### 步骤 5：完成部署
部署完成后，你会得到一个类似 `https://my-notes-xxx.vercel.app` 的链接。

## 其他免费部署选项

### Netlify
1. 访问 [netlify.com](https://netlify.com)
2. 拖拽 `build` 文件夹到部署区域
3. 或连接 GitHub 仓库自动部署

### GitHub Pages
1. 安装：`npm install --save-dev gh-pages`
2. 运行：`npm run deploy`
3. 在仓库设置中启用 GitHub Pages

## 环境变量配置

如果你的应用使用真实的 Supabase 配置，需要在部署平台设置以下环境变量：

```bash
REACT_APP_SUPABASE_URL=你的supabase项目URL
REACT_APP_SUPABASE_ANON_KEY=你的supabase匿名密钥
```

## 注意事项

1. **演示模式**：如果使用演示模式，无需配置环境变量
2. **CORS 设置**：Supabase 默认允许所有域名访问
3. **域名**：Vercel 提供免费的自定义域名
4. **SSL**：所有平台都提供免费的 SSL 证书

## 故障排除

如果遇到问题：
1. 检查环境变量是否正确设置
2. 确保 Supabase 项目配置正确
3. 查看部署日志中的错误信息 