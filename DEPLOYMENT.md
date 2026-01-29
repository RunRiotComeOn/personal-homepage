# GitHub Pages 部署指南

本项目已配置好 GitHub Actions 自动部署到 GitHub Pages。

## 📋 部署步骤

### 1. 在 GitHub 创建仓库

1. 登录 GitHub
2. 点击右上角的 **+** → **New repository**
3. 填写仓库信息：
   - **Repository name**: `personal-homepage` (或其他名称)
   - **Public/Private**: 选择 Public（GitHub Pages 免费版需要公开仓库）
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 **Create repository**

### 2. 配置 GitHub Secrets (EmailJS 配置)

在 GitHub 仓库中设置环境变量，这样 EmailJS 功能才能正常工作：

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，添加以下三个 secrets：

   **Secret 1:**
   - Name: `VITE_EMAILJS_SERVICE_ID`
   - Value: `service_jlwnuyp`

   **Secret 2:**
   - Name: `VITE_EMAILJS_TEMPLATE_ID`
   - Value: `template_km8ri18`

   **Secret 3:**
   - Name: `VITE_EMAILJS_PUBLIC_KEY`
   - Value: `PXZ_0UWVcuo8WhuJL`

### 3. 启用 GitHub Pages

1. 在仓库页面，点击 **Settings**
2. 左侧菜单找到 **Pages**
3. 在 **Source** 下拉菜单中选择 **GitHub Actions**
4. 保存设置

### 4. 推送代码到 GitHub

在项目目录下执行以下命令：

```bash
# 添加所有文件
git add .

# 创建第一次提交
git commit -m "Initial commit: Personal homepage with EmailJS integration"

# 添加远程仓库（替换 YOUR_USERNAME 和 REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 5. 等待部署完成

1. 推送代码后，GitHub Actions 会自动开始构建和部署
2. 进入仓库的 **Actions** 标签页查看部署进度
3. 等待所有步骤完成（通常需要 1-3 分钟）
4. 部署成功后，你可以在以下地址访问网站：
   - **https://YOUR_USERNAME.github.io/REPO_NAME/**

### 6. 查看部署状态

- 绿色勾号 ✅：部署成功
- 红色叉号 ❌：部署失败，点击查看错误日志
- 黄色圆点 🟡：正在部署中

## 🔄 后续更新

每次修改代码后，只需要：

```bash
git add .
git commit -m "描述你的修改"
git push
```

GitHub Actions 会自动重新构建和部署网站。

## 🛠️ 本地测试构建

在推送到 GitHub 之前，建议先在本地测试构建：

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

如果本地构建成功，那么 GitHub Actions 也应该能成功构建。

## 📝 自定义域名（可选）

如果你有自己的域名：

1. 在项目根目录创建 `public/CNAME` 文件
2. 文件内容填写你的域名（例如：`www.example.com`）
3. 在你的域名提供商处配置 DNS：
   - 类型：CNAME
   - 主机：www
   - 值：YOUR_USERNAME.github.io
4. 在 GitHub Settings → Pages → Custom domain 中填写你的域名

## ⚠️ 注意事项

1. **不要提交 .env 文件到 Git**
   - `.env` 文件已经在 `.gitignore` 中，不会被提交
   - EmailJS 配置通过 GitHub Secrets 传递

2. **确保仓库是 Public**
   - GitHub Pages 免费版只支持公开仓库
   - 私有仓库需要 GitHub Pro

3. **第一次部署可能需要等待**
   - GitHub Pages 首次启用可能需要几分钟才能生效

4. **检查路径问题**
   - 如果样式或图片加载失败，可能是路径配置问题
   - 检查 `vite.config.ts` 中的 `base` 配置

## 🐛 常见问题

### Q: 部署失败怎么办？
A:
1. 检查 GitHub Actions 日志中的错误信息
2. 确认所有依赖都在 `package.json` 中
3. 确认本地 `npm run build` 能成功

### Q: 网站能访问但样式错乱？
A:
1. 检查 `vite.config.ts` 中的 `base` 配置
2. 如果仓库名是 `username.github.io`，设置 `base: '/'`
3. 如果是普通仓库，设置 `base: '/仓库名/'`

### Q: EmailJS 不工作？
A:
1. 确认已在 GitHub Secrets 中添加了三个配置
2. 确认 Secret 名称完全一致（区分大小写）
3. 重新触发部署（推送新的提交）

### Q: 如何查看网站地址？
A:
1. 进入仓库的 **Settings** → **Pages**
2. 在 "Your site is live at" 下方可以看到网站地址
3. 或者在 Actions 完成后，部署日志会显示 URL

## 📞 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 的详细日志
2. 检查 GitHub Pages 设置
3. 确认所有 Secrets 配置正确
