# Ledger — Subscription Tracker

A production-structured SaaS app for tracking recurring subscriptions:
dashboard totals, renewal reminders, category analytics, and full CRUD —
built on Next.js App Router, TypeScript, Tailwind, and Supabase.

## Stack

- **Next.js 14** (App Router, Server Components + Route Handlers)
- **TypeScript**
- **Tailwind CSS** (custom design tokens, dark/light mode)
- **Supabase** — Postgres, Auth, Row Level Security, Storage, Edge Functions
- **Recharts** for analytics, **lucide-react** for icons

## Project structure

```
src/
  app/
    (auth)/login, (auth)/signup      # public auth pages
    (dashboard)/dashboard            # stats, upcoming payments, category chart
    (dashboard)/subscriptions        # search/filter/sort, CRUD, CSV export
    (dashboard)/analytics            # trend + category + top subscriptions
    (dashboard)/settings             # profile, currency, data export
    auth/callback                    # Supabase email-confirmation redirect
    layout.tsx / page.tsx            # root layout + marketing landing page
  components/
    ui/                              # Button, Input, Select, Card, Modal, ...
    layout/                          # Sidebar, Navbar, MobileNav, ThemeToggle
    dashboard/                       # StatsCards, charts, upcoming payments
    subscriptions/                   # SubscriptionCard, SubscriptionForm
  hooks/useSubscriptions.ts          # client-side data + CRUD
  lib/
    supabase/{client,server,middleware}.ts
    types.ts, utils.ts, currency.ts, export.ts
  middleware.ts                      # session refresh + route protection
supabase/
  schema.sql                         # tables, enums, RLS policies, storage bucket
  functions/send-reminders/          # daily reminder edge function (+ email)
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, run the contents of `supabase/schema.sql`. This creates:
   - `profiles`, `subscriptions`, `notifications` tables
   - Enum types for category / billing cycle / status
   - Row Level Security policies scoping every row to `auth.uid()`
   - A trigger that creates a `profiles` row on signup
   - A public `subscription-logos` storage bucket with per-user upload policies
3. Copy your Project URL and anon key from **Project Settings → API**.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Email reminders (optional)

`supabase/functions/send-reminders/index.ts` is an Edge Function that scans
active subscriptions daily, creates a `notifications` row for anything due
within its `reminder_days` window, and — if `RESEND_API_KEY` is set — emails
the user via [Resend](https://resend.com).

```bash
supabase functions deploy send-reminders
supabase secrets set RESEND_API_KEY=your-key
```

Then schedule it with `pg_cron` (a ready-to-run snippet is commented at the
bottom of the function file) so it runs once a day.

## Notes on production-readiness

- **Auth**: email/password via Supabase Auth, session refreshed in
  middleware, protected routes redirect unauthenticated users to `/login`.
- **RLS**: every table restricts rows to `auth.uid()` — there is no
  client-side-only access control.
- **Account deletion**: the Settings page has a stub for this; wire it to a
  Route Handler that calls `supabase.auth.admin.deleteUser()` with the
  service-role key (never expose that key to the client).
- **Currency**: prices are stored with an explicit currency per subscription;
  the dashboard/analytics normalize by billing cycle (weekly/monthly/yearly)
  but do not convert between currencies — that would require a live FX rate
  source if you track subscriptions in multiple currencies.
- **Monthly trend chart**: approximates history from each subscription's
  `start_date` since there's no full billing-event ledger. For exact
  historical billing data, add a `billing_events` table populated by the
  reminder function or a payments webhook.
