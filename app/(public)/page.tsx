import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Hôte sans sous-domaine (localhost, clotere-pro.netlify.app…) : on envoie vers la landing correspondante.
export default async function Accueil() {
  const host = (await headers()).get("host") ?? "";
  redirect(host.startsWith("comptable.") || host.includes("comptelio") ? "/comptable" : "/avocat");
}
