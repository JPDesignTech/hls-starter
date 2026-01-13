/**
 * Query utilities for tutorial lessons
 */

import { Lesson, Module } from '../types';
import { lessons, modules } from '../data';

/**
 * Get a lesson by its ID
 */
export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(lesson => lesson.id === id);
}

/**
 * Get all lessons in a specific module
 */
export function getLessonsByModule(module: string): Lesson[] {
  return lessons.filter(lesson => lesson.module === module);
}

/**
 * Get all unique module names
 */
export function getModules(): string[] {
  return Array.from(new Set(lessons.map(lesson => lesson.module)));
}

/**
 * Get a module by its ID
 */
export function getModuleById(id: string): Module | undefined {
  return modules.find(module => module.id === id);
}

/**
 * Get the next lesson after a given lesson ID
 */
export function getNextLesson(currentLessonId: string): Lesson | undefined {
  const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return undefined;
  }
  return lessons[currentIndex + 1];
}

/**
 * Get the previous lesson before a given lesson ID
 */
export function getPreviousLesson(currentLessonId: string): Lesson | undefined {
  const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
  if (currentIndex <= 0) {
    return undefined;
  }
  return lessons[currentIndex - 1];
}
