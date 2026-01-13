'use client';

import * as React from 'react';
import ReactFlow, {
  Background,
  type Node,
  type Edge,
  ConnectionMode,
  MarkerType,
  BackgroundVariant,
  Handle,
  Position,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ReactFlowModalRendererProps {
  nodes: Node[];
  edges: Edge[];
}

// Custom node types for FFmpeg-specific concepts
const nodeTypes = {
  input: ({ data }: { data: { label: string } }) => (
    <div className="px-4 py-2 bg-purple-600/30 border-2 border-purple-400 rounded-lg text-white text-sm font-medium relative">
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-400 !border-purple-300"
      />
    </div>
  ),
  filter: ({ data }: { data: { label: string } }) => (
    <div className="px-4 py-2 bg-indigo-600/30 border-2 border-indigo-400 rounded-lg text-white text-sm font-medium relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-400 !border-indigo-300"
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-400 !border-indigo-300"
      />
    </div>
  ),
  output: ({ data }: { data: { label: string } }) => (
    <div className="px-4 py-2 bg-green-600/30 border-2 border-green-400 rounded-lg text-white text-sm font-medium relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-green-400 !border-green-300"
      />
      {data.label}
    </div>
  ),
  process: ({ data }: { data: { label: string } }) => (
    <div className="px-4 py-2 bg-blue-600/30 border-2 border-blue-400 rounded-lg text-white text-sm font-medium relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-400 !border-blue-300"
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-400 !border-blue-300"
      />
    </div>
  ),
  default: ({ data }: { data: { label: string } }) => (
    <div className="px-4 py-2 bg-indigo-600/30 border-2 border-indigo-400 rounded-lg text-white text-sm font-medium relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-400 !border-indigo-300"
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-400 !border-indigo-300"
      />
    </div>
  ),
};

export function ReactFlowModalRenderer({
  nodes,
  edges,
}: ReactFlowModalRendererProps) {
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    React.useState<ReactFlowInstance | null>(null);

  // Validate nodes and edges
  React.useEffect(() => {
    if (!nodes || nodes.length === 0) {
      setError('No nodes provided for diagram');
      return;
    }
    if (!edges || edges.length === 0) {
      setError('No edges provided for diagram');
      return;
    }
    setError(null);
  }, [nodes, edges]);

  const handleCopy = async () => {
    const diagramData = JSON.stringify({ nodes, edges }, null, 2);
    await navigator.clipboard.writeText(diagramData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // Fit view to show all nodes
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 200);
  };

  // Default node style if not provided (indigo theme for React Flow)
  const defaultNodeStyle = {
    background: 'rgba(79, 70, 229, 0.2)',
    border: '2px solid rgba(99, 102, 241, 0.8)',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '10px',
  };

  // Process nodes to ensure they have proper styling
  const processedNodes = React.useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      style: node.style ?? defaultNodeStyle,
      type: node.type ?? 'default',
    }));
  }, [nodes]);

  // Process edges to ensure they have proper styling (indigo theme)
  const processedEdges = React.useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      type: edge.type ?? 'default',
      animated: edge.animated ?? false,
      style: edge.style ?? { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: edge.markerEnd ?? {
        type: MarkerType.ArrowClosed,
        color: '#6366f1',
      },
    }));
  }, [edges]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-950/50 rounded-lg">
      {/* Controls */}
      <div className="flex items-center justify-end gap-2 p-3 border-b border-gray-800">
        <Button
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="text-indigo-400 hover:text-indigo-300"
          aria-label="Copy diagram data"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Diagram Content */}
      <div
        ref={reactFlowWrapper}
        className="flex-1 overflow-hidden relative"
        style={{ minHeight: '400px' }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 h-full">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-red-300 text-sm">Error rendering diagram</p>
            <p className="text-red-200 text-xs">{error}</p>
          </div>
        ) : (
          <ReactFlow
            nodes={processedNodes}
            edges={processedEdges}
            nodeTypes={nodeTypes}
            onInit={onInit}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-transparent"
            style={{ width: '100%', height: '100%' }}
            preventScrolling={false}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnScroll={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color="#4b5563"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
