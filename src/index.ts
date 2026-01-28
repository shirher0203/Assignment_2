import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";
import authRoutes from "./routes/auth";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/auth", authRoutes);

const initApp = (): Promise<Express> => {
  const pr = new Promise<Express>((resolve, reject) => {
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!MONGO_URI) {
      reject(new Error("Missing MongoDB URI"));
      return;
    }

    mongoose
      .connect(MONGO_URI)
      .then(() => {
        resolve(app);
      })
      .catch(reject);
  });

  const db = mongoose.connection;
  db.on("error", (error) => console.error(error));
  db.once("open", () => console.log("Connected to MongoDB"));

  return pr;
};

export default initApp;
