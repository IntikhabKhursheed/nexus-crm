import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: {}
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
    data: {}
  });
}
