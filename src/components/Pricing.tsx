import { SITE, euro, wa } from "@/lib/site";
import { CheckList } from "./ui";
import { ArrowRight } from "./icons";

export type Plan = {
  id?: string;
  name: string;
  price?: number;
  pricePlaceholder?: string;
  description: string;
  includes: string[];
  note?: string;
  /** Enlace real de matrícula online. Si no hay, el botón lleva a WhatsApp. */
  enrollHref?: string;
  featured?: boolean;
  whatsapp?: string;
};

export function Pricing({ plans }: { plans: Plan[] }) {
  const cols = plans.length >= 3 ? "lg:grid-cols-3" : plans.length === 2 ? "md:grid-cols-2" : "";
  return (
    <ul className={`grid gap-4 ${cols} ${plans.length === 1 ? "max-w-[440px]" : ""}`}>
      {plans.map((p, i) => (
        <li
          key={p.name}
          id={p.id}
          style={{ "--i": i } as React.CSSProperties}
          className={`reveal card relative flex flex-col p-6 ${p.featured ? "!border-2 !border-accent" : ""}`}
        >
          {p.featured && (
            <span className="absolute -top-3 left-6 rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-semibold text-on-accent">
              Más completo
            </span>
          )}
          <h3 className="text-[15px] font-semibold text-text-2">{p.name}</h3>
          <p className="mt-1 text-[40px] font-bold leading-none tracking-[-0.03em]">
            {p.price !== undefined ? euro(p.price) : p.pricePlaceholder ?? "[PRECIO]"}
          </p>
          <p className="mt-3 text-[15px] text-text-2">{p.description}</p>
          <CheckList items={p.includes} className="mt-5 text-[15px]" />
          {p.note && <p className="mt-4 rounded-xl bg-accent-tint px-3 py-2 text-[13px] text-text">{p.note}</p>}
          <div className="mt-auto pt-6">
            {p.enrollHref ? (
              <a href={p.enrollHref} target="_blank" rel="noopener noreferrer" className="btn btn-accent w-full">
                Matricúlate online <ArrowRight className="arrow" width={18} height={18} />
              </a>
            ) : (
              <a
                href={wa(p.whatsapp ?? SITE.whatsapp, `Hola, quiero información sobre: ${p.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gray w-full"
              >
                Pregunta en la autoescuela
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
