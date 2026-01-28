import request from "supertest";
import initApp from "../index";
import Comment from "../models/Comment";
import User from "../models/User";
import Post from "../models/Post";
import { Express } from "express";
import {
  registerTestUser,
  userData,
  commentsData,
  singlePostData,
  fakeToken,
} from "./testUtils";

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

describe("Comments API", () => {
  test("test get all empty db", async () => {
    console.log("Test is running");
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("test post comment", async () => {
    //create post
    const createPostRes = await request(app)
      .post("/post")
      .set("Authorization", "Bearer " + userData.token)
      .send(singlePostData);
    expect(createPostRes.statusCode).toBe(201);
    const postId = createPostRes.body._id;

    //add all comments from commentsData
    for (const comment of commentsData) {
      comment.postId = postId;
      const response = await request(app)
        .post("/comment")
        .set("Authorization", "Bearer " + userData.token)
        .send(comment);
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe(comment.message);
      expect(response.body.postId).toBe(postId);
      expect(String(response.body.sender)).toBe(String(userData._id));

      commentsData[commentsData.indexOf(comment)]._id = response.body._id;
      commentsData[commentsData.indexOf(comment)].sender = response.body.sender;
    }
  });

  test("test get comments by postID", async () => {
    const comment = commentsData[0];
    const response = await request(app).get("/comment/post/" + comment.postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(commentsData.length);
  });

  test("test get comment by id", async () => {
    const response = await request(app).get("/comment/" + commentsData[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentsData[0]._id);
  });

  test("test put comment by id", async () => {
    commentsData[0].message = "this is the new text";
    const response = await request(app)
      .put("/comment/" + commentsData[0]._id)
      .set("Authorization", "Bearer " + userData.token)
      .send(commentsData[0]);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(commentsData[0].message);
  });

  test("test put comment by id without token - should fail", async () => {
    commentsData[1].message = "hello this is updated message";
    const response = await request(app)
      .put("/comment/" + commentsData[1]._id)
      .send(commentsData[1]);
    expect(response.statusCode).toBe(401);
  });

  test("test put comment by id with wrong token - should fail", async () => {
    commentsData[0].message = "hello this is updated message";
    const response = await request(app)
      .put("/comment/" + commentsData[0]._id)
      .set("Authorization", "Bearer " + fakeToken)
      .send(commentsData[0]);
    expect(response.statusCode).toBe(403);
  });

  test("test delete comment by id", async () => {
    const response = await request(app)
      .delete("/comment/" + commentsData[2]._id)
      .set("Authorization", "Bearer " + userData.token);
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(
      "/comment/" + commentsData[2]._id,
    );
    expect(getResponse.statusCode).toBe(404);
  });

  test("test delete comment by id without token - should fail", async () => {
    commentsData[1].message = "hello this is updated message";
    const response = await request(app)
      .delete("/comment/" + commentsData[1]._id)
      .send(commentsData[1]);
    expect(response.statusCode).toBe(401);
  });

  test("test put post by id with wrong token - should fail", async () => {
    commentsData[0].message = "hello this is updated message";
    const response = await request(app)
      .delete("/comment/" + commentsData[0]._id)
      .set("Authorization", "Bearer " + fakeToken)
      .send(commentsData[0]);
    expect(response.statusCode).toBe(403);
  });
});
