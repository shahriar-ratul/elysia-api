// Feature-specific Permissions

// Credits System Permissions
export const creditsPermissions = [
  // Module
  {
    name: 'Credits System Module',
    displayName: 'Credits System Module',
    slug: 'credits-system.module',
    group: 'module',
    groupOrder: 2,
    order: 22,
  },
  // CRUD
  {
    name: 'Credits View',
    displayName: 'Credits View',
    slug: 'credits.view',
    group: 'credits-system',
    groupOrder: 25,
    order: 1,
  },
  {
    name: 'Credits Add',
    displayName: 'Credits Add',
    slug: 'credits.add',
    group: 'credits-system',
    groupOrder: 25,
    order: 2,
  },
  {
    name: 'Credits Deduct',
    displayName: 'Credits Deduct',
    slug: 'credits.deduct',
    group: 'credits-system',
    groupOrder: 25,
    order: 3,
  },
  {
    name: 'Credits Purchase',
    displayName: 'Credits Purchase',
    slug: 'credits.purchase',
    group: 'credits-system',
    groupOrder: 25,
    order: 4,
  },
  {
    name: 'Credit Transactions View',
    displayName: 'Credit Transactions View',
    slug: 'credit-transactions.view',
    group: 'credits-system',
    groupOrder: 25,
    order: 5,
  },
  {
    name: 'Credit Transactions Export',
    displayName: 'Credit Transactions Export',
    slug: 'credit-transactions.export',
    group: 'credits-system',
    groupOrder: 25,
    order: 6,
  },
  {
    name: 'Credit Transactions Refund',
    displayName: 'Credit Transactions Refund',
    slug: 'credit-transactions.refund',
    group: 'credits-system',
    groupOrder: 25,
    order: 7,
  },
];

// Credit Transactions Module
export const creditTransactionPermissions = [
  // Module
  {
    name: 'Credit Transactions Module',
    displayName: 'Credit Transactions Module',
    slug: 'credit-transactions.module',
    group: 'module',
    groupOrder: 2,
    order: 23,
  },
];

// Gamification & Store Permissions
export const gamificationPermissions = [
  // Module
  {
    name: 'Gamification & Store Module',
    displayName: 'Gamification & Store Module',
    slug: 'gamification-store.module',
    group: 'module',
    groupOrder: 2,
    order: 24,
  },
  // CRUD
  {
    name: 'Points Store View',
    displayName: 'Points Store View',
    slug: 'points-store.view',
    group: 'gamification-store',
    groupOrder: 26,
    order: 1,
  },
  {
    name: 'Points Store Purchase',
    displayName: 'Points Store Purchase',
    slug: 'points-store.purchase',
    group: 'gamification-store',
    groupOrder: 26,
    order: 2,
  },
  {
    name: 'User Points View',
    displayName: 'User Points View',
    slug: 'user-points.view',
    group: 'gamification-store',
    groupOrder: 26,
    order: 3,
  },
  {
    name: 'Rewards Management',
    displayName: 'Rewards Management',
    slug: 'rewards.manage',
    group: 'gamification-store',
    groupOrder: 26,
    order: 4,
  },
  {
    name: 'Ad Views Management',
    displayName: 'Ad Views Management',
    slug: 'ad-views.manage',
    group: 'gamification-store',
    groupOrder: 26,
    order: 5,
  },
];

// Notifications Permissions
export const notificationPermissions = [
  // Module
  {
    name: 'Notifications Module',
    displayName: 'Notifications Module',
    slug: 'notifications.module',
    group: 'module',
    groupOrder: 2,
    order: 25,
  },
  // CRUD
  {
    name: 'Notifications View',
    displayName: 'Notifications View',
    slug: 'notifications.view',
    group: 'notifications',
    groupOrder: 27,
    order: 1,
  },
  {
    name: 'Notifications Create',
    displayName: 'Notifications Create',
    slug: 'notifications.create',
    group: 'notifications',
    groupOrder: 27,
    order: 2,
  },
  {
    name: 'Notifications Update',
    displayName: 'Notifications Update',
    slug: 'notifications.update',
    group: 'notifications',
    groupOrder: 27,
    order: 3,
  },
  {
    name: 'Notifications Delete',
    displayName: 'Notifications Delete',
    slug: 'notifications.delete',
    group: 'notifications',
    groupOrder: 27,
    order: 4,
  },
  {
    name: 'Notifications Status',
    displayName: 'Notifications Status',
    slug: 'notifications.status',
    group: 'notifications',
    groupOrder: 27,
    order: 5,
  },
  {
    name: 'Notifications Send',
    displayName: 'Notifications Send',
    slug: 'notifications.send',
    group: 'notifications',
    groupOrder: 27,
    order: 6,
  },
  {
    name: 'Notifications Mark Read',
    displayName: 'Notifications Mark Read',
    slug: 'notifications.mark-read',
    group: 'notifications',
    groupOrder: 27,
    order: 7,
  },
  {
    name: 'Notifications Settings',
    displayName: 'Notifications Settings',
    slug: 'notifications.settings',
    group: 'notifications',
    groupOrder: 27,
    order: 8,
  },
  {
    name: 'Notifications Bulk Delete',
    displayName: 'Notifications Bulk Delete',
    slug: 'notifications.bulk-delete',
    group: 'notifications',
    groupOrder: 27,
    order: 9,
  },
];

