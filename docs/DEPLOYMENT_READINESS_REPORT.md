# Dunas Concierge Suite — Deployment Readiness Report

Date: 2026-10-30

## Architecture

- Framework: Next.js 16.3.5
- React: 19.2.4
- Node.js: 22.x (the repository deployment contract)
- Package manager: npm (`package-lock.json`)
- Router: App Router under `src/app`
- Rendering: server-rendered and static routes, with Next proxy middleware
- API: browser requests use the same-origin `/api` rewrite; server-side requests
  use `INTERNAL_API_URL`
- Output: `standalone`

## Root cause

The production error is caused by a startup mismatch:

1. `next.config.ts`/the deployed build uses standalone output.
2. `package.json` previously started the application with `next start`.
3. Next rejects `next start` for a standalone build and exits before IISNode can
   serve requests, producing the IISNode `500.1001` response.

The correct startup is `node .next/standalone/server.js`. The application now
uses that command and the build explicitly prepares the standalone bundle.

## Fixes applied

- `next.config.ts`: enabled `output: 'standalone'`.
- `package.json`: changed `build` to prepare the standalone bundle and changed
  `start` to `node .next/standalone/server.js`.
- `scripts/prepare-standalone.cjs`: copies `public/` and `.next/static/` into
  the standalone directory and fails if `server.js` was not generated.
- `README.md`: corrected the Plesk startup file and removed the incompatible
  `next start` instruction.
- This report documents the exact Plesk deployment contract.

No business logic, authentication design, database, Redis, dashboard routes, or
API contracts were changed.

## Environment variables

Required production values:

```text
NODE_ENV=production
PORT=<Plesk-managed application port>
NEXT_PUBLIC_SITE_URL=https://dashboard.dunas-travel.com
NEXT_PUBLIC_FRONTEND_URL=https://dunas-travel.com
NEXT_PUBLIC_API_URL=https://api.dunas-travel.com/api
INTERNAL_API_URL=https://api.dunas-travel.com/api
```

Optional observability values:

```text
NEXT_PUBLIC_SENTRY_DSN=<public Sentry DSN, if enabled>
NEXT_PUBLIC_RELEASE=<release identifier>
```

Do not commit `.env`, `.env.local`, or production secrets.

## Plesk configuration

For the `dashboard.dunas-travel.com` Node.js application:

- Application root: dashboard repository root.
- Application startup file: `.next/standalone/server.js`.
- Application mode: `production`.
- Node.js: 22.x.
- Package manager: npm.
- Build command: `npm ci` followed by `npm run build`.
- Start command: `npm run start` if Plesk starts scripts, otherwise the startup
  file above directly.
- Document root: leave Plesk's Node.js application mapping; do not serve the
  dashboard as a static `httpdocs` site.
- Do not configure `next start`, PM2, Docker, or a second application instance.
- Let Plesk/IIS provide `PORT`; do not hardcode a production port.

The generated standalone directory must contain:

```text
.next/standalone/server.js
.next/standalone/.next/static/
.next/standalone/public/
```

## Build and verification

```powershell
npm ci
npm run typecheck
npm run lint
npm run check:i18n
npm test
npm run build
npm run start
```

When testing the production process locally, use a free port:

```powershell
$env:PORT='3100'
$env:HOSTNAME='127.0.0.1'
npm run start
```

Verify `/`, `/login`, and a locale route such as `/ar/login`. API requests
should use `/api` in the browser and be forwarded by the Next rewrite to
`https://api.dunas-travel.com/api`.

## Verification status

- TypeScript: PASS after the deployment fix.
- Production build: PASS after the deployment fix.
- Standalone server: PASS; `server.js`, `public/`, and `.next/static/` were
  verified in the generated bundle.
- Local smoke test: PASS; `/`, `/en/login`, and `/ar/login` returned HTTP 200
  from `node .next/standalone/server.js`.
- Lint: PASS.
- i18n parity: PASS.
- Tests: PASS; 24 test files and 110 tests.
- Public dashboard: not VPS-verified from this workspace.

## Remaining risks

- Plesk/IIS configuration and public dashboard URLs require VPS-side
  verification.
- The backend public API must be reachable before dashboard authentication and
  server-side requests can be fully accepted.
- The standalone artifact must be deployed as a complete build output; copying
  only `server.js` is insufficient because static assets are required.
