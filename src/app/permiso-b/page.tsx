import type { Metadata } from "next";
import Image from "next/image";
import { Contact } from "@/components/Contact";
import { PageHero } from "@/components/PageHero";
import { Pricing } from "@/components/Pricing";
import { Split } from "@/components/Split";
import { Steps } from "@/components/Steps";
import { Button, CheckList, Section, SectionHeader, TextLink } from "@/components/ui";
import { ENROLL, LINKS, SITE, wa } from "@/lib/site";

export const metadata: Metadata = {
  title: "Permiso B · Carnet de coche en Las Palmas",
  description:
    "Sácate el carnet de coche (permiso B) en Las Palmas de Gran Canaria: manual, automático o adaptado. Matrícula desde 50 €, campus virtual, tutor 24 h y app de test.",
  alternates: { canonical: "/permiso-b" },
};

const MODES = [
  {
    title: "Coche manual",
    body: "Aprende a conducir con el cambio de marchas tradicional.",
    image: "/img/coche-corsa.jpg",
    alt: "Coche de prácticas de Autoescuela Reyes en carretera",
  },
  {
    title: "Coche automático",
    body: "La forma más sencilla de aprender: sin embrague ni cambio de marchas.",
    image: "/img/coche-kia.jpg",
    alt: "Coche de Autoescuela Reyes en una carretera de montaña",
  },
  {
    title: "Coche adaptado",
    body: "Vehículo adaptado para personas con movilidad reducida (PMR).",
    image: "/img/coche-sede.jpg",
    alt: "Coche de Autoescuela Reyes aparcado frente a la sede",
  },
];

const BASE_INCLUDES = ["Matrícula", "Acceso al campus virtual", "Tutor online 24 h", "2 meses gratis de AEOL Cloud (test desde casa)"];

export default function PermisoB() {
  return (
    <>
      <PageHero
        eyebrow="Permiso B · Coche"
        title="Tu carnet de coche, sin complicaciones."
        lead="Solo necesitas tener 18 años (el teórico puedes hacerlo hasta 3 meses antes). Después, dos exámenes, y te acompañamos en ambos."
        image="/img/coche-corsa-carretera.jpg"
        imageAlt="Coche de prácticas de Autoescuela Reyes en una carretera al atardecer"
        message="Hola, quiero información sobre el permiso B."
      />

      <Section tone="grouped" labelledBy="modalidades-title">
        <SectionHeader id="modalidades-title" eyebrow="Modalidades" title="Manual, automático o adaptado." />
        <ul className="grid gap-4 md:grid-cols-3">
          {MODES.map((m, i) => (
            <li key={m.title} style={{ "--i": i } as React.CSSProperties} className="reveal card overflow-hidden">
              <div className="relative aspect-[16/10] bg-bg-2">
                <Image src={m.image} alt={m.alt} fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="h3">{m.title}</h3>
                <p className="mt-1 text-[15px] text-text-2">{m.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="plain" labelledBy="examenes-title">
        <SectionHeader
          id="examenes-title"
          eyebrow="Qué necesitas"
          title="Dos exámenes. Te preparamos para los dos."
        />
        <Steps
          steps={[
            {
              title: "Examen teórico",
              body: (
                <>
                  <p>30 preguntas tipo test, máximo 3 fallos. Para prepararlo tendrás:</p>
                  <CheckList
                    className="mt-3 text-text"
                    items={[
                      "Campus virtual con material de apoyo",
                      "Tutor online 24 h para tus dudas",
                      "2 meses de AEOL, la app líder de test (luego 5 €/mes)",
                      "Clases intensivas, presenciales y online",
                    ]}
                  />
                </>
              ),
              action: <TextLink href={LINKS.campus}>Ir al campus</TextLink>,
            },
            {
              title: "Examen de circulación",
              body: "Llega el momento de ponerte al volante. Harás clases prácticas con un profesor que te guía paso a paso. Con práctica y buena formación, aprobar está más cerca de lo que imaginas.",
              action: <TextLink href={LINKS.alumno}>Comprar prácticas</TextLink>,
            },
          ]}
        />
      </Section>

      <Section id="tarifas" tone="grouped" labelledBy="tarifas-title">
        <SectionHeader
          id="tarifas-title"
          eyebrow="Tarifas"
          title="¿Quieres matricularte?"
          lead="Fácil, rápido y seguro. Matrícula online en minutos."
        />
        <Pricing
          plans={[
            {
              name: "Básico permiso B",
              price: 50,
              description: "Todo lo necesario para empezar con el teórico.",
              includes: BASE_INCLUDES,
              enrollHref: ENROLL.bBasico,
            },
            {
              name: "Premium permiso B",
              price: 232,
              description: "El básico más tus primeras prácticas y el examen práctico.",
              includes: [...BASE_INCLUDES, "4 prácticas de circulación", "1 examen práctico"],
              enrollHref: ENROLL.bPremium,
              featured: true,
            },
            {
              id: "reciclaje",
              name: "Práctica de reciclaje",
              price: 33,
              description: "Para quienes hace tiempo que no conducen.",
              includes: ["Profesor especializado", "Gran disponibilidad horaria", "Sin listas de espera"],
            },
          ]}
        />
      </Section>

      <Section id="amaxofobia" tone="plain" labelledBy="amaxofobia-title">
        <Split
          image="/img/amaxofobia.jpg"
          imageAlt="Conductor con las manos en la cara dentro de un coche de la autoescuela"
          eyebrow="Amaxofobia"
          title="¿Miedo a conducir?"
          titleId="amaxofobia-title"
        >
          <p>
            Ofrecemos formación especializada para personas con amaxofobia, una fobia real a la conducción que provoca
            ansiedad intensa o bloqueo al ponerse al volante.
          </p>
          <CheckList
            className="text-text"
            items={[
              "Profesor especializado en amaxofobia",
              "Clases totalmente adaptadas a cada alumno",
              "Proceso progresivo para recuperar la seguridad",
            ]}
          />
          <p>El objetivo: superar el bloqueo emocional y volver a conducir con normalidad.</p>
          <div className="pt-2">
            <Button href={wa(SITE.whatsapp, "Hola, quiero información sobre las clases para el miedo a conducir.")} variant="gray">
              Pregunta en la autoescuela
            </Button>
          </div>
        </Split>
      </Section>

      <Contact message="Hola, quiero información sobre el permiso B." />
    </>
  );
}
