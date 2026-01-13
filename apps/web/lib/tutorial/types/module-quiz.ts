/**
 * Module Quiz types
 * Represents quiz questions and quizzes at the module level
 */

import { QuizBlock, ChallengeBlock } from './content-blocks';

export interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
  explanation: string;
  weight?: number; // Scoring weight (default: 1)
  source?: string; // Optional: lesson ID where this question came from
}

export interface CommandBuilderQuestion {
  type: 'command-builder';
  id: string;
  title: string;
  description: string;
  requirements: string[];
  hints: string[];
  solution: string;
  validation?: {
    type: 'exact' | 'contains' | 'regex';
    value: string;
  };
  weight?: number; // Scoring weight (default: 2, command builders worth more)
  explanation?: string; // Optional explanation shown after completion
  sampleVideoId?: string; // ID of sample video/audio to use for preview
  previewType?: 'resize' | 'crop' | 'format' | 'filter' | 'audio'; // Type of preview operation
  showPreview?: boolean; // Whether to show preview (default: true if sampleVideoId provided)
}

export type ModuleQuizQuestion = MultipleChoiceQuestion | CommandBuilderQuestion;

export interface ModuleQuiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  passingScore: number; // Minimum score to pass (0-100)
  questions: ModuleQuizQuestion[];
  timeLimit?: number; // Optional time limit in minutes
}

export interface QuestionScore {
  questionId: string;
  questionType: 'multiple-choice' | 'command-builder';
  correct: boolean;
  weight: number;
  pointsEarned: number;
  pointsPossible: number;
}

export interface QuizScore {
  score: number; // Final score (0-100)
  passed: boolean;
  attempts: number;
  bestScore: number; // Best score across all attempts
  timestamp: number; // Last attempt timestamp
  questionScores: QuestionScore[];
}
