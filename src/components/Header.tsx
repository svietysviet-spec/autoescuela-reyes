"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LINKS, NAV, SITE, formatPhone, pageActions, tel, wa } from "@/lib/site";
import { ArrowRight, Close, Phone, User, WhatsApp } from "./icons";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const actions = pageActions(pathname);

  // Cerrar la hoja al cambiar de página
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const btn = menuBtnRef.current;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl backdrop-saturate-180">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${SITE.name}, inicio`}>
            <Image src="/img/logo.png" alt="" width={155} height={101} className="h-9 w-auto rounded-md bg-white" />
            <span className="text-[17px] font-semibold tracking-tight">{SITE.name}</span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="rounded-lg px-3 py-2 text-[15px] text-text-2 transition-colors duration-200 hover:text-text aria-[current=page]:text-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={LINKS.alumno} target="_blank" rel="noopener noreferrer" className="btn btn-gray btn-sm hidden md:inline-flex">
              <User width={16} height={16} />
              Área alumno
            </a>
            <Link href={actions.enrollHref} className="btn btn-accent btn-sm hidden md:inline-flex">
              {actions.enrollLabel}
            </Link>
            <button
              ref={menuBtnRef}
              type="button"
              className="btn btn-gray btn-sm lg:hidden"
              aria-expanded={open}
              aria-controls="menu-sheet"
              onClick={() => setOpen(true)}
            >
              Menú
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="menu-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className="fixed inset-0 z-50 flex flex-col bg-bg [animation:sheet-in_var(--dur-3)_var(--ease-out)]"
        >
          <div className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-6">
            <span className="text-[17px] font-semibold">Menú</span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-gray btn-sm !px-3"
              aria-label="Cerrar menú"
            >
              <Close />
            </button>
          </div>
          <nav aria-label="Menú móvil" className="flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6">
            <ul className="divide-y divide-line">
              {[{ href: "/", label: "Inicio" }, ...NAV, { href: "/#contacto", label: "Contacto" }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 text-[28px] font-semibold tracking-tight"
                  >
                    {item.label}
                    <ArrowRight className="text-text-3" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3">
              <Link href={actions.enrollHref} onClick={() => setOpen(false)} className="btn btn-accent w-full">
                {actions.enrollLabel}
              </Link>
              <a href={wa(actions.whatsapp, actions.message)} target="_blank" rel="noopener noreferrer" className="btn btn-wa w-full">
                <WhatsApp /> WhatsApp
              </a>
              <a href={tel(SITE.phone)} className="btn btn-gray w-full">
                <Phone width={18} height={18} /> {formatPhone(SITE.phone)}
              </a>
              <a href={LINKS.alumno} target="_blank" rel="noopener noreferrer" className="btn btn-gray w-full">
                <User width={18} height={18} /> Área alumno
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
