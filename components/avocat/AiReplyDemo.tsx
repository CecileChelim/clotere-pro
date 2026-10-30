"use client";

import { useEffect, useRef, useState } from "react";

const REPLY =
  "Bonjour, votre demande a bien été transmise à Maître Durand. Avant votre entretien de lundi, rassemblez votre contrat de travail, vos trois derniers bulletins de salaire et la convocation reçue. Vous pouvez vous faire assister lors de l'entretien. Un rendez-vous vous est proposé vendredi à 10h30.";
const TAGS = ["Droit du travail", "Dossier probable", "Échéance : lundi"];

export function AiReplyDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [tags, setTags] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const t: ReturnType<typeof setTimeout>[] = [];
    TAGS.forEach((_, i) => t.push(setTimeout(() => setTags(i + 1), 700 + i * 450)));
    t.push(setTimeout(() => setThinking(true), 2300));
    t.push(setTimeout(() => {
      setThinking(false);
      let n = 0;
      const iv = setInterval(() => { n += 3; setChars(Math.min(n, REPLY.length)); if (n >= REPLY.length) clearInterval(iv); }, 18);
      t.push(iv as unknown as ReturnType<typeof setTimeout>);
    }, 3700));
    return () => t.forEach((x) => { clearTimeout(x); clearInterval(x as unknown as ReturnType<typeof setInterval>); });
  }, [started]);

  const done = chars >= REPLY.length;

  return (
    <div ref={ref} className="mt-14 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <div className={`rounded-[2rem] bg-white/5 p-8 ring-1 ring-white/10 transition-all duration-700 ${started ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">La demande du client · 23h14</p>
        <p className="mt-4 text-white/90">« Bonjour, mon employeur veut me licencier pour faute grave après 12 ans dans l&apos;entreprise. J&apos;ai un entretien préalable lundi. Que dois-je faire ? »</p>
        <div className="mt-6 flex min-h-[28px] flex-wrap gap-2 text-xs">
          {TAGS.map((tag, i) => (
            <span key={tag} className={`rounded-full px-3 py-1 transition-all duration-500 ${i === 0 ? "bg-white font-medium text-gray-950" : "bg-white/10 text-white/80"} ${i < tags ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className={`rounded-[2rem] bg-white p-8 text-gray-950 transition-all delay-300 duration-700 ${started ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          ✦ {done ? "Réponse envoyée automatiquement · 23h14" : "L'IA rédige la réponse…"}
        </p>
        <div className="mt-4 min-h-[168px] text-gray-700">
          {thinking && (
            <span className="inline-flex gap-1">
              {[0, 150, 300].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${d}ms` }} />)}
            </span>
          )}
          {chars > 0 && <p>{REPLY.slice(0, chars)}{!done && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-950 align-middle" />}</p>}
        </div>
        <p className={`mt-6 text-sm text-gray-500 transition-opacity duration-700 ${done ? "opacity-100" : "opacity-0"}`}>
          Vous gardez la main : modèles de réponse validés par vous, jamais de conseil juridique envoyé sans votre accord.
        </p>
      </div>
    </div>
  );
}
