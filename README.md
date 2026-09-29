# Exam Bridge — Student Frontend

Complete student-facing web app for Exam Bridge (JAMB & WAEC prep).

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- Path alias `@/*`

## Getting Started

```bash
cd student
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
student/
├── src/
│   ├── app/
│   │   ├── (public)/          # Landing, login, register, subscribe
│   │   ├── (student)/         # Authenticated student area
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Button, Input, Card, Badge, etc.
│   │   └── student/           # Sidebar, TabBar, CBT, Topic, etc.
│   ├── lib/
│   │   ├── mock/              # Local mock data (swap for API later)
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## What is Mocked

All data lives in `src/lib/mock/`. Replace these imports with real API calls when the backend is ready:

| File | Contents |
|------|----------|
| `user.ts` | Current user, continue-learning, recent activity |
| `subjects.ts` | 8 subjects with slugs, colours, topic counts |
| `courses.ts` | 2–3 courses per subject with progress |
| `topics.ts` | 3–5 topics per course (video/PDF/images/CBT flags) |
| `cbt.ts` | CBT exams with questions, options, explanations |
| `results.ts` | 5 past CBT attempts |
| `notifications.ts` | 5 sample notifications |

**Auth is not wired.** Login/register validate locally and redirect. Logout goes to `/login`.

**CBT scoring** runs client-side: answers are scored on submit and stored in `sessionStorage` for the result page.

**Subscription flow** is UI-only: upload proof → pending → success screens.

## Screens

1. Landing  
2. Login / Register  
3. Subscribe / Pending / Success  
4. Dashboard  
5. Subjects list + detail  
6. Course detail  
7. Topic detail (Video / PDF / Images tabs)  
8. CBT list + exam (timer, navigator, submit)  
9. CBT result (score + corrections)  
10. Results history  
11. Progress  
12. Notifications  
13. Profile  
14. Settings (password, prefs, delete account)

## Design System

- Primary: `#1D4ED8`
- Accent: `#F97316`
- Success / Error / Warning: green / red / amber
- Fonts: Plus Jakarta Sans (headings), Inter (body)
- Mobile-first with bottom tab bar; desktop sidebar

## Deploy to GitHub + Vercel

### Push to GitHub

```bash
cd student
git init
git add .
git commit -m "Exam Bridge student frontend v1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/exam-bridge-student.git
git push -u origin main
```

Create an empty repo on GitHub first (no README). Replace `YOUR_USERNAME`.

### Deploy on Vercel

1. Go to https://vercel.com and sign in with GitHub
2. **Add New Project** → import `exam-bridge-student`
3. Framework: Next.js (auto-detected)
4. Click **Deploy**

Or via CLI:

```bash
npm i -g vercel
cd student
vercel
```

You will get a live URL to test on.

## Admin Phase 2–4 (partial) — what was added

Full admin panel under `/admin/*` (in addition to Phase 1 dashboard):

- **Users** — list, search, filter, detail, suspend/activate/delete  
- **Subjects / Topics / Courses** — CRUD + reorder  
- **CBT** — exam list, detail, question editor + **bulk paste import**  
- **Reports** — charts + CSV export  
- **Notifications** — composer + history  
- **Settings** — price, duration, pass mark, branding  
- **Subscriptions / Payments** — shell only (actions disabled until Phase 15)  
- **Announcements** — list view  

Admin entry: `/admin/dashboard`  
See `ADMIN_PHASE_234_NOTES.md` for the full route/component list.

## v2 — Materials & CBT attachment

- **Topic materials** (`/admin/topics/[topicId]/materials`) — video (Cloudflare ID), PDF, image; reorder, edit, delete  
- **Topic CBT** (`/admin/topics/[topicId]/cbt`) — attach / create / detach exam  
- **Course general CBT** (`/admin/courses/[courseId]/cbt`) — final exam for the course  
- Student: “Take CBT” on topics; “Take General CBT” locked until all topics complete  
- Uploads disabled until backend; see `ADMIN_V2_NOTES.md`

## Notes

- No external UI libraries (no shadcn, MUI, etc.)
- No backend / Supabase / database
- Fully clickable navigation and interactive UI with local state
- Login/Register use mock flow — any valid email + password works for testing
