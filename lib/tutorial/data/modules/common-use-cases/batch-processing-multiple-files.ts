import { Lesson } from '@/lib/tutorial/types';

export const batchProcessingMultipleFiles: Lesson = {
  id: 'batch-processing-multiple-files',
  title: 'Batch Processing Multiple Files',
  module: 'Common Use Cases',
  duration: 25,
  unlockAfter: 'creating-video-loops',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Running FFmpeg on multiple files automatically is essential for automation, scripts, and CI/CD pipelines. Batch processing allows you to convert, process, or analyze many files without manual intervention.'
    },
    {
      type: 'code',
      command: 'for f in *.mp4; do ffmpeg -i "$f" "${f%.mp4}.webm"; done',
      explanation: 'Batch convert MP4 to WebM (Bash). Processes all MP4 files in current directory, converting each to WebM format.',
      flagBreakdown: [
        {
          flag: 'for f in *.mp4',
          description: 'Loop through all .mp4 files'
        },
        {
          flag: '"${f%.mp4}.webm"',
          description: 'Output filename: replace .mp4 extension with .webm'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'text',
      title: 'Bash Script Explanation',
      content: `The Bash script works as follows:

\`\`\`bash
for f in *.mp4; do
  ffmpeg -i "$f" "\${f%.mp4}.webm"
done
\`\`\`

- \`for f in *.mp4\`: Iterates through all .mp4 files
- \`"$f"\`: Uses the current filename (quoted to handle spaces)
- \`"\${f%.mp4}.webm"\`: Removes .mp4 extension and adds .webm
- \`done\`: Ends the loop`
    },
    {
      type: 'code',
      command: 'Get-ChildItem *.mp4 | ForEach-Object { ffmpeg -i $_.Name ($_.BaseName + ".mp3") }',
      explanation: 'Batch convert MP4 to MP3 (PowerShell). Windows PowerShell equivalent for batch processing.',
      flagBreakdown: [
        {
          flag: 'Get-ChildItem *.mp4',
          description: 'Get all .mp4 files in current directory'
        },
        {
          flag: 'ForEach-Object',
          description: 'Process each file'
        },
        {
          flag: '$_.Name',
          description: 'Current file name'
        },
        {
          flag: '$_.BaseName + ".mp3"',
          description: 'Output filename: base name + .mp3 extension'
        }
      ]
    },
    {
      type: 'text',
      title: 'PowerShell Script Explanation',
      content: `The PowerShell script works as follows:

\`\`\`powershell
Get-ChildItem *.mp4 | ForEach-Object {
  ffmpeg -i \$_.Name (\$_.BaseName + ".mp3")
}
\`\`\`

- \`Get-ChildItem *.mp4\`: Gets all .mp4 files
- \`|\`: Pipes to next command
- \`ForEach-Object\`: Processes each file
- \`\$_.Name\`: Current file's full name
- \`\$_.BaseName\`: Current file's name without extension`
    },
    {
      type: 'code',
      command: 'for f in *.mp4; do ffmpeg -i "$f" -c:v libx264 -crf 23 "${f%.mp4}_compressed.mp4"; done',
      explanation: 'Batch compress videos. Add quality/size control flags to batch processing.',
      flagBreakdown: [
        {
          flag: '-c:v libx264 -crf 23',
          description: 'Compress with H.264 codec, CRF 23 (good quality)'
        },
        {
          flag: '"${f%.mp4}_compressed.mp4"',
          description: 'Output: original name + _compressed suffix'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Batch Processing Tips',
      content: 'Best practices for batch processing:',
      bullets: [
        'Test commands on a single file first',
        'Use quotes around filenames to handle spaces',
        'Create backups before batch processing',
        'Monitor disk space for large batches',
        'Perfect for automation and CI/CD pipelines'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to use batch processing:',
      bullets: [
        'Format conversion: Convert entire directories',
        'Compression: Optimize multiple videos',
        'Thumbnail generation: Create thumbnails for video libraries',
        'Metadata extraction: Analyze multiple files',
        'Automation: Integrate into scripts and workflows'
      ]
    },
    {
      type: 'challenge',
      title: 'Create Batch Script',
      description: 'Create a Bash script to convert all MP4 files to MP3 format',
      requirements: [
        'Use for loop to iterate through MP4 files',
        'Use ffmpeg to convert each file',
        'Output should be MP3 format'
      ],
      hints: [
        'Use for f in *.mp4; do ... done',
        'Input: "$f"',
        'Output: "${f%.mp4}.mp3"'
      ],
      solution: 'for f in *.mp4; do ffmpeg -i "$f" "${f%.mp4}.mp3"; done',
      validation: {
        type: 'contains',
        value: 'for f in *.mp4'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of batch processing?',
      options: [
        { id: 'a', text: 'It improves video quality', correct: false },
        { id: 'b', text: 'It allows processing multiple files automatically', correct: true },
        { id: 'c', text: 'It reduces file sizes', correct: false },
        { id: 'd', text: 'It speeds up individual file processing', correct: false }
      ],
      explanation: 'Batch processing allows you to run FFmpeg commands on multiple files automatically, making it perfect for automation, scripts, and CI/CD pipelines without manual intervention.'
    }
  ]
};
