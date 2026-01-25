import { Elysia, t } from "elysia";
import { AdminAuthService } from "./service";
import { publicGuard, adminGuard } from "../../middleware/ability.guard";

/**
 * Admin Authentication Routes
 * - Public: sign-in
 * - Admin Auth: sign-out, me (no permissions needed)
 */

// Public routes - no auth required
const publicRoutes = new Elysia({ prefix: "/admin/auth", tags: ["Admin Auth"] })
  .use(publicGuard)
  .post(
    "/sign-in",
    async ({ body, logger, requestId, request }) => {
      logger.info({ requestId, email: body.email }, "Admin sign-in attempt");

      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip");
      const userAgent = request.headers.get("user-agent");

      const result = await AdminAuthService.signIn(body, {
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
      });

      logger.info(
        { requestId, email: body.email },
        "Admin signed in successfully"
      );
      return result;
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
      detail: {
        summary: "Admin sign in",
        description: "Authenticate admin with email and password",
      },
    }
  );

// Protected routes - admin auth required (no specific permissions)
const protectedRoutes = new Elysia({
  prefix: "/admin/auth",
  tags: ["Admin Auth"],
})
  .use(adminGuard)
  .post(
    "/sign-out",
    async ({ logger, requestId, session, admin }) => {
      logger.info({ requestId, adminId: admin.id }, "Admin sign-out");
      const result = await AdminAuthService.signOut(session.token, admin.id);
      logger.info(
        { requestId, adminId: admin.id },
        "Admin signed out successfully"
      );
      return result;
    },
    {
      // No permissions - any admin can sign out
      detail: {
        summary: "Admin sign out",
        description: "Sign out admin and revoke session",
        security: [{ bearerAuth: [] }],
      },
    }
  )
  .get(
    "/me",
    async ({ logger, requestId, admin }) => {
      logger.info({ requestId, adminId: admin.id }, "Get admin profile");
      const profile = await AdminAuthService.getProfile(admin.id);
      return profile;
    },
    {
      // No permissions - any admin can view their own profile
      detail: {
        summary: "Get current admin",
        description: "Get the currently authenticated admin profile",
        security: [{ bearerAuth: [] }],
      },
    }
  );

// Combine routes
export const adminAuthRoutes = new Elysia()
  .use(publicRoutes)
  .use(protectedRoutes);
