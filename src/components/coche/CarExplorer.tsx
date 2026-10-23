"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FICHA, LUCES, MANDOS, PERMISO_B, PREGUNTAS, RUEDAS, VISTAS, getMando, type Detalle, type Mando } from "@/content/coche";
import { CABIN_INICIAL, MARCHAS, type CabinState, type Marcha } from "./Cockpit";
import { click, horn, setMuted } from "./sound";

const CarViewer = dynamic(() => import("./CarViewer"), { ssr: false });

// ---- preferencias del navegador ----
const mq = (q: string) => ({
  sub: (cb: () => void) => {
    const m = matchMedia(q);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  },
  get: () => matchMedia(q).matches,
});
const RM = mq("(prefers-reduced-motion: reduce)");
const SMALL = mq("(max-width: 1023px)");
const useMedia = (m: ReturnType<typeof mq>, server: boolean) => useSyncExternalStore(m.sub, m.get, () => server);
let glCache: boolean | undefined;
const hasWebGL = () => {
  if (glCache === undefined) {
    try {
      const c = document.createElement("canvas");
      glCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      glCache = false;
    }
  }
  return glCache;
};
const useWebGL = () => useSyncExternalStore(() => () => {}, hasWebGL, () => null);

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

const RUEDAS_CAM = { pos: [3.4, 1.2, 3.4] as [number, number, number], target: [0.3, 0.45, 0.3] as [number, number, number] };
/** Al salir de una vista se apagan las luces y señales que ella encendió. */
const SIN_SENALES: Partial<CabinState> = { luces: 0, intermitente: 0, warning: false, pisar: null, v16: false };

