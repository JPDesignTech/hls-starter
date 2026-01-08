/**
 * Module interface and metadata
 * Represents a collection of related lessons grouped by topic
 */

import { Lesson } from './lesson';

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}
