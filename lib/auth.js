import { supabase } from "./supabaseClient";

export async function getUserSession() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user || null;
  const role = user?.user_metadata?.role || null;
  return { user, role };
}
