import Image from "next/image";
import type { ReactNode } from "react";
import type { ProfessionId } from "@/lib/landing-config";
import { EXEMPLES } from "./exemples";

type P = { p?: ProfessionId };

const shadow = "shadow-[0px_24px_48px_0px_rgba(13,10,26,0.35)]";

/**
 * Visuel d'une feature de l'accueil : photo + voile sombre, et maquettes UI
 * posées dessus (maquette Figma « Devenez l'avocat qu'on trouve en premier »).
 * Les maquettes sont placées sur un canevas de 648 × 560 (taille Figma),
 * centré et mis à l'échelle selon la largeur d'écran.
 */
function Visual({ photo, overlay, children }: { photo: "soir" | "bureau"; overlay: string; children: ReactNode }) {
  return (
    <div aria-hidden="true" className="relative h-[340px] w-full overflow-hidden rounded-[28px] sm:h-[480px] lg:h-[460px] lg:flex-1 xl:h-[560px]">
      <Image
        src={photo === "soir" ? "/img/landing/photo-le-soir.png" : "/img/landing/visuel-bureau.png"}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
      <div className="absolute left-1/2 top-1/2 h-[560px] w-[648px] -translate-x-1/2 -translate-y-1/2 scale-[.55] sm:scale-[.8] lg:scale-[.75] xl:scale-[.9] 2xl:scale-100">
        {children}
      </div>
    </div>
  );
}

function Stars({ className = "" }: { className?: string }) {
  return <span className={`text-[#f5a623] ${className}`}>★★★★★</span>;
}

function Toast({ title, sub, className }: { title: string; sub: string; className: string }) {
  return (
    <div className={`absolute flex items-center gap-[14px] rounded-[18px] bg-white py-4 pl-4 pr-[22px] shadow-[0px_24px_48px_0px_rgba(13,10,26,0.3)] ${className}`}>
      <div className="flex size-11 items-center justify-center rounded-xl bg-[#ecfdf3]">
        <svg viewBox="0 0 22 22" width={22} height={22} fill="none">
          <path d="M4.58 11.46L8.71 15.58L17.42 6.88" stroke="#1F7A34" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col gap-0.5 whitespace-nowrap">
        <p className="text-[16px] font-semibold text-nuit">{title}</p>
        <p className="text-[14px] text-[#8a8798]">{sub}</p>
      </div>
    </div>
  );
}

/** Visibilité / prise de rendez-vous : téléphone avec le bouton Clotere + toast de confirmation. */
export function VisualPriseRdv({ p = "avocat" }: P) {
  const ex = EXEMPLES[p];
  return (
    <Visual photo="soir" overlay="rgba(13,11,20,0.32)">
      <div className="absolute left-[174px] top-[64px] flex h-[600px] w-[300px] flex-col rounded-[46px] bg-nuit p-[10px] shadow-[0px_24px_48px_0px_rgba(13,10,26,0.45)]">
        <div className="flex flex-1 flex-col gap-4 rounded-[38px] bg-white px-6 py-11">
          <p className="text-[22px] font-semibold leading-[1.2] text-nuit">{ex.telephone.cabinet}</p>
          <p className="flex items-center gap-1.5 text-[15px]">
            <span className="font-semibold text-nuit">4,9</span>
            <Stars />
          </p>
          <p className="text-[15px] text-[#5c5a6b]">{ex.telephone.sous}</p>
          <div className="h-2" />
          <div className="flex h-[60px] w-full items-center justify-center gap-[10px] rounded-2xl bg-brand">
            <svg viewBox="0 0 20 20" width={20} height={20} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.58 3.75H15.42C16.57 3.75 17.5 4.68 17.5 5.83V15C17.5 16.15 16.57 17.08 15.42 17.08H4.58C3.43 17.08 2.5 16.15 2.5 15V5.83C2.5 4.68 3.43 3.75 4.58 3.75Z" />
              <path d="M6.67 2.08V5.42M13.33 2.08V5.42M2.5 7.92H17.5" />
            </svg>
            <span className="text-[17px] font-semibold text-white">Prendre rendez-vous</span>
          </div>
        </div>
      </div>
      <Toast title="Rendez-vous confirmé" sub="Jeudi 20 nov. · 10h00" className="left-[330px] top-[404px]" />
    </Visual>
  );
}

