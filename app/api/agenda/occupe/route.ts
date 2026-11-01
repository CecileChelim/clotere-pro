import { NextResponse } from "next/server";
import { plagesIndisponibles } from "@/lib/agenda";

// Créneaux indisponibles d'un pro sur les 5 prochaines semaines (sans aucun détail sur les événements).
export async function GET(req: Request) {
  const pro = new URL(req.url).searchParams.get("pro") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(pro)) return NextResponse.json({ occupe: [] });
  const debut = new Date();
  const fin = new Date(Date.now() + 35 * 24 * 3600e3);
  const occupe = await plagesIndisponibles(pro, debut, fin);
  return NextResponse.json({ occupe }, { headers: { "Cache-Control": "no-store" } });
}
