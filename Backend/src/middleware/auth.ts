import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

type JwtPayload = {
  sub: string;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing Authorization header"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    const sub = (decoded.sub ?? (decoded as unknown as JwtPayload).sub) as string | undefined;

    if (!sub) {
      return next(new HttpError(401, "Invalid token"));
    }

    req.user = { id: sub };
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
}
