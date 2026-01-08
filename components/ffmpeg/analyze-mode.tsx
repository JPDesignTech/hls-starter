'use client';

import * as React from 'react';
import Link from 'next/link';
import { Copy, Terminal, Info, Check, AlertCircle, FileInput, FileOutput, Code, ExternalLink, ArrowLeft } from 'lucide-react';
import { parseCommand, getCommandBreakdown, validateCommand } from '@/lib/ffmpeg-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnalyzeModeProps {
  initialCommand?: string;
  returnTo?: string;
}

const exampleCommands = [
  {
    name: 'Extract Audio',
    command: 'ffmpeg -i input.mp4 -vn -acodec libmp3lame -ab 192k output.mp3',
  },
  {
    name: 'Resize Video',
    command: 'ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4',
  },
  {
    name: 'Compress Video',
    command: 'ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium output.mp4',
  },
  {
    name: 'Trim Video',
    command: 'ffmpeg -i input.mp4 -ss 00:00:10 -t 00:00:30 output.mp4',
  },
  {
    name: 'Convert Format',
    command: 'ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.webm',
  },
];

export function AnalyzeMode({ initialCommand = '', returnTo }: AnalyzeModeProps) {
  const [commandInput, setCommandInput] = React.useState(initialCommand);
  const [parsedCommand, setParsedCommand] = React.useState<ReturnType<typeof parseCommand> | null>(null);
  const [breakdown, setBreakdown] = React.useState<ReturnType<typeof getCommandBreakdown>>([]);
  const [validation, setValidation] = React.useState<ReturnType<typeof validateCommand> | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [hasAnalyzed, setHasAnalyzed] = React.useState(false);

  // Set initial command when component mounts or initialCommand changes
  React.useEffect(() => {
    if (initialCommand) {
      setCommandInput(initialCommand);
    }
  }, [initialCommand]);

  const handleAnalyze = React.useCallback(() => {
    if (!commandInput.trim()) return;

    const validationResult = validateCommand(commandInput);
    setValidation(validationResult);

    if (validationResult.valid) {
      const parsed = parseCommand(commandInput);
      const breakdownResult = getCommandBreakdown(parsed);
      setParsedCommand(parsed);
      setBreakdown(breakdownResult);
      setHasAnalyzed(true);
    } else {
      setParsedCommand(null);
      setBreakdown([]);
      setHasAnalyzed(false);
    }
  }, [commandInput]);

  // Auto-analyze when command input changes (debounced)
  React.useEffect(() => {
    if (!commandInput.trim()) {
      setParsedCommand(null);
      setBreakdown([]);
      setHasAnalyzed(false);
      setValidation(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleAnalyze();
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [commandInput, handleAnalyze]);

  const handleExampleClick = (command: string) => {
    setCommandInput(command);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(commandInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle Ctrl+Enter to analyze
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnalyze]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'input':
        return <FileInput className="w-4 h-4" />;
      case 'output':
        return <FileOutput className="w-4 h-4" />;
      case 'filter':
        return <Code className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'input':
        return 'text-teal-400';
      case 'output':
        return 'text-cyan-400';
      case 'video':
        return 'text-green-400';
      case 'audio':
        return 'text-blue-400';
      case 'filter':
        return 'text-purple-400';
      case 'global':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Return Link */}
      {returnTo && (
        <Link
          href={returnTo}
          className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Tutorial
        </Link>
      )}

      {/* Command Input */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-teal-400" />
            Paste FFMPEG Command
          </CardTitle>
          <CardDescription className="text-gray-300">
            Paste an existing FFMPEG command to visualize and understand each part
            {initialCommand && (
              <span className="block mt-1 text-teal-400 text-xs">
                Command pre-filled from tutorial
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <textarea
                value={commandInput}
                onChange={(e) => {
                  setCommandInput(e.target.value);
                }}
                placeholder="ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4"
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                Command will be analyzed automatically as you type
              </p>
            </div>

            {/* Example Commands */}
            <div>
              <p className="text-sm text-white/70 mb-2">Try these example commands:</p>
              <div className="flex flex-wrap gap-2">
                {exampleCommands.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example.command)}
                    className="bg-white/5 hover:bg-white/10 border-white/20 text-white text-xs"
                  >
                    {example.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Validation Errors */}
            {validation && !validation.valid && (
              <Alert className="bg-red-500/20 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!commandInput.trim()}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            >
              <Terminal className="mr-2 h-4 w-4" />
              Analyze Command
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {hasAnalyzed && parsedCommand && (
        <>
          {/* Tokenized Command Display */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-teal-400" />
                  Tokenized Command
                </CardTitle>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <code>
                  {parsedCommand.rawTokens.map((token, index) => {
                    let color = 'text-gray-400';
                    if (token.type === 'binary') color = 'text-teal-400';
                    else if (token.type === 'flag') color = 'text-cyan-300';
                    else if (token.type === 'filter') color = 'text-purple-400';
                    else if (token.type === 'file') color = 'text-green-400';
                    else if (token.type === 'value') color = 'text-yellow-400';

                    return (
                      <span key={index} className={color}>
                        {token.token}{' '}
                      </span>
                    );
                  })}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Command Breakdown by Category */}
          {breakdown.length > 0 && (
            <div className="space-y-4">
              {breakdown.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className={`text-white flex items-center gap-2 ${getCategoryColor(section.category)}`}>
                      {getCategoryIcon(section.category)}
                      {section.category.charAt(0).toUpperCase() + section.category.slice(1)} Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start gap-3">
                            <code className="text-cyan-400 font-mono text-sm flex-shrink-0">
                              {item.flag}
                            </code>
                            {item.value && (
                              <code className="text-green-400 font-mono text-sm">
                                {item.value}
                              </code>
                            )}
                            {item.explanation && (
                              <div className="flex-1 ml-auto text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <p className="text-white/80 text-sm">{item.explanation.name}</p>
                                  {item.explanation.documentationUrl && (
                                    <a
                                      href={item.explanation.documentationUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center"
                                      title="View official documentation"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                                <p className="text-white/60 text-xs mt-1">{item.explanation.description}</p>
                                {item.explanation.commonValues && (
                                  <p className="text-white/50 text-xs mt-1">
                                    Common values: {item.explanation.commonValues.join(', ')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
