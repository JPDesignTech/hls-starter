import { Lesson } from '@/lib/tutorial/types';

export const errorHandling: Lesson = {
  id: 'error-handling',
  title: 'Error Handling',
  module: 'Advanced Techniques',
  duration: 25,
  unlockAfter: 'script-automation',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Capturing and responding to errors so your automation doesn\'t silently fail. In production, FFmpeg runs can fail due to unsupported codecs, bad inputs, missing fonts, or permission issues.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Error handling enables:',
      bullets: [
        'Detecting failures in automated workflows',
        'Preventing silent failures',
        'Logging errors for debugging',
        'Graceful error recovery',
        'Production-ready automation'
      ]
    },
    {
      type: 'code',
      command: 'if ffmpeg -i badfile.mp4 output.mp4; then\n  echo "Success"\nelse\n  echo "Failed — inspect logs"\nfi',
      explanation: 'Bash error checking: Check exit code ($?) to detect success or failure. FFmpeg returns non-zero exit code on error.',
      flagBreakdown: [
        {
          flag: 'if ... then ... else ... fi',
          description: 'Bash conditional: check command exit code'
        },
        {
          flag: '$?',
          description: 'Exit code of last command (0 = success, non-zero = error)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: '#!/bin/bash\nfor f in *.mp4; do\n  if ffmpeg -i "$f" -vf "scale=1280:720" "720p_$f" 2>&1 | tee "log_${f%.mp4}.txt"; then\n    echo "✓ Success: $f"\n  else\n    echo "✗ Failed: $f (check log_${f%.mp4}.txt)"\n    continue\n  fi\ndone',
      explanation: 'Batch processing with error handling: Process each file, log output, check success, continue on failure. Prevents one failure from stopping entire batch.',
      flagBreakdown: [
        {
          flag: '2>&1 | tee',
          description: 'Capture both stdout and stderr, save to log file'
        },
        {
          flag: 'continue',
          description: 'Skip to next iteration on error'
        }
      ]
    },
    {
      type: 'code',
      command: '#!/bin/bash\nset -e\nset -o pipefail\n\nfor f in *.mp4; do\n  ffmpeg -i "$f" -vf "scale=1280:720" "720p_$f" || {\n    echo "Error processing $f" >&2\n    exit 1\n  }\ndone',
      explanation: 'Strict error handling: set -e exits on any error, set -o pipefail catches errors in pipes. Exit script on first failure.',
      flagBreakdown: [
        {
          flag: 'set -e',
          description: 'Exit immediately if any command fails'
        },
        {
          flag: 'set -o pipefail',
          description: 'Return exit code of failed command in pipeline'
        },
        {
          flag: '|| { ... }',
          description: 'Execute block if previous command fails'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Error Scenarios',
      content: 'FFmpeg can fail due to:',
      bullets: [
        'Unsupported codecs or formats',
        'Corrupted or invalid input files',
        'Missing fonts or filter dependencies',
        'Permission issues (read/write access)',
        'Insufficient disk space',
        'Invalid filter parameters',
        'Hardware acceleration unavailable'
      ]
    },
    {
      type: 'bullets',
      heading: 'Error Handling Best Practices',
      content: 'Production-ready patterns:',
      bullets: [
        'Always check exit codes',
        'Log errors to files for debugging',
        'Use try/catch in Python/Node.js scripts',
        'Validate inputs before processing',
        'Handle specific error types differently',
        'Continue processing on non-critical errors',
        'Alert on critical failures'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Error Handling',
      content: 'See how error handling prevents silent failures',
      code: 'ffmpeg -i sample.mp4 -vf "scale=1280:720" output.mp4',
      explanation: 'This command will succeed with valid input. In automation, always check exit codes to detect failures and handle errors appropriately.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-096'
    },
    {
      type: 'challenge',
      title: 'Add Error Handling',
      description: 'Create a script that processes files with error checking',
      requirements: [
        'Loop through MP4 files',
        'Check if FFmpeg succeeds',
        'Log errors to a file',
        'Continue processing on error'
      ],
      hints: [
        'Use if statement to check exit code',
        'Redirect errors: 2>&1 | tee error.log',
        'Use continue to skip failed files',
        'Check $? for exit code'
      ],
      solution: '#!/bin/bash\nfor f in *.mp4; do\n  if ffmpeg -i "$f" output.mp4 2>&1 | tee error.log; then\n    echo "Success: $f"\n  else\n    echo "Failed: $f" >> error.log\n    continue\n  fi\ndone',
      validation: {
        type: 'contains',
        value: 'if ffmpeg'
      }
    },
    {
      type: 'quiz',
      question: 'What exit code does FFmpeg return on success?',
      options: [
        { id: 'a', text: '1', correct: false },
        { id: 'b', text: '0', correct: true },
        { id: 'c', text: '-1', correct: false },
        { id: 'd', text: '255', correct: false }
      ],
      explanation: 'FFmpeg returns exit code 0 on success and non-zero values (typically 1) on failure. In bash, you can check this with $? or use if statements to detect success/failure.'
    }
  ]
};
