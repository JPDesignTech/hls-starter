'use client';

import * as React from 'react';
import mermaid from 'mermaid';
import { Copy, Check, ZoomIn, ZoomOut, AlertCircle, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiagramModal } from './diagram-modal';

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

export interface MermaidDiagramProps {
  diagram: string; // Mermaid diagram definition
  title?: string;
  explanation?: string;
  type?: 'flowchart' | 'graph' | 'sequenceDiagram' | 'auto';
  height?: number;
  interactive?: boolean;
}

export function MermaidDiagram({
  diagram,
  title,
  explanation,
  type = 'auto',
  height = 400,
  interactive = true,
}: MermaidDiagramProps) {
  const diagramRef = React.useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // Generate a new ID whenever diagram changes to avoid collisions
  const diagramIdRef = React.useRef<string>(`mermaid-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`);
  
  // Regenerate ID when diagram changes
  React.useEffect(() => {
    diagramIdRef.current = `mermaid-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  }, [diagram]);

  // Render diagram
  React.useEffect(() => {
    if (!diagram) return;

    let isMounted = true;

    const renderDiagram = async () => {
      try {
        if (!isMounted) return;
        
        setError(null);
        setIsRendered(false);

        // Wait for ref to be attached and DOM to be ready
        let attempts = 0;
        while (!diagramRef.current && attempts < 10 && isMounted) {
          await new Promise(resolve => setTimeout(resolve, 50));
          attempts++;
        }

        if (!isMounted || !diagramRef.current) {
          if (!isMounted) return;
          setError('Failed to attach diagram container');
          return;
        }

        // Additional delay to ensure DOM is fully ready (similar to modal)
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMounted || !diagramRef.current) return;

        // Generate unique ID for this diagram (ensure it's truly unique)
        const id = diagramIdRef.current;

        // Clear any existing content first
        if (diagramRef.current) {
          diagramRef.current.innerHTML = '';
        }

        // Use mermaid.render() API instead of mermaid.run()
        const { svg } = await mermaid.render(id, diagram);
        
        if (!isMounted || !diagramRef.current) return;
        
        // Insert the rendered SVG directly
        diagramRef.current.innerHTML = svg;
        
        // Make SVG scale properly (similar to modal renderer)
        const svgElement = diagramRef.current.querySelector('svg');
        if (svgElement) {
          // Ensure SVG is visible and properly sized
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          
          // Also set viewBox if not present (like modal does)
          if (!svgElement.getAttribute('viewBox')) {
            const originalWidth = svgElement.getAttribute('width');
            const originalHeight = svgElement.getAttribute('height');
            if (originalWidth && originalHeight) {
              const widthNum = parseFloat(originalWidth);
              const heightNum = parseFloat(originalHeight);
              if (!isNaN(widthNum) && !isNaN(heightNum)) {
                svgElement.setAttribute('viewBox', `0 0 ${widthNum} ${heightNum}`);
                svgElement.setAttribute('width', '100%');
                svgElement.setAttribute('height', 'auto');
              }
            }
          }
        }

        if (isMounted) {
          setIsRendered(true);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Mermaid rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
        setError(errorMessage ?? 'Unknown error occurred');
        setIsRendered(false);
      }
    };

    void renderDiagram();

    return () => {
      isMounted = false;
    };
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
    <Card className="bg-purple-950/30 border border-purple-600/30 rounded-xl my-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          {title && (
            <CardTitle className="text-white text-lg">{title}</CardTitle>
          )}
          {interactive && (
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
              <Button
                onClick={() => setIsModalOpen(true)}
                size="sm"
                variant="ghost"
                className="text-purple-400 hover:text-purple-300"
                aria-label="Open diagram in larger view"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {explanation && (
          <p className="text-white/70 text-sm mt-2">{explanation}</p>
        )}
      </CardHeader>
      <CardContent>
        <div 
          className="bg-gray-950/50 rounded-lg p-4 flex items-center justify-center overflow-hidden relative"
          style={{ 
            minHeight: `${height}px`,
            maxWidth: '100%',
          }}
        >
          <div
            className="overflow-auto w-full h-full"
            style={{
              maxWidth: '100%',
            }}
          >
            <div 
              ref={diagramRef}
              className="mermaid-container w-full flex justify-center items-center"
              style={{ 
                minHeight: `${height}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 py-8 bg-gray-950/90 backdrop-blur-sm z-10">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-red-300 text-sm">Error rendering diagram</p>
              <p className="text-red-200 text-xs">{error}</p>
            </div>
          )}
        </div>
        {interactive && (
          <div className="mt-3 text-xs text-white/50 text-center">
            Click and drag to pan • Use zoom controls to adjust size
          </div>
        )}
      </CardContent>
      {isModalOpen && (
        <DiagramModal
          key={`mermaid-modal-${diagramIdRef.current}`}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          diagramType="mermaid"
          diagram={diagram}
          title={title}
          explanation={explanation}
          diagramFormat={type === 'flowchart' ? 'flowchart' : type === 'sequenceDiagram' ? 'sequenceDiagram' : undefined}
        />
      )}
    </Card>
  );
}
