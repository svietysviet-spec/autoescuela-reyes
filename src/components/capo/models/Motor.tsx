"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import * as THREE from "three";
import { Label, LabelCtx } from "../labels";
import { COLORS, ShellMaterial, ViewCtx, ease, lerp, seg, useView, type Cam, type ModelProps } from "../scene";
import { Aceite } from "./Aceite";
import { Frenos, Limpiaparabrisas, Refrigerante } from "./Depositos";
import { Bateria, Correa, FiltroAire, Radiador } from "./Mecanica";
import { CarFront, HOOD_OPEN, HOOD_REST, type HoodAnim } from "./Vano";

/** Metros por unidad de los modelos de cada pieza. */
const M = 0.17;

/**
 * Dónde va cada pieza dentro del vano, en metros (el morro mira a +z y el conductor va en +x).
 * `pos` es la base de la pieza; `size`, su caja aproximada en metros y en sus ejes (para el destello y la cámara).
 */
const SPOTS: { slug: string; name: string; Model: ComponentType<ModelProps>; pos: [number, number, number]; rotY?: number; scale: number; size: [number, number, number] }[] = [
  { slug: "aceite", name: "Aceite", Model: Aceite, pos: [0.02, 0.36, 1.22], scale: 0.85, size: [0.48, 0.5, 0.36] },
  { slug: "correa", name: "Correa", Model: Correa, pos: [-0.3, 0.42, 1.22], rotY: -Math.PI / 2, scale: 0.6, size: [0.31, 0.3, 0.09] },
  { slug: "radiador", name: "Radiador", Model: Radiador, pos: [0, 0.34, 1.6], scale: 0.85, size: [0.7, 0.34, 0.22] },
  { slug: "bateria", name: "Batería", Model: Bateria, pos: [0.43, 0.5, 1.26], scale: 0.6, size: [0.36, 0.2, 0.16] },
  { slug: "filtro-aire", name: "Filtro de aire", Model: FiltroAire, pos: [0.44, 0.58, 1.53], rotY: Math.PI / 2, scale: 0.68, size: [0.37, 0.12, 0.17] },
  { slug: "refrigerante", name: "Refrigerante", Model: Refrigerante, pos: [-0.41, 0.6, 1.04], scale: 0.6, size: [0.25, 0.19, 0.1] },
  { slug: "frenos", name: "Líquido de frenos", Model: Frenos, pos: [0.35, 0.68, 1.06], rotY: Math.PI, scale: 0.45, size: [0.18, 0.14, 0.15] },
  { slug: "limpiaparabrisas", name: "Limpiaparabrisas", Model: Limpiaparabrisas, pos: [-0.5, 0.42, 1.53], scale: 0.5, size: [0.22, 0.21, 0.08] },
];

const SPOT_BY = Object.fromEntries(SPOTS.map((s) => [s.slug, s]));

/**
 * Encuadres de la vista general: frontal 3/4 con el capó cerrado, el frontal visto desde el lado de la
 * varilla mientras el alumno la coloca y «mecánico asomado» con el capó abierto.
 */
export const MOTOR_CAM: { def: Cam; rod: Cam; open: Cam; steps: Cam[] } = {
  def: { pos: [2.05, 1.3, 3.75], target: [0, 0.66, 1.2] },
  rod: { pos: [-0.85, 1.9, 3.05], target: [-0.08, 0.85, 1.5] },
  open: { pos: [0.6, 2.25, 3.0], target: [0, 0.55, 1.26] },
  steps: [],
};

/** Encuadre para acercarse a una pieza del vano. */
export function focusCam(slug: string): Cam {
  const s = SPOT_BY[slug];
  if (!s) return MOTOR_CAM.open;
  const t: [number, number, number] = [s.pos[0], s.pos[1] + s.size[1] / 2, s.pos[2]];
  // desde arriba y algo por delante, como asomado sobre esa pieza
  return { pos: [t[0] * 0.6 + 0.15, t[1] + 1.15, t[2] + 0.7], target: t };
}

// ── línea de tiempo de la apertura (segundos); al cerrar se recorre al revés ──
// Tras subir el capó (open1) se detiene hasta que el alumno coloca la varilla.
const T = {
  pop: 0.18, // el cierre suelta el capó: sube un poco
  open0: 0.25,
  open1: 1.45, // sube hasta 73°
  rod1: 2.05, // la varilla sube hasta el taco
  rest: 2.3, // el capó baja 1,5° y se apoya
  cam: 3.3, // la cámara se asoma al vano
  stagger: 0.08,
  grow: 0.35,
};
const T_END = T.cam + T.stagger * (SPOTS.length - 1) + T.grow + 0.05;
const POP = THREE.MathUtils.degToRad(2);

