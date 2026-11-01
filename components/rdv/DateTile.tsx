import { dateTile } from "@/lib/rdv/format";

export function DateTile({ iso, size = "md", muted = false }: { iso: string; size?: "sm" | "md"; muted?: boolean }) {
  const t = dateTile(iso);
  const sm = size === "sm";
  return (
    <div className={`flex shrink-0 flex-col items-center justify-center rounded-2xl ${muted ? "bg-gray-100 text-gray-500" : "bg-violet-50 text-violet-700"} ${sm ? "h-[76px] w-[68px]" : "h-[104px] w-[92px]"}`}>
      <span className={`font-bold tracking-wide ${sm ? "text-xs" : "text-sm"} ${muted ? "" : "text-violet-500"}`}>{t.mois}</span>
      <span className={`font-extrabold leading-none ${sm ? "text-[28px]" : "text-[40px]"}`}>{t.jour}</span>
      <span className={`mt-1 font-medium ${sm ? "text-xs" : "text-sm"} ${muted ? "" : "text-violet-500"}`}>{t.heure}</span>
    </div>
  );
}
