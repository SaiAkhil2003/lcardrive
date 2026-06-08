import { supabaseClientRequest } from "./client";
import { hasSupabaseAdminEnv } from "./admin";

export function getSupabaseServerStatus() {
  return {
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceRoleKey: hasSupabaseAdminEnv()
  };
}

export async function selectWithAnonKey(path, options = {}) {
  return supabaseClientRequest(path, {
    method: "GET",
    ...options
  });
}
