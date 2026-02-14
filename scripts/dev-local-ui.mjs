import { spawn } from "node:child_process";
import { createServer } from "node:net";

const children = [];
let shuttingDown = false;

const isPortFree = (port) =>
  new Promise((resolve) => {
    const tester = createServer();
    tester.once("error", () => resolve(false));
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    // Probe using the default host so conflicts on ::/0.0.0.0 are detected.
    tester.listen(port);
  });

const findFreePort = async (startPort, attempts = 20) => {
  for (let offset = 0; offset < attempts; offset += 1) {
    const port = startPort + offset;
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found from ${startPort} to ${startPort + attempts - 1}.`);
};

const run = (label, scriptName, env = {}) => {
  const child = spawn(`npm run ${scriptName}`, {
    stdio: "inherit",
    env: { ...process.env, ...env },
    shell: true,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const processChild of children) {
      if (!processChild.killed) processChild.kill("SIGINT");
    }
    const exitCode = typeof code === "number" ? code : signal ? 1 : 0;
    console.error(`[${label}] exited (${signal || exitCode}). Shutting down other process.`);
    process.exit(exitCode);
  });

  children.push(child);
  return child;
};

const bootstrap = async () => {
  const apiPort = await findFreePort(3001);
  const webPort = await findFreePort(4173);
  const apiBase = `http://localhost:${apiPort}`;

  console.log(`[dev:local-ui] API port: ${apiPort} | Web port: ${webPort}`);
  if (apiPort !== 3001) {
    console.log("[dev:local-ui] Port 3001 is busy. Using next available API port.");
  }
  if (webPort !== 4173) {
    console.log("[dev:local-ui] Port 4173 is busy. Using next available Web port.");
  }

  run("api", "dev:web-ui:api", { REPO_DOCTOR_API_PORT: String(apiPort) });
  run("web", "dev:web-ui", { REPO_DOCTOR_WEB_PORT: String(webPort), REPO_DOCTOR_API_BASE_URL: apiBase });
};

bootstrap().catch((error) => {
  console.error(`[dev:local-ui] Failed to start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

const shutdown = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGINT");
  }
  setTimeout(() => process.exit(0), 120);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
