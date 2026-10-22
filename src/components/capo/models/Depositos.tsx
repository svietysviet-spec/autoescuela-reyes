"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Label } from "../labels";
import { COLORS, LevelMarks, LiquidMaterial, Part, ShellMaterial, TankMaterial, ease, lerp, seg, useSteps, type Cam, type ModelProps } from "../scene";

/** Ajusta una caja de líquido de 1 de alto para que vaya de `bottom` a `top`. */
function setLevel(mesh: THREE.Mesh | null, bottom: number, top: number) {
  if (!mesh) return;
  const h = Math.max(0.001, top - bottom);
  mesh.scale.y = h;
  mesh.position.y = bottom + h / 2;
}

function Hose({ points, radius = 0.09, color = COLORS.rubber }: { points: [number, number, number][]; radius?: number; color?: string }) {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 32, radius, 12), [points, radius]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

// ───────────── Depósito del líquido refrigerante ─────────────

export const REFRIGERANTE_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [3.4, 2.7, 4.4], target: [0, 0.8, 0] },
  steps: [
    { pos: [2.2, 1.6, 3.4], target: [0, 0.75, 0] },
    { pos: [2.2, 1.6, 3.4], target: [0, 0.75, 0] },
    { pos: [1.4, 2.6, 2.4], target: [-0.35, 1.35, 0] },
  ],
};
const COOL = { bottom: 0.2, min: 0.45, max: 0.95, cold: 0.66, hot: 0.88 };
const HOSE_REF: [number, number, number][] = [[0.6, 0.3, 0], [1.1, 0.1, 0.1], [1.7, -0.15, 0.3]];

export function Refrigerante({ step, onStepEnd }: ModelProps) {
  const liquid = useRef<THREE.Mesh>(null);
  const capMat = useRef<THREE.MeshStandardMaterial>(null);
  useSteps(
    step,
    [1.6, 2.4, 2.4],
    onStepEnd,
    (s, p, t) => {
      const lvl = s === 1 ? lerp(COOL.cold, COOL.hot, ease(seg(p, 0, 0.9))) : s === 2 ? COOL.hot : COOL.cold;
      setLevel(liquid.current, COOL.bottom, lvl);
      if (capMat.current) capMat.current.emissiveIntensity = s === 2 ? 0.6 + 0.4 * Math.sin(t * 6) : 0;
    },
    (s) => s === 2,
  );
  return (
    <group>
      <Part id="deposito" label="Depósito de expansión" offset={[0, 0, -0.8]} anchor={[0.75, 1.1, 0.45]}>
        <RoundedBox args={[1.4, 1.1, 0.9]} radius={0.12} position={[0, 0.72, 0]}>
          <TankMaterial />
        </RoundedBox>
        <mesh position={[-0.35, 1.36, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.16, 24, 1, true]} />
          <TankMaterial />
        </mesh>
        <LevelMarks x={0.15} z={0.46} min={COOL.min} max={COOL.max} />
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.9, 0.08, 0.6]} />
          <ShellMaterial color={COLORS.metalDark} />
        </mesh>
      </Part>
      <Part id="liquido" label="Líquido refrigerante" offset={[0, 0, 0]} anchor={[-0.4, 0.45, 0.4]}>
        <mesh ref={liquid} renderOrder={2}>
          <boxGeometry args={[1.26, 1, 0.76]} />
          <LiquidMaterial color={COLORS.coolant} />
        </mesh>
      </Part>
      <Part id="tapon" label="Tapón (¡no abrir en caliente!)" offset={[0, 1.1, 0]} anchor={[-0.35, 1.75, 0]}>
        <mesh position={[-0.35, 1.52, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.18, 32]} />
          <meshStandardMaterial ref={capMat} color="#1f2128" emissive={COLORS.red} emissiveIntensity={0} roughness={0.5} />
        </mesh>
        {/* triángulo de aviso sobre el tapón */}
        <mesh position={[-0.35, 1.62, 0]} rotation={[0, Math.PI / 6, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 3]} />
          <meshStandardMaterial color={COLORS.yellow} />
        </mesh>
      </Part>
      <Part id="manguito" label="Manguito" offset={[1, -0.3, 0]} anchor={[1.3, 0, 0.25]}>
        <Hose points={HOSE_REF} />
      </Part>
      {step === 2 && <Label id="aviso-caliente" text="¡Caliente y a presión!" kind="mark" position={[-0.1, 1.95, 0]} />}
    </group>
  );
}

// ───────────── Depósito del líquido de frenos ─────────────

export const FRENOS_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [3.2, 2.8, 3.8], target: [0, 1.2, 0.2] },
  steps: [
    { pos: [1.8, 2.3, 2.6], target: [0, 1.5, 0.6] },
    { pos: [1.8, 2.3, 2.6], target: [0, 1.5, 0.6] },
  ],
};
const BRAKE = { bottom: 1.33, min: 1.42, max: 1.66, full: 1.63, low: 1.47 };

