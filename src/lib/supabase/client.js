export function hasSupabaseClientEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function supabaseClientRequest(path, options = {}) {
  if (!hasSupabaseClientEnv()) {
    return {
      data: null,
      error: null,
      placeholder: true
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`,
    {
      ...options,
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      data: null,
      error: data || { message: "Supabase request failed" },
      placeholder: false
    };
  }

  return {
    data,
    error: null,
    placeholder: false
  };
}
