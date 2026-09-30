# Remaining work (after remaining-complete)

## Done in this pass
1. CBT take flow — `/cbt/[examId]/take` + server-side scoring (no `is_correct` on client)
2. Receipt signed URLs on `/admin/payments`
3. Material viewers — Video (Cloudflare Stream), PDF iframe, image gallery
4. Progress write-back — "Mark topic complete" → `progress` table

## Still optional / owner-side
5. **Paystack / Flutterwave** — not required; bank transfer + receipt remains the flow
6. **Seed content** — admin creates subjects, topics, materials, CBT questions in the panel
7. Auto-progress % based on material views (currently manual "Mark complete")
