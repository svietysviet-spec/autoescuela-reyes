"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Etiquetas propias: cada <Label> registra un punto 3D y en cada fotograma se proyecta a la pantalla.
// Son <span> normales encima del lienzo (más ligeras que crear una raíz de React por etiqueta).

type Item = { id: string; text: string; kind: "part" | "mark"; obj: THREE.Object3D; el?: HTMLElement | null };

export class LabelStore {
  items = new Map<string, Item>();
  private listeners = new Set<() => void>();
  add(item: Item) {
    this.items.set(item.id, item);
    this.emit();
  }
  remove(id: string) {
    this.items.delete(id);
    this.emit();
  }
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private emit() {
    this.listeners.forEach((fn) => fn());
  }
}

/** Sin almacén (null) las etiquetas no se registran: así se reutilizan los modelos en la vista general. */
export const LabelCtx = createContext<LabelStore | null>(null);

export function Label({ id, text, kind = "part", position }: { id: string; text: string; kind?: "part" | "mark"; position: [number, number, number] }) {
  const store = useContext(LabelCtx);
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    if (!store || !ref.current) return;
    store.add({ id, text, kind, obj: ref.current });
    return () => store.remove(id);
  }, [store, id, text, kind]);
  return <group ref={ref} position={position} />;
}

const v = new THREE.Vector3();
const shown = (o: THREE.Object3D | null) => {
  for (; o; o = o.parent) if (!o.visible) return false;
  return true;
};

/** Dentro del Canvas: coloca cada etiqueta en su sitio en cada fotograma. */
export function LabelProjector({ store }: { store: LabelStore }) {
  // las etiquetas HTML se crean fuera del lienzo después de registrarse: dos fotogramas después, se colocan
  const invalidate = useThree((s) => s.invalidate);
  useEffect(
    () =>
      store.subscribe(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => invalidate()));
      }),
    [store, invalidate],
  );
  useFrame(({ camera, size }) => {
    store.items.forEach((it) => {
      if (!it.el) return;
      it.obj.getWorldPosition(v).project(camera);
      const on = v.z < 1 && shown(it.obj);
      it.el.style.opacity = on ? "1" : "0";
      if (on) it.el.style.transform = `translate3d(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px, 0)`;
    });
  });
  return null;
}

/** Fuera del Canvas: las etiquetas como HTML. */
export function LabelOverlay({ store, visible }: { store: LabelStore; visible: boolean }) {
  const [, force] = useState(0);
  useEffect(() => store.subscribe(() => force((n) => n + 1)), [store]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[...store.items.values()]
        .filter((it) => it.kind === "mark" || visible)
        .map((it) => (
          <span
            key={it.id}
            ref={(el) => {
              it.el = el;
            }}
            className={`capo-tag ${it.kind === "mark" ? "capo-tag-mark" : ""}`}
            style={{ opacity: 0 }}
          >
            <span className={it.kind === "mark" ? "capo-mark" : "capo-label"}>{it.text}</span>
          </span>
        ))}
    </div>
  );
}