function hoodAngle(t: number) {
  if (t < T.pop) return POP * ease(t / T.pop);
  if (t < T.open0) return POP;
  if (t < T.open1) return lerp(POP, HOOD_OPEN, ease(seg(t, T.open0, T.open1)));
  if (t < T.rod1) return HOOD_OPEN;
  return lerp(HOOD_OPEN, HOOD_REST, ease(seg(t, T.rod1, T.rest)));
}
const backOut = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

/** `varilla`: el capó está levantado y espera a que el alumno coloque la varilla. */
export type Fase = "cerrado" | "moviendo" | "varilla" | "abierto";
export type CamMode = "cerrado" | "varilla" | "abierto";

// las líneas de los marcos no reciben clics: su zona de impacto es enorme y taparía otras piezas
const noHit = () => null;

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
    <lineSegments geometry={geo} position={[0, size[1] / 2, 0]} raycast={noHit}>
      <lineBasicMaterial ref={mat} color={COLORS.yellow} transparent />
    </lineSegments>
  );
}

/** Destello amarillo con el que «se enciende» cada pieza al aparecer. */
function Flash({ size, mat }: { size: [number, number, number]; mat: (m: THREE.LineBasicMaterial | null) => void }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size]);
  return (
    <lineSegments geometry={geo} position={[0, size[1] / 2, 0]} raycast={noHit}>
      <lineBasicMaterial ref={mat} color={COLORS.yellow} transparent opacity={0} />
    </lineSegments>
  );
}

