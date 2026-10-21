import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync } from "node:fs";
import { defineConfig } from "vite";
import { toolCatalog } from "./scripts/tool-catalog.mjs";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [{
    name: "tool-static-files",
    buildStart() { toolCatalog(rootDir); },
    configureServer(server) {
      server.middlewares.use('/tools-catalog.json', (_request, response) => {
        try {
          response.setHeader('Content-Type', 'application/json');
          response.setHeader('Cache-Control', 'no-store');
          response.end(JSON.stringify(toolCatalog(rootDir)));
        } catch (error) {
          response.statusCode = 500;
          response.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'tools-catalog.json', source: JSON.stringify(toolCatalog(rootDir)) });
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
