"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const links = [
  {
    href: "/portal/profile",
    label: "My Profile"
  },
  {
    href: "/portal/pricing",
    label: "Pricing"
  },
  {
    href: "/portal/availability",
    label: "Availability"
  },
  {
    href: "/portal/service-areas",
    label: "Service Areas"
  }
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive
                  ? "block rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
                  : "block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t pt-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-xl border px-4 py-3 text-left font-semibold text-slate-800 hover:border-blue-600 hover:text-blue-700"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
