import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const roleRoutes = {
  student: "/dashboard/student",
  lecturer: "/dashboard/lecturer",
  admin: "/dashboard/admin",
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const role = req.cookies.get("user_role")?.value;

  if (!session || !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const allowed = pathname.startsWith(roleRoutes[role]);
  if (!allowed) {
    return NextResponse.redirect(new URL(roleRoutes[role], req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
