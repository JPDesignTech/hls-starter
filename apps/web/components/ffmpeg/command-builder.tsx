'use client';

import * as React from 'react';
import { Terminal, Wrench, Search } from 'lucide-react';
import { operations, type Operation } from '@/lib/ffmpeg-operations';
import { BuildMode } from './build-mode';
import { AnalyzeMode } from './analyze-mode';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CommandBuilderProps {
  onBack?: () => void;
  initialCommand?: string;
  returnTo?: string;
}

export function CommandBuilder({ onBack, initialCommand, returnTo }: CommandBuilderProps) {
  const [selectedOperation, setSelectedOperation] = React.useState<Operation>(operations[0]);
  const [mode, setMode] = React.useState<'build' | 'analyze'>('build');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <Terminal className="w-6 h-6 text-teal-400" />
              <h1 className="text-white text-2xl font-bold">FFMPEG Command Builder</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Mode Selector */}
          <div className="mb-8">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'build' | 'analyze')}>
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/5 border-white/10">
                <TabsTrigger
                  value="build"
                  className="data-[state=active]:bg-teal-600/20 data-[state=active]:text-teal-400 data-[state=active]:border-teal-400/50"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Build Mode
                </TabsTrigger>
                <TabsTrigger
                  value="analyze"
                  className="data-[state=active]:bg-teal-600/20 data-[state=active]:text-teal-400 data-[state=active]:border-teal-400/50"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Mode
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          {mode === 'build' ? (
            <BuildMode
              operations={operations}
              selectedOperation={selectedOperation}
              onOperationSelect={setSelectedOperation}
            />
          ) : (
            <AnalyzeMode initialCommand={initialCommand} returnTo={returnTo} />
          )}
        </div>
      </div>
    </div>
  );
}
