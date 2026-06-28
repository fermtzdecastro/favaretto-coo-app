"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBar, ShoppingBag, GitBranch } from "phosphor-react";

const tabs = [
  { label: "Finanzas", href: "/finanzas", icon: ChartBar },
  { label: "Ventas", href: "/ventas", icon: ShoppingBag },
  { label: "Procesos", href: "/procesos", icon: GitBranch },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream-dark bg-surface">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive
                  ? "font-semibold text-text-main"
                  : "font-medium text-text-muted"
              }`}
            >
              <Icon size={22} weight={isActive ? "fill" : "regular"} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
