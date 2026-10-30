"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Vue d'ensemble" },
  { href: "/dashboard/rendez-vous", label: "Rendez-vous" },
  { href: "/dashboard/fiche", label: "Ma fiche" },
  { href: "/dashboard/agenda", label: "Agenda" },
  { href: "/dashboard/diffusion", label: "Diffusez votre lien" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
              isActive ? "bg-ink-2 text-cream" : "text-body hover:bg-card-alt"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
