/**
 * Quiz scoring utilities
 * Handles calculation of quiz scores and validation
 */

import { ModuleQuizQuestion, QuestionScore, QuizScore } from '../types/module-quiz';

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  userAnswer?: string; // For multiple choice: option ID, for command builder: command string
}

/**
 * Calculate total possible points for a quiz
 */
export function calculateTotalPoints(questions: ModuleQuizQuestion[]): number {
  return questions.reduce((total, question) => {
    const weight = question.weight ?? (question.type === 'command-builder' ? 2 : 1);
    return total + weight;
  }, 0);
}

/**
 * Calculate score for a single question
 */
export function calculateQuestionScore(
  question: ModuleQuizQuestion,
  result: QuestionResult
): QuestionScore {
  const weight = question.weight ?? (question.type === 'command-builder' ? 2 : 1);
  const pointsPossible = weight;
  const pointsEarned = result.correct ? weight : 0;

  return {
    questionId: question.id,
    questionType: question.type,
    correct: result.correct,
    weight,
    pointsEarned,
    pointsPossible,
  };
}

/**
 * Calculate final quiz score from question results
 */
export function calculateQuizScore(
  questions: ModuleQuizQuestion[],
  results: QuestionResult[]
): {
  score: number;
  questionScores: QuestionScore[];
} {
  const questionScores = questions.map((question) => {
    const result = results.find((r) => r.questionId === question.id);
    if (!result) {
      // Question not answered - counts as incorrect
      return calculateQuestionScore(question, {
        questionId: question.id,
        correct: false,
      });
    }
    return calculateQuestionScore(question, result);
  });

  const totalPoints = calculateTotalPoints(questions);
  const earnedPoints = questionScores.reduce((sum, qs) => sum + qs.pointsEarned, 0);
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    score,
    questionScores,
  };
}

/**
 * Validate a multiple choice answer
 */
export function validateMultipleChoice(
  question: Extract<ModuleQuizQuestion, { type: 'multiple-choice' }>,
  selectedOptionId: string
): boolean {
  const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
  return selectedOption?.correct ?? false;
}

/**
 * Validate a command builder answer
 */
export function validateCommandBuilder(
  question: Extract<ModuleQuizQuestion, { type: 'command-builder' }>,
  userCommand: string
): boolean {
  if (!question.validation) {
    // Fallback: check if solution is contained in command
    return userCommand.toLowerCase().includes(question.solution.toLowerCase());
  }

  const { type, value } = question.validation;
  const normalizedCommand = userCommand.toLowerCase().trim();
  const normalizedValue = value.toLowerCase();

  switch (type) {
    case 'exact':
      return normalizedCommand === normalizedValue;
    case 'contains':
      return normalizedCommand.includes(normalizedValue);
    case 'regex':
      try {
        const regex = new RegExp(value, 'i');
        return regex.test(userCommand);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

/**
 * Check if a score passes the quiz
 */
export function isPassingScore(score: number, passingScore: number): boolean {
  return score >= passingScore;
}

/**
 * Merge new quiz score with existing best score
 */
export function mergeQuizScore(
  newScore: QuizScore,
  existingScore: QuizScore | null
): QuizScore {
  if (!existingScore) {
    return newScore;
  }

  return {
    ...newScore,
    bestScore: Math.max(newScore.score, existingScore.bestScore),
    attempts: existingScore.attempts + 1,
  };
}
