import { supabase } from "lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password, full_name, role, matric_no, staff_no } =
      await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    //  Sign up WITH metadata upfront
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name,
          role: role || "student", // default student
          matric_no: matric_no || null,
          staff_no: staff_no || null,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const user = authData.user;
    if (!user) {
      return NextResponse.json(
        { error: "Signup failed: no user returned" },
        { status: 400 }
      );
    }

    //  Success
    return NextResponse.json({
      message: "Signup successful",
      user: {
        id: user.id,
        email: user.email,
        role: role || "student",
        full_name,
        matric_no,
        staff_no,
      },
    });
  } catch (err) {
    console.error("Unexpected signup error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: err.message },
      { status: 500 }
    );
  }
}
