import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { Diagrams } from "@/components/Diagrams";
import { PageHero } from "@/components/PageHero";
import { Pricing } from "@/components/Pricing";
import { Steps } from "@/components/Steps";
import { CheckList, Section, SectionHeader, TextLink } from "@/components/ui";
import { ENROLL, LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Permiso C+E · Carnet de tráiler en Las Palmas",
  description:
    "Carnet de tráiler (permiso C+E) en Las Palmas de Gran Canaria: teórico, maniobras (L, muelle, enganche) y circulación. Matrícula 100 €.",
  alternates: { canonical: "/permiso-e" },
};

const message = "Hola, quiero información sobre el permiso C+E.";

export default function PermisoCE() {
  return (
    <>
      <PageHero
        eyebrow="Permiso C+E · Tráiler"
        title="Da el salto al tráiler."
        lead="Tres exámenes: teórico, maniobras y circulación. Te guiamos en cada uno."
        image="/img/trailer-ce.jpg"
        imageAlt="Tráiler de Autoescuela Reyes circulando por carretera"
        message={message}
      />

      <Section tone="grouped" labelledBy="examenes-title">
        <SectionHeader id="examenes-title" eyebrow="Qué necesitas" title="Tres exámenes para el C+E." />
        <Steps
          steps={[
            {
              title: "Examen teórico",
              body: (
                <>
                  <p>20 preguntas tipo test, máximo 2 fallos. Para prepararlo tendrás:</p>
                  <CheckList
                    className="mt-3 text-text"
                    items={["Campus virtual con material de apoyo", "Tutor online 24 h para tus dudas", "Acceso gratuito a AEOL, la app líder de test"]}
                  />
                </>
              ),
              action: <TextLink href={LINKS.campus}>Ir al campus</TextLink>,
            },
            {
              title: "Examen de maniobras",
              body: "La L, aproximación a muelle y enganche y desenganche del remolque.",
              action: <TextLink href="#maniobras">Ver maniobras</TextLink>,
            },
            {
              title: "Examen de circulación",
              body: "Clases prácticas con un profesor que te guía paso a paso para demostrar tu destreza en vías abiertas.",
            },
          ]}
        />
      </Section>

      <Section id="maniobras" tone="plain" labelledBy="maniobras-title">
        <SectionHeader id="maniobras-title" eyebrow="Maniobras" title="Las tres maniobras del examen." />
        <Diagrams
          items={[
            { title: "La L", image: "/img/maniobra-l.jpg", alt: "Esquema de la maniobra en L del examen C+E", width: 884, height: 1066 },
            {
              title: "Aproximación a muelle",
              image: "/img/maniobra-muelle.jpg",
              alt: "Esquema de la maniobra de aproximación a muelle",
              width: 1134,
              height: 388,
            },
            {
              title: "Enganche y desenganche",
              image: "/img/maniobra-enganche.jpg",
              alt: "Esquema de la maniobra de enganche y desenganche del remolque",
              width: 1106,
              height: 1072,
            },
          ]}
        />
      </Section>

      <Section id="tarifas" tone="grouped" labelledBy="tarifas-title">
        <SectionHeader id="tarifas-title" eyebrow="Tarifas" title="¿Quieres matricularte?" lead="Fácil, rápido y seguro." />
        <Pricing
          plans={[
            {
              name: "Matrícula permiso «C+E»",
              price: 100,
              description: "Todo lo necesario para empezar.",
              includes: ["Matrícula «C+E»", "Acceso al campus virtual", "Tutor online 24 h", "Acceso gratis a AEOL Cloud (test desde casa)"],
              enrollHref: ENROLL.ce,
            },
          ]}
        />
      </Section>

      <Contact tone="plain" message={message} />
    </>
  );
}
