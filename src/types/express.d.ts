import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string } & Partial<IUser>;
    }
  }
}

export {};
