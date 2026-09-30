# Remaining work (after v6 master)

1. **CBT take flow** — `/cbt/[examId]/take` and scoring server action still need full wire-up if not already present (start attempt, save answers, submit, score without exposing `is_correct` to the client until after submit).
2. **Receipt signed URLs** — Admin payments page shows stored path; use `getReceiptSignedUrl` when rendering links if the receipts bucket is private.
3. **Material viewers** — Video/PDF/image still show source text inside ContentLock; embed Cloudflare Stream / PDF iframe when ready.
4. **Progress write-back** — Mark topic progress when materials are completed (Server Action + progress table).
5. **Payment gate product** — Optional: paystack/flutterwave later; current flow is bank transfer + receipt only.
6. **Seed content** — Empty DB shows empty states; admin must create subjects/topics/materials/CBT.
