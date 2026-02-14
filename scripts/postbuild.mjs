import { chmodSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";

const currentDir = dirname(fileURLToPath(import.meta.url));
const target = resolve(currentDir, "..", "dist", "index.js");
const webPublicSource = resolve(currentDir, "..", "src", "presentation", "web", "public");
const webPublicTarget = resolve(currentDir, "..", "dist", "web", "public");

if (!existsSync(target)) {
  process.exit(0);
}

if (platform() !== "win32") {
  chmodSync(target, 0o755);
}

if (existsSync(webPublicSource)) {
  mkdirSync(resolve(currentDir, "..", "dist", "web"), { recursive: true });
  cpSync(webPublicSource, webPublicTarget, { recursive: true });
}
