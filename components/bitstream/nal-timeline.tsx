'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';

interface NALUnit {
  type: number;
  typeName: string;
  size: number;
  offset: number;
}

interface NALTimelineProps {
  nalUnits: NALUnit[];
  onNALClick?: (offset: number) => void;
}

export function NALTimeline({ nalUnits, onNALClick }: NALTimelineProps) {
  // Get color for NAL unit type
  const getNALColor = (type: number): string => {
    // SPS
    if (type === 7 || type === 33) return '#3b82f6'; // blue
    // PPS
    if (type === 8 || type === 34) return '#10b981'; // green
    // VPS (H.265)
    if (type === 32) return '#a855f7'; // purple
    // IDR
    if (type === 5 || type === 19 || type === 20) return '#eab308'; // yellow
    // SEI
    if (type === 6 || type === 39 || type === 40) return '#f97316'; // orange
    // Other slices
    return '#6b7280'; // gray
  };

  // Prepare data for timeline
  const timelineData = React.useMemo(() => {
    // Group NAL units by type for better visualization
    const typeGroups: Record<string, { count: number; totalSize: number; color: string }> = {};
    
    nalUnits.forEach(nal => {
      const key = nal.typeName;
      if (!typeGroups[key]) {
        typeGroups[key] = {
          count: 0,
          totalSize: 0,
          color: getNALColor(nal.type),
        };
      }
      typeGroups[key].count++;
      typeGroups[key].totalSize += nal.size;
    });

    return Object.entries(typeGroups).map(([name, data]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      fullName: name,
      count: data.count,
      totalSize: data.totalSize,
      avgSize: Math.round(data.totalSize / data.count),
      color: data.color,
    }));
  }, [nalUnits]);

  // Prepare sequential data (NAL units in order)
  const sequentialData = React.useMemo(() => {
    return nalUnits.map((nal, idx) => ({
      index: idx,
      offset: nal.offset,
      type: nal.typeName,
      size: nal.size,
      color: getNALColor(nal.type),
    }));
  }, [nalUnits]);

  const [viewMode, setViewMode] = React.useState<'grouped' | 'sequential'>('grouped');

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            NAL Unit Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'grouped'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              Grouped
            </button>
            <button
              onClick={() => setViewMode('sequential')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'sequential'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              Sequential
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'grouped' ? (
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={timelineData}>
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'count') {
                      return [value, 'Count'];
                    }
                    if (name === 'totalSize') {
                      return [`${value.toLocaleString()} bytes`, 'Total Size'];
                    }
                    if (name === 'avgSize') {
                      return [`${value.toLocaleString()} bytes`, 'Avg Size'];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Count" fill="#3b82f6">
                  {timelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Statistics Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-gray-300">NAL Type</th>
                    <th className="text-right py-2 text-gray-300">Count</th>
                    <th className="text-right py-2 text-gray-300">Total Size</th>
                    <th className="text-right py-2 text-gray-300">Avg Size</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineData.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.fullName}
                        </div>
                      </td>
                      <td className="text-right py-2 text-gray-300 font-mono">
                        {item.count}
                      </td>
                      <td className="text-right py-2 text-gray-300 font-mono">
                        {item.totalSize.toLocaleString()} bytes
                      </td>
                      <td className="text-right py-2 text-gray-300 font-mono">
                        {item.avgSize.toLocaleString()} bytes
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sequentialData}>
                <XAxis
                  dataKey="index"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'NAL Unit Index', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                />
                <YAxis
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Size (bytes)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`${value.toLocaleString()} bytes`, 'Size']}
                  labelFormatter={(label) => `NAL Unit #${label}`}
                />
                <Bar
                  dataKey="size"
                  name="Size"
                  onClick={(data: any) => {
                    if (onNALClick && data.offset !== undefined) {
                      onNALClick(data.offset);
                    }
                  }}
                  cursor="pointer"
                >
                  {sequentialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 text-xs text-gray-400">
              <p>Click on a bar to jump to that NAL unit in the hex viewer.</p>
              <p>Total: {nalUnits.length} NAL units</p>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs">
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
            <div className="w-4 h-4 bg-orange-500"></div>
            <span className="text-gray-300">SEI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500"></div>
            <span className="text-gray-300">Other</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


