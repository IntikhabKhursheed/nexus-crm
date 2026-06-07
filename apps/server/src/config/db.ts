import mongoose from "mongoose";
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";

// Windows system DNS often refuses SRV lookups needed by mongodb+srv URIs.
if (env.mongoUri.startsWith("mongodb+srv://")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

let memoryServer: MongoMemoryServer | null = null;
const cachedMongoBinary = path.join(
  os.homedir(),
  ".cache",
  "mongodb-binaries",
  "mongod-x64-win32-8.2.6.exe"
);
const localMongoUri = "mongodb://127.0.0.1:27017/nexuscrm";
const persistentFallbackPath = path.resolve(process.cwd(), ".mongo-data");

async function connectToMongo(uri: string) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: uri.startsWith("mongodb+srv://") ? 15000 : 5000
  });
}

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await connectToMongo(env.mongoUri);
  } catch (error) {
    if (env.nodeEnv === "production") {
      throw error;
    }

    console.warn("Primary MongoDB connection failed. Falling back to an embedded local MongoDB instance.");

    if (!memoryServer) {
      fs.mkdirSync(persistentFallbackPath, { recursive: true });

      const createFallbackServer = (port?: number) =>
        MongoMemoryServer.create({
          binary: fs.existsSync(cachedMongoBinary)
            ? {
                systemBinary: cachedMongoBinary
              }
            : undefined,
          instance: {
            port,
            dbPath: persistentFallbackPath
          }
        });

      try {
        memoryServer = await createFallbackServer(27017);
        console.info(`Using persistent local MongoDB fallback at ${localMongoUri}.`);
      } catch (fallbackError) {
        console.warn("Persistent local MongoDB fallback on port 27017 failed. Starting a temporary fallback instead.");
        memoryServer = await createFallbackServer();
      }
    }

    await connectToMongo(memoryServer.getUri("nexuscrm"));
  }

  return mongoose.connection;
}
