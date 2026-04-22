# ApplyIndia Frontend

React + TypeScript + Vite frontend for ApplyIndia.

## Requirements

- Node.js 20 or newer
- npm

## Local Development

Install dependencies:

```bash
npm install
```

Run the app against the local backend:

```bash
npm run local
```

Run the app with the development environment:

```bash
npm run dev
```

## Available Scripts

- `npm run local`: starts Vite with `devlocal` mode
- `npm run dev`: starts Vite with `development` mode
- `npm run build`: runs TypeScript build and creates the production bundle
- `npm run build:dev`: creates a development-mode bundle
- `npm run build:prod`: creates a production-mode bundle
- `npm run lint`: runs ESLint
- `npm run preview`: serves the built app locally

## Environment Modes

The project uses these env files:

- `.env.devlocal`: local frontend + local backend
- `.env.development`: development deployment
- `.env.production`: production deployment

Current API targets:

- `devlocal`: `http://localhost:3000`
- `development`: `https://dev.applyindia.online`
- `production`: `https://applyindia.online`

## Deployment

Deployment is handled by GitHub Actions.

- Push to `devAWS` to deploy the development frontend
- Push to `prodAWS` to deploy the production frontend

The workflows:

- build the Vite app
- upload `dist/` to S3
- upload `index.html` with no-cache headers
- invalidate CloudFront

Workflow files:

- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy-frontend-prod.yml`

## Build Notes

- Production assets are split into smaller chunks during Vite build
- Static hashed assets are cached aggressively
- `index.html` is uploaded separately with no-cache headers so new deployments are picked up immediately
