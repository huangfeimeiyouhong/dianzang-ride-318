@echo off
chcp 65001 >nul
echo ================================================
echo 🚀 部署到 GitHub（HTTPS + Token）
echo ================================================
echo.
echo ⚠️  使用前请先创建 GitHub Personal Access Token：
echo 1. 访问：https://github.com/settings/tokens
echo 2. 点击 "Generate new token (classic)"
echo 3. 勾选 repo 权限
echo 4. 复制生成的 token
echo.

set /p TOKEN="请输入 GitHub Token: "

if "%TOKEN%"=="" (
    echo ❌ Token 不能为空
    pause
    exit /b 1
)

echo.
echo 📡 配置远程仓库...
git remote remove origin 2>nul
git remote add origin https://huangfeimeiyouhong:%TOKEN%@github.com/huangfeimeiyouhong/dianzang-ride-318.git
echo.

echo 📤 推送到 GitHub...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败，请检查 Token 是否正确
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
