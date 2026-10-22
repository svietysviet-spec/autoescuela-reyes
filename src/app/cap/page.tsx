import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { PageHero } from "@/components/PageHero";
import { Pricing } from "@/components/Pricing";
import CountUp from "@/components/reactbits/CountUp";
import { Split } from "@/components/Split";
import { Button, Section, SectionHeader } from "@/components/ui";
import { LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cursos CAP · Certificado de Aptitud Profesional",
  description:
    "Cursos CAP en Las Palmas de Gran Canaria: CAP inicial acelerado (140 h), ampliación (35 h) y formación continua (35 h) para mercancías y viajeros.",
  alternates: { canonical: "/cap" },
};

const message = "Hola, quiero información sobre los cursos CAP.";

const COURSES = [
  {
    name: "CAP inicial",
    hours: 140,
    split: "130 teóricas + 10 prácticas",
    body: "Para empezar a trabajar como conductor profesional de mercancías o viajeros. Al terminar, examen CAP de 100 preguntas.",
  },
  {
    name: "CAP ampliación",
    hours: 35,
    split: "32,5 teóricas + 2,5 prácticas",
    body: "Si ya tienes el CAP inicial y quieres trabajar también en el otro sector. Al terminar, examen CAP de 25 preguntas.",
  },
  {
    name: "CAP continuo",
    hours: 35,
    split: "Renovación cada 5 años",
    body: "Para conductores profesionales que necesitan renovar el CAP para seguir ejerciendo en el transporte.",
  },
];

const COMMON = ["Acceso al campus virtual", "Tutor online 24 h", "Acceso gratis a AEOL Cloud (test desde casa)"];

export default function Cap() {
  return (
    <>
      <PageHero
        eyebrow="CAP · Certificado de Aptitud Profesional"
        title="Haz del volante tu profesión."
        lead="Formación teórica y práctica para obtener el certificado y trabajar en el transporte de mercancías o viajeros."
        image="/img/cap-profesional.jpg"
        imageAlt="Conductor profesional con chaleco reflectante junto a un camión de Autoescuela Reyes"
        message={message}
      />

      <Section tone="grouped" labelledBy="cursos-title">
        <SectionHeader
          id="cursos-title"
          eyebrow="Cursos"
          title="Elige tu curso CAP."
          lead="Los exámenes oficiales se hacen en las fechas que disponga el Cabildo."
        />
        <ul className="grid gap-4 md:grid-cols-3">
          {COURSES.map((c, i) => (
            <li key={c.name} style={{ "--i": i } as React.CSSProperties} className="reveal card p-6">
              <p className="eyebrow">{c.name}</p>
              <p className="mt-2 text-[44px] font-bold leading-none tracking-[-0.035em]">
                <CountUp to={c.hours} suffix=" h" duration={1.2} />
              </p>
              <p className="mt-1 text-[13px] font-medium text-text-2">{c.split}</p>
              <p className="mt-4 text-[15px] text-text-2">{c.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="tarifas" tone="plain" labelledBy="tarifas-title">
        <SectionHeader id="tarifas-title" eyebrow="Tarifas" title="¿Quieres matricularte?" lead="Pregúntanos y te ayudamos a elegir." />
        <Pricing
          plans={[
            {
              name: "CAP inicial acelerado",
              price: 1500,
              description: "Para conductores que transporten mercancías o viajeros.",
              includes: ["Curso teórico CAP inicial 130 h", "12 prácticas CAP de 45 min", "1 práctica CAP de 60 min", "Matrícula CAP", ...COMMON],
              featured: true,
            },
            {
              name: "CAP ampliación",
              price: 350,
              description: "Tanto si amplías a mercancías como a viajeros.",
              includes: ["Curso teórico CAP ampliación 32,5 h", "2 prácticas CAP de 45 min", "1 práctica CAP de 60 min", "Matrícula CAP ampliación", ...COMMON],
            },
            {
              name: "CAP formación continua",
              price: 250,
              description: "Curso obligatorio de actualización para conductores profesionales.",
              includes: ["Curso CAP renovación 35 h", "Matrícula CAP renovación"],
            },
          ]}
        />
      </Section>

      <Section tone="grouped" labelledBy="homologado-title">
        <Split
          image="/img/sello-cap.png"
          imageAlt="Sello de centro homologado para cursos CAP de Autoescuela Reyes"
          eyebrow="Centro homologado"
          title="¿Necesitas el CAP?"
          titleId="homologado-title"
          contain
          reverse
        >
          <p>
            El CAP es obligatorio para trabajar como conductor profesional, aunque existen excepciones. Consúltalas antes de
            decidir si te matriculas solo del permiso.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href={LINKS.capFaq} variant="gray">
              Excepciones del CAP
            </Button>
            <Button href="/permiso-c" variant="gray">
              Permiso C
            </Button>
            <Button href="/permiso-d" variant="gray">
              Permiso D
            </Button>
          </div>
        </Split>
      </Section>

      <Contact tone="plain" message={message} />
    </>
  );
}
