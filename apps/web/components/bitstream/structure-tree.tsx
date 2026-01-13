'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Code, FileCode } from 'lucide-react';

interface NALUnit {
  type: number;
  typeName: string;
  size: number;
  offset: number;
  data: string;
}

interface StructureTreeProps {
  nalUnits: NALUnit[];
  parameterSets?: {
    sps?: NALUnit[];
    pps?: NALUnit[];
    vps?: NALUnit[];
  };
  onNALClick?: (offset: number) => void;
}

interface TreeNodeProps {
  label: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  badge?: string;
  color?: string;
}

function TreeNode({ label, children, defaultExpanded = false, icon, onClick, badge, color }: TreeNodeProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const hasChildren = !!children;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-white/10 cursor-pointer ${color || ''}`}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          }
          if (onClick) {
            onClick();
          }
        }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
          )
        ) : (
          <div className="w-4 h-4 shrink-0" />
        )}
        {icon && <div className="shrink-0">{icon}</div>}
        <span className="text-sm text-white flex-1">{label}</span>
        {badge && (
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="ml-6 border-l border-white/10 pl-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function StructureTree({ nalUnits, parameterSets, onNALClick }: StructureTreeProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['parameter-sets', 'nal-units'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Group NAL units by type
  const groupedNALs = React.useMemo(() => {
    const groups: Record<string, NALUnit[]> = {};
    nalUnits.forEach(nal => {
      const key = nal.typeName;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(nal);
    });
    return groups;
  }, [nalUnits]);

  // Get color for NAL unit type
  const getNALColor = (type: number): string => {
    if (type === 7 || type === 33) return 'bg-blue-500/20 border-l-2 border-blue-500';
    if (type === 8 || type === 34) return 'bg-green-500/20 border-l-2 border-green-500';
    if (type === 32) return 'bg-purple-500/20 border-l-2 border-purple-500';
    if (type === 5 || type === 19 || type === 20) return 'bg-yellow-500/20 border-l-2 border-yellow-500';
    return 'bg-gray-500/10 border-l-2 border-gray-500';
  };

  return (
    <Card className="bg-white/15 border-white/20" style={{ isolation: 'isolate', contain: 'layout style paint' }}>
      <CardHeader>
        <CardTitle className="text-white">Bitstream Structure Tree</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Parameter Sets Section */}
          {parameterSets && (parameterSets.sps?.length || parameterSets.pps?.length || parameterSets.vps?.length) && (
            <div>
              <div
                className="flex items-center gap-2 py-2 px-2 rounded hover:bg-white/10 cursor-pointer font-semibold text-white"
                onClick={() => toggleSection('parameter-sets')}
              >
                {expandedSections.has('parameter-sets') ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <FileCode className="h-4 w-4" />
                <span>Parameter Sets</span>
              </div>
              {expandedSections.has('parameter-sets') && (
                <div className="ml-6 border-l border-white/10 pl-2 space-y-1">
                  {parameterSets.vps && parameterSets.vps.length > 0 && (
                    <TreeNode
                      label="VPS (Video Parameter Set)"
                      badge={`${parameterSets.vps.length}`}
                      defaultExpanded={true}
                      color="bg-purple-500/20 border-l-2 border-purple-500"
                    >
                      {parameterSets.vps.map((vps, idx) => (
                        <TreeNode
                          key={idx}
                          label={`VPS #${idx + 1}`}
                          badge={`${vps.size} bytes @ 0x${vps.offset.toString(16).toUpperCase()}`}
                          onClick={() => onNALClick?.(vps.offset)}
                        />
                      ))}
                    </TreeNode>
                  )}
                  {parameterSets.sps && parameterSets.sps.length > 0 && (
                    <TreeNode
                      label="SPS (Sequence Parameter Set)"
                      badge={`${parameterSets.sps.length}`}
                      defaultExpanded={true}
                      color="bg-blue-500/20 border-l-2 border-blue-500"
                    >
                      {parameterSets.sps.map((sps, idx) => (
                        <TreeNode
                          key={idx}
                          label={`SPS #${idx + 1}`}
                          badge={`${sps.size} bytes @ 0x${sps.offset.toString(16).toUpperCase()}`}
                          onClick={() => onNALClick?.(sps.offset)}
                        />
                      ))}
                    </TreeNode>
                  )}
                  {parameterSets.pps && parameterSets.pps.length > 0 && (
                    <TreeNode
                      label="PPS (Picture Parameter Set)"
                      badge={`${parameterSets.pps.length}`}
                      defaultExpanded={true}
                      color="bg-green-500/20 border-l-2 border-green-500"
                    >
                      {parameterSets.pps.map((pps, idx) => (
                        <TreeNode
                          key={idx}
                          label={`PPS #${idx + 1}`}
                          badge={`${pps.size} bytes @ 0x${pps.offset.toString(16).toUpperCase()}`}
                          onClick={() => onNALClick?.(pps.offset)}
                        />
                      ))}
                    </TreeNode>
                  )}
                </div>
              )}
            </div>
          )}

          {/* NAL Units Section */}
          <div>
            <div
              className="flex items-center gap-2 py-2 px-2 rounded hover:bg-white/10 cursor-pointer font-semibold text-white"
              onClick={() => toggleSection('nal-units')}
            >
              {expandedSections.has('nal-units') ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
              <Code className="h-4 w-4" />
              <span>NAL Units</span>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded">
                {nalUnits.length}
              </span>
            </div>
            {expandedSections.has('nal-units') && (
              <div className="ml-6 border-l border-white/10 pl-2 space-y-1">
                {Object.entries(groupedNALs).map(([typeName, nals]) => (
                  <TreeNode
                    key={typeName}
                    label={typeName}
                    badge={`${nals.length}`}
                    defaultExpanded={false}
                    color={getNALColor(nals[0].type)}
                  >
                    {nals.map((nal, idx) => (
                      <TreeNode
                        key={idx}
                        label={`${typeName} #${idx + 1}`}
                        badge={`${nal.size} bytes @ 0x${nal.offset.toString(16).toUpperCase()}`}
                        onClick={() => onNALClick?.(nal.offset)}
                      />
                    ))}
                  </TreeNode>
                ))}
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total NAL Units:</span>
                <span className="text-white ml-2 font-mono">{nalUnits.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Size:</span>
                <span className="text-white ml-2 font-mono">
                  {nalUnits.reduce((sum, nal) => sum + nal.size, 0).toLocaleString()} bytes
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}








