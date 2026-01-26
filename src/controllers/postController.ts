import { Request, Response } from "express";
import Post from "../models/Post";

// Create a new post
const createPost = async (req: Request, res: Response) => {
  const content = req.body;
  try {
    const response = await Post.create(content);
    res.status(201).json(response);
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

const updatePostById = async (req: Request, res: Response) => {
  const updates = req.body;
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(400).send("Error updating post");
  }
};

export default {
  createPost,
  getPosts,
  getPostById,
  updatePostById,
};
