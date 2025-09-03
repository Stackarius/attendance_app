import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// protect routes with role-based checks
export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl;

  // if no session → redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // fetch the user's profile to check role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = profile.role;

  // protect admin dashboard
  if (url.pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // protect lecturer dashboard
  if (url.pathname.startsWith("/dashboard/lecturer") && role !== "lecturer") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // protect student dashboard
  if (url.pathname.startsWith("/dashboard/student") && role !== "student") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return res;
}

// tell Next.js which routes should be checked
export const config = {
  matcher: [
    "/dashboard/:path*", // apply middleware to all dashboard routes
  ],
};
