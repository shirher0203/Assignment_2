import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import Comment from "../models/Comment";
import User from "../models/User";

let app: Express;
let token: string = "";
let otherToken: string = "";
let postId: string = "";
const email = `comm${Date.now()}@test.com`;
const otherEmail = `other${Date.now()}@test.com`;

beforeAll(async () => {
    process.env.JWT_SECRET = "test_secret_key_123";
    app = await initApp();
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await User.deleteMany({ email: { $in: [email, otherEmail] } });

    // 1. Register main user
    const userRes = await request(app).post("/auth/register").send({ 
        email, password: "password123", username: "commuser" 
    });
    token = userRes.body.accessToken || userRes.body.token;

    // 2. Register another user for permission testing (403)
    const otherRes = await request(app).post("/auth/register").send({ 
        email: otherEmail, password: "password123", username: "otheruser" 
    });
    otherToken = otherRes.body.accessToken || otherRes.body.token;

    // 3. Create a Post
    const postRes = await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + token)
        .send({ title: "Post", message: "Body" });
    postId = postRes.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Comments API Extended Coverage", () => {
    let commentId: string = "";

    test("Get all comments - empty (200)", async () => {
        const res = await request(app).get("/comment");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Create Comment - success (201)", async () => {
        const res = await request(app)
            .post("/comment")
            .set("Authorization", "Bearer " + token)
            .send({ message: "Test Comment", postId });
        expect(res.statusCode).toBe(201);
        commentId = res.body._id;
    });

    test("Create Comment - post not found (404)", async () => {
        const fakePostId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .post("/comment")
            .set("Authorization", "Bearer " + token)
            .send({ message: "Fail", postId: fakePostId });
        expect(res.statusCode).toBe(404);
    });

    test("Get Comment By ID - success (200)", async () => {
        const res = await request(app).get(`/comment/${commentId}`);
        expect(res.statusCode).toBe(200);
    });

    test("Get Comment By ID - not found (404)", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).get(`/comment/${fakeId}`);
        expect(res.statusCode).toBe(404);
    });

    test("Update Comment - success (200)", async () => {
        const res = await request(app)
            .put(`/comment/${commentId}`)
            .set("Authorization", "Bearer " + token)
            .send({ message: "Updated message" });
        expect(res.statusCode).toBe(200);
    });

    test("Update Comment - Forbidden (403)", async () => {
        const res = await request(app)
            .put(`/comment/${commentId}`)
            .set("Authorization", "Bearer " + otherToken)
            .send({ message: "Should fail" });
        expect(res.statusCode).toBe(403);
    });

    test("Delete Comment - Invalid ID (400)", async () => {
        const res = await request(app)
            .delete("/comment/123")
            .set("Authorization", "Bearer " + token);
        expect(res.statusCode).toBe(400);
    });

    test("Delete Comment - Forbidden (403)", async () => {
        const res = await request(app)
            .delete(`/comment/${commentId}`)
            .set("Authorization", "Bearer " + otherToken);
        expect(res.statusCode).toBe(403);
    });

    test("Delete Comment - success (200)", async () => {
        const res = await request(app)
            .delete(`/comment/${commentId}`)
            .set("Authorization", "Bearer " + token);
        expect(res.statusCode).toBe(200);
    });
});