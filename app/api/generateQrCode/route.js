import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import {supabase} from "@/lib/supabaseClient";

export async function createLecture({
  courseId,
  lecturerId,
  topic,
  scheduledAt,
}) {
  const token = uuidv4(); // Unique QR token

  // Insert lecture into Supabase
  const { data, error } = await supabase
    .from("lectures")
    .insert({
      course_id: courseId,
      lecturer_id: lecturerId,
      topic,
      qr_code: token,
      scheduled_at: scheduledAt,
    })
    .select()
    .single();

  if (error) throw error;

  // Generate QR code image as data URL
  const qrDataURL = await QRCode.toDataURL(token);

  return { lecture: data, qrDataURL };
}
