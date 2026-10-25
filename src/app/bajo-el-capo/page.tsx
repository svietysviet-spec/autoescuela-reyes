import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Explorer } from "@/components/capo/Explorer";
import { Section, SectionHeader } from "@/components/ui";
import { PIEZAS, PIEZA_DEFECTO, getPieza } from "@/content/capo";

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const slugOf = async (searchParams: Props["searchParams"]) => {
  const p = (await searchParams).pieza;
  return getPieza(Array.isArray(p) ? p[0] : p);
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const pieza = await slugOf(searchParams);
  const url = pieza.slug === PIEZA_DEFECTO ? "/bajo-el-capo" : `/bajo-el-capo?pieza=${pieza.slug}`;
  return {
    title: `Bajo el capó · ${pieza.corto} en 3D`,
    description: `Aprende en 3D qué es y cómo se revisa: ${pieza.nombre.toLowerCase()}. Paso a paso, para el examen y para tu día a día.`,
    alternates: { canonical: url },
    openGraph: { title: `Bajo el capó · ${pieza.nombre}`, url },
  };
}

async function ExplorerFor({ searchParams }: Props) {
  const pieza = await slugOf(searchParams);
  return <Explorer key={pieza.slug} initialSlug={pieza.slug} />;
}

export default function BajoElCapo({ searchParams }: Props) {
  return (
    <>
      <Suspense fallback={<div className="h-[calc(100svh-64px)] min-h-[640px] bg-[#0b0d12]" />}>
        <ExplorerFor searchParams={searchParams} />
      </Suspense>
      <div className="h-16 lg:hidden" aria-hidden />

      <Section tone="grouped" labelledBy="capo-uso">
        <SectionHeader
          id="capo-uso"
          eyebrow="Bajo el capó"
          title="Aprende tu coche por dentro."
          lead="Abre el capó del coche de prácticas y pulsa cada pieza para ver dónde está y cómo se revisa. En la vista de cada pieza puedes girarla, separarla con Explode y usar Rayos X y Corte para ver qué hay dentro. Cada pieza tiene su ficha con lo que cae en el examen."
        />
        <ul className="flex flex-wrap gap-2">
          {PIEZAS.filter((p) => p.disponible).map((p) => (
            <li key={p.slug}>
              <Link href={`/bajo-el-capo?pieza=${p.slug}`} className="chip">
                {p.nombre}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] text-text-2">Modelos 3D simplificados creados por Autoescuela Reyes con fines educativos.</p>
      </Section>
    </>
  );
}