export function CarExplorer({ initialVista, initialMando, initialDetalle }: { initialVista: string; initialMando: string | null; initialDetalle: string | null }) {
  const [vista, setVista] = useState(initialVista);
  const [mando, setMando] = useState<string | null>(initialMando);
  const [detalle, setDetalle] = useState<string | null>(initialDetalle);
  const [night, setNight] = useState(initialVista === "luces");
  // preferencia de sonido guardada en este navegador (se lee tras montar, para no desajustar la hidratación)
  const mutedPref = useSyncExternalStore(
    () => () => {},
    () => store.get("reyes-sonido") === "off",
    () => false,
  );
  const [mutedChoice, setMutedState] = useState<boolean | null>(null);
  const muted = mutedChoice ?? mutedPref;
  const [cabin, setCabin] = useState<CabinState>(() => {
    const luz = initialVista === "luces" ? LUCES.find((l) => l.slug === initialDetalle) : null;
    if (luz) return { ...CABIN_INICIAL, ...luzEstado(luz) };
    return initialMando === "desempanador" ? { ...CABIN_INICIAL, empanado: true } : CABIN_INICIAL;
  });
  const [sheet, setSheet] = useState(!!initialMando);
  const [quiz, setQuiz] = useState<{ i: number; elegida: number | null; aciertos: number }>({ i: 0, elegida: null, aciertos: 0 });
  const cabinRef = useRef<CabinState>(cabin);
  const reduced = useMedia(RM, false);
  const small = useMedia(SMALL, false);
  const webgl = useWebGL();

  useEffect(() => {
    cabinRef.current = cabin;
  }, [cabin]);
  useEffect(() => {
    setMuted(muted);
    store.set("reyes-sonido", muted ? "off" : "on");
  }, [muted]);

  const url = (v: string, extra: Record<string, string | null> = {}) => {
    const q = new URLSearchParams();
    if (v !== "general") q.set("vista", v);
    for (const [k, val] of Object.entries(extra)) if (val) q.set(k, val);
    window.history.replaceState(null, "", `/conoce-tu-coche${q.size ? `?${q}` : ""}`);
  };
  const goVista = (v: string) => {
    setVista(v);
    setMando(null);
    setDetalle(null);
    setSheet(false);
    setCabin((c) => ({ ...c, ...SIN_SENALES, luces: night ? 2 : 0 }));
    if (v === "luces") {
      setNight(true);
      pickLuz("cruce");
      return;
    }
    if (v === "prueba") setQuiz({ i: 0, elegida: null, aciertos: 0 });
    url(v);
  };
  const pick = (m: string | null) => {
    setMando(m);
    setVista("interior");
    setSheet(!!m);
    // el desempañador se explica mejor con el cristal empañado
    if (m === "desempanador") setCabin((c) => ({ ...c, empanado: true, parabrisas: false }));
    url("interior", { mando: m });
  };
  function pickLuz(slug: string) {
    const luz = LUCES.find((l) => l.slug === slug);
    if (!luz) return;
    setVista("luces");
    setDetalle(slug);
    click(1.3, 0.18);
    setCabin((c) => ({ ...c, ...SIN_SENALES, ...luzEstado(luz) }));
    url("luces", { detalle: slug });
  }
  const pickRueda = (slug: string | null) => {
    setDetalle(slug);
    url("ruedas", { detalle: slug });
  };
  const toggleNight = () => {
    setNight((n) => !n);
    // de noche, en la vista general, el coche lleva las luces de cruce
    if (vista !== "luces") setCabin((c) => ({ ...c, luces: !night ? 2 : 0 }));
  };

  const vistaInfo = VISTAS.find((v) => v.slug === vista) ?? VISTAS[0];
  const m = vista === "interior" ? getMando(mando) : null;
  const pregunta = vista === "prueba" ? PREGUNTAS[quiz.i] : undefined;
  const respondida = pregunta && quiz.elegida !== null;
  const quizFuera = respondida && pregunta.vista === "ruedas";
  const luz = vista === "luces" ? LUCES.find((l) => l.slug === detalle) : undefined;
  const rueda = vista === "ruedas" ? RUEDAS.find((r) => r.slug === detalle) : undefined;

  const viewer = {
    dentro: vistaInfo.dentro && !quizFuera,
    mando: vista === "interior" ? mando : respondida ? (pregunta.mando ?? null) : null,
    ext:
      vista === "especificaciones"
        ? ("lado" as const)
        : vista === "luces"
          ? (luz?.cam ?? LUCES[1].cam)
          : vista === "ruedas"
            ? (rueda?.cam ?? RUEDAS_CAM)
            : quizFuera
              ? RUEDAS[0].cam
              : null,
    orbit: vista === "general",
    medidas: vista === "especificaciones",
    puntos: vista === "interior" ? "interior" : vista === "ruedas" ? "ruedas" : vista === "especificaciones" ? "ficha" : null,
    activo: vista === "interior" ? mando : vista === "ruedas" ? detalle : null,
  };

  return (
    <div className={`car-stage relative h-[calc(100svh-64px)] min-h-[560px] overflow-hidden ${night ? "is-night" : ""}`}>
      {/* título gigante de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[9%] text-center">
        <span key={vistaInfo.titulo} className="car-bigtitle">
          {vistaInfo.titulo}
        </span>
      </div>

      {webgl === false ? (
        <div className="absolute inset-0">
          <Image src="/img/coche/general.webp" alt="El coche de prácticas de Autoescuela Reyes, blanco con franjas amarillas" fill sizes="100vw" className="object-contain p-8 pb-40" />
          <p className="absolute inset-x-0 top-1/2 px-6 text-center text-[14px] text-white/70">Tu navegador no puede mostrar 3D. Más abajo tienes todos los mandos explicados.</p>
        </div>
      ) : webgl ? (
        <CarViewer
          {...viewer}
          night={night}
          reduced={reduced}
          lite={small}
          cabin={cabinRef}
          onPick={(id) => (vista === "ruedas" ? pickRueda(id) : pick(id))}
        />
      ) : null}

      {/* menú de vistas (escritorio) */}
      <nav aria-label="Vistas del coche" className="absolute left-6 top-1/2 hidden -translate-y-1/2 lg:block">
        <ol className="space-y-1">
          {VISTAS.map((v, i) => (
            <li key={v.slug}>
              <VistaButton v={v} i={i} active={vista === v.slug} onPick={goVista} />
            </li>
          ))}
        </ol>
      </nav>

      {/* botones de la derecha */}
      <div className="absolute right-4 top-4 flex gap-2 lg:right-6 lg:top-6 lg:flex-col">
        <button type="button" className="car-round" aria-pressed={night} aria-label={night ? "Modo día" : "Modo noche"} onClick={toggleNight}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            {night ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
              </>
            ) : (
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            )}
          </svg>
        </button>
        <button type="button" className="car-round" aria-pressed={!muted} aria-label={muted ? "Activar sonido" : "Silenciar"} onClick={() => setMutedState(!muted)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
            {muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
          </svg>
        </button>
      </div>

      {/* tarjeta de la vista (cuando no hay mando abierto) */}
      {!m && (
        <div className="car-card car-panel absolute left-4 right-4 p-4 lg:left-auto lg:right-6 lg:w-[380px]">
          {vista === "general" && (
            <>
              <p className="car-eyebrow">{vistaInfo.nombre}</p>
              <p className="mt-1 text-[15px] leading-snug text-white/80">{vistaInfo.resumen}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn btn-accent btn-sm" onClick={() => goVista("interior")}>
                  Siéntate al volante →
                </button>
                <button type="button" className="car-chip" onClick={() => goVista("prueba")}>
                  Ponte a prueba
                </button>
              </div>
            </>
          )}
          {vista === "interior" && (
            <>
              <p className="car-eyebrow">{vistaInfo.nombre}</p>
              <p className="mt-1 text-[15px] leading-snug text-white/80">{vistaInfo.resumen}</p>
              <div className="car-chips mt-3">
                {MANDOS.filter((x) => x.disponible).map((x) => (
                  <button key={x.slug} type="button" className="car-chip" onClick={() => pick(x.slug)}>
                    {x.corto}
                  </button>
                ))}
              </div>
            </>
          )}
          {vista === "especificaciones" && <FichaCard />}
          {vista === "luces" && <DetalleCard titulo="Luces" items={LUCES} actual={luz} onPick={pickLuz} />}
          {vista === "ruedas" && (
            <DetalleCard titulo="Ruedas y emergencias" items={RUEDAS} actual={rueda} onPick={(s) => pickRueda(s)}>
              {rueda?.slug === "v16" && (
                <Opt on={cabin.v16} onClick={() => (click(1.3, 0.18), setCabin((c) => ({ ...c, v16: !c.v16 })))}>
                  {cabin.v16 ? "Apagar la V16" : "Encender la V16"}
                </Opt>
              )}
            </DetalleCard>
          )}
          {vista === "prueba" && (
            <QuizCard
              quiz={quiz}
              onAnswer={(n) => {
                click(n === PREGUNTAS[quiz.i].ok ? 1.6 : 0.6, 0.2);
                setQuiz((q) => ({ ...q, elegida: n, aciertos: q.aciertos + (n === PREGUNTAS[q.i].ok ? 1 : 0) }));
              }}
              onNext={() => setQuiz((q) => ({ ...q, i: q.i + 1, elegida: null }))}
              onRestart={() => setQuiz({ i: 0, elegida: null, aciertos: 0 })}
              onSeeMando={(s) => pick(s)}
            />
          )}
        </div>
      )}

      {/* ficha del mando: panel a la derecha (escritorio) u hoja que sube (móvil) */}
      {m && (
        <aside className={`car-ficha ${sheet ? "is-open" : ""}`} aria-label={`Ficha: ${m.nombre}`}>
          <button type="button" className="car-ficha-grab lg:hidden" onClick={() => setSheet((s) => !s)} aria-expanded={sheet}>
            <span className="capo-grab-bar" />
            <span className="flex w-full justify-between gap-3">
              <span className="truncate font-semibold">{m.nombre}</span>
              <span className="shrink-0 text-[14px] font-semibold text-accent">{sheet ? "Cerrar" : "Ver ficha"}</span>
            </span>
          </button>
          <MandoFicha m={m} cabin={cabin} setCabin={setCabin} onClose={() => pick(null)} />
        </aside>
      )}

      {/* pestañas de vistas (móvil) */}
      <nav aria-label="Vistas del coche" className="car-tabs lg:hidden">
        {VISTAS.map((v, i) => (
          <VistaButton key={v.slug} v={v} i={i} active={vista === v.slug} onPick={goVista} compact />
        ))}
      </nav>
    </div>
  );
}

function luzEstado(l: (typeof LUCES)[number]): Partial<CabinState> {
  const e = l.estado;
  return {
    luces: e.luces ?? 0,
    intermitente: e.intermitente ?? 0,
    warning: !!e.warning,
    pisar: e.frenar ? "freno" : null,
  };
}

const CORTO: Record<string, string> = { general: "General", especificaciones: "Ficha", capo: "Capó", prueba: "Test" };

function VistaButton({ v, i, active, onPick, compact }: { v: (typeof VISTAS)[number]; i: number; active: boolean; onPick: (s: string) => void; compact?: boolean }) {
  const label = (
    <>
      {!compact && <span className="car-num">{String(i + 1).padStart(2, "0")}</span>}
      <span>{compact ? (CORTO[v.slug] ?? v.nombre) : v.nombre}</span>
      {!v.disponible && <span className="car-soon">Pronto</span>}
    </>
  );
  if (v.slug === "capo")
    return (
      <Link href="/bajo-el-capo" className={compact ? "car-tab" : "car-vista"}>
        {label}
      </Link>
    );
  return (
    <button type="button" disabled={!v.disponible} aria-current={active ? "true" : undefined} onClick={() => onPick(v.slug)} className={compact ? "car-tab" : "car-vista"}>
      {label}
    </button>
  );
}

function Opt({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="car-chip">
      {children}
    </button>
  );
}

function FichaCard() {
  return (
    <>
      <p className="car-eyebrow">Especificaciones</p>
      <h2 className="mt-1 text-[20px] font-bold leading-tight tracking-tight">Kia Rio de 5 puertas</h2>
      <dl className="mt-3 divide-y divide-white/10 text-[14px]">
        {FICHA.map((f) => (
          <div key={f.k} className="flex justify-between gap-4 py-1.5">
            <dt className="text-white/60">{f.k}</dt>
            <dd className="text-right font-semibold">{f.v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[13px] leading-snug text-white/70">{PERMISO_B}</p>
    </>
  );
}

function DetalleCard({ titulo, items, actual, onPick, children }: { titulo: string; items: Detalle[]; actual?: Detalle; onPick: (s: string) => void; children?: React.ReactNode }) {
  return (
    <>
      <p className="car-eyebrow">{titulo}</p>
      <div className="car-chips mt-2">
        {items.map((x) => (
          <Opt key={x.slug} on={actual?.slug === x.slug} onClick={() => onPick(x.slug)}>
            {x.nombre}
          </Opt>
        ))}
      </div>
      {actual ? (
        <div key={actual.slug} className="car-fade">
          <p className="mt-3 rounded-xl border border-[#f7ce3e55] bg-[#f7ce3e14] px-3 py-2 text-[14px] font-semibold leading-snug">{actual.clave}</p>
          <ul className="mt-2 space-y-1.5 text-[14px] leading-snug text-white/80">
            {actual.texto.map((x) => (
              <li key={x} className="flex gap-2">
                <span aria-hidden className="text-accent">•</span>
                {x}
              </li>
            ))}
          </ul>
          {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
        </div>
      ) : (
        <p className="mt-2 text-[14px] text-white/70">Elige un tema o pulsa los puntos amarillos del coche.</p>
      )}
    </>
  );
}

function QuizCard({
  quiz,
  onAnswer,
  onNext,
  onRestart,
  onSeeMando,
}: {
  quiz: { i: number; elegida: number | null; aciertos: number };
  onAnswer: (n: number) => void;
  onNext: () => void;
  onRestart: () => void;
  onSeeMando: (slug: string) => void;
}) {
  const p = PREGUNTAS[quiz.i];
  if (!p)
    return (
      <div className="car-fade" role="status">
        <p className="car-eyebrow">Resultado</p>
        <p className="mt-1 text-[28px] font-bold leading-none tracking-tight">
          {quiz.aciertos} de {PREGUNTAS.length}
        </p>
        <p className="mt-2 text-[14px] text-white/75">
          {quiz.aciertos === PREGUNTAS.length
            ? "¡Perfecto! Conoces el coche como si fuera tuyo."
            : quiz.aciertos >= 7
              ? "Muy bien. Repasa en el interior los mandos que fallaste."
              : "Vuelve al interior, pulsa cada mando y repite el test."}
        </p>
        <button type="button" className="btn btn-accent btn-sm mt-3" onClick={onRestart}>
          Repetir el test
        </button>
      </div>
    );
  const done = quiz.elegida !== null;
  const ok = quiz.elegida === p.ok;
  return (
    <div key={quiz.i} className="car-fade">
      <div className="flex items-center justify-between">
        <p className="car-eyebrow">Ponte a prueba</p>
        <p className="text-[12px] font-semibold tabular-nums text-white/60">
          {quiz.i + 1} / {PREGUNTAS.length}
        </p>
      </div>
      <h2 className="mt-1.5 text-[17px] font-bold leading-snug">{p.q}</h2>
      <div className="mt-3 grid gap-2">
        {p.opciones.map((o, n) => (
          <button
            key={o}
            type="button"
            disabled={done}
            onClick={() => onAnswer(n)}
            className="car-answer"
            data-state={done ? (n === p.ok ? "ok" : n === quiz.elegida ? "mal" : "") : ""}
          >
            <span className="car-answer-key">{"ABC"[n]}</span>
            {o}
          </button>
        ))}
      </div>
      {done && (
        <div className="mt-3" role="status">
          <p className="text-[14px] leading-snug">
            <strong className={ok ? "text-[#3ddc84]" : "text-[#ff6b61]"}>{ok ? "¡Correcto! " : "No es esa. "}</strong>
            <span className="text-white/80">{p.porque}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-accent btn-sm" onClick={onNext}>
              {quiz.i + 1 < PREGUNTAS.length ? "Siguiente →" : "Ver resultado"}
            </button>
            {p.mando && (
              <button type="button" className="car-chip" onClick={() => onSeeMando(p.mando!)}>
                Abrir su ficha
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Esquema de marchas del pomo, con la marcha metida resaltada. */
function Esquema({ marcha }: { marcha: Marcha }) {
  const X = (col: number) => 50 - col * 34;
  const Y = (row: number) => 40 - row * 26;
  return (
    <svg viewBox="0 0 100 80" width="120" height="96" aria-hidden className="mt-3">
      <path d="M16 14v52M50 14v52M84 14v52M16 40h68" stroke="rgb(255 255 255 / .35)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {(Object.entries(MARCHAS) as [Marcha, [number, number]][])
        .filter(([g]) => g !== "N")
        .map(([g, [c, r]]) => (
          <text key={g} x={X(c)} y={Y(r) + (r > 0 ? -4 : 12)} textAnchor="middle" fontSize="12" fontWeight="700" fill={g === marcha ? "#f7ce3e" : "#fff"}>
            {g}
          </text>
        ))}
      <circle cx={X(MARCHAS[marcha][0])} cy={Y(MARCHAS[marcha][1]) + (marcha === "N" ? 0 : MARCHAS[marcha][1] > 0 ? 2 : -2)} r="6" fill="#f7ce3e" />
    </svg>
  );
}

/** Ficha de un mando con su explicación y botones para probarlo sobre el coche. */
function MandoFicha({ m, cabin, setCabin, onClose }: { m: Mando; cabin: CabinState; setCabin: (f: (c: CabinState) => CabinState) => void; onClose: () => void }) {
  const set = (patch: Partial<CabinState>) => {
    click(1.3, 0.18);
    setCabin((c) => ({ ...c, ...patch }));
  };
  const marcha = (g: Marcha) => {
    // se pisa el embrague mientras entra la marcha
    set({ marcha: g, pisar: "embrague" });
    window.setTimeout(() => setCabin((c) => (c.pisar === "embrague" ? { ...c, pisar: null } : c)), 700);
  };
  const controls: React.ReactNode = (() => {
    switch (m.slug) {
      case "luces":
        return (["Apagadas", "Posición", "Cruce", "Carretera"] as const).map((t, i) => (
          <Opt key={t} on={cabin.luces === i} onClick={() => set({ luces: i as CabinState["luces"] })}>
            {t}
          </Opt>
        ));
      case "intermitentes":
        return (
          <>
            <Opt on={cabin.intermitente === -1} onClick={() => set({ intermitente: cabin.intermitente === -1 ? 0 : -1 })}>
              ← Izquierda
            </Opt>
            <Opt on={cabin.intermitente === 1} onClick={() => set({ intermitente: cabin.intermitente === 1 ? 0 : 1 })}>
              Derecha →
            </Opt>
          </>
        );
      case "limpiaparabrisas":
        return (
          <>
            {(["Parado", "Intermitente", "Lento", "Rápido"] as const).map((t, i) => (
              <Opt key={t} on={cabin.limpia === i} onClick={() => set({ limpia: i as CabinState["limpia"] })}>
                {t}
              </Opt>
            ))}
            <Opt on={false} onClick={() => set({ lavar: performance.now() })}>
              Echar agua
            </Opt>
          </>
        );
      case "claxon":
        return (
          <Opt
            on={false}
            onClick={() => {
              horn();
              setCabin((c) => ({ ...c, claxon: performance.now() }));
            }}
          >
            Tocar el claxon
          </Opt>
        );
      case "warning":
        return (
          <Opt on={cabin.warning} onClick={() => set({ warning: !cabin.warning })}>
            {cabin.warning ? "Apagar emergencia" : "Encender emergencia"}
          </Opt>
        );
      case "climatizador":
        return (
          <>
            {(
              [
                [-1, "Frío"],
                [0, "Templado"],
                [1, "Calor"],
              ] as const
            ).map(([v, t]) => (
              <Opt key={t} on={cabin.temp === v} onClick={() => set({ temp: v })}>
                {t}
              </Opt>
            ))}
            <Opt on={cabin.ac} onClick={() => set({ ac: !cabin.ac })}>
              A/C
            </Opt>
            <Opt on={cabin.recirc} onClick={() => set({ recirc: !cabin.recirc })}>
              Recirculación
            </Opt>
          </>
        );
      case "desempanador":
        return (
          <>
            <Opt on={cabin.parabrisas} onClick={() => set(cabin.parabrisas ? { parabrisas: false } : { parabrisas: true, ac: true, recirc: false, empanado: false })}>
              Desempañar parabrisas
            </Opt>
            <Opt on={cabin.luneta} onClick={() => set({ luneta: !cabin.luneta })}>
              Luneta trasera
            </Opt>
            <Opt on={false} onClick={() => set({ empanado: true, parabrisas: false })}>
              Volver a empañar
            </Opt>
          </>
        );
      case "cambios":
        return (["N", "1", "2", "3", "4", "5", "R"] as const).map((g) => (
          <Opt key={g} on={cabin.marcha === g} onClick={() => marcha(g)}>
            {g === "N" ? "Punto muerto" : g === "R" ? "Marcha atrás" : `${g}ª`}
          </Opt>
        ));
      case "pedales":
        return (
          [
            ["embrague", "Embrague"],
            ["freno", "Freno"],
            ["acelerador", "Acelerador"],
            ["profesor", "Doble pedal (profesor)"],
          ] as const
        ).map(([k, t]) => (
          <Opt key={k} on={cabin.pisar === k} onClick={() => set({ pisar: cabin.pisar === k ? null : k })}>
            {t}
          </Opt>
        ));
      case "freno-mano":
        return (
          <Opt on={cabin.frenoMano} onClick={() => set({ frenoMano: !cabin.frenoMano })}>
            {cabin.frenoMano ? "Quitar el freno de mano" : "Poner el freno de mano"}
          </Opt>
        );
      case "testigos":
        return (
          <Opt on={false} onClick={() => set({ prueba: performance.now() })}>
            Encenderlos todos (como al arrancar)
          </Opt>
        );
      case "cinturon":
        return (
          <Opt on={cabin.cinturon} onClick={() => set({ cinturon: !cabin.cinturon })}>
            {cabin.cinturon ? "Desabrochar" : "Abrocharse"}
          </Opt>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="px-5 pb-6 pt-2 lg:pt-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="car-eyebrow">Mando</p>
          <h2 className="mt-1 text-[22px] font-bold leading-tight tracking-tight">{m.nombre}</h2>
        </div>
        <button type="button" onClick={onClose} className="capo-icon hidden lg:grid" aria-label="Cerrar la ficha">
          ✕
        </button>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-white/80">{m.queEs}</p>

      {controls && (
        <>
          <p className="car-eyebrow mt-5">Pruébalo</p>
          <div className="mt-2 flex flex-wrap gap-2">{controls}</div>
        </>
      )}
      {m.slug === "cambios" && <Esquema marcha={cabin.marcha} />}
      {m.slug === "testigos" && (
        <ul className="mt-4 space-y-1.5 text-[14px]">
          {(
            [
              ["#ff3b30", "Rojo", "para en cuanto sea seguro"],
              ["#ffb020", "Ámbar", "revísalo pronto"],
              ["#3ddc84", "Verde o azul", "solo informa"],
            ] as const
          ).map(([c, t, d]) => (
            <li key={t} className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full" style={{ background: c }} />
              <strong>{t}:</strong>
              <span className="text-white/75">{d}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="car-eyebrow mt-5">Cómo se usa</p>
      <ul className="mt-2 space-y-2 text-[15px] leading-snug text-white/80">
        {m.comoSeUsa.map((x) => (
          <li key={x} className="flex gap-2">
            <span aria-hidden className="text-accent">•</span>
            {x}
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-xl border border-[#f7ce3e55] bg-[#f7ce3e14] px-3 py-2.5 text-[14px] leading-snug">
        <strong className="text-accent">Consejo · </strong>
        <span className="text-white/85">{m.consejo}</span>
      </div>
    </div>
  );
}
