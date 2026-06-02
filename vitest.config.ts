import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/ui"),
    },
  },
  test: {
    globals: false,
    environment: "jsdom",
    setupFiles: ["./src/ui/test/setup.ts"],
  },
});
