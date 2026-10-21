# Exam Bridge — Biometric Login (Passkeys) setup

## 1. Run SQL
1. Open Supabase → **SQL Editor**
2. Paste entire **SETUP_V29.sql**
3. Click **Run**

This creates:
- `user_passkeys` (stored credentials + RLS)
- `passkey_challenges` (short-lived WebAuthn challenges)

## 2. Domain requirements
Passkeys only work on:
- `https://` production (e.g. `https://exam-bridge-one.vercel.app`)
- or `http://localhost` for local testing

`NEXT_PUBLIC_SITE_URL` must match the hostname students open (used as WebAuthn RP ID).

## 3. How to use
1. Log in with **email + password** once
2. Open **Profile** → **Biometric Login** → **Enable Fingerprint / Face ID**
3. Approve the system prompt (fingerprint / Face ID / Windows Hello)
4. Next visit: on Login, enter email (or use saved) → **Login with Fingerprint / Face ID**

## 4. Notes
- Password login always remains available
- If the device has no platform authenticator, biometric buttons stay hidden
- Admin and student both use the same passkey tables; redirect after login uses `profiles.role`
