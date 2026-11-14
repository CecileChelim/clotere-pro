// Classes partagées des landings (composants Figma « Bouton », sur-titres…).
const pill = "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold leading-normal transition";

/** Bouton plein, couleur de la profession. */
export const btnPrimary = `${pill} bg-brand text-white drop-shadow-[0px_6px_8px_rgba(20,18,31,0.18)] hover:brightness-110`;
/** Bouton contour blanc. */
export const btnSecondary = `${pill} border border-black/10 bg-white text-nuit hover:bg-white/80`;
/** Bouton doux (fond teinté). */
export const btnSoft = `${pill} bg-brand-soft text-brand hover:brightness-95`;

export const btnMd = "px-[22px] py-[13px] text-[15px]";
export const btnSm = "px-4 py-2 text-[14px]";

/** Sur-titre en Geist Mono. */
export const eyebrow = "font-geistmono text-[12px] font-semibold uppercase leading-normal tracking-[1.2px]";

/** Marges horizontales des sections (112 px en desktop, comme la maquette). */
export const px = "px-4 sm:px-8 lg:px-[112px]";
