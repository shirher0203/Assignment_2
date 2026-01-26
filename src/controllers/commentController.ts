import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";

// Get all comments by postId
const getCommentsByPost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ postId });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Error fetching comments");
  }
};
// Get comment by id
const getCommentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).send("Error fetching comment");
  }
};

// Update comment message only
const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  try {
    const updated = await Comment.findByIdAndUpdate(
      id,
      { message },
      { new: true },
    );
    if (!updated) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(400).send("Error updating comment");
  }
};

// Create a new comment
const addComment = async (req: Request, res: Response) => {
  const content = req.body;
  try {
    // Check if postId exists
    const post = await Post.findById(content.postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found for this comment" });
    }
    const response = await Comment.create(content);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).send("Error creating comment");
  }
};
// Delete comment by id
const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await Comment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(400).send("Error deleting comment");
  }
};

export default {
  getCommentsByPost,
  getCommentById,
  addComment,
  updateComment,
  deleteComment,
};
