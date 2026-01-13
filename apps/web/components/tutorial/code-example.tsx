'use client';

import * as React from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type CodeBlock } from '@/lib/tutorial';
import Link from 'next/link';

interface CodeExampleProps {
  block: CodeBlock;
}

export function CodeExample({ block }: CodeExampleProps) {
  const [copied, setCopied] = React.useState(false);
  const [showExplanation, setShowExplanation] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-purple-950/50 border border-purple-700/30 rounded-xl p-6">
      <div className="space-y-4">
        {/* Code Block */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Command</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <code className="block bg-gray-950/50 rounded-lg p-4 text-green-400 font-mono text-sm mb-4">
            {block.command}
          </code>
        </div>

        {/* Explanation Toggle */}
        {block.explanation && (
          <div>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors mb-3"
            >
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </button>
            
            {showExplanation && (
              <div className="bg-purple-900/30 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line mb-3">
                  {block.explanation}
                </p>
                
                {/* Flag Breakdown */}
                {block.flagBreakdown && block.flagBreakdown.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <h4 className="text-white text-sm font-semibold mb-2">Flag Breakdown:</h4>
                    {block.flagBreakdown.map((item, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <code className="text-purple-400 font-mono bg-purple-900/30 px-2 py-1 rounded">
                          {item.flag}
                        </code>
                        <span className="text-white/70 flex-1">{item.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Try It Yourself Button */}
        {block.tryItYourself && (
          <Link href={`/ffmpeg-command-builder?command=${encodeURIComponent(block.command)}&returnTo=/learn`}>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
              <ExternalLink className="mr-2 h-4 w-4" />
              Try it yourself in Command Builder
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
