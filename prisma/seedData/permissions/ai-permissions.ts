// AI/ML Permissions

// AI/ML Module Permissions
export const aiMlPermissions = [
  // Module
  {
    name: 'AI/ML Module',
    displayName: 'AI/ML Module',
    slug: 'ai-ml.module',
    group: 'module',
    groupOrder: 2,
    order: 18,
  },
  // General AI Permissions
  {
    name: 'AI Generation View',
    displayName: 'AI Generation View',
    slug: 'ai-generation.view',
    group: 'ai-ml',
    groupOrder: 21,
    order: 1,
  },
  {
    name: 'AI Generation Create',
    displayName: 'AI Generation Create',
    slug: 'ai-generation.create',
    group: 'ai-ml',
    groupOrder: 21,
    order: 2,
  },
  {
    name: 'AI Prompt Management',
    displayName: 'AI Prompt Management',
    slug: 'ai-prompt.manage',
    group: 'ai-ml',
    groupOrder: 21,
    order: 3,
  },
  {
    name: 'AI Model Management',
    displayName: 'AI Model Management',
    slug: 'ai-model.manage',
    group: 'ai-ml',
    groupOrder: 21,
    order: 4,
  },
  {
    name: 'AI AB Test Management',
    displayName: 'AI AB Test Management',
    slug: 'ai-abtest.manage',
    group: 'ai-ml',
    groupOrder: 21,
    order: 5,
  },
  {
    name: 'AI Feedback View',
    displayName: 'AI Feedback View',
    slug: 'ai-feedback.view',
    group: 'ai-ml',
    groupOrder: 21,
    order: 6,
  },
];

// AI Models Permissions
export const aiModelPermissions = [
  // Module
  {
    name: 'AI Models Module',
    displayName: 'AI Models Module',
    slug: 'ai-models.module',
    group: 'module',
    groupOrder: 2,
    order: 19,
  },
  // CRUD
  {
    name: 'AI Model View',
    displayName: 'AI Model View',
    slug: 'ai-model.view',
    group: 'ai-model',
    groupOrder: 22,
    order: 1,
  },
  {
    name: 'AI Model Create',
    displayName: 'AI Model Create',
    slug: 'ai-model.create',
    group: 'ai-model',
    groupOrder: 22,
    order: 2,
  },
  {
    name: 'AI Model Update',
    displayName: 'AI Model Update',
    slug: 'ai-model.update',
    group: 'ai-model',
    groupOrder: 22,
    order: 3,
  },
  {
    name: 'AI Model Delete',
    displayName: 'AI Model Delete',
    slug: 'ai-model.delete',
    group: 'ai-model',
    groupOrder: 22,
    order: 4,
  },
  {
    name: 'AI Model Status',
    displayName: 'AI Model Status',
    slug: 'ai-model.status',
    group: 'ai-model',
    groupOrder: 22,
    order: 5,
  },
  {
    name: 'AI Model Configure',
    displayName: 'AI Model Configure',
    slug: 'ai-model.configure',
    group: 'ai-model',
    groupOrder: 22,
    order: 6,
  },
];

// AI Prompts Permissions
export const aiPromptPermissions = [
  // Module
  {
    name: 'AI Prompts Module',
    displayName: 'AI Prompts Module',
    slug: 'ai-prompts.module',
    group: 'module',
    groupOrder: 2,
    order: 20,
  },
  // CRUD
  {
    name: 'AI Prompt View',
    displayName: 'AI Prompt View',
    slug: 'ai-prompt.view',
    group: 'ai-prompt',
    groupOrder: 23,
    order: 1,
  },
  {
    name: 'AI Prompt Create',
    displayName: 'AI Prompt Create',
    slug: 'ai-prompt.create',
    group: 'ai-prompt',
    groupOrder: 23,
    order: 2,
  },
  {
    name: 'AI Prompt Update',
    displayName: 'AI Prompt Update',
    slug: 'ai-prompt.update',
    group: 'ai-prompt',
    groupOrder: 23,
    order: 3,
  },
  {
    name: 'AI Prompt Delete',
    displayName: 'AI Prompt Delete',
    slug: 'ai-prompt.delete',
    group: 'ai-prompt',
    groupOrder: 23,
    order: 4,
  },
  {
    name: 'AI Prompt Status',
    displayName: 'AI Prompt Status',
    slug: 'ai-prompt.status',
    group: 'ai-prompt',
    groupOrder: 23,
    order: 5,
  },
  {
    name: 'AI Prompt Set System',
    displayName: 'AI Prompt Set System',
    slug: 'ai-prompt.set-system',
    group: 'ai-prompt',
    groupOrder: 23,
    order: 6,
  },
  {
    name: 'AI Prompt Test',
    displayName: 'AI Prompt Test',
    slug: 'ai-prompt.test',
    group: 'ai-prompt',
    groupOrder: 23,
    order: 7,
  },
];

// AI AB Tests Permissions
export const aiABTestPermissions = [
  // Module
  {
    name: 'AI AB Tests Module',
    displayName: 'AI AB Tests Module',
    slug: 'ai-ab-tests.module',
    group: 'module',
    groupOrder: 2,
    order: 21,
  },
  // CRUD
  {
    name: 'AI AB Test View',
    displayName: 'AI AB Test View',
    slug: 'ai-abtest.view',
    group: 'ai-abtest',
    groupOrder: 24,
    order: 1,
  },
  {
    name: 'AI AB Test Create',
    displayName: 'AI AB Test Create',
    slug: 'ai-abtest.create',
    group: 'ai-abtest',
    groupOrder: 24,
    order: 2,
  },
  {
    name: 'AI AB Test Update',
    displayName: 'AI AB Test Update',
    slug: 'ai-abtest.update',
    group: 'ai-abtest',
    groupOrder: 24,
    order: 3,
  },
  {
    name: 'AI AB Test Delete',
    displayName: 'AI AB Test Delete',
    slug: 'ai-abtest.delete',
    group: 'ai-abtest',
    groupOrder: 24,
    order: 4,
  },
  {
    name: 'AI AB Test Start',
    displayName: 'AI AB Test Start',
    slug: 'ai-abtest.start',
    group: 'ai-abtest',
    groupOrder: 24,
    order: 5,
  },
  {
    name: 'AI AB Test Stop',
    displayName: 'AI AB Test Stop',
    slug: 'ai-abtest.stop',
    group: 'ai-abtest',
    groupOrder: 24,
    order: 6,
  },
  {
    name: 'AI AB Test Results',
    displayName: 'AI AB Test Results',
    slug: 'ai-abtest.results',
    group: 'ai-abtest',
    groupOrder: 24,
    order: 7,
  },
];
