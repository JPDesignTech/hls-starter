'use client';

import * as React from 'react';
import mermaid from 'mermaid';
import { Copy, Check, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Initialize Mermaid once at module level (before any components render)
// This ensures initialization happens before any render attempts, eliminating race conditions
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#8b5cf6',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#a855f7',
    lineColor: '#a855f7',
    secondaryColor: '#6366f1',
    tertiaryColor: '#1e1b4b',
    background: '#0f172a',
    mainBkgColor: '#1e293b',
    textColor: '#ffffff',
    border1: '#8b5cf6',
    border2: '#a855f7',
    noteBkgColor: '#312e81',
    noteTextColor: '#ffffff',
    noteBorderColor: '#6366f1',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
  },
});

export interface MermaidModalRendererProps {
  diagram: string;
  type?: 'flowchart' | 'graph' | 'sequenceDiagram' | 'auto';
}

export function MermaidModalRenderer({
  diagram,
  type = 'auto',
}: MermaidModalRendererProps) {
  const diagramRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const diagramIdRef = React.useRef<string>(`mermaid-modal-${Math.random().toString(36).substr(2, 9)}`);

  // Render diagram when component mounts or diagram changes
  React.useEffect(() => {
    if (!diagram) return;

    const renderDiagram = async () => {
      try {
        setError(null);
        setIsRendered(false);

        // Wait for ref to be attached and DOM to be ready
        let attempts = 0;
        while (!diagramRef.current && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          attempts++;
        }

        if (!diagramRef.current) {
          setError('Failed to attach diagram container');
          return;
        }

        // Additional delay to ensure modal is fully visible
        await new Promise(resolve => setTimeout(resolve, 150));

        const id = diagramIdRef.current;
        if (!diagramRef.current) return;

        // Use mermaid.render() API
        const { svg } = await mermaid.render(id, diagram);
        
        // Insert the rendered SVG directly
        if (diagramRef.current) {
          diagramRef.current.innerHTML = svg;
          
          // Make SVG scale to fill container width
          const svgElement = diagramRef.current.querySelector('svg');
          if (svgElement) {
            // Get original dimensions for viewBox
            const originalWidth = svgElement.getAttribute('width');
            const originalHeight = svgElement.getAttribute('height');
            
            // Set responsive dimensions
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', 'auto');
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            
            // Preserve viewBox for proper scaling if not already set
            if (!svgElement.getAttribute('viewBox') && originalWidth && originalHeight) {
              const widthNum = parseFloat(originalWidth);
              const heightNum = parseFloat(originalHeight);
              if (!isNaN(widthNum) && !isNaN(heightNum)) {
                svgElement.setAttribute('viewBox', `0 0 ${widthNum} ${heightNum}`);
              }
            }
          }
        }

        setIsRendered(true);
      } catch (err) {
        console.error('Mermaid rendering error in modal:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
        setError(errorMessage || 'Unknown error occurred');
        setIsRendered(false);
      }
    };

    renderDiagram();
  }, [diagram, type]);

  const handleCopy = async () => {
    if (diagram) {
      await navigator.clipboard.writeText(diagram);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-950/50 rounded-lg">
      {/* Controls */}
      <div className="flex items-center justify-end gap-2 p-3 border-b border-gray-800">
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-purple-400 hover:text-purple-300 transition-colors rounded hover:bg-purple-900/20"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-sm text-purple-300 min-w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-purple-400 hover:text-purple-300 transition-colors rounded hover:bg-purple-900/20"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <Button
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="text-purple-400 hover:text-purple-300"
          aria-label="Copy diagram code"
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
        ref={containerRef}
        className="flex-1 overflow-auto p-6 flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-red-300 text-sm">Error rendering diagram</p>
            <p className="text-red-200 text-xs">{error}</p>
          </div>
        ) : (
          <div
            ref={diagramRef}
            className="mermaid-container w-full flex justify-center items-center"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          />
        )}
      </div>
    </div>
  );
}
