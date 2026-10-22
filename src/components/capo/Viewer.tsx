"use client";

import {
  CameraControls,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { LabelCtx, LabelOverlay, LabelProjector, LabelStore } from "./labels";
import { ViewCtx, type Cam, type ModelProps, type ViewState } from "./scene";
import { ACEITE_CAM, Aceite } from "./models/Aceite";
import { FRENOS_CAM, Frenos, LIMPIA_CAM, Limpiaparabrisas, REFRIGERANTE_CAM, Refrigerante } from "./models/Depositos";
import { BATERIA_CAM, Bateria, CORREA_CAM, Correa, FILTRO_CAM, FiltroAire, RADIADOR_CAM, Radiador } from "./models/Mecanica";
import { MOTOR_CAM, Motor, focusCam } from "./models/Motor";

type Extra = { focus?: string | null; onPick?: (slug: string) => void };
const MODELS: Record<string, { cam: { def: Cam; steps: Cam[] }; Model: React.ComponentType<ModelProps & Extra> }> = {
  aceite: { cam: ACEITE_CAM, Model: Aceite },
  refrigerante: { cam: REFRIGERANTE_CAM, Model: Refrigerante },
  radiador: { cam: RADIADOR_CAM, Model: Radiador },
  frenos: { cam: FRENOS_CAM, Model: Frenos },
  limpiaparabrisas: { cam: LIMPIA_CAM, Model: Limpiaparabrisas },
  bateria: { cam: BATERIA_CAM, Model: Bateria },
  "filtro-aire": { cam: FILTRO_CAM, Model: FiltroAire },
  correa: { cam: CORREA_CAM, Model: Correa },
  motor: { cam: MOTOR_CAM, Model: Motor },
};

/** Visor 3D. Solo se carga en /bajo-el-capo (import dinámico sin SSR desde Explorer). */
export default function Viewer({
  slug,
  view,
  step,
  onStepEnd,
  focus,
  onPick,
}: {
  slug: string;
  view: ViewState;
  step: number;
  onStepEnd: () => void;
} & Extra) {
  const entry = MODELS[slug] ?? MODELS.aceite;
  const controls = useRef<CameraControls>(null);

  const { Model } = entry;
  const start = entry.cam.def;
  const [labels] = useState(() => new LabelStore());
  // encuadre estable: solo cambia cuando cambia la pieza, el paso o la pieza enfocada
  const cam = useMemo(
    () => (slug === "motor" && focus ? focusCam(focus) : step >= 0 ? (entry.cam.steps[step] ?? entry.cam.def) : entry.cam.def),
    [slug, focus, step, entry],
  );

  return (
    <div className="absolute inset-0">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        gl={{ localClippingEnabled: true, antialias: true, alpha: true }}
        camera={{ position: start.pos, fov: 35, near: 0.1, far: 100 }}
        aria-label="Modelo 3D de la pieza. Arrastra para girar y pellizca o usa la rueda para acercar."
        role="img"
      >
        <ViewCtx.Provider value={view}>
          <LabelCtx.Provider value={labels}>
            <Repaint view={view} />
            <hemisphereLight args={["#e9eef8", "#1a1d24", 0.9]} />
            <directionalLight position={[6, 10, 6]} intensity={1.6} />
            <directionalLight
              position={[-6, 4, -5]}
              intensity={0.6}
              color="#f7ce3e"
            />
            <Environment resolution={128} frames={1}>
              <Lightformer
                intensity={2}
                position={[0, 6, 4]}
                scale={[10, 3, 1]}
              />
              <Lightformer
                intensity={0.8}
                position={[-6, 2, 0]}
                rotation-y={Math.PI / 2}
                scale={[8, 4, 1]}
              />
              <Lightformer
                intensity={0.6}
                color="#f7ce3e"
                position={[6, 1, -3]}
                rotation-y={-Math.PI / 2}
                scale={[6, 2, 1]}
              />
            </Environment>
            <Model step={step} onStepEnd={onStepEnd} focus={focus} onPick={onPick} />
            <ContactShadows
              key={slug}
              position={[0, slug === "motor" ? -0.68 : -0.14, 0]}
              scale={slug === "motor" ? 22 : 12}
              blur={2.4}
              opacity={0.55}
              far={4}
              frames={1}
              resolution={512}
            />
            <CameraControls
              ref={controls}
              makeDefault
              minDistance={2.5}
              maxDistance={26}
              maxPolarAngle={Math.PI * 0.62}
              smoothTime={0.35}
            />
            <CameraRig controls={controls} cam={cam} reduced={view.reduced} />
            {/* el último: así coloca las etiquetas después de que la animación mueva las piezas */}
            <LabelProjector store={labels} />
          </LabelCtx.Provider>
        </ViewCtx.Provider>
      </Canvas>
      <LabelOverlay store={labels} visible={view.labels} />
    </div>
  );
}

/** Con frameloop="demand" el lienzo solo pinta cuando algo cambia: al tocar un control, repinta. */
function Repaint({ view }: { view: ViewState }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [view, invalidate]);
  return null;
}

/** Lleva la cámara al encuadre pedido. En pantallas estrechas (móvil) se aleja para que la pieza quepa a lo ancho. */
function CameraRig({ controls, cam, reduced }: { controls: RefObject<CameraControls | null>; cam: Cam; reduced: boolean }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    const k = aspect < 1.2 ? 1.2 / aspect : 1;
    const [px, py, pz] = cam.pos;
    const [tx, ty, tz] = cam.target;
    controls.current?.setLookAt(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k, tx, ty, tz, !reduced);
  }, [controls, cam, aspect, reduced]);
  return null;
}
