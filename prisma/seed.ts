import { db } from "../src/utils/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Permissions
  const permissionGroups = [
    {
      group: "Admins",
      groupOrder: 1,
      permissions: [
        { name: "admin.view", displayName: "View Admins", slug: "admin-view" },
        { name: "admin.create", displayName: "Create Admin", slug: "admin-create" },
        { name: "admin.update", displayName: "Update Admin", slug: "admin-update" },
        { name: "admin.delete", displayName: "Delete Admin", slug: "admin-delete" },
      ],
    },
    {
      group: "Users",
      groupOrder: 2,
      permissions: [
        { name: "user.view", displayName: "View Users", slug: "user-view" },
        { name: "user.create", displayName: "Create User", slug: "user-create" },
        { name: "user.update", displayName: "Update User", slug: "user-update" },
        { name: "user.delete", displayName: "Delete User", slug: "user-delete" },
      ],
    },
    {
      group: "Roles",
      groupOrder: 3,
      permissions: [
        { name: "role.view", displayName: "View Roles", slug: "role-view" },
        { name: "role.create", displayName: "Create Role", slug: "role-create" },
        { name: "role.update", displayName: "Update Role", slug: "role-update" },
        { name: "role.delete", displayName: "Delete Role", slug: "role-delete" },
      ],
    },
    {
      group: "Permissions",
      groupOrder: 4,
      permissions: [
        { name: "permission.view", displayName: "View Permissions", slug: "permission-view" },
        { name: "permission.assign", displayName: "Assign Permissions", slug: "permission-assign" },
      ],
    },
  ];

  console.log("📝 Creating permissions...");
  const createdPermissions: { id: bigint; name: string }[] = [];

  for (const group of permissionGroups) {
    for (let i = 0; i < group.permissions.length; i++) {
      const perm = group.permissions[i];
      const permission = await db.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: {
          name: perm.name,
          displayName: perm.displayName,
          slug: perm.slug,
          group: group.group,
          groupOrder: group.groupOrder,
          order: i + 1,
        },
      });
      createdPermissions.push({ id: permission.id, name: permission.name });
    }
  }
  console.log(`   ✓ Created ${createdPermissions.length} permissions`);

  // Create Roles
  console.log("👥 Creating roles...");
  const superAdminRole = await db.role.upsert({
    where: { slug: "super-admin" },
    update: {},
    create: {
      name: "Super Admin",
      displayName: "Super Administrator",
      slug: "super-admin",
      description: "Full system access with all permissions",
      isDefault: false,
      order: 1,
    },
  });

  const adminRole = await db.role.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      name: "Admin",
      displayName: "Administrator",
      slug: "admin",
      description: "Administrative access with limited permissions",
      isDefault: false,
      order: 2,
    },
  });

  const moderatorRole = await db.role.upsert({
    where: { slug: "moderator" },
    update: {},
    create: {
      name: "Moderator",
      displayName: "Moderator",
      slug: "moderator",
      description: "Content moderation access",
      isDefault: true,
      order: 3,
    },
  });
  console.log("   ✓ Created 3 roles");

  // Assign all permissions to Super Admin role
  console.log("🔗 Assigning permissions to roles...");
  for (const perm of createdPermissions) {
    await db.permissionRole.upsert({
      where: {
        permissionId_roleId: {
          permissionId: perm.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        permissionId: perm.id,
        roleId: superAdminRole.id,
      },
    });
  }

  // Assign user permissions to Admin role
  const adminPermissions = createdPermissions.filter(
    (p) => p.name.startsWith("user.") || p.name === "admin.view"
  );
  for (const perm of adminPermissions) {
    await db.permissionRole.upsert({
      where: {
        permissionId_roleId: {
          permissionId: perm.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        permissionId: perm.id,
        roleId: adminRole.id,
      },
    });
  }

  // Assign view permissions to Moderator role
  const moderatorPermissions = createdPermissions.filter((p) => p.name.endsWith(".view"));
  for (const perm of moderatorPermissions) {
    await db.permissionRole.upsert({
      where: {
        permissionId_roleId: {
          permissionId: perm.id,
          roleId: moderatorRole.id,
        },
      },
      update: {},
      create: {
        permissionId: perm.id,
        roleId: moderatorRole.id,
      },
    });
  }
  console.log("   ✓ Assigned permissions to roles");

  // Create Super Admin user
  console.log("👤 Creating super admin account...");
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const superAdmin = await db.admin.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      isVerified: true,
      isActive: true,
    },
  });

  // Assign Super Admin role to the admin
  await db.adminRole.upsert({
    where: {
      adminId_roleId: {
        adminId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      adminId: superAdmin.id,
      roleId: superAdminRole.id,
    },
  });
  console.log("   ✓ Created super admin: admin@example.com / admin123");

  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
