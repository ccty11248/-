# Leaf · 英语学习空间

Leaf 将视频精听、字幕精读、词汇积累和口语练习整合在同一平台，围绕“观看、理解、收藏、复习、表达”构建学习流程。

## 功能

- 视频资料库：本地视频、视频网址和 SRT / VTT 字幕导入；任务阶段显示；回收站恢复。
- 字幕精读：中英双语、单英语、单中文及隐藏模式；字幕字号调整、重点表达标黄、逐词查词收藏。
- 单词本：多词册、Excel / CSV 导入、AI 补全缺失资料、每日计划、乱序听写、错词重练。
- 练习快捷键：Ctrl+A 重听，Ctrl+Q 查看或隐藏拼写，Enter 提交，Esc 退出。
- 口语：录音回放、文字模型生成连读建议；可选 Azure Speech 音频评分及逐词、音素反馈。

## 技术与目录

前端采用 React、TypeScript、Vinext / Vite；后端采用 Python FastAPI、SQLite、FFmpeg、faster-whisper 和 yt-dlp，通过 Docker Compose 部署。

| 目录 | 内容 |
| --- | --- |
| `app/`、`components/`、`lib/` | 学习界面与业务逻辑 |
| `selfhost/` | 自托管 API、Docker 配置和 Windows 更新脚本 |
| `selfhost/tests/` | 后端接口及任务状态测试 |
| `scripts/`、`worker/` | 前端构建与 Cloudflare Worker 支持 |
| `public/leaf_backend_v4.zip` | Windows 后端更新包 |

## 前端启动

需要 Node.js 22.13.0 或以上版本。

```bash
npm ci
npm run dev
```

打开终端实际显示的本地地址。构建使用 `npm run build`。本项目不是纯静态 GitHub Pages 项目；上传代码不会自动部署网站。原 Sites 托管配置保留在 `.openai/hosting.json`，迁移到其他部署环境时需调整相应配置。模板基础设施说明见 [docs/STARTER.md](docs/STARTER.md)。

## 后端启动

进入 `selfhost`，复制 `.env.example` 为 `.env`，填写配置，再启动服务：

```bash
cd selfhost
cp .env.example .env
# Windows PowerShell 可使用 Copy-Item .env.example .env
# 编辑 .env 后执行：
docker compose up --build -d
```

- `LEAF_API_KEY`：自定义至少 20 字符的随机访问密钥，用于网页连接后端。
- `ALLOWED_ORIGINS`：填写实际网页来源地址，包括本地开发地址。
- `LLM_BASE_URL`、`LLM_MODEL`、`LLM_API_KEY`：可选兼容接口，负责翻译、词汇资料及文字练习建议。
- `AZURE_SPEECH_KEY`、`AZURE_SPEECH_ENDPOINT`：可选，启用真实音频发音评分。

后端默认监听本机 `127.0.0.1:8000`。在线网页连接后端需配置可访问的 HTTPS 服务地址，并在网页“学习设置”填写地址和 `LEAF_API_KEY`。模型服务密钥只配置在后端。

详细说明见 [selfhost/README.md](selfhost/README.md)，现有 Windows 项目升级见 [selfhost/UPDATE-v4.txt](selfhost/UPDATE-v4.txt)。

## 数据与限制

学习记录保存在当前浏览器 localStorage，视频缓存使用 IndexedDB；后端任务及媒体保存在 Docker 数据卷。没有自动跨设备同步。请通过网页备份学习记录，另行备份视频和后端数据卷。

Azure Speech 未配置时不能对真实录音评分，文字模型建议不等同于录音检测。Bilibili 原址嵌入不回传播放时间，需手动选句；平台限制可能阻止下载或嵌入。本地大视频仍可能通过配置的公网隧道上传，导入性能有进一步优化空间。

不要提交真实 `.env`、密钥、录音、个人学习记录或视频原文件。本仓库仅包含配置示例。

## 验证

```bash
npx tsc --noEmit
python -m unittest discover -s selfhost/tests
```

Python 测试需要安装后端依赖。v4 开发阶段已通过类型检查、生产构建和 19 项后端测试；外部服务测试使用模拟响应，不能代替实际部署环境的端到端验证。
