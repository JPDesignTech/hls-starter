'use client';

import * as React from 'react';
import { Copy, Terminal, Info, Lightbulb, Check, Settings, ExternalLink } from 'lucide-react';
import { Operation } from '@/lib/ffmpeg-operations';
import { generateCommand } from '@/lib/ffmpeg-utils';
import { getFlagExplanation } from '@/lib/ffmpeg-explanations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BuildModeProps {
  operations: Operation[];
  selectedOperation: Operation;
  onOperationSelect: (operation: Operation) => void;
}

export function BuildMode({ operations, selectedOperation, onOperationSelect }: BuildModeProps) {
  const [params, setParams] = React.useState<Record<string, string>>({});
  const [copied, setCopied] = React.useState(false);

  // Initialize params with default values when operation changes
  React.useEffect(() => {
    const initialParams: Record<string, string> = {};
    selectedOperation.params.forEach(param => {
      if (param.defaultValue) {
        initialParams[param.id] = param.defaultValue;
      }
    });
    setParams(initialParams);
  }, [selectedOperation]);

  const handleParamChange = (paramId: string, value: string) => {
    setParams(prev => ({ ...prev, [paramId]: value }));
  };

  const command = generateCommand(selectedOperation, params);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get command breakdown for explanation
  const getCommandBreakdown = () => {
    const parts = command.split(' ');
    const breakdown: Array<{ part: string; explanation: string; flagExplanation?: ReturnType<typeof getFlagExplanation> }> = [];
    
    breakdown.push({
      part: 'ffmpeg',
      explanation: 'The FFMPEG command line tool',
    });

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === '-i') {
        const flagExplanation = getFlagExplanation('-i');
        breakdown.push({
          part: '-i',
          explanation: flagExplanation?.description || 'Specifies the input file',
          flagExplanation,
        });
        if (parts[i + 1]) {
          breakdown.push({
            part: parts[i + 1],
            explanation: 'Input file path',
          });
          i++;
        }
      } else if (part.startsWith('-')) {
        const flag = part;
        const flagExplanation = getFlagExplanation(flag);
        const explanation = flagExplanation?.description || 'FFMPEG option flag';
        
        breakdown.push({ 
          part: flag, 
          explanation,
          flagExplanation,
        });
        
        // Add value if next part exists and doesn't start with -
        if (parts[i + 1] && !parts[i + 1].startsWith('-')) {
          breakdown.push({
            part: parts[i + 1],
            explanation: 'Value for ' + flag,
          });
          i++;
        }
      } else if (i === parts.length - 1) {
        breakdown.push({
          part: part,
          explanation: 'The output file name and format',
        });
      }
    }
    
    return breakdown;
  };

  const breakdown = getCommandBreakdown();

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Operations */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-400" />
                Select Operation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {operations.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => onOperationSelect(op)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedOperation.id === op.id
                        ? 'bg-gradient-to-r from-teal-400/20 to-cyan-500/20 border-2 border-teal-400/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white mb-1 font-medium">{op.name}</div>
                    <div className="text-white/60 text-sm">{op.description}</div>
                  </button>
                ))}
              </div>

              {/* Learning Tip */}
              {selectedOperation.learningTip && (
                <div className="mt-6 bg-teal-500/10 border border-teal-400/30 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-teal-300 mb-1 font-medium">Learning Tip</div>
                      <div className="text-teal-200/80 text-sm">
                        {selectedOperation.learningTip}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center - Parameters */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">{selectedOperation.name}</CardTitle>
              <CardDescription className="text-gray-300">{selectedOperation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Parameter Controls */}
              <div className="space-y-6 mb-8">
                {selectedOperation.params.map((param) => (
                  <div key={param.id}>
                    <Label htmlFor={param.id} className="block text-white mb-2">
                      {param.label}
                    </Label>
                    
                    {param.type === 'select' ? (
                      <select
                        id={param.id}
                        value={params[param.id] || param.defaultValue || ''}
                        onChange={(e) => handleParamChange(param.id, e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
                      >
                        {param.options?.map((option) => (
                          <option key={option.value} value={option.value} className="bg-gray-900">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : param.type === 'number' ? (
                      <Input
                        id={param.id}
                        type="number"
                        value={params[param.id] || param.defaultValue || ''}
                        onChange={(e) => handleParamChange(param.id, e.target.value)}
                        min={param.min}
                        max={param.max}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    ) : (
                      <Input
                        id={param.id}
                        type="text"
                        value={params[param.id] || param.defaultValue || ''}
                        onChange={(e) => handleParamChange(param.id, e.target.value)}
                        placeholder={param.placeholder}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    )}
                    
                    <div className="flex items-start gap-2 mt-2">
                      <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <p className="text-white/60 text-sm">{param.help}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generated Command Output */}
              <div className="bg-gray-900/50 border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-teal-400" />
                    Generated Command
                  </h3>
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
                
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-cyan-400">
                    {command.split(' ').map((part, index) => {
                      if (part === 'ffmpeg') {
                        return <span key={index} className="text-teal-400">{part} </span>;
                      } else if (part.startsWith('-')) {
                        return <span key={index} className="text-cyan-300">{part} </span>;
                      } else {
                        return <span key={index} className="text-green-400">{part} </span>;
                      }
                    })}
                  </code>
                </div>
              </div>

              {/* Explanation Section */}
              <div className="mt-6 bg-teal-500/10 border border-teal-400/30 rounded-xl p-6">
                <h4 className="text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-teal-400" />
                  Command Breakdown
                </h4>
                <div className="space-y-2 text-white/80 text-sm">
                  {breakdown.map((item, index) => (
                    <div key={index} className="flex gap-2 flex-wrap items-center">
                      <span className="text-cyan-400 font-mono">{item.part}</span>
                      <span className="text-white/60">- {item.explanation}</span>
                      {item.flagExplanation?.documentationUrl && (
                        <a
                          href={item.flagExplanation.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center"
                          title="View official documentation"
                        >
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
