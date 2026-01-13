'use client';

import * as React from 'react';
import { type ModuleQuiz, ModuleQuizQuestion, type QuizScore } from '@/lib/tutorial/types/module-quiz';
import { type QuestionResult } from '@/lib/tutorial/utils/quiz-scoring';
import { QuizQuestionWrapper } from './quiz-question-wrapper';
import { QuizResults } from './quiz-results';
import { calculateQuizScore, validateMultipleChoice, validateCommandBuilder } from '@/lib/tutorial/utils/quiz-scoring';
import { recordModuleQuizScore, getModuleQuizScore } from '@/lib/tutorial-progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ModuleQuizComponentProps {
  quiz: ModuleQuiz;
  moduleTitle?: string;
  onComplete?: () => void;
}

export function ModuleQuizComponent({
  quiz,
  moduleTitle,
  onComplete,
}: ModuleQuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [questionResults, setQuestionResults] = React.useState<QuestionResult[]>([]);
  const [showResults, setShowResults] = React.useState(false);
  const [finalScore, setFinalScore] = React.useState<QuizScore | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, { correct: boolean; answer: string }>>({});
  const questionNumbersRef = React.useRef<HTMLDivElement>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const allQuestionsAnswered = questionResults.length === quiz.questions.length;

  // Scroll to current question when it changes
  React.useEffect(() => {
    if (questionNumbersRef.current) {
      const currentButton = questionNumbersRef.current.children[currentQuestionIndex] as HTMLElement;
      if (currentButton) {
        currentButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentQuestionIndex]);

  const handleAnswer = (questionId: string, correct: boolean, userAnswer: string) => {
    // Store the answer
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { correct, answer: userAnswer },
    }));

    // Add to results if not already present
    setQuestionResults((prev) => {
      if (prev.some((r) => r.questionId === questionId)) {
        return prev.map((r) =>
          r.questionId === questionId
            ? { ...r, correct, userAnswer }
            : r
        );
      }
      return [...prev, { questionId, correct, userAnswer }];
    });

    // Auto-advance to next question after a short delay (for multiple choice)
    if (currentQuestion.type === 'multiple-choice' && correct) {
      setTimeout(() => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          // Last question, check if we can finish
          finishQuiz();
        }
      }, 1500);
    }
  };

  const finishQuiz = () => {
    // Ensure all questions have results (mark unanswered as incorrect)
    const allResults: QuestionResult[] = quiz.questions.map((q) => {
      const existing = questionResults.find((r) => r.questionId === q.id);
      if (existing) return existing;

      // Default to incorrect if not answered
      return {
        questionId: q.id,
        correct: false,
        userAnswer: '',
      };
    });

    // Calculate final score
    const { score, questionScores } = calculateQuizScore(quiz.questions, allResults);
    const passed = score >= quiz.passingScore;

    const quizScore: QuizScore = {
      score,
      passed,
      attempts: 1, // Will be updated by recordModuleQuizScore
      bestScore: score,
      timestamp: Date.now(),
      questionScores,
    };

    // Merge with existing score if any
    const existingScore = getModuleQuizScore(quiz.moduleId);
    if (existingScore) {
      quizScore.attempts = existingScore.attempts + 1;
      quizScore.bestScore = Math.max(score, existingScore.bestScore);
    }

    // Record the score
    recordModuleQuizScore(quiz.moduleId, quizScore);

    setFinalScore(quizScore);
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setQuestionResults([]);
    setShowResults(false);
    setFinalScore(null);
    setAnswers({});
  };

  if (showResults && finalScore) {
    return (
      <QuizResults
        score={finalScore}
        passingScore={quiz.passingScore}
        questions={quiz.questions}
        onRetry={handleRetry}
        onContinue={onComplete}
        moduleTitle={moduleTitle}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card className="bg-purple-950/30 border border-purple-700/30 rounded-xl p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-white text-2xl mb-2">{quiz.title}</CardTitle>
          <p className="text-gray-300 text-sm">{quiz.description}</p>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-white">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-purple-950/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Quiz Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <AlertCircle className="h-4 w-4" />
              <span>Passing Score: {quiz.passingScore}%</span>
            </div>
            <div className="text-white/60">
              Total Questions: {quiz.questions.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <QuizQuestionWrapper
        key={currentQuestion.id}
        question={currentQuestion}
        questionIndex={currentQuestionIndex}
        totalQuestions={quiz.questions.length}
        onAnswer={handleAnswer}
        showWeight={true}
      />

      {/* Navigation */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-purple-900/30 border border-purple-700/30 text-white rounded-lg hover:bg-purple-800/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          Previous
        </button>

        {/* Scrollable Question Numbers Container */}
        <div className="flex-1 relative">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-purple-900 via-purple-900/80 to-transparent pointer-events-none z-10" />
          
          {/* Scrollable question numbers */}
          <div
            ref={questionNumbersRef}
            className="flex gap-2 overflow-x-auto px-2 py-1 hide-scrollbar"
          >
            {quiz.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              const isCorrect = answers[q.id]?.correct;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-full text-xs transition-all flex-shrink-0 ${
                    isCurrent
                      ? 'bg-purple-500 border-2 border-purple-300 text-white'
                      : isAnswered
                      ? isCorrect
                        ? 'bg-green-500/30 border border-green-400/50 text-green-300'
                        : 'bg-red-500/30 border border-red-400/50 text-red-300'
                      : 'bg-purple-950/30 border border-purple-700/30 text-white/60 hover:bg-purple-900/30'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-purple-900 via-purple-900/80 to-transparent pointer-events-none z-10" />
        </div>

        <button
          onClick={currentQuestionIndex === quiz.questions.length - 1 ? finishQuiz : handleNext}
          disabled={
            currentQuestionIndex === quiz.questions.length - 1
              ? !answers[currentQuestion.id]
              : false
          }
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
        </button>
      </div>
    </div>
  );
}
