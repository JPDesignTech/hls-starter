import { type Lesson } from '@/lib/tutorial/types';

export const extractingSpecificMetadataFields: Lesson = {
  id: 'extracting-specific-metadata-fields',
  title: 'Extracting Specific Metadata Fields',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'json-output-formatting',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Extracting specific metadata fields in various output formats (CSV, JSON, XML) is perfect for scripting and automation. FFprobe supports multiple output formats for different use cases.'
    },
    {
      type: 'code',
      command: 'ffprobe -v quiet -of csv=p=0 -show_entries format=duration input.mp4',
      explanation: 'Extract duration in CSV format. The -of csv=p=0 flag outputs CSV without headers, perfect for scripting.',
      flagBreakdown: [
        {
          flag: '-v quiet',
          description: 'Suppress all output except requested fields'
        },
        {
          flag: '-of csv=p=0',
          description: 'Output format: CSV without headers (p=0)'
        },
        {
          flag: '-show_entries format=duration',
          description: 'Show only duration field'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffprobe -v quiet -of json -show_entries format=duration input.mp4',
      explanation: 'Extract duration in JSON format. JSON provides structured output even for single fields.',
      flagBreakdown: [
        {
          flag: '-of json',
          description: 'Output format: JSON'
        },
        {
          flag: '-show_entries format=duration',
          description: 'Show duration field'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -v quiet -of xml -show_entries format=duration input.mp4',
      explanation: 'Extract duration in XML format. XML provides structured output with tags.',
      flagBreakdown: [
        {
          flag: '-of xml',
          description: 'Output format: XML'
        },
        {
          flag: '-show_entries format=duration',
          description: 'Show duration field'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Output Formats',
      content: 'FFprobe supports multiple output formats:',
      bullets: [
        'CSV: Comma-separated values, good for spreadsheets',
        'JSON: Structured data, perfect for APIs and scripts',
        'XML: Tagged structure, useful for some systems',
        'Default: Human-readable text format',
        'Choose format based on your use case'
      ]
    },
    {
      type: 'bullets',
      heading: 'Formatting Tips',
      content: 'Tips for extracting specific fields:',
      bullets: [
        'Use -v quiet for clean output',
        'CSV with p=0 removes headers',
        'JSON provides structured output',
        'XML provides tagged structure',
        'Perfect for scripting and automation'
      ]
    },
    {
      type: 'quiz',
      question: 'What does -of csv=p=0 do?',
      options: [
        { id: 'a', text: 'Outputs CSV with headers', correct: false },
        { id: 'b', text: 'Outputs CSV without headers (p=0)', correct: true },
        { id: 'c', text: 'Outputs JSON format', correct: false },
        { id: 'd', text: 'Outputs XML format', correct: false }
      ],
      explanation: '-of csv=p=0 outputs CSV format without headers (p=0 means no print headers), making it perfect for scripting where you only need the data values.'
    }
  ]
};
