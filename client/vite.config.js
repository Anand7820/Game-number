import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/count-text": "http://localhost:3000",
      "/count-image": "http://localhost:3000",
    },
  },
});
