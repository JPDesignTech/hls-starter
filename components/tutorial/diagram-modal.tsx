'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MermaidModalRenderer } from './mermaid-modal-renderer';
import { ReactFlowModalRenderer } from './react-flow-modal-renderer';
import { Node, Edge } from 'reactflow';

export interface DiagramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagramType: 'mermaid' | 'react-flow';
  // Mermaid props
  diagram?: string;
  title?: string;
  explanation?: string;
  diagramFormat?: 'flowchart' | 'graph' | 'sequenceDiagram' | 'filter-graph' | 'custom';
  // React Flow props
  nodes?: Node[];
  edges?: Edge[];
}

export function DiagramModal({
  open,
  onOpenChange,
  diagramType,
  diagram,
  title,
  explanation,
  diagramFormat,
  nodes,
  edges,
}: DiagramModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col p-0 bg-gray-950 border-indigo-600/30 overflow-hidden max-w-[90vw] max-h-[85vh] w-[90vw] h-[85vh]"
        style={{
          maxWidth: '1400px',
          maxHeight: '900px',
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-indigo-600/20 shrink-0">
          <DialogTitle className="text-white text-xl">{title || 'Diagram'}</DialogTitle>
          {explanation && (
            <p className="text-white/70 text-sm mt-2">{explanation}</p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-6 min-h-0 flex flex-col">
          {diagramType === 'react-flow' && nodes && edges ? (
            <ReactFlowModalRenderer
              nodes={nodes}
              edges={edges}
            />
          ) : diagramType === 'mermaid' && diagram ? (
            <MermaidModalRenderer
              diagram={diagram}
              type={diagramFormat === 'flowchart' ? 'flowchart' : diagramFormat === 'sequenceDiagram' ? 'sequenceDiagram' : 'auto'}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/60">No diagram data available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
