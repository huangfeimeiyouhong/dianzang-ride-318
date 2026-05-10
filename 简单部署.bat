@echo off
chcp 65001 >nul
echo ==========
echo 滇藏骑行游戏 - 部署到 GitHub
echo ==========
echo.

echo [1/4] 检查 Git 状态...
cd /d D:\FFOutput\滇藏骑行游戏
git status

echo.
echo [2/4] 添加所有游戏文件...
git add prototype_*.html
git add test_all_games*.html
git add 手机测试QR码生成器.html
git add 启动手机测试服务器.bat
git add *.md

echo.
echo [3/4] 提交代码...
git commit -m "🎮 部署16个骑行游戏原型

- 16个站点小游戏（上海→拉萨）
- 测试导航页面
- 手机测试QR码生成器
- 部署和测试指南"

echo.
echo [4/4] 推送到 GitHub...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. GitHub 凭据未配置
    echo 3. 仓库名称不正确
    echo.
    echo 请手动执行：
    echo git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 部署成功！
echo.
echo 📱 接下来启用 GitHub Pages：
echo 1. 访问：https://github.com/huangfeimeiyouhong/dianzang-ride-318/settings/pages
echo 2. Source 选择 "Deploy from a branch"
echo 3. Branch 选择 "main" 和 "/ (root)"
echo 4. 点击 Save
echo.
echo 🌐 等待 2-5 分钟后访问：
echo https://huangfeimeiyouhong.github.io/dianzang-ride-318/test_all_games_v2.html
echo.
pause
