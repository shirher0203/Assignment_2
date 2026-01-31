import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthRequest = Request & { user?: { _id: string } };


const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  //
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const tokenSecret = process.env.JWT_SECRET || "test_secret_key_123";
    try {
      const decoded = jwt.verify(token, tokenSecret) as { userId: string };
      (req as any).user = { _id: decoded.userId };
      //
      next();
    } catch (err) {
      //
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    //
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
