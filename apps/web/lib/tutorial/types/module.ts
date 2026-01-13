/**
 * Module interface and metadata
 * Represents a collection of related lessons grouped by topic
 */

import { Lesson } from './lesson';
import { ModuleQuiz } from './module-quiz';

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  quiz?: ModuleQuiz; // Optional module quiz
}
