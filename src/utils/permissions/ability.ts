import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability'

/**
 * CASL Actions - What can be done
 */
export enum Action {
  Manage = 'manage',    // All actions
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  List = 'list',
  Export = 'export',
  Import = 'import',
}

/**
 * CASL Subjects - What can actions be performed on
 */
export enum Subject {
  All = 'all',          // All subjects
  User = 'User',
  Admin = 'Admin',
  Role = 'Role',
  Permission = 'Permission',
  Session = 'Session',
  AuditLog = 'AuditLog',
  Settings = 'Settings',
}

/**
 * Type for our CASL Ability
 */
export type AppAbility = MongoAbility<[Action, Subject]>

/**
 * Define abilities based on admin's roles and permissions
 */
export function defineAbilityFor(
  roles: Array<{ name: string }>,
  permissions: Array<{ slug: string; group: string }>
): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  // Super admin has all permissions
  if (roles.some(role => role.name === 'super_admin')) {
    can(Action.Manage, Subject.All)
    return build()
  }

  // Map permissions to CASL abilities
  permissions.forEach(permission => {
    const [action, subject] = parsePermissionSlug(permission.slug)
    if (action && subject) {
      can(action, subject)
    }
  })

  // Default: can read own profile
  can(Action.Read, Subject.Admin)

  return build()
}

/**
 * Parse permission slug into action and subject
 * Example: "users.create" -> [Action.Create, Subject.User]
 */
function parsePermissionSlug(slug: string): [Action | null, Subject | null] {
  const [subjectStr, actionStr] = slug.split('.')
  
  if (!subjectStr || !actionStr) {
    return [null, null]
  }

  // Map subject string to Subject enum
  const subjectMap: Record<string, Subject> = {
    'users': Subject.User,
    'admins': Subject.Admin,
    'roles': Subject.Role,
    'permissions': Subject.Permission,
    'sessions': Subject.Session,
    'audit-logs': Subject.AuditLog,
    'settings': Subject.Settings,
  }

  // Map action string to Action enum
  const actionMap: Record<string, Action> = {
    'create': Action.Create,
    'read': Action.Read,
    'update': Action.Update,
    'delete': Action.Delete,
    'list': Action.List,
    'export': Action.Export,
    'import': Action.Import,
    'manage': Action.Manage,
  }

  const subject = subjectMap[subjectStr] || null
  const action = actionMap[actionStr] || null

  return [action, subject]
}

/**
 * Helper to check if admin can perform action
 */
export function canPerform(
  ability: AppAbility,
  action: Action,
  subject: Subject
): boolean {
  return ability.can(action, subject)
}

/**
 * Common permission checks
 */
export const PermissionChecks = {
  canCreateUser: (ability: AppAbility) => canPerform(ability, Action.Create, Subject.User),
  canReadUser: (ability: AppAbility) => canPerform(ability, Action.Read, Subject.User),
  canUpdateUser: (ability: AppAbility) => canPerform(ability, Action.Update, Subject.User),
  canDeleteUser: (ability: AppAbility) => canPerform(ability, Action.Delete, Subject.User),
  canListUsers: (ability: AppAbility) => canPerform(ability, Action.List, Subject.User),
  
  canCreateAdmin: (ability: AppAbility) => canPerform(ability, Action.Create, Subject.Admin),
  canReadAdmin: (ability: AppAbility) => canPerform(ability, Action.Read, Subject.Admin),
  canUpdateAdmin: (ability: AppAbility) => canPerform(ability, Action.Update, Subject.Admin),
  canDeleteAdmin: (ability: AppAbility) => canPerform(ability, Action.Delete, Subject.Admin),
  canListAdmins: (ability: AppAbility) => canPerform(ability, Action.List, Subject.Admin),
  
  canManageRoles: (ability: AppAbility) => canPerform(ability, Action.Manage, Subject.Role),
  canManagePermissions: (ability: AppAbility) => canPerform(ability, Action.Manage, Subject.Permission),
  
  isSuperAdmin: (ability: AppAbility) => canPerform(ability, Action.Manage, Subject.All),
}
