/** Markdown simple et sûr pour les articles : ## et ### titres, listes « - », **gras**, *italique*, paragraphes. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s: string) =>
  esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

export function markdownVersHtml(md: string): string {
  const out: string[] = [];
  let liste: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; }
    if (liste.length) { out.push(`<ul>${liste.map((l) => `<li>${inline(l)}</li>`).join("")}</ul>`); liste = []; }
  };
  for (const brut of md.replace(/\r/g, "").split("\n")) {
    const l = brut.trim();
    if (!l) { flush(); continue; }
    if (l.startsWith("### ")) { flush(); out.push(`<h3>${inline(l.slice(4))}</h3>`); continue; }
    if (l.startsWith("## ")) { flush(); out.push(`<h2>${inline(l.slice(3))}</h2>`); continue; }
    if (l.startsWith("# ")) { flush(); out.push(`<h2>${inline(l.slice(2))}</h2>`); continue; }
    if (/^[-*] /.test(l)) { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } liste.push(l.slice(2)); continue; }
    if (liste.length) flush();
    para.push(l);
  }
  flush();
  return out.join("\n");
}

export const nbMots = (md: string) => md.replace(/[#*\-]/g, " ").split(/\s+/).filter(Boolean).length;
