export function hasAnthropicConfig() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function createAnthropicText({ prompt, maxTokens = 600 }) {
  if (!hasAnthropicConfig()) {
    return {
      ok: false,
      mode: "local-fallback",
      error: "ANTHROPIC_API_KEY is not configured."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        mode: "local-fallback",
        error: "Anthropic request failed."
      };
    }

    return {
      ok: true,
      mode: "anthropic",
      text: data?.content?.[0]?.text || ""
    };
  } catch {
    return {
      ok: false,
      mode: "local-fallback",
      error: "Anthropic request failed."
    };
  } finally {
    clearTimeout(timeout);
  }
}
