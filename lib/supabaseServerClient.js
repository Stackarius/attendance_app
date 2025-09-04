import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function supabaseServerClient() {
  return createServerComponentClient({ cookies });
}
