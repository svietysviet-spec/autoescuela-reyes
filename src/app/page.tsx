import Image from "next/image";
import Link from "next/link";
import { Contact } from "@/components/Contact";
import { WhatsApp } from "@/components/icons";
import { Locations } from "@/components/Locations";
import { HeroTitle } from "@/components/PageHero";
import { PermitExplorer } from "@/components/PermitExplorer";
import CountUp from "@/components/reactbits/CountUp";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { Steps } from "@/components/Steps";
import { Button, Section, SectionHeader, TextLink } from "@/components/ui";
import { CENTERS, LINKS, SITE, SPOTLIGHT, euro, wa } from "@/lib/site";

const EXTRAS = [
  {
    href: "/cap",
    eyebrow: "Profesionales",
    title: "Cursos CAP",
    body: "Inicial, ampliación y formación continua para trabajar en el transporte.",
    facts: ["Inicial 140 h", "Desde 250 €"],
    image: "/img/cap-conductor.jpg",
    alt: "Conductor profesional sonriendo al volante de un vehículo pesado",
  },
  {
    href: "/recuperacion-de-puntos",
    eyebrow: "Centro autorizado DGT",
    title: "Recuperación de puntos",
    body: "Curso parcial de 10 h (hasta 4 puntos) o total de 20 h (hasta 8 puntos).",
    facts: ["7 Palmas y Telde", "Profesores especializados"],
    image: "/img/puntos-aula.jpg",
    alt: "Aula de un curso de recuperación de puntos",
  },
  {
    href: "/permiso-b#amaxofobia",
    eyebrow: "Amaxofobia",
    title: "¿Miedo a conducir?",
    body: "Profesor especializado y clases adaptadas para recuperar la confianza al volante.",
    facts: ["Proceso progresivo", "Clases a tu ritmo"],
    image: "/img/amaxofobia.jpg",
    alt: "Conductor con las manos en la cara dentro de un coche de la autoescuela",
  },
  {
    href: "/permiso-b#reciclaje",
    eyebrow: "Reciclaje",
    title: "Vuelve a conducir",
    body: "Prácticas de reciclaje si hace tiempo que no te pones al volante.",
    facts: [`${euro(33)} la práctica`, "Sin listas de espera"],
    image: "/img/reciclaje.jpg",
    alt: "Coche de la autoescuela con el capó abierto y un cartel de error 404",
  },
];

