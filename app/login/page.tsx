"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { professionFromHost, PROFESSIONS, type Profession } from "@/lib/professions-config";

const input = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-950";

function LoginForm() {
  const searchParams = useSearchParams();
  // /inscription renvoie lui-même vers /dashboard si l'inscription est terminée.
  const next = searchParams.get("next") ?? "/inscription";
  const [profession, setProfession] = useState<Profession>("avocat");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => setProfession(professionFromHost(window.location.host)), []);
  const supabase = () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message.includes("confirmed") ? "Confirmez d'abord votre email (lien reçu à l'inscription)." : "Email ou mot de passe incorrect.");
      setStatus("error");
      return;
    }
    window.location.href = next;
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) { setError("Une erreur est survenue, merci de réessayer."); setStatus("error"); return; }
    setStatus("sent");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-950">{PROFESSIONS[profession].brand}</Link>
        <h1 className="mt-10 text-3xl font-medium tracking-tight text-gray-950">
          {mode === "login" ? "Se connecter" : "Mot de passe oublié"}
        </h1>

        {mode === "reset" && status === "sent" ? (
          <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-sm text-gray-700 ring-1 ring-black/5">
            Si un compte existe pour <strong>{email}</strong>, un lien pour choisir un nouveau mot de passe vient d&apos;être envoyé.
          </div>
        ) : (
          <form onSubmit={mode === "login" ? login : reset} className="mt-8 space-y-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@cabinet.fr" className={input} />
            {mode === "login" && (
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className={input} />
            )}
            <button type="submit" disabled={status === "loading"} className="w-full rounded-full bg-gray-950 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
              {status === "loading" ? "…" : mode === "login" ? "Se connecter" : "Recevoir le lien"}
            </button>
            {status === "error" && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}

        <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500">
          <button type="button" onClick={() => { setMode(mode === "login" ? "reset" : "login"); setStatus("idle"); }} className="text-left underline hover:text-gray-950">
            {mode === "login" ? "Mot de passe oublié ?" : "Retour à la connexion"}
          </button>
          <p>Pas encore de compte ? <Link href="/signup" className="font-medium text-gray-950 underline">Créer un compte</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
