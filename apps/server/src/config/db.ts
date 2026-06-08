import mongoose from "mongoose";
import { env } from "./env.js";

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
  } catch {
    console.error("Primary MongoDB connection failed.");
    throw new Error("Unable to connect to MongoDB.");
  }

  return mongoose.connection;
}
