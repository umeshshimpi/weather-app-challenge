import { defineConfig } from "vitest/config";

export default defineConfig({
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
