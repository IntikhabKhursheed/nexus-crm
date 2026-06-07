import type { Response } from "express";

type ApiPayload<T> = {
  success: true;
  message: string;
  data: T;
};

export function sendResponse<T>(res: Response, statusCode: number, message: string, data: T) {
  const payload: ApiPayload<T> = {
    success: true,
    message,
    data
  };

  return res.status(statusCode).json(payload);
}
