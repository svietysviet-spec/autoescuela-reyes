"use client";

import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Puntos interactivos: cada <Hotspot> registra un punto 3D; en cada fotograma se proyecta a la pantalla
// y un <button> normal (accesible con teclado) se coloca encima del lienzo.

type Item = { id: string; group: string; label: string; kind: "boton" | "medida"; obj: THREE.Object3D; el?: HTMLElement | null };

export class HotspotStore {
  items = new Map<string, Item>();
  private fns = new Set<() => void>();
  add(i: Item) {
    this.items.set(i.id, i);
    this.fns.forEach((f) => f());
  }
  remove(id: string) {
    this.items.delete(id);
    this.fns.forEach((f) => f());
  }
  subscribe(f: () => void) {
    this.fns.add(f);
    return () => {
      this.fns.delete(f);
    };
  }
}

export const HotspotCtx = createContext<HotspotStore | null>(null);

export function Hotspot({
  id,
  group,
  label,
  position,
  kind = "boton",
}: {
  id: string;
  group: string;
  label: string;
  position: [number, number, number];
  kind?: Item["kind"];
}) {
  const store = useContext(HotspotCtx);
  const ref = useRef<THREE.Group>(null);
  const key = `${group}:${id}`;
  useEffect(() => {
    if (!store || !ref.current) return;
    store.add({ id: key, group, label, kind, obj: ref.current });
    return () => store.remove(key);
  }, [store, key, group, label, kind]);
  return <group ref={ref} position={position} />;
}

const v = new THREE.Vector3();
const camDir = new THREE.Vector3();

export function HotspotProjector({ store }: { store: HotspotStore }) {
  useFrame(({ camera, size }) => {
    camera.getWorldDirection(camDir);
    store.items.forEach((it) => {
      if (!it.el) return;
      it.obj.getWorldPosition(v);
      const behind = v.clone().sub(camera.position).dot(camDir) < 0.05;
      v.project(camera);
      const on = !behind && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      it.el.style.visibility = on ? "visible" : "hidden";
      if (on) it.el.style.transform = `translate3d(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px, 0) translate(-50%, -50%)`;
    });
  });
  return null;
}

/** Pinta los puntos del grupo visible (`group`). Los demás no tienen elemento, así que el proyector se los salta. */
export function HotspotOverlay({ store, group, active, onPick }: { store: HotspotStore; group: string | null; active: string | null; onPick: (id: string) => void }) {
  const [, force] = useState(0);
  useEffect(() => store.subscribe(() => force((n) => n + 1)), [store]);
  const items = [...store.items.values()];
  if (!group) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items
        .filter((it) => it.group === group)
        .map((it) => {
          const id = it.id.slice(group.length + 1);
          const ref = (el: HTMLElement | null) => {
            it.el = el;
          };
          return it.kind === "medida" ? (
            <span key={it.id} ref={ref} className="car-medida" style={{ visibility: "hidden" }}>
              {it.label}
            </span>
          ) : (
            <button
              key={it.id}
              ref={ref}
              type="button"
              aria-pressed={active === id}
              aria-label={it.label}
              onClick={() => onPick(id)}
              className="car-hotspot"
              style={{ visibility: "hidden" }}
            >
              <span aria-hidden>+</span>
              <span className="car-hotspot-label">{it.label}</span>
            </button>
          );
        })}
    </div>
  );
}
