import { IconCheck } from "@/components/ui/icons";

const ITEMS = ["Hébergé en France", "Conforme RGPD", "Sans engagement"];

export function UtilityBar() {
  return (
    <div className="bg-ink text-bar-text text-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2">
        <ul className="flex flex-wrap items-center gap-4">
          {ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-gold-2" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <a href="mailto:contact@moneago.fr" className="hidden sm:inline hover:text-cream">
          contact@moneago.fr
        </a>
      </div>
    </div>
  );
}
