'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Search, X } from 'lucide-react';

interface HexViewerProps {
  hexData: string;
  nalUnits?: Array<{
    type: number;
    typeName: string;
    offset: number;
    size: number;
  }>;
  onOffsetClick?: (offset: number) => void;
}

export function HexViewer({ hexData, nalUnits = [], onOffsetClick }: HexViewerProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedOffset, setSelectedOffset] = React.useState<number | null>(null);
  const [bytesPerLine] = React.useState(16);
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 1000 }); // Show first 1000 lines
  const [isLoading, setIsLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle null/empty hexData
  if (!hexData || hexData.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-6 text-center">
          <p className="text-gray-300">No bitstream data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total bytes (don't convert all at once for large files)
  const totalBytes = Math.floor(hexData.length / 2);
  const totalLines = Math.ceil(totalBytes / bytesPerLine);
  
  // Warn if file is very large
  const isLargeFile = totalBytes > 1000000; // > 1MB

  // Convert hex to bytes on-demand (only for visible range)
  const getBytesForRange = React.useCallback((startByte: number, endByte: number): number[] => {
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
    // SPS
    if (type === 7 || type === 33) return 'bg-blue-500/20 border-blue-500/50';
    // PPS
    if (type === 8 || type === 34) return 'bg-green-500/20 border-green-500/50';
    // VPS (H.265)
    if (type === 32) return 'bg-purple-500/20 border-purple-500/50';
    // IDR
    if (type === 5 || type === 19 || type === 20) return 'bg-yellow-500/20 border-yellow-500/50';
    // Other slices
    return 'bg-gray-500/10 border-gray-500/30';
  };

  // Search functionality
  const searchResults = React.useMemo(() => {
    if (!searchTerm) return [];
    const searchHex = searchTerm.replace(/\s+/g, '').toLowerCase();
    const results: number[] = [];
    const lowerHex = hexData.toLowerCase();
    let index = lowerHex.indexOf(searchHex);
    while (index !== -1) {
      results.push(index / 2); // Convert hex char position to byte offset
      index = lowerHex.indexOf(searchHex, index + 1);
    }
    return results;
  }, [searchTerm, hexData]);

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(hexData);
  };

  // Format bytes as hex
  const formatHex = (value: number, length: number = 2): string => {
    return value.toString(16).toUpperCase().padStart(length, '0');
  };

  // Format bytes as ASCII (printable characters only)
  const formatASCII = (byte: number): string => {
    return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
  };

  // Render a line of hex data
  const renderLine = (lineStart: number) => {
    const lineBytes = getBytesForRange(lineStart, lineStart + bytesPerLine);
    const lineOffset = lineStart;
    const nalUnit = getNALUnitForOffset(lineOffset);
    const isSelected = selectedOffset !== null && 
      selectedOffset >= lineOffset && selectedOffset < lineOffset + bytesPerLine;
    const isSearchMatch = searchResults.includes(lineOffset);

    return (
      <div
        key={lineStart}
        className={`flex items-start gap-2 font-mono text-sm hover:bg-white/5 ${
          isSelected ? 'bg-yellow-500/20' : ''
        } ${isSearchMatch ? 'bg-orange-500/20' : ''} ${
          nalUnit ? getNALColor(nalUnit.type) : ''
        } border-l-2 px-2 py-1 cursor-pointer`}
        onClick={() => {
          if (onOffsetClick) {
            onOffsetClick(lineOffset);
          }
          setSelectedOffset(lineOffset);
        }}
      >
        {/* Offset */}
        <div className="text-gray-400 w-20 shrink-0">
          {formatHex(lineOffset, 8)}
        </div>
        
        {/* Hex bytes */}
        <div className="flex gap-1 flex-wrap flex-1">
          {lineBytes.map((byte, idx) => {
            const byteOffset = lineOffset + idx;
            const byteNAL = getNALUnitForOffset(byteOffset);
            const isByteSelected = selectedOffset === byteOffset;
            const isByteSearchMatch = searchResults.includes(byteOffset);
            
            return (
              <span
                key={idx}
                className={`${
                  isByteSelected ? 'bg-yellow-500/50 text-black' : ''
                } ${
                  isByteSearchMatch ? 'bg-orange-500/50' : ''
                } ${
                  byteNAL ? 'font-semibold' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOffset(byteOffset);
                  if (onOffsetClick) {
                    onOffsetClick(byteOffset);
                  }
                }}
              >
                {formatHex(byte)}
              </span>
            );
          })}
          {/* Fill empty spaces */}
          {Array.from({ length: bytesPerLine - lineBytes.length }).map((_, idx) => (
            <span key={`empty-${idx}`} className="text-gray-600">  </span>
          ))}
        </div>
        
        {/* ASCII representation */}
        <div className="text-gray-400 w-16 shrink-0">
          {lineBytes.map((byte, idx) => {
            const byteOffset = lineOffset + idx;
            const isByteSelected = selectedOffset === byteOffset;
            return (
              <span
                key={idx}
                className={isByteSelected ? 'bg-yellow-500/50 text-black' : ''}
              >
                {formatASCII(byte)}
              </span>
            );
          })}
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
    
    // Calculate which lines are visible
    const lineHeight = 24; // Approximate line height
    const startLine = Math.max(0, Math.floor(scrollTop / lineHeight) - 50); // Buffer of 50 lines
    const endLine = Math.min(totalLines, Math.ceil((scrollTop + clientHeight) / lineHeight) + 50);
    
    setVisibleRange({ start: startLine, end: endLine });
  }, [totalLines]);

  // Render visible lines only
  const visibleLines = React.useMemo(() => {
    const lines: number[] = [];
    for (let i = visibleRange.start; i < visibleRange.end && i < totalLines; i++) {
      lines.push(i);
    }
    return lines;
  }, [visibleRange, totalLines]);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            Hex Dump
            {isLargeFile && (
              <span className="ml-2 text-xs text-yellow-400">
                (Large file: {Math.round(totalBytes / 1024 / 1024 * 10) / 10}MB - Showing first {visibleRange.end} lines)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search hex..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-8 bg-white/10 border-white/20 text-white w-48"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchTerm && (
              <span className="text-sm text-gray-300">
                {searchResults.length} found
              </span>
            )}
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
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
              Only visible lines are rendered for performance. Use scroll to navigate, or search to jump to specific offsets.
            </p>
          </div>
        )}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="max-h-[600px] overflow-y-auto bg-black/30 rounded p-2"
          style={{ height: isLargeFile ? '600px' : 'auto' }}
        >
          <div className="space-y-0" style={{ height: totalLines * 24 }}>
            {/* Header */}
            <div className="flex items-start gap-2 font-mono text-xs text-gray-400 mb-2 pb-2 border-b border-white/10 sticky top-0 bg-black/50 z-10">
              <div className="w-20 shrink-0">Offset</div>
              <div className="flex-1">Hex</div>
              <div className="w-16 shrink-0">ASCII</div>
            </div>
            
            {/* Spacer for lines before visible range */}
            {visibleRange.start > 0 && (
              <div style={{ height: visibleRange.start * 24 }} />
            )}
            
            {/* Hex lines - only render visible ones */}
            {visibleLines.map((lineIdx) =>
              <div key={lineIdx}>
                {renderLine(lineIdx * bytesPerLine)}
              </div>
            )}
            
            {/* Spacer for lines after visible range */}
            {visibleRange.end < totalLines && (
              <div style={{ height: (totalLines - visibleRange.end) * 24 }} />
            )}
          </div>
        </div>
        
        {/* Legend */}
        {nalUnits.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50"></div>
              <span className="text-gray-300">SPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/20 border border-green-500/50"></div>
              <span className="text-gray-300">PPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/50"></div>
              <span className="text-gray-300">VPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50"></div>
              <span className="text-gray-300">IDR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500/10 border border-gray-500/30"></div>
              <span className="text-gray-300">Other</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

