import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const fromHere = (path: string) => new URL(path, import.meta.url).pathname;

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": fromHere("./src"),
      "@components": fromHere("./src/components"),
      "@assets": fromHere("./src/assets"),
      "@types": fromHere("./src/types"),
      "@hooks": fromHere("./src/hooks"),
      "@services": fromHere("./src/services"),
      "@store": fromHere("./src/store"),
      "@utils": fromHere("./src/utils"),
    },
  },
  base: "/2048-game/",
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
  },
});
