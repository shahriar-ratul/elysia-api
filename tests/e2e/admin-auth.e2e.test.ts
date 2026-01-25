import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, TestDB } from "../helpers";

describe("Admin Authentication E2E", () => {
  beforeEach(async () => {
    await TestDB.cleanup();
  });

  afterAll(async () => {
    await TestDB.cleanup();
  });

  describe("POST /api/v1/admin/auth/sign-in", () => {
    it("should sign in admin with valid credentials", async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: "admin@test.com",
        password: "admin123",
      });

      // Act
      const response = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "admin@test.com", password: "admin123" });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("admin");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.admin.email).toBe("admin@test.com");
      expect(response.body.admin).toHaveProperty("roles");
    });

    it("should return error for invalid credentials", async () => {
      // Act
      const response = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "nonexistent@test.com", password: "password123" });

      // Assert
      expect(response.status).not.toBe(200);
      expect(response.body).toHaveProperty("error");
    });

    it("should return roles in response", async () => {
      // Arrange
      await TestDB.createSuperAdmin({
        email: "superadmin@test.com",
        password: "admin123",
      });

      // Act
      const response = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "superadmin@test.com", password: "admin123" });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.admin.roles).toBeInstanceOf(Array);
      expect(response.body.admin.roles.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/admin/auth/me", () => {
    it("should return admin profile with permissions", async () => {
      // Arrange
      await TestDB.createSuperAdmin({
        email: "admin@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "admin@test.com", password: "admin123" });

      const token = signInResponse.body.token;

      // Act
      const response = await request().get("/api/v1/admin/auth/me").auth(token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email");
      expect(response.body).toHaveProperty("roles");
      expect(response.body).toHaveProperty("permissions");
    });

    it("should require authentication", async () => {
      // Act
      const response = await request().get("/api/v1/admin/auth/me");

      // Assert
      expect(response.status).not.toBe(200);
    });
  });

  describe("POST /api/v1/admin/auth/sign-out", () => {
    it("should sign out admin successfully", async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: "admin@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "admin@test.com", password: "admin123" });

      const token = signInResponse.body.token;

      // Act
      const response = await request()
        .post("/api/v1/admin/auth/sign-out")
        .auth(token);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should invalidate token after sign out", async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: "admin@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "admin@test.com", password: "admin123" });

      const token = signInResponse.body.token;

      await request().post("/api/v1/admin/auth/sign-out").auth(token);

      // Act - Try to use the same token
      const response = await request().get("/api/v1/admin/auth/me").auth(token);

      // Assert
      expect(response.status).not.toBe(200);
    });
  });
});
