import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const message = err?.message || "Internal server error";
  res.status(400).json({ message });
};