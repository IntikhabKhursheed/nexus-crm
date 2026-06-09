import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true
  })
);
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "NexusCRM API is healthy.",
    data: {
      uptime: process.uptime()
    }
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
