import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
  message: { type: String, required: true, trim: true },
  sender: { type: String, required: true, trim: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", commentSchema);
