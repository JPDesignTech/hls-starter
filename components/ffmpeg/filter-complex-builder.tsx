'use client';

import * as React from 'react';
import { Plus, X, Play, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface FilterComplexBuilderProps {
  onCommandGenerated?: (command: string) => void;
  initialCommand?: string;
}

interface FilterNode {
  id: string;
  type: string;
  params: string;
  inputs: string[];
  output: string;
}

const COMMON_FILTERS = [
  { name: 'scale', description: 'Resize video' },
  { name: 'crop', description: 'Crop video' },
  { name: 'overlay', description: 'Overlay video/image' },
  { name: 'split', description: 'Split stream' },
  { name: 'hstack', description: 'Stack horizontally' },
  { name: 'vstack', description: 'Stack vertically' },
  { name: 'blur', description: 'Blur effect' },
  { name: 'drawtext', description: 'Add text' },
];

export function FilterComplexBuilder({
  onCommandGenerated,
  initialCommand,
}: FilterComplexBuilderProps) {
  const [nodes, setNodes] = React.useState<FilterNode[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState<string>('');
  const [generatedCommand, setGeneratedCommand] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (initialCommand) {
      // Parse initial command if provided
      // This is a simplified parser - full implementation would be more complex
      setGeneratedCommand(initialCommand);
    }
  }, [initialCommand]);

  const addFilter = () => {
    if (!selectedFilter) return;

    const newNode: FilterNode = {
      id: `node-${Date.now()}`,
      type: selectedFilter,
      params: '',
      inputs: [],
      output: `out_${nodes.length}`,
    };

    setNodes([...nodes, newNode]);
    setSelectedFilter('');
    generateCommand([...nodes, newNode]);
  };

  const removeFilter = (id: string) => {
    const newNodes = nodes.filter(n => n.id !== id);
    setNodes(newNodes);
    generateCommand(newNodes);
  };

  const updateFilter = (id: string, updates: Partial<FilterNode>) => {
    const newNodes = nodes.map(n => 
      n.id === id ? { ...n, ...updates } : n
    );
    setNodes(newNodes);
    generateCommand(newNodes);
  };

  const generateCommand = (filterNodes: FilterNode[]) => {
    if (filterNodes.length === 0) {
      setGeneratedCommand('');
      return;
    }

    // Simple command generation
    // Full implementation would handle complex graph structures
    const parts = filterNodes.map((node, index) => {
      const inputStr = node.inputs.length > 0 
        ? node.inputs.map((inp, i) => `[${inp}]`).join('')
        : index === 0 ? '[0:v]' : '';
      const paramsStr = node.params ? `=${node.params}` : '';
      const outputStr = node.output ? `[${node.output}]` : '';
      
      return `${inputStr}${node.type}${paramsStr}${outputStr}`;
    });

    const command = `-filter_complex "${parts.join('; ')}"`;
    setGeneratedCommand(command);
    
    if (onCommandGenerated) {
      onCommandGenerated(command);
    }
  };

  const copyToClipboard = async () => {
    if (generatedCommand) {
      await navigator.clipboard.writeText(generatedCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-gray-900/50 border border-gray-700 rounded-xl">
      <CardHeader>
        <CardTitle className="text-white">Filter Complex Builder</CardTitle>
        <p className="text-white/70 text-sm mt-2">
          Build complex filter graphs visually. Add filters and connect them to create advanced effects.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Selection */}
        <div className="space-y-2">
          <Label className="text-white">Add Filter</Label>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="">Select a filter...</option>
              {COMMON_FILTERS.map(filter => (
                <option key={filter.name} value={filter.name}>
                  {filter.name} - {filter.description}
                </option>
              ))}
            </select>
            <Button
              onClick={addFilter}
              disabled={!selectedFilter}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Filter Nodes */}
        <div className="space-y-2">
          <Label className="text-white">Filters</Label>
          {nodes.length === 0 ? (
            <div className="text-white/50 text-sm py-4 text-center border border-dashed border-gray-700 rounded-lg">
              No filters added. Select a filter above to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="text-white font-medium">{node.type}</div>
                    <Input
                      value={node.params}
                      onChange={(e) => updateFilter(node.id, { params: e.target.value })}
                      placeholder="Parameters (e.g., 1280:720)"
                      className="mt-1 bg-gray-900 text-white border-gray-700"
                    />
                    <Input
                      value={node.output}
                      onChange={(e) => updateFilter(node.id, { output: e.target.value })}
                      placeholder="Output label"
                      className="mt-1 bg-gray-900 text-white border-gray-700"
                    />
                  </div>
                  <Button
                    onClick={() => removeFilter(node.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generated Command */}
        {generatedCommand && (
          <div className="space-y-2">
            <Label className="text-white">Generated Command</Label>
            <div className="bg-gray-950 border border-gray-700 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <code className="text-green-400 text-sm flex-1 break-all">
                  {generatedCommand}
                </code>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-green-400"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
          <p className="text-blue-200 text-xs">
            <strong>Tip:</strong> This is a basic builder. For complex graphs with multiple inputs and branches,
            use the filter graph visualizer in the tutorial lessons.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
