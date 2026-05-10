# 滇藏骑行游戏 - 部署到 GitHub (PowerShell版)
# 使用方法：右键此文件 → 使用 PowerShell 运行

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  滇藏骑行游戏 - 部署到 GitHub" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$USERNAME = "huangfeimeiyouhong"
$REPO_NAME = "dianzang-ride-318"
$REPO_URL = "https://github.com/$USERNAME/$REPO_NAME.git"

# 检查 Git 是否安装
Write-Host "[1/5] 检查 Git 安装..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git 已安装：$gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git 未安装！" -ForegroundColor Red
    Write-Host "请先安装 Git：https://git-scm.com/" -ForegroundColor Yellow
    pause
    exit 1
}

# 检查仓库是否存在
Write-Host ""
Write-Host "[2/5] 检查 GitHub 仓库..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://github.com/$USERNAME/$REPO_NAME" -Method Head -ErrorAction SilentlyContinue
    Write-Host "✅ 仓库已存在" -ForegroundColor Green
} catch {
    Write-Host "❌ 仓库不存在！" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先创建仓库：" -ForegroundColor Yellow
    Write-Host "1. 访问：https://github.com/new" -ForegroundColor Cyan
    Write-Host "2. Repository name: $REPO_NAME" -ForegroundColor Cyan
    Write-Host "3. 选择 Public" -ForegroundColor Cyan
    Write-Host "4. 不要勾选初始化选项" -ForegroundColor Cyan
    Write-Host "5. 点击 Create repository" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

# 进入项目目录
Write-Host ""
Write-Host "[3/5] 添加文件到 Git..." -ForegroundColor Yellow
Set-Location -Path "D:\FFOutput\滇藏骑行游戏"

# 添加文件
git add prototype_*.html
git add test_all_games*.html
git add 手机测试QR码生成器.html
git add 启动手机测试服务器.bat
git add *.md
git add 一键部署到GitHub.bat
git add 部署到GitHub_*.bat
git add 简单部署.bat

Write-Host "✅ 文件已添加" -ForegroundColor Green

# 提交
Write-Host ""
Write-Host "[4/5] 提交代码..." -ForegroundColor Yellow
$commitMessage = @"
🎮 部署16个骑行游戏原型

- 16个站点小游戏（上海→拉萨）
- 测试导航页面
- 手机测试工具
- 部署和测试指南
"@

git commit -m $commitMessage
Write-Host "✅ 代码已提交" -ForegroundColor Green

# 推送
Write-Host ""
Write-Host "[5/5] 推送到 GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  ✅ 部署成功！" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 接下来启用 GitHub Pages：" -ForegroundColor Yellow
    Write-Host "1. 访问：https://github.com/$USERNAME/$REPO_NAME/settings/pages" -ForegroundColor Cyan
    Write-Host "2. Source 选择：Deploy from a branch" -ForegroundColor Cyan
    Write-Host "3. Branch 选择：main 和 / (root)" -ForegroundColor Cyan
    Write-Host "4. 点击 Save" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 等待 2-5 分钟后访问：" -ForegroundColor Yellow
    Write-Host "https://$USERNAME.github.io/$REPO_NAME/test_all_games_v2.html" -ForegroundColor Cyan
    Write-Host ""
    
    # 询问是否打开 GitHub Pages 设置
    $openSettings = Read-Host "是否现在打开 GitHub Pages 设置页面？(Y/N)"
    if ($openSettings -eq 'Y' -or $openSettings -eq 'y') {
        Start-Process "https://github.com/$USERNAME/$REPO_NAME/settings/pages"
    }
} else {
    Write-Host ""
    Write-Host "❌ 推送失败！" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "1. GitHub 凭据未配置" -ForegroundColor Cyan
    Write-Host "2. 网络连接问题" -ForegroundColor Cyan
    Write-Host "3. 仓库权限不足" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "请尝试：" -ForegroundColor Yellow
    Write-Host "1. 运行：git push -u origin main" -ForegroundColor Cyan
    Write-Host "2. 在弹出的窗口中登录 GitHub" -ForegroundColor Cyan
    Write-Host ""
}

pause
