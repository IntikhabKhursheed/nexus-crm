import { createServer } from "node:http";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

type TestContext = {
  mongo: MongoMemoryServer;
  server: ReturnType<typeof createServer>;
  baseUrl: string;
  connectDatabase: () => Promise<unknown>;
  app: typeof import("../app.js")["app"];
  User: typeof import("../models/User.js")["User"];
  Organization: typeof import("../models/Organization.js")["Organization"];
  Membership: typeof import("../models/Membership.js")["Membership"];
  Contact: typeof import("../models/Contact.js")["Contact"];
  signAccessToken: typeof import("../utils/jwt.js")["signAccessToken"];
};

export async function createTestContext(): Promise<TestContext> {
  process.env.NODE_ENV = "test";
  process.env.PORT = "0";
  process.env.CLIENT_ORIGIN = "http://localhost:3000";
  process.env.CLIENT_ORIGINS = "http://localhost:3000";
  process.env.GROQ_API_KEY = "test-groq-key";
  process.env.MONGODB_URI = process.env.MONGODB_URI ?? "";
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  process.env.STRIPE_SECRET_KEY = "test-stripe-secret";
  process.env.GMAIL_USER = "test@example.com";
  process.env.GMAIL_APP_PASSWORD = "test-password";
  process.env.WEEKLY_DIGEST_FROM = "test@example.com";

  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("nexuscrm-test");

  const [{ connectDatabase }, { app }, { User }, { Organization }, { Membership }, { Contact }, { signAccessToken }] =
    await Promise.all([
      import("../config/db.js"),
      import("../app.js"),
      import("../models/User.js"),
      import("../models/Organization.js"),
      import("../models/Membership.js"),
      import("../models/Contact.js"),
      import("../utils/jwt.js")
    ]);

  await connectDatabase();

  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;

  return {
    mongo,
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    connectDatabase,
    app,
    User,
    Organization,
    Membership,
    Contact,
    signAccessToken
  };
}

export async function closeTestContext(context: TestContext) {
  await new Promise<void>((resolve) => {
    context.server.close(() => resolve());
  });
  await mongoose.disconnect();
  await context.mongo.stop();
}
