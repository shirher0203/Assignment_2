import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// send error response helper
const sendError = (res: Response, message: string) => {
  res.status(400).json({ error: message });
};

// generate JWT token helper
const generateToken = (userId: string): string => {
  const secret: string = process.env.JWT_SECRET || "default_secret";
  const exp = Number(process.env.JWT_EXPIRES_IN) || 3600;
  return jwt.sign({ userId }, secret, { expiresIn: exp });
};

const register = async (req: Request, res: Response): Promise<void> => {
  // extract user details from req.body
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, "Email and password are required");
  }

  try {
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // create new user in db with hashed password
    const user = await User.create({ email, password: hashedPassword });

    // generate auth token
    const token = generateToken(user._id.toString());

    //send token to user
    res.status(201).json({ token: token });
  } catch {
    return sendError(res, "Error registering user");
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required");
  }

  try {
    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, "Invalid email or password");
    }
    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password");
    }
    // generate auth token
    const token = generateToken(user._id.toString());

    //send token to user
    res.status(200).json({ token: token });
  } catch {
    return sendError(res, "Error logging in user");
  }
};

export default {
  register,
  login,
};
