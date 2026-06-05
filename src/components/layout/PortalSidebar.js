"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/portal/profile", label: "My Profile" },
  { href: "/portal/pricing", label: "Pricing" },
  { href: "/portal/availability", label: "Availability" },
  { href: "/portal/service-areas", label: "Service Areas" }
];

function getLinkClass(pathname, href) {
  const isActive = pathname === href;

  return isActive
    ? "block rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
    : "block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700";
}

export default function PortalSidebar() {
  const pathname = usePathname();
  const hasClerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  return (
    <aside className="h-fit rounded-2xl border bg-white p-4 shadow-sm lg:w-64">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={getLinkClass(pathname, item.href)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-5 border-t pt-4">
        {hasClerkConfigured ? (
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
            >
              Sign Out
            </button>
          </SignOutButton>
        ) : (
          <Link
            href="/sign-in"
            className="block rounded-xl border px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
          >
            Sign Out
          </Link>
        )}
      </div>
    </aside>
  );
}
