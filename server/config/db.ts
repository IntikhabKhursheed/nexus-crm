import mongoose from "mongoose";
import dns from "node:dns";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";

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

      try {
        memoryServer = await MongoMemoryServer.create({
          binary: fs.existsSync(cachedMongoBinary) ? { systemBinary: cachedMongoBinary } : undefined,
          instance: {
            port: 27017,
            dbPath: persistentFallbackPath
          }
        });
      } catch {
        memoryServer = await MongoMemoryServer.create({
          binary: fs.existsSync(cachedMongoBinary) ? { systemBinary: cachedMongoBinary } : undefined
        });
      }

      console.info("Using local MongoDB fallback.");
    }

    await connectToMongo(memoryServer.getUri("nexuscrm"));
  }

  return mongoose.connection;
}
