import { Request, Response } from "express";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";
import Comment from "../models/Comment";

// Create a new post
const createPost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { message, title } = req.body;
    // Always use user id from token as sender
    const post = await Post.create({
      sender: req.user._id,
      message,
      title,
    });
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(400).send("Error creating post");
  }
};

// Get posts
const getPosts = async (req: Request, res: Response) => {
  const filter = req.query;
  try {
    if (filter.sender) {
      const posts = await Post.find({ sender: filter.sender });
      return res.status(200).json(posts);
    } else {
      const posts = await Post.find();
      return res.status(200).json(posts);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Error fetching posts");
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Error fetching post");
  }
};

const updatePostById = async (req: AuthRequest, res: Response) => {
  const postId = req.params.id;
  const { title, message } = req.body;
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // give permission only to the sender
    if (post.sender.toString() !== req.user._id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (title !== undefined) post.title = title;
    if (message !== undefined) post.message = message;

    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(400).send("Error updating post");
  }
};

const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;

    // validate id
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    // find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // auth check – only sender can delete
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (post.sender.toString() !== req.user._id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // delete all comments of this post
    await Comment.deleteMany({ postId: post._id });

    // delete post
    await Post.deleteOne({ _id: post._id });

    return res
      .status(200)
      .json({ message: "Post and associated comments deleted" });
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    return res.status(400).json({ message: "Failed to delete post" });
  }
};

export default {
  createPost,
  getPosts,
  getPostById,
  updatePostById,
  deletePost,
};
