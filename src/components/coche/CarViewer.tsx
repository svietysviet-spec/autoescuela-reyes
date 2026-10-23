"use client";

import { CameraControls, ContactShadows, Environment, Lightformer, RoundedBox, useProgress } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { MANDOS, OJOS, type Cam } from "@/content/coche";
import { CarModel, type LightState } from "./CarModel";
import { Cockpit, type CabinState } from "./Cockpit";
import { Hotspot, HotspotCtx, HotspotOverlay, HotspotProjector, HotspotStore } from "./hotspots";

/** Encuadre exterior: uno concreto, «lado» (de perfil, ajustado al ancho de la pantalla) o la órbita general. */
export type ExtCam = Cam | "lado" | null;

const GENERAL: Cam = { pos: [4.3, 1.8, 5.4], target: [0, 0.62, 0] };

/** Líneas de medidas para la ficha, en el lado del conductor. */
function Medidas() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#f7ce3e", toneMapped: false }), []);
  const X = 1.12;
  const bar = (pos: [number, number, number], size: [number, number, number]) => (
    <mesh position={pos} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  );
  return (
    <group>
      {/* largo, a ras de suelo */}
      {bar([X, 0.02, 0], [0.012, 0.012, 4.07])}
      {bar([X, 0.02, 2.035], [0.012, 0.1, 0.012])}
      {bar([X, 0.02, -2.035], [0.012, 0.1, 0.012])}
      {/* alto, delante del morro */}
      {bar([X, 0.725, 2.3], [0.012, 1.45, 0.012])}
      {bar([X, 1.45, 2.3], [0.012, 0.012, 0.1])}
      {bar([X, 0, 2.3], [0.012, 0.012, 0.1])}
      {/* distancia entre ejes, por los bujes */}
      {bar([X - 0.18, 0.315, -0.075], [0.012, 0.012, 2.58])}
      {bar([X - 0.18, 0.315, 1.215], [0.012, 0.08, 0.012])}
      {bar([X - 0.18, 0.315, -1.365], [0.012, 0.08, 0.012])}
      <Hotspot id="largo" group="ficha" kind="medida" label="4,07 m" position={[X, 0.02, 0.6]} />
      <Hotspot id="alto" group="ficha" kind="medida" label="1,45 m" position={[X, 0.75, 2.3]} />
      <Hotspot id="ejes" group="ficha" kind="medida" label="2,58 m entre ejes" position={[X - 0.18, 0.315, -0.075]} />
    </group>
  );
}

/** Placa de autoescuela en el techo: «L» blanca sobre fondo azul, por las dos caras. */
function RoofSign() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 192;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1d4fb8";
    g.fillRect(0, 0, 256, 192);
    g.fillStyle = "#fff";
    g.font = "900 150px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("L", 128, 102);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={[0, 1.47, -0.15]}>
      <RoundedBox args={[0.46, 0.05, 0.22]} radius={0.02} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#16181c" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.25, 0.05]} radius={0.02} position={[0, 0.17, 0]}>
        <meshStandardMaterial color="#f7ce3e" roughness={0.5} />
      </RoundedBox>
      {tex &&
        [0.026, -0.026].map((z) => (
          <mesh key={z} position={[0, 0.17, z]} rotation={[0, z < 0 ? Math.PI : 0, 0]}>
            <planeGeometry args={[0.3, 0.21]} />
            <meshStandardMaterial map={tex} roughness={0.4} />
          </mesh>
        ))}
    </group>
  );
}

