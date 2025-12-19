
# 智慧算术华容道 (Smart Arithmetic Klotski) - 部署与修复指南

如果你看到 `dist/output.css` 404 错误，通常是因为服务器上还没有物理生成这个文件，或者 Nginx 权限不足。

---

## 🛠️ 修复 404 错误步骤

### 1. 运行构建脚本
在你的 Ubuntu 服务器终端，进入项目目录执行以下命令：
```bash
# 赋予脚本执行权限
chmod +x build.sh

# 执行构建（会自动下载编译器并生成 CSS）
./build.sh
```
运行完成后，确认文件已生成：`ls -l dist/output.css`

### 2. 设置目录权限 (非常重要)
Nginx 需要 `www-data` 用户权限才能读取新生成的 `dist` 目录。
```bash
# 将项目目录所有权交给 Nginx 用户
sudo chown -R www-data:www-data /var/www/smart-klotski

# 设置标准文件夹权限
sudo find /var/www/smart-klotski -type d -exec chmod 755 {} \;

# 设置标准文件权限
sudo find /var/www/smart-klotski -type f -exec chmod 644 {} \;
```

### 3. 配置 API Key
手动编辑 `index.html`，将你的 Gemini API Key 填入以下位置：
```javascript
window.process = { env: { API_KEY: "在此处填入你的API_KEY" } };
```

---

## 🚀 Nginx 配置检查 (Ubuntu 24.04)
确保你的 `/etc/nginx/sites-available/smart-klotski` 配置文件正确指向了根目录：
```nginx
server {
    listen 80;
    server_name 你的服务器IP;
    root /var/www/smart-klotski;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
修改后记得重启：`sudo systemctl restart nginx`

---
**人工智能程序设计作品**
作者：刘桓语
