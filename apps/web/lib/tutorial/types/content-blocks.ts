/**
 * Content block types for tutorial lessons
 * Each block represents a different type of content that can appear in a lesson
 */

import type * as React from 'react';

export interface TextBlock {
  type: 'text';
  content: string; // Markdown or HTML content
  title?: string;
}

export interface CodeBlock {
  type: 'code';
  command: string;
  explanation?: string;
  flagBreakdown?: Array<{
    flag: string;
    description: string;
  }>;
  tryItYourself?: boolean; // Link to command builder
}

export interface ChallengeBlock {
  type: 'challenge';
  title: string;
  description: string;
  requirements: string[];
  hints: string[];
  solution: string;
  validation?: {
    type: 'exact' | 'contains' | 'regex';
    value: string;
  };
}

export interface QuizBlock {
  type: 'quiz';
  question: string;
  options: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
  explanation: string;
}

export interface IntroductionBlock {
  type: 'introduction';
  heading: string;
  content: string;
}

export interface BulletsBlock {
  type: 'bullets';
  heading: string;
  content?: string;
  bullets: string[];
}

export interface PreviewBlock {
  type: 'preview';
  heading: string;
  content: string;
  code: string;
  explanation?: string;
  previewType: 'resize' | 'crop' | 'format' | 'filter';
  sampleVideoId: string;
}

export interface DiagramBlock {
  type: 'diagram';
  title?: string;
  diagram: string; // Diagram definition (Mermaid syntax or React Flow JSON)
  explanation?: string;
  diagramType?: 'mermaid' | 'react-flow' | 'auto';
  diagramFormat?: 'flowchart' | 'graph' | 'sequenceDiagram' | 'filter-graph' | 'custom';
  // Optional React Flow data structure
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

export type ContentBlock =
  | TextBlock
  | CodeBlock
  | ChallengeBlock
  | QuizBlock
  | IntroductionBlock
  | BulletsBlock
  | PreviewBlock
  | DiagramBlock;
