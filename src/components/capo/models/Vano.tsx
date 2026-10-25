"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { CarModel, RoofSign, type LightState } from "../../coche/CarModel";

// El coche de prácticas (el mismo de «Tu coche») con el capó que se abre y el vano del motor.
// Coordenadas en metros: el morro mira a +z y el conductor va en +x.

/** Bisagra del capó (borde trasero, junto al parabrisas) y ángulos de apertura. */
export const HINGE = new THREE.Vector3(0, 0.98, 0.94);
export const HOOD_OPEN = THREE.MathUtils.degToRad(73);
export const HOOD_REST = THREE.MathUtils.degToRad(71.5);
/** Pivote de la varilla (en el travesaño, lado del acompañante) y taco del capó donde encaja. */
const ROD_PIVOT = new THREE.Vector3(-0.42, 0.79, 1.66);
const POCKET = new THREE.Vector3(-0.42, 0.845, 1.55);

const Y = new THREE.Vector3(0, 1, 0);
const pocketAt = (angle: number) =>
  POCKET.clone().sub(HINGE).applyAxisAngle(new THREE.Vector3(1, 0, 0), -angle).add(HINGE);
const ROD_DIR = pocketAt(HOOD_REST).sub(ROD_PIVOT);
const ROD_LEN = ROD_DIR.length();
const Q_DOWN = new THREE.Quaternion().setFromUnitVectors(Y, new THREE.Vector3(1, 0, 0));
const Q_UP = new THREE.Quaternion().setFromUnitVectors(Y, ROD_DIR.clone().normalize());

/** Ángulo del capó (rad), avance de la varilla (0 tumbada · 1 encajada) y si espera a que el alumno la coloque. */
export type HoodAnim = { angle: number; rod: number; wait: boolean };

const LIGHTS: LightState = { posicion: false, cruce: false, carretera: false, izq: false, der: false, freno: false };

/** Coche con el capó abierto o cerrado según `anim`. El capó del modelo se cuelga de una bisagra propia. */
export function CarFront({
  lite,
  anim,
  onHoodClick,
  onRodClick,
}: {
  lite: boolean;
  anim: RefObject<HoodAnim>;
  onHoodClick: () => void;
  /** el alumno pulsa la varilla para sujetar el capó */
  onRodClick: () => void;
}) {
  const lights = useRef<LightState>(LIGHTS);
  const pivot = useRef<THREE.Group>(null);
  const rod = useRef<THREE.Group>(null);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const rodMat = useRef<THREE.MeshStandardMaterial>(null);
  const invalidate = useThree((s) => s.invalidate);

  const mountHood = useCallback((hood: THREE.Object3D) => {
    const p = pivot.current;
    if (!p || hood.parent === p) return;
    hood.updateWorldMatrix(true, false);
    p.updateWorldMatrix(true, false);
    p.attach(hood); // conserva su posición en el mundo
  }, []);

  useFrame(({ clock }) => {
    const a = anim.current;
    if (pivot.current) pivot.current.rotation.x = -a.angle;
    if (rod.current) rod.current.quaternion.copy(q.copy(Q_DOWN).slerp(Q_UP, a.rod));
    // mientras espera, la varilla late en amarillo para que se vea dónde pulsar
    if (rodMat.current) rodMat.current.emissiveIntensity = a.wait ? 0.6 + 0.5 * Math.sin(clock.elapsedTime * 5) : 0;
    if (a.wait) invalidate();
  });

  const rodClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4 || !anim.current.wait) return;
    e.stopPropagation();
    onRodClick();
  };

  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4 || anim.current.angle > 0.01) return;
    e.stopPropagation();
    onHoodClick();
  };

  return (
    <group>
      <CarModel url={lite ? "/models/coche-lite.glb" : "/models/coche.glb"} lights={lights} carve={false} onHood={mountHood} />
      <RoofSign />
      <group
        ref={pivot}
        position={HINGE}
        onClick={click}
        onPointerOver={() => {
          if (anim.current.angle < 0.01) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        {/* taco de goma bajo el capó, donde encaja la varilla */}
        <mesh position={POCKET.clone().sub(HINGE)}>
          <cylinderGeometry args={[0.014, 0.014, 0.022, 12]} />
          <meshStandardMaterial color="#17191d" roughness={0.8} />
        </mesh>
      </group>
      {/* varilla de soporte: tumbada en el travesaño y, al abrir, encajada en el taco */}
      <group
        ref={rod}
        position={ROD_PIVOT}
        onClick={rodClick}
        onPointerOver={() => {
          if (anim.current.wait) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <mesh position={[0, ROD_LEN / 2, 0]}>
          <cylinderGeometry args={[0.006, 0.006, ROD_LEN, 8]} />
          <meshStandardMaterial ref={rodMat} color="#c9ced6" metalness={0.9} roughness={0.3} emissive="#f7ce3e" emissiveIntensity={0} />
        </mesh>
        {/* zona de pulsación más gruesa que la varilla (invisible), cómoda también con el dedo */}
        <mesh position={[0, ROD_LEN / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, ROD_LEN, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <mesh position={ROD_PIVOT}>
        <boxGeometry args={[0.03, 0.02, 0.03]} />
        <meshStandardMaterial color="#17191d" roughness={0.7} />
      </mesh>
      <BayShell />
    </group>
  );
}

const METAL = new THREE.MeshStandardMaterial({ color: "#8b9099", metalness: 0.35, roughness: 0.55 });
const PLASTIC = new THREE.MeshStandardMaterial({ color: "#2a2e36", metalness: 0.05, roughness: 0.75 });
const DARK = new THREE.MeshStandardMaterial({ color: "#15171b", roughness: 0.9 });

/** Contorno del vano: aletas interiores, torretas, panel del fondo, travesaño y bandeja. */
function BayShell() {
  return (
    <group>
      {/* aletas interiores con su larguero superior */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0.68 * s, 0.6, 1.33]} material={METAL}>
            <boxGeometry args={[0.02, 0.44, 0.78]} />
          </mesh>
          <mesh position={[0.665 * s, 0.82, 1.33]} material={METAL}>
            <boxGeometry args={[0.06, 0.03, 0.8]} />
          </mesh>
          {/* torreta del amortiguador */}
          <mesh position={[0.6 * s, 0.72, 1.08]} material={METAL}>
            <cylinderGeometry args={[0.065, 0.09, 0.18, 20]} />
          </mesh>
          <mesh position={[0.6 * s, 0.813, 1.08]} material={DARK}>
            <cylinderGeometry args={[0.04, 0.04, 0.012, 16]} />
          </mesh>
        </group>
      ))}
      {/* cortafuegos y repisa de plástico bajo el parabrisas */}
      <mesh position={[0, 0.62, 0.955]} material={METAL}>
        <boxGeometry args={[1.36, 0.46, 0.02]} />
      </mesh>
      <mesh position={[0, 0.86, 0.99]} material={PLASTIC}>
        <boxGeometry args={[1.36, 0.02, 0.1]} />
      </mesh>
      {/* travesaño frontal con el cierre del capó */}
      <mesh position={[0, 0.765, 1.67]} material={METAL}>
        <boxGeometry args={[1.36, 0.04, 0.07]} />
      </mesh>
      <mesh position={[0, 0.79, 1.67]} material={DARK}>
        <boxGeometry args={[0.08, 0.02, 0.04]} />
      </mesh>
      {/* bandeja inferior: tapa el suelo */}
      <mesh position={[0, 0.32, 1.33]} material={DARK}>
        <boxGeometry args={[1.36, 0.02, 0.78]} />
      </mesh>
    </group>
  );
}
