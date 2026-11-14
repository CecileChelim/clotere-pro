import type { ComponentProps } from "react";
import { AiReplyDemo } from "@/components/avocat/AiReplyDemo";
import { eyebrow } from "./styles";

/** « Chaque client reçoit une réponse. » (repris de l'ancienne landing en prod), avec la démo animée. */
export default function ReponsesSection({
  title = "Chaque client reçoit une réponse. Vous, vous plaidez.",
  demo,
}: {
  title?: string;
  demo?: ComponentProps<typeof AiReplyDemo>;
}) {
  return (
    <section className="rounded-[40px] bg-nuit py-20 text-white lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className={`${eyebrow} text-white/50`}>Réponses prêtes à envoyer</p>
          <h2 className="mt-3 text-[34px] font-semibold leading-[1.06] tracking-[-1.2px] sm:text-[48px]">{title}</h2>
        </div>
        <AiReplyDemo {...demo} />
      </div>
    </section>
  );
}
