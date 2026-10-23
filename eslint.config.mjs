import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // En el visor 3D (react-three-fiber) se modifican materiales, cámara y controles dentro del bucle
    // de animación a propósito: es lo que evita re-renderizar React en cada fotograma.
    files: ["src/components/coche/**"],
    rules: { "react-hooks/immutability": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Componentes copiados tal cual de React Bits (reactbits.dev)
    "src/components/reactbits/**",
  ]),
]);

export default eslintConfig;
