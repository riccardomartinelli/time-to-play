import { defineConfig } from "tsup";

// @ttp/shared ships TypeScript sources, so it must be bundled into the server build.
export default defineConfig({
  noExternal: ["@ttp/shared"],
});
