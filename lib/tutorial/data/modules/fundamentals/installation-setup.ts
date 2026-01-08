import { Lesson } from '@/lib/tutorial/types';

export const installationSetup: Lesson = {
  id: 'installation-setup',
  title: 'Installation and Setup',
  module: 'Fundamentals',
  duration: 15,
  unlockAfter: 'what-is-ffmpeg',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'FFmpeg is a command-line tool available for Linux, Windows, and macOS. Installation methods vary by platform, but once installed, FFmpeg provides powerful multimedia processing capabilities.'
    },
    {
      type: 'bullets',
      heading: 'Installation Methods',
      content: 'Install FFmpeg on your platform:',
      bullets: [
        'Linux: Use your package manager (Debian/Ubuntu: sudo apt update && sudo apt install ffmpeg)',
        'macOS: Use Homebrew (brew install ffmpeg)',
        'Windows: Download pre-built FFmpeg zip, extract it, and add the bin folder to your system PATH'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -version',
      explanation: 'After installation, verify FFmpeg is accessible by checking the version. This command displays version information and build configuration.',
      flagBreakdown: [
        {
          flag: '-version',
          description: 'Display version information and build configuration'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'challenge',
      title: 'Verify Installation',
      description: 'Run the command to verify your FFmpeg installation',
      requirements: [
        'Use the -version flag',
        'Check that FFmpeg responds with version information'
      ],
      hints: [
        'The command is ffmpeg -version',
        'This should display version and build information'
      ],
      solution: 'ffmpeg -version',
      validation: {
        type: 'contains',
        value: '-version'
      }
    },
    {
      type: 'quiz',
      question: 'What command should you run to verify FFmpeg installation?',
      options: [
        { id: 'a', text: 'ffmpeg --help', correct: false },
        { id: 'b', text: 'ffmpeg -version', correct: true },
        { id: 'c', text: 'ffmpeg install', correct: false },
        { id: 'd', text: 'ffmpeg check', correct: false }
      ],
      explanation: 'The -version flag displays FFmpeg version information and confirms the installation is working correctly.'
    }
  ]
};
