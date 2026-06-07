# NexusCRM

AI-powered, multi-tenant sales CRM built as a monorepo.

## Stack

| Layer    | Tech                          |
| -------- | ----------------------------- |
| Frontend | Next.js 14 (App Router)       |
| Backend  | Express + TypeScript          |
| Database | MongoDB + Mongoose            |
| Auth     | JWT access + refresh tokens   |
| Billing  | Stripe subscription scaffolding |
| AI       | Grok / xAI API                  |

## Project structure

```txt
nexus-crm/
├── apps/
│   ├── server/                 # Express API
│   │   ├── src/
│   │   │   ├── config/         # env, db, stripe
│   │   │   ├── controllers/    # route handlers
│   │   │   ├── middleware/     # auth, org, errors
│   │   │   ├── models/         # Mongoose schemas
│   │   │   ├── routes/         # API route definitions
│   │   │   ├── services/       # email, grok, etc.
│   │   │   ├── utils/          # jwt, api response
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── .env.example        # copy to .env (never commit .env)
│   │   └── package.json
│   └── web/                    # Next.js frontend
│       ├── app/                # pages & layouts
│       ├── components/         # UI components
│       ├── lib/                # api, auth, crm helpers
│       ├── .env.local.example  # copy to .env.local
│       └── package.json
├── package.json                # workspace root scripts
└── README.md
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example files and fill in your local values. **Never commit real secrets.**

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.local.example apps/web/.env.local
```

**Server (`apps/server/.env`)** — required:

- `MONGODB_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — long random strings

**Server** — optional:

- `GROK_API`, `GROK_API_KEY`, or `XAI_API_KEY` — AI provider
- `STRIPE_*` — billing
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — email digest

**Web (`apps/web/.env.local`)**:

- `NEXT_PUBLIC_API_BASE_URL` — defaults to `http://localhost:5000/api`
- `API_ORIGIN` — used by Next.js proxy rewrites (defaults to `http://localhost:5000`)

### 3. Run

Start both apps together:

```bash
npm run dev
```

Or individually:

```bash
npm run dev:server   # http://localhost:5000
npm run dev:web      # http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm run start:server
npm run start:web
```

## Security notes

- `.env`, `.env.local`, and all secret files are gitignored.
- Only `.env.example` / `.env.local.example` belong in git — always use placeholders.
- JWT and Stripe secrets are **required** in production (dev fallbacks are blocked).
- If credentials were ever committed to git, **rotate them immediately** in MongoDB Atlas, Stripe, etc.

## API

- Health: `GET /health`
- All routes: `/api/*` (auth, CRM, billing, AI, organizations)
