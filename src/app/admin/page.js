import Link from "next/link";
import { instructors } from "@/data/instructors";
import { pendingClaims, reviewQueue } from "@/data/adminPlaceholders";
import { clerkAdminRoleSetup } from "@/lib/auth/adminRole";

export default function AdminHomePage() {
  const stats = [
    { label: "Total instructors", value: instructors.length },
    { label: "Pending claims", value: pendingClaims.length },
    { label: "Pending reviews", value: reviewQueue.length },
    { label: "Searches today", value: 131 }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Admin Panel
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          LCarDrive quality control
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Review listings, claims, imports, reviews, and stats. These Phase 1
          screens use placeholder data and do not write to a database.
        </p>

        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          Server-side admin gate: {clerkAdminRoleSetup}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/listings"
          className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-600"
        >
          <h2 className="text-xl font-bold">All listings</h2>
          <p className="mt-2 text-sm text-slate-600">
            Check seeded instructor profiles and claim status.
          </p>
        </Link>

        <Link
          href="/admin/claims"
          className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-600"
        >
          <h2 className="text-xl font-bold">Claims queue</h2>
          <p className="mt-2 text-sm text-slate-600">
            Approve or reject submitted ADI registration numbers later.
          </p>
        </Link>
      </section>
    </div>
  );
}
