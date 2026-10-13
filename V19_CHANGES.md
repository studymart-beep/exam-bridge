# Exam Bridge v19

## Colors
- Page background: `#BBF7D0` (primary.soft / background token)
- Card tints: green `#DCFCE7`, gold `#FEF9C3`, blue `#DBEAFE`
- Borders: green `#86EFAC`, gold `#FDE68A`, blue `#93C5FD`
- Text primary: `#052E16`; secondary: `#166534`
- `Card` supports `tint` + `tintIndex` (index % 3 rotation)
- `cardTintClass(index)` helper in `src/lib/utils.ts`
- CSS utilities: `.card-tint-0|1|2`

## CBT take
- **Submit Exam** always visible in fixed bottom bar
- Confirm modal: unanswered count + Keep Writing / Submit
- Timer end: "Time is up!" modal with 10s countdown + Submit Now
- Auto-submit at 0; inputs disabled while submitting
- Prevent double-submit via ref

## Files
- tailwind.config.ts, globals.css
- src/components/ui/Card.tsx
- src/lib/utils.ts
- src/components/student/TakeExamClient.tsx

## Assumptions
- Resume of expired in-progress attempts left to existing startExam server logic
- Landing/admin pages inherit body background via globals; cards can use tintIndex gradually
