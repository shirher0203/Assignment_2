const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// create post
router.post('/', postController.createPost);

// get all posts or posts by sender
router.get('/', postController.getPosts);

// get post by id
router.get('/:id', postController.getPostById);

// update post by id
router.put('/:id', postController.updatePostById);

module.exports = router;