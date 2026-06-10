import { createServer } from "node:http";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";
import { initRealtime } from "./services/realtime.service.js";

async function shutdown(code: number) {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(code);
}

async function bootstrap() {
  await connectDatabase();

  const server = createServer(app);
  initRealtime(server, env.clientOrigin);

  server.on("error", async (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${env.port} is already in use. Stop the other process or change PORT in server/.env.`
      );
      await shutdown(1);
      return;
    }

    throw error;
  });

  server.listen(env.port, () => {
    console.log(`NexusCRM API running on http://localhost:${env.port}`);
  });
}

void bootstrap().catch(async (error) => {
  console.error("Failed to start server:", error);
  await shutdown(1);
});
