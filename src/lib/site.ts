import type { CSSProperties } from "react";

// Única fuente de datos del sitio. Todo lo que aparece aquí sale de la web actual
// (autoescuelareyes.com). Lo que falta va como marcador entre corchetes: [ASÍ].

export const SITE = {
  name: "Autoescuela Reyes",
  legalName: "Autoescuela Suárez Reyes, S.L.",
  cif: "B35844315",
  url: "https://www.autoescuelareyes.com",
  city: "Las Palmas de Gran Canaria",
  tagline: "¡Nunca ha estado tan fácil!",
  email: "info@autoescuelareyes.com",
  phone: "928414888",
  whatsapp: "34670680222",
  foundedYear: "[AÑO]",
};

export const LINKS = {
  alumno: "https://app.autoescuelareyes.com/alumno/acceso",
  campus: "https://autoescuela-reyes.learnworlds.com/courses",
  notaExamen: "https://sedeclave.dgt.gob.es/WEB_NOTP_CONSULTA/consultaNota.faces",
  puntosDGT: "https://sede.dgt.gob.es/es/permisos-de-conducir/permiso-por-puntos/consulta-de-puntos/",
  capFaq: "https://www.transportes.gob.es/transporte-terrestre/preguntas-frecuentes-faq/cap",
  facebook: "https://www.facebook.com/autoescuelareyesLPA/",
  instagram: "https://www.instagram.com/autoescuelareyeslp/",
  tiktok: "https://www.tiktok.com/@autoescuelareyeslp",
};

const ENROLL_BASE = "https://app.autoescuelareyes.com/autoescuela/matricular";

/** Enlaces reales a los formularios de matrícula online. */
export const ENROLL = {
  bBasico: `${ENROLL_BASE}?seleccionar=siempre&categoria=coches_y_vehiculos_ligeros&centro=01&matricula=157`,
  bPremium: `${ENROLL_BASE}?seleccionar=siempre&categoria=coches_y_vehiculos_ligeros&centro=01&matricula=922`,
  a1: `${ENROLL_BASE}?categoria=motos_y_ciclomotores&centro=01&matricula=130`,
  a2: `${ENROLL_BASE}?categoria=motos_y_ciclomotores&centro=01&matricula=146`,
  a2ConB: `${ENROLL_BASE}?categoria=motos_y_ciclomotores&centro=01&matricula=147`,
  c: `${ENROLL_BASE}?categoria=camiones&centro=01&matricula=200`,
  ce: `${ENROLL_BASE}?categoria=camiones&centro=01&matricula=210`,
  d: `${ENROLL_BASE}?categoria=autobuses&centro=01&matricula=240`,
};

