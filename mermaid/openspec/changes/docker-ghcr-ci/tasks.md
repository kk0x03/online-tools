## 1. 安全与 Git 基础

- [x] 1.1 创建根目录 `.gitignore`，排除 `node_modules/`、`dist/`、`.env`、`server/data/`、`.DS_Store`
- [x] 1.2 初始化 Git 仓库，确认 `server/.env` 不会被追踪

## 2. Docker 镜像

- [x] 2.1 创建 `.dockerignore`，排除 `node_modules`、`.git`、`.env`、`server/.env`、`server/data/`、`openspec/`、`.claude/`、`.codex/`
- [x] 2.2 创建 `Dockerfile`，Stage 1: Node 20 Alpine 构建前端，Stage 2: Node 20 Alpine 安装 server 依赖并复制 dist
- [x] 2.3 修改 `server/index.js`，添加 `express.static` 中间件在生产模式下 serve `dist/` 目录
- [x] 2.4 创建 `docker-compose.yml`，定义服务：端口映射 3000、volume 映射 `./data:/app/server/data`、`env_file: .env`

## 3. GitHub Actions CI/CD

- [x] 3.1 创建 `.github/workflows/ci.yml`，配置 push main 触发
- [x] 3.2 添加 CI 检查步骤：frontend `npm ci` + `npm run build`，server `npm ci`
- [x] 3.3 添加 Docker 构建步骤：`docker buildx build`
- [x] 3.4 添加 GHCR 推送步骤：登录 `ghcr.io`（使用 `GITHUB_TOKEN`），推送 `latest` + `<short-sha>` 标签

## 4. 验证

- [x] 4.1 本地验证：`docker build` 成功构建镜像
- [x] 4.2 本地验证：`docker compose up` 启动后访问 `http://localhost:3000` 看到前端页面
- [x] 4.3 本地验证：API 和 WebSocket 功能正常
