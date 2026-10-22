import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Mantener las URLs de la web actual (LearnWorlds) para no perder SEO
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/about", destination: "/nosotros", permanent: true },
      { source: "/permisos", destination: "/#permisos", permanent: true },
      { source: "/permiso-a", destination: "/permisos-moto", permanent: true },
      { source: "/privacy", destination: "/privacidad", permanent: true },
      { source: "/terms", destination: "/terminos", permanent: true },
      { source: "/campus-virtual", destination: "https://autoescuela-reyes.learnworlds.com/courses", permanent: false },
      { source: "/courses", destination: "https://autoescuela-reyes.learnworlds.com/courses", permanent: false },
    ];
  },
};

export default nextConfig;
