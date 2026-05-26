## ADDED Requirements

### Requirement: Multi-stage Dockerfile builds frontend and backend into single image
The Dockerfile SHALL use a multi-stage build. Stage 1 SHALL install frontend dependencies and run `vite build` to produce static files in `dist/`. Stage 2 SHALL install server dependencies, copy the built `dist/` from stage 1, and set `node index.js` as the entrypoint.

#### Scenario: Docker image builds successfully
- **WHEN** `docker build -t mermaid-online .` is executed from the project root
- **THEN** the image builds without errors and contains both the server code and the frontend static files

#### Scenario: Container starts and serves both frontend and API
- **WHEN** the container is started with `docker run -p 3000:3000`
- **THEN** the frontend is accessible at `http://localhost:3000/` and the API at `http://localhost:3000/api/`

### Requirement: Docker image excludes sensitive files
The Dockerfile SHALL include a `.dockerignore` file that excludes `node_modules`, `.env`, `.git`, `server/.env`, `server/data/`, and `openspec/` from the build context.

#### Scenario: .env file is not in the built image
- **WHEN** the Docker image is built
- **THEN** running `docker run --rm <image> cat server/.env` fails or shows no file

#### Scenario: SQLite data is not baked into the image
- **WHEN** the Docker image is built
- **THEN** no `auth.sqlite` file exists in the image's `/app/server/data/` directory

### Requirement: SQLite data persistence via volume
The `docker-compose.yml` SHALL mount a host directory to `/app/server/data` inside the container for SQLite persistence.

#### Scenario: Data survives container restart
- **WHEN** a user registers and the container is restarted with the same volume mount
- **THEN** the user's data is still present after restart

### Requirement: Configuration via environment variables
The container SHALL receive all configuration through environment variables or an `env_file` directive in docker-compose.yml. No secrets SHALL be baked into the image.

#### Scenario: Server reads config from environment
- **WHEN** the container is started with `API_KEY=xxx` in the environment
- **THEN** the server uses that API_KEY at runtime

### Requirement: Express serves frontend static files in production
The Express server SHALL serve the frontend static files from the `dist/` directory when it exists. This SHALL be added as a middleware before the API routes.

#### Scenario: Static files served in production container
- **WHEN** the server starts and `dist/` directory exists relative to server root
- **THEN** requests to `/` return `index.html` and static assets are served correctly

#### Scenario: Dev mode unaffected
- **WHEN** the server starts and `dist/` directory does not exist
- **THEN** the server runs without error, only serving API routes
