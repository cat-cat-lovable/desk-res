import path from "node:path";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    // React Compiler: memoización automática. En Vite 8 (Rolldown) el plugin de
    // React es oxc, así que el compilador corre como preset de babel aparte.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    // Limpieza mandatoria en producción (biblia): sin console ni debugger en
    // el bundle. Vite 8 (Rolldown) ignora esbuild.drop; se hace en el
    // minificador.
    minify: "terser",
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
    // Code splitting por grupos de vendor (auditoría de desarrollo, jun 2026):
    // node_modules se separa en bundles temáticos para carga diferida y mejor
    // caché entre deploys. Los grupos sin match simplemente no emiten chunk.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react-core", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: "router", test: /node_modules[\\/]react-router[\\/]/ },
            { name: "query", test: /node_modules[\\/]@tanstack[\\/]/ },
            { name: "state", test: /node_modules[\\/]jotai[\\/]/ },
            {
              name: "utils",
              test: /node_modules[\\/](clsx|tailwind-merge|class-variance-authority|zod)[\\/]/,
            },
            { name: "ui", test: /node_modules[\\/](tailwind-animations|@tailwindcss)[\\/]/ },
            { name: "radix", test: /node_modules[\\/]@radix-ui[\\/]/ },
            { name: "icons", test: /node_modules[\\/]lucide-react[\\/]/ },
            { name: "vendor", test: /node_modules[\\/]/ },
          ],
          minSize: 20000,
        },
      },
    },
  },
});
