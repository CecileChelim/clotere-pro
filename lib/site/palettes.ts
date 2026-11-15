/* Palettes proposées à l'étape « Couleurs ». Chaque template les interprète à sa façon :
   - fond / fond2 : fond de page et fond des sections alternées
   - accent       : boutons, chiffres, mises en avant
   - sombre       : sections foncées, titres (Performance : fond du hero) */

export type Palette = { id: string; nom: string; fond: string; fond2: string; accent: string; sombre: string };

export const PALETTES: Palette[] = [
  { id: "sauge", nom: "Sauge", fond: "#FFFFFF", fond2: "#F7F5F0", accent: "#3E5C4B", sombre: "#1F2421" },
  { id: "acide", nom: "Noir & vert acide", fond: "#FAFAF8", fond2: "#FFFFFF", accent: "#C8F169", sombre: "#0E0E0E" },
  { id: "nuit-orange", nom: "Nuit & orange", fond: "#FFFFFF", fond2: "#F9FAFB", accent: "#E8582B", sombre: "#0B1B3F" },
  { id: "bleu-nuit", nom: "Bleu nuit", fond: "#FFFFFF", fond2: "#F2EFE8", accent: "#A33B3B", sombre: "#22223A" },
  { id: "bordeaux", nom: "Bordeaux", fond: "#FFFFFF", fond2: "#F4F2EE", accent: "#7D1538", sombre: "#18181B" },
  { id: "foret", nom: "Forêt", fond: "#FFFFFF", fond2: "#F1F4EF", accent: "#2F5D46", sombre: "#16211B" },
  { id: "marine", nom: "Marine", fond: "#FFFFFF", fond2: "#F2EFEB", accent: "#E8703C", sombre: "#14233F" },
  { id: "anthracite", nom: "Anthracite", fond: "#FFFFFF", fond2: "#F1EFEA", accent: "#6B5B45", sombre: "#1F1F1F" },
  { id: "or-encre", nom: "Or & encre", fond: "#FFFFFF", fond2: "#F6F3EC", accent: "#B39A62", sombre: "#131B3A" },
  { id: "sable-terre", nom: "Sable & terre", fond: "#FFFFFF", fond2: "#F5EDE3", accent: "#C39A74", sombre: "#5A3C2A" },
  { id: "petrole", nom: "Pétrole", fond: "#FFFFFF", fond2: "#EEF2F1", accent: "#C97B5F", sombre: "#1E3D40" },
  { id: "ardoise", nom: "Ardoise", fond: "#FFFFFF", fond2: "#EFF1F6", accent: "#3B4C7A", sombre: "#1F2B4D" },
  { id: "corail", nom: "Corail vif", fond: "#FFFFFF", fond2: "#FFF4F1", accent: "#E8584B", sombre: "#0E1A3A" },
  { id: "emeraude-or", nom: "Émeraude & or", fond: "#FFFFFF", fond2: "#F1F6F2", accent: "#D9AF3E", sombre: "#1F4D3A" },
  { id: "prune", nom: "Prune & corail", fond: "#FFFFFF", fond2: "#F7F1F3", accent: "#EF7349", sombre: "#4A1838" },
];

export const palette = (id: string | null | undefined) => PALETTES.find((p) => p.id === id) ?? PALETTES[0];

/** Texte lisible (blanc ou noir) sur une couleur de fond. */
export function texteSur(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l > 0.45 ? "#0E0E0E" : "#FFFFFF";
}

/** Variables CSS posées sur la racine du site. */
export function variablesPalette(id: string): React.CSSProperties {
  const p = palette(id);
  return {
    "--s-fond": p.fond, "--s-fond2": p.fond2, "--s-accent": p.accent, "--s-sur-accent": texteSur(p.accent),
    "--s-sombre": p.sombre, "--s-sur-sombre": texteSur(p.sombre),
  } as React.CSSProperties;
}
