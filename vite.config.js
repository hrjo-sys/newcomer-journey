import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the repo name for GitHub Pages project sites
// e.g. https://<user>.github.io/Newcomer-Journey/
export default defineConfig({
  plugins: [react()],
  base: "/newcomer-journey/",
});
