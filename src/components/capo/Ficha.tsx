"use client";

import { useState } from "react";
import type { Pieza, Pregunta } from "@/content/capo";
import { CheckList } from "../ui";

const TABS = [
  { id: "que", label: "Qué es" },
  { id: "revisar", label: "Cómo se revisa" },
  { id: "falla", label: "Cuándo falla" },
  { id: "cuidados", label: "Cuidados" },
  { id: "examen", label: "Examen" },
  { id: "datos", label: "Datos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Ficha de la pieza. Todo el texto está en el HTML (se lee sin 3D y lo indexa Google). */
export function Ficha({ pieza, onAnimate, onDetail }: { pieza: Pieza; onAnimate?: () => void; onDetail?: () => void }) {
  const [tab, setTab] = useState<TabId>("que");
  const [shown, setShown] = useState(pieza.slug);
  if (shown !== pieza.slug) {
    setShown(pieza.slug);
    setTab("que");
  }

  return (
    <div className="px-5 pb-8 pt-2 lg:pt-6">
      <p className="eyebrow">{pieza.sistema}</p>
      <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.02em]">{pieza.nombre}</h1>
      <p className="mt-1 text-[15px] text-text-2">{pieza.subtitulo}</p>
      {onDetail && (
        <button type="button" onClick={onDetail} className="btn btn-accent btn-sm mt-4">
          Ver esta pieza en 3D →
        </button>
      )}

      {pieza.aviso && <p className="mt-4 rounded-xl border border-[#e5484d55] bg-[#e5484d1a] px-3 py-2 text-[15px] font-semibold">⚠️ {pieza.aviso}</p>}

      <div role="tablist" aria-label="Secciones de la ficha" className="mt-5 flex flex-wrap gap-x-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className="capo-tab"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 text-[16px] leading-relaxed">
        <Panel id="que" tab={tab}>
          <div className="space-y-3">
            {pieza.queEs?.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Panel>

        <Panel id="revisar" tab={tab}>
          <ol className="space-y-4">
            {pieza.revisar?.map((s, i) => (
              <li key={s.titulo} className="flex gap-3">
                <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-[14px] font-bold text-on-accent">
                  {i + 1}
                </span>
                <span>
                  <strong className="block">{s.titulo}</strong>
                  <span className="text-text-2">{s.texto}</span>
                </span>
              </li>
            ))}
          </ol>
          {onAnimate && (
            <button type="button" onClick={onAnimate} className="btn btn-accent mt-6 w-full">
              ▶ Verlo en 3D paso a paso
            </button>
          )}
        </Panel>

        <Panel id="falla" tab={tab}>
          <CheckList items={pieza.falla ?? []} />
        </Panel>

        <Panel id="cuidados" tab={tab}>
          <CheckList items={pieza.cuidados ?? []} />
        </Panel>

        <Panel id="examen" tab={tab}>
          <p className="mb-4 text-[14px] text-text-2">Preguntas tipo test al estilo de la DGT, de elaboración propia (no son preguntas oficiales).</p>
          <div className="space-y-6">
            {pieza.examen?.map((q, i) => (
              <Quiz key={q.q} q={q} n={i + 1} />
            ))}
          </div>
        </Panel>

        <Panel id="datos" tab={tab}>
          <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {pieza.datos?.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[42%_1fr] gap-3 px-3 py-2.5 text-[15px]">
                <dt className="text-text-2">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] text-text-2">Datos generales. Para tu coche concreto, consulta siempre su manual.</p>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ id, tab, children }: { id: TabId; tab: TabId; children: React.ReactNode }) {
  return (
    <section role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={tab !== id}>
      {children}
    </section>
  );
}

function Quiz({ q, n }: { q: Pregunta; n: number }) {
  const [pick, setPick] = useState<number | null>(null);
  const done = pick !== null;
  return (
    <fieldset>
      <legend className="font-semibold">
        {n}. {q.q}
      </legend>
      <div className="mt-3 grid gap-2">
        {q.opts.map((o, i) => {
          const state = !done ? "" : i === q.correcta ? "ok" : i === pick ? "bad" : "dim";
          return (
            <button key={o} type="button" disabled={done} onClick={() => setPick(i)} className={`capo-opt ${state}`}>
              <span className="capo-key">{done && i === q.correcta ? "✓" : done && i === pick ? "✕" : "abc"[i]}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {done && (
        <p className="mt-3 text-[15px]" aria-live="polite">
          <strong>{pick === q.correcta ? "¡Correcto! " : "No es esa. "}</strong>
          <span className="text-text-2">{q.explica}</span>
        </p>
      )}
    </fieldset>
  );
}
