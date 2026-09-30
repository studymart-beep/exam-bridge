# Exam Bridge

Production student + admin app for JAMB/WAEC CBT practice.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage)

## Setup

1. Copy `.env.example` → `.env.local` and fill:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

2. Run `schema.sql` (and `SETUP_ADDENDUM.md` if needed) in the Supabase SQL Editor.

3. Create Storage bucket `receipts` (private) + policies from SETUP_ADDENDUM.md.

4. Promote an admin:

```sql
update profiles set role = 'admin' where email = 'your-admin@email.com';
```

5. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Routes

**Public:** `/` `/login` `/register` `/subscribe` `/subscribe/pending` `/subscribe/success`  
**Student:** `/dashboard` `/subjects` `/cbt` `/results` `/progress` `/notifications` `/profile` `/settings`  
**Admin:** `/admin/login` `/admin/dashboard` `/admin/users` `/admin/subjects` `/admin/cbt` `/admin/payments` …

## Data

All data comes from Supabase. There is **no mock data layer**.

- Student helpers: `src/lib/data/student/`
- Admin helpers: `src/lib/data/admin/`
- Mutations: `src/lib/actions/` and `src/app/actions/`

## Subscription

- Content lock on materials and CBT start (`ContentLock`)
- Bank transfer + receipt upload → admin approve → 30 days active