export function Frenos({ step, onStepEnd }: ModelProps) {
  const liquid = useRef<THREE.Mesh>(null);
  useSteps(step, [1.2, 3], onStepEnd, (s, p) => {
    const lvl = s === 1 ? lerp(BRAKE.full, BRAKE.low, ease(seg(p, 0, 0.9))) : BRAKE.full;
    setLevel(liquid.current, BRAKE.bottom, lvl);
  });
  return (
    <group>
      <Part id="bomba" label="Bomba de freno y servofreno" offset={[0, -0.6, -0.6]} anchor={[0.9, 0.7, -0.2]}>
        {/* servofreno (el «tambor» grande) */}
        <mesh position={[0, 1, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.55, 48]} />
          <ShellMaterial color={COLORS.metalDark} roughness={0.35} />
        </mesh>
        {/* bomba de freno */}
        <mesh position={[0, 1, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 1.2, 24]} />
          <ShellMaterial color={COLORS.metal} />
        </mesh>
        <Hose points={[[0.15, 0.95, 0.8], [0.6, 0.7, 1.1], [1.2, 0.5, 1.2]]} radius={0.03} color={COLORS.steel} />
        <Hose points={[[-0.15, 0.95, 0.7], [-0.6, 0.7, 1], [-1.2, 0.5, 1.1]]} radius={0.03} color={COLORS.steel} />
      </Part>
      <Part id="deposito" label="Depósito" offset={[0, 0.5, 0.3]} anchor={[-0.55, 1.75, 0.6]}>
        <RoundedBox args={[0.8, 0.46, 0.46]} radius={0.06} position={[0, 1.54, 0.6]}>
          <TankMaterial color="#fff6dc" />
        </RoundedBox>
        <LevelMarks x={0.12} z={0.84} min={BRAKE.min} max={BRAKE.max} width={0.22} />
      </Part>
      <Part id="liquido" label="Líquido de frenos" offset={[0, 0.5, 0.3]} anchor={[-0.3, 1.4, 0.85]}>
        <mesh ref={liquid} position={[0, 1.5, 0.6]} renderOrder={2}>
          <boxGeometry args={[0.7, 1, 0.36]} />
          <LiquidMaterial color={COLORS.brake} />
        </mesh>
      </Part>
      <Part id="tapon" label="Tapón" offset={[0, 1.1, 0.3]} anchor={[0, 2.05, 0.6]}>
        <mesh position={[0, 1.84, 0.6]}>
          <cylinderGeometry args={[0.17, 0.17, 0.12, 28]} />
          <meshStandardMaterial color="#17191d" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.905, 0.6]}>
          <cylinderGeometry args={[0.1, 0.1, 0.012, 28]} />
          <meshStandardMaterial color={COLORS.yellow} />
        </mesh>
      </Part>
    </group>
  );
}

// ───────────── Depósito del limpiaparabrisas ─────────────

export const LIMPIA_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [4.4, 3.6, 5.6], target: [0.2, 1.1, 0] },
  steps: [],
};

export function Limpiaparabrisas() {
  return (
    <group>
      <Part id="deposito" label="Depósito" offset={[0, 0, -0.9]} anchor={[0.85, 0.9, 0.42]}>
        <RoundedBox args={[1.6, 1.5, 0.8]} radius={0.14} position={[0, 0.8, 0]}>
          <TankMaterial color="#e9f3ff" />
        </RoundedBox>
        <mesh position={[0, 0.56, 0]} renderOrder={2}>
          <boxGeometry args={[1.46, 0.95, 0.66]} />
          <LiquidMaterial color={COLORS.washer} />
        </mesh>
        {/* cuello de llenado */}
        <mesh position={[-0.45, 1.95, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.9, 20, 1, true]} />
          <TankMaterial color="#e9f3ff" />
        </mesh>
      </Part>
      <Part id="tapon" label="Tapón azul" offset={[0, 1, 0]} anchor={[-0.45, 2.65, 0]}>
        <mesh position={[-0.45, 2.45, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.14, 28]} />
          <meshStandardMaterial color="#1e6fe0" roughness={0.45} />
        </mesh>
      </Part>
      <Part id="bomba" label="Bomba y tubo" offset={[0.9, -0.3, 0.4]} anchor={[1.1, 0.25, 0.4]}>
        <mesh position={[0.62, 0.25, 0.42]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.35, 16]} />
          <meshStandardMaterial color="#17191d" />
        </mesh>
        <Hose points={[[0.8, 0.25, 0.45], [1.3, 0.5, 0.3], [1.7, 1.2, -0.4]]} radius={0.03} color="#2a2e36" />
      </Part>
    </group>
  );
}
