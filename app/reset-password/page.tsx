"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setStatus("error"); return; }
    window.location.href = "/inscription";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <h1 className="mb-6 text-3xl font-medium tracking-tight text-gray-950">Nouveau mot de passe</h1>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères minimum"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-950" />
        <button disabled={status === "loading"} className="w-full rounded-full bg-gray-950 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
          Enregistrer
        </button>
        {status === "error" && <p className="text-sm text-red-600">Le lien a expiré : redemandez-en un depuis la page de connexion.</p>}
      </form>
    </div>
  );
}
