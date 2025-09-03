import { supabase } from "lib/supabaseClient";
import { NextResponse } from "next/server";

async function signUp(email, password, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.auth.signUp(
        { email, password },
        { timeout: 30000 }
      );
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err.message, err.cause);
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function POST(req) {
  try {
    const { email, password, full_name, matric_no, role } = await req.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sign up user with retry
    const authData = await signUp(email, password);
    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User creation failed. Please verify your email." },
        { status: 500 }
      );
    }

    // Insert into profiles
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId,
        full_name,
        matric_no: matric_no || null,
        role,
      },
    ]);

    if (profileError) {
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User created successfully. Please verify your email.",
      role,
    });
  } catch (err) {
    console.error("Unexpected error:", {
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: "An unexpected error occurred", details: err.message },
      { status: 500 }
    );
  }
}

// Reject unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method GET not allowed" },
    { status: 405 }
  );
}
export async function PUT() {
  return NextResponse.json(
    { error: "Method PUT not allowed" },
    { status: 405 }
  );
}
export async function DELETE() {
  return NextResponse.json(
    { error: "Method DELETE not allowed" },
    { status: 405 }
  );
}
