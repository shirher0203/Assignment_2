require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// read json from request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// define routes
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
app.use('/post', postRoutes);
app.use('/comment', commentRoutes);

// start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});