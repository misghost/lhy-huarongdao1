# 智慧算术华容道 (Smart Arithmetic Klotski) - 生产环境部署指南

如果你在浏览器中看到 `output.css 404` 错误，这是因为生产环境不再依赖在线 CDN，需要你在服务器上手动生成一次静态 CSS 文件。

---

## 🚀 修复 404 错误并完成部署

### 1. 执行构建脚本 (核心)
在你的 Ubuntu 服务器终端中，进入项目目录并运行：
```bash
cd /var/www/smart-klotski

# 确保脚本有执行权限
chmod +x build.sh

# 运行构建脚本
./build.sh
```
**脚本会自动完成以下操作：**
- 下载官方 Tailwind 编译器。
- 扫描你的代码中用到的所有 CSS 类。
- 生成压缩后的 `dist/output.css`。

### 2. 验证文件生成
运行以下命令确认文件已存在：
```bash
ls -l dist/output.css
```
如果看到文件信息，说明编译成功。

### 3. Nginx 权限检查
确保 Nginx 进程有权读取生成的文件夹和文件：
```bash
sudo chown -R www-data:www-data /var/www/smart-klotski
sudo chmod -R 755 /var/www/smart-klotski
```

### 4. 刷新浏览器
回到浏览器，**强制刷新**（Ctrl + F5），404 错误消失，界面恢复正常。

---

## 🔑 API_KEY 注入提醒
在 `index.html` 的 `<head>` 标签内，请务必手动填入你的密钥，否则 AI 导师功能将无法使用：
```html
<script>window.process = { env: { API_KEY: '你的实际API密钥' } };</script>
```

---

## 🛠️ 后续维护
如果你修改了 `App.tsx` 中的 UI 样式（例如改变了颜色或边距），你需要再次运行 `./build.sh` 来更新 `output.css`。

---
**人工智能程序设计作品**
作者：刘桓语 | 运行环境：Ubuntu 24.04 LTS + Nginx + Tailwind CLI