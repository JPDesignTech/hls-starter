import { Lesson } from '@/lib/tutorial/types';

export const complexFilterGraphs: Lesson = {
  id: 'complex-filter-graphs',
  title: 'Complex Filter Graphs',
  module: 'Advanced Techniques',
  duration: 35,
  unlockAfter: 'cpu-vs-gpu-encoding',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Advanced chaining and branching of multiple filters using -filter_complex. Complex filter graphs let you combine multiple inputs/outputs, run parallel filter paths, and build advanced effects like split, overlay, delayed text, and multi-layer compositing.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Complex filter graphs enable:',
      bullets: [
        'Combining multiple inputs/outputs',
        'Running parallel filter paths',
        'Building advanced effects (split, overlay, delayed text)',
        'Multi-layer compositing',
        'Professional video editing workflows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -filter_complex "split[orig][tmp]; [tmp]crop=iw:ih/2:0:0,vflip[flip]; [orig][flip]overlay=0:H/2" output.mp4',
      explanation: 'Splits the input into two streams, crops & flips the second, then overlays it below the original half. This mirrors the top half onto the bottom.',
      flagBreakdown: [
        {
          flag: 'split[orig][tmp]',
          description: 'Split input into two streams: [orig] and [tmp]'
        },
        {
          flag: '[tmp]crop=iw:ih/2:0:0,vflip[flip]',
          description: 'Crop top half (iw:ih/2), flip vertically, label as [flip]'
        },
        {
          flag: '[orig][flip]overlay=0:H/2',
          description: 'Overlay flipped half at bottom (y=H/2)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -filter_complex "[0:v]split=3[v1][v2][v3]; [v1]scale=640:360[small]; [v2]scale=1280:720[medium]; [v3]scale=1920:1080[large]; [small][medium][large]hstack=inputs=3" output.mp4',
      explanation: 'Split video into three streams, scale each to different sizes, then stack horizontally. Creates a side-by-side comparison of resolutions.',
      flagBreakdown: [
        {
          flag: '[0:v]split=3[v1][v2][v3]',
          description: 'Split video stream into 3 labeled streams'
        },
        {
          flag: '[v1]scale=640:360[small]',
          description: 'Scale first stream to 640×360, label as [small]'
        },
        {
          flag: '[small][medium][large]hstack=inputs=3',
          description: 'Stack three streams horizontally'
        }
      ]
    },
    {
      type: 'diagram',
      title: 'Filter Graph Structure',
      diagram: '',
      explanation: 'Filter graphs are Directed Acyclic Graphs (DAGs) where filters are nodes and streams flow through edges. This example shows splitting input, processing one branch (crop & flip), then overlaying. Filters can split streams, process them in parallel, and combine them.',
      diagramType: 'react-flow',
      reactFlowData: {
        nodes: [
          {
            id: 'input',
            label: 'Input Stream\ninput.mp4',
            position: { x: 0, y: 100 },
            type: 'input'
          },
          {
            id: 'split',
            label: 'split Filter\n[orig][tmp]',
            position: { x: 200, y: 100 },
            type: 'default'
          },
          {
            id: 'orig',
            label: 'Stream [orig]\nOriginal',
            position: { x: 400, y: 0 },
            type: 'default'
          },
          {
            id: 'crop',
            label: 'crop Filter\ncrop=iw:ih/2',
            position: { x: 400, y: 150 },
            type: 'default'
          },
          {
            id: 'flip',
            label: 'vflip Filter\nVertical Flip',
            position: { x: 600, y: 150 },
            type: 'default'
          },
          {
            id: 'overlay',
            label: 'overlay Filter\noverlay=0:H/2',
            position: { x: 800, y: 50 },
            type: 'default'
          },
          {
            id: 'output',
            label: 'Output Stream\noutput.mp4',
            position: { x: 1000, y: 50 },
            type: 'output'
          }
        ],
        edges: [
          {
            id: 'e1',
            source: 'input',
            target: 'split'
          },
          {
            id: 'e2',
            source: 'split',
            target: 'orig',
            label: '[orig]'
          },
          {
            id: 'e3',
            source: 'split',
            target: 'crop',
            label: '[tmp]'
          },
          {
            id: 'e4',
            source: 'crop',
            target: 'flip',
            label: ''
          },
          {
            id: 'e5',
            source: 'flip',
            target: 'overlay',
            label: '[flip]'
          },
          {
            id: 'e6',
            source: 'orig',
            target: 'overlay',
            label: '[orig]'
          },
          {
            id: 'e7',
            source: 'overlay',
            target: 'output'
          }
        ]
      }
    },
    {
      type: 'bullets',
      heading: 'Filter Graph Concepts',
      content: 'Understanding filter graphs:',
      bullets: [
        'Filter graph is a Directed Acyclic Graph (DAG) of connected filters',
        'Filters in same chain separated by commas (,)',
        'Separate chains joined with semicolons (;)',
        'Stream labels (e.g., [label]) connect filters',
        'Input streams referenced as [0:v], [1:a], etc.',
        'Output streams can be mapped with -map "[label]"'
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Patterns',
      content: 'Useful filter graph patterns:',
      bullets: [
        'split: Create multiple copies of a stream',
        'overlay: Composite streams together',
        'concat: Join multiple streams sequentially',
        'hstack/vstack: Combine streams side-by-side or stacked',
        'Parallel processing: Process same input multiple ways',
        'Conditional effects: Use expressions for dynamic behavior'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Complex Filter Graph',
      content: 'See how complex filter graphs create advanced effects',
      code: 'ffmpeg -i sample.mp4 -filter_complex "split[orig][tmp]; [tmp]crop=iw:ih/2:0:0,vflip[flip]; [orig][flip]overlay=0:H/2" output.mp4',
      explanation: 'This demonstrates a complex filter graph: splitting input, processing one branch, then overlaying. The graph shows how streams flow through multiple filters.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-090'
    },
    {
      type: 'challenge',
      title: 'Create Split and Overlay Graph',
      description: 'Create a filter graph that splits video, applies blur to one copy, then overlays it',
      requirements: [
        'Use split to create two streams',
        'Apply blur to one stream',
        'Overlay blurred stream on original',
        'Use proper stream labels'
      ],
      hints: [
        'split[orig][blurred] creates two labeled streams',
        'Apply blur filter to [blurred] stream',
        'Use overlay to combine [orig] and blurred stream',
        'Remember to use semicolons between filter chains'
      ],
      solution: 'ffmpeg -i input.mp4 -filter_complex "split[orig][blurred]; [blurred]gblur=sigma=10[blur]; [orig][blur]overlay=0:0" output.mp4',
      validation: {
        type: 'contains',
        value: 'split'
      }
    },
    {
      type: 'quiz',
      question: 'In a filter graph, what separates filters in the same chain?',
      options: [
        { id: 'a', text: 'Semicolons (;)', correct: false },
        { id: 'b', text: 'Commas (,)', correct: true },
        { id: 'c', text: 'Pipes (|)', correct: false },
        { id: 'd', text: 'Colons (:)', correct: false }
      ],
      explanation: 'Filters in the same chain are separated by commas. Semicolons separate different filter chains. For example: "scale=640:360,crop=320:240" applies scale then crop to the same stream.'
    }
  ]
};
