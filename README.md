# Personal Homepage

一个现代化的个人主页网站，使用 React + TypeScript + Vite 构建，集成了 EmailJS 联系表单和 GitHub Actions 自动部署。

## 特性

- ⚡ **React 19** + **TypeScript** - 现代化的前端技术栈
- 🎨 **Tailwind CSS** + **shadcn/ui** - 精美的 UI 组件库
- ✨ **GSAP** - 流畅的滚动动画效果
- 📧 **EmailJS** - 可用的联系表单，直接发送邮件
- 🚀 **GitHub Actions** - 自动构建和部署到 GitHub Pages
- 📱 **响应式设计** - 完美适配各种设备

## 项目结构

```
app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署配置
├── public/                      # 静态资源
├── src/
│   ├── components/ui/          # shadcn/ui 组件
│   ├── sections/               # 页面各个区块
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Education.tsx
│   │   ├── Research.tsx
│   │   ├── Publications.tsx
│   │   ├── PersonalLife.tsx
│   │   ├── Awards.tsx
│   │   ├── Contact.tsx         # EmailJS 联系表单
│   │   ├── VisitorMap.tsx
│   │   └── Footer.tsx
│   ├── App.tsx
│   └── main.tsx
├── .env                        # 环境变量（不提交到 Git）
├── .env.example                # 环境变量示例
├── DEPLOYMENT.md               # 部署指南
├── EMAILJS_SETUP.md           # EmailJS 配置指南
└── package.json
```

## 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd app
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置 EmailJS**（可选，如需联系表单功能）
   - 复制 `.env.example` 为 `.env`
   - 按照 `EMAILJS_SETUP.md` 中的说明配置 EmailJS
   - 填写 `.env` 文件中的配置信息

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **打开浏览器访问** http://localhost:5173/

### 构建生产版本

```bash
npm run build
npm run preview  # 预览构建结果
```

## 部署到 GitHub Pages

详细步骤请查看 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

简要步骤：

1. 在 GitHub 创建仓库
2. 配置 GitHub Secrets（EmailJS 配置）
3. 启用 GitHub Pages（选择 GitHub Actions 作为源）
4. 推送代码到 GitHub
5. 等待自动部署完成

## EmailJS 配置

如需使用联系表单功能，请查看 **[EMAILJS_SETUP.md](./EMAILJS_SETUP.md)**

需要配置的环境变量：
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

## 技术栈

- **框架**: React 19
- **语言**: TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS 3
- **UI 组件**: shadcn/ui
- **动画**: GSAP + ScrollTrigger
- **表单**: EmailJS
- **部署**: GitHub Actions + GitHub Pages

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
npm run lint     # 代码检查
```

## 自定义内容

你可以修改以下文件来自定义网站内容：

- `src/sections/Hero.tsx` - 首页英雄区
- `src/sections/About.tsx` - 关于我
- `src/sections/Education.tsx` - 教育背景
- `src/sections/Research.tsx` - 研究领域
- `src/sections/Publications.tsx` - 论文发表
- `src/sections/PersonalLife.tsx` - 个人生活
- `src/sections/Awards.tsx` - 获奖荣誉
- `src/sections/Contact.tsx` - 联系方式

## 许可证

MIT License
