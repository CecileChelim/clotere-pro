"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconArrowRight } from "@/components/ui/icons";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="font-serif text-2xl text-ink-2">
        Moneago
      </Link>

      <h1 className="mt-8 font-serif text-2xl text-ink-2">Connexion à votre espace CGP</h1>
      <p className="mt-2 text-sm text-body">
        Recevez un lien de connexion sécurisé par email, sans mot de passe.
      </p>

      {status === "sent" ? (
        <div className="mt-6 rounded-md border border-success bg-success-bg px-4 py-3 text-sm text-success">
          Un lien de connexion vient de vous être envoyé à {email}. Vérifiez votre boîte mail.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@cabinet.fr"
            className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink-2 outline-none focus:border-ink-2"
          />
          <button type="submit" disabled={status === "sending"} className="btn-solid w-full">
            {status === "sending" ? "Envoi..." : "Recevoir le lien de connexion"}
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
        Pas encore de fiche Moneago ?{" "}
        <Link href="/signup" className="text-gold underline">
          Créez votre profil
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
