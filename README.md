# NexusCRM

NexusCRM is an AI-powered, multi-tenant sales CRM platform.

## Phase 1 Foundation

- Next.js 14 App Router frontend
- Express backend
- MongoDB + Mongoose data layer
- JWT auth with refresh tokens
- Organization-based tenancy middleware
- Stripe subscription scaffolding for Free, Pro, and Enterprise plans
- Shared API response format

## Project Structure

```txt
apps/
  server/
  web/
```

## Environment

Copy the example files in each app and fill in your local values.

## Run

Use the app-level scripts:

- `npm run dev:web`
- `npm run dev:server`

