const Post = require('../models/Post');

// Create a new post
const createPost = async (req, res) => {
    content = req.body;
    try {
        const response = await Post.create(content);
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get posts
const getPosts = async (req, res) => {
    const filter = req.query;
    try {
        if(filter.sender){
            const posts = await Post.find({ sender: filter.sender });
            return res.status(200).json(posts);
        } else {
            const posts = await Post.find();
            return res.status(200).json(posts);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPostById = async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return  res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePostById = async (req, res) => {
    const updates = req.body;
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePostById
};