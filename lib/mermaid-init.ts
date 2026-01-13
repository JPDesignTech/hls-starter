import mermaid from 'mermaid';

let isInitialized = false;

/**
 * Ensures Mermaid is initialized globally. This function is safe to call multiple times
 * and will only initialize once. Returns a Promise that resolves when initialization is complete.
 * Note: mermaid.initialize() is synchronous, but we keep this function async for consistency.
 */
export async function ensureMermaidInitialized(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    // mermaid.initialize() is synchronous - no await needed
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#8b5cf6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#a855f7',
        lineColor: '#a855f7',
        secondaryColor: '#6366f1',
        tertiaryColor: '#1e1b4b',
        background: '#0f172a',
        mainBkgColor: '#1e293b',
        textColor: '#ffffff',
        border1: '#8b5cf6',
        border2: '#a855f7',
        noteBkgColor: '#312e81',
        noteTextColor: '#ffffff',
        noteBorderColor: '#6366f1',
      },
      flowchart: {
        curve: 'basis',
        padding: 20,
      },
    });
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Mermaid:', error);
    throw error;
  }
}

/**
 * Validates that an SVG string contains actual content
 */
export function isValidSvg(svg: string): boolean {
  if (!svg || typeof svg !== 'string') {
    return false;
  }
  const trimmed = svg.trim();
  return (
    trimmed.length > 0 &&
    trimmed.includes('<svg') &&
    trimmed.includes('</svg>') &&
    trimmed.length > 50 // Minimum reasonable SVG size
  );
}
