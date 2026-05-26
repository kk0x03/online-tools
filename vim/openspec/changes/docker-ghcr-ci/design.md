## Context

mermaid-online 是一个 Vue 3 + Express 5 全栈项目，前端通过 Vite 构建为静态文件，后端提供 REST API 和 WebSocket 服务。当前项目没有容器化、没有 CI/CD，部署需要手动操作。

项目结构：前端 `package.json` 在根目录，后端 `package.json` 在 `server/` 目录，SQLite 数据库在 `server/data/`。

## Goals / Non-Goals

**Goals:**
- 单容器部署：前端静态文件 + 后端 API/WebSocket 合并在一个 Docker 镜像中
- 自动化 CI/CD：push main 分支自动构建镜像并推送到 GHCR
- 本地开发便利：docker-compose 一键启动
- 安全：`.env` 和敏感信息不进入镜像和 Git 仓库

**Non-Goals:**
- 不做 Kubernetes 编排
- 不做自动部署到服务器（仅推送到 GHCR）
- 不做 PR 预览环境
- 不做 nginx 反向代理（由 Express 直接 serve 静态文件）

## Decisions

### 1. 多阶段单容器构建

**选择**: 一个 Dockerfile，Stage 1 构建前端，Stage 2 运行后端 + serve 前端静态文件。

**替代方案**: docker-compose 多容器（nginx + node），分离前后端。

**理由**: 项目规模小，单容器减少运维复杂度。Express 的 `express.static` 足以处理静态文件服务，无需 nginx。

### 2. Node.js 20 Alpine 基础镜像

**选择**: `node:20-alpine` 作为构建和运行基础镜像。

**理由**: Alpine 体积小（~50MB vs ~350MB），Node.js 20 是当前 LTS，安全且稳定。

### 3. Express serve 静态文件

**选择**: 在 `server/index.js` 中添加 `app.use(express.static('../dist'))`（仅在检测到 dist 目录时启用）。

**理由**: 最小改动，生产环境自动生效，开发环境不受影响（Vite dev server 仍独立运行）。

### 4. GHCR 作为镜像仓库

**选择**: GitHub Container Registry (`ghcr.io`)。

**替代方案**: Docker Hub。

**理由**: 与 GitHub 原生集成，`GITHUB_TOKEN` 自动可用，无需额外配置凭证，免费私有仓库。

### 5. GitHub Actions 镜像标签策略

**选择**: 每次推送 main 打两个标签 — `latest` 和 `<short-sha>`。

**理由**: `latest` 方便拉取最新版，`<sha>` 方便回滚到特定版本。

### 6. SQLite 持久化

**选择**: Docker volume 映射 `./data:/app/server/data`。

**理由**: 最简方案，适合当前规模。后续如需迁移到 PostgreSQL，仅改 server 端代码。

## Risks / Trade-offs

- **[单点故障]** 单容器意味着前端和后端同时重启 → 可接受，项目规模小
- **[Express 静态性能]** Express serve 静态文件不如 nginx → 可接受，流量小，后续可加 CDN
- **[SQLite 并发]** SQLite 不支持高并发写入 → 可接受，当前用户量小，后续可迁移 PostgreSQL
- **[Alpine 兼容性]** 部分原生模块可能不兼容 → mermaid 和项目依赖无原生模块，风险低
