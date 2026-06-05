import Link from "next/link";

export default function ClerkSetupNotice({ mode }) {
  return (
    <section className="rounded-2xl border bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Clerk setup required
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        {mode === "sign-up" ? "Create your account" : "Sign in to LCarDrive"}
      </h1>

      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Clerk is installed, but local Clerk keys are missing. Add the keys from
        `.env.example`, restart the dev server, then Clerk email/password and
        Google SSO screens will render here.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
        >
          Back home
        </Link>

        <Link
          href={mode === "sign-up" ? "/sign-in" : "/sign-up"}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {mode === "sign-up" ? "Go to sign in" : "Create account"}
        </Link>
      </div>
    </section>
  );
}
