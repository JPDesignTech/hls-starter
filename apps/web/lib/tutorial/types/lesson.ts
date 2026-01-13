/**
 * Lesson interface and metadata
 * Represents a single tutorial lesson with its content and metadata
 */

import { type ContentBlock } from './content-blocks';

export interface Lesson {
  id: string;
  title: string;
  module: string;
  duration: number; // minutes
  content: ContentBlock[];
  unlockAfter?: string; // lesson id prerequisite
}
