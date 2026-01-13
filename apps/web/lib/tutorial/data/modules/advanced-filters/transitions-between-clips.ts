import { Lesson } from '@/lib/tutorial/types';

export const transitionsBetweenClips: Lesson = {
  id: 'transitions-between-clips',
  title: 'Transitions Between Clips',
  module: 'Advanced Filters',
  duration: 30,
  unlockAfter: 'deinterlacing',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Smooth transitions (fade, wipe) between clips using filters. Professional editing often requires visual transitions.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Transitions enable:',
      bullets: [
        'Professional video editing workflows',
        'Smooth scene changes',
        'Creative visual effects',
        'Polished final products'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i clip1.mp4 -i clip2.mp4 -filter_complex "[0:v]fade=t=out:st=3:d=1[v0]; [1:v]fade=t=in:st=0:d=1[v1]; [v0][v1]concat=n=2:v=1:a=0[out]" -map "[out]" output.mp4',
      explanation: 'Fade transition: clip1 fades out over 1 second starting at 3s, clip2 fades in over 1 second. Then concatenate the clips.',
      flagBreakdown: [
        {
          flag: 'fade=t=out:st=3:d=1',
          description: 'Fade out: start at 3 seconds, duration 1 second'
        },
        {
          flag: 'fade=t=in:st=0:d=1',
          description: 'Fade in: start at 0 seconds, duration 1 second'
        },
        {
          flag: 'concat=n=2:v=1:a=0',
          description: 'Concatenate 2 video segments, no audio'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i clip1.mp4 -i clip2.mp4 -filter_complex "[0:v]fade=t=out:st=2:d=2[v0]; [1:v]fade=t=in:st=0:d=2[v1]; [v0][v1]concat=n=2:v=1:a=0[out]" -map "[out]" output.mp4',
      explanation: 'Longer fade transition: 2-second fade out/in creates smoother, more noticeable transition.',
      flagBreakdown: [
        {
          flag: 'd=2',
          description: '2-second fade duration (longer = smoother transition)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i clip1.mp4 -i clip2.mp4 -filter_complex "[0:v]trim=0:4,fade=t=out:st=3:d=1[v0]; [1:v]trim=0:4,fade=t=in:st=0:d=1[v1]; [v0][v1]concat=n=2:v=1:a=0[out]" -map "[out]" output.mp4',
      explanation: 'Trim clips first, then apply fade. Ensures clips are same length before concatenation.',
      flagBreakdown: [
        {
          flag: 'trim=0:4',
          description: 'Trim each clip to 4 seconds'
        }
      ]
    },
    {
      type: 'diagram',
      title: 'Fade Transition Timeline',
      diagram: `sequenceDiagram
    participant Clip1 as Clip 1
    participant FadeOut as Fade Out
    participant Transition as Transition Zone
    participant FadeIn as Fade In
    participant Clip2 as Clip 2
    participant Concat as Concatenate
    
    Note over Clip1: Play at full opacity
    Clip1->>FadeOut: Start fade out (st=3s)
    FadeOut->>Transition: Fading out (d=1s)
    Note over Clip2: Start fade in (st=0s)
    Clip2->>FadeIn: Fading in (d=1s)
    FadeIn->>Transition: Overlap zone
    Transition->>Concat: Both clips processed
    Concat->>Concat: Join clips sequentially
    Note over Concat: Output: Smooth transition`,
      explanation: 'Fade transition timeline: Clip 1 fades out while Clip 2 simultaneously fades in, creating an overlap zone. The clips are then concatenated to create a smooth visual transition between scenes.',
      diagramType: 'mermaid',
      diagramFormat: 'sequenceDiagram'
    },
    {
      type: 'bullets',
      heading: 'Transition Tips',
      content: 'Creating smooth transitions:',
      bullets: [
        'fade filter: Most common transition type',
        'fade=t=out: Fade to black (or transparent)',
        'fade=t=in: Fade from black (or transparent)',
        'st: Start time of fade',
        'd: Duration of fade',
        'More advanced transitions require customized filter graphs',
        'Ensure clips are trimmed to appropriate lengths before concatenation'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Fade Transition',
      content: 'Watch a smooth fade transition between two video clips',
      code: 'ffmpeg -i clip1.mp4 -i clip2.mp4 -filter_complex "[0:v]fade=t=out:st=2:d=1[v0]; [1:v]fade=t=in:st=0:d=1[v1]; [v0][v1]concat=n=2:v=1:a=0[out]" -map "[out]" output.mp4',
      explanation: 'This creates a fade transition: first clip fades out while second clip fades in',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-079'
    },
    {
      type: 'challenge',
      title: 'Create Long Fade Transition',
      description: 'Create a command that fades between clips with a 3-second transition',
      requirements: [
        'Use fade filter',
        'Fade out first clip',
        'Fade in second clip',
        'Use 3-second duration',
        'Concatenate the clips'
      ],
      hints: [
        'd=3 sets 3-second duration',
        'fade=t=out for first clip',
        'fade=t=in for second clip',
        'Use concat to join them'
      ],
      solution: 'ffmpeg -i clip1.mp4 -i clip2.mp4 -filter_complex "[0:v]fade=t=out:st=0:d=3[v0]; [1:v]fade=t=in:st=0:d=3[v1]; [v0][v1]concat=n=2:v=1:a=0[out]" -map "[out]" output.mp4',
      validation: {
        type: 'contains',
        value: 'd=3'
      }
    },
    {
      type: 'quiz',
      question: 'What does fade=t=out:st=2:d=1 do?',
      options: [
        { id: 'a', text: 'Fades in starting at 2 seconds for 1 second', correct: false },
        { id: 'b', text: 'Fades out starting at 2 seconds for 1 second', correct: true },
        { id: 'c', text: 'Fades to white', correct: false },
        { id: 'd', text: 'Fades at 2x speed', correct: false }
      ],
      explanation: 'fade=t=out means fade out (to black/transparent), st=2 means start at 2 seconds, and d=1 means duration of 1 second. So it fades out over 1 second starting at the 2-second mark.'
    }
  ]
};
