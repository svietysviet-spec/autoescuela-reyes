import type { Metadata } from "next";
import Image from "next/image";
import { Contact } from "@/components/Contact";
import { Locations } from "@/components/Locations";
import { PageHero } from "@/components/PageHero";
import { Split } from "@/components/Split";
import { Button, CheckList, Section, SectionHeader } from "@/components/ui";
import { CENTERS, LINKS, PUNTOS_CONTACT, wa } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recuperación de puntos · Las Palmas y Telde",
  description:
    "Cursos de sensibilización y reeducación vial para recuperar puntos del carnet en Las Palmas de Gran Canaria y Telde. Curso parcial (hasta 4 puntos) y total (hasta 8).",
  alternates: { canonical: "/recuperacion-de-puntos" },
};

const message = "Hola, quiero información sobre los cursos de recuperación de puntos.";

const COURSES = [
  {
    name: "Curso parcial",
    hours: "10 horas",
    points: "Hasta 4 puntos",
    image: "/img/puntos-4.png",
    body: "Puedes hacerlo una vez cada 2 años (los conductores profesionales, una vez al año).",
  },
  {
    name: "Curso total",
    hours: "20 horas",
    points: "Hasta 8 puntos",
    image: "/img/puntos-8.png",
    body: "Obligatorio si has sido condenado por sentencia judicial o has perdido todos los puntos.",
  },
];

export default function RecuperacionPuntos() {
  return (
    <>
      <PageHero
        eyebrow="Centro de sensibilización y reeducación vial autorizado por la DGT"
        title="Recupera tus puntos."
        lead="Cursos con profesores especializados en Las Palmas de Gran Canaria y Telde. Rápido y sencillo."
        image="/img/puntos-aula.jpg"
        imageAlt="Aula de un curso de recuperación de puntos con alumnos atendiendo"
        primary={{ href: "#cursos", label: "Ver cursos" }}
        whatsapp={PUNTOS_CONTACT.whatsapp}
        message={message}
      />

      <Section id="cursos" tone="grouped" labelledBy="cursos-title">
        <SectionHeader id="cursos-title" eyebrow="Cursos" title="Parcial o total." />
        <ul className="grid gap-4 md:grid-cols-2">
          {COURSES.map((c, i) => (
            <li key={c.name} style={{ "--i": i } as React.CSSProperties} className="reveal card flex flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{c.name}</p>
                  <p className="mt-2 text-[40px] font-bold leading-none tracking-[-0.035em]">{c.points}</p>
                  <p className="mt-1 text-[15px] font-medium text-text-2">{c.hours} · [PRECIO]</p>
                </div>
                <Image src={c.image} alt="" width={72} height={72} className="size-[72px] shrink-0" />
              </div>
              <p className="mt-4 text-[15px] text-text-2">{c.body}</p>
              <div className="mt-auto pt-6">
                <Button
                  href={wa(PUNTOS_CONTACT.whatsapp, `Hola, quiero información sobre el ${c.name.toLowerCase()} de recuperación de puntos.`)}
                  variant="accent"
                  className="w-full"
                >
                  Consultar información
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="plain" labelledBy="consulta-title">
        <Split
          image="/img/puntos-dudas.jpg"
          imageAlt="Hombre pensativo sujetando su carnet de conducir"
          eyebrow="DGT"
          title="¿Cuántos puntos te quedan?"
          titleId="consulta-title"
        >
          <p>Puedes consultarlo de varias formas:</p>
          <CheckList
            className="text-text"
            items={[
              "En la sede electrónica de la DGT, con certificado digital, DNI electrónico o Cl@ve",
              "Desde la aplicación miDGT",
              "Por teléfono, llamando al 060",
              "En persona, con cita previa en cualquier Jefatura Provincial de Tráfico",
            ]}
          />
          <div className="pt-2">
            <Button href={LINKS.puntosDGT} variant="gray">
              Consultar puntos
            </Button>
          </div>
        </Split>
      </Section>

      <Section id="sedes" tone="grouped" labelledBy="sedes-title">
        <SectionHeader id="sedes-title" eyebrow="Dónde son las clases" title="Dos sedes para tus cursos." />
        <Locations centers={CENTERS.filter((c) => c.services.includes("Recuperación de puntos"))} />
      </Section>

      <Contact tone="plain" whatsapp={PUNTOS_CONTACT.whatsapp} email={PUNTOS_CONTACT.email} message={message} />
    </>
  );
}
