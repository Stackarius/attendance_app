import { supabase } from "./supabaseClient";

export async function getUserSession() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user || null;
  const role = user?.user_metadata?.role || null;
  return { user, role };
}

// Forgot Password
export async function sendPasswordReset(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) throw new Error(error.message);
  return data;
}
