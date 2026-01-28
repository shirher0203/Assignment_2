import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// send error response helper
const sendError = (res: Response, message: string) => {
  res.status(400).json({ error: message });
};

type Tokens = {
  token: string;
  refreshToken: string;
};

type JwtPayload = {
  userId: string;
};
// generate JWT token helper
const generateToken = (userId: string): Tokens => {
  const secret: string = process.env.JWT_SECRET || "default_secret";
  const exp = Number(process.env.JWT_EXPIRES_IN) || 3600;
  const refreshexp = Number(process.env.JWT_REFRESH_EXPIRES_IN) || 86400;
  const token = jwt.sign({ userId }, secret, { expiresIn: exp });
  const refreshToken = jwt.sign({ userId }, secret, { expiresIn: refreshexp });
  return { token, refreshToken };
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
    const user = await User.create({ email, password: hashedPassword });

    // generate auth token
    const tokens = generateToken(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    const userId = user._id.toString();

    //send tokens to user
    res.status(201).json({
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      userId: userId,
    });
  } catch {
    return sendError(res, "Error registering user");
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // check if email and password are provided
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
    const tokens = generateToken(user._id.toString());

    //send tokens to user
    res
      .status(200)
      .json({ token: tokens.token, refreshToken: tokens.refreshToken });
  } catch {
    return sendError(res, "Error logging in user");
  }
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(res, "Refresh token is required");
  }

  try {
    const secret: string = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(refreshToken, secret) as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, "Invalid refresh token");
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      // remove all refresh tokens for security
      user.refreshTokens = [];
      await user.save();
      return sendError(res, "Invalid refresh token");
    }

    // generate new tokens
    const tokens = generateToken(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    // remove old refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );
    await user.save();
    res
      .status(200)
      .json({ token: tokens.token, refreshToken: tokens.refreshToken });
  } catch {
    return sendError(res, "Error refreshing token");
  }
};

export default {
  register,
  login,
  refreshToken,
};
