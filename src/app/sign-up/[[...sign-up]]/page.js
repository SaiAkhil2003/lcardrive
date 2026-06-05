import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import ClerkSetupNotice from "@/components/auth/ClerkSetupNotice";

export default function SignUpPage() {
  const hasClerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-2xl font-bold text-blue-700">
          LCarDrive
        </Link>

        <div className="mt-10 flex justify-center">
          {hasClerkConfigured ? (
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
          ) : (
            <ClerkSetupNotice mode="sign-up" />
          )}
        </div>
      </div>
    </main>
  );
}
