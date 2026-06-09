"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/import", label: "CSV Import" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" },
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
    </aside>
  );
}
