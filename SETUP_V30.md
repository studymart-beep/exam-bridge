# Supabase Auth URLs (required for password reset)

## Site URL
```
https://exam-bridge-one.vercel.app
```
(no trailing slash)

If your custom domain is different, use that instead.

## Redirect URLs (add ALL of these)
```
https://exam-bridge-one.vercel.app/auth/callback
https://exam-bridge-one.vercel.app/auth/callback?next=/reset-password
https://exam-bridge-one.vercel.app/reset-password
https://exam-bridge-one.vercel.app/**
```

Also keep localhost for local dev if needed:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/reset-password
http://localhost:3000/reset-password
http://localhost:3000/**
```

## Where to set in Supabase
1. Dashboard → Authentication → URL Configuration
2. **Site URL** = `https://exam-bridge-one.vercel.app`
3. **Redirect URLs** = add the list above → Save

## Vercel env
```
NEXT_PUBLIC_SITE_URL=https://exam-bridge-one.vercel.app
```
(no trailing slash)

## Test
1. Deploy this code
2. Set URLs in Supabase
3. Request forgot password
4. Open email link → should land on **Set new password**, not the guest landing page
