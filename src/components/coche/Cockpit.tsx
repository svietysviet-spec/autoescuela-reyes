"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { MANDOS, RUEDAS } from "@/content/coche";
import type { LightState } from "./CarModel";
import { Hotspot } from "./hotspots";
import { click, swish } from "./sound";

/** Estado de los mandos que maneja la interfaz. */
export type CabinState = {
  luces: 0 | 1 | 2 | 3; // apagado, posición, cruce, carretera
  intermitente: -1 | 0 | 1; // izquierda, nada, derecha
  warning: boolean;
  frenoMano: boolean;
  pisar: "embrague" | "freno" | "acelerador" | "profesor" | null;
  limpia: 0 | 1 | 2 | 3; // parado, intermitente, lento, rápido
  /** instante (performance.now) del último lavado, toque de claxon o prueba de testigos */
  lavar: number;
  claxon: number;
  prueba: number;
  marcha: Marcha;
  cinturon: boolean;
  ac: boolean;
  recirc: boolean;
  temp: number; // −1 frío … 1 calor
  parabrisas: boolean;
  luneta: boolean;
  empanado: boolean;
  v16: boolean;
};

export type Marcha = "N" | "1" | "2" | "3" | "4" | "5" | "R";
/** Esquema de ejemplo (5 marchas y la atrás a la derecha y abajo): columna (+1 = izquierda del conductor) y fila (+1 = hacia delante). */
export const MARCHAS: Record<Marcha, [number, number]> = { N: [0, 0], "1": [1, 1], "2": [1, -1], "3": [0, 1], "4": [0, -1], "5": [-1, 1], R: [-1, -1] };

export const CABIN_INICIAL: CabinState = {
  luces: 0,
  intermitente: 0,
  warning: false,
  frenoMano: true,
  pisar: null,
  limpia: 0,
  lavar: 0,
  claxon: 0,
  prueba: 0,
  marcha: "N",
  cinturon: false,
  ac: false,
  recirc: false,
  temp: 0,
  parabrisas: false,
  luneta: false,
  empanado: false,
  v16: false,
};

/** Parabrisas: borde de abajo y de arriba (y, z) en el centro del coche. El grupo que lo sigue tiene su «y» hacia arriba del cristal y su «z» hacia fuera. */
const WS = { base: [0.97, 1.05], top: [1.37, 0.22], ancho: 1.3 } as const;
const WS_LEN = Math.hypot(WS.top[0] - WS.base[0], WS.top[1] - WS.base[1]);
const WS_ROT = Math.atan2(WS.top[1] - WS.base[1], WS.top[0] - WS.base[0]);

/** Qué piezas se iluminan al elegir cada mando. */
const SEL: Record<string, string[]> = {
  luces: ["stalkL"],
  intermitentes: ["stalkL"],
  limpiaparabrisas: ["stalkR"],
  claxon: ["claxon"],
  warning: ["warning"],
  climatizador: ["clima"],
  desempanador: ["defrost"],
  cambios: ["cambios"],
  "freno-mano": ["freno"],
  pedales: ["pedales", "profesor"],
  testigos: ["cuadro"],
  cinturon: ["cinturon"],
};

const DRIVER_X = 0.37;
const DARK = "#1f2227";

