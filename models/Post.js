const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    sender: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);