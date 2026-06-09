import { auth } from "@clerk/nextjs/server";
import LogbookClient from "@/components/learner/LogbookClient";
import { getLearnerLogbook } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function LearnerLogbookPage() {
  const authObject = await auth().catch(() => ({ userId: null }));
  const result = authObject.userId
    ? await getLearnerLogbook(authObject.userId)
    : { data: [], totalMinutes: 0, source: "signed-out" };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Logbook
        </p>
        <h1 className="mt-2 text-3xl font-bold">Learner practice log</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Record supervised practice with date, duration, instructor, suburb,
          skills practised, notes, and verification status.
        </p>
      </section>

      <LogbookClient initialEntries={result.data} totalMinutes={result.totalMinutes} />
    </div>
  );
}
