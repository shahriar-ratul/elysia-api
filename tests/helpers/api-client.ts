import { treaty } from "@elysiajs/eden";
import type { Elysia } from "elysia";

/**
 * API Test Client Helper
 * Provides typed API calls for testing
 */

export class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    return this;
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = undefined;
    return this;
  }

  /**
   * Make authenticated request
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * User Auth endpoints
   */
  async userSignUp(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/sign-up`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return { status: response.status, data: await response.json() };
  }

  async userSignIn(data: { email: string; password: string }) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/sign-in`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return { status: response.status, data: await response.json() };
  }

  async userSignOut() {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/sign-out`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  async getUserProfile() {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  /**
   * Admin Auth endpoints
   */
  async adminSignIn(data: { email: string; password: string }) {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/auth/sign-in`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return { status: response.status, data: await response.json() };
  }

  async adminSignOut() {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/auth/sign-out`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  async getAdminProfile() {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/auth/me`, {
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  /**
   * User Management endpoints (Admin)
   */
  async listUsers(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/users?${query}`,
      {
        headers: this.getHeaders(),
      }
    );
    return { status: response.status, data: await response.json() };
  }

  async getUser(id: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/users/${id}`, {
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  async deleteUser(id: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/users/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  /**
   * Role Management endpoints
   */
  async listRoles() {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/roles`, {
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  async getRole(id: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/roles/${id}`, {
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  async createRole(data: {
    name: string;
    displayName: string;
    slug: string;
    description?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/roles`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return { status: response.status, data: await response.json() };
  }

  async updateRole(
    id: string,
    data: { displayName?: string; description?: string; isActive?: boolean }
  ) {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/roles/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return { status: response.status, data: await response.json() };
  }

  async assignPermissionsToRole(id: string, permissionIds: string[]) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/roles/${id}/permissions`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ permissionIds }),
      }
    );
    return { status: response.status, data: await response.json() };
  }

  async deleteRole(id: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/roles/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  /**
   * Permission Management endpoints
   */
  async listPermissions() {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/permissions`, {
      headers: this.getHeaders(),
    });
    return { status: response.status, data: await response.json() };
  }

  async getPermission(id: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/admin/permissions/${id}`,
      {
        headers: this.getHeaders(),
      }
    );
    return { status: response.status, data: await response.json() };
  }

  async createPermission(data: {
    name: string;
    displayName: string;
    slug: string;
    group: string;
    groupOrder: number;
    order: number;
  }) {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/permissions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return { status: response.status, data: await response.json() };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/`);
    return { status: response.status, data: await response.json() };
  }
}
