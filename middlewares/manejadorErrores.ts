import type { Request, Response, NextFunction } from "express";

export function manejadorErrores(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error(err.message);
  res.status(500).json({ error: "Algo salió mal" });
}
