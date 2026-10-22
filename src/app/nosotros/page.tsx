import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { Locations } from "@/components/Locations";
import { PageHero } from "@/components/PageHero";
import { Split } from "@/components/Split";
import { Section, SectionHeader } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Autoescuela Reyes: autoescuela en Las Palmas de Gran Canaria con formación vial cercana, profesional y de calidad. Conoce nuestras sedes.",
  alternates: { canonical: "/nosotros" },
};

export default function Nosotros() {
  return (
    <>
      <PageHero
        eyebrow="Quiénes somos"
        title="Formamos conductores, no solo aprobados."
        lead={`${SITE.name} es una autoescuela en ${SITE.city} comprometida con una formación vial cercana, profesional y de calidad.`}
        image="/img/aula.jpg"
        imageAlt="Clase teórica en el aula de Autoescuela Reyes"
        primary={{ href: "/#permisos", label: "Matricúlate" }}
        message="Hola, quiero información sobre Autoescuela Reyes."
      />

      <Section tone="grouped" labelledBy="como-title">
        <Split
          image="/img/mascota.png"
          imageAlt="Mascota de Autoescuela Reyes con los brazos abiertos"
          eyebrow="Cómo enseñamos"
          title={SITE.tagline}
          titleId="como-title"
          contain
        >
          <p>
            Nuestro objetivo es ayudar a cada alumno a obtener su permiso con una enseñanza adaptada a sus necesidades, un
            trato personalizado y acompañamiento constante durante todo el proceso.
          </p>
          <p>
            Creemos en una forma de enseñar clara, práctica y eficaz, para que aprendas con seguridad y confianza desde el
            primer día. Más allá del examen, trabajamos para formar conductores responsables y bien preparados para la
            conducción real.
          </p>
        </Split>
      </Section>

      <Section id="sedes" tone="plain" labelledBy="sedes-title">
        <SectionHeader id="sedes-title" eyebrow="Dónde estamos" title="Nuestras sedes." />
        <Locations />
      </Section>

      <Contact />
    </>
  );
}
