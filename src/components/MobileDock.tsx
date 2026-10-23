"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageActions, wa } from "@/lib/site";
import { WhatsApp } from "./icons";

/** Botón flotante de WhatsApp + barra inferior con los dos CTA (solo móvil). */
export function MobileDock() {
  const pathname = usePathname();
  const actions = pageActions(pathname);
  const waHref = wa(actions.whatsapp, actions.message);

  // en «Bajo el capó» el botón flotante taparía la ficha: WhatsApp sigue en «Pide información»
  const showFab = !pathname.startsWith("/bajo-el-capo") && !pathname.startsWith("/conoce-tu-coche");

  return (
    <div className="md:hidden">
      {showFab && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
          className="fixed right-4 z-30 grid size-14 place-items-center rounded-full bg-wa text-white shadow-float transition-transform duration-150 active:scale-95"
          style={{ bottom: "calc(var(--dock-h) + 12px)" }}
        >
          <WhatsApp width={28} height={28} />
        </a>
      )}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/85 px-4 pt-3 backdrop-blur-xl"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-2 gap-3">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gray w-full"
          >
            Pide información
          </a>
          <Link href={actions.enrollHref} className="btn btn-accent w-full">
            {actions.enrollLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
