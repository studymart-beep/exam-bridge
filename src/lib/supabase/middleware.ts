import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function cookieOptions(options?: Record<string, unknown>) {
  return {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    ...options,
  };
}

const PUBLIC_STUDENT = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/subscribe",
  "/subscribe/pending",
  "/subscribe/success",
]);

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(
            name,
            value,
            cookieOptions(options) as never
          )
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";
  const visited = request.cookies.get("eb_visited")?.value === "1";

  // --- Admin routes ---
  if (isAdminLogin) {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") {
        const u = request.nextUrl.clone();
        u.pathname = "/admin/dashboard";
        return NextResponse.redirect(u);
      }
    }
    return supabaseResponse;
  }

  if (isAdminRoute) {
    if (!user) {
      const u = request.nextUrl.clone();
      u.pathname = "/admin/login";
      return NextResponse.redirect(u);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      const u = request.nextUrl.clone();
      u.pathname = "/dashboard";
      return NextResponse.redirect(u);
    }
    return supabaseResponse;
  }

  // --- Student / public ---
  // Set eb_visited on first non-admin visit (readable by JS: httpOnly false)
  if (!visited && !isAdminRoute) {
    supabaseResponse.cookies.set("eb_visited", "1", {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // Returning visitor, not logged in, on landing → login
  if (visited && !user && path === "/") {
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    return NextResponse.redirect(u);
  }

  // Auth callback (password recovery / OAuth code exchange) — always public
  if (path.startsWith("/auth/")) {
    return supabaseResponse;
  }

  // Logged-in users away from login/register/landing — BUT keep /reset-password
  // so recovery sessions can set a new password without being bounced to dashboard
  if (
    user &&
    (path === "/login" || path === "/register" || path === "/")
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const u = request.nextUrl.clone();
    u.pathname =
      profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(u);
  }

  // Guest may browse subjects list (preview) — not other student app routes
  const guestAllowed =
    path === "/subjects" ||
    PUBLIC_STUDENT.has(path) ||
    path.startsWith("/subscribe") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");

  const protectedPrefixes = [
    "/dashboard",
    "/cbt",
    "/downloads",
    "/progress",
    "/results",
    "/notifications",
    "/profile",
    "/settings",
  ];
  // Subject detail requires login (guest uses modal on list)
  const needsAuth =
    protectedPrefixes.some((p) => path === p || path.startsWith(p + "/")) ||
    path.startsWith("/subjects/");

  if (needsAuth && !user) {
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("next", path);
    return NextResponse.redirect(u);
  }

  // ---- Security headers — applied on the final response ----
  const hardened = NextResponse.next({
    request,
    headers: {
      // in case supabaseResponse carried cookies / edits, forward them
      ...Object.fromEntries(supabaseResponse.headers.entries()),
    },
  });
  hardened.headers.set("X-Content-Type-Options", "nosniff");
  hardened.headers.set("X-Frame-Options", "DENY");
  hardened.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
  hardened.headers.set("X-XSS-Protection", "0");
  hardened.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=(), payment=()"
  );
  if (process.env.NODE_ENV === "production") {
    hardened.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  // Copy any cookies set by the supabase session so auth still works.
  const respCookies = supabaseResponse.cookies.getAll();
  for (let i = 0; i < respCookies.length; i++) {
    const { name, value, ...opts } = respCookies[i];
    hardened.cookies.set(name, value, opts);
  }
  // Let Next apply a conservative Content-Security-Policy.
  hardened.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' blob: data: https://images.unsplash.com; " +
      "connect-src 'self' https://*.supabase.co https://api.flutterwave.com " +
      "https://cdnjs.cloudflare.com https://*.cloudflarestream.com; " +
      "frame-src 'self' https://*.flutterwave.com; " +
      "object-src 'none'; base-uri 'self'; form-action 'self'"
  );

  return hardened;
}
