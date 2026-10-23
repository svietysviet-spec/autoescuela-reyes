import type { MetadataRoute } from "next";
import { PIEZAS } from "@/content/capo";
import { MANDOS, VISTAS } from "@/content/coche";
import { SITE } from "@/lib/site";

const ROUTES = ["", "/permiso-b", "/permisos-moto", "/permiso-c", "/permiso-e", "/permiso-d", "/cap", "/recuperacion-de-puntos", "/nosotros", "/bajo-el-capo", "/conoce-tu-coche"];

export default function sitemap(): MetadataRoute.Sitemap {
  const piezas = PIEZAS.filter((p) => p.disponible && p.slug !== "aceite").map((p) => ({
    url: `${SITE.url}/bajo-el-capo?pieza=${p.slug}`,
    priority: 0.6,
  }));
  const coche = [
    ...VISTAS.filter((v) => v.disponible && !["general", "capo", "interior", "prueba"].includes(v.slug)).map((v) => `vista=${v.slug}`),
    ...MANDOS.filter((m) => m.disponible).map((m) => `vista=interior&mando=${m.slug}`),
  ].map((q) => ({ url: `${SITE.url}/conoce-tu-coche?${q.replaceAll("&", "&amp;")}`, priority: 0.5 })); // Next no escapa el XML
  return [...ROUTES.map((r) => ({ url: `${SITE.url}${r}`, priority: r === "" ? 1 : 0.8 })), ...piezas, ...coche];
}
