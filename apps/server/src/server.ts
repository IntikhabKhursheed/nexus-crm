import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

async function bootstrap() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`NexusCRM API running on port ${env.port}`);
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
