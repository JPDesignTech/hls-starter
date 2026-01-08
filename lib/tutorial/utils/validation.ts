/**
 * Validation utilities for tutorial content
 */

import { Lesson, ContentBlock } from '../types';

/**
 * Validate a lesson structure
 */
export function validateLesson(lesson: Lesson): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!lesson.id || typeof lesson.id !== 'string') {
    errors.push('Lesson must have a valid id');
  }

  if (!lesson.title || typeof lesson.title !== 'string') {
    errors.push('Lesson must have a valid title');
  }

  if (!lesson.module || typeof lesson.module !== 'string') {
    errors.push('Lesson must have a valid module');
  }

  if (typeof lesson.duration !== 'number' || lesson.duration <= 0) {
    errors.push('Lesson must have a positive duration');
  }

  if (!Array.isArray(lesson.content) || lesson.content.length === 0) {
    errors.push('Lesson must have at least one content block');
  }

  // Validate content blocks
  lesson.content.forEach((block, index) => {
    const blockErrors = validateContentBlock(block);
    if (blockErrors.length > 0) {
      errors.push(`Content block ${index}: ${blockErrors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a content block structure
 */
export function validateContentBlock(block: ContentBlock): string[] {
  const errors: string[] = [];

  if (!block.type) {
    errors.push('Content block must have a type');
    return errors; // Can't validate further without type
  }

  switch (block.type) {
    case 'text':
      if (!('content' in block) || typeof block.content !== 'string') {
        errors.push('TextBlock must have content string');
      }
      break;

    case 'code':
      if (!('command' in block) || typeof block.command !== 'string') {
        errors.push('CodeBlock must have command string');
      }
      break;

    case 'challenge':
      if (!('title' in block) || typeof block.title !== 'string') {
        errors.push('ChallengeBlock must have title string');
      }
      if (!('description' in block) || typeof block.description !== 'string') {
        errors.push('ChallengeBlock must have description string');
      }
      if (!Array.isArray(block.requirements)) {
        errors.push('ChallengeBlock must have requirements array');
      }
      if (!Array.isArray(block.hints)) {
        errors.push('ChallengeBlock must have hints array');
      }
      if (!('solution' in block) || typeof block.solution !== 'string') {
        errors.push('ChallengeBlock must have solution string');
      }
      break;

    case 'quiz':
      if (!('question' in block) || typeof block.question !== 'string') {
        errors.push('QuizBlock must have question string');
      }
      if (!Array.isArray(block.options) || block.options.length === 0) {
        errors.push('QuizBlock must have at least one option');
      } else {
        const correctCount = block.options.filter(opt => opt.correct).length;
        if (correctCount !== 1) {
          errors.push('QuizBlock must have exactly one correct option');
        }
      }
      if (!('explanation' in block) || typeof block.explanation !== 'string') {
        errors.push('QuizBlock must have explanation string');
      }
      break;

    case 'introduction':
      if (!('heading' in block) || typeof block.heading !== 'string') {
        errors.push('IntroductionBlock must have heading string');
      }
      if (!('content' in block) || typeof block.content !== 'string') {
        errors.push('IntroductionBlock must have content string');
      }
      break;

    case 'bullets':
      if (!('heading' in block) || typeof block.heading !== 'string') {
        errors.push('BulletsBlock must have heading string');
      }
      if (!Array.isArray(block.bullets) || block.bullets.length === 0) {
        errors.push('BulletsBlock must have at least one bullet');
      }
      break;

    case 'preview':
      if (!('heading' in block) || typeof block.heading !== 'string') {
        errors.push('PreviewBlock must have heading string');
      }
      if (!('content' in block) || typeof block.content !== 'string') {
        errors.push('PreviewBlock must have content string');
      }
      if (!('code' in block) || typeof block.code !== 'string') {
        errors.push('PreviewBlock must have code string');
      }
      if (!('previewType' in block)) {
        errors.push('PreviewBlock must have previewType');
      }
      if (!('sampleVideoId' in block) || typeof block.sampleVideoId !== 'string') {
        errors.push('PreviewBlock must have sampleVideoId string');
      }
      break;

    default:
      errors.push(`Unknown content block type: ${(block as any).type}`);
  }

  return errors;
}

/**
 * Validate all lessons in the tutorial
 */
export function validateAllLessons(lessons: Lesson[]): { valid: boolean; errors: Array<{ lessonId: string; errors: string[] }> } {
  const allErrors: Array<{ lessonId: string; errors: string[] }> = [];

  lessons.forEach(lesson => {
    const validation = validateLesson(lesson);
    if (!validation.valid) {
      allErrors.push({
        lessonId: lesson.id,
        errors: validation.errors,
      });
    }
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}
