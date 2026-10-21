# Exam Bridge v29 (Passkeys) — changes

## Added
- SETUP_V29.sql — user_passkeys + passkey_challenges
- SETUP_V29.md
- src/lib/passkeys/rp.ts
- src/lib/actions/passkeys.ts
- src/components/shared/BiometricSetup.tsx
- src/components/shared/BiometricLoginButton.tsx

## Changed
- src/components/student/LoginForm.tsx — biometric button
- src/app/(admin)/admin/login/page.tsx — biometric button
- src/components/student/ProfileHub.tsx — BiometricSetup section
- src/components/admin/AdminProfileHub.tsx — BiometricSetup section

## Libraries (already in package.json)
- @simplewebauthn/browser
- @simplewebauthn/server

## Verified (no code change needed)
- InstallPrompt + ServiceWorkerRegister in root layout
- admin-manifest.json start_url = /admin/login

## Assumptions
- Session after WebAuthn via admin.generateLink (magiclink) + verifyOtp(token_hash)
- Service role required for challenges + generateLink
