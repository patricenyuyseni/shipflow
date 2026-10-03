# ShipFlow

React + Vite client (`client/`), Express + TypeScript API (`server/`), Prisma schema (`prisma/`) on PostgreSQL (Neon).
The browser only talks to the REST API. `DATABASE_URL` and all secrets exist on the server only.

## Setup
```bash
npm install
cp .env.example .env        # fill DATABASE_URL, JWT_SECRET (>=32 chars), ADMIN_EMAIL, ADMIN_PASSWORD
npm run prisma:generate
npm run prisma:migrate -- --name init   # dev; use `npm run prisma:deploy` in production
npm run seed                # creates the first ADMIN
npm run dev                 # client :5173, API :4000
```
Optional: `client/.env` with `VITE_API_BASE_URL` (defaults to `/api`, proxied to :4000 in dev).

## API
Success: `{ "success": true, "data": … }`  Error: `{ "success": false, "error": { "code", "message", "details?" } }`

| Method | Path | Access |
|---|---|---|
| GET | /api/health | public |
| POST | /api/auth/register, /api/auth/login | public (register always creates role USER) |
| GET | /api/auth/me | signed in |
| GET | /api/track/:trackingNumber | public, rate-limited, no personal data |
| POST/GET | /api/shipments | admin |
| GET | /api/shipments/stats | admin; counts by status + latest 5 |
| GET/PATCH/DELETE | /api/shipments/:id | admin |
| PATCH | /api/shipments/:id/status | admin; transactional, records history |
| GET | /api/shipments/:id/history | admin |
| GET | /api/users | admin |
| PATCH | /api/users/:id/role | admin; can't change own role or remove the last admin |
| GET | /api/providers | admin; shows which carriers are configured |

Tracking numbers are `EXO-<year>-<6 digits>`, generated on the server from an atomic per-year counter and enforced unique by the database.
Status flow: CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED (CANCELLED allowed before delivery; DELIVERED/CANCELLED are final).

## Carriers
`server/src/providers` holds optional DHL/FedEx/UPS/USPS adapters. Without credentials they return `PROVIDER_NOT_CONFIGURED`; they never return fake rates or tracking. Internal tracking works without them.

## Client routes
Public: `/`, `/track`, `/track/:trackingNumber`, `/login`.
Admin (sign-in required, role ADMIN): `/app` (overview), `/app/shipments`, `/app/shipments/new`, `/app/shipments/:id`, `/app/shipments/:id/edit`, `/app/users`, `/app/carriers`.
Sign-in uses a 15-minute access token held in memory only, plus a 30-day httpOnly, SameSite=Strict refresh cookie (`sf_refresh`, scoped to `/api/auth`, hash-stored, rotated on every use; reusing an old token revokes all of that user's sessions). Changing a user's role also revokes their sessions. The client and API must share an origin (production serving or the Vite proxy in dev).

## Tests
`npm test` runs validator unit tests. Integration tests (auth, access control, tenant-safe public tracking, tracking numbers, status transitions, history) run only when a migrated database is provided:
```bash
TEST_DATABASE_URL="postgresql://…" npm test
```
Use a throwaway database or Neon branch; the tests create and then delete only their own rows.

## Deploying
In production the API serves the built client from the same origin (`NODE_ENV=production`).
1. Commit `prisma/migrations/` (created by `npm run prisma:migrate`). The container runs `prisma migrate deploy` on start.
2. Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (your public URL) and `NODE_ENV=production` in your host's environment. Never bake them into the image.
3. `docker build -t shipflow . && docker run -p 4000:4000 --env-file .env shipflow`
4. Create the first admin once with `npm run seed` against the production database (with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set temporarily).
