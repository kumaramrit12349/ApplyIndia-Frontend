import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react-quill-new") || id.includes("/quill/")) {
            return "editor";
          }

          if (id.includes("react-dom") || id.includes("react-router-dom") || id.includes("react")) {
            return "react-vendor";
          }

          if (id.includes("react-bootstrap") || id.includes("/bootstrap/")) {
            return "bootstrap-vendor";
          }

          if (id.includes("react-icons")) {
            return "icons";
          }

          if (id.includes("react-toastify")) {
            return "toast";
          }
        },
      },
    },
  },
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
