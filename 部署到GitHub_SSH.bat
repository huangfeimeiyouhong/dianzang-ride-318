@echo off
chcp 65001 >nul
echo ================================================
echo 🚀 部署到 GitHub（SSH方式）
echo ================================================
echo.

REM 检查 SSH 密钥
ssh -T git@github.com 2>&1 | find "successfully" >nul
if errorlevel 1 (
    echo ⚠️  SSH 密钥未配置或未添加到 GitHub
    echo.
    echo 请先配置 SSH 密钥：
    echo 1. 运行：ssh-keygen -t ed25519 -C "zoe@example.com"
    echo 2. 运行：cat ~/.ssh/id_ed25519.pub
    echo 3. 复制输出的内容
    echo 4. 访问：https://github.com/settings/keys
    echo 5. 点击 "New SSH key"，粘贴并保存
    echo.
    pause
    exit /b 1
)

echo ✅ SSH 密钥已配置
echo.

REM 添加远程仓库（SSH）
echo 📡 配置远程仓库...
git remote remove origin 2>nul
git remote add origin git@github.com:huangfeimeiyouhong/dianzang-ride-318.git
echo.

REM 推送代码
echo 📤 推送到 GitHub...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败，请检查：
    echo 1. 仓库是否存在：https://github.com/huangfeimeiyouhong/dianzang-ride-318
    echo 2. SSH 密钥是否已添加到 GitHub
    echo 3. 网络连接是否正常
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 部署成功！
echo.
echo 📱 启用 GitHub Pages：
echo 1. 访问：https://github.com/huangfeimeiyouhong/dianzang-ride-318/settings/pages
echo 2. Source 选择 "Deploy from a branch"
echo 3. Branch 选择 "main" 和 "/ (root)"
echo 4. 点击 Save
echo.
echo 🌐 几分钟后访问：
echo https://huangfeimeiyouhong.github.io/dianzang-ride-318/test_all_games_v2.html
echo.
pause