export function Motor({
  open,
  rod,
  lite,
  focus,
  onPick,
  onHoodClick,
  onRodClick,
  onFase,
  onCam,
}: ModelProps & {
  /** capó pedido: abierto o cerrado (la animación va hacia ese estado) */
  open: boolean;
  /** el alumno ha colocado la varilla (sin ella, el capó se queda levantado esperando) */
  rod: boolean;
  lite: boolean;
  focus?: string | null;
  onPick?: (slug: string) => void;
  onHoodClick: () => void;
  onRodClick: () => void;
  onFase: (f: Fase) => void;
  /** encuadre que toca en cada momento de la animación */
  onCam: (mode: CamMode) => void;
}) {
  const view = useView();
  const store = useContext(LabelCtx);
  const invalidate = useThree((s) => s.invalidate);
  const [hover, setHover] = useState<string | null>(null);

  const t = useRef(open ? T_END : 0);
  const anim = useRef<HoodAnim>({ angle: open ? HOOD_REST : 0, rod: open ? 1 : 0, wait: false });
  const spots = useRef<(THREE.Group | null)[]>([]);
  const flashes = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const last = useRef<{ fase: Fase | null; cam: CamMode | null }>({ fase: null, cam: null });
  const [shown, setShown] = useState(open); // las piezas solo se montan con el capó abierto
  const [done, setDone] = useState(open); // etiquetas, al terminar
  const [waiting, setWaiting] = useState(false); // aviso junto a la varilla

  useFrame((_, dt) => {
    const goal = !open ? 0 : rod ? T_END : T.open1;
    const before = t.current;
    if (view.reduced) t.current = goal;
    else if (t.current < goal) t.current = Math.min(goal, t.current + Math.min(dt, 0.05));
    else if (t.current > goal) t.current = Math.max(goal, t.current - Math.min(dt, 0.05) * 1.25);
    const now = t.current;
    if (now !== goal) invalidate();

    anim.current.angle = hoodAngle(now);
    anim.current.rod = ease(seg(now, T.open1, T.rod1));
    anim.current.wait = open && !rod && now >= T.open1;
    SPOTS.forEach((_, i) => {
      const k = seg(now, T.cam + i * T.stagger, T.cam + i * T.stagger + T.grow);
      const g = spots.current[i];
      if (g) {
        g.visible = k > 0;
        g.scale.setScalar(Math.max(0.001, backOut(k)));
      }
      const f = flashes.current[i];
      if (f) f.opacity = view.reduced ? 0 : Math.sin(Math.PI * k) * 0.9;
    });

    const need = now > T.cam - 0.05;
    if (need !== shown) setShown(need);
    const end = now >= T_END;
    if (end !== done) setDone(end);
    if (anim.current.wait !== waiting) setWaiting(anim.current.wait);
    const fase: Fase = now <= 0 ? "cerrado" : end ? "abierto" : anim.current.wait ? "varilla" : "moviendo";
    // mientras sube el capó y se coloca la varilla, la cámara mira la varilla; se asoma al vano tras apoyar
    // el capó y se retira cuando las piezas ya se han ido
    const over = now >= before ? now >= T.rest : now > T.cam;
    const cam: CamMode = over ? "abierto" : open && now >= T.open0 ? "varilla" : "cerrado";
    if (fase !== last.current.fase) onFase((last.current.fase = fase));
    if (cam !== last.current.cam) onCam((last.current.cam = cam));
  });

  // cajas visibles de cada pieza (en el mundo), medidas al terminar de aparecer: halo y etiqueta
  const [boxes, setBoxes] = useState<THREE.Box3[] | null>(null);
  useFrame(() => {
    if (!done || boxes) return;
    setBoxes(spots.current.map((g) => (g ? visibleBox(g.children[0]) : new THREE.Box3())));
  });
  // las etiquetas se montan después del último fotograma de la animación: un fotograma más para colocarlas
  useEffect(() => invalidate(), [done, boxes, waiting, view.labels, invalidate]);
  // dentro del vano las piezas no se separan ni llevan sus etiquetas de capa; cada una se corta por su centro
  const mini = useMemo(
    () =>
      SPOTS.map((s) => ({
        ...view,
        explode: 0,
        hidden: {},
        cutPlane: new THREE.Plane(new THREE.Vector3(0, 0, -1), s.pos[2]),
      })),
    [view],
  );

  const click = (slug: string) => (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return; // era un arrastre para girar, no un clic
    e.stopPropagation();
    onPick?.(slug);
  };

  return (
    <group>
      <CarFront lite={lite} anim={anim} onHoodClick={onHoodClick} onRodClick={onRodClick} />
      {waiting && store && <Label id="varilla" text="Pulsa la varilla" kind="mark" position={[0.02, 0.83, 1.66]} />}
      {shown && (
        <>
          {SPOTS.map((s, i) => (
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
              <group ref={(g) => void (spots.current[i] = g)} visible={false}>
                <group scale={s.scale * M}>
                  <LabelCtx.Provider value={null}>
                    <ViewCtx.Provider value={mini[i]}>
                      <s.Model step={-1} onStepEnd={() => {}} />
                    </ViewCtx.Provider>
                  </LabelCtx.Provider>
                </group>
                {i === 0 && <EngineCover view={mini[0]} />}
                <Flash size={s.size} mat={(m) => void (flashes.current[i] = m)} />
              </group>
            </group>
          ))}
          {done &&
            boxes?.map((b, i) => {
              const s = SPOTS[i];
              const c = b.getCenter(new THREE.Vector3());
              const size = b.getSize(new THREE.Vector3());
              return (
                <group key={s.slug} position={[c.x, b.min.y, c.z]}>
                  {(focus === s.slug || hover === s.slug) && <Halo size={[size.x + 0.02, size.y + 0.02, size.z + 0.02]} />}
                  {store && view.labels && <Label id={`spot-${s.slug}`} text={s.name} position={[0, size.y + 0.04, 0]} />}
                </group>
              );
            })}
        </>
      )}
    </group>
  );
}

/** Caja de las mallas visibles (las capas ocultas de cada modelo no cuentan). */
function visibleBox(root: THREE.Object3D) {
  const box = new THREE.Box3();
  root.updateWorldMatrix(true, true);
  root.traverseVisible((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.geometry) {
      m.geometry.computeBoundingBox();
      box.union(m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld));
    }
  });
  return box;
}

/** Tapa de plástico del motor: deja asomar el tapón y la varilla del aceite. */
function EngineCover({ view }: { view: React.ContextType<typeof ViewCtx> }) {
  return (
    <ViewCtx.Provider value={view}>
      <RoundedBox args={[0.36, 0.05, 0.2]} radius={0.02} position={[0, 0.44, -0.02]}>
        <ShellMaterial color="#33373f" roughness={0.7} metalness={0.05} />
      </RoundedBox>
    </ViewCtx.Provider>
  );
}
