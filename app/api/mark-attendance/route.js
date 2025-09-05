import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { studentId, qrToken } = await req.json();

    // Find lecture by token
    const { data: lecture, error: lectureError } = await supabase
      .from("lectures")
      .select("*")
      .eq("qr_code", qrToken)
      .single();

    if (lectureError) throw lectureError;
    if (!lecture) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }

    // Check if student already marked attendance
    const { data: existing } = await supabase
      .from("attendance")
      .select("*")
      .eq("lecture_id", lecture.id)
      .eq("student_id", studentId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Attendance already marked" },
        { status: 400 }
      );
    }

    // Insert attendance
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        lecture_id: lecture.id,
        student_id: studentId,
        marked_at: new Date(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
