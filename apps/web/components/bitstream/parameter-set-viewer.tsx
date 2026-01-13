'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface NALUnit {
  type: number;
  typeName: string;
  size: number;
  offset: number;
  data: string;
}

interface ParameterSetViewerProps {
  parameterSets?: {
    sps?: NALUnit[];
    pps?: NALUnit[];
    vps?: NALUnit[];
  };
  codec?: 'h264' | 'h265';
  onOffsetClick?: (offset: number) => void;
}

function ParameterSetCard({ 
  title, 
  nals, 
  color, 
  onOffsetClick 
}: { 
  title: string; 
  nals: NALUnit[]; 
  color: string;
  onOffsetClick?: (offset: number) => void;
}) {
  const [expanded, setExpanded] = React.useState(true);

  if (!nals || nals.length === 0) {
    return null;
  }

  return (
    <Card className={`${color} border-white/20 mb-4`} style={{ isolation: 'isolate', contain: 'layout style paint' }}>
      <CardHeader>
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 bg-white/20 px-2 py-1 rounded">
              {nals.length} {nals.length === 1 ? 'set' : 'sets'}
            </span>
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="space-y-4">
            {nals.map((nal, idx) => (
              <div
                key={idx}
                className="bg-black/30 rounded p-4 hover:bg-black/40 transition-colors cursor-pointer"
                onClick={() => onOffsetClick?.(nal.offset)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">
                    {title} #{idx + 1}
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">
                    Offset: 0x{nal.offset.toString(16).toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white ml-2 font-mono">
                      {nal.size.toLocaleString()} bytes
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">NAL Type:</span>
                    <span className="text-white ml-2 font-mono">{nal.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type Name:</span>
                    <span className="text-white ml-2">{nal.typeName}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-400 font-mono break-all">
                    <span className="text-gray-500">Hex (first 64 bytes):</span>
                    <div className="text-gray-300 mt-1">
                      {nal.data.substring(0, 128).match(/.{1,32}/g)?.map((chunk, i) => (
                        <div key={i} className="mb-1">
                          {chunk.match(/.{1,2}/g)?.join(' ')}
                        </div>
                      ))}
                      {nal.data.length > 128 && (
                        <div className="text-gray-500 mt-1">...</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Click to view in hex viewer
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function ParameterSetViewer({ parameterSets, codec, onOffsetClick }: ParameterSetViewerProps) {
  if (!parameterSets || (!parameterSets.sps?.length && !parameterSets.pps?.length && !parameterSets.vps?.length)) {
    return (
      <Card className="bg-white/15 border-white/20" style={{ isolation: 'isolate', contain: 'layout style paint' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Parameter Sets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            No parameter sets found. Parameter sets are only available for H.264 and H.265 codecs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {parameterSets.vps && parameterSets.vps.length > 0 && (
        <ParameterSetCard
          title="VPS (Video Parameter Set)"
          nals={parameterSets.vps}
          color="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30"
          onOffsetClick={onOffsetClick}
        />
      )}
      {parameterSets.sps && parameterSets.sps.length > 0 && (
        <ParameterSetCard
          title="SPS (Sequence Parameter Set)"
          nals={parameterSets.sps}
          color="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30"
          onOffsetClick={onOffsetClick}
        />
      )}
      {parameterSets.pps && parameterSets.pps.length > 0 && (
        <ParameterSetCard
          title="PPS (Picture Parameter Set)"
          nals={parameterSets.pps}
          color="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30"
          onOffsetClick={onOffsetClick}
        />
      )}
      
      {/* Codec Info */}
      {codec && (
        <Card className="bg-white/15 border-white/20" style={{ isolation: 'isolate', contain: 'layout style paint' }}>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-300">
              <p className="mb-2">
                <span className="font-semibold">Codec:</span> {codec.toUpperCase()}
              </p>
              <div className="space-y-1 text-xs">
                {codec === 'h264' && (
                  <>
                    <p>• SPS contains sequence-level parameters (resolution, frame rate, etc.)</p>
                    <p>• PPS contains picture-level parameters (quantization, entropy coding, etc.)</p>
                  </>
                )}
                {codec === 'h265' && (
                  <>
                    <p>• VPS contains video-level parameters (layers, profiles, etc.)</p>
                    <p>• SPS contains sequence-level parameters (resolution, frame rate, etc.)</p>
                    <p>• PPS contains picture-level parameters (quantization, entropy coding, etc.)</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}