/** Qualification : fiche de la demande. */
export function VisualQualification({ p = "avocat" }: P) {
  const ex = EXEMPLES[p];
  const items = ex.qualification.items;
  return (
    <Visual photo="bureau" overlay="rgba(13,11,20,0.24)">
      <div className={`absolute left-[132px] top-[110px] flex w-[400px] flex-col gap-5 rounded-[24px] bg-white p-8 ${shadow}`}>
        <div className="flex items-center gap-[14px]">
          <div className="flex size-[52px] items-center justify-center rounded-full bg-brand-soft text-[17px] font-semibold text-brand">JR</div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[20px] font-semibold text-nuit">Julien Roux</p>
            <p className="text-[15px] text-[#8a8798]">Jeudi · 10h00</p>
          </div>
        </div>
        <span className="self-start rounded-full bg-[#ecfdf3] px-[14px] py-[7px] text-[15px] font-semibold text-[#1f7a34]">{ex.qualification.tag}</span>
        <ul className="flex flex-col gap-3">
          {items.map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#ecfdf3]">
                <svg viewBox="0 0 14 14" width={14} height={14} fill="none">
                  <path d="M2.92 7.29L5.54 9.92L11.08 4.38" stroke="#1F7A34" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[16px] font-semibold text-nuit">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </Visual>
  );
}

/** Réponses automatiques : question du client le soir + réponse Clotere. */
export function VisualReponses() {
  return (
    <Visual photo="soir" overlay="rgba(13,11,20,0.4)">
      <div className="absolute left-[56px] top-[120px] flex w-[340px] flex-col gap-2 rounded-[22px] rounded-bl-[6px] bg-white px-[22px] py-[18px] font-semibold shadow-[0px_24px_48px_0px_rgba(13,10,26,0.3)]">
        <p className="text-[13px] text-[#8a8798]">21:32</p>
        <p className="text-[17px] leading-[1.45] text-nuit">Bonsoir, faut-il prendre rendez-vous pour une rupture conventionnelle ?</p>
      </div>
      <div className="absolute left-[268px] top-[290px] flex w-[340px] flex-col gap-2 rounded-[22px] rounded-br-[6px] bg-brand px-[22px] py-[18px] font-semibold shadow-[0px_24px_48px_0px_rgba(13,10,26,0.35)]">
        <p className="font-geistmono text-[12px] tracking-[0.96px] text-white/70">CLOTERE · 21:36</p>
        <p className="text-[17px] leading-[1.45] text-white">Bonsoir, Maître Martin peut vous recevoir pour en parler. Voici ses prochains créneaux.</p>
      </div>
    </Visual>
  );
}

/** Avis Google : note globale + avis avec réponse IA. */
export function VisualAvis() {
  return (
    <Visual photo="bureau" overlay="rgba(13,11,20,0.28)">
      <div className="absolute left-[72px] top-[96px] flex items-center gap-[14px] whitespace-nowrap rounded-[22px] bg-white px-[26px] py-5 shadow-[0px_24px_48px_0px_rgba(13,10,26,0.32)]">
        <p className="text-[44px] font-medium leading-normal tracking-[-1.1px] text-nuit">4,9</p>
        <div className="flex flex-col gap-0.5">
          <Stars className="text-[18px]" />
          <p className="text-[14px] text-[#8a8798]">128 avis Google</p>
        </div>
      </div>
      <div className={`absolute left-[192px] top-[228px] flex w-[400px] flex-col gap-4 rounded-[24px] bg-white p-7 ${shadow}`}>
        <p className="flex items-center gap-2">
          <span className="text-[17px] font-semibold text-nuit">Marie D.</span>
          <Stars className="text-[14px]" />
        </p>
        <p className="text-[17px] leading-[1.45] text-[#3a3847]">« Très bonne écoute, dossier traité rapidement. »</p>
        <div className="flex flex-col gap-1.5 rounded-[14px] bg-brand-soft px-[18px] py-[14px] font-semibold">
          <p className="font-geistmono text-[12px] tracking-[0.96px] text-brand">RÉPONSE IA</p>
          <p className="text-[16px] text-[#3a3847]">Merci Marie pour votre confiance !</p>
        </div>
      </div>
    </Visual>
  );
}

/** Site internet : navigateur avec le site du cabinet généré, bouton de rendez-vous intégré. */
export function VisualSite({ p = "avocat" }: P) {
  const ex = EXEMPLES[p];
  const pages = ["Accueil", "Expertises", "Honoraires", "Contact"];
  return (
    <Visual photo="bureau" overlay="rgba(13,11,20,0.3)">
      <div className={`absolute left-[64px] top-[92px] flex w-[520px] flex-col overflow-hidden rounded-[22px] bg-white ${shadow}`}>
        <div className="flex items-center gap-1.5 bg-[#f7f7fa] px-5 py-[14px]">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} className="size-[10px] rounded-full" style={{ backgroundColor: c }} />
          ))}
          <span className="ml-2 rounded-md bg-white px-3 py-1 text-[13px] text-[#6b6a7b]">{ex.url}</span>
        </div>
        <div className="flex items-center justify-between px-7 pt-6">
          <p className="text-[17px] font-bold text-nuit">{ex.cabinet}</p>
          <div className="flex gap-4 text-[13px] text-[#6b6a7b]">
            {pages.slice(1).map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 px-7 pb-7 pt-8">
          <p className="font-geistmono text-[11px] font-semibold tracking-[0.9px] text-brand">{ex.titreSite}</p>
          <p className="text-[30px] font-semibold leading-[1.1] tracking-[-0.8px] text-nuit">{ex.accrocheSite}</p>
          <span className="h-2 w-[300px] rounded bg-nuit/10" />
          <span className="h-2 w-[220px] rounded bg-nuit/10" />
          <span className="mt-2 rounded-full bg-brand px-5 py-[11px] text-[14px] font-semibold text-white">Prendre rendez-vous</span>
        </div>
        <div className="grid grid-cols-3 gap-3 bg-[#f7f7fa] px-7 py-5">
          {ex.cartesSite.map((t) => (
            <div key={t} className="flex flex-col gap-2 rounded-xl bg-white p-3">
              <span className="size-6 rounded-md bg-brand-soft" />
              <span className="text-[13px] font-semibold text-nuit">{t}</span>
            </div>
          ))}
        </div>
      </div>
      <Toast title="Site publié" sub={`${ex.url} · en ligne`} className="left-[330px] top-[440px]" />
    </Visual>
  );
}

