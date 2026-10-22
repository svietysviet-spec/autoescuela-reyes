"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Label } from "./labels";

export type ViewState = {
  explode: number;
  labels: boolean;
  xray: boolean;
  cut: boolean;
  hidden: Record<string, boolean>;
  reduced: boolean;
};

export const ViewCtx = createContext<ViewState>({ explode: 0, labels: true, xray: false, cut: false, hidden: {}, reduced: false });
export const useView = () => useContext(ViewCtx);

/** Plano de corte: quita la mitad delantera (z > 0.3) de las carcasas. */
export const CUT_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.3);

export const COLORS = {
  metal: "#5b616d",
  metalDark: "#2c3038",
  rubber: "#17191d",
  yellow: "#f7ce3e",
  oil: "#d08a12",
  oilDark: "#8a5a0c",
  steel: "#c9ced6",
  cloth: "#eef0f3",
  plastic: "#2a2e36",
  coolant: "#ff5fa2",
  brake: "#e8c770",
  washer: "#3fa4ff",
  red: "#e5484d",
};

export type Cam = { pos: [number, number, number]; target: [number, number, number] };
export type ModelProps = { step: number; onStepEnd: () => void };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Animación por pasos: cada vez que cambia `step`, `p` va de 0 a 1 en `durations[step]` segundos
 * (al instante si se pide menos movimiento) y avisa al terminar. `loop` mantiene el repintado
 * mientras dure ese paso (por ejemplo, un ventilador que gira).
 */
export function useSteps(
  step: number,
  durations: number[],
  onStepEnd: () => void,
  apply: (step: number, p: number, t: number) => void,
  loop: (step: number) => boolean = () => false,
) {
  const { reduced } = useView();
  const invalidate = useThree((s) => s.invalidate);
  const anim = useRef({ step: -1, p: 1, ended: true });
  const endCb = useRef(onStepEnd);
  const applyRef = useRef(apply);
  useEffect(() => {
    endCb.current = onStepEnd;
    applyRef.current = apply;
  });
  useEffect(() => {
    anim.current = { step, p: reduced || step < 0 ? 1 : 0, ended: false };
    invalidate();
  }, [step, reduced, invalidate]);
  useFrame((state, dt) => {
    const a = anim.current;
    if (a.p < 1) {
      a.p = Math.min(1, a.p + Math.min(dt, 0.05) / (durations[a.step] ?? 1));
      invalidate();
    } else if (!a.ended) {
      a.ended = true;
      if (a.step >= 0) endCb.current();
    }
    if (!reduced && loop(a.step)) invalidate();
    applyRef.current(a.step, a.p, reduced ? 0 : state.clock.elapsedTime);
  });
}

/** Una capa de la pieza: se separa con el explode, se puede ocultar y lleva su etiqueta. */
export function Part({
  id,
  label,
  offset,
  anchor = [0, 0, 0],
  children,
}: {
  id: string;
  label: string;
  offset: [number, number, number];
  anchor?: [number, number, number];
  children: ReactNode;
}) {
  const { explode, hidden } = useView();
  if (hidden[id]) return null;
  return (
    <group position={[offset[0] * explode, offset[1] * explode, offset[2] * explode]}>
      {children}
      <Label id={id} text={label} position={anchor} />
    </group>
  );
}

/** Material de carcasa: se vuelve translúcido con rayos X y se corta con el plano de corte. */
export function ShellMaterial({ color, roughness = 0.5, metalness = 0.55 }: { color: string; roughness?: number; metalness?: number }) {
  const { xray, cut } = useView();
  return (
    <meshStandardMaterial
      key={`${xray}-${cut}`}
      color={color}
      roughness={roughness}
      metalness={metalness}
      transparent={xray}
      opacity={xray ? 0.14 : 1}
      depthWrite={!xray}
      side={cut ? THREE.DoubleSide : THREE.FrontSide}
      clippingPlanes={cut ? [CUT_PLANE] : []}
    />
  );
}

/** Plástico translúcido de los depósitos: siempre deja ver el líquido. */
export function TankMaterial({ color = "#f2f4f7" }: { color?: string }) {
  const { cut } = useView();
  return (
    <meshStandardMaterial
      key={`${cut}`}
      color={color}
      roughness={0.25}
      metalness={0}
      transparent
      opacity={0.28}
      depthWrite={false}
      side={THREE.DoubleSide}
      clippingPlanes={cut ? [CUT_PLANE] : []}
    />
  );
}

export function LiquidMaterial({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.15} transparent opacity={0.85} emissive={color} emissiveIntensity={0.18} />;
}

/** Marcas MIN y MAX en la cara frontal de un depósito (y = altura de cada marca). */
export function LevelMarks({ x, z, min, max, width = 0.3 }: { x: number; z: number; min: number; max: number; width?: number }) {
  return (
    <>
      {[min, max].map((y) => (
        <mesh key={y} position={[x, y, z]}>
          <boxGeometry args={[width, 0.025, 0.01]} />
          <meshStandardMaterial color={COLORS.rubber} />
        </mesh>
      ))}
      <Label id={`min-${x}-${z}`} text="MIN" kind="mark" position={[x + width / 2, min, z]} />
      <Label id={`max-${x}-${z}`} text="MAX" kind="mark" position={[x + width / 2, max, z]} />
    </>
  );
}