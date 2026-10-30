import Link from "next/link";
import { IconCheck } from "@/components/ui/icons";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Produit",
    links: [
      { href: "/#comment-ca-marche", label: "Comment ça marche" },
      { href: "/#tarif", label: "Tarif" },
      { href: "/#faq", label: "FAQ" },
      { href: "/signup", label: "Créer ma fiche" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/#comparatif", label: "Comparatif" },
      { href: "mailto:contact@moneago.fr", label: "Nous contacter" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU / CGV" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-2xl text-ink-2">Moneago</p>
            <p className="mt-3 max-w-xs text-sm text-body">
              La fiche professionnelle et la prise de rendez-vous en ligne pensées pour les
              conseillers en gestion de patrimoine indépendants.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip text-xs">
                <IconCheck className="h-3.5 w-3.5 text-gold" /> Hébergé en France
              </span>
              <span className="chip text-xs">
                <IconCheck className="h-3.5 w-3.5 text-gold" /> RGPD
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-body hover:text-ink-2">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Moneago. Tous droits réservés.</p>
          <p>Moneago est un produit indépendant, distinct de Clotere.</p>
        </div>
      </div>
    </footer>
  );
}
