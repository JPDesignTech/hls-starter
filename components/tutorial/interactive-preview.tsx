'use client';

import * as React from 'react';
import { Play, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VideoPlayer } from '@/components/video-player';

export interface InteractivePreviewProps {
  heading: string;
  content: string;
  code: string;
  explanation?: string;
  previewType: 'resize' | 'crop' | 'format' | 'filter';
  sampleVideoId: string;
}

interface PreviewResult {
  originalUrl: string;
  processedUrl: string;
  originalSize: number;
  processedSize: number;
  originalDimensions: { width: number; height: number };
  processedDimensions: { width: number; height: number };
  executionTime: number;
}

export function InteractivePreview({
  heading,
  content,
  code,
  explanation,
  previewType,
  sampleVideoId,
}: InteractivePreviewProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<PreviewResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showExplanation, setShowExplanation] = React.useState(false);

  const executeCommand = async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/tutorial/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sampleVideoId,
          command: code,
          previewType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getPreviewTypeLabel = () => {
    switch (previewType) {
      case 'resize':
        return result?.processedDimensions
          ? `${result.processedDimensions.width}x${result.processedDimensions.height} Preview`
          : 'Resized Preview';
      case 'crop':
        return 'Cropped Preview';
      case 'format':
        return 'Converted Preview';
      case 'filter':
        return 'Filtered Preview';
      default:
        return 'Processed Preview';
    }
  };

  const getPreviewDimensions = () => {
    if (!result) return '';
    return `${result.processedDimensions.width}x${result.processedDimensions.height}`;
  };

  const getPreviewSize = () => {
    if (!result) return '';
    return formatFileSize(result.processedSize);
  };

  return (
    <div className="bg-indigo-950/30 border border-indigo-600/30 rounded-xl p-6">
      <h3 className="text-white text-lg mb-4 font-semibold">{heading}</h3>
      <p className="text-white/80 mb-4">{content}</p>

      {/* Side-by-Side Video Comparison */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Original Preview */}
        <div className="bg-gray-950/50 rounded-lg p-4">
          <div className="text-white/60 text-sm mb-2">Original</div>
          <div className="bg-gray-800 rounded aspect-video overflow-hidden">
            {result?.originalUrl ? (
              <VideoPlayer
                src={result.originalUrl}
                className="w-full h-full"
                autoPlay={false}
                muted={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white/40 text-sm">Sample Video Preview</div>
              </div>
            )}
          </div>
          <div className="text-white/40 text-xs mt-2">
            {result
              ? `${result.originalDimensions.width}x${result.originalDimensions.height} • ${formatFileSize(result.originalSize)}`
              : '1920x1080 • 5.2 MB'}
          </div>
        </div>

        {/* Processed Preview */}
        <div className="bg-gray-950/50 rounded-lg p-4">
          <div className="text-white/60 text-sm mb-2">After Processing</div>
          <div className="bg-gray-800 rounded aspect-video overflow-hidden">
            {isProcessing ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : result?.processedUrl ? (
              <VideoPlayer
                src={result.processedUrl}
                className="w-full h-full"
                autoPlay={false}
                muted={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white/40 text-sm">{getPreviewTypeLabel()}</div>
              </div>
            )}
          </div>
          <div className="text-white/40 text-xs mt-2">
            {result
              ? `${getPreviewDimensions()} • ${getPreviewSize()}`
              : getPreviewTypeLabel()}
          </div>
        </div>
      </div>

      {/* Command Display */}
      <div className="bg-purple-950/50 border border-purple-700/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">FFMPEG Command</span>
        </div>
        <code className="block text-green-400 font-mono text-sm">{code}</code>
      </div>

      {/* Execute Button */}
      <div className="mb-4">
        <Button
          onClick={executeCommand}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Video...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Execute Command
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold mb-1">Error</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {result && !error && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-300 font-semibold mb-1">Success!</p>
              <p className="text-green-200 text-sm">
                Video processed in {result.executionTime.toFixed(2)}s. File size reduced by{' '}
                {((1 - result.processedSize / result.originalSize) * 100).toFixed(1)}%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors mb-3"
          >
            {showExplanation ? 'Hide' : 'Show'} Explanation
          </button>

          {showExplanation && (
            <div className="bg-purple-900/30 rounded-lg p-4 border-l-4 border-indigo-500">
              <p className="text-white/80 text-sm">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