/** Iconos del cuadro dibujados una sola vez. */
function iconTexture(draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.strokeStyle = g.fillStyle = "#fff";
  g.lineWidth = 6;
  g.lineCap = g.lineJoin = "round";
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const ICONS = {
  izq: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.moveTo(8, 32);
    g.lineTo(30, 12);
    g.lineTo(30, 24);
    g.lineTo(56, 24);
    g.lineTo(56, 40);
    g.lineTo(30, 40);
    g.lineTo(30, 52);
    g.closePath();
    g.fill();
  },
  der: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.moveTo(56, 32);
    g.lineTo(34, 12);
    g.lineTo(34, 24);
    g.lineTo(8, 24);
    g.lineTo(8, 40);
    g.lineTo(34, 40);
    g.lineTo(34, 52);
    g.closePath();
    g.fill();
  },
  faro: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.arc(38, 32, 16, -Math.PI / 2, Math.PI / 2);
    g.closePath();
    g.stroke();
    for (const y of [20, 32, 44]) {
      g.beginPath();
      g.moveTo(6, y + 6);
      g.lineTo(18, y);
      g.stroke();
    }
  },
  largas: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.arc(38, 32, 16, -Math.PI / 2, Math.PI / 2);
    g.closePath();
    g.fill();
    for (const y of [20, 32, 44]) {
      g.beginPath();
      g.moveTo(4, y);
      g.lineTo(18, y);
      g.stroke();
    }
  },
  freno: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.arc(32, 32, 17, 0, Math.PI * 2);
    g.stroke();
    g.font = "bold 26px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("P", 32, 34);
  },
  cinturon: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.arc(32, 12, 7, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(20, 58);
    g.lineTo(22, 28);
    g.quadraticCurveTo(32, 20, 42, 28);
    g.lineTo(44, 58);
    g.stroke();
    g.beginPath();
    g.moveTo(40, 24);
    g.lineTo(24, 50);
    g.stroke();
  },
  aceite: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.moveTo(8, 30);
    g.lineTo(18, 26);
    g.lineTo(30, 34);
    g.lineTo(44, 34);
    g.lineTo(58, 24);
    g.lineTo(46, 46);
    g.lineTo(20, 46);
    g.lineTo(18, 32);
    g.stroke();
    g.beginPath();
    g.arc(58, 36, 3, 0, Math.PI * 2);
    g.fill();
  },
  bateria: (g: CanvasRenderingContext2D) => {
    g.strokeRect(8, 20, 48, 30);
    g.fillRect(14, 14, 8, 6);
    g.fillRect(42, 14, 8, 6);
    g.beginPath();
    g.moveTo(14, 35);
    g.lineTo(24, 35);
    g.moveTo(19, 30);
    g.lineTo(19, 40);
    g.moveTo(40, 35);
    g.lineTo(50, 35);
    g.stroke();
  },
  motor: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.moveTo(10, 26);
    g.lineTo(10, 44);
    g.moveTo(10, 35);
    g.lineTo(16, 35);
    g.moveTo(16, 24);
    g.lineTo(46, 24);
    g.lineTo(46, 30);
    g.lineTo(56, 30);
    g.lineTo(56, 44);
    g.lineTo(46, 44);
    g.lineTo(40, 50);
    g.lineTo(22, 50);
    g.lineTo(16, 44);
    g.closePath();
    g.moveTo(26, 24);
    g.lineTo(26, 16);
    g.lineTo(36, 16);
    g.stroke();
  },
  parabrisas: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.moveTo(8, 50);
    g.quadraticCurveTo(32, 40, 56, 50);
    g.lineTo(50, 22);
    g.quadraticCurveTo(32, 16, 14, 22);
    g.closePath();
    g.stroke();
    for (const x of [24, 32, 40]) {
      g.beginPath();
      g.moveTo(x, 42);
      g.quadraticCurveTo(x - 4, 36, x, 30);
      g.stroke();
    }
  },
  luneta: (g: CanvasRenderingContext2D) => {
    g.strokeRect(10, 18, 44, 30);
    for (const x of [22, 32, 42]) {
      g.beginPath();
      g.moveTo(x, 42);
      g.quadraticCurveTo(x - 4, 34, x, 26);
      g.stroke();
    }
  },
  ac: (g: CanvasRenderingContext2D) => {
    g.font = "bold 26px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("A/C", 32, 34);
  },
  recirc: (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.moveTo(8, 48);
    g.lineTo(18, 24);
    g.quadraticCurveTo(26, 12, 50, 12);
    g.moveTo(54, 48);
    g.lineTo(12, 48);
    g.stroke();
    g.beginPath();
    g.arc(36, 32, 12, 0.3, Math.PI * 1.7);
    g.stroke();
    g.beginPath();
    g.moveTo(46, 22);
    g.lineTo(48, 32);
    g.lineTo(40, 28);
    g.fill();
  },
  marchas: (g: CanvasRenderingContext2D) => {
    // esquema de marchas en el pomo (visto desde arriba, el morro hacia arriba)
    g.lineWidth = 3;
    g.beginPath();
    for (const x of [14, 32, 50]) {
      g.moveTo(x, 18);
      g.lineTo(x, 46);
    }
    g.moveTo(14, 32);
    g.lineTo(50, 32);
    g.stroke();
    g.font = "bold 12px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    (
      [
        ["1", 14, 10],
        ["2", 14, 55],
        ["3", 32, 10],
        ["4", 32, 55],
        ["5", 50, 10],
        ["R", 50, 55],
      ] as const
    ).forEach(([t, x, y]) => g.fillText(t, x, y));
  },
};
type IconId = keyof typeof ICONS;

