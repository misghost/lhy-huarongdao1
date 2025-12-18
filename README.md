
# 智慧算术华容道 (Smart Arithmetic Klotski) - 生产环境部署指南

本项目已针对 **Ubuntu 24.04** 服务器环境进行了生产级优化。为了消除 Tailwind CSS 的 CDN 警告并获得最佳性能，我们采用静态编译方案。

---

## 🚀 生产环境部署步骤 (Ubuntu 24.04)

### 1. 基础环境安装
在 Ubuntu 服务器上安装 Nginx 和必要工具：
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx curl -y
```

### 2. 代码部署
创建目录并将项目文件（`index.html`, `App.tsx`, `tailwind.config.js`, `build.sh` 等）上传：
```bash
sudo mkdir -p /var/www/smart-klotski
sudo chown -R $USER:$USER /var/www/smart-klotski
# 将所有项目文件上传到 /var/www/smart-klotski
```

### 3. 一键编译 CSS (核心步骤)
项目包含一个 `build.sh` 脚本，它会自动下载 Tailwind 编译器并生成生产环境所需的 `dist/output.css`。这样可以彻底消除浏览器控制台的警告。
```bash
cd /var/www/smart-klotski
chmod +x build.sh
./build.sh
```
*运行完成后，你会发现目录中多了 `dist/output.css` 文件。*

### 4. Nginx 站点配置
创建 Nginx 配置文件：
```bash
sudo nano /etc/nginx/sites-available/smart-klotski
```
粘贴以下内容（将 `your_server_ip` 替换为实际 IP 或域名）：
```nginx
server {
    listen 80;
    server_name your_server_ip;
    root /var/www/smart-klotski;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存优化
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|json)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
}
```
启用配置并重启服务：
```bash
sudo ln -s /etc/nginx/sites-available/smart-klotski /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### 5. 权限与防火墙
```bash
sudo ufw allow 'Nginx Full'
sudo chown -R www-data:www-data /var/www/smart-klotski
```

---

## 🔑 关于 API_KEY 的注入
由于本项目是纯前端应用，需要在浏览器环境注入 API Key 供 Gemini AI 使用。
**操作方法**：手动编辑 `index.html`，在 `<head>` 区域最前方（`<meta>` 标签之后）添加以下代码：
```html
<script>window.process = { env: { API_KEY: '你的Gemini-API-Key' } };</script>
```
*安全提示：建议在 Google AI Studio 中限制此 Key 的访问来源（Referrer）仅为您服务器的域名或 IP。*

---
**人工智能程序设计作品**
作者：刘桓语 | 架构：React 19 + Tailwind CLI + Nginx