export function wa(number: string, message?: string) {
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function tel(number: string) {
  return `tel:+34${number}`;
}

export function formatPhone(number: string) {
  return number.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export type Center = {
  id: string;
  name: string;
  zone: string;
  address: string;
  postal?: { street: string; postalCode?: string; locality: string };
  phone?: string;
  whatsapp: string;
  email?: string;
  hours: string;
  services: string[];
  mapsQuery?: string;
};

export const CENTERS: Center[] = [
  {
    id: "7-palmas",
    name: "Sede 7 Palmas",
    zone: "Las Palmas de G.C.",
    address: "C. Fondos de Segura, 11, 35019 Las Palmas de Gran Canaria",
    postal: { street: "C. Fondos de Segura, 11", postalCode: "35019", locality: "Las Palmas de Gran Canaria" },
    phone: "928414888",
    whatsapp: "34670680222",
    email: "info@autoescuelareyes.com",
    hours: "[HORARIO]",
    services: ["Permisos", "CAP", "Recuperación de puntos"],
    mapsQuery: "Autoescuela Reyes, C. Fondos de Segura 11, 35019 Las Palmas de Gran Canaria",
  },
  {
    id: "la-feria",
    name: "Sede La Feria",
    zone: "Las Palmas de G.C.",
    address: "[DIRECCIÓN LA FERIA]",
    phone: "634044594",
    whatsapp: "34634044594",
    hours: "[HORARIO]",
    services: ["Permisos"],
  },
  {
    id: "telde",
    name: "San Cristóbal – Telde",
    zone: "Telde",
    address: "Carretera General de Jinámar, 5, Telde",
    postal: { street: "Carretera General de Jinámar, 5", locality: "Telde" },
    whatsapp: "34627555155",
    email: "info@recuperapuntoslaspalmas.com",
    hours: "[HORARIO]",
    services: ["Recuperación de puntos"],
    mapsQuery: "Carretera General de Jinámar 5, Telde",
  },
];

export const PUNTOS_CONTACT = {
  whatsapp: "34627555155",
  email: "info@recuperapuntoslaspalmas.com",
};

export type PermitCategory = "coche" | "moto" | "profesional";

export type Permit = {
  slug: string;
  href: string;
  category: PermitCategory;
  name: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  facts: string[];
  from?: number;
};

export const PERMITS: Permit[] = [
  {
    slug: "b",
    href: "/permiso-b",
    category: "coche",
    name: "Permiso B",
    title: "Coche",
    summary: "Manual, automático o adaptado para personas con movilidad reducida.",
    image: "/img/coche-corsa.jpg",
    imageAlt: "Coche de prácticas de Autoescuela Reyes en carretera de montaña",
    facts: ["Desde 18 años", "Teórico: 30 preguntas, 3 fallos"],
    from: 50,
  },
  {
    slug: "a1",
    href: "/permisos-moto",
    category: "moto",
    name: "Permiso A1",
    title: "Moto hasta 125 cc",
    summary: "Motos de hasta 125 cc y 11 kW de potencia máxima.",
    image: "/img/moto-a1.jpg",
    imageAlt: "Moto de 125 cc de Autoescuela Reyes tomando una curva",
    facts: ["Desde 16 años", "Teórico: 20 preguntas, 2 fallos"],
    from: 70,
  },
  {
    slug: "a2",
    href: "/permisos-moto",
    category: "moto",
    name: "Permiso A2",
    title: "Moto hasta 35 kW",
    summary: "Motos de hasta 35 kW de potencia máxima.",
    image: "/img/moto-curva.jpg",
    imageAlt: "Alumno con moto de Autoescuela Reyes en una curva",
    facts: ["Desde 18 años", "60 € si ya tienes el B"],
    from: 60,
  },
  {
    slug: "c",
    href: "/permiso-c",
    category: "profesional",
    name: "Permiso C",
    title: "Camión",
    summary: "Transporte de mercancías con MMA superior a 3.500 kg.",
    image: "/img/camion-c.jpg",
    imageAlt: "Camión de prácticas de Autoescuela Reyes en carretera",
    facts: ["Teórico: 20 preguntas, 2 fallos", "Con o sin CAP"],
    from: 100,
  },
  {
    slug: "ce",
    href: "/permiso-e",
    category: "profesional",
    name: "Permiso C+E",
    title: "Tráiler",
    summary: "Camión con remolque: maniobras de L, muelle y enganche.",
    image: "/img/trailer-ce.jpg",
    imageAlt: "Tráiler de Autoescuela Reyes circulando",
    facts: ["Teórico: 20 preguntas, 2 fallos", "3 maniobras de examen"],
    from: 100,
  },
  {
    slug: "d",
    href: "/permiso-d",
    category: "profesional",
    name: "Permiso D",
    title: "Guagua",
    summary: "Transporte de viajeros, más de 9 plazas incluido el conductor.",
    image: "/img/guagua-d.jpg",
    imageAlt: "Guagua de prácticas de Autoescuela Reyes",
    facts: ["Teórico: 20 preguntas, 2 fallos", "Con o sin CAP"],
    from: 100,
  },
];

export const CATEGORY_LABELS: Record<PermitCategory, string> = {
  coche: "Coche",
  moto: "Moto",
  profesional: "Profesional",
};

export const NAV = [
  { href: "/#permisos", label: "Permisos" },
  { href: "/cap", label: "CAP" },
  { href: "/recuperacion-de-puntos", label: "Puntos" },
  { href: "/bajo-el-capo", label: "Bajo el capó" },
  { href: "/conoce-tu-coche", label: "Tu coche" },
  { href: "/#sedes", label: "Sedes" },
  { href: "/nosotros", label: "Nosotros" },
];

const PAGES_WITH_PRICES = ["/permiso-b", "/permisos-moto", "/permiso-c", "/permiso-d", "/permiso-e", "/cap"];

/** CTA principal y WhatsApp según la página en la que esté el usuario. */
export function pageActions(pathname: string) {
  const isPuntos = pathname.startsWith("/recuperacion-de-puntos");
  return {
    enrollHref: PAGES_WITH_PRICES.includes(pathname) ? "#tarifas" : isPuntos ? "#cursos" : "/#permisos",
    enrollLabel: isPuntos ? "Ver cursos" : "Matricúlate",
    whatsapp: isPuntos ? PUNTOS_CONTACT.whatsapp : SITE.whatsapp,
    message: isPuntos
      ? "Hola, quiero información sobre los cursos de recuperación de puntos."
      : "Hola, quiero información sobre los permisos de Autoescuela Reyes.",
  };
}

export const euro =(n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Ajustes de SpotlightCard (React Bits) con los colores de la marca: brillo amarillo muy suave que sigue al ratón. */
export const SPOTLIGHT = {
  theme: "light" as const,
  spotlightColor: "var(--accent)",
  intensity: 0.35,
  spotlightSize: 260,
  borderGlow: 0.8,
  style: {
    "--spotlight-card-surface": "var(--card-bg)",
    "--spotlight-card-border": "var(--card-border)",
    "--spotlight-card-shadow": "none",
  } as CSSProperties,
};
