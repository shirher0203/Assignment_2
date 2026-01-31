import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import mongoose from "mongoose";
import User from "../models/User";

let app: Express;
// Use a unique email every run
const email = "auth" + Date.now() + "@test.com";
const password = "testpassword123";
let token: string = "";
let refreshToken: string = "";

const singlePostData = {
    title: "Auth Test Post",
    message: "Test message body"
};

// Crucial: Increase timeout for DB operations
jest.setTimeout(30000);

beforeAll(async () => {
    // Sync the secret with authMiddleware
    process.env.JWT_SECRET = "test_secret_key_123";
    app = await initApp();
    
    // Clean database for this specific user
    await User.deleteMany({ email: email });
    await User.deleteMany({ email: "auth_test@test.com" });
});

afterAll(async () => {
    await User.deleteMany({ email: email });
    await mongoose.connection.close();
});

describe("Auth API", () => {
    test("Registration - should create a new user", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({ email, password, username: "testuser" });
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("token");
        token = response.body.accessToken || response.body.token;
        refreshToken = response.body.refreshToken;
    });

    test("Login - should return tokens", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({ email, password });
            
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        token = response.body.accessToken || response.body.token;
        refreshToken = response.body.refreshToken;
    });

    test("Access protected route - success with token", async () => {
        const response = await request(app)
            .post("/post")
            .set("Authorization", `Bearer ${token}`)
            .send(singlePostData);
        expect(response.status).toBe(201);
    });

    test("Access protected route - fail without token", async () => {
        const response = await request(app)
            .post("/post")
            .send(singlePostData);
        expect(response.status).toBe(401);
    });

    test("Refresh Token - should return new tokens", async () => {
        // Ensure we send the correct key 'refreshToken'
        const response = await request(app)
            .post("/auth/refresh-token")
            .send({ refreshToken: refreshToken });
            
        if (response.status !== 200) {
            console.log("Refresh failed check body:", response.body);
        }
        
        expect(response.status).toBe(200);
        // Supports both 'token' or 'accessToken'
        const newToken = response.body.accessToken || response.body.token;
        expect(newToken).toBeDefined();
        token = newToken;
    });
});