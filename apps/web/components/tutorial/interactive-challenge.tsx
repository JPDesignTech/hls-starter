'use client';

import * as React from 'react';
import { CheckCircle, XCircle, Lightbulb, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type ChallengeBlock } from '@/lib/tutorial';
import { completeChallenge } from '@/lib/tutorial-progress';

interface InteractiveChallengeProps {
  block: ChallengeBlock;
  challengeId: string;
  onComplete?: () => void;
}

export function InteractiveChallenge({ block, challengeId, onComplete }: InteractiveChallengeProps) {
  const [userCommand, setUserCommand] = React.useState('');
  const [showHint, setShowHint] = React.useState(false);
  const [hintIndex, setHintIndex] = React.useState(0);
  const [status, setStatus] = React.useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle');
  const [feedback, setFeedback] = React.useState('');

  const validateCommand = () => {
    setStatus('checking');
    
    // Simple validation - check if command contains required elements
    let isValid = false;
    
    if (block.validation) {
      const { type, value } = block.validation;
      const normalizedCommand = userCommand.toLowerCase().trim();
      const normalizedValue = value.toLowerCase();
      
      switch (type) {
        case 'exact':
          isValid = normalizedCommand === normalizedValue;
          break;
        case 'contains':
          isValid = normalizedCommand.includes(normalizedValue);
          break;
        case 'regex':
          try {
            const regex = new RegExp(value, 'i');
            isValid = regex.test(userCommand);
          } catch {
            isValid = false;
          }
          break;
      }
    } else {
      // Fallback: check if solution is contained in command
      isValid = userCommand.toLowerCase().includes(block.solution.toLowerCase());
    }
    
    setTimeout(() => {
      if (isValid) {
        setStatus('correct');
        setFeedback('Great job! Your command is correct.');
        completeChallenge(challengeId);
        if (onComplete) {
          setTimeout(() => onComplete(), 1000);
        }
      } else {
        setStatus('incorrect');
        setFeedback('Not quite right. Try again or check the hints!');
      }
    }, 500);
  };

  const showNextHint = () => {
    if (hintIndex < block.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
    setShowHint(true);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-purple-400" />
          {block.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">{block.description}</p>
        
        {/* Requirements */}
        {block.requirements && block.requirements.length > 0 && (
          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-white text-sm font-semibold mb-2">Requirements:</h4>
            <ul className="space-y-1">
              {block.requirements.map((req, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Input Area */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">Your FFMPEG Command:</label>
          <div className="flex gap-2">
            <Input
              value={userCommand}
              onChange={(e) => {
                setUserCommand(e.target.value);
                setStatus('idle');
                setFeedback('');
              }}
              placeholder="ffmpeg -i input.mp4 ..."
              className="bg-black/50 border-gray-700 text-white font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  validateCommand();
                }
              }}
            />
            <Button
              onClick={validateCommand}
              disabled={!userCommand.trim() || status === 'checking'}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {status === 'checking' ? 'Checking...' : 'Test Command'}
            </Button>
          </div>
        </div>

        {/* Feedback */}
        {status !== 'idle' && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            status === 'correct' 
              ? 'bg-green-900/30 border border-green-500/50' 
              : 'bg-red-900/30 border border-red-500/50'
          }`}>
            {status === 'correct' ? (
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm ${status === 'correct' ? 'text-green-300' : 'text-red-300'}`}>
                {feedback}
              </p>
              {status === 'correct' && (
                <div className="mt-2 p-2 bg-white/5 rounded">
                  <p className="text-gray-300 text-xs font-mono">{block.solution}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hints */}
        <div className="space-y-2">
          {!showHint && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowHint(true);
                setHintIndex(0);
              }}
              className="text-yellow-400 hover:text-yellow-300"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Show Hint
            </Button>
          )}
          
          {showHint && block.hints.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-300 text-sm font-semibold">Hint {hintIndex + 1}:</p>
              </div>
              <p className="text-yellow-200 text-sm ml-6">{block.hints[hintIndex]}</p>
              {hintIndex < block.hints.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={showNextHint}
                  className="mt-2 text-yellow-400 hover:text-yellow-300 text-xs"
                >
                  Show Next Hint ({hintIndex + 1}/{block.hints.length})
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
