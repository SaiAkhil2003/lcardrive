import { NextResponse } from "next/server";
import { forbiddenResponse, requireAuthenticatedUser } from "@/lib/auth/api";
import { userCanManageInstructor } from "@/lib/auth/ownership";
import {
  getAvailabilityRecords,
  getAvailableSlots,
  saveAvailabilityRecords
} from "@/lib/platformData";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const instructorSlug = searchParams.get("instructorSlug");

  if (!instructorSlug) {
    return NextResponse.json(
      { ok: false, error: "Missing instructorSlug." },
      { status: 400 }
    );
  }

  const [availability, slots] = await Promise.all([
    getAvailabilityRecords(instructorSlug),
    getAvailableSlots(instructorSlug)
  ]);

  return NextResponse.json({
    ok: true,
    source: availability.source,
    availability: availability.data,
    slots: slots.data
  });
}

export async function POST(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => ({}));
  const instructorSlug = body.instructorSlug;

  if (!instructorSlug || !Array.isArray(body.records)) {
    return NextResponse.json(
      { ok: false, error: "Missing availability records." },
      { status: 400 }
    );
  }

  const ownership = await userCanManageInstructor(auth.context.userId, instructorSlug);

  if (!auth.context.isAdmin && !ownership.ok) {
    return forbiddenResponse("Claimed instructor ownership is required.");
  }

  const result = await saveAvailabilityRecords(
    auth.context.userId,
    instructorSlug,
    body.records
  );

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
