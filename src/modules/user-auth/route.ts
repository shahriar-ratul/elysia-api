import { Elysia, t } from "elysia";
import { UserAuthService } from "./service";
import { publicGuard, userGuard } from "../../middleware/ability.guard";

/**
 * User Authentication Routes
 * - Public: sign-in, sign-up
 * - User Auth: sign-out, me
 */

// Public routes - no auth required
const publicRoutes = new Elysia({ prefix: "/auth", tags: ["User Auth"] })
  .use(publicGuard)
  .post(
    "/sign-in",
    async ({ body, logger, requestId, request }) => {
      logger.info({ requestId, email: body.email }, "User sign-in attempt");

      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip");
      const userAgent = request.headers.get("user-agent");

      const result = await UserAuthService.signIn(body, {
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
      });

      logger.info(
        { requestId, email: body.email },
        "User signed in successfully"
      );
      return result;
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
      detail: {
        summary: "User sign in",
        description: "Authenticate user with email and password",
      },
    }
  )
  .post(
    "/sign-up",
    async ({ body, logger, requestId }) => {
      logger.info({ requestId, email: body.email }, "User sign-up attempt");

      const result = await UserAuthService.signUp(body);

      logger.info(
        { requestId, email: body.email },
        "User signed up successfully"
      );
      return result;
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
      }),
      detail: {
        summary: "User sign up",
        description: "Register a new user account",
      },
    }
  );

// Protected routes - user auth required
const protectedRoutes = new Elysia({ prefix: "/auth", tags: ["User Auth"] })
  .use(userGuard)
  .post(
    "/sign-out",
    async ({ logger, requestId, session, user }) => {
      logger.info({ requestId, userId: user.id }, "User sign-out");
      const result = await UserAuthService.signOut(session.token);
      logger.info(
        { requestId, userId: user.id },
        "User signed out successfully"
      );
      return result;
    },
    {
      detail: {
        summary: "User sign out",
        description: "Sign out user and revoke session",
        security: [{ bearerAuth: [] }],
      },
    }
  )
  .get(
    "/me",
    async ({ logger, requestId, user }) => {
      logger.info({ requestId, userId: user.id }, "Get user profile");
      const profile = await UserAuthService.getProfile(user.id);
      return profile;
    },
    {
      detail: {
        summary: "Get current user",
        description: "Get the currently authenticated user profile",
        security: [{ bearerAuth: [] }],
      },
    }
  );

// Combine routes
export const userAuthRoutes = new Elysia()
  .use(publicRoutes)
  .use(protectedRoutes);
