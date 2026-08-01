import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Ensures each React component test starts with a clean DOM,
// so queries like getByRole never match leftovers from a previous test.
afterEach(() => {
  cleanup();
});
