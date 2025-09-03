import { supabase } from "lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  // Sign in
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  // Redirect based on role
  if (profile.role === "student") {
    return NextResponse.redirect(new URL("/dashboard/student", req.url));
  }

  if (profile.role === "lecturer") {
    return NextResponse.redirect(new URL("/dashboard/lecturer", req.url));
  }

  if (profile.role === "admin") {
    return NextResponse.redirect(new URL("/dashboard/admin", req.url));
  }

  return NextResponse.redirect(new URL("/", req.url));
}
