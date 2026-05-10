@echo off
chcp 65001 >nul
echo ==============================================
echo  滇藏骑行游戏 - GitHub Pages 一键部署
echo ==============================================
echo.

REM 设置用户名
set USERNAME=huangfeimeiyouhong
set REPO_NAME=dianzang-ride-318

echo 用户名：%USERNAME%
echo 仓库名：%REPO_NAME%
echo.

REM 检查Git远程仓库是否已配置
git remote -v | find "%USERNAME%/%REPO_NAME%" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 远程仓库已配置
    goto :push
)

echo 📋 请先在GitHub上创建仓库：
echo.
echo   1. 访问：https://github.com/new
echo   2. Repository name: %REPO_NAME%
echo   3. 选择 Public
echo   4. 不要勾选初始化选项
echo   5. 点击 Create repository
echo.
echo 创建完成后，按任意键继续...
pause >nul

echo.
echo 🔗 添加远程仓库...
git remote add origin https://github.com/%USERNAME%/%REPO_NAME%.git

:push
echo.
echo 📤 推送代码到GitHub...
git branch -M main
git push -u origin main

if %errorlevel% == 0 (
    echo.
    echo ✅ 部署成功！
    echo.
    echo ==============================================
    echo   访问地址：
    echo ==============================================
    echo.
    echo 主页面（测试导航）：
    echo   https://%USERNAME%.github.io/%REPO_NAME%/test_all_games_v2.html
    echo.
    echo 上海-外滩钟声：
    echo   https://%USERNAME%.github.io/%REPO_NAME%/prototype_minigame_shanghai.html
    echo.
    echo ==============================================
    echo.
    echo 💡 接下来请手动启用 GitHub Pages：
    echo   1. 访问：https://github.com/%USERNAME%/%REPO_NAME%/settings/pages
    echo   2. Source 选择：Deploy from a branch
    echo   3. Branch 选择：main 和 / (root)
    echo   4. 点击 Save
    echo   5. 等待1-2分钟即可访问
    echo.
    echo 按任意键打开GitHub Pages设置页面...
    pause >nul
    start https://github.com/%USERNAME%/%REPO_NAME%/settings/pages
) else (
    echo.
    echo ❌ 推送失败，请检查：
    echo   1. GitHub仓库是否已创建？
    echo   2. 是否已登录GitHub？
    echo   3. 用户名是否正确？
    echo.
    echo 💡 如果需要登录，请运行：
    echo   git login
    echo.
    pause
)
