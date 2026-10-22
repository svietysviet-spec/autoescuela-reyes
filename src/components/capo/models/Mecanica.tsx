"use client";

import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Label } from "../labels";
import { COLORS, Part, ShellMaterial, ease, seg, useSteps, type Cam, type ModelProps } from "../scene";

function Hose({ points, radius = 0.1, color = COLORS.rubber }: { points: [number, number, number][]; radius?: number; color?: string }) {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 32, radius, 12), [points, radius]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

/** Muchas piezas iguales (aletas, pliegues) en una sola llamada de dibujo. */
function Repeat({ count, size, at, color }: { count: number; size: [number, number, number]; at: (i: number) => [number, number, number]; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) ref.current?.setMatrixAt(i, m.makeTranslation(...at(i)));
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [count, at]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
    </instancedMesh>
  );
}

// ───────────── Radiador y electroventilador ─────────────

export const RADIADOR_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [-4.6, 3.6, 7.2], target: [0, 1.1, -0.2] },
  steps: [{ pos: [3.6, 2.4, -4.2], target: [0, 1.2, -0.4] }],
};
const finAt = (i: number): [number, number, number] => [-1.5 + i * (3 / 47), 1.2, 0];

export function Radiador({ step, onStepEnd }: ModelProps) {
  const fan = useRef<THREE.Group>(null);
  useSteps(
    step,
    [4],
    onStepEnd,
    (s, _p, t) => {
      if (fan.current) fan.current.rotation.z = s === 0 ? -t * 9 : 0;
    },
    (s) => s === 0,
  );
  return (
    <group>
      <Part id="nucleo" label="Núcleo: tubos y aletas" offset={[0, 0, 0]} anchor={[0.4, 2.35, 0.2]}>
        <mesh position={[0, 1.2, -0.02]}>
          <boxGeometry args={[3.1, 1.95, 0.08]} />
          <ShellMaterial color="#4b525d" metalness={0.6} roughness={0.5} />
        </mesh>
        <Repeat count={48} size={[0.018, 1.9, 0.22]} at={finAt} color="#aab2bc" />
      </Part>
      <Part id="depositos" label="Depósitos laterales" offset={[0.9, 0, 0]} anchor={[1.75, 2.35, 0]}>
        {[-1.72, 1.72].map((x) => (
          <RoundedBox key={x} args={[0.32, 2.15, 0.36]} radius={0.06} position={[x, 1.2, 0]}>
            <ShellMaterial color={COLORS.plastic} metalness={0.1} roughness={0.6} />
          </RoundedBox>
        ))}
      </Part>
      <Part id="ventilador" label="Electroventilador" offset={[0, 0, -1.4]} anchor={[0, 0.15, -0.45]}>
        <mesh position={[0, 1.2, -0.42]}>
          <torusGeometry args={[0.88, 0.07, 12, 48]} />
          <meshStandardMaterial color={COLORS.rubber} roughness={0.6} />
        </mesh>
        <group ref={fan} position={[0, 1.2, -0.45]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.22, 24]} />
            <meshStandardMaterial color={COLORS.metalDark} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} rotation={[0, 0.35, (i / 7) * Math.PI * 2]} position={[Math.cos((i / 7) * Math.PI * 2) * 0.45, Math.sin((i / 7) * Math.PI * 2) * 0.45, 0]}>
              <boxGeometry args={[0.62, 0.22, 0.02]} />
              <meshStandardMaterial color="#22262e" roughness={0.5} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 1.2, -0.66]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.3, 24]} />
          <meshStandardMaterial color={COLORS.metalDark} metalness={0.6} roughness={0.4} />
        </mesh>
      </Part>
      <Part id="manguitos" label="Manguitos al motor" offset={[0.6, 0.6, -0.8]} anchor={[2.2, 2.1, -0.9]}>
        <Hose points={[[1.72, 2.15, -0.1], [2.1, 2.3, -0.6], [2.3, 2.1, -1.3]]} />
        <Hose points={[[-1.72, 0.35, -0.1], [-2.1, 0.2, -0.6], [-2.3, 0.35, -1.3]]} />
      </Part>
    </group>
  );
}

