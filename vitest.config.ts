import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Tests import domain source directly so they do not depend on a prior build.
const domainAlias = {
  "@weather/domain": path.resolve(__dirname, "packages/domain/src"),
};

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "packages/domain/src/**/*.ts",
        "apps/api/src/**/*.ts",
        "apps/web/src/components/**/*.tsx",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/types.ts",
        "**/index.ts",
        "**/main.ts",
        "**/*.module.ts",
      ],
    },
    // Two projects because domain/API tests run in plain Node, while React
    // component tests need a browser-like DOM (jsdom).
    projects: [
      {
        resolve: { alias: domainAlias },
        test: {
          name: "node",
          environment: "node",
          include: [
            "packages/**/*.test.ts",
            "apps/api/src/**/*.spec.ts",
          ],
        },
      },
      {
        plugins: [react()],
        resolve: { alias: domainAlias },
        test: {
          name: "web",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["apps/web/src/**/*.test.tsx"],
        },
      },
    ],
  },
});
