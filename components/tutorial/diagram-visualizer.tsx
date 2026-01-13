'use client';

import * as React from 'react';
import { MermaidDiagram } from './mermaid-diagram';
import { ReactFlowDiagram, ReactFlowDiagramProps } from './react-flow-diagram';
import { Node, Edge } from 'reactflow';

export interface DiagramVisualizerProps {
  diagram: string; // Mermaid syntax or JSON string for React Flow
  title?: string;
  explanation?: string;
  diagramType?: 'mermaid' | 'react-flow' | 'auto';
  diagramFormat?: 'flowchart' | 'graph' | 'sequenceDiagram' | 'filter-graph' | 'custom';
  reactFlowData?: {
    nodes: Array<{
      id: string;
      label: string;
      type?: string;
      position: { x: number; y: number };
      style?: React.CSSProperties;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
      style?: React.CSSProperties;
    }>;
  };
}

export function DiagramVisualizer({
  diagram,
  title,
  explanation,
  diagramType = 'auto',
  diagramFormat,
  reactFlowData,
}: DiagramVisualizerProps) {
  // Auto-detect diagram type if not explicitly set
  const detectedType = React.useMemo(() => {
    // If explicitly set, use that type and never override
    if (diagramType === 'mermaid') {
      return 'mermaid';
    }
    if (diagramType === 'react-flow') {
      return 'react-flow';
    }

    // If reactFlowData is provided with valid nodes, use React Flow
    if (reactFlowData && reactFlowData.nodes && Array.isArray(reactFlowData.nodes) && reactFlowData.nodes.length > 0) {
      if (reactFlowData.edges && Array.isArray(reactFlowData.edges) && reactFlowData.edges.length > 0) {
        return 'react-flow';
      }
    }

    // Check if it's Mermaid syntax FIRST (before JSON parsing)
    // This prevents Mermaid diagrams from being incorrectly detected as React Flow
    const trimmedDiagram = diagram.trim();
    if (
      trimmedDiagram.startsWith('graph') ||
      trimmedDiagram.startsWith('flowchart') ||
      trimmedDiagram.startsWith('sequenceDiagram') ||
      trimmedDiagram.startsWith('classDiagram') ||
      trimmedDiagram.startsWith('stateDiagram') ||
      trimmedDiagram.startsWith('erDiagram') ||
      trimmedDiagram.startsWith('gantt') ||
      trimmedDiagram.startsWith('pie') ||
      trimmedDiagram.startsWith('journey')
    ) {
      return 'mermaid';
    }

    // Only try JSON parsing if it doesn't look like Mermaid
    // This is stricter - require both nodes AND edges arrays with content
    try {
      const parsed = JSON.parse(diagram);
      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.nodes &&
        Array.isArray(parsed.nodes) &&
        parsed.nodes.length > 0 &&
        parsed.edges &&
        Array.isArray(parsed.edges) &&
        parsed.edges.length > 0
      ) {
        // Validate node structure
        const hasValidNodes = parsed.nodes.every((node: any) => 
          node && typeof node === 'object' && (node.id || node.data)
        );
        if (hasValidNodes) {
          return 'react-flow';
        }
      }
    } catch {
      // Not valid JSON, continue to default
    }

    // Default to Mermaid for backward compatibility
    return 'mermaid';
  }, [diagram, diagramType, reactFlowData]);

  // Convert React Flow data to proper format
  const reactFlowNodes = React.useMemo((): Node[] => {
    if (reactFlowData?.nodes) {
      return reactFlowData.nodes.map((node) => ({
        id: node.id,
        data: { label: node.label },
        position: node.position,
        type: node.type || 'default',
        style: node.style,
      }));
    }

    // Try parsing from diagram string
    try {
      const parsed = JSON.parse(diagram);
      if (parsed.nodes && Array.isArray(parsed.nodes)) {
        return parsed.nodes.map((node: any) => ({
          id: node.id,
          data: { label: node.label || node.data?.label || node.id },
          position: node.position || { x: 0, y: 0 },
          type: node.type || 'default',
          style: node.style,
        }));
      }
    } catch {
      // Not valid JSON
    }

    return [];
  }, [diagram, reactFlowData]);

  const reactFlowEdges = React.useMemo((): Edge[] => {
    if (reactFlowData?.edges) {
      return reactFlowData.edges.map((edge) => ({
        id: edge.id || `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        style: edge.style,
      }));
    }

    // Try parsing from diagram string
    try {
      const parsed = JSON.parse(diagram);
      if (parsed.edges && Array.isArray(parsed.edges)) {
        return parsed.edges.map((edge: any) => ({
          id: edge.id || `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          style: edge.style,
        }));
      }
    } catch {
      // Not valid JSON
    }

    return [];
  }, [diagram, reactFlowData]);

  // Render appropriate diagram type
  if (detectedType === 'react-flow') {
    if (reactFlowNodes.length === 0 || reactFlowEdges.length === 0) {
      console.warn('React Flow diagram detected but missing nodes or edges:', {
        nodesCount: reactFlowNodes.length,
        edgesCount: reactFlowEdges.length,
        diagramType,
        hasReactFlowData: !!reactFlowData,
      });
      return (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 my-6">
          <p className="text-red-300 text-sm">
            Invalid React Flow diagram data. Please provide nodes and edges.
          </p>
          <p className="text-red-200 text-xs mt-2">
            Detected as React Flow but could not parse valid node/edge data.
          </p>
        </div>
      );
    }

    return (
      <ReactFlowDiagram
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        title={title}
        explanation={explanation}
      />
    );
  }

  // Default to Mermaid
  return (
    <MermaidDiagram
      diagram={diagram}
      title={title}
      explanation={explanation}
      type={diagramFormat === 'flowchart' ? 'flowchart' : diagramFormat === 'sequenceDiagram' ? 'sequenceDiagram' : 'auto'}
    />
  );
}
