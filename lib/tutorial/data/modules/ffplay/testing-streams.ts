import { Lesson } from '@/lib/tutorial/types';

export const testingStreams: Lesson = {
  id: 'testing-streams',
  title: 'Testing Streams',
  module: 'FFPlay - Video Playback',
  duration: 20,
  unlockAfter: 'low-latency-streaming-playback',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Using FFplay as a stream validator allows you to confirm that streams are reachable, decodable, and stable. This is essential for testing common streaming formats like HLS, RTMP, and UDP.'
    },
    {
      type: 'code',
      command: 'ffplay https://example.com/stream.m3u8',
      explanation: 'Test an HLS stream (.m3u8). HLS (HTTP Live Streaming) is commonly used for web streaming.',
      flagBreakdown: [
        {
          flag: 'https://example.com/stream.m3u8',
          description: 'HLS playlist URL (.m3u8 file)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffplay rtmp://server/live/streamkey',
      explanation: 'Test an RTMP stream. RTMP (Real-Time Messaging Protocol) is commonly used for live streaming.',
      flagBreakdown: [
        {
          flag: 'rtmp://server/live/streamkey',
          description: 'RTMP stream URL with server and stream key'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffplay udp://127.0.0.1:1234',
      explanation: 'Test a local UDP stream. UDP streams are often used for local network streaming.',
      flagBreakdown: [
        {
          flag: 'udp://127.0.0.1:1234',
          description: 'UDP stream at localhost port 1234'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffplay -loglevel info input.mp4',
      explanation: 'Show more detailed logs. Useful for debugging stream issues and understanding what FFplay is doing.',
      flagBreakdown: [
        {
          flag: '-loglevel info',
          description: 'Set log level to info for detailed output'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Stream Testing Use Cases',
      content: 'When to test streams:',
      bullets: [
        'Confirm stream is reachable and accessible',
        'Verify stream is decodable',
        'Check stream stability and quality',
        'Debug connection issues',
        'Validate stream structure and format'
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Streaming Formats',
      content: 'Stream types you can test:',
      bullets: [
        'HLS (.m3u8): HTTP Live Streaming, common for web',
        'RTMP: Real-Time Messaging Protocol, common for live streaming',
        'UDP: User Datagram Protocol, often used for local networks',
        'RTSP: Real-Time Streaming Protocol, common for IP cameras',
        'HTTP: Standard HTTP streaming'
      ]
    },
    {
      type: 'bullets',
      heading: 'Debugging Tips',
      content: 'Tips for stream testing:',
      bullets: [
        'Use -loglevel info for detailed debugging information',
        'Pair with FFprobe to validate stream structure',
        'Check network connectivity if streams fail',
        'Verify stream URLs and authentication',
        'Test with different log levels for troubleshooting'
      ]
    },
    {
      type: 'challenge',
      title: 'Test a Stream',
      description: 'Create a command to test an HLS stream with detailed logging',
      requirements: [
        'Use ffplay command',
        'Add -loglevel info for debugging',
        'Specify an HLS stream URL'
      ],
      hints: [
        'HLS streams use .m3u8 extension',
        'Use -loglevel info for detailed logs',
        'Stream URL can be HTTP or HTTPS'
      ],
      solution: 'ffplay -loglevel info https://example.com/stream.m3u8',
      validation: {
        type: 'contains',
        value: '-loglevel info'
      }
    },
    {
      type: 'quiz',
      question: 'What is the primary use of FFplay for stream testing?',
      options: [
        { id: 'a', text: 'To encode streams', correct: false },
        { id: 'b', text: 'To validate streams are reachable, decodable, and stable', correct: true },
        { id: 'c', text: 'To modify stream content', correct: false },
        { id: 'd', text: 'To create new streams', correct: false }
      ],
      explanation: 'FFplay is used as a stream validator to confirm that streams are reachable, decodable, and stable. It helps verify stream accessibility and quality without modifying the stream.'
    }
  ]
};
