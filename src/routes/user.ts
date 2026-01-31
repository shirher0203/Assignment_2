import express from "express";
import { getUserById, updateUser, deleteUser } from "../controllers/UserController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// All routes are protected by authMiddleware

router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
