# NexusCRM

NexusCRM is a multi-tenant, AI-assisted CRM for modern sales teams. It combines contact and deal management, organization-scoped collaboration, real-time notifications, AI workflows, billing, and reporting in one workspace.

## Project Overview

This repository is organized as a monorepo with two applications:

- `client/` - Next.js 14 frontend
- `server/` - Node.js + Express API

The platform is designed around organization isolation. Every authenticated action is scoped to a single organization, and role-based permissions determine what each team member can access.

## Features

- Authentication with access and refresh tokens
- Organization-based tenancy and data isolation
- Contacts, companies, deals, and activities management
- AI workflows powered by Groq
- Real-time notifications with Socket.io
- Team invitations and RBAC permissions
- Campaigns, reports, analytics, and audit logs
- Stripe billing scaffolding
- Mobile-responsive workspace UI

## Tech Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Mongoose
- Database: MongoDB
- Realtime: Socket.io
- AI: Groq API
- Billing: Stripe
- Validation/Security: Helmet, rate limiting, JWT

## Folder Structure

```text
nexus-crm/
├── client/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── config/
│   ├── utils/
│   └── package.json
└── package.json
```

## Environment Variables

### Server

Use `server/.env` for local development.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Environment mode |
| `PORT` | API port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_ORIGIN` | Primary allowed frontend origin |
| `CLIENT_ORIGINS` | Comma-separated allowed frontend origins |
| `GROQ_API_KEY` | Groq API key |
| `GROQ_BASE_URL` | Groq OpenAI-compatible base URL |
| `GROQ_MODEL` | AI model name |
| `JWT_ACCESS_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_FREE_PRICE_ID` | Free plan price id |
| `STRIPE_PRO_PRICE_ID` | Pro plan price id |
| `STRIPE_ENTERPRISE_PRICE_ID` | Enterprise plan price id |
| `GMAIL_USER` | SMTP sender for weekly digests |
| `GMAIL_APP_PASSWORD` | Gmail app password |
| `WEEKLY_DIGEST_FROM` | Optional digest sender override |

### Client

Use `client/.env.local` for local development.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | API base path or absolute URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL |

## Installation

```bash
npm install
```

## Development

Run both applications together:

```bash
npm run dev
```

Run them separately:

```bash
npm run dev:client
npm run dev:server
```

## Build

```bash
npm run build
```

## Testing

Run the server smoke suite:

```bash
npm test
```

The tests cover:

- Authentication flow
- Organization isolation
- RBAC for team management
- AI request validation
- Security headers

## API Overview

All protected routes are prefixed with `/api`.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Organization Scoped Resources

- `/api/organizations/:orgId/contacts`
- `/api/organizations/:orgId/companies`
- `/api/organizations/:orgId/deals`
- `/api/organizations/:orgId/activities`
- `/api/organizations/:orgId/notifications`
- `/api/organizations/:orgId/team`
- `/api/organizations/:orgId/campaigns`
- `/api/organizations/:orgId/reports`
- `/api/organizations/:orgId/analytics`
- `/api/organizations/:orgId/settings`
- `/api/organizations/:orgId/audit-logs`
- `/api/organizations/:orgId/ai`

## AI Features

NexusCRM uses Groq with `llama-3.3-70b-versatile` for:

- Contact and company enrichment
- AI email writing
- Deal scoring
- Meeting briefs
- Revenue forecasting
- Weekly digests

AI requests are logged, org-scoped, and protected by rate limiting.

## Multi-Tenant Architecture

Each organization has its own:

- Contacts
- Companies
- Deals
- Activities
- Campaigns
- Reports
- Notifications
- Audit logs
- Team membership

The backend enforces isolation by resolving the organization from the route and checking the authenticated user’s membership before returning any data.

## Stripe Billing

Billing is designed around organization-level subscriptions. The API includes checkout, portal, and webhook endpoints so subscription changes can be processed outside the main UI flow.

In production, configure:

- Stripe secret key
- Webhook secret
- Price IDs
- Backend webhook URL

## Deployment Guide

### Frontend on Vercel

1. Connect the `client/` folder as the Vercel project root.
2. Set `NEXT_PUBLIC_API_BASE_URL` to your production API URL or `/api` if you proxy it.
3. Set `NEXT_PUBLIC_SOCKET_URL` to your production Socket.io endpoint.
4. Deploy.

### Backend Deployment

Deploy the `server/` app separately on a Node.js host such as Render, Railway, Fly.io, or a VM.

Set production env vars for:

- MongoDB Atlas URI
- JWT secrets
- Groq API key
- Stripe keys and webhook secret
- Allowed client origins

### MongoDB Atlas

1. Create an Atlas cluster.
2. Whitelist your backend host.
3. Set `MONGODB_URI` to the Atlas connection string.
4. Confirm indexes build successfully after first deploy.

### CORS

Set `CLIENT_ORIGIN` or `CLIENT_ORIGINS` to the production frontend domain(s). The server accepts a comma-separated list for multiple deploy targets.

### Stripe Webhook

Point the webhook to:

```text
https://your-backend-domain/api/billing/webhook
```

## Screenshots

Add production screenshots of:

- Landing page
- Contacts and deals workspace
- AI hub
- Team management
- Analytics dashboard

## Future Improvements

- CSV import for contacts and companies
- More advanced forecasting models
- Saved dashboard widgets
- Automated lifecycle campaigns
- Role-specific dashboard views
- Better audit log filters and exports

## Portfolio Notes

NexusCRM is a strong portfolio project because it demonstrates:

- Multi-tenant SaaS design
- Real-time features
- AI integration
- Billing and webhooks
- Secure RBAC and auth
- Production-focused structure and testing
