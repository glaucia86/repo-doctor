import { existsSync, rmSync } from "node:fs";
import { dirname } from "node:path";
import type { BuiltExportArtifact } from "./exportService.js";
import { InMemoryJobRegistry } from "./jobRegistry.js";

export class CleanupService {
  private readonly artifactDirs = new Set<string>();

  registerArtifact(artifact: BuiltExportArtifact): void {
    this.artifactDirs.add(dirname(artifact.filePath));
  }

  cleanupArtifacts(): void {
    for (const dir of this.artifactDirs) {
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
    this.artifactDirs.clear();
  }

  hookIntoRegistry(registry: InMemoryJobRegistry): () => void {
    return registry.subscribe((_event, job) => {
      if (job.state === "completed" || job.state === "cancelled") {
        this.cleanupArtifacts();
      }
    });
  }
}
