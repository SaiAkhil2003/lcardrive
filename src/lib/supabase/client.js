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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`,
      {
        ...options,
        cache: "no-store",
        signal: controller.signal,
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
  } catch (error) {
    return {
      data: null,
      error: { message: error?.message || "Supabase request failed" },
      placeholder: false
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function insertWithAnonKey(table, payload) {
  return supabaseClientRequest(table, {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });
}
