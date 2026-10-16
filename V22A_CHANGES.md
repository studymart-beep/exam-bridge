# Exam Bridge v22A — Visual overhaul

## Background
- Soft vertical gradient body: mist green → cream/gold (`globals.css`)

## Section component
- `src/components/ui/Section.tsx` — tinted shells (green/gold/blue) with accent bar title

## Premium cards
- `SubjectCard` — gradient, emblem, topic badge, gloss, lift hover
- `TopicCard` — matching language + media chips
- `ExamCard` — CBT list cards (gold/blue rotation)

## Pages updated
- Subjects (student + guest)
- Subject detail topics
- Topic materials grouped in Section
- CBT list + CBT result (score ring + report corrections)
- Dashboard sections (Overview, Quick actions, Activity)
- Landing subjects preview

## Not in this pass (v22B)
- Downloads page / download button relocate
- Logout modal (already partly done in v21)
- PWA launch middleware tweaks

## Assumptions
- Admin list pages inherit body gradient only; full admin section wrapping deferred to keep pass focused
