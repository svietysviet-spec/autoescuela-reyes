import { TESTIGOS } from "@/content/capo";

type Id = (typeof TESTIGOS)[number]["id"];

/** Iconos simplificados de los testigos (en rojo, como en el cuadro). */
const ICON: Record<Id, React.ReactNode> = {
  aceite: (
    <path d="M3 13h9l5-4 4 1-3 3h-1l-2 4H6a3 3 0 0 1-3-3zm16.5 4.5a1.5 1.5 0 1 0 3 0c0-1-1.5-3-1.5-3s-1.5 2-1.5 3zM7 10V8h4v2" />
  ),
  temperatura: (
    <path d="M12 3a2 2 0 0 1 2 2v9.3a4 4 0 1 1-4 0V5a2 2 0 0 1 2-2zm0 8v6M14 7h3M14 10h3M3 20c2 0 2-1.5 4.5-1.5S10 20 12 20s2-1.5 4.5-1.5S19 20 21 20" />
  ),
  bateria: <path d="M3 8h18v11H3zM6 8V6h3v2M15 8V6h3v2M6.5 13.5h3M16.5 12v3M15 13.5h3" />,
  frenos: (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M4.5 6.5a9 9 0 0 0 0 11M19.5 6.5a9 9 0 0 1 0 11M12 8.5v4.5M12 15.4v.2" />
    </>
  ),
};

export function Testigos({ active, onPick, className = "" }: { active: string | null; onPick: (pieza: string) => void; className?: string }) {
  const sel = TESTIGOS.find((t) => t.pieza === active);
  return (
    <div className={className}>
      <p className="capo-panel-title">Testigos del salpicadero</p>
      <div className="mt-2 flex gap-2">
        {TESTIGOS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={active === t.pieza}
            aria-label={`Testigo: ${t.nombre}`}
            title={t.nombre}
            onClick={() => onPick(t.pieza)}
            className="capo-testigo"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ICON[t.id]}
            </svg>
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-[40px] text-[13px] leading-snug text-white/70" aria-live="polite">
        {sel ? sel.texto : "Pulsa un testigo para ver a qué pieza se refiere."}
      </p>
    </div>
  );
}
