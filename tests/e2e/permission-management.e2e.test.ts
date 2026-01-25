import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, TestDB } from "../helpers";

describe("Permission Management E2E", () => {
  let adminToken: string;

  beforeEach(async () => {
    await TestDB.cleanup();

    // Create super admin
    await TestDB.createSuperAdmin({
      email: "superadmin@test.com",
      password: "admin123",
    });

    const signInResponse = await request()
      .post("/api/v1/admin/auth/sign-in")
      .send({ email: "superadmin@test.com", password: "admin123" });

    adminToken = signInResponse.body.token;
  });

  afterAll(async () => {
    await TestDB.cleanup();
  });

  describe("GET /api/v1/admin/permissions", () => {
    it("should list all permissions grouped", async () => {
      // Arrange
      await TestDB.createTestPermission({
        name: "test-Create Users",
        slug: "test.users.create",
        group: "Users",
      });
      await TestDB.createTestPermission({
        name: "test-Read Users",
        slug: "test.users.read",
        group: "Users",
      });

      // Act
      const response = await request()
        .get("/api/v1/admin/permissions")
        .auth(adminToken);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("permissions");
      expect(response.body).toHaveProperty("total");
      expect(typeof response.body.permissions).toBe("object");
    });

    it("should require authentication", async () => {
      // Act
      const response = await request().get("/api/v1/admin/permissions");

      // Assert
      expect(response.status).not.toBe(200);
    });

    it("should require permissions.list permission", async () => {
      // Arrange - Admin without permission
      await TestDB.createTestAdmin({
        email: "limited@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "limited@test.com", password: "admin123" });

      // Act
      const response = await request()
        .get("/api/v1/admin/permissions")
        .auth(signInResponse.body.token);

      // Assert
      expect(response.status).not.toBe(200);
      expect(response.body.error).toContain("permission");
    });
  });

  describe("GET /api/v1/admin/permissions/:id", () => {
    it("should return permission details", async () => {
      // Arrange
      const permission = await TestDB.createTestPermission({
        name: "test-Test Permission",
        slug: "test.test.permission",
        group: "Test",
      });

      // Act
      const response = await request()
        .get(`/api/v1/admin/permissions/${permission.id}`)
        .auth(adminToken);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(permission.id.toString());
      expect(response.body.name).toBe("test-Test Permission");
      expect(response.body.slug).toBe("test.test.permission");
      expect(response.body.group).toBe("Test");
    });

    it("should return 404 for non-existent permission", async () => {
      // Act
      const response = await request()
        .get("/api/v1/admin/permissions/99999")
        .auth(adminToken);

      // Assert
      expect(response.status).not.toBe(200);
    });

    it("should require permissions.read permission", async () => {
      // Arrange
      const permission = await TestDB.createTestPermission();
      await TestDB.createTestAdmin({
        email: "limited@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "limited@test.com", password: "admin123" });

      // Act
      const response = await request()
        .get(`/api/v1/admin/permissions/${permission.id}`)
        .auth(signInResponse.body.token);

      // Assert
      expect(response.status).not.toBe(200);
    });
  });

  describe("POST /api/v1/admin/permissions", () => {
    it("should create new permission", async () => {
      // Act
      const response = await request()
        .post("/api/v1/admin/permissions")
        .auth(adminToken)
        .send({
          name: "test-New Permission",
          displayName: "New Permission",
          slug: "test.new.permission",
          group: "Test",
          groupOrder: 1,
          order: 1,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("test-New Permission");
      expect(response.body.slug).toBe("test.new.permission");
    });

    it("should require permissions.create permission", async () => {
      // Arrange
      await TestDB.createTestAdmin({
        email: "limited@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "limited@test.com", password: "admin123" });

      // Act
      const response = await request()
        .post("/api/v1/admin/permissions")
        .auth(signInResponse.body.token)
        .send({
          name: "test-New Permission",
          displayName: "New Permission",
          slug: "test.new.permission",
          group: "Test",
          groupOrder: 1,
          order: 1,
        });

      // Assert
      expect(response.status).not.toBe(200);
      expect(response.body.error).toContain("permission");
    });

    it("should validate required fields", async () => {
      // Act
      const response = await request()
        .post("/api/v1/admin/permissions")
        .auth(adminToken)
        .send({ name: "Test" });

      // Assert
      expect(response.status).not.toBe(200);
    });
  });
});
