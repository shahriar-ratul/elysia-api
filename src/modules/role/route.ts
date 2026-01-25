import { Elysia, t } from "elysia";
import { adminGuard } from "../../middleware/ability.guard";
import { RoleService } from "./service";

/**
 * Role Management Routes
 *
 * Similar to NestJS:
 * @ApiTags('roles')
 * @Controller({ version: '1', path: 'roles' })
 * @UseGuards(JwtAuthGuard)
 * @UseGuards(AbilityGuard)
 */
export const roleRoutes = new Elysia({
  prefix: "/admin/roles",
  tags: ["Roles"],
})
  // Apply guards - similar to @UseGuards(JwtAuthGuard, AbilityGuard)
  .use(adminGuard)

  // GET / - List all roles
  // Similar to @Get() @SetMetadata('permissions', ['roles.list'])
  .get(
    "/",
    async ({ logger, requestId, admin }) => {
      logger.info({ requestId, adminId: admin.id }, "Fetching roles list");
      const roles = await RoleService.getAllRoles();

      return {
        roles: roles.map((role) => ({
          id: role.id.toString(),
          name: role.name,
          displayName: role.displayName,
          slug: role.slug,
          description: role.description,
          isDefault: role.isDefault,
          order: role.order,
          isActive: role.isActive,
          permissions: role.permissions.map((p) => ({
            id: p.permission.id.toString(),
            name: p.permission.name,
            slug: p.permission.slug,
          })),
        })),
        total: roles.length,
      };
    },
    {
      permissions: ["roles.list"],
      detail: {
        summary: "List all roles",
        description:
          "Get all roles with their permissions (requires roles.list permission)",
        tags: ["Roles"],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // GET /:id - Get role by ID
  // Similar to @Get(':id') @SetMetadata('permissions', ['roles.read'])
  .get(
    "/:id",
    async ({ params, logger, requestId, admin, set }) => {
      logger.info(
        { requestId, adminId: admin.id, roleId: params.id },
        "Fetching role details"
      );
      const role = await RoleService.getRoleById(BigInt(params.id));

      if (!role) {
        set.status = 404;
        return { error: "Role not found" };
      }

      return {
        id: role.id.toString(),
        name: role.name,
        displayName: role.displayName,
        slug: role.slug,
        description: role.description,
        isDefault: role.isDefault,
        order: role.order,
        isActive: role.isActive,
        permissions: role.permissions.map((p) => ({
          id: p.permission.id.toString(),
          name: p.permission.name,
          slug: p.permission.slug,
        })),
      };
    },
    {
      permissions: ["roles.read"],
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "Get role by ID",
        description:
          "Get a specific role with its permissions (requires roles.read permission)",
        tags: ["Roles"],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // POST / - Create role
  // Similar to @Post() @SetMetadata('permissions', ['roles.create'])
  .post(
    "/",
    async ({ body, logger, requestId, admin }) => {
      logger.info(
        { requestId, adminId: admin.id, roleName: body.name },
        "Creating role"
      );
      const role = await RoleService.createRole(body);

      return {
        id: role.id.toString(),
        name: role.name,
        displayName: role.displayName,
        slug: role.slug,
        description: role.description,
        isDefault: role.isDefault,
        order: role.order,
        isActive: role.isActive,
      };
    },
    {
      permissions: ["roles.create"],
      body: t.Object({
        name: t.String(),
        displayName: t.String(),
        slug: t.String(),
        description: t.Optional(t.String()),
        isDefault: t.Optional(t.Boolean()),
        order: t.Optional(t.Number()),
      }),
      detail: {
        summary: "Create role",
        description: "Create a new role (requires roles.create permission)",
        tags: ["Roles"],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // PATCH /:id - Update role
  // Similar to @Patch(':id') @SetMetadata('permissions', ['roles.update'])
  .patch(
    "/:id",
    async ({ params, body, logger, requestId, admin }) => {
      logger.info(
        { requestId, adminId: admin.id, roleId: params.id },
        "Updating role"
      );
      const role = await RoleService.updateRole(BigInt(params.id), body);

      return {
        id: role.id.toString(),
        name: role.name,
        displayName: role.displayName,
        slug: role.slug,
        description: role.description,
        isDefault: role.isDefault,
        order: role.order,
        isActive: role.isActive,
      };
    },
    {
      permissions: ["roles.update"],
      params: t.Object({ id: t.String() }),
      body: t.Object({
        displayName: t.Optional(t.String()),
        description: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
        order: t.Optional(t.Number()),
      }),
      detail: {
        summary: "Update role",
        description: "Update a role (requires roles.update permission)",
        tags: ["Roles"],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // POST /:id/permissions - Assign permissions to role
  // Similar to @Post(':id/permissions') @SetMetadata('permissions', ['roles.update'])
  .post(
    "/:id/permissions",
    async ({ params, body, logger, requestId, admin }) => {
      logger.info(
        { requestId, adminId: admin.id, roleId: params.id },
        "Assigning permissions to role"
      );
      const role = await RoleService.assignPermissions(
        BigInt(params.id),
        body.permissionIds.map((id: string) => BigInt(id))
      );

      if (!role) {
        return { error: "Role not found" };
      }

      return {
        id: role.id.toString(),
        name: role.name,
        permissions: role.permissions.map((p) => ({
          id: p.permission.id.toString(),
          name: p.permission.name,
          slug: p.permission.slug,
        })),
      };
    },
    {
      permissions: ["roles.update"],
      params: t.Object({ id: t.String() }),
      body: t.Object({
        permissionIds: t.Array(t.String()),
      }),
      detail: {
        summary: "Assign permissions to role",
        description:
          "Replace all permissions for a role (requires roles.update permission)",
        tags: ["Roles"],
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // DELETE /:id - Delete role
  // Similar to @Delete(':id') @SetMetadata('permissions', ['roles.delete'])
  .delete(
    "/:id",
    async ({ params, logger, requestId, admin }) => {
      logger.info(
        { requestId, adminId: admin.id, roleId: params.id },
        "Deleting role"
      );
      await RoleService.deleteRole(BigInt(params.id));

      return { success: true };
    },
    {
      permissions: ["roles.delete"],
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "Delete role",
        description: "Soft delete a role (requires roles.delete permission)",
        tags: ["Roles"],
        security: [{ bearerAuth: [] }],
      },
    }
  );
