import mongoose from "mongoose";
import dns from "node:dns";
import { env } from "./env.js";

if (env.mongoUri.startsWith("mongodb+srv://")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000
  });

  const cluster = env.mongoUri.includes("@") ? env.mongoUri.split("@")[1]?.split("/")[0] : mongoose.connection.host;
  console.info(`MongoDB connected: ${cluster}/${mongoose.connection.name}`);
  return mongoose.connection;
}
