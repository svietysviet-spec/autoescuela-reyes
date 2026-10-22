import type { Metadata } from "next";
import Image from "next/image";
import { Contact } from "@/components/Contact";
import { Diagrams } from "@/components/Diagrams";
import { PageHero } from "@/components/PageHero";
import { Pricing } from "@/components/Pricing";
import { Split } from "@/components/Split";
import { Steps } from "@/components/Steps";
import { Button, CheckList, Section, SectionHeader, TextLink } from "@/components/ui";
import { ENROLL, LINKS, SITE, wa } from "@/lib/site";

export const metadata: Metadata = {
  title: "Permisos de moto A1 y A2 en Las Palmas",
  description:
    "Carnet de moto A1 (desde 16 años) y A2 (desde 18) en Las Palmas de Gran Canaria. Matrícula desde 60 €, campus virtual, tutor 24 h y app de test.",
  alternates: { canonical: "/permisos-moto" },
};

const message = "Hola, quiero información sobre los permisos de moto.";
const INCLUDES = ["Matrícula", "Acceso al campus virtual", "Tutor online 24 h", "2 meses gratis de AEOL Cloud (test desde casa)"];

const TYPES = [
  {
    name: "Permiso A1",
    age: "A partir de 16 años",
    body: "Motocicletas de hasta 125 cc y una potencia máxima de 11 kW.",
    image: "/img/moto-a1.jpg",
    alt: "Moto de 125 cc de Autoescuela Reyes en una curva",
  },
  {
    name: "Permiso A2",
    age: "A partir de 18 años",
    body: "Motocicletas con una potencia máxima de 35 kW.",
    image: "/img/moto-a2.jpg",
    alt: "Moto de Autoescuela Reyes inclinada en una curva",
  },
];

export default function PermisosMoto() {
  return (
    <>
      <PageHero
        eyebrow="Permisos A1 y A2 · Moto"
        title="Tu carnet de moto, curva a curva."
        lead="A1 desde los 16 años, A2 desde los 18. Teórico, maniobras y circulación con profesores que te acompañan en todo el proceso."
        image="/img/moto-curva.jpg"
        imageAlt="Alumno con moto de Autoescuela Reyes en una carretera de montaña"
        message={message}
      />

      <Section tone="grouped" labelledBy="tipos-title">
        <SectionHeader id="tipos-title" eyebrow="Permisos" title="¿Qué permiso de moto quieres?" />
        <ul className="grid gap-4 md:grid-cols-2">
          {TYPES.map((t, i) => (
            <li key={t.name} style={{ "--i": i } as React.CSSProperties} className="reveal card overflow-hidden">
              <div className="relative aspect-[16/10] bg-bg-2">
                <Image src={t.image} alt={t.alt} fill sizes="(min-width: 768px) 536px, 100vw" className="object-cover" />
              </div>
              <div className="p-5">
                <p className="eyebrow">{t.age}</p>
                <h3 className="h3 mt-1">{t.name}</h3>
                <p className="mt-1 text-[15px] text-text-2">{t.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="plain" labelledBy="pasos-title">
        <SectionHeader id="pasos-title" eyebrow="Qué pasos seguir" title="Tres exámenes hasta tu moto." />
        <Steps
          steps={[
            {
              title: "Examen teórico",
              body: (
                <>
                  <p>20 preguntas tipo test, máximo 2 fallos. Para prepararlo tendrás:</p>
                  <CheckList
                    className="mt-3 text-text"
                    items={[
                      "Campus virtual con material de apoyo",
                      "Tutor online 24 h para tus dudas",
                      "2 meses de AEOL, la app líder de test (luego 5 €/mes)",
                    ]}
                  />
                  <p className="mt-3 text-[13px]">
                    * Si no tienes el permiso B, también deberás hacer el examen teórico común (30 preguntas, 3 fallos).
                  </p>
                </>
              ),
              action: <TextLink href={LINKS.campus}>Ir al campus</TextLink>,
            },
            {
              title: "Examen de maniobras",
              body: "Clases prácticas con un profesor. Son dos circuitos en los que se valora el dominio de la moto: uno lento y otro rápido.",
              action: <TextLink href="#circuitos">Ver circuitos</TextLink>,
            },
            {
              title: "Examen de circulación",
              body: "Clases prácticas con un profesor que te guía paso a paso para demostrar tu destreza en vías abiertas.",
            },
          ]}
        />
      </Section>

      <Section id="circuitos" tone="grouped" labelledBy="circuitos-title">
        <SectionHeader id="circuitos-title" eyebrow="Maniobras" title="Circuito lento y circuito rápido." />
        <Diagrams
          items={[
            { title: "Circuito lento", image: "/img/circuito-lento.jpg", alt: "Esquema del circuito lento del examen de moto", width: 1600, height: 478 },
            { title: "Circuito rápido", image: "/img/circuito-rapido.jpg", alt: "Esquema del circuito rápido del examen de moto", width: 1600, height: 712 },
          ]}
        />
      </Section>

      <Section id="tarifas" tone="plain" labelledBy="tarifas-title">
        <SectionHeader id="tarifas-title" eyebrow="Tarifas" title="¿Quieres matricularte?" lead="Fácil, rápido y seguro." />
        <Pricing
          plans={[
            {
              name: "Permiso «A1»",
              price: 70,
              description: "Motos de hasta 11 kW. Edad mínima 16 años.",
              includes: INCLUDES,
              enrollHref: ENROLL.a1,
            },
            {
              name: "Permiso «A2»",
              price: 70,
              description: "Motos de hasta 35 kW. Edad mínima 18 años.",
              includes: INCLUDES,
              enrollHref: ENROLL.a2,
            },
            {
              name: "Permiso «A2» con B",
              price: 60,
              description: "Para quienes ya tienen el permiso B.",
              includes: INCLUDES,
              enrollHref: ENROLL.a2ConB,
              featured: true,
            },
          ]}
        />
      </Section>

      <Section tone="grouped" labelledBy="permiso-a-title">
        <Split
          image="/img/moto-curva.jpg"
          imageAlt="Moto de gran cilindrada de Autoescuela Reyes en una curva"
          eyebrow="Curso · Permiso A"
          title="¿Quieres motos grandes?"
          titleId="permiso-a-title"
          reverse
        >
          <p>Con el permiso A podrás llevar motos sin límite de potencia.</p>
          <div className="pt-2">
            <Button href={wa(SITE.whatsapp, "Hola, quiero información sobre el curso del permiso A.")} variant="gray">
              Pedir información
            </Button>
          </div>
        </Split>
      </Section>

      <Contact tone="plain" message={message} />
    </>
  );
}
