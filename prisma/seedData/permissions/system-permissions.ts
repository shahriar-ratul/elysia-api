// System and Administrative Permissions

// File Management Permissions
export const fileManagementPermissions = [
  // Module
  {
    name: 'File Management Module',
    displayName: 'File Management Module',
    slug: 'file-management.module',
    group: 'module',
    groupOrder: 2,
    order: 29,
  },
  // CRUD
  {
    name: 'File Upload',
    displayName: 'File Upload',
    slug: 'file.upload',
    group: 'file-management',
    groupOrder: 31,
    order: 1,
  },
  {
    name: 'File View',
    displayName: 'File View',
    slug: 'file.view',
    group: 'file-management',
    groupOrder: 31,
    order: 2,
  },
  {
    name: 'File Delete',
    displayName: 'File Delete',
    slug: 'file.delete',
    group: 'file-management',
    groupOrder: 31,
    order: 3,
  },
  {
    name: 'File Share',
    displayName: 'File Share',
    slug: 'file.share',
    group: 'file-management',
    groupOrder: 31,
    order: 4,
  },
  {
    name: 'File Download',
    displayName: 'File Download',
    slug: 'file.download',
    group: 'file-management',
    groupOrder: 31,
    order: 5,
  },
];

// System Administration Permissions
export const systemAdministrationPermissions = [
  // Module
  {
    name: 'System Administration Module',
    displayName: 'System Administration Module',
    slug: 'system-administration.module',
    group: 'module',
    groupOrder: 2,
    order: 30,
  },
  // CRUD
  {
    name: 'System Health',
    displayName: 'System Health',
    slug: 'system.health',
    group: 'system-administration',
    groupOrder: 32,
    order: 1,
  },
  {
    name: 'System Maintenance',
    displayName: 'System Maintenance',
    slug: 'system.maintenance',
    group: 'system-administration',
    groupOrder: 32,
    order: 2,
  },
  {
    name: 'System Backup',
    displayName: 'System Backup',
    slug: 'system.backup',
    group: 'system-administration',
    groupOrder: 32,
    order: 3,
  },
  {
    name: 'System Restore',
    displayName: 'System Restore',
    slug: 'system.restore',
    group: 'system-administration',
    groupOrder: 32,
    order: 4,
  },
  {
    name: 'System Logs',
    displayName: 'System Logs',
    slug: 'system.logs',
    group: 'system-administration',
    groupOrder: 32,
    order: 5,
  },
  {
    name: 'System Monitoring',
    displayName: 'System Monitoring',
    slug: 'system.monitoring',
    group: 'system-administration',
    groupOrder: 32,
    order: 6,
  },
];

// Analytics Permissions
export const analyticsPermissions = [
  // Module
  {
    name: 'Analytics Module',
    displayName: 'Analytics Module',
    slug: 'analytics.module',
    group: 'module',
    groupOrder: 2,
    order: 31,
  },
  // CRUD
  {
    name: 'Analytics Dashboard View',
    displayName: 'Analytics Dashboard View',
    slug: 'analytics.view',
    group: 'analytics',
    groupOrder: 33,
    order: 1,
  },
  {
    name: 'Usage Reports View',
    displayName: 'Usage Reports View',
    slug: 'usage-reports.view',
    group: 'analytics',
    groupOrder: 33,
    order: 2,
  },
  {
    name: 'Revenue Reports View',
    displayName: 'Revenue Reports View',
    slug: 'revenue-reports.view',
    group: 'analytics',
    groupOrder: 33,
    order: 3,
  },
];

// Invoice Templates Permissions
export const invoiceTemplatePermissions = [
  // Module
  {
    name: 'Invoice Templates Module',
    displayName: 'Invoice Templates Module',
    slug: 'invoice-templates.module',
    group: 'module',
    groupOrder: 2,
    order: 32,
  },
  // CRUD
  {
    name: 'Invoice Templates View',
    displayName: 'Invoice Templates View',
    slug: 'invoice-templates.view',
    group: 'invoice-templates',
    groupOrder: 34,
    order: 1,
  },
  {
    name: 'Invoice Templates Create',
    displayName: 'Invoice Templates Create',
    slug: 'invoice-templates.create',
    group: 'invoice-templates',
    groupOrder: 34,
    order: 2,
  },
  {
    name: 'Invoice Templates Update',
    displayName: 'Invoice Templates Update',
    slug: 'invoice-templates.update',
    group: 'invoice-templates',
    groupOrder: 34,
    order: 3,
  },
  {
    name: 'Invoice Templates Delete',
    displayName: 'Invoice Templates Delete',
    slug: 'invoice-templates.delete',
    group: 'invoice-templates',
    groupOrder: 34,
    order: 4,
  },
  {
    name: 'Invoice Templates Purchase',
    displayName: 'Invoice Templates Purchase',
    slug: 'invoice-templates.purchase',
    group: 'invoice-templates',
    groupOrder: 34,
    order: 5,
  },
  {
    name: 'Invoice Templates Set Default',
    displayName: 'Invoice Templates Set Default',
    slug: 'invoice-templates.set-default',
    group: 'invoice-templates',
    groupOrder: 34,
    order: 6,
  },
];

