## Why

项目目前缺少容器化部署能力和 CI/CD 流水线。需要 Docker 镜像支持以便快速部署，需要 GitHub Actions 自动构建并推送镜像到 GHCR，实现 push main 即发布的自动化流程。

## What Changes

- 新增多阶段 Dockerfile，前端构建 + 后端运行合并为单容器
- 新增 `.dockerignore` 排除不必要的文件进入镜像
- 新增根目录 `.gitignore` 确保 `.env`、`node_modules`、`dist` 等不被提交
- 新增 `docker-compose.yml` 简化本地部署
- 新增 GitHub Actions workflow：push main 自动构建镜像并推送到 GHCR
- 修改 Express server `index.js`，生产模式下 serve 前端静态文件（`express.static`）

## Capabilities

### New Capabilities
- `docker-image`: 多阶段构建的 Docker 镜像，单容器运行前端静态文件 + 后端 API/WebSocket，SQLite 数据通过 volume 持久化
- `github-actions-ci`: CI/CD 流水线，push main 触发构建验证、Docker 镜像构建、推送到 GHCR

### Modified Capabilities
（无现有 spec 需要修改）

## Impact

- **新增文件**: `Dockerfile`, `.dockerignore`, `.gitignore`, `docker-compose.yml`, `.github/workflows/ci.yml`
- **修改文件**: `server/index.js`（添加 `express.static`）
- **依赖**: 无新依赖，使用 Node.js 20 Alpine 基础镜像
- **安全**: 确保 `.env` 不进入镜像和 Git 仓库，运行时通过环境变量或 `env_file` 注入配置
