import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM. Clé : AGENDA_ENC_KEY (32 octets en base64). Format : iv.tag.donnees (base64).
function cle() {
  const k = Buffer.from(process.env.AGENDA_ENC_KEY ?? "", "base64");
  if (k.length !== 32) throw new Error("AGENDA_ENC_KEY manquante ou invalide (32 octets base64)");
  return k;
}
export function chiffrer(txt: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", cle(), iv);
  const data = Buffer.concat([c.update(txt, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}
export function dechiffrer(v: string) {
  const [iv, tag, data] = v.split(".").map((p) => Buffer.from(p, "base64"));
  const d = createDecipheriv("aes-256-gcm", cle(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString("utf8");
}
