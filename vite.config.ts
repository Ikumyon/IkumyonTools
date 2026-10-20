import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync } from "node:fs";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [{
    name: "tool-static-files",
    generateBundle() {
      const emitDirectory = (directory: string): void => {
        for (const entry of readdirSync(resolve(rootDir, directory), { withFileTypes: true })) {
          const path = `${directory}/${entry.name}`;
          if (entry.isDirectory()) emitDirectory(path);
          else this.emitFile({ type: "asset", fileName: path, source: readFileSync(resolve(rootDir, path)) });
        }
      };
      emitDirectory("tools");
      emitDirectory("assets");
    },
  }],
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        tool: resolve(rootDir, "tool.html"),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
