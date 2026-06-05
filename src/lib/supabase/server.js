import { supabaseClientRequest } from "./client";

export function getSupabaseServerStatus() {
  return {
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_KEY)
  };
}

export async function selectWithAnonKey(path, options = {}) {
  return supabaseClientRequest(path, {
    method: "GET",
    ...options
  });
}
