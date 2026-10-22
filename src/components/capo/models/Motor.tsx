"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useContext, useMemo, useRef, useState, type ComponentType } from "react";
import * as THREE from "three";
import { Label, LabelCtx } from "../labels";
import { COLORS, ViewCtx, useView, type Cam, type ModelProps } from "../scene";
import { Aceite } from "./Aceite";
import { Frenos, Limpiaparabrisas, Refrigerante } from "./Depositos";
import { Bateria, Correa, FiltroAire, Radiador } from "./Mecanica";

/** Dónde va cada pieza en el compartimento (el morro del coche mira hacia +z). */
const SPOTS: { slug: string; name: string; Model: ComponentType<ModelProps>; pos: [number, number, number]; rotY?: number; scale: number; size: [number, number, number] }[] = [
  { slug: "aceite", name: "Aceite", Model: Aceite, pos: [0, 0, -0.4], scale: 0.85, size: [2.9, 2.9, 2] },
  { slug: "radiador", name: "Radiador", Model: Radiador, pos: [0, -0.2, 2.6], scale: 0.85, size: [3.2, 2, 1.4] },
  { slug: "refrigerante", name: "Refrigerante", Model: Refrigerante, pos: [2.9, 0.3, 0.7], scale: 0.6, size: [1, 1.1, 0.7] },
  { slug: "limpiaparabrisas", name: "Limpiaparabrisas", Model: Limpiaparabrisas, pos: [3.2, -0.3, 2.4], scale: 0.5, size: [1, 1.4, 0.6] },
  { slug: "bateria", name: "Batería", Model: Bateria, pos: [2.8, -0.2, -1.6], scale: 0.6, size: [1.3, 1, 0.8] },
  { slug: "frenos", name: "Líquido de frenos", Model: Frenos, pos: [-2.7, 0, -2.5], rotY: Math.PI, scale: 0.6, size: [1.1, 1.3, 1.2] },
  { slug: "filtro-aire", name: "Filtro de aire", Model: FiltroAire, pos: [-2.8, 0.1, 0.7], rotY: Math.PI / 2, scale: 0.55, size: [0.9, 0.7, 1.4] },
  { slug: "correa", name: "Correa", Model: Correa, pos: [-1.75, 0, -0.4], rotY: -Math.PI / 2, scale: 0.6, size: [0.6, 1.8, 1.9] },
];

export const SPOT_POS = Object.fromEntries(SPOTS.map((s) => [s.slug, s.pos])) as Record<string, [number, number, number]>;

export const MOTOR_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [8.5, 9, 11], target: [0, 0.4, 0] },
  steps: [],
};

/** Encuadre para acercarse a una pieza de la vista general. */
export function focusCam(slug: string): Cam {
  const [x, y, z] = SPOT_POS[slug] ?? [0, 0, 0];
  const t: [number, number, number] = [x, y + 0.6, z];
  return { pos: [t[0] + 3.4, t[1] + 3.6, t[2] + 4.4], target: t };
}

function Bay() {
  const mat = <meshStandardMaterial color="#1a1d24" roughness={0.85} />;
  return (
    <group>
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[8.2, 0.08, 7.2]} />
        {mat}
      </mesh>
      {[-4.1, 4.1].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.3, 1.8, 7.2]} />
          {mat}
        </mesh>
      ))}
      {/* salpicadero/cortafuegos al fondo y travesaño delantero */}
      <mesh position={[0, 0.4, -3.6]}>
        <boxGeometry args={[8.2, 2.2, 0.18]} />
        {mat}
      </mesh>
      <mesh position={[0, -0.3, 3.6]}>
        <boxGeometry args={[8.2, 0.5, 0.25]} />
        <meshStandardMaterial color={COLORS.yellow} roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Marco amarillo que late alrededor de la pieza resaltada. */
function Halo({ size }: { size: [number, number, number] }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size]);
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const { reduced } = useView();
  const invalidate = useThree((s) => s.invalidate);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    mat.current.opacity = reduced ? 1 : 0.55 + 0.45 * Math.sin(clock.elapsedTime * 4);
    if (!reduced) invalidate();
  });
  return (
    <lineSegments geometry={geo} position={[0, size[1] / 2, 0]}>
      <lineBasicMaterial ref={mat} color={COLORS.yellow} transparent />
    </lineSegments>
  );
}

export function Motor({ focus, onPick }: ModelProps & { focus?: string | null; onPick?: (slug: string) => void }) {
  const view = useView();
  const store = useContext(LabelCtx);
  const [hover, setHover] = useState<string | null>(null);
  // dentro de la vista general las piezas no se separan ni llevan sus propias etiquetas
  const mini = useMemo(() => ({ ...view, explode: 0, hidden: {} }), [view]);

  const click = (slug: string) => (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return; // era un arrastre para girar, no un clic
    e.stopPropagation();
    onPick?.(slug);
  };

  return (
    <group>
      <Bay />
      {SPOTS.map((s) => (
        <group
          key={s.slug}
          position={s.pos}
          rotation={[0, s.rotY ?? 0, 0]}
          onClick={click(s.slug)}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(s.slug);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(null);
            document.body.style.cursor = "";
          }}
        >
          <group scale={s.scale}>
            <LabelCtx.Provider value={null}>
              <ViewCtx.Provider value={mini}>
                <s.Model step={-1} onStepEnd={() => {}} />
              </ViewCtx.Provider>
            </LabelCtx.Provider>
          </group>
          {(focus === s.slug || hover === s.slug) && <Halo size={s.size} />}
          {store && view.labels && <Label id={`spot-${s.slug}`} text={s.name} position={[0, s.size[1] + 0.25, 0]} />}
        </group>
      ))}
    </group>
  );
}
