# 智慧算术华容道 (Smart Arithmetic Klotski) - 服务器部署指南

## 项目简介
本项目是一个基于 React 和 TypeScript 开发的纯前端益智游戏。由于采用了原生 ES 模块化加载方案（通过 esm.sh），它不需要复杂的构建编译过程，非常适合直接部署在 Ubuntu 服务器上通过浏览器远程访问。

本作品作为**人工智能程序设计作品**，集成了 Gemini AI 导师功能。

---

## Ubuntu 24.04 远程部署流程

### 1. 准备服务器环境
首先，确保你的 Ubuntu 24.04 服务器已更新，并安装 Nginx 作为 Web 服务器。

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装 Nginx
sudo apt install nginx -y

# 启动并设置 Nginx 开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 上传程序文件
将本项目的所有文件上传到服务器的网页根目录（建议路径：`/var/www/smart-klotski`）。

```bash
# 创建项目目录
sudo mkdir -p /var/www/smart-klotski

# 将当前目录下的所有文件拷贝（假设你在项目目录下）
# 如果你是通过 Git，可以直接在服务器 clone
sudo cp -r ./* /var/www/smart-klotski/

# 设置权限，确保 Nginx 有权访问
sudo chown -R www-data:www-data /var/www/smart-klotski
sudo chmod -R 755 /var/www/smart-klotski
```

### 3. 配置 Nginx
创建一个新的虚拟主机配置文件来托管游戏。

```bash
sudo nano /etc/nginx/sites-available/smart-klotski
```

将以下内容粘贴进去（请将 `your_domain_or_ip` 替换为你的服务器 IP 或域名）：

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    root /var/www/smart-klotski;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 Gzip 压缩以提高加载速度
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

启用配置并重启 Nginx：

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/smart-klotski /etc/nginx/sites-enabled/

# 检查 Nginx 配置语法是否正确
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置防火墙
确保服务器的 80 端口（HTTP）已开放：

```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 5. 关于 API Key
本程序使用 `process.env.API_KEY` 调用 Gemini API。
- **注意**：在纯静态服务器部署中，浏览器环境无法直接读取服务器的 shell 环境变量。
- **方案**：由于本项目结构简单，程序会自动识别托管平台注入的 `API_KEY`。如果你是私人部署且需要 AI 导师功能正常工作，请确保你在访问该网页的环境中已经配置了相应的 Key 注入，或者根据系统要求在 `index.html` 的 script 标签前部进行简单的 global 定义（生产环境请注意密钥安全）。

---

## 访问与验证
打开浏览器，访问 `http://你的服务器IP`。
1. 如果看到“智慧算术华容道”界面，说明部署成功。
2. 尝试完成一次游戏，验证底部的 AI 导师是否能正常给出评价。

## 维护与更新
如果你修改了代码，只需将新文件覆盖到 `/var/www/smart-klotski` 目录，无需重启 Nginx，浏览器刷新即可看到效果。

---
**人工智能程序设计作品**
作者：刘桓语
部署环境：Ubuntu 24.04 LTS + Nginx