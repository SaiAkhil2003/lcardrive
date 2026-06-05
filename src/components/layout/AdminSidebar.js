"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/stats", label: "Stats" }
];

function getLinkClass(pathname, href) {
  const isActive = pathname === href;

  return isActive
    ? "block rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
    : "block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700";
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-2xl border bg-white p-4 shadow-sm lg:w-64">
      <Link
        href="/admin"
        className={
          pathname === "/admin"
            ? "block rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            : "block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        }
      >
        Admin Home
      </Link>

      <nav className="mt-3 space-y-2">
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
    </aside>
  );
}
