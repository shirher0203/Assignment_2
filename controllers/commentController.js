const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Get all comments by postId
const getCommentsByPost = async (req, res) => {
	const { postId } = req.params;
	try {
		const comments = await Comment.find({ postId });
		res.status(200).json(comments);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};
// Get comment by id
const getCommentById = async (req, res) => {
	const { id } = req.params;
	try {
		const comment = await Comment.findById(id);
		if (!comment) {
			return res.status(404).json({ message: 'Comment not found' });
		}
		res.status(200).json(comment);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};



// Update comment message only
const updateComment = async (req, res) => {
	const { id } = req.params;
	const { message } = req.body;
	try {
		const updated = await Comment.findByIdAndUpdate(
			id,
			{ message },
			{ new: true }
		);
		if (!updated) {
			return res.status(404).json({ message: 'Comment not found' });
		}
		res.status(200).json(updated);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};


// Create a new comment
const addComment = async (req, res) => {
	const content = req.body;
	try {
		// Check if postId exists
		const post = await Post.findById(content.postId);
		if (!post) {
			return res.status(404).json({ message: 'Post not found for this comment' });
		}
		const response = await Comment.create(content);
		res.status(201).json(response);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};
// Delete comment by id
const deleteComment = async (req, res) => {
	const { id } = req.params;
	try {
		const deleted = await Comment.findByIdAndDelete(id);
		if (!deleted) {
			return res.status(404).json({ message: 'Comment not found' });
		}
		res.status(200).json({ message: 'Comment deleted successfully' });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};



module.exports = { 
    addComment,
    updateComment,
    deleteComment,
    getCommentById,
    getCommentsByPost 
};
