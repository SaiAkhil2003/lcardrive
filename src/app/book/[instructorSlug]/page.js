import Link from "next/link";
import BookLessonClient from "@/components/booking/BookLessonClient";
import { getInstructorBySlug, getSuburbSlug } from "@/lib/instructors";
import { getAvailableSlots } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a Lesson | LCarDrive",
  description: "Request a pending lesson booking with an LCarDrive instructor."
};

export default async function BookInstructorPage({ params }) {
  const [{ data: instructor }, slotResult] = await Promise.all([
    getInstructorBySlug(params.instructorSlug),
    getAvailableSlots(params.instructorSlug)
  ]);

  if (!instructor) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Instructor not found</h1>
          <Link
            href="/search"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            LCarDrive
          </Link>
          <Link
            href={`/instructors/${getSuburbSlug(instructor.suburb)}/${instructor.slug}`}
            className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
          >
            View profile
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Lesson Booking
          </p>
          <h1 className="mt-2 text-3xl font-bold">Book {instructor.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Submit a pending request. The instructor or admin can accept,
            decline, or propose an alternate time.
          </p>
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Availability source: {slotResult.source}. Payments stay disabled
            until Stripe test-mode variables and payout readiness are configured.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <BookLessonClient instructor={instructor} slots={slotResult.data} />
        </section>
      </section>
    </main>
  );
}
