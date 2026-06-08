import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

async function isHealthyServerRunning(port: number) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { success?: boolean; status?: string };
    return payload.success === true || payload.status === "ok";
  } catch {
    return false;
  }
}

async function bootstrap() {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`NexusCRM API running on port ${env.port}`);
  });

  server.on("error", async (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      const alreadyRunning = await isHealthyServerRunning(env.port);

      if (alreadyRunning) {
        console.log(`NexusCRM API is already running on port ${env.port}. Reusing the existing server.`);
        process.exit(0);
        return;
      }

      console.error(
        `Port ${env.port} is already in use, but no healthy NexusCRM server responded on /health. Stop the existing process and try again.`
      );
      process.exit(1);
      return;
    }

    throw error;
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
