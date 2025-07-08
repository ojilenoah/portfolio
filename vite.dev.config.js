import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config.ts";

export default mergeConfig(
  baseConfig,
  defineConfig({
    server: {
      port: 5000,
      host: "0.0.0.0",
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        ".replit.dev",
        ".repl.co",
        ".spock.replit.dev",
        ".kirk.replit.dev",
        "71e282dc-7ccf-4fa6-98e2-048de11beadf-00-33wxygxbkc2jc.spock.replit.dev",
        "c4faa0ab-defb-452d-aadb-f2180c9e6895-00-39u9n8gtp7yf5.kirk.replit.dev",
      ],
    },
  }),
);
