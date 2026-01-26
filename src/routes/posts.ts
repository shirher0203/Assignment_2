import express from "express";
import postController from "../controllers/postController";

const router = express.Router();

// create post
router.post("/", postController.createPost);

// get all posts or posts by sender
router.get("/", postController.getPosts);

// get post by id
router.get("/:id", postController.getPostById);

// update post by id
router.put("/:id", postController.updatePostById);

export default router;
