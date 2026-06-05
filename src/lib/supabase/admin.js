function hasSupabaseAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  );
}

export async function insertWithServiceRole(table, payload) {
  if (!hasSupabaseAdminEnv()) {
    return {
      data: null,
      error: null,
      placeholder: true
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`,
    {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      data: null,
      error: data || { message: "Supabase insert failed" },
      placeholder: false
    };
  }

  return {
    data,
    error: null,
    placeholder: false
  };
}
