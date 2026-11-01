import { AboutDrawer } from "./AboutDrawer";

export function RdvShell({ cabinet, marque, profession = "avocat", children }: { cabinet: string; marque: string; profession?: "avocat" | "comptable"; children: React.ReactNode }) {
  const init = cabinet.split(/\s+/).filter((w) => /^[A-Za-zÀ-ÿ]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="h-1 bg-violet-600" />
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">{init}</span>
          <span className="text-[15px] font-semibold text-gray-900">{cabinet}</span>
          <span className="ml-auto hidden items-center gap-1.5 text-[13px] text-gray-500 sm:flex">
            🔒 Espace sécurisé <AboutDrawer profession={profession} label={profession === "avocat" ? "Clotere" : "Clotere"} />
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-5 sm:py-12">{children}</main>
      <footer className="pb-8 text-center text-[13px] text-gray-400">
        Prise de rendez-vous propulsée par <AboutDrawer profession={profession} label={marque} className="font-medium text-gray-500 underline-offset-2 hover:text-violet-600 hover:underline" />
      </footer>
    </div>
  );
}

export function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, [string, string]> = {
    "demandé": ["En attente de validation", "bg-amber-50 text-amber-700 ring-amber-200"],
    "confirmé": ["Confirmé", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
    "refusé": ["Refusé", "bg-gray-100 text-gray-600 ring-gray-200"],
    "proposé": ["Nouveaux créneaux proposés", "bg-violet-50 text-violet-700 ring-violet-200"],
    "annulé": ["Annulé", "bg-gray-100 text-gray-600 ring-gray-200"],
  };
  const [label, cls] = map[statut] ?? [statut, "bg-gray-100 text-gray-600 ring-gray-200"];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}
