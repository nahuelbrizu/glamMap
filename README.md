# GlamMap

Beauty salon discovery and booking app for Buenos Aires. Find nearby salons, book appointments, and manage your beauty routine.

**Stack:** Node.js + Express + TypeScript · PostgreSQL · React + Vite + TypeScript · Tailwind · Google Maps · Google OAuth

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm

### Install dependencies

```bash
pnpm install
```

### Environment variables

Copy and fill in the backend env file:

```bash
cp glammap-backend/.env.example glammap-backend/.env
```

Required variables:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing JWTs |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default 5432) |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL (e.g. `http://localhost:3001/api/auth/google/callback`) |
| `SMTP_HOST` | SMTP server host (optional — emails skipped if missing) |
| `SMTP_PORT` | SMTP port (optional) |
| `SMTP_USER` | SMTP username (optional) |
| `SMTP_PASS` | SMTP password (optional) |
| `SMTP_FROM` | From address for emails (optional) |

### Run in development

```bash
# Backend (port 3001)
cd glammap-backend && pnpm dev

# Frontend (port 5173)
cd glammap-frontend && pnpm dev
```

---

## Seed demo data

The seed script inserts 9 real-ish beauty businesses across Buenos Aires neighbourhoods (Palermo, Recoleta, Centro, San Telmo, Villa Crespo, Belgrano, Caballito, Balvanera, Palermo Soho), each with 3 services, Mon–Sat business hours, and 2 placeholder appointments.

```bash
cd glammap-backend
pnpm seed
```

The script is idempotent — safe to run multiple times. It uses `ON CONFLICT DO NOTHING` so existing rows are never overwritten.

> **Note:** The seed expects the database schema to already exist. Run your migrations first.

---

## Database migrations

Migration SQL files live in `glammap-backend/scripts/migrations/`. Run them in order against your database:

```bash
psql $DATABASE_URL -f glammap-backend/scripts/migrations/001_add_google_refresh_token.sql
psql $DATABASE_URL -f glammap-backend/scripts/migrations/002_postgis_geography.sql  # requires PostGIS
```

The PostGIS migration (`002`) is optional — the app falls back to a Haversine bounding-box query if PostGIS is not available.

---

## Running tests

Integration tests hit a real database. Set `TEST_DATABASE_URL` before running:

```bash
export TEST_DATABASE_URL=postgres://user:pass@localhost:5432/glammap_test
cd glammap-backend && pnpm test
```

Tests cover: auth flow, appointment creation, available slots with closed business, review access control, and favorite toggle.
