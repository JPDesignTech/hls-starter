/**
 * Module Index Template
 * 
 * This file shows how to structure a module index.ts file.
 * Copy this structure when creating a new module.
 * 
 * Steps to create a new module:
 * 1. Create module directory: lib/tutorial/data/modules/{module-name}/
 * 2. Create lesson files in that directory
 * 3. Create index.ts file using this template
 * 4. Update lib/tutorial/data/index.ts to include the new module
 */

import { Module } from '@/lib/tutorial/types';
import { lesson1 } from './lesson-1';
import { lesson2 } from './lesson-2';
import { lesson3 } from './lesson-3';
// TODO: Import all lessons in the module

export const moduleNameModule: Module = {
  id: 'module-name', // TODO: kebab-case, matches directory name
  title: 'Module Name', // TODO: Human-readable module name
  description: 'Brief description of what this module covers and what users will learn.',
  lessons: [
    lesson1,
    lesson2,
    lesson3,
    // TODO: Add all lessons in order
  ]
};

/**
 * Module Guidelines:
 * 
 * - Module ID should match the directory name (kebab-case)
 * - Module title should be human-readable (Title Case)
 * - Description should be 1-2 sentences explaining the module's purpose
 * - Lessons array should be in the order users should complete them
 * - Each lesson should be imported from its individual file
 * - Export name should be camelCase: {moduleName}Module
 */
