"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Rendez-vous" },
  { href: "/dashboard/fiche", label: "Ma fiche" },
  { href: "/dashboard/agenda", label: "Agenda" },
  { href: "/dashboard/diffusion", label: "Diffusez votre lien" },
  { href: "/dashboard/visibilite", label: "Visibilité" },
  { href: "/dashboard/abonnement", label: "Abonnement" },
];

export function DashboardNav({ visibilite = false }: { visibilite?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {LINKS.map((link) => {
        const isActive = link.href === "/dashboard/visibilite" ? pathname.startsWith(link.href) : pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-gray-950 text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              {link.label}
              {link.href === "/dashboard/visibilite" && !visibilite && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isActive ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"}`}>Nouveau</span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
