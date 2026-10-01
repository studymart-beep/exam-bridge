# Exam Bridge v8A — Foundation + Student redesign

## Brand
- Primary green `#166534` / dark `#14532D` / light `#DCFCE7`
- Accent gold `#EAB308` / secondary yellow `#FACC15`
- Background cream `#FFFBEB`, borders soft gold `#FDE68A`
- Text green-black `#052E16`

## New files
- `src/components/brand/Logo.tsx` — open book + bridge arch SVG

## Config
- `tailwind.config.ts` — full new palette + warm shadows
- `src/app/globals.css` — cream body background
- `next.config.ts` — `images.remotePatterns` for Unsplash

## UI primitives restyled
- Button, Card, Input, Badge, Textarea, Select, Modal, ProgressBar,
  Toast, Avatar, Skeleton, Tabs, Dropdown

## Pages
- Landing fully rebuilt (hero, stats, features, subjects, how-it-works, CTA, footer)
- Login / Register with Logo
- Student shell: Sidebar, MobileTabBar, StudentHeader, SubscriptionBanner, ContentLock
- Class-token patches on student/public pages & components (gray → border/primary tokens)

## Untouched (logic)
- All `src/lib/**` data, actions, supabase
- Auth, payments, CBT scoring, middleware

## Assumptions
- Unsplash image loads require network at runtime
- Admin still uses old blue visual until v8B
