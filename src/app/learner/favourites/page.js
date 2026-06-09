import { auth } from "@clerk/nextjs/server";
import FavouritesClient from "@/components/learner/FavouritesClient";
import { getLearnerFavourites } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function LearnerFavouritesPage() {
  const authObject = await auth().catch(() => ({ userId: null }));
  const result = authObject.userId
    ? await getLearnerFavourites(authObject.userId)
    : { data: [], instructors: [], source: "signed-out" };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Favourites
        </p>
        <h1 className="mt-2 text-3xl font-bold">Saved instructors</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Save instructors for comparison before booking.
        </p>
      </section>

      <FavouritesClient
        initialFavourites={result.data}
        instructors={result.instructors}
      />
    </div>
  );
}
