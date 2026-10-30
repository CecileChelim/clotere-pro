import { DEFAULT_SERVICE_PRICE } from "@/lib/constants";
import { parseServiceDescription } from "@/lib/richtext";
import { IconCheck } from "@/components/ui/icons";
import type { Service } from "@/types/database";

export function ProfileServices({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <div className="card p-6">
      <p className="eyebrow">Comment je peux vous aider</p>
      <h2 className="mt-2 font-serif text-2xl text-ink-2">Services proposés</h2>

      <div className="mt-5 space-y-4">
        {services.map((service, i) => (
          <div
            key={service.id}
            className="rounded-[10px] border border-line bg-card-alt p-5 transition-colors hover:border-gold"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-serif text-sm text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-lg font-medium text-ink-2">{service.titre}</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink-2">
                {service.prix || DEFAULT_SERVICE_PRICE}
              </span>
            </div>

            {service.description && (
              <div className="mt-3 space-y-2.5 pl-11 text-sm leading-relaxed text-body">
                {parseServiceDescription(service.description).map((block, bi) =>
                  block.type === "p" ? (
                    <p key={bi}>{block.text}</p>
                  ) : (
                    <ul key={bi} className="space-y-1.5">
                      {block.items.map((item, ii) => (
                        <li key={ii} className="flex items-start gap-2">
                          <IconCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
