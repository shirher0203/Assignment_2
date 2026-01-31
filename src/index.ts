import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Configuration - Fully defined object to cover the entire API
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Assignment 2 - Web Applications API",
      version: "1.0.0",
      description: "Complete API Documentation for Auth, Users, Posts, and Comments",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" }, username: { type: "string" } } } } }
          },
          responses: { 201: { description: "User registered successfully" } }
        }
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
          },
          responses: { 200: { description: "Login successful" } }
        }
      },
      "/auth/refresh-token": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { refreshToken: { type: "string" } } } } }
          },
          responses: { 200: { description: "Token refreshed successfully" } }
        }
      },
      "/user/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get user profile by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "User data retrieved" } }
        },
        put: {
          tags: ["Users"],
          summary: "Update user profile",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { username: { type: "string" } } } } }
          },
          responses: { 200: { description: "User updated successfully" } }
        }
      },
      "/post": {
        get: {
          tags: ["Posts"],
          summary: "Get all posts",
          description: "Retrieves all posts from the server. You can optionally filter by sender ID using the query parameter.",
          parameters: [
            { 
              in: "query", 
              name: "sender", 
              required: false, // כאן הגדרנו שזה לא חובה
              schema: { type: "string" }, 
              description: "Optional: Filter posts by a specific sender ID" 
            }
          ],
          responses: { 
            200: { 
              description: "A list of posts retrieved successfully" 
            } 
          }
        },
        post: {
          tags: ["Posts"],
          summary: "Create a new post",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, message: { type: "string" } } } } }
          },
          responses: { 201: { description: "Post created" } }
        }
      },
      "/post/{id}": {
        get: {
          tags: ["Posts"],
          summary: "Get post by ID",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Success" } }
        },
        put: {
          tags: ["Posts"],
          summary: "Update post by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, message: { type: "string" } } } } }
          },
          responses: { 200: { description: "Post updated" }, 403: { description: "Forbidden" } }
        },
        delete: {
          tags: ["Posts"],
          summary: "Delete post by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Post deleted" }, 403: { description: "Forbidden" } }
        }
      },
      "/comment": {
        get: {
          tags: ["Comments"],
          summary: "Get comments",
          parameters: [{ in: "query", name: "postId", schema: { type: "string" }, description: "Get comments for a specific post" }],
          responses: { 200: { description: "Success" } }
        },
        post: {
          tags: ["Comments"],
          summary: "Add a new comment",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", properties: { postId: { type: "string" }, message: { type: "string" } } } } }
          },
          responses: { 201: { description: "Comment added" } }
        }
      },
      "/comment/{id}": {
        get: {
          tags: ["Comments"],
          summary: "Get comment by ID",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Success" } }
        },
        put: {
          tags: ["Comments"],
          summary: "Update comment by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } }
          },
          responses: { 200: { description: "Comment updated" } }
        },
        delete: {
          tags: ["Comments"],
          summary: "Delete comment by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Comment deleted" } }
        }
      }
    }
  },
  apis: [], // Keep this empty to ensure stability and avoid scanning TS files
};

const specs = swaggerJsDoc(options);

// Swagger Route
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);

const initApp = (): Promise<Express> => {
  const pr = new Promise<Express>((resolve, reject) => {
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!MONGO_URI) {
      reject(new Error("Missing MongoDB URI"));
      return;
    }

    mongoose
      .connect(MONGO_URI)
      .then(() => {
        resolve(app);
      })
      .catch(reject);
  });

  const db = mongoose.connection;
  db.on("error", (error) => console.error(error));
  db.once("open", () => console.log("Connected to MongoDB"));

  return pr;
};

export default initApp;