const STATS = [
  { n: CENTERS.length, suffix: "", label: "centros en Gran Canaria", sub: "7 Palmas, La Feria y Telde" },
  { n: 24, suffix: " h", label: "tutor online", sub: "Para resolver tus dudas del teórico" },
  { n: 3, suffix: "", label: "formas de sacarte el B", sub: "Manual, automático o adaptado (PMR)" },
  { n: 2, suffix: " meses", label: "de AEOL incluidos", sub: "La app para practicar test de examen" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-bg pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="max-w-[860px]">
            <p className="eyebrow reveal mb-3">Autoescuela en Las Palmas de Gran Canaria desde {SITE.foundedYear}</p>
            <h1 className="h1">
              <HeroTitle text="Aprende a conducir. Nunca ha estado tan fácil." />
            </h1>
            <p className="lead reveal mt-5 max-w-[640px]" style={{ "--i": 2 } as React.CSSProperties}>
              Coche, moto, camión y guagua, cursos CAP y recuperación de puntos. Formación cercana para que conduzcas con
              seguridad y confianza, no solo para aprobar.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3" style={{ "--i": 3 } as React.CSSProperties}>
              <Button href="#permisos" arrow>
                Matricúlate
              </Button>
              <Button
                href={wa(SITE.whatsapp, "Hola, quiero información sobre los permisos de Autoescuela Reyes.")}
                variant="gray"
                icon={<WhatsApp width={18} height={18} />}
              >
                Pide información
              </Button>
            </div>
          </div>
          <div
            className="reveal relative mt-10 aspect-[4/3] overflow-hidden rounded-[22px] bg-bg-grouped sm:aspect-[16/9] md:mt-14"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <Image
              src="/img/hero-coche-calle.jpg"
              alt="Coche de prácticas de Autoescuela Reyes aparcado en una calle de Las Palmas"
              fill
              preload
              fetchPriority="high"
              sizes="(min-width: 1120px) 1072px, calc(100vw - 32px)"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Permisos */}
      <Section id="permisos" tone="plain" labelledBy="permisos-title" className="!pt-4 md:!pt-8">
        <SectionHeader
          id="permisos-title"
          eyebrow="Permisos"
          title="¿Qué permiso te interesa?"
          lead="Elige el tuyo y descubre cómo empezar. La matrícula incluye campus virtual, tutor online 24 h y app de test."
        />
        <PermitExplorer />
      </Section>

      {/* Complementarios */}
      <Section tone="grouped" labelledBy="cursos-title">
        <SectionHeader
          id="cursos-title"
          eyebrow="Cursos y servicios"
          title="Mucho más que el carnet."
          lead="Formación profesional, cursos oficiales de la DGT y clases pensadas para cada situación."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXTRAS.map((s, i) => (
            <li key={s.title} style={{ "--i": i } as React.CSSProperties} className="reveal flex">
              <SpotlightCard {...SPOTLIGHT} className="card !rounded-[18px] !border-0 !p-0 flex w-full flex-col overflow-hidden">
              <div className="relative aspect-[4/3] bg-bg-2">
                <Image src={s.image} alt={s.alt} fill sizes="(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="eyebrow">{s.eyebrow}</p>
                <h3 className="h3 mt-1">{s.title}</h3>
                <p className="mt-2 text-[15px] text-text-2">{s.body}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {s.facts.map((f) => (
                    <li key={f} className="rounded-full bg-accent-tint px-2.5 py-1 text-[13px] font-medium">
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <Link href={s.href} className="btn btn-gray btn-sm w-full">
                    Ver detalles
                  </Link>
                </div>
              </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </Section>

      {/* Bajo el capó (explorador 3D) */}
      <Section tone="plain" labelledBy="capo-title" className="!pb-0">
        <div className="reveal grid overflow-hidden rounded-[22px] bg-[#0b0d12] text-white md:grid-cols-[1.1fr_1fr]">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[360px]">
            <Image
              src="/img/capo/motor.webp"
              alt="Compartimento del motor en 3D con el radiador, la batería y los depósitos"
              fill
              sizes="(min-width: 768px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <p className="eyebrow">Nuevo · En 3D</p>
            <h2 id="capo-title" className="h2 mt-2">
              Aprende qué hay bajo el capó.
            </h2>
            <p className="mt-3 text-white/70">
              Gira cada pieza, mírala por dentro y aprende a revisar el aceite, el refrigerante, los frenos o la batería. Con
              preguntas tipo test para el examen.
            </p>
            <div className="mt-6">
              <Button href="/bajo-el-capo" arrow>
                Abrir el explorador
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Por qué */}
      <Section tone="plain" labelledBy="porque-title">
        <SectionHeader
          id="porque-title"
          eyebrow="Por qué Reyes"
          title="Te acompañamos en todo el proceso."
          lead="Enseñanza clara, práctica y adaptada a ti, con trato personalizado desde el primer día."
          action={<TextLink href="/nosotros">Conócenos</TextLink>}
        />
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <li key={s.label} style={{ "--i": i } as React.CSSProperties} className="reveal card p-5 md:p-6">
              <p className="text-[clamp(2rem,1.5rem+2vw,3rem)] font-bold leading-none tracking-[-0.035em]">
                <CountUp to={s.n} suffix={s.suffix} duration={1.2} />
              </p>
              <p className="mt-2 font-semibold">{s.label}</p>
              <p className="mt-1 text-[13px] text-text-2">{s.sub}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Cómo funciona */}
      <Section tone="grouped" labelledBy="pasos-title">
        <SectionHeader
          id="pasos-title"
          eyebrow="Cómo funciona"
          title="Del primer test al carnet, paso a paso."
          lead="Así es sacarse el permiso B con nosotros."
        />
        <Steps
          steps={[
            {
              title: "Matricúlate online",
              body: `Elige tu modalidad y matricúlate en minutos. Matrícula básica desde ${euro(50)}.`,
              action: <TextLink href="/permiso-b#tarifas">Ver tarifas</TextLink>,
            },
            {
              title: "Prepara el teórico",
              body: "Campus virtual, tutor online 24 h, app AEOL y clases intensivas presenciales y online. Examen: 30 preguntas, máximo 3 fallos.",
              action: <TextLink href={LINKS.campus}>Ir al campus</TextLink>,
            },
            {
              title: "Clases prácticas",
              body: "Un profesor te guía paso a paso. Compra tus prácticas online desde el área de alumno.",
              action: <TextLink href={LINKS.alumno}>Comprar prácticas</TextLink>,
            },
            {
              title: "Examen de circulación",
              body: "Llegas preparado y con confianza. Después consulta tu nota y tu autorización temporal en la DGT.",
              action: <TextLink href={LINKS.notaExamen}>Consultar nota</TextLink>,
            },
          ]}
        />
      </Section>

      {/* Sedes */}
      <Section id="sedes" tone="plain" labelledBy="sedes-title">
        <SectionHeader id="sedes-title" eyebrow="Sedes" title="Cerca de ti." lead="Elige la sede que te quede mejor." />
        <Locations />
      </Section>

      <Contact />
    </>
  );
}
