# Changelog — Exam Bridge Student Frontend

## v1.0.0 — Initial frontend build

### Public screens
- **Landing** — Hero, feature blocks (PDF / Video / CBT), subject preview row, how-it-works, footer
- **Login** — Email + password form with validation, forgot-password link, toast + redirect to dashboard
- **Register** — Full name, email, password, confirm, terms checkbox; redirects to subscribe
- **Subscribe** — Status banner, ₦5,000 price card, bank details with copy-to-clipboard, file upload, submit → pending
- **Subscribe/Pending** — Waiting-for-verification message
- **Subscribe/Success** — Active subscription confirmation

### Student area
- **Dashboard** — Welcome, subscription chip, continue-learning card, quick tiles, recent activity, notifications preview
- **Subjects** — Search, category filters, 8 subject cards
- **Subject detail** — Courses list with progress bars
- **Course detail** — Topics list with per-topic progress
- **Topic detail** — Video / PDF / Images tabs, Take CBT, Mark as complete
- **CBT list** — Available exams with status badges
- **CBT exam** — Start screen, countdown timer, question card A–D, navigator drawer, next/prev/submit, auto-score
- **CBT result** — Score %, pass/fail, time used, full corrections with explanations, retake
- **Results** — Past attempts list with scores
- **Progress** — Overall ring, per-subject bars, study streak, recently studied
- **Notifications** — Read/unread list, mark all read
- **Profile** — Avatar initials, contact info, subscription block, edit/password/logout
- **Settings** — Change password form, notification toggles, delete account modal

### Infrastructure
- Next.js 15 App Router + React 19 + TypeScript + Tailwind
- Design tokens matching Exam Bridge style guide
- Reusable UI primitives (Button, Input, Card, Badge, ProgressBar, Modal, Toast, Avatar, Skeleton)
- Student layout: desktop sidebar + mobile bottom tab bar
- Typed mock data layer ready for API swap
