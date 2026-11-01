"use client";

/** Champ avec préfixe fixe (ex. « https:// » ou « linkedin.com/in/ ») : l'utilisateur ne tape que la fin,
 *  et s'il colle une URL complète, le préfixe est retiré automatiquement. */
export function PrefixInput({ prefix, value, onChange, placeholder, strip = [] }: {
  prefix: string; value: string; onChange: (v: string) => void; placeholder?: string; strip?: RegExp[];
}) {
  const nettoyer = (v: string) => {
    let s = v.trim();
    for (const re of [/^https?:\/\//i, ...strip]) s = s.replace(re, "");
    return s;
  };
  return (
    <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-gray-950">
      <span className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">{prefix}</span>
      <input className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" value={nettoyer(value)} placeholder={placeholder}
        onChange={(e) => onChange(nettoyer(e.target.value))} />
    </div>
  );
}

export const LINKEDIN_PREFIX = "https://www.linkedin.com/in/";
export const LINKEDIN_STRIP = [/^(www\.)?linkedin\.com\/in\//i];
/** Reconstruit l'URL complète à partir de la partie saisie. */
export const avecPrefixe = (prefix: string, v: string) => (v.trim() ? prefix + v.trim().replace(/^\/+/, "") : null);
