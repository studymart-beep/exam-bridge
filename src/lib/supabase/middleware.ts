import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

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
          supabaseResponse.cookies.set(name, value, options as never)
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

  if (isAdminLogin) return supabaseResponse;

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

  const protectedPrefixes = [
    "/dashboard",
    "/subjects",
    "/cbt",
    "/progress",
    "/results",
    "/notifications",
    "/profile",
    "/settings",
  ];
  const needsAuth = protectedPrefixes.some(
    (p) => path === p || path.startsWith(p + "/")
  );

  if (needsAuth && !user) {
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("next", path);
    return NextResponse.redirect(u);
  }

  if (user && (path === "/login" || path === "/register")) {
    const u = request.nextUrl.clone();
    u.pathname = "/dashboard";
    return NextResponse.redirect(u);
  }

  return supabaseResponse;
}
