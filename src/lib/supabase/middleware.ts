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

  // Logged-in users away from auth pages
  if (user && (path === "/login" || path === "/register" || path === "/")) {
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

  return supabaseResponse;
}