// ───────────── Batería ─────────────

export const BATERIA_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [3.6, 3.6, 4.6], target: [0, 0.8, 0] },
  steps: [
    { pos: [-1.2, 2.6, 2.4], target: [-0.6, 1.3, 0.2] },
    { pos: [1.6, 2.6, 2.4], target: [0.6, 1.3, 0.2] },
    { pos: [1.6, 2.6, 2.4], target: [0.6, 1.3, 0.2] },
    { pos: [-1.2, 2.6, 2.4], target: [-0.6, 1.3, 0.2] },
  ],
};

export function Bateria({ step, onStepEnd }: ModelProps) {
  const neg = useRef<THREE.Group>(null);
  const pos = useRef<THREE.Group>(null);
  useSteps(step, [1.4, 1.4, 1.4, 1.4], onStepEnd, (s, p) => {
    const e = ease(seg(p, 0, 0.8));
    // cuánto está levantada cada pinza (1 = desconectada)
    const negOff = s === 0 ? e : s === 1 || s === 2 ? 1 : s === 3 ? 1 - e : 0;
    const posOff = s === 1 ? e : s === 2 ? 1 - e : 0;
    if (neg.current) neg.current.position.y = negOff * 0.55;
    if (pos.current) pos.current.position.y = posOff * 0.55;
  });
  return (
    <group>
      <Part id="caja" label="Batería" offset={[0, 0, 0]} anchor={[0, 0.5, 0.58]}>
        <RoundedBox args={[2, 1.15, 1.1]} radius={0.06} position={[0, 0.6, 0]}>
          <ShellMaterial color="#1c1f26" metalness={0.05} roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[2.02, 0.1, 1.12]} radius={0.03} position={[0, 1.2, 0]}>
          <ShellMaterial color="#2b2f38" metalness={0.05} roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0.75, 0.56]}>
          <boxGeometry args={[1.4, 0.18, 0.01]} />
          <meshStandardMaterial color={COLORS.yellow} />
        </mesh>
        {/* postes */}
        {[-0.65, 0.65].map((x) => (
          <mesh key={x} position={[x, 1.3, 0.25]}>
            <cylinderGeometry args={[0.09, 0.1, 0.14, 20]} />
            <meshStandardMaterial color="#b8a37a" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
      </Part>
      <Part id="positivo" label="Borne positivo (+)" offset={[0.6, 0.6, 0]} anchor={[0.65, 1.75, 0.25]}>
        <group ref={pos}>
          <mesh position={[0.65, 1.38, 0.25]}>
            <cylinderGeometry args={[0.17, 0.17, 0.2, 24]} />
            <meshStandardMaterial color={COLORS.red} roughness={0.5} />
          </mesh>
          <Hose points={[[0.65, 1.45, 0.25], [1.1, 1.75, 0.4], [1.7, 1.85, 0.6]]} radius={0.07} color="#b3262b" />
        </group>
        <Label id="signo-pos" text="+" kind="mark" position={[0.65, 1.5, 0.45]} />
      </Part>
      <Part id="negativo" label="Borne negativo (−)" offset={[-0.6, 0.6, 0]} anchor={[-0.65, 1.75, 0.25]}>
        <group ref={neg}>
          <mesh position={[-0.65, 1.38, 0.25]}>
            <cylinderGeometry args={[0.15, 0.15, 0.18, 24]} />
            <meshStandardMaterial color="#121418" roughness={0.5} />
          </mesh>
          <Hose points={[[-0.65, 1.45, 0.25], [-1.1, 1.7, 0.35], [-1.7, 1.75, 0.5]]} radius={0.07} color="#121418" />
        </group>
        <Label id="signo-neg" text="−" kind="mark" position={[-0.65, 1.5, 0.45]} />
      </Part>
      <Part id="anclaje" label="Anclaje" offset={[0, 0.9, -0.6]} anchor={[0, 1.38, -0.2]}>
        <mesh position={[0, 1.3, -0.2]}>
          <boxGeometry args={[0.12, 0.06, 1.3]} />
          <ShellMaterial color={COLORS.metal} />
        </mesh>
      </Part>
    </group>
  );
}

// ───────────── Filtro de aire ─────────────

export const FILTRO_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [4.2, 4, 5], target: [-0.2, 0.6, 0] },
  steps: [
    { pos: [2.8, 3.4, 3.4], target: [0, 1.1, 0] },
    { pos: [2.8, 3.8, 3.6], target: [0, 1.5, 0] },
  ],
};
const pleatAt = (i: number): [number, number, number] => [-0.92 + i * (1.84 / 21), 0.9, 0];

