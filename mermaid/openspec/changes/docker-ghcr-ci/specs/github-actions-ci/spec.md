## ADDED Requirements

### Requirement: CI workflow triggers on push to main
The GitHub Actions workflow SHALL trigger on every push to the `main` branch.

#### Scenario: Push to main triggers the workflow
- **WHEN** a commit is pushed to the `main` branch
- **THEN** the CI workflow starts automatically

#### Scenario: Push to feature branch does not trigger
- **WHEN** a commit is pushed to a non-main branch
- **THEN** the CI workflow does not trigger

### Requirement: Workflow builds and validates the project
The workflow SHALL run `npm ci` and `npm run build` for the frontend, and `npm ci` for the server, to verify the project compiles correctly.

#### Scenario: Build step catches compilation errors
- **WHEN** a commit introduces a frontend build error
- **THEN** the workflow fails at the build step

### Requirement: Workflow builds Docker image
The workflow SHALL build the Docker image using `docker buildx build` after the build validation passes.

#### Scenario: Docker image builds in CI
- **WHEN** the build validation step passes
- **THEN** the Docker image is built successfully using the multi-stage Dockerfile

### Requirement: Workflow pushes image to GHCR
The workflow SHALL push the built Docker image to GitHub Container Registry (`ghcr.io/<owner>/mermaid-online`) with two tags: `latest` and the Git commit short SHA.

#### Scenario: Image pushed with correct tags
- **WHEN** the Docker image build succeeds
- **THEN** the image is pushed to `ghcr.io/<owner>/mermaid-online:latest` and `ghcr.io/<owner>/mermaid-online:<short-sha>`

### Requirement: Workflow uses GITHUB_TOKEN for GHCR authentication
The workflow SHALL use the automatically provided `GITHUB_TOKEN` to authenticate with GHCR. No additional secrets SHALL be required for the registry push.

#### Scenario: Authentication succeeds with GITHUB_TOKEN
- **WHEN** the workflow logs in to GHCR
- **THEN** the login uses `ghcr.io` as the registry, the GitHub actor as username, and `GITHUB_TOKEN` as the password

### Requirement: Root .gitignore prevents committing sensitive files
A `.gitignore` file SHALL exist at the project root that excludes `node_modules/`, `dist/`, `.env`, and `server/data/`.

#### Scenario: .env files are not tracked by git
- **WHEN** `git status` is run
- **THEN** `.env` and `server/.env` files are not listed as untracked
