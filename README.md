# NexusCRM — AI-Powered Sales Intelligence Platform

**Intikhab Khursheed**  
Frontend & Web Developer | React • Angular • JavaScript  
Email: intikhabkhursheed@gmail.com | Phone: +92 335 9919883  
LinkedIn: [https://www.linkedin.com/in/intikhab-khursheed-afridi-028a51285/](https://www.linkedin.com/in/intikhab-khursheed-afridi-028a51285/)  
GitHub: [https://github.com/IntikhabKhursheed](https://github.com/IntikhabKhursheed)  
Portfolio: [https://intikhabkhurheed.netlify.app](https://intikhabkhurheed.netlify.app)  

---

## Table of Contents
- [Overview](#overview)
- [Why NexusCRM](#why-nexuscrm)
- [Purpose](#purpose)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [AI Integration](#ai-integration)
- [Multi-Tenant SaaS](#multi-tenant-saas)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Contact](#contact)

---

## Overview

NexusCRM is a modern, AI-powered Customer Relationship Management platform built for small and mid-sized businesses. Unlike complex and expensive CRMs like Salesforce or HubSpot, NexusCRM provides intelligent sales tools at an accessible cost, helping businesses manage contacts, deals, and communication more effectively.

It integrates AI to automate tasks such as deal scoring, revenue forecasting, and personalized email generation — turning raw customer and sales data into actionable intelligence.

---

## Why NexusCRM

Small businesses often rely on WhatsApp, Excel, or spreadsheets to manage their clients. This approach leads to lost deals, missed follow-ups, and poor visibility into sales performance.

NexusCRM solves this problem by:
- Providing an easy-to-use interface
- Automating sales intelligence using AI
- Reducing costs compared to enterprise CRMs
- Offering real-time notifications and collaboration tools
- Supporting multi-organization setups with subscription management

---

## Purpose

The primary goals of NexusCRM are:
1. **Simplify sales management:** Track contacts, companies, and deals with a clear pipeline view.
2. **Enable data-driven decisions:** Use AI to score deals, forecast revenue, and generate insights automatically.
3. **Automate repetitive tasks:** Generate personalized emails, meeting briefs, and weekly sales digests automatically.
4. **Enhance collaboration:** Real-time notifications, team roles, and activity logging.
5. **Support small businesses:** Affordable, scalable, and SaaS-ready for multi-organization usage.

In short, NexusCRM empowers businesses to sell smarter, faster, and with intelligence — not just data.

---

## Features

**Phase 1 — Foundation**
- Next.js 14 with App Router
- Node.js + Express backend
- MongoDB + Mongoose
- JWT authentication + refresh tokens
- Stripe subscription setup (Free/Pro/Enterprise)

**Phase 2 — Core CRM**
- Contact and Company Management
- Deals Pipeline with Kanban board
- Activity Logging (emails, calls, meetings, notes)
- Contact timeline view

**Phase 3 — AI Features**
- AI Contact Enrichment
- AI Email Writer (personalized outreach & follow-ups)
- AI Deal Scoring
- AI Meeting Brief Generator
- AI Revenue Forecasting
- AI Weekly Sales Digest

**Phase 4 — Advanced**
- Real-time notifications via Socket.io
- Bulk email campaigns with personalization
- Team management and role-based access
- Custom report builder
- Analytics dashboard (pipeline, revenue, team performance)
- Audit logs for key actions

**Phase 5 — Polish & Deploy**
- Dark/light mode
- Fully mobile responsive
- Security hardening and input validation
- Production-ready deployment on Vercel
- Professional documentation and portfolio-ready setup

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS  
- **Backend:** Node.js + Express  
- **Database:** MongoDB + Mongoose  
- **AI:** Grok API (`llama-3.3-70b-versatile`)  
- **Authentication:** JWT + refresh tokens  
- **Payments:** Stripe (subscription management)  
- **Real-time:** Socket.io  
- **Deployment:** Vercel  

---

## Architecture

NexusCRM uses a **multi-tenant SaaS architecture**:

- **Organization-based isolation:** Each company’s data is completely separated.
- **RBAC:** Role-based access control for owners, admins, managers, and sales reps.
- **AI Services:** All AI features are modular and reusable, connecting to Grok API.
- **Stripe Billing:** Subscription tiers (Free, Pro, Enterprise) with usage limits.
- **Real-time updates:** Socket.io powers live notifications and updates.

---

## Getting Started

**Install dependencies:**
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
