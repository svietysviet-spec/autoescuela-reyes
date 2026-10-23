import type { Metadata } from "next";
import { Suspense } from "react";
import { CarExplorer } from "@/components/coche/CarExplorer";
import { Section, SectionHeader } from "@/components/ui";
import { CREDITO, FICHA, LUCES, MANDOS, PERMISO_B, RUEDAS, getMando, getVista } from "@/content/coche";

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const m = getMando(one(sp.mando));
  const v = getVista(one(sp.vista));
  const title = m
    ? `${m.nombre} · Conoce tu coche de prácticas`
    : v.slug !== "general"
      ? `${v.nombre} · Conoce tu coche de prácticas`
      : "Conoce tu coche de prácticas en 3D";
  const canonical = m ? `/conoce-tu-coche?vista=interior&mando=${m.slug}` : v.slug !== "general" ? `/conoce-tu-coche?vista=${v.slug}` : "/conoce-tu-coche";
  return {
    title,
    description: m
      ? `${m.queEs} Aprende en 3D dónde está y cómo se usa en el coche de prácticas de Autoescuela Reyes.`
      : v.slug !== "general"
        ? `${v.resumen} En 3D, con el coche de prácticas de Autoescuela Reyes.`
        : "Súbete en 3D al coche de prácticas de Autoescuela Reyes: siéntate al volante y aprende dónde está cada mando y para qué sirve.",
    alternates: { canonical },
  };
}

async function Explorer({ searchParams }: Props) {
  const sp = await searchParams;
  const mando = getMando(one(sp.mando));
  const vista = mando ? "interior" : getVista(one(sp.vista)).slug;
  const lista = vista === "luces" ? LUCES : vista === "ruedas" ? RUEDAS : [];
  const detalle = lista.find((d) => d.slug === one(sp.detalle))?.slug ?? (vista === "luces" ? "cruce" : null);
  return <CarExplorer initialVista={vista} initialMando={mando?.slug ?? null} initialDetalle={detalle} />;
}

export default function ConoceTuCoche({ searchParams }: Props) {
  return (
    <>
      <Suspense fallback={<div className="car-stage h-[calc(100svh-64px)] min-h-[560px]" />}>
        <Explorer searchParams={searchParams} />
      </Suspense>

      <Section tone="grouped" labelledBy="mandos-title">
        <SectionHeader
          id="mandos-title"
          eyebrow="Conoce tu coche de prácticas"
          title="Los mandos, uno a uno."
          lead="Todo lo que ves en 3D, explicado también aquí. Así puedes repasarlo aunque tu navegador no muestre el coche."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {MANDOS.filter((m) => m.disponible).map((m) => (
            <article key={m.slug} id={`mando-${m.slug}`} className="card p-5">
              <h3 className="h3">{m.nombre}</h3>
              <p className="mt-2 text-[15px] text-text-2">{m.queEs}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px]">
                {m.comoSeUsa.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="mt-3 text-[14px]">
                <strong>Consejo:</strong> <span className="text-text-2">{m.consejo}</span>
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {(
            [
              ["luces-title", "Las luces y cuándo usarlas", LUCES],
              ["ruedas-title", "Ruedas, pinchazos y la luz V16", RUEDAS],
            ] as const
          ).map(([id, t, items]) => (
            <article key={id} aria-labelledby={id} className="card p-5">
              <h3 id={id} className="h3">
                {t}
              </h3>
              <dl className="mt-3 space-y-3 text-[15px]">
                {items.map((d) => (
                  <div key={d.slug}>
                    <dt className="font-semibold">{d.nombre}</dt>
                    <dd className="text-text-2">
                      {d.clave} {d.texto.join(" ")}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
          <article aria-labelledby="ficha-title" className="card p-5 lg:col-span-2">
            <h3 id="ficha-title" className="h3">
              Ficha del coche
            </h3>
            <dl className="mt-3 grid gap-x-8 gap-y-1 text-[15px] sm:grid-cols-2">
              {FICHA.map((f) => (
                <div key={f.k} className="flex justify-between gap-4 border-b border-line py-1.5">
                  <dt className="text-text-2">{f.k}</dt>
                  <dd className="text-right font-semibold">{f.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[14px] text-text-2">{PERMISO_B}</p>
          </article>
        </div>

        <p className="mt-8 text-[13px] text-text-2">
          Modelo 3D basado en{" "}
          <a href={CREDITO.url} className="link" target="_blank" rel="noopener noreferrer">
            «{CREDITO.titulo}»
          </a>{" "}
          de {CREDITO.autor}, con licencia{" "}
          <a href={CREDITO.licenciaUrl} className="link" target="_blank" rel="noopener noreferrer">
            {CREDITO.licencia}
          </a>
          . Modificado por Autoescuela Reyes: sin logotipos de la marca, con nuestra rotulación y una cabina hecha a medida.
        </p>
      </Section>
    </>
  );
}
