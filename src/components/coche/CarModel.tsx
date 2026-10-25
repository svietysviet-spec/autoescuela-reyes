"use client";

import { RoundedBox, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { applyLivery } from "./livery";

export type LightState = {
  posicion: boolean;
  cruce: boolean;
  carretera: boolean;
  /** intermitentes encendidos en este instante (ya con el parpadeo aplicado) */
  izq: boolean;
  der: boolean;
  freno: boolean;
};

/** Hueco de la cabina original (salpicadero y volante del modelo) que se recorta para montar la cabina propia. */
const CARVE = { x: [-0.66, 0.66], y: [0.42, 1.13], z: [0.22, 0.92] } as const;
const CARVE_PLANES = [
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), CARVE.x[0]),
  new THREE.Plane(new THREE.Vector3(1, 0, 0), -CARVE.x[1]),
  new THREE.Plane(new THREE.Vector3(0, -1, 0), CARVE.y[0]),
  new THREE.Plane(new THREE.Vector3(0, 1, 0), -CARVE.y[1]),
  new THREE.Plane(new THREE.Vector3(0, 0, -1), CARVE.z[0]),
  new THREE.Plane(new THREE.Vector3(0, 0, 1), -CARVE.z[1]),
];

const std = (color: string, roughness = 0.6, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

/** Emisión que solo se enciende en un lado del coche (x > 0 = izquierda del conductor). */
function sideEmissive(mat: THREE.MeshStandardMaterial) {
  const u = { uL: { value: 0 }, uR: { value: 0 } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader =
      "varying vec3 vSidePos;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvSidePos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader =
      "uniform float uL;\nuniform float uR;\nvarying vec3 vSidePos;\n" +
      sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance *= vSidePos.x > 0.0 ? uL : uR;");
  };
  mat.customProgramCacheKey = () => "side-emissive";
  return u;
}

function buildMaterials() {
  const body = new THREE.MeshPhysicalMaterial({ color: "#f3f4f1", roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08 });
  applyLivery(body);
  const plastic = std("#17191d", 0.75);
  const chrome = std("#d5dae1", 0.18, 1);
  const glass = std("#0d131c", 0.04, 0.2, { transparent: true, opacity: 0.38, depthWrite: false });
  const lensClear = std("#ffffff", 0.05, 0, { transparent: true, opacity: 0.18, depthWrite: false });
  const lensRed = std("#ff2b2b", 0.08, 0, { transparent: true, opacity: 0.45, depthWrite: false });
  const head = std("#cfd6df", 0.2, 0.8, { emissive: new THREE.Color("#fff5dc"), emissiveIntensity: 0 });
  const drl = std("#e9eef5", 0.2, 0.2, { emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.6 });
  const tail = std("#5d0b10", 0.35, 0.1, { emissive: new THREE.Color("#ff1a1a"), emissiveIntensity: 0 });
  const signal = std("#7a4a00", 0.3, 0.1, { emissive: new THREE.Color("#ff9a00"), emissiveIntensity: 2.2 });
  const signalSide = sideEmissive(signal);
  const map: Record<string, THREE.Material> = {
    Steel_Gray: body,
    Color_M02: plastic,
    Black1: plastic,
    BlackTrims1: plastic,
    WindowsTrims: plastic,
    Grille1: plastic,
    Grille2: std("#2a2d33", 0.5, 0.4),
    UnderCarrier: std("#0d0e10", 0.9),
    Chrome1: chrome,
    Mirrors: std("#aab3bd", 0.12, 0.85, { emissive: new THREE.Color("#3a4656"), emissiveIntensity: 0.6 }),
    Windows: glass,
    HeadLightsGlass: lensClear,
    HeadLightsBase: head,
    DRLs: drl,
    BrakeLightsGlass: lensRed,
    BrakeLightsBase: std("#2a0507", 0.4),
    BrakeLightsMain: tail,
    DarkRed: tail,
    Red1: tail,
    Signal1: signal,
    Reflectors: std("#c2410c", 0.3, 0.1),
    Rims1: std("#b9c0c9", 0.3, 0.9),
    Rims2: std("#8e959e", 0.35, 0.9),
    Tires: std("#141518", 0.92),
    BrakeRotors: std("#7d838b", 0.4, 0.8),
    BrakeRotors1: std("#6b7078", 0.5, 0.7),
    Calipers: std("#2b2e34", 0.5, 0.4),
    Interior: std("#3a3d44", 0.8),
    Default_Material: std("#2e3036", 0.8),
  };
  return { map, head, tail, signalSide, opaque: new Set([body, plastic, map.Interior, map.Default_Material]) };
}

export function CarModel({
  url,
  lights,
  carve = true,
  onHood,
}: {
  url: string;
  lights: React.RefObject<LightState>;
  /** recorta el salpicadero original para montar la cabina propia (solo en «Tu coche») */
  carve?: boolean;
  /** recibe el capó (pieza propia del modelo) para poder abrirlo */
  onHood?: (hood: THREE.Object3D) => void;
}) {
  const gltf = useGLTF(url, false, true);
  const { scene, mats } = useMemo(() => {
    const mats = buildMaterials();
    const scene = gltf.scene.clone(true);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const name = (mesh.material as THREE.Material).name.replace("M_2021_Kia_Rio_Hatchback_", "");
      const m = mats.map[name] ?? mats.map.Default_Material;
      if (mats.opaque.has(m)) {
        if (carve) {
          m.clippingPlanes = CARVE_PLANES;
          m.clipIntersection = true;
        }
        m.side = THREE.DoubleSide;
      }
      mesh.material = m;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    });
    return { scene, mats };
  }, [gltf, carve]);
  useEffect(() => {
    const hood = scene.getObjectByName("capo");
    if (hood && onHood) onHood(hood);
  }, [scene, onHood]);
  useFrame(() => {
    const l = lights.current;
    if (!l) return;
    mats.head.emissiveIntensity = l.carretera ? 3 : l.cruce ? 1.6 : l.posicion ? 0.4 : 0;
    mats.tail.emissiveIntensity = l.freno ? 2.4 : l.posicion || l.cruce || l.carretera ? 0.9 : 0.15;
    mats.signalSide.uL.value = l.izq ? 1 : 0;
    mats.signalSide.uR.value = l.der ? 1 : 0;
  });

  return <primitive object={scene} />;
}

/** Placa de autoescuela en el techo: «L» blanca sobre fondo azul, por las dos caras. */
export function RoofSign() {
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

export const preloadCar = (url: string) => useGLTF.preload(url, false, true);
