@echo off
echo ================================================
echo   滇藏骑行游戏 - 手机测试服务器启动工具
echo ================================================
echo.

REM 获取本地IP地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found
)
:found
set LOCAL_IP=%LOCAL_IP:~1%

echo 您的本地IP地址是: %LOCAL_IP%
echo.
echo 正在启动HTTP服务器...
echo.
echo ================================================
echo   手机测试访问地址：
echo ================================================
echo.
echo 在手机浏览器中输入以下地址：
echo.
echo   http://%LOCAL_IP%:8080/test_all_games_v2.html
echo.
echo 或者直接访问某个游戏：
echo   http://%LOCAL_IP%:8080/prototype_minigame_shanghai.html
echo.
echo ================================================
echo   确保手机和电脑在同一个WiFi网络！
echo ================================================
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动Python HTTP服务器
cd /d "%~dp0"
python -m http.server 8080

pause
