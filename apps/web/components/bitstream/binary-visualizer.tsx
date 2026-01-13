'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ZoomIn, ZoomOut } from 'lucide-react';

interface BinaryVisualizerProps {
  hexData: string;
  nalUnits?: Array<{
    type: number;
    typeName: string;
    offset: number;
    size: number;
  }>;
  onOffsetClick?: (offset: number) => void;
}

export function BinaryVisualizer({ hexData, nalUnits = [], onOffsetClick }: BinaryVisualizerProps) {
  const [selectedOffset, setSelectedOffset] = React.useState<number | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [bytesPerRow] = React.useState(32);
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 500 }); // Show first 500 rows

  // Calculate total bytes (don't convert all at once for large files)
  const totalBytes = Math.floor((hexData?.length ?? 0) / 2);
  const totalRows = Math.ceil(totalBytes / bytesPerRow);
  const isLargeFile = totalBytes > 1000000; // > 1MB

  // Convert hex to bytes on-demand (only for visible range)
  const getBytesForRange = React.useCallback((startByte: number, endByte: number): number[] => {
    if (!hexData) return [];
    const result: number[] = [];
    const startHex = startByte * 2;
    const endHex = Math.min(endByte * 2, hexData.length);
    for (let i = startHex; i < endHex; i += 2) {
      result.push(parseInt(hexData.substring(i, i + 2), 16));
    }
    return result;
  }, [hexData]);

  // Find NAL unit for a given offset
  const getNALUnitForOffset = React.useCallback((offset: number) => {
    return nalUnits.find(nal => offset >= nal.offset && offset < nal.offset + nal.size);
  }, [nalUnits]);

  // Get color for NAL unit type
  const getNALColor = (type: number): string => {
    if (type === 7 || type === 33) return 'bg-blue-500';
    if (type === 8 || type === 34) return 'bg-green-500';
    if (type === 32) return 'bg-purple-500';
    if (type === 5 || type === 19 || type === 20) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  // Convert byte to binary string
  const byteToBinary = (byte: number): string => {
    return byte.toString(2).padStart(8, '0');
  };

  // Render a byte as binary bits
  const renderByte = (byte: number, offset: number) => {
    const binary = byteToBinary(byte);
    const nalUnit = getNALUnitForOffset(offset);
    const isSelected = selectedOffset === offset;
    const color = nalUnit ? getNALColor(nalUnit.type) : 'bg-gray-600';

    return (
      <div
        key={offset}
        className={`inline-block m-0.5 ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
        onClick={() => {
          setSelectedOffset(offset);
          if (onOffsetClick) {
            onOffsetClick(offset);
          }
        }}
        title={`Offset: ${offset.toString(16).toUpperCase()}, Value: 0x${byte.toString(16).toUpperCase().padStart(2, '0')}, Binary: ${binary}`}
      >
        <div className="flex flex-col">
          {binary.split('').map((bit, bitIdx) => (
            <div
              key={bitIdx}
              className={`w-3 h-3 ${bit === '1' ? color : 'bg-gray-800'} border border-gray-700 hover:border-yellow-400 transition-colors`}
              style={{ transform: `scale(${zoom})` }}
            />
          ))}
        </div>
        <div className="text-[8px] text-gray-400 text-center mt-1">
          {byte.toString(16).toUpperCase().padStart(2, '0')}
        </div>
      </div>
    );
  };

  // Handle scroll for pagination
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    // Calculate which rows are visible (approximate row height ~60px)
    const rowHeight = 60;
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 20); // Buffer of 20 rows
    const endRow = Math.min(totalRows, Math.ceil((scrollTop + clientHeight) / rowHeight) + 20);
    
    setVisibleRange({ start: startRow, end: endRow });
  }, [totalRows]);

  // Render a row of bytes
  const renderRow = (rowStart: number) => {
    const rowBytes = getBytesForRange(rowStart, rowStart + bytesPerRow);
    
    return (
      <div key={rowStart} className="flex items-start gap-1 mb-2">
        <div className="text-xs text-gray-400 w-20 shrink-0 font-mono pt-1">
          {rowStart.toString(16).toUpperCase().padStart(8, '0')}
        </div>
        <div className="flex-1 flex flex-wrap gap-0.5">
          {rowBytes.map((byte, idx) => renderByte(byte, rowStart + idx))}
        </div>
      </div>
    );
  };

  // Render visible rows only
  const visibleRows = React.useMemo(() => {
    const rows: number[] = [];
    for (let i = visibleRange.start; i < visibleRange.end && i < totalRows; i++) {
      rows.push(i);
    }
    return rows;
  }, [visibleRange, totalRows]);

  // Handle null/empty hexData (check after all hooks)
  if (!hexData || hexData.length === 0) {
    return (
      <Card className="bg-white/15 border-white/20" style={{ isolation: 'isolate', contain: 'layout style paint' }}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-300">No bitstream data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/15 border-white/20" style={{ isolation: 'isolate', contain: 'layout style paint' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            Binary Visualization
            {isLargeFile && (
              <span className="ml-2 text-xs text-yellow-400">
                (Large file: {Math.round(totalBytes / 1024 / 1024 * 10) / 10}MB - Showing rows {visibleRange.start}-{visibleRange.end})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-300 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => navigator.clipboard.writeText(hexData)}
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Hex
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLargeFile && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded text-sm text-yellow-200">
            <p className="font-semibold mb-1">Large File Detected</p>
            <p className="text-xs">
              This file is very large ({Math.round(totalBytes / 1024 / 1024 * 10) / 10}MB). 
              Only visible rows are rendered for performance. Use scroll to navigate.
            </p>
          </div>
        )}
        <div 
          onScroll={handleScroll}
          className="max-h-[600px] overflow-y-auto bg-black/30 rounded p-4"
          style={{ height: isLargeFile ? '600px' : 'auto' }}
        >
          <div className="space-y-2" style={{ height: totalRows * 60 }}>
            {/* Header */}
            <div className="flex items-start gap-1 text-xs text-gray-400 mb-2 pb-2 border-b border-white/10 sticky top-0 bg-black/50 z-10">
              <div className="w-20 shrink-0">Offset</div>
              <div className="flex-1">Binary Bits (8 bits per byte, MSB to LSB)</div>
            </div>
            
            {/* Spacer for rows before visible range */}
            {visibleRange.start > 0 && (
              <div style={{ height: visibleRange.start * 60 }} />
            )}
            
            {/* Binary rows - only render visible ones */}
            {visibleRows.map((rowIdx) =>
              renderRow(rowIdx * bytesPerRow)
            )}
            
            {/* Spacer for rows after visible range */}
            {visibleRange.end < totalRows && (
              <div style={{ height: (totalRows - visibleRange.end) * 60 }} />
            )}
          </div>
        </div>
        
        {/* Legend */}
        {nalUnits.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500"></div>
              <span className="text-gray-300">SPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500"></div>
              <span className="text-gray-300">PPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500"></div>
              <span className="text-gray-300">VPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500"></div>
              <span className="text-gray-300">IDR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500"></div>
              <span className="text-gray-300">Other</span>
            </div>
          </div>
        )}
        
        {/* Info */}
        <div className="mt-4 text-xs text-gray-400">
          <p>Each byte is represented as 8 vertical bits (MSB at top, LSB at bottom).</p>
          <p>Click on a byte to select it. Hover for details.</p>
        </div>
      </CardContent>
    </Card>
  );
}

