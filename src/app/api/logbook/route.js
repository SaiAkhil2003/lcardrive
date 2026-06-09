import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import { createLogbookEntry, getLearnerLogbook } from "@/lib/platformData";

export async function GET(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const result = await getLearnerLogbook(auth.context.userId);

  return NextResponse.json({
    ok: true,
    source: result.source,
    entries: result.data,
    totalMinutes: result.totalMinutes
  });
}

export async function POST(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => ({}));
  const result = await createLogbookEntry(auth.context.userId, body);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result);
}
