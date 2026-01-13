'use client';

import * as React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizBlock } from '@/lib/tutorial';
import { recordQuizScore } from '@/lib/tutorial-progress';

interface QuizComponentProps {
  block: QuizBlock;
  lessonId: string;
  onComplete?: () => void;
  onAnswer?: (selectedOptionId: string, isCorrect: boolean) => void;
}

export function QuizComponent({ block, lessonId, onComplete, onAnswer }: QuizComponentProps) {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isChecked, setIsChecked] = React.useState(false);
  const [showExplanation, setShowExplanation] = React.useState(false);

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    
    setIsChecked(true);
    setShowExplanation(true);
    
    const selected = block.options.find(opt => opt.id === selectedOption);
    const isCorrect = selected?.correct || false;
    
    // Calculate score (100% if correct, 0% if incorrect)
    const score = isCorrect ? 100 : 0;
    recordQuizScore(lessonId, score);
    
    // Notify parent of answer (for quiz context)
    if (onAnswer) {
      onAnswer(selectedOption, isCorrect);
    }
    
    if (isCorrect && onComplete) {
      setTimeout(() => onComplete(), 1500);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsChecked(false);
    setShowExplanation(false);
  };

  const selectedOptionData = selectedOption 
    ? block.options.find(opt => opt.id === selectedOption)
    : null;
  const isCorrect = selectedOptionData?.correct || false;

  return (
    <Card className="bg-purple-900/30 border border-purple-600/30 rounded-xl p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-500/30 border border-purple-400 flex items-center justify-center">
            <span className="text-purple-300 text-xs">?</span>
          </div>
          Knowledge Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <p className="text-white mb-4">{block.question}</p>
        
        {/* Options */}
        <div className="space-y-2 mb-4">
          {block.options.map((option, optIndex) => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.correct;
            const showResult = isChecked;
            
            let optionStyle = 'bg-purple-950/30 border-purple-700/30 hover:bg-purple-900/30';
            
            if (showResult && isCorrect) {
              optionStyle = 'bg-green-500/20 border-green-400/50';
            } else if (showResult && isSelected && !isCorrect) {
              optionStyle = 'bg-red-500/20 border-red-400/50';
            } else if (isSelected) {
              optionStyle = 'bg-purple-600/30 border-purple-400';
            }
            
            return (
              <button
                key={option.id}
                onClick={() => !isChecked && setSelectedOption(option.id)}
                disabled={isChecked}
                className={`w-full text-left p-4 rounded-lg border transition-all ${optionStyle} ${
                  isChecked ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-purple-400 bg-purple-500/30' : 'border-purple-600'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>}
                  </div>
                  <span className="text-white">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Check Button */}
        {!isChecked && selectedOption && (
          <Button
            onClick={handleCheckAnswer}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all"
          >
            Check Answer
          </Button>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className={`p-4 rounded-lg ${
            isCorrect 
              ? 'bg-green-900/30 border border-green-500/50' 
              : 'bg-red-900/30 border border-red-500/50'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-semibold mb-2 ${
                  isCorrect ? 'text-green-300' : 'text-red-300'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-gray-300 text-sm">{block.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        {isChecked && !isCorrect && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full border-gray-700 text-gray-300 hover:bg-white/10"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
