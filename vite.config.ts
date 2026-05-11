import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// NOTE: @tailwindcss/vite@^4 is incompatible with tailwindcss@^3 (different major versions).
// The project's CSS is entirely custom (no Tailwind utility classes are used), so the plugin
// is not needed. If you want to add Tailwind v4 later:
//   1. Remove `tailwindcss: "^3.x.x"` from devDependencies
//   2. Re-add `import tailwindcss from "@tailwindcss/vite"` and put tailwindcss() in plugins
//   3. Add `@import "tailwindcss";` to your entry CSS file

export default defineConfig({
  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  server: {
    port: 5173,
    host: true,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