// Contacts Permissions
export const contactPermissions = [
  // Module
  {
    name: 'Contacts Module',
    displayName: 'Contacts Module',
    slug: 'contacts.module',
    group: 'module',
    groupOrder: 2,
    order: 26,
  },
  // CRUD
  {
    name: 'Contacts View',
    displayName: 'Contacts View',
    slug: 'contacts.view',
    group: 'contacts',
    groupOrder: 28,
    order: 1,
  },
  {
    name: 'Contacts Create',
    displayName: 'Contacts Create',
    slug: 'contacts.create',
    group: 'contacts',
    groupOrder: 28,
    order: 2,
  },
  {
    name: 'Contacts Update',
    displayName: 'Contacts Update',
    slug: 'contacts.update',
    group: 'contacts',
    groupOrder: 28,
    order: 3,
  },
  {
    name: 'Contacts Delete',
    displayName: 'Contacts Delete',
    slug: 'contacts.delete',
    group: 'contacts',
    groupOrder: 28,
    order: 4,
  },
  {
    name: 'Contacts Import',
    displayName: 'Contacts Import',
    slug: 'contacts.import',
    group: 'contacts',
    groupOrder: 28,
    order: 5,
  },
  {
    name: 'Contacts Export',
    displayName: 'Contacts Export',
    slug: 'contacts.export',
    group: 'contacts',
    groupOrder: 28,
    order: 6,
  },
  {
    name: 'Contacts Status',
    displayName: 'Contacts Status',
    slug: 'contacts.status',
    group: 'contacts',
    groupOrder: 28,
    order: 7,
  },
  {
    name: 'Contacts Merge',
    displayName: 'Contacts Merge',
    slug: 'contacts.merge',
    group: 'contacts',
    groupOrder: 28,
    order: 8,
  },
];

// User Settings Permissions
export const userSettingsPermissions = [
  // Module
  {
    name: 'User Settings Module',
    displayName: 'User Settings Module',
    slug: 'user-settings.module',
    group: 'module',
    groupOrder: 2,
    order: 27,
  },
  // CRUD
  {
    name: 'User Settings View',
    displayName: 'User Settings View',
    slug: 'user-settings.view',
    group: 'user-settings',
    groupOrder: 29,
    order: 1,
  },
  {
    name: 'User Settings Update',
    displayName: 'User Settings Update',
    slug: 'user-settings.update',
    group: 'user-settings',
    groupOrder: 29,
    order: 2,
  },
  {
    name: 'User Preferences Update',
    displayName: 'User Preferences Update',
    slug: 'user-preferences.update',
    group: 'user-settings',
    groupOrder: 29,
    order: 3,
  },
];

// API Usage Permissions
export const apiUsagePermissions = [
  // Module
  {
    name: 'API Usage Module',
    displayName: 'API Usage Module',
    slug: 'api-usage.module',
    group: 'module',
    groupOrder: 2,
    order: 28,
  },
  // CRUD
  {
    name: 'API Usage View',
    displayName: 'API Usage View',
    slug: 'api-usage.view',
    group: 'api-usage',
    groupOrder: 30,
    order: 1,
  },
  {
    name: 'API Usage Export',
    displayName: 'API Usage Export',
    slug: 'api-usage.export',
    group: 'api-usage',
    groupOrder: 30,
    order: 2,
  },
  {
    name: 'API Rate Limiting',
    displayName: 'API Rate Limiting',
    slug: 'api-rate-limiting.manage',
    group: 'api-usage',
    groupOrder: 30,
    order: 3,
  },
  {
    name: 'API Keys Manage',
    displayName: 'API Keys Manage',
    slug: 'api-keys.manage',
    group: 'api-usage',
    groupOrder: 30,
    order: 4,
  },
];
