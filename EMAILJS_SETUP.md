# EmailJS 配置指南

本项目使用 EmailJS 来处理联系表单。按照以下步骤配置：

## 步骤 1：注册 EmailJS 账户

1. 访问 [EmailJS 官网](https://www.emailjs.com/)
2. 点击 "Sign Up" 注册免费账户（每月可发送 200 封邮件）
3. 验证你的邮箱地址

## 步骤 2：添加邮件服务

1. 登录后，点击左侧菜单的 "Email Services"
2. 点击 "Add New Service"
3. 选择你的邮件服务商（推荐 Gmail）：
   - **Gmail**: 需要使用 App Password（应用专用密码）
   - **Outlook**: 直接使用账号密码
   - 其他服务商也支持

### 如果使用 Gmail：
1. 前往 [Google App Passwords](https://myaccount.google.com/apppasswords)
2. 生成一个新的应用专用密码
3. 在 EmailJS 中填写：
   - **Service ID**: 自动生成（例如：service_xxxxxxx）
   - **Gmail Address**: 你的 Gmail 地址
   - **App Password**: 刚才生成的 16 位密码

4. 点击 "Create Service"
5. **记下 Service ID**（例如：service_abc1234）

## 步骤 3：创建邮件模板

1. 点击左侧菜单的 "Email Templates"
2. 点击 "Create New Template"
3. 编辑模板内容：

**Subject（主题）**:
```
New Contact from {{from_name}}
```

**Content（邮件正文）**:
```
You have received a new message from your website contact form:

Name: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

---
This email was sent from your personal homepage contact form.
```

4. 点击 "Save"
5. **记下 Template ID**（例如：template_xyz5678）

## 步骤 4：获取 Public Key

1. 点击左侧菜单的 "Account"
2. 在 "API Keys" 部分找到 "Public Key"
3. **复制这个 Public Key**（例如：Ab1Cd2Ef3Gh4Ij5Kl）

## 步骤 5：配置项目环境变量

1. 在项目的 `app` 目录下创建 `.env` 文件：
```bash
cd app
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的配置：
```env
VITE_EMAILJS_SERVICE_ID=service_abc1234
VITE_EMAILJS_TEMPLATE_ID=template_xyz5678
VITE_EMAILJS_PUBLIC_KEY=Ab1Cd2Ef3Gh4Ij5Kl
```

3. 保存文件

## 步骤 6：重启开发服务器

环境变量修改后需要重启服务器：

1. 在终端按 `Ctrl + C` 停止当前服务器
2. 运行 `npm run dev` 重新启动

## 步骤 7：测试表单

1. 打开浏览器访问 http://localhost:5173/
2. 滚动到 "Get In Touch" 部分
3. 填写表单并发送测试消息
4. 检查你的邮箱是否收到邮件

## 常见问题

### Q: 发送失败怎么办？
A: 检查以下几点：
- 确认 `.env` 文件中的三个配置都正确填写
- 确认已重启开发服务器
- 在浏览器控制台（F12）查看错误信息
- 登录 EmailJS 查看 "Email Log" 确认是否有发送记录

### Q: Gmail 发送失败？
A: 需要使用 App Password（应用专用密码），不能使用普通密码。确保：
- 已启用 Gmail 的两步验证
- 使用的是 App Password，不是普通密码

### Q: 免费版有限制吗？
A: EmailJS 免费版限制：
- 每月 200 封邮件
- 2 个邮件服务
- 3 个邮件模板
- 对个人网站来说完全够用

### Q: 如何修改接收邮箱？
A: 在 EmailJS 的邮件模板设置中，可以指定 "To Email" 为固定地址。或者在代码中修改 `Contact.tsx` 文件的 `to_email` 参数。

## 安全提示

- **.env 文件不要提交到 Git**（已在 .gitignore 中配置）
- **Public Key 可以公开**，但 Service ID 和 Template ID 建议保密
- 定期更换 Gmail App Password 提高安全性

## 部署到生产环境

部署到 Vercel/Netlify 时，需要在平台设置环境变量：

**Vercel**:
1. 进入项目 Settings → Environment Variables
2. 添加三个环境变量

**Netlify**:
1. 进入 Site Settings → Environment Variables
2. 添加三个环境变量

环境变量名称必须一致：
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
