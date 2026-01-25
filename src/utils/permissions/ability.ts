import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";

/**
 * Type for our CASL Ability
 * Uses string-based permissions (e.g., 'roles.list', 'users.create')
 */
export type AppAbility = MongoAbility<[string, string]>;

/**
 * Define abilities based on admin's roles and permissions
 * Permissions are stored directly as strings (e.g., 'roles.list', 'users.create')
 */
export function defineAbilityFor(
  roles: Array<{ role: { name: string } }>,
  permissions: Array<{ permission: { slug: string; group: string } }>
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Super admin has all permissions
  if (roles.some((role) => role.role.name === "super_admin")) {
    can("manage", "all");
    return build();
  }

  // Add each permission directly as a CASL ability
  // Permission slug is used as the action, empty string as subject
  for (const { permission } of permissions) {
    can(permission.slug, "");
  }

  return build();
}

/**
 * Check if ability allows a permission
 */
export function canPerform(ability: AppAbility, permission: string): boolean {
  // Super admin check
  if (ability.can("manage", "all")) {
    return true;
  }
  return ability.can(permission, "");
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(ability: AppAbility): boolean {
  return ability.can("manage", "all");
}
