import Link from "next/link";
import ClaimProfileClient from "@/components/claim/ClaimProfileClient";
import { getInstructorBySlug } from "@/lib/instructors";

export const dynamic = "force-dynamic";

export default async function ClaimProfilePage({ params }) {
  const { data: instructor } = await getInstructorBySlug(params.instructorId);
  const hasClerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  if (!instructor) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900">
        <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Profile not found</h1>

          <p className="mt-3 text-slate-600">
            The instructor profile you are trying to claim is not available.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Search
          </Link>
        </section>
      </main>
    );
  }

  return (
    <ClaimProfileClient
      instructor={instructor}
      hasClerkConfigured={hasClerkConfigured}
    />
  );
}
