import { Contact } from "./Contact";
import { PageHero } from "./PageHero";
import { Pricing } from "./Pricing";
import { Button, CheckList, Section, SectionHeader } from "./ui";
import { LINKS } from "@/lib/site";

const COMMON_INCLUDES = ["Acceso al campus virtual", "Tutor online 24 h", "Acceso gratis a AEOL Cloud (test desde casa)"];

/** Plantilla compartida de los permisos C (camión) y D (guagua). */
export function ProfessionalPermit({
  letter,
  vehicle,
  scope,
  sector,
  otherSector,
  image,
  imageAlt,
  enrollHref,
}: {
  letter: "C" | "D";
  vehicle: string;
  scope: string;
  sector: "mercancías" | "viajeros";
  otherSector: "mercancías" | "viajeros";
  image: string;
  imageAlt: string;
  enrollHref: string;
}) {
  const message = `Hola, quiero información sobre el permiso ${letter}.`;
  return (
    <>
      <PageHero
        eyebrow={`Permiso ${letter} · ${vehicle}`}
        title={`Conduce ${letter === "C" ? "camión" : "guagua"} y trabaja en el transporte.`}
        lead={`${scope} Te preparamos para el permiso y, si lo necesitas, para el CAP de ${sector}.`}
        image={image}
        imageAlt={imageAlt}
        message={message}
      />

      <Section tone="grouped" labelledBy="saber-title">
        <SectionHeader
          id="saber-title"
          eyebrow="Qué necesitas saber"
          title="El permiso y el CAP, por separado."
          lead={`Si quieres trabajar en el transporte necesitas el permiso ${letter} y, salvo excepciones, el Certificado de Aptitud Profesional (CAP).`}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="reveal card p-6">
            <p className="eyebrow">Permiso {letter}</p>
            <h3 className="h3 mt-1">{scope}</h3>
            <p className="mt-4 text-[15px] font-semibold">Para obtenerlo deberás superar:</p>
            <CheckList
              className="mt-3 text-[15px]"
              items={[
                "Examen teórico DGT (20 preguntas, máximo 2 fallos)",
                "Examen de maniobras en circuito cerrado",
                "Examen de circulación en vías abiertas",
              ]}
            />
          </div>
          <div className="reveal card p-6" style={{ "--i": 1 } as React.CSSProperties}>
            <p className="eyebrow">Certificado de Aptitud Profesional</p>
            <h3 className="h3 mt-1">Obligatorio para trabajar como conductor profesional.</h3>
            <p className="mt-4 text-[15px] font-semibold">Para obtenerlo deberás realizar:</p>
            <CheckList
              className="mt-3 text-[15px]"
              items={[`Curso CAP inicial acelerado de ${sector}: 130 h teóricas + 10 h prácticas`, "Examen oficial CAP al finalizar el curso"]}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <Button href={LINKS.capFaq} variant="gray" size="sm">
                Excepciones del CAP
              </Button>
              <Button href="/cap" variant="gray" size="sm">
                Cursos CAP
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="tarifas" tone="plain" labelledBy="tarifas-title">
        <SectionHeader
          id="tarifas-title"
          eyebrow="Tarifas"
          title="¿Quieres matricularte?"
          lead="Cuenta con la mejor formación posible. Fácil, rápido y seguro."
        />
        <Pricing
          plans={[
            {
              name: "CAP inicial acelerado",
              price: 1500,
              description: `Para sacarte el carnet de ${letter === "C" ? "camión" : "guagua"} y el CAP de ${sector}.`,
              includes: [
                "Curso teórico CAP inicial 130 h",
                "12 prácticas CAP de 45 min",
                "1 práctica CAP de 60 min",
                "Matrícula CAP",
                `50 % de la matrícula «${letter}»`,
                ...COMMON_INCLUDES,
              ],
              featured: true,
            },
            {
              name: `Matrícula permiso «${letter}»`,
              price: 100,
              description: "Únicamente el permiso, sin CAP.",
              includes: [`Matrícula «${letter}»`, ...COMMON_INCLUDES],
              note: "El CAP es necesario para trabajar en el sector salvo excepciones. Asegúrate de no necesitarlo.",
              enrollHref,
            },
            {
              name: "CAP ampliación",
              price: 350,
              description: `Si ya tienes el CAP inicial de ${otherSector} y quieres ampliar a ${sector}.`,
              includes: ["Curso CAP ampliación 32,5 h", "2 prácticas CAP de 45 min", "1 práctica CAP de 60 min", "Matrícula CAP", ...COMMON_INCLUDES],
            },
          ]}
        />
      </Section>

      <Contact message={message} />
    </>
  );
}
