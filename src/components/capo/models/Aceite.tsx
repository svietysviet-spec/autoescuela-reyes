"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Label } from "../labels";
import { COLORS, Part, ShellMaterial, useView, type Cam } from "../scene";


/** Cámara por defecto y en cada paso de la animación «Cómo medir el aceite». */
export const ACEITE_CAM: { def: Cam; steps: Cam[] } = {
  def: { pos: [8.2, 6.4, 9.8], target: [0.2, 1.5, 0] },
  steps: [
    { pos: [8.2, 6.4, 9.8], target: [0.2, 1.5, 0] },
    { pos: [6.2, 8.2, 8.6], target: [0.8, 4.4, 0.6] },
    { pos: [7.6, 6.6, 9.4], target: [0.6, 3.2, 0.4] },
    { pos: [0.5, 4.9, 4.2], target: [0.6, 4.25, 1.6] },
    { pos: [-4.4, 6.8, 7.4], target: [-0.9, 3.4, 0.2] },
  ],
};

const DURATION = [2.2, 3.4, 3.2, 1.8, 4.8]; // segundos de cada paso

// posiciones de la varilla: metida, fuera (en vertical) y en horizontal para leerla
const IN = { p: new THREE.Vector3(1, 3.25, 0.6), r: 0 };
const OUT = { p: new THREE.Vector3(1, 6.75, 0.6), r: 0 };
const READ = { p: new THREE.Vector3(2.9, 4.4, 1.6), r: -Math.PI / 2 };

const TIP = -3.05; // punta de la varilla (coordenada local)
const MIN_Y = -2.95;
const MAX_Y = -2.7;
const FILM_DIRTY = 0.45; // aceite en toda la punta (antes de limpiarla)
const FILM_READ = 0.23; // nivel correcto: entre MIN y MAX
const OIL_BOTTOM = -0.08;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Pose = { p: THREE.Vector3; r: number };
type State = { dip: Pose; film: number; cloth: number | null; oilTop: number; cap: number; tilt: number; stream: boolean; marks: boolean };

const mix = (a: Pose, b: Pose, t: number): Pose => ({ p: a.p.clone().lerp(b.p, t), r: lerp(a.r, b.r, t) });

function stateAt(step: number, p: number): State {
  const base: State = { dip: IN, film: 0, cloth: null, oilTop: 0.43, cap: 0, tilt: 0, stream: false, marks: false };
  switch (step) {
    case 0:
      return { ...base, oilTop: lerp(0.15, 0.43, ease(seg(p, 0.1, 0.9))) };
    case 1: {
      const wiping = p > 0.42;
      const cloth = wiping ? lerp(TIP + 0.55, TIP - 0.08, ease(seg(p, 0.45, 0.9))) : null;
      return {
        ...base,
        dip: mix(IN, OUT, ease(seg(p, 0, 0.4))),
        film: cloth === null ? FILM_DIRTY : Math.max(0, Math.min(FILM_DIRTY, cloth - TIP)),
        cloth: p < 0.97 ? cloth : null,
      };
    }
    case 2: {
      const dip = p < 0.35 ? mix(OUT, IN, ease(seg(p, 0, 0.35))) : mix(IN, OUT, ease(seg(p, 0.45, 0.85)));
      return { ...base, dip, film: p > 0.45 ? FILM_READ : 0 };
    }
    case 3:
      return { ...base, dip: mix(OUT, READ, ease(seg(p, 0, 0.6))), film: FILM_READ, marks: true };
    case 4: {
      // primero se vuelve a meter la varilla; luego se abre el tapón, se rellena y se cierra
      const dip = p < 0.1 ? mix(READ, OUT, ease(seg(p, 0, 0.1))) : mix(OUT, IN, ease(seg(p, 0.1, 0.22)));
      const cap = p < 0.9 ? ease(seg(p, 0.22, 0.36)) : 1 - ease(seg(p, 0.9, 1));
      const tilt = p < 0.82 ? ease(seg(p, 0.36, 0.5)) : 1 - ease(seg(p, 0.82, 0.9));
      return {
        ...base,
        dip,
        film: p < 0.1 ? FILM_READ : 0,
        cap,
        tilt,
        stream: p > 0.5 && p < 0.82,
        oilTop: lerp(0.43, 0.47, ease(seg(p, 0.52, 0.82))),
      };
    }
    default:
      return base;
  }
}

