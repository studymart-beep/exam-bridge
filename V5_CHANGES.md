# Exam Bridge v5 — Supabase backend

## Added

| Path | Purpose |
|------|---------|
| `schema.sql` | Full DB + RLS + profile trigger |
| `SETUP_GUIDE.md` | Owner setup steps |
| `src/lib/supabase/client.ts` | Browser client |
| `src/lib/supabase/server.ts` | Server client |
| `src/lib/supabase/middleware.ts` | Session + route guards |
| `src/lib/supabase/admin.ts` | Service-role (server only) |
| `middleware.ts` | Next middleware entry |
| `src/lib/data/profile.ts` | Profile + subscription helpers |
| `src/lib/data/subjects.ts` | Subjects/topics/materials queries |
| `src/lib/data/cbt.ts` | Exam queries |
| `src/lib/data/settings.ts` | Settings key/value |
| `src/lib/actions/auth.ts` | signUp / signIn / admin / signOut |
| `src/lib/actions/payments.ts` | Submit / approve / reject |
| `src/components/auth/LoginForm.tsx` | Student login |
| `src/components/auth/RegisterForm.tsx` | Student register |
| `src/components/student/ContentLock.tsx` | Content-level subscription gate |
| `src/app/(admin)/admin/login/page.tsx` | Admin login only |
| `.env.example` | Variable names (blank values) |

## Modified

- `src/app/layout.tsx` — removed mock SubscriptionToggle provider
- `src/app/(public)/login/page.tsx` — real auth
- `src/app/(public)/register/page.tsx` — real auth → `/dashboard`
- `src/app/(student)/subjects/page.tsx` — Supabase subjects
- `src/app/(admin)/admin/layout.tsx` — pass-through for `/admin/login`
- `package.json` — `@supabase/ssr`, `@supabase/supabase-js`

## Intentionally kept for gradual migration

`src/lib/mock/` still exists for pages not fully wired to Supabase yet
(dashboard widgets, some CBT client flows, admin CRUD forms).  
Those pages still render; replace imports with `@/lib/data/*` as you
seed the DB and extend Server Actions.

## Removed (behavior)

- Page-level PageLock on subjects/CBT lists (lists stay visible)
- Floating SubscriptionToggle (status from `profiles.subscription_expires_at`)

## Env vars (never invent values)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## TODOs

- Migrate remaining student/admin pages fully off mocks
- Hide correct answers from client during CBT (score server-side)
- Tighten storage RLS for receipts bucket
- Optional: email confirmation flow

## Assumptions

1. Owner provides real Supabase keys via `.env.local` / Vercel  
2. Admin is created in Supabase Auth then promoted by SQL  
3. Empty subjects table → empty list UI until admin seeds content  
4. Content-level lock uses `profiles.status` + `subscription_expires_at`  
