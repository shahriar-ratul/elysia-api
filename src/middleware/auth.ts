import { validateAdminSession, validateUserSession } from "../utils/session";
import { defineAbilityFor } from "../utils/permissions";
import { PermissionService } from "../modules/permission/service";

/**
 * Resolve admin session data for use in route handlers
 * Returns admin info, ability (for permission checking), and session data
 */
export async function adminResolver(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }
  const token = authHeader.substring(7);
  const sessionData = await validateAdminSession(token);

  // Get admin's permissions
  const permissions = await PermissionService.getAdminPermissions(
    sessionData.admin.id
  );

  // Get admin's roles
  const roles = sessionData.admin.roles.map(
    (roleLink: { role: { name: string } }) => roleLink.role
  );

  // Build CASL ability from roles and permissions
  const ability = defineAbilityFor(
    roles.map((role) => ({ role: { name: role.name } })),
    permissions.map((permission) => ({
      permission: {
        slug: permission.slug,
        group: (permission as { group?: string }).group ?? "default",
      },
    }))
  );

  return {
    admin: sessionData.admin,
    ability,
    session: { id: sessionData.id, token: sessionData.token },
  };
}

/**
 * Resolve user session data for use in route handlers
 * Returns user info and session data (no permissions for users)
 */
export async function userResolver(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }
  const token = authHeader.substring(7);
  const sessionData = await validateUserSession(token);

  return {
    user: sessionData.user,
    session: { id: sessionData.id, token: sessionData.token },
  };
}
