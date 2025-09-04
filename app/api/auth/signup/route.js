import { supabase } from "lib/supabaseClient";
import { NextResponse } from "next/server";

async function signUp(
  { email, password, full_name, role, matric_no, staff_no },
  retries = 3
) {
  for (let i = 0; i < retries; i++) {
    try {
      //  Normalize email
      const normalizedEmail = email.trim().toLowerCase();

      // Decide which identifier to include
      const metaData = {
        full_name,
        role,
        ...(role === "student" ? { matric_no } : {}),
        ...(role === "lecturer" || role === "admin" ? { staff_no } : {}),
      };

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: metaData,
        },
      });

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
    const { email, password, full_name, role, matric_no, staff_no } =
      await req.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    //  Role-based validation
    if (role === "student" && !matric_no) {
      return NextResponse.json(
        { error: "Students must provide a matric_no" },
        { status: 400 }
      );
    }

    if ((role === "lecturer" || role === "admin") && !staff_no) {
      return NextResponse.json(
        { error: `${role}s must provide a staff_no` },
        { status: 400 }
      );
    }

    // Sign up user (profiles handled by trigger)
    const authData = await signUp({
      email,
      password,
      full_name,
      role,
      matric_no,
      staff_no,
    });

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User creation failed. Please verify your email." },
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
