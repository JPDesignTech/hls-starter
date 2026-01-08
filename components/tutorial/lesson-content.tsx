'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentBlock, Lesson } from '@/lib/tutorial';
import { CodeExample } from './code-example';
import { InteractiveChallenge } from './interactive-challenge';
import { QuizComponent } from './quiz-component';
import { InteractivePreview } from './interactive-preview';
import { completeLesson, setCurrentLesson } from '@/lib/tutorial-progress';

interface LessonContentProps {
  lesson: Lesson;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function LessonContent({ lesson, onNext, onPrevious, hasNext, hasPrevious }: LessonContentProps) {
  const [completedBlocks, setCompletedBlocks] = React.useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    // Set current lesson when component mounts
    setCurrentLesson(lesson.id);
    setIsCompleted(false);
    setCompletedBlocks(new Set());
  }, [lesson.id]);

  const handleBlockComplete = (blockIndex: number) => {
    setCompletedBlocks(prev => new Set(prev).add(blockIndex));
    
    // Check if all interactive blocks are completed
    const interactiveBlocks = lesson.content
      .map((block, idx) => ({ block, idx }))
      .filter(({ block }) => block.type === 'challenge' || block.type === 'quiz');
    
    const allCompleted = interactiveBlocks.every(({ idx }) => 
      completedBlocks.has(idx) || idx === blockIndex
    );
    
    if (allCompleted && interactiveBlocks.length > 0) {
      // Auto-complete lesson if all interactive blocks are done
      setTimeout(() => {
        handleCompleteLesson();
      }, 1000);
    }
  };

  const handleCompleteLesson = () => {
    if (!isCompleted) {
      completeLesson(lesson.id);
      setIsCompleted(true);
    }
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        // Simple markdown parser for text content
        const parseMarkdown = (text: string): string => {
          let html = text;
          
          // Headers
          html = html.replace(/^### (.*$)/gim, '<h3 class="text-white text-xl font-bold mt-4 mb-3">$1</h3>');
          html = html.replace(/^## (.*$)/gim, '<h2 class="text-white text-2xl font-bold mt-6 mb-4">$1</h2>');
          html = html.replace(/^# (.*$)/gim, '<h1 class="text-white text-3xl font-bold mt-6 mb-4">$1</h1>');
          
          // Bold
          html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>');
          
          // Inline code
          html = html.replace(/`([^`]+)`/gim, '<code class="bg-black/50 text-green-400 px-2 py-1 rounded text-sm font-mono">$1</code>');
          
          // Code blocks
          html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-black/50 rounded-lg p-4 overflow-x-auto mb-4 border border-gray-700"><code class="text-green-400 font-mono text-sm">$1</code></pre>');
          
          // Lists
          html = html.replace(/^\- (.*$)/gim, '<li class="text-gray-300 ml-4">$1</li>');
          html = html.replace(/(<li.*<\/li>)/gim, '<ul class="list-disc mb-4 space-y-2">$1</ul>');
          
          // Paragraphs (split by double newlines)
          const paragraphs = html.split(/\n\n+/);
          html = paragraphs
            .map(p => {
              p = p.trim();
              if (!p) return '';
              // Don't wrap headers, code blocks, or lists
              if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<li')) {
                return p;
              }
              return `<p class="mb-4">${p}</p>`;
            })
            .filter(p => p)
            .join('');
          
          return html;
        };

        return (
          <div key={index} className="prose prose-invert max-w-none">
            {block.title && (
              <h3 className="text-white text-2xl font-bold mb-4">{block.title}</h3>
            )}
            <div 
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }}
            />
          </div>
        );

      case 'code':
        return (
          <div key={index} className="my-6">
            <CodeExample block={block} />
          </div>
        );

      case 'challenge':
        return (
          <div key={index} className="my-6">
            <InteractiveChallenge
              block={block}
              challengeId={`${lesson.id}-challenge-${index}`}
              onComplete={() => handleBlockComplete(index)}
            />
          </div>
        );

      case 'quiz':
        return (
          <div key={`${lesson.id}-quiz-${index}`} className="my-6">
            <QuizComponent
              block={block}
              lessonId={lesson.id}
              onComplete={() => handleBlockComplete(index)}
            />
          </div>
        );

      case 'introduction':
        return (
          <div key={index}>
            <h2 className="text-white text-xl mb-3">{block.heading}</h2>
            <p className="text-white/80 leading-relaxed">{block.content}</p>
          </div>
        );

      case 'bullets':
        return (
          <div key={index}>
            <h2 className="text-white text-xl mb-3">{block.heading}</h2>
            {block.content && (
              <p className="text-white/80 mb-4">{block.content}</p>
            )}
            <ul className="space-y-2">
              {block.bullets.map((bullet, i) => {
                const [title, ...rest] = bullet.split(':');
                const description = rest.join(':');
                return (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <div className="text-white/80">
                      {description ? (
                        <>
                          <span className="text-white">{title}:</span>
                          <span className="text-white/70">{description}</span>
                        </>
                      ) : (
                        bullet
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );

      case 'preview':
        return (
          <div key={index} className="my-6">
            <InteractivePreview
              heading={block.heading}
              content={block.content}
              code={block.code}
              explanation={block.explanation}
              previewType={block.previewType}
              sampleVideoId={block.sampleVideoId}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lesson Header */}
      <div className="mb-8">
        <div className="text-purple-400 text-sm mb-2">{lesson.module}</div>
        <h1 className="text-white text-3xl mb-2">{lesson.title}</h1>
        <div className="text-white/60">Duration: {lesson.duration} minutes</div>
      </div>

      {/* Lesson Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8">
          {lesson.content.map((block, index) => renderContentBlock(block, index))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-12 pt-6 border-t border-purple-700/30">
        <Button
          onClick={handleCompleteLesson}
          disabled={isCompleted}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Complete Lesson</span>
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasNext}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all"
        >
          Next Lesson →
        </Button>
      </div>
    </div>
  );
}
