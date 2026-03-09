import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function manualChunks(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  if (id.includes("three/examples") || /[\\/]node_modules[\\/]three[\\/]/.test(id)) {
    return "three-vendor";
  }

  if (id.includes("react-router") || id.includes("@remix-run")) {
    return "router-vendor";
  }

  if (id.includes("@radix-ui")) {
    return "radix-vendor";
  }

  if (id.includes("@tanstack/react-query")) {
    return "query-vendor";
  }

  if (id.includes("framer-motion") || id.includes("motion")) {
    return "motion-vendor";
  }

  if (id.includes("lucide-react")) {
    return "icons-vendor";
  }

  return "vendor";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,  //"::",
    port: 8080,
    watch: {
      usePolling: true,
      interval: 100
    },
    allowedHosts: [
      "victor-aphorismic-venally.ngrok-free.dev"
    ],
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks,
        chunkFileNames: "assets/[name]-[hash].js",
      },
    },
  },
}));