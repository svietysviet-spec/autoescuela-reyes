/** Minimapa «Dónde está»: el coche visto desde arriba (morro a la izquierda) y un punto en la pieza. */
export function Minimap({ x, y, texto, reduced }: { x: number; y: number; texto: string; reduced: boolean }) {
  return (
    <div className="capo-panel absolute right-3 top-3 w-[118px] p-2 lg:right-4 lg:top-4 lg:w-[230px] lg:p-3">
      <p className="capo-panel-title">Dónde está</p>
      <svg viewBox="0 0 200 92" className="mt-2 w-full" aria-hidden>
        {/* carrocería */}
        <rect x="6" y="10" width="188" height="72" rx="30" fill="#1d2129" stroke="#3b414d" strokeWidth="2" />
        {/* capó, parabrisas, techo y luna trasera */}
        <path d="M44 16 L44 76" stroke="#3b414d" strokeWidth="1.5" />
        <path d="M70 18 Q80 46 70 74" stroke="#5b6170" strokeWidth="2" fill="none" />
        <rect x="80" y="20" width="62" height="52" rx="10" fill="#262b35" stroke="#3b414d" />
        <path d="M150 20 Q160 46 150 72" stroke="#5b6170" strokeWidth="2" fill="none" />
        {/* ruedas */}
        {[
          [38, 6],
          [38, 78],
          [150, 6],
          [150, 78],
        ].map(([cx, cy]) => (
          <rect key={`${cx}-${cy}`} x={cx - 12} y={cy} width="24" height="8" rx="3" fill="#0b0d12" />
        ))}
        {/* zona del capó */}
        <rect x="12" y="18" width="56" height="56" rx="18" fill="#f7ce3e14" stroke="#f7ce3e55" strokeDasharray="3 3" />
        <circle cx={x * 2} cy={y * 0.92} r="10" fill="#f7ce3e33">
          {!reduced && <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />}
        </circle>
        <circle cx={x * 2} cy={y * 0.92} r="4.5" fill="#f7ce3e" />
        <text x="12" y="90" fontSize="8" fill="#8e8e93">
          DELANTE
        </text>
        <text x="160" y="90" fontSize="8" fill="#8e8e93">
          DETRÁS
        </text>
      </svg>
      <p className="mt-1 hidden text-[12px] leading-snug text-white/60 lg:block">{texto}</p>
    </div>
  );
}
