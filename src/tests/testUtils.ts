import { Express } from "express";
import request from "supertest";
import User from "../models/User";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

type UserData = {
  email: string;
  password: string;
  _id?: string;
  token?: string;
  refreshToken?: string;
};

export const userData: UserData = {
  email: "test@testMovies.com",
  password: "testpasswordMovies",
};

export type PostData = {
  title: string;
  message: string;
  _id?: string;
  sender?: string; // userId
};

export const postsData: PostData[] = [
  { title: "first post", message: "hello this is my first post" },
  { title: "second post", message: "hello this is my second post" },
  { title: "third post", message: "hello this is my third post" },
];

export const singlePostData: PostData = {
  title: "Movie A",
  message: "hello this is my first post",
};

export type CommentsData = {
  message: string;
  movieId: string;
  writerId?: string;
  _id?: string;
};

export const commentsData: CommentsData[] = [
  { message: "Great movie!", movieId: "movie1" },
  { message: "Loved it!", movieId: "movie1" },
  { message: "Not bad.", movieId: "movie2" },
  { message: "Worst movie ever.", movieId: "movie2" },
  { message: "Could be better.", movieId: "movie3" },
];

export const registerTestUser = async (app: Express) => {
  await User.deleteMany({ email: userData.email });

  const res = await request(app).post("/auth/register").send({
    email: userData.email,
    password: userData.password,
  });
  userData._id = res.body.userId;
  userData.token = res.body.token;
};

export const fakeUserId = new mongoose.Types.ObjectId().toString();

export const fakeToken = jwt.sign(
  { userId: fakeUserId },
  process.env.JWT_SECRET!,
  { expiresIn: "1h" },
);
