import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Plain Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Client-side login via API
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 401 });

    const role = data.user.user_metadata?.role;
    if (!role)
      return NextResponse.json({ error: "No role found", status: 403 });

    // Return JSON only (no cookies)
    return NextResponse.json({
      message: "Login successful",
      redirect: `/dashboard/${role}`,
      user: { email: data.user.email, role },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
