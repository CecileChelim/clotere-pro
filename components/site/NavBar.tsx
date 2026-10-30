import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";

const BASE_LINKS = [
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#tarif", label: "Tarif" },
  { href: "/blog", label: "Blog" },
];

export function NavBar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const links = isAuthenticated
    ? BASE_LINKS
    : [...BASE_LINKS, { href: "/login", label: "Connexion" }];

  return (
    <div className="border-b border-line bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="font-serif text-2xl text-ink-2">
          Moneago
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-body transition-colors hover:text-ink-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href={isAuthenticated ? "/dashboard" : "/signup"}
          className="btn-solid whitespace-nowrap"
        >
          {isAuthenticated ? "Espace CGP" : "Créer ma fiche"} <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
