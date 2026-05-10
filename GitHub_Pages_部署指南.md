# 🚀 滇藏骑行游戏 - GitHub Pages 部署指南

## ✅ 已完成
- ✅ Git仓库已初始化
- ✅ 所有HTML文件已提交（27个文件）

## 🎯 下一步：推送到GitHub

### 方法A：使用GitHub网站（推荐，最简单）

#### 1. 创建GitHub仓库
1. 访问：https://github.com/new
2. **Repository name**：输入 `dianzang-ride-318`
3. **Description**：`滇藏骑行游戏 - Route 318 Cycling Game Mini-Games`
4. 选择 **Public**
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 **Create repository**

#### 2. 推送代码到GitHub
复制GitHub显示的命令，或直接使用以下命令（替换`你的用户名`）：

```bash
cd D:/FFOutput/滇藏骑行游戏
git remote add origin https://github.com/你的用户名/dianzang-ride-318.git
git branch -M main
git push -u origin main
```

#### 3. 启用GitHub Pages
1. 进入你的仓库：https://github.com/你的用户名/dianzang-ride-318
2. 点击 **Settings** 标签
3. 左侧菜单找到 **Pages**
4. **Source** 选择 `main` 分支
5. **Folder** 选择 `/ (root)`
6. 点击 **Save**
7. 等待1-2分钟，GitHub会显示你的网站地址：
   ```
   https://你的用户名.github.io/dianzang-ride-318/
   ```

#### 4. 访问游戏
- **测试导航页**：`https://你的用户名.github.io/dianzang-ride-318/test_all_games_v2.html`
- **上海小游戏**：`https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_shanghai.html`

---

### 方法B：使用GitHub CLI（如果你已安装）

```bash
# 安装GitHub CLI（如果还没有）
# 下载：https://cli.github.com/

# 登录GitHub
gh auth login

# 创建仓库并推送
cd D:/FFOutput/滇藏骑行游戏
gh repo create dianzang-ride-318 --public --push --source=. --remote=origin
```

---

## 🌐 部署完成后的访问地址

### 主页面（测试导航）
```
https://你的用户名.github.io/dianzang-ride-318/test_all_games_v2.html
```

### 所有小游戏列表
```
上海-外滩钟声：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_shanghai.html
苏州-园林拼图：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_suzhou.html
南京-梧桐叶落：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_nanjing.html
武汉-黄鹤楼登高：  https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_wuhan.html
宜昌-屈原投江：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_yichang.html
重庆-轻轨穿楼：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_chongqing.html
成都-熊猫喂食：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_chengdu.html
雅安-茶马古道：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_yaan.html
康定-康定情歌：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame.html
新都桥-光影捕捉：  https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_xinduqiao.html
理塘-赛马节：      https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_litang.html
巴塘-弦子舞：      https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_batang.html
林芝-桃花盛开：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_linzhi.html
工布江达-尼洋河漂流：https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_gongbo.html
墨竹工卡-松赞干布猜谜：https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_maizho.html
拉萨-朝圣之路：    https://你的用户名.github.io/dianzang-ride-318/prototype_minigame_lhasa.html
```

---

## 📱 手机测试

部署完成后，在手机浏览器中直接访问上述地址即可测试！

**优点：**
- ✅ 任何设备都能访问
- ✅ 不需要同一WiFi
- ✅ 可以分享给其他人测试
- ✅ 永久有效，免费托管

---

## 💡 快速命令（保存备用）

```bash
# 以后的更新流程
cd D:/FFOutput/滇藏骑行游戏

# 修改文件后...
git add *.html
git commit -m "更新游戏内容"
git push

# 等待1-2分钟，GitHub Pages会自动更新
```

---

## 🎉 完成！

按照上述步骤操作，你就能：
1. ✅ 拥有永久的在线游戏地址
2. ✅ 在任何设备（手机/平板/电脑）上测试
3. ✅ 分享给朋友/测试人员
4. ✅ 免费托管，GitHub Pages永久有效

**需要帮助？**
- 告诉我你的GitHub用户名，我帮你生成准确的命令
- 或者截图你遇到的问题，我帮你解决

祝部署顺利！🚀
