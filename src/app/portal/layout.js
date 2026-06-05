import Link from "next/link";
import PortalSidebar from "@/components/layout/PortalSidebar";

export default function PortalLayout({ children }) {
  const hasClerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            LCarDrive
          </Link>

          <Link
            href="/search"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View Search
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 lg:flex-row">
        <PortalSidebar />
        <section className="min-w-0 flex-1 space-y-6">
          {!hasClerkConfigured && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
              Clerk setup required before portal routes are protected in
              production.
            </div>
          )}
          {children}
        </section>
      </div>
    </main>
  );
}