export function FiltroAire({ step, onStepEnd }: ModelProps) {
  const lid = useRef<THREE.Group>(null);
  const filter = useRef<THREE.Group>(null);
  useSteps(step, [1.6, 1.6], onStepEnd, (s, p) => {
    const lidOpen = s === 0 ? ease(seg(p, 0, 0.9)) : s === 1 ? 1 : 0;
    const filterOut = s === 1 ? ease(seg(p, 0, 0.9)) : 0;
    if (lid.current) {
      lid.current.position.y = lidOpen * 0.9;
      lid.current.rotation.z = lidOpen * 0.35;
    }
    if (filter.current) filter.current.position.y = filterOut * 0.75;
  });
  return (
    <group>
      <Part id="caja" label="Caja del filtro" offset={[0, -0.5, 0]} anchor={[1.1, 0.35, 0.72]}>
        <RoundedBox args={[2.2, 0.7, 1.4]} radius={0.08} position={[0, 0.35, 0]}>
          <ShellMaterial color={COLORS.plastic} metalness={0.05} roughness={0.7} />
        </RoundedBox>
        {[-0.7, 0.7].map((x) =>
          [-0.72, 0.72].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.72, z]}>
              <boxGeometry args={[0.16, 0.18, 0.05]} />
              <meshStandardMaterial color={COLORS.steel} metalness={0.8} roughness={0.3} />
            </mesh>
          )),
        )}
      </Part>
      <Part id="filtro" label="Filtro" offset={[0, 0.9, 0]} anchor={[0.9, 1, 0.6]}>
        <group ref={filter}>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[1.92, 0.3, 1.16]} />
            <meshStandardMaterial color="#efe0b0" roughness={0.9} />
          </mesh>
          <Repeat count={22} size={[0.04, 0.06, 1.12]} at={pleatAt} color="#c9b47a" />
        </group>
      </Part>
      <Part id="tapa" label="Tapa" offset={[0, 1.8, 0]} anchor={[0, 1.15, 0.72]}>
        <group ref={lid} position={[0, 0, 0]}>
          <RoundedBox args={[2.2, 0.32, 1.4]} radius={0.08} position={[0, 0.9, 0]}>
            <ShellMaterial color="#353a44" metalness={0.05} roughness={0.6} />
          </RoundedBox>
        </group>
      </Part>
      <Part id="entrada" label="Entrada de aire" offset={[-1, 0, 0]} anchor={[-1.8, 0.75, 0]}>
        <mesh position={[-1.6, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.32, 1.1, 24]} />
          <ShellMaterial color={COLORS.plastic} metalness={0.05} roughness={0.7} />
        </mesh>
      </Part>
    </group>
  );
}

// ───────────── Correa de accesorios ─────────────

export const CORREA_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [2.6, 2.6, 6.4], target: [0, 1.2, 0] },
  steps: [{ pos: [1.2, 1.6, 3.6], target: [0, 1.2, 0] }],
};
const PULLEYS = [
  { id: "cig", x: 0, y: 0.6, r: 0.55, name: "Cigüeñal" },
  { id: "alt", x: -0.9, y: 2, r: 0.3, name: "Alternador" },
  { id: "bomba", x: 0.85, y: 1.6, r: 0.38, name: "Bomba de agua" },
];
const TENSOR = { x: 1.36, y: 0.95, r: 0.2 };

