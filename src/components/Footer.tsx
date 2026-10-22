import Link from "next/link";
import { CENTERS, LINKS, PERMITS, SITE, formatPhone, tel } from "@/lib/site";
import { Facebook, Instagram, TikTok } from "./icons";

const COLS = [
  {
    title: "Permisos",
    links: [
      ...PERMITS.filter((p) => p.slug !== "a2").map((p) => ({
        href: p.href,
        label: p.slug === "a1" ? "Permisos A1 y A2" : p.name,
      })),
    ],
  },
  {
    title: "Cursos",
    links: [
      { href: "/cap", label: "CAP inicial, ampliación y continua" },
      { href: "/recuperacion-de-puntos", label: "Recuperación de puntos" },
      { href: "/permiso-b#amaxofobia", label: "Miedo a conducir" },
      { href: "/permiso-b#reciclaje", label: "Prácticas de reciclaje" },
    ],
  },
  {
    title: "Enlaces útiles",
    links: [
      { href: LINKS.alumno, label: "Área alumno · comprar prácticas" },
      { href: LINKS.campus, label: "Campus virtual" },
      { href: LINKS.notaExamen, label: "Consulta tu nota (DGT)" },
      { href: LINKS.puntosDGT, label: "Consulta tus puntos (DGT)" },
      { href: "/nosotros", label: "Nosotros" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-bg-2 text-[14px] text-text-2">
      <div className="mx-auto max-w-[1120px] px-4 pb-10 pt-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <p className="text-[20px] font-semibold tracking-tight text-text">{SITE.tagline}</p>
            <p className="mt-2 max-w-[300px]">
              Autoescuela en {SITE.city}. Formación cercana para conducir con seguridad y confianza.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { href: LINKS.instagram, label: "Instagram", Icon: Instagram },
                { href: LINKS.facebook, label: "Facebook", Icon: Facebook },
                { href: LINKS.tiktok, label: "TikTok", Icon: TikTok },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full bg-bg-elevated text-text transition-colors hover:text-accent-text"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h2 className="mb-3 text-[13px] font-semibold text-text">{col.title}</h2>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith("http") ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-text">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="hover:text-text">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
          {CENTERS.map((c) => (
            <div key={c.id}>
              <p className="font-semibold text-text">{c.name}</p>
              <p>{c.address}</p>
              {c.phone && (
                <a href={tel(c.phone)} className="hover:text-text">
                  {formatPhone(c.phone)}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-[12px] md:flex-row md:items-center md:justify-between">
          <p>
            © {SITE.legalName} · CIF {SITE.cif} · C. Fondos de Segura, 11, 35019 Las Palmas de Gran Canaria
          </p>
          <nav aria-label="Legal" className="flex gap-4">
            <Link href="/terminos" className="hover:text-text">
              Aviso legal
            </Link>
            <Link href="/privacidad" className="hover:text-text">
              Privacidad
            </Link>
            <Link href="/cookies" className="hover:text-text">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
