"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HIDDEN: Keyframe = { opacity: 0, transform: "translateY(8px)" };
const SHOWN: Keyframe = { opacity: 1, transform: "none" };

/**
 * Anima los elementos `.reveal` al entrar en pantalla. Usa la Web Animations API en lugar de
 * cambiar clases o estilos, para no tocar el HTML que React está hidratando.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const vh = window.innerHeight;
    // Lo que ya está en pantalla no se anima: así no parpadea
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal")).filter(
      (el) => el.getBoundingClientRect().top >= vh,
    );
    const holds = new Map(els.map((el) => [el, el.animate([HIDDEN], { duration: 0, fill: "forwards" })]));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          holds.get(el)?.cancel();
          holds.delete(el);
          const i = Number(getComputedStyle(el).getPropertyValue("--i")) || 0;
          el.animate([HIDDEN, SHOWN], { duration: 600, delay: i * 60, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      holds.forEach((a) => a.cancel());
    };
  }, [pathname]);

  return null;
}
