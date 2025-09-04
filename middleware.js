import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Role-based route mapping
const roleRoutes = {
  student: ["/dashboard/student"],
  lecturer: ["/dashboard/lecturer"],
  admin: ["/dashboard/admin"],
};

function isAuthorized(role, pathname) {
  if (!roleRoutes[role]) return false;
  return roleRoutes[role].some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Initialize Supabase client bound to cookies
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set(name, value, options);
        },
        remove: (name, options) => {
          res.cookies.delete(name);
        },
      },
    }
  );

  // Fetch and refresh session if expired
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error);
  }

  // Get role cookie
  const role = req.cookies.get("user_role")?.value;

  // If no session OR no role → force login
  if (!session || !role) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Role mismatch → redirect to correct dashboard
  if (!isAuthorized(role, pathname)) {
    const homeUrl = new URL(`/dashboard/${role}`, req.url);
    return NextResponse.redirect(homeUrl);
  }

  // Return response (with refreshed cookies if Supabase rotated them)
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
