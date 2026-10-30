# Dunas Concierge Suite

The admin dashboard is a Next.js application using `next-intl` and the Dunas
Travel API.

## Local development

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and set local API values when needed.

## Verification

```bash
npm run typecheck
npm run lint
npm run check:i18n
npm test
npm run build
```

## Plesk deployment

Deploy this project with Plesk's native Next.js hosting:

- **Application type:** Server-side (Next.js)
- **Application mode:** Production
- **Package manager:** npm
- **Startup:** Plesk-managed Next.js startup
- **Node.js:** Node 22

Set these production environment variables in Plesk:

```text
NEXT_PUBLIC_API_URL=https://api.dunas-travel.com/api
INTERNAL_API_URL=https://api.dunas-travel.com/api
NEXT_PUBLIC_FRONTEND_URL=https://dunas-travel.com
```

Install dependencies and build from the application root. Start the app with
`npm run start`; do not configure `.next/standalone/server.js`, PM2, Docker,
or a custom Passenger server.
