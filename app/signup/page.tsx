"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { professionFromHost, PROFESSIONS, type Profession } from "@/lib/professions-config";

export default function SignupPage() {
  const [profession, setProfession] = useState<Profession>("avocat");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "confirm" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => setProfession(professionFromHost(window.location.host)), []);
  const conf = PROFESSIONS[profession];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/inscription`, data: { profession } },
    });
    if (error) {
      setError(error.message.includes("registered") ? "Un compte existe déjà avec cet email." : "Une erreur est survenue, merci de réessayer.");
      setStatus("error");
      return;
    }
    // Confirmation d'email désactivée → session immédiate ; sinon on attend le clic dans l'email.
    if (data.session) window.location.href = "/inscription";
    else setStatus("confirm");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-950">{conf.brand}</Link>
        <h1 className="mt-10 text-3xl font-medium tracking-tight text-gray-950">Créer votre compte</h1>
        <p className="mt-2 text-sm text-gray-600">7 jours d&apos;essai gratuit, sans carte bancaire.</p>

        {status === "confirm" ? (
          <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-sm text-gray-700 ring-1 ring-black/5">
            Un email de confirmation vient d&apos;être envoyé à <strong>{email}</strong>. Cliquez sur le lien pour continuer votre inscription.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@cabinet.fr"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-950" />
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe (8 caractères min.)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-950" />
            <button type="submit" disabled={status === "sending"} className="w-full rounded-full bg-gray-950 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
              {status === "sending" ? "Création…" : "Créer mon compte"}
            </button>
            {status === "error" && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
        <p className="mt-6 text-sm text-gray-500">
          Déjà un compte ? <Link href="/login" className="font-medium text-gray-950 underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