/** Référencement : recherche Google Maps sur téléphone, le cabinet en tête. */
export function VisualVisibilite({ p = "avocat" }: P) {
  const ex = EXEMPLES[p];
  const others = [
    { rank: 2, name: ex.maps.autres[0], note: "4,2", count: "(31)" },
    { rank: 3, name: ex.maps.autres[1], note: "4,0", count: "(19)" },
  ];
  return (
    <Visual photo="soir" overlay="rgba(13,11,20,0.32)">
      <div className="absolute left-[174px] top-[64px] flex h-[600px] w-[300px] flex-col rounded-[46px] bg-nuit p-[10px] shadow-[0px_24px_48px_0px_rgba(13,10,26,0.45)]">
        <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-[38px] bg-white px-4 pb-11 pt-10">
          <div className="flex w-full items-center gap-2 whitespace-nowrap rounded-full border border-[#dadce0] bg-white px-[14px] py-[10px]">
            <span className="text-[15px] font-bold text-[#4285f4]">G</span>
            <span className="text-[12px] text-nuit">{ex.maps.recherche}</span>
          </div>
          <div className="flex gap-[14px] whitespace-nowrap px-1 text-[11px]">
            <span className="font-medium text-[#6b6a7b]">Tous</span>
            <span className="font-semibold text-[#1a73e8]">Maps</span>
            <span className="font-medium text-[#6b6a7b]">Images</span>
            <span className="font-medium text-[#6b6a7b]">Actualités</span>
          </div>
          <div className="relative h-[104px] w-full shrink-0 overflow-hidden rounded-[14px] bg-[#eef1f4]">
            <div className="absolute left-[-10px] top-[40px] h-2 w-[280px] bg-white" />
            <div className="absolute left-[-10px] top-[78px] h-[5px] w-[280px] bg-white" />
            <div className="absolute left-[70px] top-[-10px] h-[130px] w-[6px] bg-white" />
            <div className="absolute left-[170px] top-[-10px] h-[130px] w-2 bg-white" />
            <div className="absolute left-[96px] top-[6px] h-[30px] w-[56px] rounded-lg bg-[#d7efd9]" />
            <div className="absolute left-[-20px] top-[92px] h-[10px] w-[300px] bg-[#cfe3f5]" />
            <span className="absolute left-[190px] top-[58px] flex size-[18px] items-center justify-center rounded-full border-2 border-white bg-[#9aa0a6] text-[9px] font-bold text-white">3</span>
            <span className="absolute left-[40px] top-[20px] flex size-[18px] items-center justify-center rounded-full border-2 border-white bg-[#9aa0a6] text-[9px] font-bold text-white">2</span>
            <span className="absolute left-[112px] top-[46px] flex size-[26px] items-center justify-center rounded-full border-2 border-white bg-brand text-[12px] font-bold text-white">1</span>
          </div>
          <div className="flex w-full flex-col gap-1 rounded-[14px] border-[1.5px] border-brand bg-white p-3">
            <p className="flex items-center gap-1.5 whitespace-nowrap font-semibold">
              <span className="text-[12px] text-brand">1.</span>
              <span className="text-[13px] text-nuit">{ex.telephone.cabinet}</span>
            </p>
            <p className="flex items-center gap-1 whitespace-nowrap text-[11px]">
              <span className="font-semibold text-nuit">4,9</span>
              <span className="text-[#f5b400]">★★★★★</span>
              <span className="text-[#6b6a7b]">(128) · Ouvert</span>
            </p>
            <div className="flex w-full justify-center rounded-[10px] bg-brand py-[9px] text-[12px] font-semibold text-white">Prendre rendez-vous</div>
          </div>
          {others.map((o) => (
            <div key={o.rank} className="flex w-full flex-col gap-1 whitespace-nowrap rounded-[14px] border border-[#ecebf2] bg-white p-3 opacity-75">
              <p className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold text-[#6b6a7b]">{o.rank}.</span>
                <span className="text-[13px] font-medium text-[#5f6368]">{o.name}</span>
              </p>
              <p className="flex items-center gap-1 text-[11px]">
                <span className="font-semibold text-[#6b6a7b]">{o.note}</span>
                <span className="text-[#c8cbd0]">★★★★☆</span>
                <span className="text-[#6b6a7b]">{o.count}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <Toast title="1er sur Google Maps" sub={`« ${ex.maps.recherche} »`} className="left-[299px] top-[392px]" />
    </Visual>
  );
}
