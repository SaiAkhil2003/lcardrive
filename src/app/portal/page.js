import Link from "next/link";

export default function PortalHomePage() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Instructor Portal
      </p>

      <h1 className="mt-2 text-3xl font-bold">Manage your profile</h1>

      <p className="mt-3 max-w-2xl text-slate-600">
        Start with your profile details, then update pricing, availability, and
        service areas from the portal sidebar.
      </p>

      <Link
        href="/portal/profile"
        className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Go to My Profile
      </Link>
    </div>
  );
}
