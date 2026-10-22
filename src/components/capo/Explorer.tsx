"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Component,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PIEZAS, SISTEMAS, getPieza, type Pieza } from "@/content/capo";
import { Ficha } from "./Ficha";
import { Minimap } from "./Minimap";
import { Testigos } from "./Testigos";

const Viewer = dynamic(() => import("./Viewer"), {
  ssr: false,
  loading: () => <ViewerMessage>Cargando el modelo 3D…</ViewerMessage>,
});

// ---- preferencias del navegador (sin parpadeo de hidratación) ----
const subscribeReduced = (cb: () => void) => {
  const m = matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReduced,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

const subscribeDesktop = (cb: () => void) => {
  const m = matchMedia("(min-width: 1024px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useDesktop = () =>
  useSyncExternalStore(
    subscribeDesktop,
    () => matchMedia("(min-width: 1024px)").matches,
    () => true,
  );

let webglCache: boolean | undefined;
function hasWebGL() {
  if (webglCache === undefined) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
const useWebGL = () =>
  useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => null,
  );

class Boundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ViewerMessage({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-full place-items-center px-6 text-center text-[15px] text-white/70">
      {children}
    </div>
  );
}

function StaticFallback({ pieza, note = true }: { pieza: Pieza; note?: boolean }) {
  return (
    <div className="relative h-full">
      <Image
        src={`/img/capo/${pieza.slug}.webp`}
        alt={`Ilustración de: ${pieza.nombre}`}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-contain p-[14%]"
      />
      {note && (
        <p className="absolute inset-x-0 bottom-3 text-center text-[13px] text-white/60">
          Tu navegador no muestra 3D: aquí tienes una imagen fija.
        </p>
      )}
    </div>
  );
}

const Toggle = ({
  on,
  onClick,
  children,
  label,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  label?: string;
}) => (
  <button
    type="button"
    aria-pressed={on}
    aria-label={label}
    onClick={onClick}
    className="capo-btn"
  >
    {children}
  </button>
);

export function Explorer({ initialSlug }: { initialSlug: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const pieza = getPieza(slug);
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  // el 3D arranca cuando el navegador queda libre; mientras, se ve la imagen fija de la pieza
  const [ready3d, setReady3d] = useState(false);
  useEffect(() => {
    if (!webgl) return;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => setReady3d(true), { timeout: 1500 });
    return () => cancel(id);
  }, [webgl]);

  const [explode, setExplode] = useState(0);
  // etiquetas: activadas en escritorio y desactivadas en el móvil (se amontonan), salvo que el alumno elija
  const desktop = useDesktop();
  const [labelsPref, setLabelsPref] = useState<boolean | null>(null);
  const labels = labelsPref ?? desktop;
  const setLabels = (f: (v: boolean) => boolean) => setLabelsPref(f(labels));
  const [xray, setXray] = useState(false);
  const [cut, setCut] = useState(false);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [sheet, setSheet] = useState(false);
  // vista general: pieza pulsada (en el 3D o desde un testigo)
  const [focus, setFocus] = useState<string | null>(null);
  const isMotor = pieza.slug === "motor";
  const fichaPieza = isMotor && focus ? getPieza(focus) : pieza;

  const steps = pieza.animacion ?? [];

  const choose = (s: string) => {
    setSlug(s);
    setStep(-1);
    setPlaying(false);
    setHidden({});
    setFocus(null);
    window.history.replaceState(null, "", `?pieza=${s}`);
  };

  const startAnim = () => {
    setExplode(0);
    setHidden({});
    setStep(0);
    setPlaying(!reduced);
  };

  // el visor avisa cuando termina un paso; si está en reproducción, pasa al siguiente tras una pausa
  const [ended, setEnded] = useState(-1);
  const handleStepEnd = useCallback(() => setEnded(step), [step]);
  useEffect(() => {
    if (!playing || ended !== step || step < 0) return;
    const id = setTimeout(() => {
      if (step < steps.length - 1) setStep(step + 1);
      else setPlaying(false);
    }, 900);
    return () => clearTimeout(id);
  }, [ended, step, playing, steps.length]);

  // Escape cierra la hoja de la ficha en el móvil
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const view = {
    explode,
    labels: labels && step < 0,
    xray,
    cut,
    hidden,
    reduced,
  };

  return (
    <div className="capo grid grid-cols-[minmax(0,1fr)] lg:h-[calc(100svh-64px)] lg:min-h-[640px] lg:grid-cols-[250px_minmax(0,1fr)_380px]">
      {/* ---- lista de piezas ---- */}
      <nav
        aria-label="Piezas"
        className="capo-list min-w-0 border-line lg:overflow-y-auto lg:border-r"
      >
        <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:block lg:space-y-5 lg:px-4 lg:py-5">
          {SISTEMAS.map((sis) => (
            <div key={sis} className="contents lg:block">
              <p className="eyebrow hidden lg:mb-2 lg:block">{sis}</p>
              <ul className="contents lg:block lg:space-y-1">
                {PIEZAS.filter((p) => p.sistema === sis).map((p) => (
                  <li key={p.slug} className="shrink-0">
                    <button
                      type="button"
                      disabled={!p.disponible}
                      aria-current={p.slug === pieza.slug ? "true" : undefined}
                      onClick={() => choose(p.slug)}
                      className="capo-item"
                    >
                      <span>{p.corto}</span>
                      {!p.disponible && (
                        <span className="capo-soon">Pronto</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* ---- visor ---- */}
      <section aria-label="Visor 3D" className="flex min-w-0 flex-col">
        <div className="capo-stage relative h-[max(300px,calc(100svh-var(--dock-h)-312px))] lg:h-auto lg:flex-1">
          {webgl === false ? (
            <StaticFallback pieza={pieza} />
          ) : webgl === null || !ready3d ? (
            <StaticFallback pieza={pieza} note={false} />
          ) : (
            <Boundary fallback={<StaticFallback pieza={pieza} />}>
              <Viewer
                slug={pieza.slug}
                view={view}
                step={step}
                onStepEnd={handleStepEnd}
                focus={isMotor ? focus : null}
                onPick={setFocus}
              />
            </Boundary>
          )}

          {/* capas (escritorio) */}
          {webgl && pieza.capas && step < 0 && (
            <div className="capo-panel absolute left-4 top-4 hidden w-[200px] p-3 lg:block">
              <p className="capo-panel-title">Capas</p>
              <ul className="mt-2 space-y-1">
                {pieza.capas.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-pressed={!hidden[c.id]}
                      onClick={() =>
                        setHidden((h) => ({ ...h, [c.id]: !h[c.id] }))
                      }
                      className="capo-layer"
                    >
                      <span className="capo-dot" />
                      {c.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* testigos (vista general, escritorio) */}
          {webgl && isMotor && (
            <Testigos
              active={focus}
              onPick={setFocus}
              className="capo-panel absolute left-4 top-4 hidden w-[230px] p-3 lg:block"
            />
          )}

          {fichaPieza.mapa && (
            <Minimap {...fichaPieza.mapa} reduced={reduced} />
          )}

          {/* reproductor de la animación */}
          {step >= 0 && steps[step] && (
            <div
              className="capo-panel absolute inset-x-3 bottom-3 p-4 lg:inset-x-auto lg:bottom-[92px] lg:left-4 lg:w-[320px]"
              aria-live="polite"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="capo-panel-title">
                  Paso {step + 1} de {steps.length}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(-1);
                    setPlaying(false);
                  }}
                  className="capo-icon"
                  aria-label="Cerrar la animación"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 font-semibold text-white">
                {steps[step].titulo}
              </p>
              <p className="mt-1 text-[14px] leading-snug text-white/70">
                {steps[step].texto}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="capo-btn"
                  disabled={step === 0}
                  onClick={() => {
                    setPlaying(false);
                    setStep(step - 1);
                  }}
                  aria-label="Paso anterior"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="capo-btn flex-1"
                  aria-pressed={playing}
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? "Pausa" : "Reproducir"}
                </button>
                <button
                  type="button"
                  className="capo-btn"
                  disabled={step === steps.length - 1}
                  onClick={() => {
                    setPlaying(false);
                    setStep(step + 1);
                  }}
                  aria-label="Paso siguiente"
                >
                  →
                </button>
              </div>
            </div>
          )}

          {/* controles (flotan sobre el visor en escritorio) */}
          <div
            className={`capo-panel absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-3 px-4 py-3 ${webgl ? "lg:flex" : ""}`}
          >
            <Controls
              {...{
                explode,
                setExplode,
                labels,
                setLabels,
                xray,
                setXray,
                cut,
                setCut,
                hasAnim: steps.length > 0,
                hasExplode: !isMotor,
                startAnim,
                animOn: step >= 0,
              }}
            />
          </div>
        </div>

        {/* controles y capas en el móvil */}
        <div className="capo-mobilebar lg:hidden" hidden={!webgl}>
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-3">
            <Controls
              {...{
                explode,
                setExplode,
                labels,
                setLabels,
                xray,
                setXray,
                cut,
                setCut,
                hasAnim: steps.length > 0,
                hasExplode: !isMotor,
                startAnim,
                animOn: step >= 0,
              }}
            />
          </div>
          {isMotor && (
            <Testigos active={focus} onPick={setFocus} className="px-4 pb-3" />
          )}
          {pieza.capas && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-3">
              {pieza.capas.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={!hidden[c.id]}
                  onClick={() => setHidden((h) => ({ ...h, [c.id]: !h[c.id] }))}
                  className="capo-layer !w-auto shrink-0"
                >
                  <span className="capo-dot" />
                  {c.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---- ficha: columna en escritorio, hoja que sube en el móvil ---- */}
      {sheet && (
        <div
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          onClick={() => setSheet(false)}
          aria-hidden
        />
      )}
      <aside
        id="capo-ficha"
        aria-label={`Ficha: ${fichaPieza.nombre}`}
        className={`capo-sheet ${sheet ? "is-open" : ""}`}
      >
        <button
          type="button"
          className="capo-grab lg:hidden"
          onClick={() => setSheet((s) => !s)}
          aria-expanded={sheet}
          aria-controls="capo-ficha"
        >
          <span className="capo-grab-bar" />
          <span className="flex w-full items-center justify-between gap-3">
            <span className="min-w-0 truncate text-left font-semibold">
              {fichaPieza.nombre}
            </span>
            <span className="shrink-0 text-[14px] font-semibold text-accent-text">
              {sheet ? "Cerrar" : "Ver ficha"}
            </span>
          </span>
        </button>
        <Ficha
          pieza={fichaPieza}
          onAnimate={
            webgl && steps.length && fichaPieza === pieza
              ? () => {
                  startAnim();
                  setSheet(false);
                }
              : undefined
          }
          onDetail={
            fichaPieza !== pieza
              ? () => {
                  choose(fichaPieza.slug);
                  setSheet(false);
                }
              : undefined
          }
        />
      </aside>
    </div>
  );
}

function Controls({
  explode,
  setExplode,
  hasExplode,
  labels,
  setLabels,
  xray,
  setXray,
  cut,
  setCut,
  hasAnim,
  startAnim,
  animOn,
}: {
  explode: number;
  setExplode: (v: number) => void;
  hasExplode: boolean;
  labels: boolean;
  setLabels: (f: (v: boolean) => boolean) => void;
  xray: boolean;
  setXray: (f: (v: boolean) => boolean) => void;
  cut: boolean;
  setCut: (f: (v: boolean) => boolean) => void;
  hasAnim: boolean;
  startAnim: () => void;
  animOn: boolean;
}) {
  return (
    <>
      {hasExplode && (
        <label className="flex shrink-0 items-center gap-2 text-[13px] font-semibold text-white/80">
          Explode
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={explode}
            onChange={(e) => setExplode(Number(e.target.value))}
            className="capo-range w-24 lg:w-32"
            aria-label="Separar las piezas"
          />
        </label>
      )}
      <Toggle on={labels} onClick={() => setLabels((v) => !v)}>
        Etiquetas
      </Toggle>
      <Toggle on={xray} onClick={() => setXray((v) => !v)}>
        Rayos X
      </Toggle>
      <Toggle on={cut} onClick={() => setCut((v) => !v)}>
        Corte
      </Toggle>
      {hasAnim && (
        <button
          type="button"
          className="capo-btn capo-btn-accent"
          onClick={startAnim}
          aria-pressed={animOn}
        >
          ▶ Animación
        </button>
      )}
    </>
  );
}
