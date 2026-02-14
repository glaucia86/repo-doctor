import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { printError, printInfo, printSuccess } from "../ui/index.js";

const isDirectExecution = (): boolean => {
  const argvPath = process.argv[1];
  if (!argvPath) return false;
  return resolve(argvPath) === resolve(fileURLToPath(import.meta.url));
};

const readPortFromEnv = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) return fallback;
  return parsed;
};

const mimeByExt: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".ts": "text/javascript; charset=utf-8",
  ".tsx": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

type TransformSync = (code: string, options: { loader: "jsx" | "ts" | "tsx"; format: "esm"; target: string }) => {
  code: string;
};

const require = createRequire(import.meta.url);
let transformSource: TransformSync | null = null;

try {
  const esbuild = require("esbuild") as { transformSync?: TransformSync };
  if (typeof esbuild.transformSync === "function") {
    transformSource = esbuild.transformSync;
  }
} catch {
  transformSource = null;
}

export function startLocalWebServer(port: number = 4173, apiBaseUrl: string = "http://localhost:3001"): void {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(currentDir, "public");

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const safePath = requestedPath.replace(/\.\./g, "");
    let filePath = join(publicDir, safePath);

    try {
      let transformLoader: "jsx" | "ts" | "tsx" | null = null;
      if (safePath === "/app.js") {
        const tsxPath = join(publicDir, "app.tsx");
        if (existsSync(tsxPath)) {
          filePath = tsxPath;
          transformLoader = "tsx";
        } else {
          transformLoader = "jsx";
        }
      } else if (safePath.endsWith(".tsx")) {
        transformLoader = "tsx";
      } else if (safePath.endsWith(".ts")) {
        transformLoader = "ts";
      }

      let content = readFileSync(filePath, "utf8");
      if (safePath === "/index.html") {
        content = content.replace("__API_BASE_URL__", apiBaseUrl);
      }
      if (transformLoader && transformSource) {
        content = transformSource(content, {
          loader: transformLoader,
          format: "esm",
          target: "es2020",
        }).code;
      }
      res.statusCode = 200;
      res.setHeader("content-type", mimeByExt[extname(filePath)] ?? "text/plain; charset=utf-8");
      res.end(content);
    } catch {
      res.statusCode = 404;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Not found");
    }
  });

  server.listen(port, () => {
    printSuccess(`Local Web server running at http://localhost:${port}`);
    printInfo(`Connected API base URL: ${apiBaseUrl}`);
  });
}

if (isDirectExecution()) {
  try {
    const port = readPortFromEnv(process.env.REPO_DOCTOR_WEB_PORT, 4173);
    const apiBase = process.env.REPO_DOCTOR_API_BASE_URL || "http://localhost:3001";
    startLocalWebServer(port, apiBase);
  } catch (error) {
    printError(error instanceof Error ? error.message : "Failed to start local web server.");
    process.exit(1);
  }
}
