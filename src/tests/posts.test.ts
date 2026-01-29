import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import User from "../models/User";

let app: Express;
let token: string = "";
let otherToken: string = "";
const email = `post${Date.now()}@test.com`;
const otherEmail = `other_post${Date.now()}@test.com`;

beforeAll(async () => {
    process.env.JWT_SECRET = "test_secret_key_123";
    app = await initApp();
    await Post.deleteMany({});
    await User.deleteMany({ email: { $in: [email, otherEmail] } });
    
    // Register main user
    const res = await request(app).post("/auth/register").send({ 
        email, 
        password: "testpassword123", 
        username: "postuser" 
    });
    token = res.body.accessToken || res.body.token;

    // Register second user for permission tests (403 Forbidden)
    const resOther = await request(app).post("/auth/register").send({ 
        email: otherEmail, 
        password: "testpassword123", 
        username: "otheruser" 
    });
    otherToken = resOther.body.accessToken || resOther.body.token;
});

afterAll(async () => {
    await Post.deleteMany({});
    await mongoose.connection.close();
});

describe("Posts API Extended Coverage", () => {
    let createdPostId: string = "";

    test("Create Post - Success (201)", async () => {
        const res = await request(app)
            .post("/post")
            .set("Authorization", "Bearer " + token)
            .send({ title: "New Post", message: "Hello World" });
        expect(res.statusCode).toBe(201);
        createdPostId = res.body._id;
    });

    test("Get All Posts (200)", async () => {
        const res = await request(app).get("/post");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Get Post By ID - Success (200)", async () => {
        const res = await request(app).get(`/post/${createdPostId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(createdPostId);
    });

    test("Get Post By ID - Not Found (404)", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).get(`/post/${fakeId}`);
        expect(res.statusCode).toBe(404);
    });

    test("Update Post - Success (200)", async () => {
        const res = await request(app)
            .put(`/post/${createdPostId}`)
            .set("Authorization", "Bearer " + token)
            .send({ title: "Updated" });
        expect(res.statusCode).toBe(200);
    });

    test("Update Post - Unauthorized / Forbidden (403)", async () => {
        const res = await request(app)
            .put(`/post/${createdPostId}`)
            .set("Authorization", "Bearer " + otherToken)
            .send({ title: "Hacked Title" });
        // Fails because otherToken is not the sender of createdPostId
        expect(res.statusCode).toBe(403);
    });

    test("Update Post - Not Found (404)", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .put(`/post/${fakeId}`)
            .set("Authorization", "Bearer " + token)
            .send({ title: "New" });
        expect(res.statusCode).toBe(404);
    });

    test("Delete Post - Forbidden (403)", async () => {
        const res = await request(app)
            .delete(`/post/${createdPostId}`)
            .set("Authorization", "Bearer " + otherToken);
        expect(res.statusCode).toBe(403);
    });

    test("Delete Post - Success (200)", async () => {
        const res = await request(app)
            .delete(`/post/${createdPostId}`)
            .set("Authorization", "Bearer " + token);
        expect(res.statusCode).toBe(200);
    });

    test("Delete Post - Not Found (404)", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .delete(`/post/${fakeId}`)
            .set("Authorization", "Bearer " + token);
        expect(res.statusCode).toBe(404);
    });
});