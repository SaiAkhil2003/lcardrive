function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseServiceRoleKey()
  );
}

async function serviceRoleRequest(table, options = {}) {
  if (!hasSupabaseAdminEnv()) {
    return {
      data: null,
      error: null,
      placeholder: true
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const serviceRoleKey = getSupabaseServiceRoleKey();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`,
      {
        ...options,
        cache: "no-store",
        signal: controller.signal,
        method: options.method || "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
          ...(options.headers || {})
        }
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: data || { message: "Supabase service role request failed" },
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
      error: { message: error?.message || "Supabase service role request failed" },
      placeholder: false
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function selectWithServiceRole(path, options = {}) {
  return serviceRoleRequest(path, {
    method: "GET",
    ...options
  });
}

export async function insertWithServiceRole(table, payload) {
  return serviceRoleRequest(table, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateWithServiceRole(path, payload) {
  return serviceRoleRequest(path, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function countWithServiceRole(path) {
  if (!hasSupabaseAdminEnv()) {
    return {
      count: null,
      error: null,
      placeholder: true
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const serviceRoleKey = getSupabaseServiceRoleKey();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`,
      {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "count=exact"
        }
      }
    );

    if (!response.ok) {
      return {
        count: null,
        error: { message: "Supabase count request failed" },
        placeholder: false
      };
    }

    return {
      count: Number(response.headers.get("content-range")?.split("/")?.[1]) || 0,
      error: null,
      placeholder: false
    };
  } catch (error) {
    return {
      count: null,
      error: { message: error?.message || "Supabase count request failed" },
      placeholder: false
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function deleteWithServiceRole(path) {
  return serviceRoleRequest(path, {
    method: "DELETE",
    headers: {
      Prefer: "return=representation"
    }
  });
}
