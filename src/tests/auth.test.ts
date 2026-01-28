import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import User from "../models/User";
import Post from "../models/Post";
import { userData, singlePostData } from "./testUtils";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({});
  await Post.deleteMany({});
});

afterAll((done) => {
  done();
});

describe("Auth API", () => {
  test("access restricted url denied without token", async () => {
    const response = await request(app).post("/post/").send({ singlePostData });
    expect(response.status).toBe(401);
  });

  test("should register a new user", async () => {
    const response = await request(app).post("/auth/register").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    userData.token = response.body.token;
    userData._id = response.body.userId;
  });

  test("access with token peremitted after registration", async () => {
    const response = await request(app)
      .post("/post/")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(singlePostData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
  });

  test("access with modified token restricted", async () => {
    const fakeToken = userData.token + "manipulation";
    const response = await request(app)
      .post("/post/")
      .set("Authorization", `Bearer ${fakeToken}`)
      .send(singlePostData);
    expect(response.status).toBe(401);
  });

  test("should login existing user", async () => {
    const response = await request(app).post("/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    userData.token = response.body.token;
  });

  test("access with token peremitted after login", async () => {
    const response = await request(app)
      .post("/post/")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(singlePostData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    singlePostData._id = response.body._id;
  });

  // set jest timeout to 10 seconds for this test
  jest.setTimeout(10000);
  test("test expired token access restriction", async () => {
    // Assuming the token expiration is set to 5 seconds in the test env
    await new Promise((r) => setTimeout(r, 6000)); // wait for 6 seconds
    const response = await request(app)
      .post("/post/")
      .set("Authorization", `Bearer ${userData.token}`)
      .send(singlePostData);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Invalid token");
  });
});
