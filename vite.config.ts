import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { designVersionsPlugin } from "./vite-plugin-versions"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), designVersionsPlugin()],
  server: {
    watch: {
      // Prevent reload loop: VersionContext POSTs to API which writes this file
      ignored: ["**/public/design-versions.json"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
