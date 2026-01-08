/**
 * Lesson Template
 * 
 * Copy this file to create a new lesson.
 * Follow the naming convention: {lesson-id}.ts
 * Export name should be camelCase matching the lesson ID.
 * 
 * Steps to create a new lesson:
 * 1. Copy this file to the appropriate module directory
 * 2. Rename to match your lesson ID (e.g., my-new-lesson.ts)
 * 3. Update the export name (e.g., myNewLesson)
 * 4. Fill in all the lesson details
 * 5. Add the lesson to the module's index.ts file
 */

import { Lesson } from '@/lib/tutorial/types';

export const lessonTemplate: Lesson = {
  id: 'lesson-template', // TODO: Update to kebab-case lesson ID
  title: 'Lesson Title', // TODO: Update to human-readable title
  module: 'Module Name', // TODO: Update to match module directory (Fundamentals, Video Processing, Audio Processing)
  duration: 20, // TODO: Estimate duration in minutes
  unlockAfter: 'previous-lesson-id', // TODO: Set to previous lesson ID, or remove if first lesson
  
  content: [
    // 1. Introduction Block (recommended first)
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Brief introduction explaining what this lesson covers and why it\'s important.'
    },

    // 2. Text Block (for explanations)
    {
      type: 'text',
      title: 'Section Title', // Optional
      content: `Use markdown formatting for rich content.

## Headers
Use ## for section headers, ### for subsections.

**Bold text** for emphasis.

- Bullet points
- More points

\`inline code\` for code snippets.

\`\`\`
Code blocks for longer examples
\`\`\``
    },

    // 3. Code Block (for FFmpeg commands)
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 output.avi',
      explanation: 'Brief explanation of what this command does and when to use it.',
      flagBreakdown: [ // Optional but recommended for complex commands
        {
          flag: '-i input.mp4',
          description: 'Specify the input file'
        },
        {
          flag: 'output.avi',
          description: 'Output filename and format'
        }
      ],
      tryItYourself: true // Optional: adds "Try it yourself" button
    },

    // 4. Bullets Block (for summaries)
    {
      type: 'bullets',
      heading: 'Key Points',
      content: 'Optional introductory text before the bullets',
      bullets: [
        'First key point',
        'Second key point',
        'Third key point'
      ]
    },

    // 5. Challenge Block (for interactive practice)
    {
      type: 'challenge',
      title: 'Challenge: Do Something',
      description: 'Clear description of what the user should accomplish in this challenge.',
      requirements: [
        'Requirement 1: What needs to be done',
        'Requirement 2: Another requirement',
        'Requirement 3: Final requirement'
      ],
      hints: [
        'First hint (general guidance)',
        'Second hint (more specific)',
        'Third hint (almost gives it away)'
      ],
      solution: 'ffmpeg -i input.mp4 output.mp4',
      validation: { // Optional but recommended
        type: 'contains', // 'exact' | 'contains' | 'regex'
        value: '-i input.mp4'
      }
    },

    // 6. Preview Block (for visual demonstrations)
    {
      type: 'preview',
      heading: 'Try It: Action Name',
      content: 'Description of what this preview demonstrates',
      code: 'ffmpeg -i sample.mp4 -vf "scale=1280:720" output.mp4',
      explanation: 'Optional explanation of the command', // Optional
      previewType: 'resize', // 'resize' | 'crop' | 'format' | 'filter'
      sampleVideoId: 'sample-resize-001' // TODO: Use unique ID for sample video
    },

    // 7. Quiz Block (for knowledge checks)
    {
      type: 'quiz',
      question: 'What does the -i flag do in FFmpeg?',
      options: [
        { id: 'a', text: 'Sets the output file', correct: false },
        { id: 'b', text: 'Specifies the input file', correct: true },
        { id: 'c', text: 'Enables interactive mode', correct: false },
        { id: 'd', text: 'Sets the input codec', correct: false }
      ],
      explanation: 'The -i flag is used to specify the input file(s) for FFmpeg to process. This is a required flag when you want to process a file.'
    }
  ]
};

/**
 * Content Block Ordering Recommendations:
 * 
 * 1. IntroductionBlock - Sets context
 * 2. TextBlock - Provides background/explanation
 * 3. CodeBlock - Show practical usage
 * 4. BulletsBlock - Summarize key points
 * 5. ChallengeBlock - Let users practice
 * 6. PreviewBlock - Visual demonstrations
 * 7. QuizBlock - Test understanding
 * 
 * Not all blocks are required - use what makes sense for your lesson!
 */
