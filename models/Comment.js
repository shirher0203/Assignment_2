const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	message: { type: String, required: true, trim: true },
	sender: { type: String, required: true, trim: true },
	postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
