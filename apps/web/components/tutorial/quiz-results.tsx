'use client';

import * as React from 'react';
import { Trophy, CheckCircle, XCircle, RotateCcw, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizScore, ModuleQuizQuestion } from '@/lib/tutorial/types/module-quiz';
import { isPassingScore } from '@/lib/tutorial/utils/quiz-scoring';

interface QuizResultsProps {
  score: QuizScore;
  passingScore: number;
  questions: ModuleQuizQuestion[];
  onRetry: () => void;
  onContinue?: () => void;
  moduleTitle?: string;
}

export function QuizResults({
  score,
  passingScore,
  questions,
  onRetry,
  onContinue,
  moduleTitle,
}: QuizResultsProps) {
  const passed = isPassingScore(score.score, passingScore);
  const isPerfect = score.score === 100;

  // Calculate breakdown by question type
  const multipleChoiceResults = score.questionScores.filter(
    (qs) => qs.questionType === 'multiple-choice'
  );
  const commandBuilderResults = score.questionScores.filter(
    (qs) => qs.questionType === 'command-builder'
  );

  const mcCorrect = multipleChoiceResults.filter((r) => r.correct).length;
  const mcTotal = multipleChoiceResults.length;
  const cbCorrect = commandBuilderResults.filter((r) => r.correct).length;
  const cbTotal = commandBuilderResults.length;

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 rounded-xl p-6">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          {isPerfect ? (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          ) : passed ? (
            <div className="w-20 h-20 rounded-full bg-green-500/30 border-4 border-green-400 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-500/30 border-4 border-red-400 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
          )}
        </div>
        <CardTitle className="text-white text-2xl mb-2">
          {isPerfect ? 'Perfect Score! 🎉' : passed ? 'Quiz Passed! ✅' : 'Quiz Not Passed'}
        </CardTitle>
        <div className="text-4xl font-bold text-white mb-2">{score.score}%</div>
        <p className="text-gray-300 text-sm">
          Passing Score: {passingScore}% | Attempt #{score.attempts}
          {score.bestScore !== score.score && (
            <span className="ml-2 text-purple-400">Best: {score.bestScore}%</span>
          )}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Breakdown */}
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <h3 className="text-white font-semibold">Score Breakdown</h3>
          </div>

          {/* Multiple Choice Breakdown */}
          {mcTotal > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Multiple Choice Questions</span>
                <span className="text-white font-medium">
                  {mcCorrect}/{mcTotal} correct
                </span>
              </div>
              <div className="w-full bg-purple-950/50 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${(mcCorrect / mcTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Command Builder Breakdown */}
          {cbTotal > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Command Builder Questions</span>
                <span className="text-white font-medium">
                  {cbCorrect}/{cbTotal} correct
                </span>
              </div>
              <div className="w-full bg-purple-950/50 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${(cbCorrect / cbTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Overall Progress Bar */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">Overall Score</span>
              <span className="text-white font-bold">{score.score}%</span>
            </div>
            <div className="w-full bg-purple-950/50 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  passed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${score.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question-by-Question Results */}
        <div className="bg-white/5 rounded-lg p-4 space-y-2">
          <h3 className="text-white font-semibold mb-3">Question Results</h3>
          <div className="space-y-2">
            {score.questionScores.map((qs, index) => {
              const question = questions.find((q) => q.id === qs.questionId);
              return (
                <div
                  key={qs.questionId}
                  className="flex items-center justify-between p-2 rounded bg-white/5"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-white/60 text-sm w-6">#{index + 1}</span>
                    <span className="text-white text-sm truncate">
                      {question?.type === 'multiple-choice'
                        ? (question as Extract<ModuleQuizQuestion, { type: 'multiple-choice' }>).question
                        : (question as Extract<ModuleQuizQuestion, { type: 'command-builder' }>).title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-xs">
                      {qs.pointsEarned}/{qs.pointsPossible} pts
                    </span>
                    {qs.correct ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!passed && (
            <Button
              onClick={onRetry}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {passed && onContinue && (
            <Button
              onClick={onContinue}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Continue to Next Module
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {passed && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-white/10"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
          )}
        </div>

        {/* Encouragement Message */}
        {!passed && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-200 text-sm text-center">
              Don't worry! Review the module lessons and try again. You need {passingScore}% to pass.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
