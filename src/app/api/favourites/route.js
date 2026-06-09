import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import {
  addFavourite,
  getLearnerFavourites,
  removeFavourite
} from "@/lib/platformData";

export async function GET(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const result = await getLearnerFavourites(auth.context.userId);

  return NextResponse.json({
    ok: true,
    source: result.source,
    favourites: result.data
  });
}

export async function POST(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => ({}));

  if (!body.instructorSlug) {
    return NextResponse.json(
      { ok: false, error: "Missing instructorSlug." },
      { status: 400 }
    );
  }

  const result = await addFavourite(auth.context.userId, body.instructorSlug);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result);
}

export async function DELETE(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => ({}));
  const result = await removeFavourite(auth.context.userId, body.instructorSlug);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result);
}
