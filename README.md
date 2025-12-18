
# 智慧算术华容道 (Smart Arithmetic Klotski) - 生产环境部署指南

本项目已针对 **Ubuntu 24.04** 服务器环境进行优化。为了消除浏览器控制台的 Tailwind CSS CDN 警告并提升加载速度，我们推荐使用“独立 CLI 编译”方案。

---

## 🚀 完整部署流程 (Ubuntu 24.04)

### 1. 环境准备与 Nginx 安装
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx curl -y
```

### 2. 项目文件配置
创建 Web 根目录并同步代码：
```bash
sudo mkdir -p /var/www/smart-klotski
# 将代码上传至该目录（index.html, App.tsx, tailwind.config.js 等）
sudo chown -R $USER:$USER /var/www/smart-klotski
```

### 3. 消除 Tailwind CDN 警告（生产环境优化）
在服务器上直接生成生产级静态 CSS 文件：

```bash
cd /var/www/smart-klotski

# 下载 Tailwind 独立二进制文件 (x64 架构)
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
chmod +x tailwindcss-linux-x64

# 执行编译（扫描 HTML 和 TSX 文件中的类名并压缩）
./tailwindcss-linux-x64 -o ./dist/output.css --minify

# 修改 index.html 以应用静态 CSS
# 建议手动编辑 index.html，注释掉 <script src="...tailwindcss.com"> 
# 并取消注释 <link href="./dist/output.css" rel="stylesheet">
```

### 4. Nginx 配置
创建站点配置：
```bash
sudo nano /etc/nginx/sites-available/smart-klotski
```
粘贴以下内容（替换 `your_ip`）：
```nginx
server {
    listen 80;
    server_name your_ip_or_domain;
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
启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/smart-klotski /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### 5. 防火墙与权限
```bash
sudo ufw allow 'Nginx Full'
sudo chown -R www-data:www-data /var/www/smart-klotski
```

---

## 🛠️ 关于 API_KEY 的安全建议
由于本项目是纯前端应用，`process.env.API_KEY` 在浏览器端是可见的。
- **推荐方案**：在 Google AI Studio 中，为你的 API Key 设置 **网站限制 (Referrer restrictions)**，仅允许你的服务器域名或 IP 调用。
- **配置方法**：在 `index.html` 的 `<head>` 顶部加入以下代码片段（如果服务器不提供环境变量注入）：
  ```html
  <script>window.process = { env: { API_KEY: '你的密钥' } };</script>
  ```

---

## 💡 为什么这样做？
1.  **性能**：编译后的 `output.css` 仅包含项目中实际用到的样式，体积减少 90% 以上。
2.  **专业性**：解决了 `cdn.tailwindcss.com` 在生产环境下的性能警告和潜在的加载延迟。
3.  **兼容性**：独立 CLI 无需在服务器安装 Node.js 或 NPM，保持了 Ubuntu 系统的简洁。

---
**人工智能程序设计作品**
作者：刘桓语 | 运行环境：Ubuntu 24.04 LTS + Nginx + Tailwind Standalone CLI
