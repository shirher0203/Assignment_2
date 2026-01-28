import express from "express";
import postController from "../controllers/postController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// create post
router.post("/", authMiddleware, postController.createPost);

// get all posts or posts by sender
router.get("/", postController.getPosts);

// get post by id
router.get("/:id", postController.getPostById);

// update post by id
router.put("/:id", authMiddleware, postController.updatePostById);

// delete post by id
router.delete("/:id", authMiddleware, postController.deletePost);

export default router;
