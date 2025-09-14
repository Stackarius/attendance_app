import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { studentId, qrToken } = await req.json();

    if (!studentId || !qrToken) {
      return NextResponse.json(
        { error: "Missing student ID or QR token" },
        { status: 400 }
      );
    }

    // 1. Find lecture by QR token
    const { data: lecture, error: lectureError } = await supabase
      .from("lectures")
      .select("id, topic")
      .eq("qr_code", qrToken)
      .single();

    if (lectureError || !lecture) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }

    // 2. Check if attendance already exists
    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("lecture_id", lecture.id)
      .eq("student_id", studentId)
      .maybeSingle(); 

    if (existing) {
      return NextResponse.json(
        { error: "Attendance already marked" },
        { status: 409 }
      );
    }

    // 3. Insert new attendance record
    const { data, error } = await supabase
      .from("attendance")
      .insert([
        {
          lecture_id: lecture.id,
          student_id: studentId,
          marked_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Attendance marked for ${lecture.topic}`,
      data,
    });
  } catch (err) {
    console.error("Attendance API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