const GLOW_KEYS = ["stalkL", "stalkR", "claxon", "warning", "clima", "defrost", "cambios", "freno", "pedales", "profesor", "cuadro", "cinturon"] as const;
type GlowKey = (typeof GLOW_KEYS)[number];

/** Cinturón: colgado del pilar o abrochado (banda del hombro y de la cadera). */
const BELT = {
  suelto: [
    [0.6, 1.2, -0.36],
    [0.61, 0.95, -0.37],
    [0.6, 0.66, -0.35],
  ],
  hombro: [
    [0.6, 1.2, -0.36],
    [0.5, 1.05, -0.12],
    [0.32, 0.84, -0.01],
    [0.15, 0.68, 0.02],
  ],
  cadera: [
    [0.15, 0.68, 0.02],
    [0.4, 0.66, 0.06],
    [0.59, 0.66, -0.16],
  ],
} as const;
const tube = (pts: readonly (readonly number[])[]) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))), 32, 0.011, 6, false);

export function Cockpit({ state, lights, selected }: { state: React.RefObject<CabinState>; lights: React.RefObject<LightState>; selected: string | null }) {
  const invalidate = useThree((s) => s.invalidate);
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const out = {} as Record<IconId, THREE.CanvasTexture>;
    for (const k of Object.keys(ICONS) as IconId[]) out[k] = iconTexture(ICONS[k]);
    return out;
  }, []);
  // materiales que brillan en amarillo cuando su mando está seleccionado
  const glow = useMemo(() => {
    const m = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2, emissive: new THREE.Color("#f7ce3e"), emissiveIntensity: 0 });
    const base: Record<GlowKey, string> = {
      stalkL: "#2a2d33",
      stalkR: "#2a2d33",
      claxon: "#17191d",
      warning: "#2a2d33",
      clima: "#24272d",
      defrost: "#24272d",
      cambios: "#121316",
      freno: "#2a2d33",
      pedales: "#3b3f46",
      profesor: "#4a4320",
      cuadro: "#15171a",
      cinturon: "#2b2e34",
    };
    return Object.fromEntries(GLOW_KEYS.map((k) => [k, m(base[k])])) as Record<GlowKey, THREE.MeshStandardMaterial>;
  }, []);
  const warnTri = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e5484d", emissive: new THREE.Color("#ff2a2a"), emissiveIntensity: 0.1 }), []);
  const fog = useMemo(() => new THREE.MeshBasicMaterial({ color: "#dfe6ee", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), []);
  const beacon = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ff9a00", emissive: new THREE.Color("#ff9a00"), emissiveIntensity: 0, roughness: 0.3 }), []);
  const belts = useMemo(() => ({ suelto: tube(BELT.suelto), hombro: tube(BELT.hombro), cadera: tube(BELT.cadera) }), []);

  const stalk = useRef<THREE.Group>(null);
  const knob = useRef<THREE.Group>(null);
  const stalkR = useRef<THREE.Group>(null);
  const hb = useRef<THREE.Group>(null);
  const warnBtn = useRef<THREE.Group>(null);
  const hub = useRef<THREE.Group>(null);
  const gear = useRef<THREE.Group>(null);
  const tempKnob = useRef<THREE.Group>(null);
  const wipers = useRef<(THREE.Group | null)[]>([]);
  const beltOn = useRef<THREE.Group>(null);
  const beltOff = useRef<THREE.Mesh>(null);
  const v16 = useRef<THREE.Group>(null);
  const pedals = useRef<Record<string, THREE.Group | null>>({});
  const icons = useRef<Record<string, THREE.MeshBasicMaterial | null>>({});
  const leds = useRef<Record<string, THREE.MeshBasicMaterial | null>>({});
  const anim = useRef({
    stalkZ: 0,
    stalkY: 0,
    knob: 0,
    stalkR: 0,
    hb: 0,
    warn: 0,
    hub: 0,
    gx: 0,
    gz: 0,
    temp: 0,
    fog: 0,
    wT: 0,
    wAngle: 0,
    wSweep: -1,
    ped: {} as Record<string, number>,
    blink: false,
    lastBlink: false,
  });

  useFrame(({ clock }, dt) => {
    const s = state.current;
    if (!s) return;
    const a = anim.current;
    const t = clock.elapsedTime;
    const now = performance.now();
    const k = 1 - Math.exp(-dt * 12);
    let moving = false;
    const step = (cur: number, target: number, kk = k) => {
      const n = cur + (target - cur) * kk;
      if (Math.abs(n - target) > 0.001) {
        moving = true;
        return n;
      }
      return target;
    };

    // palanca izquierda: arriba = derecha, abajo = izquierda; hacia delante = largas
    a.stalkZ = step(a.stalkZ, s.intermitente === 1 ? 0.2 : s.intermitente === -1 ? -0.2 : 0);
    a.stalkY = step(a.stalkY, s.luces === 3 ? -0.18 : 0);
    a.knob = step(a.knob, [0, 0.9, 1.8, 1.8][s.luces]);
    if (stalk.current) {
      stalk.current.rotation.z = a.stalkZ;
      stalk.current.rotation.y = a.stalkY;
    }
    if (knob.current) knob.current.rotation.x = a.knob;
    // palanca derecha: baja un punto por cada velocidad; hacia ti al lavar
    const washing = now - s.lavar < 2600;
    a.stalkR = step(a.stalkR, -0.09 * s.limpia);
    if (stalkR.current) {
      stalkR.current.rotation.z = a.stalkR;
      stalkR.current.rotation.y = washing && now - s.lavar < 700 ? 0.16 : 0;
    }
    a.hb = step(a.hb, s.frenoMano ? -0.42 : -0.08);
    if (hb.current) hb.current.rotation.x = a.hb;
    a.warn = step(a.warn, s.warning ? -0.006 : 0);
    if (warnBtn.current) warnBtn.current.position.z = 0.512 + a.warn;
    a.hub = step(a.hub, now - s.claxon < 450 ? 0.012 : 0);
    if (hub.current) hub.current.position.z = 0.01 + a.hub;
    for (const id of ["embrague", "freno", "acelerador", "prof-embrague", "prof-freno"]) {
      const pressed = s.pisar === id || (s.pisar === "profesor" && id.startsWith("prof"));
      a.ped[id] = step(a.ped[id] ?? 0, pressed ? -0.35 : 0);
      const g = pedals.current[id];
      if (g) g.rotation.x = a.ped[id];
    }
    const [col, row] = MARCHAS[s.marcha];
    a.gx = step(a.gx, -0.2 * col);
    a.gz = step(a.gz, 0.26 * row);
    if (gear.current) gear.current.rotation.set(a.gz, 0, a.gx);
    a.temp = step(a.temp, s.temp * 2.2);
    if (tempKnob.current) tempKnob.current.rotation.z = -a.temp;

    // escobillas: barrido continuo, intermitente o al lavar; al parar terminan el barrido en curso
    const period = s.limpia === 3 ? 0.75 : 1.25;
    const cycle = s.limpia === 1 && !washing ? 3.6 : period;
    const on = s.limpia > 0 || washing;
    const phase = (a.wT % cycle) / period;
    if (on || (a.wT > 0 && phase < 1)) {
      a.wT += dt;
      const sweep = Math.floor(a.wT / cycle);
      if (on && sweep !== a.wSweep) {
        a.wSweep = sweep;
        swish();
      }
      const p = (a.wT % cycle) / period;
      a.wAngle = p < 1 ? Math.sin(Math.PI * p) * 1.55 : 0;
      moving = true;
    } else {
      a.wT = 0;
      a.wSweep = -1;
      a.wAngle = 0;
    }
    wipers.current.forEach((w) => w && (w.rotation.z = a.wAngle));

    // vaho del parabrisas: se va despacio con el desempañador
    a.fog = step(a.fog, s.empanado && !s.parabrisas ? 0.78 : 0, 1 - Math.exp(-dt * (s.parabrisas ? 0.9 : 3)));
    fog.opacity = a.fog;
    fog.visible = a.fog > 0.005;

    // cinturón
    if (beltOn.current) beltOn.current.visible = s.cinturon;
    if (beltOff.current) beltOff.current.visible = !s.cinturon;

    // parpadeo de intermitentes y warning (con su clic) y de la luz V16
    const blinking = s.warning || s.intermitente !== 0;
    a.blink = blinking && Math.floor(t / 0.42) % 2 === 0;
    if (blinking && a.blink !== a.lastBlink) click(a.blink ? 1 : 0.75);
    a.lastBlink = a.blink;
    const l = lights.current;
    if (l) {
      l.izq = a.blink && (s.warning || s.intermitente === -1);
      l.der = a.blink && (s.warning || s.intermitente === 1);
      l.posicion = s.luces >= 1;
      l.cruce = s.luces >= 2;
      l.carretera = s.luces === 3;
      l.freno = s.pisar === "freno" || s.pisar === "profesor";
    }
    warnTri.emissiveIntensity = s.warning && a.blink ? 3 : 0.1;
    if (v16.current) v16.current.visible = s.v16;
    beacon.emissiveIntensity = s.v16 && Math.floor(t / 0.33) % 2 === 0 ? 4 : 0.2;

    // testigos: al probarlos se encienden todos un momento, como al arrancar
    const test = now - s.prueba < 2200;
    const ic = icons.current;
    const set = (id: string, lit: boolean, color: string) => ic[id]?.color.set(lit || test ? color : "#3a3f48");
    set("izq", !!l?.izq, "#3ddc84");
    set("der", !!l?.der, "#3ddc84");
    set("faro", s.luces === 2, "#3ddc84");
    set("largas", s.luces === 3, "#3b82f6");
    set("freno", s.frenoMano, "#ff3b30");
    set("cinturon", !s.cinturon, "#ff3b30");
    set("aceite", false, "#ff3b30");
    set("bateria", false, "#ff3b30");
    set("motor", false, "#ffb020");
    const led = (id: string, lit: boolean) => leds.current[id]?.color.set(lit ? "#ffb020" : "#2c3038");
    led("parabrisas", s.parabrisas);
    led("luneta", s.luneta);
    led("ac", s.ac);
    led("recirc", s.recirc);

    // el mando seleccionado late en amarillo
    const pulse = 0.35 + 0.35 * Math.sin(t * 5);
    const lit = new Set(selected ? (SEL[selected] ?? []) : []);
    for (const key of GLOW_KEYS) glow[key].emissiveIntensity = lit.has(key) ? pulse : 0;

    if (moving || blinking || selected || test || s.v16 || washing) invalidate();
  });

  const pedal = (id: string, x: number, wide: boolean, mat: THREE.Material) => (
    <group key={id} ref={(g) => { pedals.current[id] = g; }} position={[x, 0.56, 0.74]}>
      <mesh position={[0, -0.08, -0.02]} rotation={[0.25, 0, 0]} material={mat}>
        <boxGeometry args={[0.015, 0.17, 0.015]} />
      </mesh>
      <mesh position={[0, -0.17, -0.05]} rotation={[0.45, 0, 0]} material={mat}>
        <boxGeometry args={[wide ? 0.1 : 0.065, 0.085, 0.012]} />
      </mesh>
    </group>
  );

  // botón de la consola con su icono y su piloto
  const consoleBtn = (id: IconId, x: number) => (
    <group key={id} position={[x, 0.725, 0.516]}>
      <RoundedBox args={[0.042, 0.024, 0.012]} radius={0.004} material={glow.defrost} />
      {tex && (
        <mesh position={[0, 0.001, -0.0065]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.018, 0.018]} />
          <meshBasicMaterial map={tex[id]} color="#c9d1dc" transparent toneMapped={false} />
        </mesh>
      )}
      <mesh position={[0, -0.0085, -0.0066]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.012, 0.0025]} />
        <meshBasicMaterial ref={(m) => { leds.current[id] = m; }} color="#2c3038" toneMapped={false} />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* salpicadero */}
      <RoundedBox args={[1.44, 0.32, 0.34]} radius={0.06} position={[0, 0.86, 0.71]}>
        <meshStandardMaterial color={DARK} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[1.44, 0.06, 0.4]} radius={0.03} position={[0, 1.03, 0.68]}>
        <meshStandardMaterial color="#17191d" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[1.42, 0.16, 0.18]} radius={0.05} position={[0, 0.67, 0.8]}>
        <meshStandardMaterial color="#1a1c21" roughness={0.9} />
      </RoundedBox>
      {/* banda decorativa amarilla (detalle Reyes) */}
      <mesh position={[0, 0.955, 0.538]}>
        <boxGeometry args={[1.2, 0.008, 0.004]} />
        <meshStandardMaterial color="#f7ce3e" roughness={0.4} />
      </mesh>

      {/* cuadro de instrumentos */}
      <RoundedBox args={[0.42, 0.11, 0.16]} radius={0.04} position={[DRIVER_X, 1.09, 0.63]} material={glow.cuadro} />
      <mesh position={[DRIVER_X, 1.03, 0.615]} rotation={[0.25, Math.PI, 0]}>
        <planeGeometry args={[0.38, 0.12]} />
        <meshStandardMaterial color="#07080a" roughness={0.3} metalness={0.3} />
      </mesh>
      {[-0.1, 0.1].map((dx) => (
        <mesh key={dx} position={[DRIVER_X + dx, 1.03, 0.612]} rotation={[0.25, Math.PI, 0]}>
          <ringGeometry args={[0.038, 0.045, 40]} />
          <meshBasicMaterial color="#9aa3b2" toneMapped={false} />
        </mesh>
      ))}
      {tex &&
        (
          [
            ["izq", 0.045, 1.055],
            ["der", -0.045, 1.055],
            ["faro", 0.02, 1.0],
            ["largas", -0.02, 1.0],
            ["freno", 0, 1.03],
            ["cinturon", 0.155, 1.055],
            ["aceite", 0.155, 1.005],
            ["bateria", -0.155, 1.055],
            ["motor", -0.155, 1.005],
          ] as const
        ).map(([id, dx, y]) => (
          <mesh key={id} position={[DRIVER_X + dx, y, 0.609 - (1.03 - y) * 0.25]} rotation={[0.25, Math.PI, 0]}>
            <planeGeometry args={[0.026, 0.026]} />
            <meshBasicMaterial ref={(m) => { icons.current[id] = m; }} map={tex[id]} color="#3a3f48" transparent toneMapped={false} />
          </mesh>
        ))}

      {/* columna, volante y palancas */}
      <mesh position={[DRIVER_X, 0.87, 0.53]} rotation={[0.35 + Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.2, 16]} />
        <meshStandardMaterial color="#141518" roughness={0.8} />
      </mesh>
      <group position={[DRIVER_X, 0.9, 0.42]} rotation={[0.35, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.185, 0.024, 16, 64]} />
          <meshStandardMaterial color="#121316" roughness={0.6} />
        </mesh>
        <group ref={hub} position={[0, -0.01, 0.01]}>
          <RoundedBox args={[0.13, 0.1, 0.06]} radius={0.025} material={glow.claxon} />
          <mesh position={[0, 0, -0.035]}>
            <boxGeometry args={[0.05, 0.012, 0.002]} />
            <meshStandardMaterial color="#f7ce3e" />
          </mesh>
        </group>
        {[
          [-0.1, -0.02, 0],
          [0.1, -0.02, 0],
          [0, -0.11, Math.PI / 2],
        ].map(([x, y, r]) => (
          <mesh key={`${x}${y}`} position={[x, y, 0.005]} rotation={[0, 0, r]}>
            <boxGeometry args={[0.12, 0.03, 0.015]} />
            <meshStandardMaterial color="#1b1d21" roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* palanca izquierda (del conductor, +x): luces e intermitentes */}
      <group ref={stalk} position={[DRIVER_X + 0.07, 0.905, 0.47]}>
        <mesh position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={glow.stalkL}>
          <cylinderGeometry args={[0.009, 0.012, 0.14, 12]} />
        </mesh>
        <group ref={knob} position={[0.155, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={glow.stalkL}>
            <cylinderGeometry args={[0.016, 0.016, 0.05, 16]} />
          </mesh>
          <mesh position={[-0.005, 0.0165, 0]}>
            <boxGeometry args={[0.012, 0.004, 0.006]} />
            <meshStandardMaterial color="#f7ce3e" />
          </mesh>
        </group>
      </group>
      {/* palanca derecha (−x): limpiaparabrisas */}
      <group ref={stalkR} position={[DRIVER_X - 0.07, 0.905, 0.47]}>
        <mesh position={[-0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={glow.stalkR}>
          <cylinderGeometry args={[0.009, 0.012, 0.14, 12]} />
        </mesh>
        <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={glow.stalkR}>
          <cylinderGeometry args={[0.014, 0.014, 0.04, 16]} />
        </mesh>
      </group>

      {/* escobillas y vaho, sobre el plano del parabrisas */}
      <group position={[0, WS.base[0], WS.base[1]]} rotation={[WS_ROT, 0, 0]}>
        {[-0.08, -0.66].map((x, i) => (
          <group key={x} position={[x, 0.03, 0.012]} ref={(g) => { wipers.current[i] = g; }}>
            <mesh position={[i ? 0.24 : 0.27, 0, 0]}>
              <boxGeometry args={[i ? 0.48 : 0.54, 0.012, 0.012]} />
              <meshStandardMaterial color="#0c0d0f" roughness={0.6} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, WS_LEN / 2, -0.012]} material={fog}>
          <planeGeometry args={[WS.ancho, WS_LEN]} />
        </mesh>
      </group>

      {/* consola central: pantalla, emergencia y climatizador */}
      <RoundedBox args={[0.3, 0.34, 0.1]} radius={0.03} position={[0, 0.8, 0.57]}>
        <meshStandardMaterial color="#1a1c20" roughness={0.8} />
      </RoundedBox>
      <mesh position={[0, 0.93, 0.518]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.24, 0.12]} />
        <meshStandardMaterial color="#05070a" roughness={0.15} metalness={0.4} />
      </mesh>
      <group ref={warnBtn} position={[0, 0.855, 0.512]}>
        <RoundedBox args={[0.07, 0.035, 0.02]} radius={0.006} material={glow.warning} />
        <mesh position={[0, 0, -0.011]} rotation={[Math.PI / 2, 0, 0]} material={warnTri}>
          <cylinderGeometry args={[0.012, 0.012, 0.002, 3]} />
        </mesh>
      </group>
      {/* ruedas: temperatura (izquierda del conductor, +x) y ventilador */}
      {[0.09, -0.09].map((x, i) => (
        <group key={x} ref={i === 0 ? tempKnob : undefined} position={[x, 0.775, 0.512]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={glow.clima}>
            <cylinderGeometry args={[0.026, 0.028, 0.02, 28]} />
          </mesh>
          <mesh position={[0, 0.017, -0.0105]}>
            <boxGeometry args={[0.004, 0.012, 0.002]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          {i === 0 &&
            (
              [
                [0.035, "#3b82f6"],
                [-0.035, "#ff3b30"],
              ] as const
            ).map(([dx, c]) => (
              <mesh key={dx} position={[dx, 0.02, -0.001]}>
                <boxGeometry args={[0.008, 0.008, 0.002]} />
                <meshBasicMaterial color={c} toneMapped={false} />
              </mesh>
            ))}
        </group>
      ))}
      {(["parabrisas", "luneta", "ac", "recirc"] as const).map((id, i) => consoleBtn(id, 0.075 - i * 0.05))}

      {/* túnel central, palanca de cambios y freno de mano */}
      <RoundedBox args={[0.24, 0.14, 0.8]} radius={0.04} position={[0.03, 0.47, 0.1]}>
        <meshStandardMaterial color="#1a1c20" roughness={0.85} />
      </RoundedBox>
      <group ref={gear} position={[0.03, 0.54, 0.36]}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.009, 0.012, 0.14, 12]} />
          <meshStandardMaterial color="#202227" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]} material={glow.cambios}>
          <sphereGeometry args={[0.032, 20, 16]} />
        </mesh>
        {tex && (
          <mesh position={[0, 0.1815, 0]} rotation={[-Math.PI / 2, 0, Math.PI]}>
            <circleGeometry args={[0.02, 24]} />
            <meshBasicMaterial map={tex.marchas} transparent toneMapped={false} />
          </mesh>
        )}
      </group>
      <group ref={hb} position={[0.06, 0.55, -0.16]} rotation={[-0.08, 0, 0]}>
        <mesh position={[0, 0, 0.13]} material={glow.freno}>
          <boxGeometry args={[0.04, 0.035, 0.27]} />
        </mesh>
        <mesh position={[0, 0, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 12]} />
          <meshStandardMaterial color="#f7ce3e" />
        </mesh>
      </group>

      {/* cinturón del conductor */}
      <mesh ref={beltOff} geometry={belts.suelto} material={glow.cinturon} />
      <group ref={beltOn} visible={false}>
        <mesh geometry={belts.hombro} material={glow.cinturon} />
        <mesh geometry={belts.cadera} material={glow.cinturon} />
        <mesh position={[0.15, 0.675, 0.02]}>
          <boxGeometry args={[0.035, 0.05, 0.025]} />
          <meshStandardMaterial color="#9aa3b2" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* pedales del alumno (embrague, freno, acelerador) y doble pedal del profesor */}
      {pedal("embrague", DRIVER_X - 0.13, false, glow.pedales)}
      {pedal("freno", DRIVER_X, true, glow.pedales)}
      {pedal("acelerador", DRIVER_X + 0.12, false, glow.pedales)}
      {pedal("prof-embrague", -0.46, false, glow.profesor)}
      {pedal("prof-freno", -0.32, true, glow.profesor)}

      {/* luz V16 en el techo */}
      <group ref={v16} position={[0.25, 1.46, 0.35]} visible={false}>
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.05, 0.055, 0.025, 24]} />
          <meshStandardMaterial color="#1b1d21" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.045, 0]} material={beacon}>
          <cylinderGeometry args={[0.035, 0.045, 0.045, 24]} />
        </mesh>
      </group>

      {/* puntos interactivos */}
      {MANDOS.filter((m) => m.disponible).map((m) => (
        <Hotspot key={m.slug} id={m.slug} group="interior" label={m.nombre} position={m.punto} />
      ))}
      {RUEDAS.map((r) => r.punto && <Hotspot key={r.slug} id={r.slug} group="ruedas" label={r.nombre} position={r.punto} />)}
    </group>
  );
}
