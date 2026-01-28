import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import Post from "../models/Post";
import User from "../models/User";
import { userData, postsData, registerTestUser } from "./testUtils";

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({ email: userData.email });
  await Post.deleteMany({});

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

  //   test("test get posts with by user id", async () => {
  //     const post = postsData[0];
  //     const response = await request(app).get("/post?title=" + post.title);
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body.length).toBe(1);
  //     expect(response.body[0].releaseYear).toBe(movie.releaseYear);
  //     moviesData[0]._id = response.body[0]._id;
  //   });

  //   test("test get movie by id", async () => {
  //     const response = await request(app).get("/movie/" + moviesData[0]._id);
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body._id).toBe(moviesData[0]._id);
  //   });

  //   test("test put movie by id", async () => {
  //     moviesData[0].releaseYear = 2010;
  //     const response = await request(app)
  //       .put("/movie/" + moviesData[0]._id)
  //       .set("Authorization", "Bearer " + userData.token)
  //       .send(moviesData[0]);
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body.title).toBe(moviesData[0].title);
  //     expect(response.body.releaseYear).toBe(moviesData[0].releaseYear);
  //   });

  //   test("test delete movie by id", async () => {
  //     const response = await request(app)
  //       .delete("/movie/" + moviesData[0]._id)
  //       .set("Authorization", "Bearer " + userData.token);
  //     expect(response.statusCode).toBe(200);

  //     const getResponse = await request(app).get("/movie/" + moviesData[0]._id);
  //     expect(getResponse.statusCode).toBe(404);
  //   });
});
