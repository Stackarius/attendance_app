import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase client (no cookies)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { email, password, full_name, role, matric_no, staff_no } =
      await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["student", "lecturer", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "student";

    const normalizedEmail = email.trim().toLowerCase();

    // Sign up with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: full_name || null,
          role: userRole,
          matric_no: matric_no || null,
          staff_no: staff_no || null,
        },
      },
    });

    if (authError) {
      console.error("Signup error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const user = authData.user;
    if (!user) {
      console.error("Signup failed: No user returned");
      return NextResponse.json(
        { error: "Signup failed: No user returned" },
        { status: 400 }
      );
    }

    // Auto-login to create client-side session
    const { error: sessionError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (sessionError) {
      console.error("Auto-login error:", sessionError);
      return NextResponse.json(
        { error: sessionError.message },
        { status: 401 }
      );
    }

    // Return JSON only (no cookies)
    return NextResponse.json({
      message: "Signup successful",
      user: {
        id: user.id,
        email: user.email,
        role: userRole,
        full_name: full_name || null,
        matric_no: matric_no || null,
        staff_no: staff_no || null,
      },
      redirect: `/dashboard/${userRole}`,
    });
  } catch (err) {
    console.error("Unexpected signup error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: err.message },
      { status: 500 }
    );
  }
}