// Email Template Permissions
export const emailTemplatePermissions = [
  // Module
  {
    name: 'Email Templates Module',
    displayName: 'Email Templates Module',
    slug: 'email-templates.module',
    group: 'module',
    groupOrder: 2,
    order: 33,
  },
  // CRUD
  {
    name: 'Email Templates View',
    displayName: 'Email Templates View',
    slug: 'email-templates.view',
    group: 'email-templates',
    groupOrder: 35,
    order: 1,
  },
  {
    name: 'Email Templates Create',
    displayName: 'Email Templates Create',
    slug: 'email-templates.create',
    group: 'email-templates',
    groupOrder: 35,
    order: 2,
  },
  {
    name: 'Email Templates Update',
    displayName: 'Email Templates Update',
    slug: 'email-templates.update',
    group: 'email-templates',
    groupOrder: 35,
    order: 3,
  },
  {
    name: 'Email Templates Delete',
    displayName: 'Email Templates Delete',
    slug: 'email-templates.delete',
    group: 'email-templates',
    groupOrder: 35,
    order: 4,
  },
  {
    name: 'Email Templates Purchase',
    displayName: 'Email Templates Purchase',
    slug: 'email-templates.purchase',
    group: 'email-templates',
    groupOrder: 35,
    order: 5,
  },
  {
    name: 'Email Templates Set Default',
    displayName: 'Email Templates Set Default',
    slug: 'email-templates.set-default',
    group: 'email-templates',
    groupOrder: 35,
    order: 6,
  },
];

// Subscription & Billing Permissions
export const subscriptionPermissions = [
  // Module
  {
    name: 'Subscription & Billing Module',
    displayName: 'Subscription & Billing Module',
    slug: 'subscription-billing.module',
    group: 'module',
    groupOrder: 2,
    order: 34,
  },
  // CRUD
  {
    name: 'Subscription View',
    displayName: 'Subscription View',
    slug: 'subscription.view',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 1,
  },
  {
    name: 'Subscription Create',
    displayName: 'Subscription Create',
    slug: 'subscription.create',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 2,
  },
  {
    name: 'Subscription Update',
    displayName: 'Subscription Update',
    slug: 'subscription.update',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 3,
  },
  {
    name: 'Subscription Cancel',
    displayName: 'Subscription Cancel',
    slug: 'subscription.cancel',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 4,
  },
  {
    name: 'Subscription Plans View',
    displayName: 'Subscription Plans View',
    slug: 'subscription-plans.view',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 5,
  },
  {
    name: 'Subscription Plans Create',
    displayName: 'Subscription Plans Create',
    slug: 'subscription-plans.create',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 6,
  },
  {
    name: 'Subscription Plans Update',
    displayName: 'Subscription Plans Update',
    slug: 'subscription-plans.update',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 7,
  },
  {
    name: 'Subscription Plans Delete',
    displayName: 'Subscription Plans Delete',
    slug: 'subscription-plans.delete',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 8,
  },
  {
    name: 'Purchase History View',
    displayName: 'Purchase History View',
    slug: 'purchase-history.view',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 9,
  },
  {
    name: 'Payments View',
    displayName: 'Payments View',
    slug: 'payments.view',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 10,
  },
  {
    name: 'Payment Methods View',
    displayName: 'Payment Methods View',
    slug: 'payment-methods.view',
    group: 'subscription-billing',
    groupOrder: 36,
    order: 11,
  },
];

// General System Modules
export const generalSystemModules = [
  {
    name: 'Report Module',
    displayName: 'Report Module',
    slug: 'report.module',
    group: 'module',
    groupOrder: 2,
    order: 35,
  },
  {
    name: 'Setting Module',
    displayName: 'Setting Module',
    slug: 'setting.module',
    group: 'module',
    groupOrder: 2,
    order: 36,
  },
  {
    name: 'Configure Module',
    displayName: 'Configure Module',
    slug: 'configure.module',
    group: 'module',
    groupOrder: 2,
    order: 37,
  },
];
