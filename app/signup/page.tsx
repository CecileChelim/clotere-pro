"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { IconArrowRight } from "@/components/ui/icons";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-2xl text-ink-2">
          Moneago
        </Link>

        <h1 className="mt-8 font-serif text-2xl text-ink-2">Créer ma fiche professionnelle</h1>
        <p className="mt-2 text-sm text-body">
          Recevez un lien de connexion par email pour démarrer votre inscription. Pas de mot de
          passe à retenir.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-md border border-success bg-success-bg px-4 py-3 text-sm text-success">
            Un lien vient de vous être envoyé à {email}. Ouvrez-le pour commencer votre fiche.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@cabinet.fr"
              className="input"
            />
            <button type="submit" disabled={status === "sending"} className="btn-solid w-full">
              {status === "sending" ? "Envoi..." : "Recevoir le lien d'inscription"}
              <IconArrowRight className="h-4 w-4" />
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600">
                Une erreur est survenue. Merci de réessayer dans quelques instants.
              </p>
            )}
          </form>
        )}

        <p className="mt-6 text-sm text-muted">
          Déjà une fiche Moneago ?{" "}
          <Link href="/login" className="text-gold underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
