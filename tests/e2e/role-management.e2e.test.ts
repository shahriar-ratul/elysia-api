import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { request, TestDB } from "../helpers";

describe("Role Management E2E", () => {
  let adminToken: string;

  beforeEach(async () => {
    await TestDB.cleanup();

    // Create super admin and sign in
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

  describe("GET /api/v1/admin/roles", () => {
    it("should list all roles", async () => {
      // Arrange
      await TestDB.createTestRole({ name: "test-moderator" });
      await TestDB.createTestRole({ name: "test-editor" });

      // Act
      const response = await request()
        .get("/api/v1/admin/roles")
        .auth(adminToken);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("roles");
      expect(response.body).toHaveProperty("total");
      expect(response.body.roles).toBeInstanceOf(Array);
    });

    it("should require authentication", async () => {
      // Act
      const response = await request().get("/api/v1/admin/roles");

      // Assert
      expect(response.status).not.toBe(200);
    });

    it("should require roles.list permission", async () => {
      // Arrange - Create admin without permissions
      await TestDB.createTestAdmin({
        email: "limited@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "limited@test.com", password: "admin123" });

      // Act
      const response = await request()
        .get("/api/v1/admin/roles")
        .auth(signInResponse.body.token);

      // Assert
      expect(response.status).not.toBe(200);
      expect(response.body.error).toContain("permission");
    });
  });

  describe("GET /api/v1/admin/roles/:id", () => {
    it("should return role details with permissions", async () => {
      // Arrange
      const permission = await TestDB.createTestPermission();
      const role = await TestDB.createTestRole({
        name: "test-moderator",
        permissions: [permission.id],
      });

      // Act
      const response = await request()
        .get(`/api/v1/admin/roles/${role.id}`)
        .auth(adminToken);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(role.id.toString());
      expect(response.body.name).toBe("test-moderator");
      expect(response.body.permissions).toBeInstanceOf(Array);
      expect(response.body.permissions.length).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent role", async () => {
      // Act
      const response = await request()
        .get("/api/v1/admin/roles/99999")
        .auth(adminToken);

      // Assert
      expect(response.status).not.toBe(200);
    });
  });

  describe("POST /api/v1/admin/roles", () => {
    it("should create new role", async () => {
      // Act
      const response = await request()
        .post("/api/v1/admin/roles")
        .auth(adminToken)
        .send({
          name: "test-new-role",
          displayName: "New Role",
          slug: "test-new-role",
          description: "A new role",
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("test-new-role");
      expect(response.body.displayName).toBe("New Role");
    });

    it("should require roles.create permission", async () => {
      // Arrange - Create admin without create permission
      await TestDB.createTestAdmin({
        email: "limited@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "limited@test.com", password: "admin123" });

      // Act
      const response = await request()
        .post("/api/v1/admin/roles")
        .auth(signInResponse.body.token)
        .send({
          name: "test-new-role",
          displayName: "New Role",
          slug: "test-new-role",
        });

      // Assert
      expect(response.status).not.toBe(200);
      expect(response.body.error).toContain("permission");
    });

    it("should validate required fields", async () => {
      // Act
      const response = await request()
        .post("/api/v1/admin/roles")
        .auth(adminToken)
        .send({});

      // Assert
      expect(response.status).not.toBe(200);
    });
  });

  describe("PATCH /api/v1/admin/roles/:id", () => {
    it("should update role", async () => {
      // Arrange
      const role = await TestDB.createTestRole({
        displayName: "Old Name",
      });

      // Act
      const response = await request()
        .patch(`/api/v1/admin/roles/${role.id}`)
        .auth(adminToken)
        .send({
          displayName: "Updated Name",
          description: "Updated description",
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.displayName).toBe("Updated Name");
      expect(response.body.description).toBe("Updated description");
    });

    it("should require roles.update permission", async () => {
      // Arrange
      const role = await TestDB.createTestRole();
      await TestDB.createTestAdmin({
        email: "limited@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "limited@test.com", password: "admin123" });

      // Act
      const response = await request()
        .patch(`/api/v1/admin/roles/${role.id}`)
        .auth(signInResponse.body.token)
        .send({ displayName: "New Name" });

      // Assert
      expect(response.status).not.toBe(200);
    });
  });

  describe("POST /api/v1/admin/roles/:id/permissions", () => {
    it("should assign permissions to role", async () => {
      // Arrange
      const role = await TestDB.createTestRole();
      const perm1 = await TestDB.createTestPermission();
      const perm2 = await TestDB.createTestPermission();

      // Act
      const response = await request()
        .post(`/api/v1/admin/roles/${role.id}/permissions`)
        .auth(adminToken)
        .send({ permissionIds: [perm1.id.toString(), perm2.id.toString()] });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.permissions).toHaveLength(2);
    });

    it("should replace existing permissions", async () => {
      // Arrange
      const perm1 = await TestDB.createTestPermission();
      const perm2 = await TestDB.createTestPermission();
      const role = await TestDB.createTestRole({
        permissions: [perm1.id],
      });

      // Act
      const response = await request()
        .post(`/api/v1/admin/roles/${role.id}/permissions`)
        .auth(adminToken)
        .send({ permissionIds: [perm2.id.toString()] });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.permissions).toHaveLength(1);
      expect(response.body.permissions[0].id).toBe(perm2.id.toString());
    });
  });

  describe("DELETE /api/v1/admin/roles/:id", () => {
    it("should delete role", async () => {
      // Arrange
      const role = await TestDB.createTestRole();

      // Act
      const response = await request()
        .delete(`/api/v1/admin/roles/${role.id}`)
        .auth(adminToken);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should require roles.delete permission", async () => {
      // Arrange
      const role = await TestDB.createTestRole();
      await TestDB.createTestAdmin({
        email: "limited@test.com",
        password: "admin123",
      });

      const signInResponse = await request()
        .post("/api/v1/admin/auth/sign-in")
        .send({ email: "limited@test.com", password: "admin123" });

      // Act
      const response = await request()
        .delete(`/api/v1/admin/roles/${role.id}`)
        .auth(signInResponse.body.token);

      // Assert
      expect(response.status).not.toBe(200);
    });
  });
});
