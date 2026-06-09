import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: {}
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error("Unhandled server error:", {
    method: req.method,
    url: req.originalUrl,
    error: err instanceof Error ? { message: err.message, stack: err.stack } : err
  });

  const errorMessage = err instanceof Error ? err.message : "Internal server error.";
  const stack = process.env.NODE_ENV === "development" && err instanceof Error ? err.stack : undefined;

  return res.status(500).json({
    success: false,
    message: errorMessage || "Internal server error.",
    stack,
    data: {}
  });
}
