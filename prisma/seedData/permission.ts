import {
  corePermissions,
  adminCrudPermissions,
  userCrudPermissions,
  roleCrudPermissions,
  permissionCrudPermissions,
  profilePermissions,
} from './permissions/core-permissions';

import {
  addressPermissions,
  sessionPermissions,
  languagePermissions,
  countryPermissions,
  auditLogPermissions,
} from './permissions/data-permissions';

import {
  customerPermissions,
  invoicePermissions,
  invoiceItemPermissions,
  paymentPermissions,
  invoiceDraftPermissions,
  smartItemPermissions,
  invoiceSnippetPermissions,
  emailPermissions,
} from './permissions/invoice-permissions';

import {
  aiMlPermissions,
  aiModelPermissions,
  aiPromptPermissions,
  aiABTestPermissions,
} from './permissions/ai-permissions';

import {
  creditsPermissions,
  creditTransactionPermissions,
  gamificationPermissions,
  notificationPermissions,
  contactPermissions,
  userSettingsPermissions,
  apiUsagePermissions,
} from './permissions/feature-permissions';

import {
  fileManagementPermissions,
  systemAdministrationPermissions,
  analyticsPermissions,
  invoiceTemplatePermissions,
  emailTemplatePermissions,
  subscriptionPermissions,
  generalSystemModules,
} from './permissions/system-permissions';

interface Permission {
  name: string;
  displayName: string;
  slug: string;
  group: string;
  groupOrder: number;
  order: number;
}

// Combine all permissions
export const permissionSeeds: Permission[] = [
  // Core permissions
  ...corePermissions,
  ...adminCrudPermissions,
  ...userCrudPermissions,
  ...roleCrudPermissions,
  ...permissionCrudPermissions,
  ...profilePermissions,

  // Data management permissions
  ...addressPermissions,
  ...sessionPermissions,
  ...languagePermissions,
  ...countryPermissions,
  ...auditLogPermissions,

  // Invoice management permissions
  ...customerPermissions,
  ...invoicePermissions,
  ...invoiceItemPermissions,
  ...paymentPermissions,
  ...invoiceDraftPermissions,
  ...smartItemPermissions,
  ...invoiceSnippetPermissions,
  ...emailPermissions,

  // AI/ML permissions
  ...aiMlPermissions,
  ...aiModelPermissions,
  ...aiPromptPermissions,
  ...aiABTestPermissions,

  // Feature-specific permissions
  ...creditsPermissions,
  ...creditTransactionPermissions,
  ...gamificationPermissions,
  ...notificationPermissions,
  ...contactPermissions,
  ...userSettingsPermissions,
  ...apiUsagePermissions,

  // System and administrative permissions
  ...fileManagementPermissions,
  ...systemAdministrationPermissions,
  ...analyticsPermissions,
  ...invoiceTemplatePermissions,
  ...emailTemplatePermissions,
  ...subscriptionPermissions,
  ...generalSystemModules,
];