/** Cámara: órbita lenta por fuera, encuadres exteriores, primera persona al volante y acercamiento a cada mando. */
function CameraRig({
  controls,
  dentro,
  mando,
  ext,
  orbit,
  reduced,
}: {
  controls: RefObject<CameraControls | null>;
  dentro: boolean;
  mando: string | null;
  ext: ExtCam;
  orbit: boolean;
  reduced: boolean;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const idleUntil = useRef(0);
  const extKey = ext === "lado" || ext === null ? ext : ext.pos.join() + ext.target.join();

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const go = (cam: Cam) => c.setLookAt(...cam.pos, ...cam.target, !reduced);
    const m = mando ? MANDOS.find((x) => x.slug === mando) : null;
    if (!dentro) {
      c.minDistance = 2;
      c.maxDistance = 24;
      c.azimuthRotateSpeed = c.polarRotateSpeed = 1;
      c.dollySpeed = 1;
      c.maxPolarAngle = Math.PI * 0.49;
      if (ext === "lado") {
        // de perfil: la distancia justa para que quepan los 4 m del coche y las medidas
        const half = Math.tan(THREE.MathUtils.degToRad(17)) * aspect;
        const d = Math.max(7, 3.1 / half);
        // en pantallas anchas el coche se corre a la izquierda para dejar sitio a la ficha
        const z = aspect > 1.2 ? -0.45 : 0.12;
        void go({ pos: [d, 0.9, z], target: [0, 0.68, z] });
      } else void go(ext ?? GENERAL);
    } else if (m) {
      c.minDistance = 0.12;
      c.maxDistance = 1.2;
      c.azimuthRotateSpeed = c.polarRotateSpeed = 0.6;
      c.dollySpeed = 0.5;
      c.maxPolarAngle = Math.PI;
      void go(m.cam);
    } else {
      // primera persona: el punto de giro está a 5 cm delante de los ojos y el arrastre va invertido
      const eye = new THREE.Vector3(...OJOS.pos);
      const dir = new THREE.Vector3(...OJOS.target).sub(eye).normalize().multiplyScalar(0.05);
      c.minDistance = c.maxDistance = 0.05;
      c.azimuthRotateSpeed = c.polarRotateSpeed = -0.35;
      c.dollySpeed = 0;
      c.maxPolarAngle = Math.PI;
      void c.setLookAt(eye.x, eye.y, eye.z, eye.x + dir.x, eye.y + dir.y, eye.z + dir.z, !reduced);
    }
    // el encuadre se recalcula al cambiar de vista o de detalle; `ext` ya está resumido en `extKey`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, dentro, mando, extKey, aspect, reduced]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const pause = () => (idleUntil.current = performance.now() + 4000);
    c.addEventListener("controlstart", pause);
    return () => c.removeEventListener("controlstart", pause);
  }, [controls]);

  // giro lento del coche en la vista general (no con «reducir movimiento» ni mientras el alumno lo mueve)
  useFrame((_, dt) => {
    if (!orbit || reduced || performance.now() < idleUntil.current) return;
    controls.current?.rotate(dt * 0.12, 0, false);
    invalidate();
  });
  return null;
}

export default function CarViewer({
  dentro,
  mando,
  ext = null,
  orbit = false,
  medidas = false,
  puntos,
  activo,
  night,
  reduced,
  lite,
  cabin,
  onPick,
}: {
  dentro: boolean;
  /** mando enfocado (solo dentro del coche) */
  mando: string | null;
  ext?: ExtCam;
  orbit?: boolean;
  medidas?: boolean;
  /** grupo de puntos interactivos que se ve («interior», «ruedas», «ficha») */
  puntos: string | null;
  /** punto marcado como activo */
  activo: string | null;
  night: boolean;
  reduced: boolean;
  lite: boolean;
  cabin: RefObject<CabinState>;
  onPick: (slug: string) => void;
}) {
  const controls = useRef<CameraControls>(null);
  const lights = useRef<LightState>({ posicion: false, cruce: false, carretera: false, izq: false, der: false, freno: false });
  const [hotspots] = useState(() => new HotspotStore());
  const { active, progress } = useProgress();
  const url = lite ? "/models/coche-lite.glb" : "/models/coche.glb";

  return (
    <div className="absolute inset-0">
      <Canvas
        frameloop="demand"
        dpr={lite ? [1, 1.5] : [1, 2]}
        gl={{ localClippingEnabled: true, antialias: true, alpha: true }}
        camera={{ position: GENERAL.pos, fov: dentro ? 62 : 34, near: 0.02, far: 80 }}
        role="img"
        aria-label="Coche de prácticas de Autoescuela Reyes en 3D. Arrastra para girar o mirar alrededor."
      >
        <HotspotCtx.Provider value={hotspots}>
          <FovRig dentro={dentro} />
          <hemisphereLight args={[night ? "#3a4566" : "#eef2fa", night ? "#05060a" : "#1d2028", night ? 0.25 : 0.9]} />
          <directionalLight position={[5, 8, 4]} intensity={night ? 0.15 : 1.6} />
          <Environment resolution={256} frames={1} key={night ? "n" : "d"}>
            <Lightformer intensity={night ? 0.25 : 2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
            <Lightformer intensity={night ? 0.15 : 1.2} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
            <Lightformer intensity={night ? 0.1 : 0.8} color="#f7ce3e" position={[6, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
          </Environment>
          <Suspense fallback={null}>
            <CarModel url={url} lights={lights} />
            <RoofSign />
            <Cockpit state={cabin} lights={lights} selected={dentro ? mando : null} />
            {medidas && <Medidas />}
          </Suspense>
          <ContactShadows position={[0, 0.001, 0]} scale={9} blur={2.2} opacity={night ? 0.6 : 0.5} far={2} frames={1} resolution={512} />
          <CameraControls ref={controls} makeDefault smoothTime={0.45} />
          <CameraRig controls={controls} dentro={dentro} mando={dentro ? mando : null} ext={ext} orbit={orbit} reduced={reduced} />
          <HotspotProjector store={hotspots} />
        </HotspotCtx.Provider>
      </Canvas>
      <HotspotOverlay store={hotspots} group={puntos} active={activo} onPick={onPick} />
      {active && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 text-center text-[14px] text-white/70">Cargando el coche… {Math.round(progress)} %</div>
      )}
    </div>
  );
}

/** Más campo de visión dentro del coche (como la vista real del conductor). */
function FovRig({ dentro }: { dentro: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    camera.fov = dentro ? 62 : 34;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, dentro, invalidate]);
  return null;
}
