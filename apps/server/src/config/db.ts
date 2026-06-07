import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";

let memoryServer: MongoMemoryServer | null = null;

async function connectToMongo(uri: string) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
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
      memoryServer = await MongoMemoryServer.create();
    }

    await connectToMongo(memoryServer.getUri("nexuscrm"));
  }

  return mongoose.connection;
}