export function Aceite({ step, onStepEnd }: { step: number; onStepEnd: () => void }) {
  const { reduced } = useView();
  const invalidate = useThree((s) => s.invalidate);
  const dip = useRef<THREE.Group>(null);
  const film = useRef<THREE.Mesh>(null);
  const cloth = useRef<THREE.Mesh>(null);
  const oil = useRef<THREE.Mesh>(null);
  const cap = useRef<THREE.Group>(null);
  const bottle = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Mesh>(null);
  const marks = useRef<THREE.Group>(null);
  const anim = useRef({ step: -1, p: 1, ended: true });
  const endCb = useRef(onStepEnd);
  useEffect(() => {
    endCb.current = onStepEnd;
  }, [onStepEnd]);

  useEffect(() => {
    anim.current = { step, p: reduced || step < 0 ? 1 : 0, ended: false };
    invalidate();
  }, [step, reduced, invalidate]);

  useFrame((_, dt) => {
    const a = anim.current;
    if (a.p < 1) {
      a.p = Math.min(1, a.p + Math.min(dt, 0.05) / DURATION[a.step]);
      invalidate();
    } else if (!a.ended) {
      a.ended = true;
      if (a.step >= 0) endCb.current();
    }
    const s = stateAt(a.step, a.p);
    if (dip.current) {
      dip.current.position.copy(s.dip.p);
      dip.current.rotation.z = s.dip.r;
    }
    if (film.current) {
      film.current.visible = s.film > 0.004;
      film.current.scale.y = Math.max(0.001, s.film);
      film.current.position.y = TIP + s.film / 2;
    }
    if (cloth.current) {
      cloth.current.visible = s.cloth !== null;
      if (s.cloth !== null) cloth.current.position.y = s.cloth;
    }
    if (oil.current) {
      const h = s.oilTop - OIL_BOTTOM;
      oil.current.scale.y = h;
      oil.current.position.y = OIL_BOTTOM + h / 2;
    }
    if (cap.current) {
      cap.current.position.set(-0.8 - 0.55 * s.cap, 2.98 + 0.6 * s.cap, 0.1);
      cap.current.rotation.y = s.cap * Math.PI * 3;
    }
    if (bottle.current) {
      bottle.current.visible = s.tilt > 0.001 || s.stream;
      bottle.current.rotation.z = (-120 * Math.PI) / 180 * s.tilt;
    }
    if (stream.current) stream.current.visible = s.stream;
    if (marks.current) marks.current.visible = s.marks;
  });

  return (
    <group>
      {/* Bloque del motor (con la tapa de balancines y la polea) */}
      <Part id="bloque" label="Bloque del motor" offset={[0, 0, -1.4]} anchor={[1.6, 1.0, 1.1]}>
        <RoundedBox args={[3.2, 2, 2.2]} radius={0.12} position={[0, 1.6, 0]}>
          <ShellMaterial color={COLORS.metal} />
        </RoundedBox>
        <RoundedBox args={[3, 0.32, 1.9]} radius={0.1} position={[0, 2.76, 0]}>
          <ShellMaterial color={COLORS.metalDark} roughness={0.35} />
        </RoundedBox>
        {/* 4 bobinas de encendido sobre la tapa */}
        {[-1.15, -0.45, 0.25, 0.95].map((x) => (
          <RoundedBox key={x} args={[0.34, 0.2, 0.5]} radius={0.05} position={[x + 0.1, 3.0, -0.35]}>
            <ShellMaterial color={COLORS.rubber} roughness={0.7} metalness={0.1} />
          </RoundedBox>
        ))}
        {/* tapa de la distribución (delante, a la izquierda) */}
        <RoundedBox args={[0.9, 1.9, 0.18]} radius={0.06} position={[-1.05, 1.75, 1.15]}>
          <ShellMaterial color={COLORS.metalDark} roughness={0.4} />
        </RoundedBox>
        {/* nervios laterales del bloque */}
        {[0.95, 1.35, 1.75].map((y) => (
          <mesh key={y} position={[1.61, y, -0.2]}>
            <boxGeometry args={[0.04, 0.06, 1.6]} />
            <ShellMaterial color={COLORS.metalDark} />
          </mesh>
        ))}
        <mesh position={[-1.05, 1.0, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.12, 40]} />
          <ShellMaterial color={COLORS.rubber} roughness={0.8} metalness={0.2} />
        </mesh>
      </Part>

      {/* Cárter con el aceite dentro */}
      <Part id="carter" label="Cárter (aceite)" offset={[0, -1.3, 0]} anchor={[0.6, 0.0, 1.0]}>
        <RoundedBox args={[3, 0.7, 2]} radius={0.08} position={[0, 0.25, 0]}>
          <ShellMaterial color={COLORS.metal} />
        </RoundedBox>
        <mesh ref={oil} position={[0, 0.17, 0]} renderOrder={2}>
          <boxGeometry args={[2.8, 1, 1.8]} />
          <meshStandardMaterial color={COLORS.oil} roughness={0.15} metalness={0.1} transparent opacity={0.9} emissive={COLORS.oilDark} emissiveIntensity={0.25} />
        </mesh>
      </Part>

      {/* Tubo de la varilla */}
      <Part id="tubo" label="Tubo de la varilla" offset={[1.4, 0, 1.2]} anchor={[1.25, 2.2, 0.6]}>
        <mesh position={[1, 1.86, 0.6]}>
          <cylinderGeometry args={[0.05, 0.05, 2.76, 20, 1, true]} />
          <meshStandardMaterial color={COLORS.metalDark} metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1, 3.22, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.07, 0.025, 10, 24]} />
          <meshStandardMaterial color={COLORS.metalDark} metalness={0.6} roughness={0.4} />
        </mesh>
      </Part>

      {/* Varilla: asa amarilla, varilla de acero y punta con MIN y MAX */}
      <Part id="varilla" label="Varilla del aceite" offset={[2.4, 0.4, 1.6]} anchor={[1.3, 3.55, 0.6]}>
        <group ref={dip} position={IN.p}>
          <mesh position={[0, 0.14, 0]}>
            <torusGeometry args={[0.17, 0.045, 14, 32]} />
            <meshStandardMaterial color={COLORS.yellow} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.06, 0.05, 0.22, 20]} />
            <meshStandardMaterial color={COLORS.yellow} roughness={0.35} />
          </mesh>
          {/* varilla: desde debajo del asa (-0.14) hasta la paleta de la punta (TIP + 0.48) */}
          <mesh position={[0, (-0.14 + TIP + 0.48) / 2, 0]}>
            <cylinderGeometry args={[0.022, 0.022, -0.14 - (TIP + 0.48), 12]} />
            <meshStandardMaterial color={COLORS.steel} metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, TIP + 0.24, 0]}>
            <boxGeometry args={[0.075, 0.48, 0.016]} />
            <meshStandardMaterial color={COLORS.steel} metalness={0.9} roughness={0.3} />
          </mesh>
          {[MIN_Y, MAX_Y].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[0.11, 0.016, 0.026]} />
              <meshStandardMaterial color={COLORS.rubber} />
            </mesh>
          ))}
          {/* zona rayada entre MIN y MAX */}
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, MIN_Y + 0.05 + i * 0.05, 0.009]} rotation={[0, 0, 0.7]}>
              <boxGeometry args={[0.085, 0.006, 0.002]} />
              <meshStandardMaterial color={COLORS.metalDark} />
            </mesh>
          ))}
          <mesh ref={film} position={[0, TIP, 0]} renderOrder={3}>
            <boxGeometry args={[0.082, 1, 0.022]} />
            <meshStandardMaterial color={COLORS.oil} roughness={0.1} metalness={0.2} transparent opacity={0.92} />
          </mesh>
          <mesh ref={cloth} visible={false}>
            <boxGeometry args={[0.22, 0.16, 0.16]} />
            <meshStandardMaterial color={COLORS.cloth} roughness={0.95} />
          </mesh>
          <group ref={marks}>
            <Label id="mark-min" text="MIN" kind="mark" position={[0, MIN_Y, 0]} />
            <Label id="mark-max" text="MAX" kind="mark" position={[0, MAX_Y, 0]} />
          </group>
        </group>
      </Part>

      {/* Tapón de llenado */}
      <Part id="tapon" label="Tapón de llenado" offset={[-0.4, 1.6, 0]} anchor={[-0.8, 3.4, 0.1]}>
        <group ref={cap} position={[-0.8, 2.98, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.14, 36]} />
            <meshStandardMaterial color={COLORS.yellow} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.34, 0.08, 0.09]} />
            <meshStandardMaterial color={COLORS.yellow} roughness={0.4} />
          </mesh>
        </group>
        <mesh position={[-0.8, 2.93, 0.1]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 28]} />
          <meshStandardMaterial color={COLORS.rubber} />
        </mesh>
      </Part>

      {/* Botella de aceite (solo en el paso «rellenar») */}
      <group ref={bottle} position={[-1.41, 4.28, 0.1]} visible={false}>
        <mesh>
          <boxGeometry args={[0.55, 0.8, 0.32]} />
          <meshStandardMaterial color="#2a2f3a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0.165]}>
          <boxGeometry args={[0.42, 0.3, 0.01]} />
          <meshStandardMaterial color={COLORS.yellow} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 0.26, 16]} />
          <meshStandardMaterial color="#2a2f3a" roughness={0.5} />
        </mesh>
      </group>
      <mesh ref={stream} position={[-0.84, 3.48, 0.1]} visible={false}>
        <cylinderGeometry args={[0.025, 0.035, 0.85, 10]} />
        <meshStandardMaterial color={COLORS.oil} roughness={0.1} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
