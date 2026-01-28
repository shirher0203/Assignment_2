import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

//get all comments
const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find();
    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Error fetching comments");
  }
};

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
const updateComment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "comment not found" });

    // give permission only to the sender
    if (comment.sender.toString() !== req.user._id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (message !== undefined) comment.message = message;

    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(400).send("Error updating comment");
  }
};

// Create a new comment
const addComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { message, postId } = req.body;
    // Check if postId exists
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found for this comment" });
    }
    const response = await Comment.create({
      sender: req.user._id,
      postId,
      message,
    });
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).send("Error creating comment");
  }
};
// Delete comment by id
const deleteComment = async (req: AuthRequest, res: Response) => {
  const commentId = req.params.id;
  try {
    // validate id
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    // find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // auth check – only sender can delete
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (comment.sender.toString() !== req.user._id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // delete the comment
    await Comment.deleteOne({ _id: comment._id });

    return res.status(200).json({ message: "comment deleted" });
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
  getAllComments,
};
