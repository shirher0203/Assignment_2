import express from "express";
import commentController from "../controllers/commentController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

//get all comments
router.get("/", commentController.getAllComments);

// get all comments by postId
router.get("/post/:postId", commentController.getCommentsByPost);

// get comment by id
router.get("/:id", commentController.getCommentById);

// create comment
router.post("/", authMiddleware, commentController.addComment);

// update comment message only
router.put("/:id", authMiddleware, commentController.updateComment);

// delete comment by id
router.delete("/:id", authMiddleware, commentController.deleteComment);

export default router;
