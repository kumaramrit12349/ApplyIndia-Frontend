import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/auth": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // We need to keep the path as is
        bypass: (req) => {
          // Do not proxy the React frontend callback route
          if (req.url?.startsWith("/auth/callback")) {
            return req.url;
          }
        },
      },
    },
  },
});
