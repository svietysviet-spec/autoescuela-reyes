import type { MetadataRoute } from "next";
import { PIEZAS } from "@/content/capo";
import { SITE } from "@/lib/site";

const ROUTES = ["", "/permiso-b", "/permisos-moto", "/permiso-c", "/permiso-e", "/permiso-d", "/cap", "/recuperacion-de-puntos", "/nosotros", "/bajo-el-capo"];

export default function sitemap(): MetadataRoute.Sitemap {
  const piezas = PIEZAS.filter((p) => p.disponible && p.slug !== "aceite").map((p) => ({
    url: `${SITE.url}/bajo-el-capo?pieza=${p.slug}`,
    priority: 0.6,
  }));
  return [...ROUTES.map((r) => ({ url: `${SITE.url}${r}`, priority: r === "" ? 1 : 0.8 })), ...piezas];
}
