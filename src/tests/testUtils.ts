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
  email: "test@test.com",
  password: "testpassword",
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
  title: "post A",
  message: "hello this is my first post",
};

export type CommentsData = {
  message: string;
  postId?: string;
  sender?: string;
  _id?: string;
};

export const commentsData: CommentsData[] = [
  { message: "great post!" },
  { message: "good!" },
  { message: "like it" },
];

export const registerTestUser = async (app: Express) => {
  await User.deleteMany({ email: userData.email });

  const res = await request(app).post("/auth/register").send({
    email: userData.email,
    password: userData.password,
  });
  userData._id = res.body.userId;
  userData.token = res.body.token;
  userData.refreshToken = res.body.refreshToken;
};

export const fakeUserId = new mongoose.Types.ObjectId().toString();

export const fakeToken = jwt.sign(
  { userId: fakeUserId },
  process.env.JWT_SECRET!,
  { expiresIn: "1h" },
);
