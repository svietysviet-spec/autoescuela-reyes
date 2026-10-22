import { LINKS, SITE, formatPhone, tel, wa } from "@/lib/site";
import { ArrowUpRight, Book, Doc, Mail, Phone, Ticket, User, WhatsApp } from "./icons";
import { Section, SectionHeader } from "./ui";

const QUICK = [
  { href: LINKS.alumno, label: "Área alumno", sub: "Accede con tus credenciales", Icon: User },
  { href: LINKS.alumno, label: "Compra tus prácticas", sub: "Gestiona tus clases online", Icon: Ticket },
  { href: LINKS.campus, label: "Campus virtual", sub: "Estudia cuando quieras", Icon: Book },
  { href: LINKS.notaExamen, label: "Consulta tu nota", sub: "Y tu autorización temporal (DGT)", Icon: Doc },
];

export function Contact({
  tone = "grouped",
  whatsapp = SITE.whatsapp,
  email = SITE.email,
  message = "Hola, quiero información sobre Autoescuela Reyes.",
}: {
  tone?: "plain" | "grouped";
  whatsapp?: string;
  email?: string;
  message?: string;
}) {
  return (
    <Section id="contacto" tone={tone} labelledBy="contacto-title">
      <SectionHeader
        id="contacto-title"
        eyebrow="Contacto"
        title="¿Hablamos?"
        lead="Escríbenos por WhatsApp, llámanos o pásate por la autoescuela. Te ayudamos a elegir y empezar."
      />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="reveal card flex flex-col gap-3 p-6">
          <a
            href={wa(whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa h-14 w-full justify-start text-[17px]"
          >
            <WhatsApp width={22} height={22} />
            WhatsApp · {formatPhone(whatsapp.slice(2))}
          </a>
          <a href={tel(SITE.phone)} className="btn btn-gray h-14 w-full justify-start">
            <Phone />
            {formatPhone(SITE.phone)}
          </a>
          <a href={`mailto:${email}`} className="btn btn-gray h-14 w-full min-w-0 justify-start">
            <Mail />
            <span className="truncate">{email}</span>
          </a>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {QUICK.map(({ href, label, sub, Icon }, i) => (
            <li key={label} style={{ "--i": i } as React.CSSProperties} className="reveal">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex h-full items-start gap-3 p-4 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-tint text-accent-text">
                  <Icon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-[13px] text-text-2">{sub}</span>
                </span>
                <ArrowUpRight className="text-text-3" width={16} height={16} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
