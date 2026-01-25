import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, TestDB } from "../helpers";

describe("User Authentication E2E", () => {
  beforeEach(async () => {
    await TestDB.cleanup();
  });

  afterAll(async () => {
    await TestDB.cleanup();
  });

  describe("POST /api/v1/auth/sign-up", () => {
    it("should register new user successfully", async () => {
      // Act
      const response = await request().post("/api/v1/auth/sign-up").send({
        email: "newuser@test.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("newuser@test.com");
      expect(response.body.firstName).toBe("John");
      expect(response.body.lastName).toBe("Doe");
    });

    it("should return 400 for duplicate email", async () => {
      // Arrange
      await TestDB.createTestUser({ email: "existing@test.com" });

      // Act
      const response = await request()
        .post("/api/v1/auth/sign-up")
        .send({ email: "existing@test.com", password: "password123" });

      // Assert
      expect(response.status).not.toBe(200);
      expect(response.body).toHaveProperty("error");
    });

    it("should require valid email format", async () => {
      // Act
      const response = await request()
        .post("/api/v1/auth/sign-up")
        .send({ email: "invalid-email", password: "password123" });

      // Assert
      expect(response.status).not.toBe(200);
    });

    it("should require minimum password length", async () => {
      // Act
      const response = await request()
        .post("/api/v1/auth/sign-up")
        .send({ email: "user@test.com", password: "123" });

      // Assert
      expect(response.status).not.toBe(200);
    });
  });

  describe("POST /api/v1/auth/sign-in", () => {
    it("should sign in user with valid credentials", async () => {
      // Arrange
      await TestDB.createTestUser({
        email: "user@test.com",
        password: "password123",
      });

      // Act
      const response = await request()
        .post("/api/v1/auth/sign-in")
        .send({ email: "user@test.com", password: "password123" });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body).toHaveProperty("expiresAt");
      expect(response.body.user.email).toBe("user@test.com");
    });

    it("should return error for invalid email", async () => {
      // Act
      const response = await request()
        .post("/api/v1/auth/sign-in")
        .send({ email: "nonexistent@test.com", password: "password123" });

      // Assert
      expect(response.status).not.toBe(200);
      expect(response.body).toHaveProperty("error");
    });

    it("should return error for wrong password", async () => {
      // Arrange
      await TestDB.createTestUser({
        email: "user@test.com",
        password: "password123",
      });

      // Act
      const response = await request()
        .post("/api/v1/auth/sign-in")
        .send({ email: "user@test.com", password: "wrongpassword" });

      // Assert
      expect(response.status).not.toBe(200);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return user profile when authenticated", async () => {
      // Arrange
      await TestDB.createTestUser({
        email: "user@test.com",
        password: "password123",
      });

      const signInResponse = await request()
        .post("/api/v1/auth/sign-in")
        .send({ email: "user@test.com", password: "password123" });

      const token = signInResponse.body.token;

      // Act
      const response = await request().get("/api/v1/auth/me").auth(token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("user@test.com");
    });

    it("should return 401 without token", async () => {
      // Act
      const response = await request().get("/api/v1/auth/me");

      // Assert
      expect(response.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      // Act
      const response = await request()
        .get("/api/v1/auth/me")
        .auth("invalid-token");

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/sign-out", () => {
    it("should sign out user successfully", async () => {
      // Arrange
      await TestDB.createTestUser({
        email: "user@test.com",
        password: "password123",
      });

      const signInResponse = await request()
        .post("/api/v1/auth/sign-in")
        .send({ email: "user@test.com", password: "password123" });

      const token = signInResponse.body.token;

      // Act
      const response = await request()
        .post("/api/v1/auth/sign-out")
        .auth(token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should invalidate token after sign out", async () => {
      // Arrange
      await TestDB.createTestUser({
        email: "user@test.com",
        password: "password123",
      });

      const signInResponse = await request()
        .post("/api/v1/auth/sign-in")
        .send({ email: "user@test.com", password: "password123" });

      const token = signInResponse.body.token;
      await request().post("/api/v1/auth/sign-out").auth(token);

      // Act - Try to use the same token
      const response = await request().get("/api/v1/auth/me").auth(token);

      // Assert
      expect(response.status).not.toBe(200);
    });
  });
});
