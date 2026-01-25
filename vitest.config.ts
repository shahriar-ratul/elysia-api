import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // Run tests sequentially to prevent database race conditions
    fileParallelism: false,
    // Use threads pool instead of forks to avoid EPERM issues
    pool: "threads",
    // Run tests within file sequentially
    sequence: {
      concurrent: false,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "*.config.ts", "src/generated/"],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
