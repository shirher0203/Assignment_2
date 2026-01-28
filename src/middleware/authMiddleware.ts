import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthRequest = Request & { user?: { _id: string } };

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secretkey";

    try {
      const decoded = jwt.verify(token, secret) as { userId: string };
      req.user = { _id: decoded.userId };
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