/** Recorrido de la correa: la envolvente exterior de todas las poleas (como una goma tensa alrededor). */
function beltPath() {
  const pts: [number, number][] = [];
  for (const c of [...PULLEYS, TENSOR]) {
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push([c.x + Math.cos(a) * (c.r + 0.04), c.y + Math.sin(a) * (c.r + 0.04)]);
    }
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  const upper: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)].map(([x, y]) => new THREE.Vector3(x, y, 0));
}

function beltTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 8;
  const g = c.getContext("2d")!;
  g.fillStyle = "#15171b";
  g.fillRect(0, 0, 64, 8);
  g.fillStyle = "#3a3f48";
  for (let x = 0; x < 64; x += 16) g.fillRect(x, 0, 6, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(30, 1);
  return t;
}

export function Correa({ step, onStepEnd }: ModelProps) {
  const pulleys = useRef<(THREE.Group | null)[]>([]);
  const belt = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(beltPath(), true, "centripetal");
    return new THREE.TubeGeometry(curve, 320, 0.05, 6, true);
  }, []);
  const tex = useMemo(() => (typeof document === "undefined" ? null : beltTexture()), []);
  const beltMat = useRef<THREE.MeshStandardMaterial>(null);
  useSteps(
    step,
    [4],
    onStepEnd,
    (s, _p, t) => {
      const spin = s === 0 ? t : 0;
      pulleys.current.forEach((g, i) => {
        if (g) g.rotation.z = (-spin * 3) / PULLEYS[i].r;
      });
      const map = beltMat.current?.map;
      if (map) map.offset.x = -spin * 1.2;
    },
    (s) => s === 0,
  );
  return (
    <group>
      <mesh position={[0.1, 1.2, -0.75]}>
        <boxGeometry args={[3, 2.9, 0.1]} />
        <ShellMaterial color={COLORS.metalDark} />
      </mesh>
      <Part id="correa" label="Correa de accesorios" offset={[0, 0, 0.9]} anchor={[-1.2, 1.3, 0.1]}>
        <mesh geometry={belt}>
          <meshStandardMaterial ref={beltMat} map={tex ?? undefined} color="#2a2d33" roughness={0.8} />
        </mesh>
      </Part>
      <Part id="poleas" label="Poleas" offset={[0, 0, 0.3]} anchor={[0, 0, 0.2]}>
        {PULLEYS.filter((p) => p.id !== "alt").map((p) => (
          <group key={p.id} ref={(g) => { pulleys.current[PULLEYS.indexOf(p)] = g; }} position={[p.x, p.y, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[p.r, p.r, 0.16, 40]} />
              <meshStandardMaterial color={COLORS.steel} metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.09]}>
              <boxGeometry args={[p.r * 1.4, 0.06, 0.02]} />
              <meshStandardMaterial color={COLORS.metalDark} />
            </mesh>
          </group>
        ))}
      </Part>
      <Part id="alternador" label="Alternador" offset={[-0.6, 0.4, 0.3]} anchor={[-0.9, 2.55, -0.3]}>
        <group ref={(g) => { pulleys.current[1] = g; }} position={[PULLEYS[1].x, PULLEYS[1].y, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.16, 32]} />
            <meshStandardMaterial color={COLORS.steel} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[0.42, 0.06, 0.02]} />
            <meshStandardMaterial color={COLORS.metalDark} />
          </mesh>
        </group>
        <mesh position={[-0.9, 2, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.6, 32]} />
          <ShellMaterial color="#8d939c" />
        </mesh>
      </Part>
      <Part id="tensor" label="Tensor" offset={[0.6, -0.3, 0.3]} anchor={[1.45, 0.95, 0.1]}>
        <mesh position={[TENSOR.x, TENSOR.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[TENSOR.r, TENSOR.r, 0.14, 28]} />
          <meshStandardMaterial color={COLORS.metal} metalness={0.7} roughness={0.35} />
        </mesh>
      </Part>
      {step === 0 && <Label id="giro" text="La correa mueve alternador y bomba" kind="mark" position={[-0.2, 2.7, 0]} />}
    </group>
  );
}
