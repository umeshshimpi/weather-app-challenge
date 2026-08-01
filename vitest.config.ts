import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      // Tests import domain source directly so they do not depend on a prior build.
      "@weather/domain": path.resolve(__dirname, "packages/domain/src"),
    },
  },
  test: {
    environment: "node",
    include: [
      "packages/**/*.test.ts",
      "apps/api/src/**/*.spec.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "packages/domain/src/**/*.ts",
        "apps/api/src/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/types.ts",
        "**/index.ts",
        "**/main.ts",
        "**/*.module.ts",
      ],
    },
  },
});
