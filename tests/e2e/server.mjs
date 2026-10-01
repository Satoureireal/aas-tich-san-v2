import { createApp } from "../../server.mjs";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const base = join(tmpdir(), "opencode");
await mkdir(base, { recursive: true });
const dataDir = await mkdtemp(join(base, "aas-v2-e2e-"));
const server = createApp({ dataDir });
server.listen(3102, "127.0.0.1");
async function cleanup() {
  server.closeAllConnections();
  server.close();
  await rm(dataDir, { recursive: true, force: true });
  process.exit(0);
}
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
