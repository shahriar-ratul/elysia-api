export const roleSeeds: Role[] = [
  {
    name: "Super Admin",
    displayName: "Super Admin",
    slug: "superadmin",
    description: "Super Admin Role",
    isDefault: true,
  },

  {
    name: "Admin",
    displayName: "Admin",
    slug: "admin",
    description: "Admin Role",
    isDefault: false,
  },

  {
    name: "Editor",
    displayName: "Editor",
    slug: "editor",
    description: "Editor Role",
    isDefault: false,
  },
  {
    name: "User",
    displayName: "User",
    slug: "user",
    description: "User Role",
    isDefault: false,
  },
];

interface Role {
  name: string;
  displayName: string;
  slug: string;
  description: string;
  isDefault: boolean;
}
