import { Elysia, t } from "elysia";
import { adminGuard } from "../../middleware/ability.guard";
import { PermissionService } from "./service";

/**
 * Permission Management Routes
 * All routes require admin auth + specific permissions
 */
export const permissionRoutes = new Elysia({
  prefix: "/admin/permissions",
  tags: ["Permissions"],
})
  .use(adminGuard)

  // GET / - List all permissions
  .get(
    "/",
    async ({ logger, requestId, admin }) => {
      logger.info(
        { requestId, adminId: admin.id },
        "Fetching permissions list"
      );
      const permissions = await PermissionService.getAllPermissions();

      const grouped = permissions.reduce(
        (acc, perm) => {
          if (!acc[perm.group]) {
            acc[perm.group] = [];
          }
          acc[perm.group].push({
            id: perm.id.toString(),
            name: perm.name,
            displayName: perm.displayName,
            slug: perm.slug,
            order: perm.order,
            groupOrder: perm.groupOrder,
            isActive: perm.isActive,
          });
          return acc;
        },
        {} as Record<string, unknown[]>
      );

      return {
        permissions: grouped,
        total: permissions.length,
      };
    },
    {
      permissions: ["permissions.list"],
      detail: {
        summary: "List all permissions",
        description: "Get all permissions grouped by category",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // GET /:id - Get permission by ID
  .get(
    "/:id",
    async ({ logger, requestId, params, admin, set }) => {
      logger.info(
        { requestId, adminId: admin.id, permissionId: params.id },
        "Fetching permission details"
      );
      const permission = await PermissionService.getPermissionById(
        BigInt(params.id)
      );

      if (!permission) {
        set.status = 404;
        return { error: "Permission not found" };
      }

      return {
        id: permission.id.toString(),
        name: permission.name,
        displayName: permission.displayName,
        slug: permission.slug,
        group: permission.group,
        groupOrder: permission.groupOrder,
        order: permission.order,
        isActive: permission.isActive,
      };
    },
    {
      permissions: ["permissions.read"],
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "Get permission by ID",
        description: "Get detailed information about a specific permission",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // POST / - Create permission
  .post(
    "/",
    async ({ logger, requestId, body, admin }) => {
      logger.info(
        { requestId, adminId: admin.id, permissionName: body.name },
        "Creating new permission"
      );
      const permission = await PermissionService.createPermission({
        ...body,
        createdBy: admin.id,
      });

      return {
        id: permission.id.toString(),
        name: permission.name,
        displayName: permission.displayName,
        slug: permission.slug,
      };
    },
    {
      permissions: ["permissions.create"],
      body: t.Object({
        name: t.String({ minLength: 1 }),
        displayName: t.String({ minLength: 1 }),
        slug: t.String({ minLength: 1 }),
        group: t.String({ minLength: 1 }),
        groupOrder: t.Number(),
        order: t.Number(),
      }),
      detail: {
        summary: "Create new permission",
        description: "Create a new permission",
        security: [{ bearerAuth: [] }],
      },
    }
  );
