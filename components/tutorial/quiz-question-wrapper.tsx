'use client';

import * as React from 'react';
import { ModuleQuizQuestion } from '@/lib/tutorial/types/module-quiz';
import { QuizComponent } from './quiz-component';
import { InteractiveChallenge } from './interactive-challenge';
import { validateMultipleChoice, validateCommandBuilder } from '@/lib/tutorial/utils/quiz-scoring';
import { Play, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';

interface QuizQuestionWrapperProps {
  question: ModuleQuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (questionId: string, correct: boolean, userAnswer: string) => void;
  showWeight?: boolean;
}

export function QuizQuestionWrapper({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  showWeight = true,
}: QuizQuestionWrapperProps) {
  const weight = question.weight ?? (question.type === 'command-builder' ? 2 : 1);

  if (question.type === 'multiple-choice') {
    // Convert ModuleQuizQuestion to QuizBlock format for QuizComponent
    const quizBlock = {
      type: 'quiz' as const,
      question: question.question,
      options: question.options,
      explanation: question.explanation,
    };

    return (
      <div className="space-y-2">
        {showWeight && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-purple-400 text-xs font-medium">
              Weight: {weight} point{weight !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <QuizComponent
          key={question.id}
          block={quizBlock}
          lessonId={`quiz-${question.id}`}
          onAnswer={(selectedOptionId, isCorrect) => {
            onAnswer(question.id, isCorrect, selectedOptionId);
          }}
          onComplete={() => {
            // This will be handled by the parent component tracking answers
          }}
        />
      </div>
    );
  }

  if (question.type === 'command-builder') {
    // Convert ModuleQuizQuestion to ChallengeBlock format for InteractiveChallenge
    const challengeBlock = {
      type: 'challenge' as const,
      title: question.title,
      description: question.description,
      requirements: question.requirements,
      hints: question.hints,
      solution: question.solution,
      validation: question.validation,
    };

    return (
      <div className="space-y-2">
        {showWeight && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-purple-400 text-xs font-medium">
              Weight: {weight} point{weight !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <CommandBuilderQuestion
          key={question.id}
          question={question}
          challengeBlock={challengeBlock}
          onAnswer={onAnswer}
        />
      </div>
    );
  }

  return null;
}

// Preview result interface for FFmpeg
interface PreviewResult {
  originalUrl: string;
  processedUrl: string;
  originalSize: number;
  processedSize: number;
  originalDimensions: { width: number; height: number };
  processedDimensions: { width: number; height: number };
  executionTime: number;
}

// Preview result interface for FFProbe
interface FFProbePreviewResult {
  output: string;
  outputType: 'text' | 'json' | 'csv';
  executionTime: number;
  success: boolean;
}

// Wrapper for command builder that tracks answers
function CommandBuilderQuestion({
  question,
  challengeBlock,
  onAnswer,
}: {
  question: Extract<ModuleQuizQuestion, { type: 'command-builder' }>;
  challengeBlock: {
    type: 'challenge';
    title: string;
    description: string;
    requirements: string[];
    hints: string[];
    solution: string;
    validation?: {
      type: 'exact' | 'contains' | 'regex';
      value: string;
    };
  };
  onAnswer: (questionId: string, correct: boolean, userAnswer: string) => void;
}) {
  const [userCommand, setUserCommand] = React.useState('');
  const [showHint, setShowHint] = React.useState(false);
  const [hintIndex, setHintIndex] = React.useState(0);
  const [status, setStatus] = React.useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle');
  const [feedback, setFeedback] = React.useState('');
  const [hasAnswered, setHasAnswered] = React.useState(false);
  
  // Preview state
  const [isPreviewProcessing, setIsPreviewProcessing] = React.useState(false);
  const [previewResult, setPreviewResult] = React.useState<PreviewResult | null>(null);
  const [ffprobePreviewResult, setFFProbePreviewResult] = React.useState<FFProbePreviewResult | null>(null);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  const [errorType, setErrorType] = React.useState<'syntax' | 'execution' | 'validation' | null>(null);
  const [hasTestedFFPlayCommand, setHasTestedFFPlayCommand] = React.useState(false);
  
  const shouldShowPreview = question.sampleVideoId && (question.showPreview !== false);
  const previewType = question.previewType || 'filter';
  
  // Detect if this is an FFProbe question (check solution or current command)
  const isFFProbeQuestion = challengeBlock.solution?.trim().startsWith('ffprobe') || false;
  const isFFProbeCommand = (command: string): boolean => {
    return command.trim().startsWith('ffprobe');
  };
  
  // Determine if we should show FFProbe preview (either question is FFProbe or command starts with ffprobe)
  const showFFProbePreview = isFFProbeQuestion || isFFProbeCommand(userCommand);

  // Detect if this is an FFPlay question (check solution or current command)
  const isFFPlayQuestion = challengeBlock.solution?.trim().startsWith('ffplay') || false;
  const isFFPlayCommand = (command: string): boolean => {
    return command.trim().startsWith('ffplay');
  };
  
  // Determine if we should show FFPlay preview (either question is FFPlay or command starts with ffplay)
  const showFFPlayPreview = isFFPlayQuestion || isFFPlayCommand(userCommand);

  // Validate command syntax
  const validateSyntax = (command: string): { valid: boolean; error?: string } => {
    const trimmed = command.trim();
    const isFFProbe = isFFProbeCommand(trimmed);
    
    // Must start with ffmpeg, ffprobe, or ffplay
    if (!trimmed.startsWith('ffmpeg') && !trimmed.startsWith('ffprobe') && !trimmed.startsWith('ffplay')) {
      return { valid: false, error: 'Command must start with "ffmpeg", "ffprobe", or "ffplay"' };
    }
    
    const isFFPlay = isFFPlayCommand(trimmed);
    
    // FFProbe and FFPlay commands don't always need -i (can use input file directly)
    if (isFFProbe || isFFPlay) {
      // Check for input file reference (either -i flag or direct file reference)
      if (!trimmed.includes('-i') && !trimmed.match(/input\.(mp4|mp3|wav|avi|mov)/i) && !trimmed.match(/sample\.(mp4|mp3|wav|avi|mov)/i)) {
        return { valid: false, error: `${isFFProbe ? 'FFProbe' : 'FFPlay'} command must include an input file` };
      }
    } else {
      // FFmpeg commands must have input file flag
      if (!trimmed.includes('-i')) {
        return { valid: false, error: 'Command must include an input file flag (-i)' };
      }
      
      // Basic structure check - should have input and output
      const parts = trimmed.split(/\s+/);
      const inputIndex = parts.findIndex(p => p === '-i');
      if (inputIndex === -1 || inputIndex === parts.length - 1) {
        return { valid: false, error: 'Command must specify an input file after -i flag' };
      }
    }
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /rm\s+-rf/,
      /del\s+\/f/,
      /format\s+c:/i,
      /mkfs/,
      /dd\s+if=/,
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return { valid: false, error: 'Command contains potentially dangerous operations' };
      }
    }
    
    return { valid: true };
  };

  const showNextHint = () => {
    if (hintIndex < challengeBlock.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
    setShowHint(true);
  };

  // Combined test command function
  const testCommand = async () => {
    if (hasAnswered && status === 'correct') return;
    if (!userCommand.trim()) return;
    
    // Reset states
    setStatus('checking');
    setPreviewError(null);
    setErrorType(null);
    setPreviewResult(null);
    setIsPreviewProcessing(true);
    
    // Step 1: Validate syntax
    const syntaxCheck = validateSyntax(userCommand);
    if (!syntaxCheck.valid) {
      setStatus('incorrect');
      setFeedback(syntaxCheck.error || 'Invalid command syntax. Please check your FFmpeg command.');
      setErrorType('syntax');
      setIsPreviewProcessing(false);
      return;
    }
    
    // Step 2: Execute command (if preview is enabled)
    if (shouldShowPreview && question.sampleVideoId) {
      try {
        const isFFProbe = showFFProbePreview;
        const apiEndpoint = isFFProbe ? '/api/tutorial/execute-ffprobe' : '/api/tutorial/execute';
        
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sampleVideoId: question.sampleVideoId,
            command: userCommand,
            ...(isFFProbe ? {} : { previewType: previewType }),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to ${isFFProbe ? 'execute' : 'process'} command`);
        }

        if (isFFProbe) {
          setFFProbePreviewResult(data);
          setPreviewResult(null);
        } else {
          setPreviewResult(data);
          setFFProbePreviewResult(null);
        }
        setPreviewError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setPreviewError(errorMessage);
        setErrorType('execution');
        setStatus('incorrect');
        setFeedback(`Command execution failed: ${errorMessage}`);
        setIsPreviewProcessing(false);
        setPreviewResult(null);
        setFFProbePreviewResult(null);
        return;
      }
    }
    
    setIsPreviewProcessing(false);
    
    // Step 3: Validate against quiz requirements
    const isValid = validateCommandBuilder(question, userCommand);
    
    // For FFPlay commands, mark as tested if validation passes
    if (showFFPlayPreview && isValid) {
      setHasTestedFFPlayCommand(true);
    }
    
    setTimeout(() => {
      if (isValid) {
        setStatus('correct');
        setFeedback('Great job! Your command is correct.');
        setHasAnswered(true);
        setErrorType(null);
      } else {
        setStatus('incorrect');
        setFeedback('Command executed successfully but doesn\'t meet the requirements. Try again or check the hints!');
        setErrorType('validation');
      }
      
      // Notify parent of answer
      onAnswer(question.id, isValid, userCommand);
    }, 500);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPreviewTypeLabel = () => {
    switch (previewType) {
      case 'resize':
        return previewResult?.processedDimensions
          ? `${previewResult.processedDimensions.width}x${previewResult.processedDimensions.height} Preview`
          : 'Resized Preview';
      case 'crop':
        return 'Cropped Preview';
      case 'format':
        return 'Converted Preview';
      case 'filter':
        return 'Filtered Preview';
      case 'audio':
        return 'Audio Preview';
      default:
        return 'Processed Preview';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-purple-500/30 border border-purple-400 flex items-center justify-center">
          <span className="text-purple-300 text-xs">⚡</span>
        </div>
        <h3 className="text-white font-semibold">{challengeBlock.title}</h3>
      </div>
      
      <p className="text-gray-300">{challengeBlock.description}</p>
      
      {/* Requirements */}
      {challengeBlock.requirements && challengeBlock.requirements.length > 0 && (
        <div className="bg-white/5 rounded-lg p-3">
          <h4 className="text-white text-sm font-semibold mb-2">Requirements:</h4>
          <ul className="space-y-1">
            {challengeBlock.requirements.map((req, index) => (
              <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview Section */}
      {shouldShowPreview && (
        <div className="bg-indigo-950/30 border border-indigo-600/30 rounded-lg p-4 space-y-4">
          <h4 className="text-white text-sm font-semibold">
            {showFFProbePreview ? 'Preview' : 'Preview'}
          </h4>
          
          {/* FFPlay Video Preview */}
          {showFFPlayPreview ? (
            <div className="bg-gray-950/50 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-2">Video Preview</div>
              <div className="bg-gray-800 rounded aspect-video overflow-hidden">
                {hasTestedFFPlayCommand && question.sampleVideoId ? (
                  <VideoPlayer
                    src={`/tutorial-samples/${question.sampleVideoId}.mp4`}
                    className="w-full h-full"
                    autoPlay={false}
                    muted={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white/40 text-xs text-center px-4">
                      Test your command to see the video preview
                    </div>
                  </div>
                )}
              </div>
              <div className="text-white/40 text-xs mt-2">
                {hasTestedFFPlayCommand && question.sampleVideoId 
                  ? `${question.sampleVideoId}.mp4` 
                  : 'Preview will appear after testing your command'}
              </div>
            </div>
          ) : showFFProbePreview ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Input Video Preview */}
              <div className="bg-gray-950/50 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-2">Input Video</div>
                <div className="bg-gray-800 rounded aspect-video overflow-hidden">
                  {question.sampleVideoId ? (
                    <VideoPlayer
                      src={`/tutorial-samples/${question.sampleVideoId}.mp4`}
                      className="w-full h-full"
                      autoPlay={false}
                      muted={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-white/40 text-xs">Sample file</div>
                    </div>
                  )}
                </div>
                <div className="text-white/40 text-xs mt-2">
                  {question.sampleVideoId ? `${question.sampleVideoId}.mp4` : 'Sample file'}
                </div>
              </div>

              {/* Command Output Display */}
              <div className="bg-gray-950/50 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-2">Command Output</div>
                <div className="bg-black/50 rounded border border-gray-700 p-3 max-h-96 overflow-auto">
                  {isPreviewProcessing ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                      <span className="ml-2 text-white/60 text-sm">Executing command...</span>
                    </div>
                  ) : ffprobePreviewResult?.output ? (
                    <pre className="text-white text-xs font-mono whitespace-pre-wrap break-words">
                      {ffprobePreviewResult.outputType === 'json' 
                        ? JSON.stringify(JSON.parse(ffprobePreviewResult.output), null, 2)
                        : ffprobePreviewResult.output
                      }
                    </pre>
                  ) : (
                    <div className="text-white/40 text-xs py-4 text-center">
                      Execute your command to see the output here
                    </div>
                  )}
                </div>
                {ffprobePreviewResult && (
                  <div className="text-white/40 text-xs mt-2">
                    Executed in {ffprobePreviewResult.executionTime.toFixed(2)}s • Output type: {ffprobePreviewResult.outputType.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* FFmpeg Video/Audio Preview */
            <div className="grid md:grid-cols-2 gap-4">
            {/* Original Preview */}
            <div className="bg-gray-950/50 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-2">Original</div>
              <div className="bg-gray-800 rounded aspect-video overflow-hidden">
                {(previewResult?.originalUrl || question.sampleVideoId) ? (
                  previewType === 'audio' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <audio controls className="w-full">
                        <source src={previewResult?.originalUrl || `/tutorial-samples/${question.sampleVideoId}.mp4`} type="audio/mpeg" />
                      </audio>
                    </div>
                  ) : (
                    <VideoPlayer
                      src={previewResult?.originalUrl || `/tutorial-samples/${question.sampleVideoId}.mp4`}
                      className="w-full h-full"
                      autoPlay={false}
                      muted={true}
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white/40 text-xs">Sample File Preview</div>
                  </div>
                )}
              </div>
              <div className="text-white/40 text-xs mt-2">
                {previewResult
                  ? `${previewResult.originalDimensions.width}x${previewResult.originalDimensions.height} • ${formatFileSize(previewResult.originalSize)}`
                  : 'Sample file'}
              </div>
            </div>

            {/* Processed Preview */}
            <div className="bg-gray-950/50 rounded-lg p-3">
              <div className="text-white/60 text-xs mb-2">After Processing</div>
              <div className="bg-gray-800 rounded aspect-video overflow-hidden">
                {isPreviewProcessing ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : previewResult?.processedUrl ? (
                  previewType === 'audio' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <audio controls className="w-full">
                        <source src={previewResult.processedUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  ) : (
                    <VideoPlayer
                      src={previewResult.processedUrl}
                      className="w-full h-full"
                      autoPlay={false}
                      muted={true}
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white/40 text-xs">{getPreviewTypeLabel()}</div>
                  </div>
                )}
              </div>
              <div className="text-white/40 text-xs mt-2">
                {previewResult
                  ? `${previewResult.processedDimensions.width}x${previewResult.processedDimensions.height} • ${formatFileSize(previewResult.processedSize)}`
                  : getPreviewTypeLabel()}
              </div>
            </div>
          </div>
          )}

          {/* Preview Success - shown automatically after execution */}
          {((previewResult && !previewError) || (ffprobePreviewResult && !previewError)) && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 text-xs font-semibold">Command Executed Successfully</p>
                  <p className="text-green-200 text-xs">
                    {ffprobePreviewResult 
                      ? `Executed in ${ffprobePreviewResult.executionTime.toFixed(2)}s • Output type: ${ffprobePreviewResult.outputType.toUpperCase()}`
                      : previewResult && (
                        <>
                          Processed in {previewResult.executionTime.toFixed(2)}s
                          {previewResult.originalSize && previewResult.processedSize && (
                            <span>
                              {' '}• Size: {formatFileSize(previewResult.processedSize)}
                              {previewResult.processedSize < previewResult.originalSize && (
                                <span className="text-green-300">
                                  {' '}(-{((1 - previewResult.processedSize / previewResult.originalSize) * 100).toFixed(1)}%)
                                </span>
                              )}
                            </span>
                          )}
                        </>
                      )
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-2">
        <label className="text-white text-sm font-medium">
          Your {showFFPlayPreview ? 'FFPLAY' : showFFProbePreview ? 'FFPROBE' : 'FFMPEG'} Command:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={userCommand}
            onChange={(e) => {
              const newCommand = e.target.value;
              setUserCommand(newCommand);
              if (hasAnswered || status !== 'idle') {
                setStatus('idle');
                setFeedback('');
                setHasAnswered(false);
                setPreviewError(null);
                setPreviewResult(null);
                setFFProbePreviewResult(null);
                // Reset FFPlay test state when command changes
                if (isFFPlayCommand(newCommand) || isFFPlayQuestion) {
                  setHasTestedFFPlayCommand(false);
                }
              }
            }}
            placeholder="ffmpeg -i input.mp4 ..."
            className="flex-1 bg-black/50 border border-gray-700 text-white font-mono text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                testCommand();
              }
            }}
            disabled={hasAnswered && status === 'correct'}
          />
          <button
            onClick={testCommand}
            disabled={!userCommand.trim() || status === 'checking' || isPreviewProcessing || (hasAnswered && status === 'correct')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'checking' || isPreviewProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                {isPreviewProcessing ? 'Executing...' : 'Checking...'}
              </>
            ) : (
              'Test Command'
            )}
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {previewError && errorType === 'execution' && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 font-semibold mb-1">Execution Error</p>
              <p className="text-red-200 text-sm">{previewError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {status !== 'idle' && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          status === 'correct' 
            ? 'bg-green-900/30 border border-green-500/50' 
            : 'bg-red-900/30 border border-red-500/50'
        }`}>
          {status === 'correct' ? (
            <div className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5">✓</div>
          ) : (
            <div className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5">✗</div>
          )}
          <div className="flex-1">
            <p className={`text-sm ${status === 'correct' ? 'text-green-300' : 'text-red-300'}`}>
              {feedback}
            </p>
            {errorType === 'syntax' && (
              <p className="text-red-200 text-xs mt-2">
                Please check your command syntax and try again.
              </p>
            )}
            {errorType === 'validation' && (
              <p className="text-red-200 text-xs mt-2">
                Review the requirements and hints above to see what's missing.
              </p>
            )}
            {status === 'correct' && challengeBlock.solution && (
              <div className="mt-2 p-2 bg-white/5 rounded">
                <p className="text-gray-300 text-xs font-mono">{challengeBlock.solution}</p>
              </div>
            )}
            {question.explanation && status === 'correct' && (
              <p className="text-gray-300 text-xs mt-2">{question.explanation}</p>
            )}
          </div>
        </div>
      )}

      {/* Hints */}
      <div className="space-y-2">
        {!showHint && (
          <button
            onClick={() => {
              setShowHint(true);
              setHintIndex(0);
            }}
            className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-2"
          >
            <span>💡</span>
            Show Hint
          </button>
        )}
        
        {showHint && challengeBlock.hints.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-yellow-400">💡</span>
              <p className="text-yellow-300 text-sm font-semibold">Hint {hintIndex + 1}:</p>
            </div>
            <p className="text-yellow-200 text-sm ml-6">{challengeBlock.hints[hintIndex]}</p>
            {hintIndex < challengeBlock.hints.length - 1 && (
              <button
                onClick={showNextHint}
                className="mt-2 text-yellow-400 hover:text-yellow-300 text-xs"
              >
                Show Next Hint ({hintIndex + 1}/{challengeBlock.hints.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
