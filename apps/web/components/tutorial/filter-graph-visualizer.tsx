'use client';

import * as React from 'react';
import { Info, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FilterGraphVisualizerProps {
  filterComplex: string;
  title?: string;
  explanation?: string;
}

interface FilterNode {
  id: string;
  label: string;
  type: 'input' | 'filter' | 'output';
  params?: string;
  inputs: string[];
  outputs: string[];
}

interface FilterEdge {
  from: string;
  to: string;
  label?: string;
}

export function FilterGraphVisualizer({
  filterComplex,
  title = 'Filter Graph',
  explanation,
}: FilterGraphVisualizerProps) {
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);

  // Parse filter_complex string into nodes and edges
  const parseFilterGraph = React.useMemo(() => {
    const nodes: FilterNode[] = [];
    const edges: FilterEdge[] = [];
    const nodeMap = new Map<string, FilterNode>();

    try {
      // Split by semicolons to get separate filter chains
      const chains = filterComplex.split(';').map(c => c.trim()).filter(c => c);

      chains.forEach((chain) => {
        // Split by commas to get filters in chain
        const filters = chain.split(',').map(f => f.trim()).filter(f => f);

        filters.forEach((filter, index) => {
          // Extract stream labels (e.g., [label])
          const inputMatches = filter.match(/\[([^\]]+)\]/g) || [];
          const outputMatch = filter.match(/\[([^\]]+)\]$/);
          
          // Extract filter name (before first = or [)
          const filterNameMatch = filter.match(/^\[?([^\]=]+)/);
          const filterName = filterNameMatch ? filterNameMatch[1].trim() : 'unknown';
          
          // Extract parameters (after =)
          const paramsMatch = filter.match(/=([^\[]+)/);
          const params = paramsMatch ? paramsMatch[1].trim() : undefined;

          const nodeId = `node-${nodes.length}`;
          const inputs: string[] = [];
          const outputs: string[] = [];

          // Process input labels (all but last)
          inputMatches.slice(0, -1).forEach(match => {
            const label = match.replace(/[\[\]]/g, '');
            inputs.push(label);
          });

          // Process output label (last match)
          if (outputMatch) {
            const label = outputMatch[1];
            outputs.push(label);
            nodeMap.set(label, { id: nodeId, label: filterName, type: 'filter', params, inputs, outputs });
          }

          nodes.push({
            id: nodeId,
            label: filterName,
            type: 'filter',
            params,
            inputs,
            outputs,
          });
        });
      });

      // Create edges based on stream labels
      nodes.forEach((node) => {
        node.inputs.forEach((inputLabel) => {
          const sourceNode = nodeMap.get(inputLabel);
          if (sourceNode) {
            edges.push({
              from: sourceNode.id,
              to: node.id,
              label: inputLabel,
            });
          }
        });
      });
    } catch (error) {
      console.error('Error parsing filter graph:', error);
    }

    return { nodes, edges };
  }, [filterComplex]);

  const { nodes, edges } = parseFilterGraph;

  // Simple layout: nodes in a grid
  const layoutNodes = React.useMemo(() => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    return nodes.map((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        ...node,
        x: 150 + col * 200,
        y: 100 + row * 150,
      };
    });
  }, [nodes]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  return (
    <Card className="bg-purple-950/30 border border-purple-600/30 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-400" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-purple-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
        {explanation && (
          <p className="text-white/70 text-sm mt-2">{explanation}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-auto bg-gray-950/50 rounded-lg p-4" style={{ minHeight: '400px' }}>
          <svg
            width="100%"
            height="400"
            viewBox="0 0 800 400"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            className="filter-graph-svg"
          >
            {/* Render edges */}
            {edges.map((edge, index) => {
              const fromNode = layoutNodes.find(n => n.id === edge.from);
              const toNode = layoutNodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              return (
                <g key={`edge-${index}`}>
                  <line
                    x1={fromNode.x + 60}
                    y1={fromNode.y + 30}
                    x2={toNode.x}
                    y2={toNode.y + 30}
                    stroke="#a855f7"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={fromNode.y + 25}
                      fill="#c084fc"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#a855f7" />
              </marker>
            </defs>

            {/* Render nodes */}
            {layoutNodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const nodeColor = node.type === 'input' 
                ? '#10b981' 
                : node.type === 'output' 
                ? '#3b82f6' 
                : '#8b5cf6';

              return (
                <g key={node.id}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width="120"
                    height="60"
                    rx="8"
                    fill={isSelected ? nodeColor : `${nodeColor}80`}
                    stroke={isSelected ? '#fff' : nodeColor}
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  />
                  <text
                    x={node.x + 60}
                    y={node.y + 25}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.label}
                  </text>
                  {node.params && (
                    <text
                      x={node.x + 60}
                      y={node.y + 45}
                      fill="#d1d5db"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {node.params.length > 20 ? node.params.substring(0, 20) + '...' : node.params}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {selectedNode && (
          <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-600/30">
            <p className="text-white text-sm">
              <strong>Selected:</strong> {layoutNodes.find(n => n.id === selectedNode)?.label}
            </p>
            {layoutNodes.find(n => n.id === selectedNode)?.params && (
              <p className="text-white/70 text-xs mt-1">
                <strong>Params:</strong> {layoutNodes.find(n => n.id === selectedNode)?.params}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
          <code className="text-green-400 text-xs break-all">{filterComplex}</code>
        </div>
      </CardContent>
    </Card>
  );
}
