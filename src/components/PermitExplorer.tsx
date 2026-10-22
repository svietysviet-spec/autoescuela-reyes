"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CATEGORY_LABELS, PERMITS, SITE, SPOTLIGHT, euro, wa, type PermitCategory } from "@/lib/site";
import SpotlightCard from "./reactbits/SpotlightCard";

type Filter = "todos" | PermitCategory;

const FILTERS: Filter[] = ["todos", "coche", "moto", "profesional"];

export function PermitExplorer() {
  const [filter, setFilter] = useState<Filter>("todos");
  const list = filter === "todos" ? PERMITS : PERMITS.filter((p) => p.category === filter);

  return (
    <div>
      <div
        role="group"
        aria-label="Filtrar permisos por tipo"
        className="reveal mb-6 inline-flex max-w-full overflow-x-auto rounded-[12px] bg-bg-grouped p-1"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className="h-9 shrink-0 rounded-[9px] px-4 text-[15px] font-medium text-text-2 transition-[background-color,color,box-shadow] duration-200 ease-[var(--ease-out)] aria-pressed:bg-bg-elevated aria-pressed:text-text aria-pressed:shadow-[0_1px_3px_#0000001f]"
          >
            {f === "todos" ? "Todos" : CATEGORY_LABELS[f]}
          </button>
        ))}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.slug} className="flex">
            <SpotlightCard {...SPOTLIGHT} className="card !rounded-[18px] !border-0 !p-0 flex w-full flex-col overflow-hidden">
            <div className="relative aspect-[4/3] bg-bg-grouped">
              <Image
                src={p.image}
                alt={p.imageAlt}
                fill
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="eyebrow">{CATEGORY_LABELS[p.category]}</p>
              <h3 className="h3 mt-1">
                {p.name} · <span className="text-text-2">{p.title}</span>
              </h3>
              <p className="mt-2 text-[15px] text-text-2">{p.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.facts.map((f) => (
                  <li key={f} className="rounded-full bg-accent-tint px-2.5 py-1 text-[13px] font-medium text-text">
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                {p.from !== undefined && (
                  <p className="mb-3 text-[15px] text-text-2">
                    Matrícula desde <span className="text-[20px] font-semibold text-text">{euro(p.from)}</span>
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Link href={p.href} className="btn btn-accent btn-sm">
                    Ver detalles
                  </Link>
                  <a
                    href={wa(SITE.whatsapp, `Hola, quiero información sobre el ${p.name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gray btn-sm"
                  >
                    Pide info
                  </a>
                </div>
              </div>
            </div>
            </SpotlightCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
