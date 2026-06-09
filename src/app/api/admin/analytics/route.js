import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/api";
import { getAdminAnalytics } from "@/lib/platformData";

export async function GET(request) {
  const admin = await requireAdminUser(request);

  if (!admin.ok) {
    return admin.response;
  }

  return NextResponse.json({
    ok: true,
    analytics: await getAdminAnalytics()
  });
}
