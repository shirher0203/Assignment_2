import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import bcrypt from "bcrypt";

// Get user by ID

export const getUserById = async (req: Request, res: Response) => {
  //
  try {
    const user = await User.findById(req.params.id).select("-password -refreshTokens");
    if (!user) {
      //
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    //
    res.status(400).json({ message: "Invalid user ID" });
  }
};

// Update user details
export const updateUser = async (req: Request, res: Response) => {
  try {
    // Authorization check: only the user can update their own data
    if (req.user?._id !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const updateData: Partial<IUser> = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select("-password -refreshTokens");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: "Invalid update data" });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    // Authorization check: only the user can delete their own account
    if (req.user?._id !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid user ID" });
  }
};
