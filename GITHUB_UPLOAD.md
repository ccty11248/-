# 重新上传到 GitHub

## 上传前

1. 解压 `Leaf_GitHub_2026-11-18.zip`。
2. 打开解压后的 `Leaf` 文件夹；里面的 `package.json`、`app`、`components`、`selfhost` 等应放在 GitHub 仓库根目录，不要再额外套一层 `Leaf`。
3. 保留 `.gitignore`、`.npmrc`、`.openai/hosting.json` 和 `selfhost/.env.example`。
4. 不要将你电脑上的真实 `.env`、API 密钥、node_modules 或视频文件补进上传内容。

## 更新已有仓库

如果你已有该仓库的本地克隆，把 `Leaf` 内的文件复制到仓库目录并覆盖同名文件；保留原仓库的 `.git` 目录。

然后在该仓库目录打开 PowerShell：

```powershell
git status
git add .
git diff --cached --stat
git commit -m "Update Leaf subtitle typing practice"
git push
```

提交前检查变更列表：不要包含本地密钥或无关个人文件。如果 push 提示远端存在新提交，先同步远端再处理冲突，不要直接使用强制推送。

也可以使用 GitHub 网页的文件上传入口，上传解压后的文件和文件夹；仅上传 ZIP 文件不会将源码展开成项目目录。

## 不包含的内容

本包是源码备份，不是个人学习数据备份。原浏览器中的单词本、学习记录、本地视频以及后端 Docker 数据卷，需要单独备份。

## 部署

上传 GitHub 只是更新源码，不会自动改变当前 Leaf 网站。当前工程包含 Worker 服务端逻辑；若要迁移部署，需要另行配置支持该工程的托管环境。
