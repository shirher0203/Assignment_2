import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import User from "../models/User";

let app: Express;
beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({});
});

afterAll((done) => {
  done();
});

describe("Auth API", () => {
  test("should register a new user", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "securePassword123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
  });

  test("should login existing user", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "securePassword123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
