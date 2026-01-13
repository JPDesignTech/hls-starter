/**
 * Navigation utilities for tutorial lessons
 */

import { Lesson } from '../types';
import { lessons } from '../data';
import { isLessonUnlocked } from '../../tutorial-progress';

/**
 * Check if a lesson can be accessed (unlocked)
 */
export function canAccessLesson(lessonId: string): boolean {
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) {
    return false;
  }
  
  if (!lesson.unlockAfter) {
    return true; // First lesson or no prerequisites
  }
  
  return isLessonUnlocked(lessonId, lesson.unlockAfter);
}

/**
 * Get all accessible lessons for a user
 */
export function getAccessibleLessons(): Lesson[] {
  return lessons.filter(lesson => canAccessLesson(lesson.id));
}

/**
 * Get the first accessible lesson
 */
export function getFirstLesson(): Lesson | undefined {
  return lessons.find(lesson => canAccessLesson(lesson.id));
}

/**
 * Get lesson index in the lessons array
 */
export function getLessonIndex(lessonId: string): number {
  return lessons.findIndex(l => l.id === lessonId);
}
