// Format minimal pour les descriptions de service : des lignes de texte
// normales, et des lignes commençant par "- " regroupées en liste à puces.
// Volontairement simple (pas de markdown complet) pour rester facile à
// saisir dans un <textarea> côté CGP.

export type DescriptionBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };

export function parseServiceDescription(text: string): DescriptionBlock[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const blocks: DescriptionBlock[] = [];
  let currentList: string[] = [];

  function flushList() {
    if (currentList.length > 0) {
      blocks.push({ type: "ul", items: currentList });
      currentList = [];
    }
  }

  for (const line of lines) {
    if (line.startsWith("- ")) {
      currentList.push(line.slice(2).trim());
    } else {
      flushList();
      blocks.push({ type: "p", text: line });
    }
  }
  flushList();

  return blocks;
}
