## NextJS Inventory Management App

Production-ready inventory management dashboard powered by Next.js (App Router), Prisma/PostgreSQL, and NextAuth for credential-based login with OWNER/PEGAWAI roles.

### Requirements
- Node.js 18+
- PostgreSQL instance reachable from your dev/staging/prod environments
- npm (the repo is locked with `package-lock.json`)

### Environment Variables
Create a `.env` file with at least:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma and API routes. |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT/session encryption (generate a long random string for prod). |
| `SEED_OWNER_EMAIL` | *(optional)* email used when seeding an owner account. |
| `SEED_OWNER_PASSWORD` | *(optional)* password for the seeded owner. |
| `SEED_OWNER_NAME`, `SEED_OWNER_USERNAME` | *(optional)* overrides for seed identity. |

Playwright helpers also accept the optional `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_PORT`, and `PLAYWRIGHT_NO_SERVER=1` flags if you need to customise how tests connect to your dev server.

### Install & Local Development
```bash
npm install
npm run dev
```

### Quality Gates
| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint (must pass before deploy). |
| `npm run build` | Next.js production build (Turbopack). |
| `npm run test` | Playwright E2E tests. Requires a running database and dev server. If the default auto-start fails, start `npm run dev` manually (with correct env vars) and run `PLAYWRIGHT_NO_SERVER=1 npm run test`. |

### Prisma / Database
```bash
npx prisma migrate dev        # iterate locally
npx prisma migrate deploy     # run pending migrations on prod/staging
npx prisma db seed            # seed OWNER + roles (idempotent)
```

Always run `npx prisma migrate deploy` against your production database before deploying the Next.js app and ensure `DATABASE_URL` points to the same instance used by the app runtime.

### Deployment Checklist
1. `npm run lint`
2. Ensure Playwright tests pass (`npm run test` with a running dev server + DB).
3. `npm run build`
4. `npx prisma migrate deploy`
5. Seed mandatory data if required (`npx prisma db seed`)
6. Configure `DATABASE_URL`, `NEXTAUTH_SECRET`, and optional seed/test env vars on your hosting provider.
7. Configure monitoring/logging (Sentry, Vercel Analytics, etc.) if needed.

After finishing the checklist, deploy via Vercel, Docker, or your preferred hosting target.
