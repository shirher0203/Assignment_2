import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import mongoose from "mongoose";
import User from "../models/User";

let app: Express;
let userId: string;
let token: string;

// Main test user credentials
const testUser = {
    email: "user_test@test.com",
    password: "testpassword123",
    username: "testuser"
};

jest.setTimeout(30000);

beforeAll(async () => {
    // Ensure JWT secret is synced
    process.env.JWT_SECRET = "test_secret_key_123";
    app = await initApp();
    
    // Clean database before starting
    await User.deleteMany({ email: testUser.email });
    
    // Register the test user to get valid ID and Token
    const res = await request(app).post("/auth/register").send(testUser);
    userId = res.body._id || res.body.userId || res.body.user?._id;
    token = res.body.accessToken || res.body.token;
});

afterAll(async () => {
    // Cleanup and close connection
    await User.deleteMany({ email: testUser.email });
    await mongoose.connection.close();
});

describe("User CRUD API Full Coverage", () => {
    
    // 1. Test Get Profile Success
    test("Get user profile - Success (200)", async () => {
        const res = await request(app)
            .get(`/user/${userId}`)
            .set("Authorization", "Bearer " + token);
            
        expect(res.statusCode).toBe(200);
        const returnedId = res.body._id || res.body.id;
        expect(returnedId).toBe(userId);
    });

    // 2. Test Get Profile Not Found (Covers 404 logic)
    test("Get user profile - Not Found (404)", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .get(`/user/${fakeId}`)
            .set("Authorization", "Bearer " + token);
            
        expect(res.statusCode).toBe(404);
    });

    // 3. Test Update User Success
    test("Update user - Success (200)", async () => {
        const res = await request(app)
            .put(`/user/${userId}`)
            .set("Authorization", "Bearer " + token)
            .send({ username: "updatedUser" });
            
        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe("updatedUser");
    });

    // 4. Test Update User Forbidden (Covers 403 logic - updating someone else)
    test("Update another user - Forbidden (403)", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .put(`/user/${fakeId}`)
            .set("Authorization", "Bearer " + token)
            .send({ username: "hacker" });
            
        expect(res.statusCode).toBe(403);
    });

    // 5. Test Delete Another User Forbidden (Covers 403 logic in delete)
    test("Delete another user - Forbidden (403)", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .delete(`/user/${fakeId}`)
            .set("Authorization", "Bearer " + token);
            
        expect(res.statusCode).toBe(403);
    });

    // 6. Test Delete Self Success
    test("Delete user - Success (200)", async () => {
        const res = await request(app)
            .delete(`/user/${userId}`)
            .set("Authorization", "Bearer " + token);
            
        expect(res.statusCode).toBe(200);
    });

    // 7. Test Get Deleted User (Covers 404 logic after deletion)
    test("Get deleted user - Not Found (404)", async () => {
        const res = await request(app)
            .get(`/user/${userId}`)
            .set("Authorization", "Bearer " + token);
            
        expect(res.statusCode).toBe(404);
    });
});