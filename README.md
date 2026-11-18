# Leaf · 个人英语学习空间

Leaf 将视频学习、字幕精读、听音填空、单词本复习与学习统计整合到一个英语学习网站中。

## 功能

- 视频导入、封面更换与合集分类。
- 双语字幕、重点词汇标黄、逐句播放与字幕跟随。
- 视频字幕内打字练习：句末暂停、空格切换单词、Enter 验证；答对继续下一句，答错显示正确拼写并重播后重填。
- 单词本、每日分组训练、拼写与错题练习。
- 学习概览、统计与打卡。
- 可连接自托管转写和语言模型服务；真实语音评分需另行配置语音评分服务。

## 源码目录

- `app/`、`components/`、`hooks/`、`lib/`：网站前端与页面接口。
- `selfhost/`：Python API、Docker 配置和环境变量模板。
- `extensions/leaf-sync/`：B站内嵌播放器同步扩展源码。
- `tests/`：自动化测试。
- `public/`：静态资源及后端、扩展分发包。

## 本地开发

需要 Node.js >= 22.13.0。在项目根目录执行：

```powershell
npm run install:ci
npm run dev
```

打开终端输出的本地地址。构建命令：`npm run build`。

后端的安装和配置见 [selfhost/README.md](selfhost/README.md)。请从 `.env.example` 创建本机 `.env` 后填写自己的配置，不要提交实际密钥。

## 上传与部署说明

参见 [GITHUB_UPLOAD.md](GITHUB_UPLOAD.md)。本项目是 Vinext / React / Cloudflare Worker 工程；上传源码到 GitHub 不会自动发布或替换当前网站，也不是可直接通过 GitHub Pages 托管的纯静态页面。

更换网站域名后，需要同步检查后端 `ALLOWED_ORIGINS`，以及扩展中的站点匹配范围；扩展目前绑定原 Leaf 网站。

学习数据保存在使用者浏览器的 localStorage / IndexedDB 中。本包不包含个人单词、练习记录、导入的视频、后端运行数据和 API 密钥。

## 版本

打包日期：2026-11-18。基础源码提交：`32decb1d31c737e991a0bec4af5c15840ad30d0b`。

本包保留项目源码和锁文件，排除依赖、构建结果、Git 历史、运行缓存和内部测试截图；本说明为分发包新增。

原工程的技术说明见 [docs/FRAMEWORK_README.md](docs/FRAMEWORK_README.md)。
