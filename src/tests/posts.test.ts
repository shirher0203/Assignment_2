import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import Post from "../models/Post";
import User from "../models/User";
import Comment from "../models/Comment";
import { userData, postsData, registerTestUser, fakeToken } from "./testUtils";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({ email: userData.email });
  await Post.deleteMany({});
  await Comment.deleteMany({});

  // login user and get token
  await registerTestUser(app);
});

afterAll((done) => {
  done();
});

describe("Posts API", () => {
  test("test get all empty db", async () => {
    console.log("Test is running");
    const response = await request(app).get("/post");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("test create post", async () => {
    //add all posts from postsData
    for (const post of postsData) {
      const response = await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + userData.token)
        .send(post);

      // check response
      expect(response.statusCode).toBe(201);
      //check data from the user
      expect(response.body.title).toBe(post.title);
      expect(response.body.message).toBe(post.message);
      //check sender id
      expect(response.body.sender).toBe(userData._id);
      postsData[postsData.indexOf(post)]._id = response.body._id;
      postsData[postsData.indexOf(post)].sender = response.body.sender;
    }
  });

  test("test get posts after create", async () => {
    const response = await request(app).get("/post");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(postsData.length);
  });

  test("test get posts by user id", async () => {
    const post = postsData[0];
    const response = await request(app).get("/post?user=" + post.sender);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(postsData.length);
    expect(response.body[0].sender).toBe(post.sender);
  });

  test("test get post by id", async () => {
    const response = await request(app).get("/post/" + postsData[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(postsData[0]._id);
  });

  test("test put movie by id", async () => {
    postsData[0].message = "hello this is updated message";
    const response = await request(app)
      .put("/post/" + postsData[0]._id)
      .set("Authorization", "Bearer " + userData.token)
      .send(postsData[0]);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(postsData[0].title);
    expect(response.body.message).toBe(postsData[0].message);
  });

  test("test put movie by id without token - should fail", async () => {
    postsData[0].message = "hello this is updated message";
    const response = await request(app)
      .put("/post/" + postsData[0]._id)
      .send(postsData[0]);
    expect(response.statusCode).toBe(401);
  });

  test("test put movie by id with wrong token - should fail", async () => {
    postsData[0].message = "hello this is updated message";
    const response = await request(app)
      .put("/post/" + postsData[0]._id)
      .set("Authorization", "Bearer " + fakeToken)
      .send(postsData[0]);
    expect(response.statusCode).toBe(403);
  });

  test("test delete post by id and its comments", async () => {
    //create comments for the post
    const postId = postsData[0]._id;
    const comments = [
      { postId: postId, message: "comment 1", sender: userData._id },
      { postId: postId, message: "comment 2", sender: userData._id },
    ];

    for (const comment of comments) {
      const res = await request(app)
        .post("/comment")
        .set("Authorization", "Bearer " + userData.token)
        .send(comment);
      expect(res.statusCode).toBe(201);
    }
    //delete the post
    const response = await request(app)
      .delete("/post/" + postId)
      .set("Authorization", "Bearer " + userData.token);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Post and associated comments deleted");
    //check if comments are deleted
    const commentRes = await request(app).get("/comment/post/" + postId);
    expect(commentRes.statusCode).toBe(200);
    expect(commentRes.body.length).toBe(0);
  });
});
