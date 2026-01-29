import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";

dotenv.config({ path: ".env.dev" });


beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase");
    if (mongoose.connection.db) await mongoose.connection.db.dropDatabase();
});
