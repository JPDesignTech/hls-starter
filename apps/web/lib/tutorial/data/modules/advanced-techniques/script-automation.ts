import { type Lesson } from '@/lib/tutorial/types';

export const scriptAutomation: Lesson = {
  id: 'script-automation',
  title: 'Script Automation',
  module: 'Advanced Techniques',
  duration: 30,
  unlockAfter: 'custom-filter-creation',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Automating FFmpeg workflows with shell scripts, Node/Python scripts, or other build tools. Manual commands don\'t scale — automation is essential for batch processing, scheduled pipelines, and large media libraries.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Script automation enables:',
      bullets: [
        'Batch processing multiple files',
        'Scheduled encoding pipelines',
        'Large media library processing',
        'Consistent workflow execution',
        'Production-ready automation'
      ]
    },
    {
      type: 'code',
      command: 'for f in *.mp4; do\n  ffmpeg -i "$f" -vf "scale=1280:720" "720p_$f"\ndone',
      explanation: 'Bash script: Loop through all MP4 files, resize each to 720p, save with "720p_" prefix. Simple batch processing example.',
      flagBreakdown: [
        {
          flag: 'for f in *.mp4',
          description: 'Loop through all .mp4 files in current directory'
        },
        {
          flag: '"$f"',
          description: 'Reference current filename in loop'
        },
        {
          flag: '"720p_$f"',
          description: 'Output filename with "720p_" prefix'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: '#!/bin/bash\nfor f in *.mp4; do\n  if [ ! -f "720p_$f" ]; then\n    ffmpeg -i "$f" -vf "scale=1280:720" -c:v libx264 -crf 23 "720p_$f"\n  fi\ndone',
      explanation: 'Bash script with existence check: Only process files that haven\'t been converted yet. Prevents re-processing.',
      flagBreakdown: [
        {
          flag: 'if [ ! -f "720p_$f" ]',
          description: 'Check if output file doesn\'t exist'
        },
        {
          flag: '#!/bin/bash',
          description: 'Shebang: specifies bash interpreter'
        }
      ]
    },
    {
      type: 'code',
      command: '#!/bin/bash\nfor f in *.mp4; do\n  echo "Processing $f..."\n  ffmpeg -i "$f" -vf "scale=1280:720" -c:v libx264 -crf 23 "720p_$f" 2>&1 | tee "log_${f%.mp4}.txt"\n  echo "Done: $f"\ndone',
      explanation: 'Bash script with logging: Process files, log output to individual log files, show progress messages.',
      flagBreakdown: [
        {
          flag: '2>&1 | tee "log_${f%.mp4}.txt"',
          description: 'Redirect stderr to stdout, save to log file'
        },
        {
          flag: '${f%.mp4}',
          description: 'Remove .mp4 extension from filename'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Automation Patterns',
      content: 'Common automation approaches:',
      bullets: [
        'Bash scripts: Simple, works on Unix/Linux/macOS',
        'Python scripts: More powerful, cross-platform',
        'Node.js scripts: JavaScript-based automation',
        'CI/CD pipelines: Automated builds and deployments',
        'Scheduled tasks: Cron jobs or task schedulers',
        'Watch folders: Process files as they arrive'
      ]
    },
    {
      type: 'bullets',
      heading: 'Best Practices',
      content: 'Automation tips:',
      bullets: [
        'Check file existence before processing',
        'Log all operations for debugging',
        'Handle errors gracefully',
        'Use progress indicators for long operations',
        'Test scripts on small batches first',
        'Document script parameters and usage',
        'Use version control for scripts'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Script Automation',
      content: 'See how batch processing automates repetitive tasks',
      code: 'ffmpeg -i sample.mp4 -vf "scale=1280:720" -c:v libx264 -crf 23 output.mp4',
      explanation: 'This demonstrates a single conversion that would be automated in a script. Scripts allow processing hundreds of files automatically.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-095'
    },
    {
      type: 'challenge',
      title: 'Create Batch Resize Script',
      description: 'Create a bash script that resizes all MP4 files to 1920×1080',
      requirements: [
        'Loop through all .mp4 files',
        'Resize each to 1920×1080',
        'Save with "1080p_" prefix',
        'Include basic error handling'
      ],
      hints: [
        'Use for loop: for f in *.mp4',
        'Scale filter: scale=1920:1080',
        'Output: "1080p_$f"',
        'Add error check: if [ $? -eq 0 ]'
      ],
      solution: '#!/bin/bash\nfor f in *.mp4; do\n  ffmpeg -i "$f" -vf "scale=1920:1080" "1080p_$f"\n  if [ $? -eq 0 ]; then\n    echo "Success: $f"\n  else\n    echo "Failed: $f"\n  fi\ndone',
      validation: {
        type: 'contains',
        value: 'for f in'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of script automation over manual FFmpeg commands?',
      options: [
        { id: 'a', text: 'Faster individual file processing', correct: false },
        { id: 'b', text: 'Ability to process multiple files automatically', correct: true },
        { id: 'c', text: 'Better video quality', correct: false },
        { id: 'd', text: 'Smaller file sizes', correct: false }
      ],
      explanation: 'Script automation allows you to process multiple files automatically without manually running commands for each file. This is essential for batch processing, scheduled pipelines, and handling large media libraries efficiently.'
    }
  ]
};
