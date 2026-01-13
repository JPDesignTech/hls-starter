import { Operation, Parameter } from './ffmpeg-operations';
import { getFlagExplanation, FlagExplanation, FlagCategory } from './ffmpeg-explanations';

export interface ParsedCommand {
  binary: string;
  inputs: Array<{ flags: string[]; file: string }>;
  globalOptions: Array<{ flag: string; value?: string }>;
  videoOptions: Array<{ flag: string; value?: string }>;
  audioOptions: Array<{ flag: string; value?: string }>;
  filters: Array<{ type: 'video' | 'audio' | 'complex'; value: string }>;
  outputs: Array<{ flags: string[]; file: string }>;
  rawTokens: Array<{ token: string; type: 'flag' | 'value' | 'file' | 'filter' | 'binary' }>;
}

export interface CommandBreakdown {
  category: FlagCategory | 'filter' | 'input' | 'output';
  items: Array<{
    flag: string;
    value?: string;
    explanation?: FlagExplanation;
  }>;
}

/**
 * Generate FFMPEG command from operation and parameters
 */
export function generateCommand(operation: Operation, params: Record<string, string>): string {
  let command = 'ffmpeg -i input';

  switch (operation.id) {
    case 'convert': {
      const inputExt = params.inputFormat || operation.params[0].defaultValue || 'mp4';
      const outputExt = params.outputFormat || operation.params[1].defaultValue || 'webm';
      const videoCodec = params.videoCodec || operation.params[2].defaultValue || 'libx264';
      const audioCodec = params.audioCodec || operation.params[3].defaultValue || 'aac';

      command = `ffmpeg -i input.${inputExt}`;
      if (videoCodec !== 'copy') {
        command += ` -c:v ${videoCodec}`;
      } else {
        command += ` -c:v copy`;
      }
      if (audioCodec !== 'copy') {
        command += ` -c:a ${audioCodec}`;
      } else {
        command += ` -c:a copy`;
      }
      command += ` output.${outputExt}`;
      break;
    }

    case 'resize': {
      const width = params.width || operation.params[0].defaultValue || '1280';
      const height = params.height || operation.params[1].defaultValue || '720';
      const maintainAspect = params.aspectRatio || operation.params[2].defaultValue || 'yes';

      if (maintainAspect === 'yes') {
        command = `ffmpeg -i input.mp4 -vf scale=${width}:${height} output.mp4`;
      } else {
        command = `ffmpeg -i input.mp4 -vf scale=${width}:${height}:force_original_aspect_ratio=disable output.mp4`;
      }
      break;
    }

    case 'compress': {
      const crf = params.crf || operation.params[0].defaultValue || '23';
      const preset = params.preset || operation.params[1].defaultValue || 'medium';
      const maxBitrate = params.maxBitrate || '';

      command = `ffmpeg -i input.mp4 -c:v libx264 -crf ${crf} -preset ${preset}`;
      if (maxBitrate) {
        command += ` -maxrate ${maxBitrate}k -bufsize ${parseInt(maxBitrate) * 2}k`;
      }
      command += ` output.mp4`;
      break;
    }

    case 'extract': {
      const audioFormat = params.audioFormat || operation.params[0].defaultValue || 'mp3';
      const bitrate = params.bitrate || operation.params[1].defaultValue || '192k';
      const sampleRate = params.sampleRate || '';

      command = `ffmpeg -i input.mp4 -vn`;
      
      if (audioFormat === 'mp3') {
        command += ` -acodec libmp3lame`;
      } else {
        command += ` -acodec ${audioFormat}`;
      }
      
      command += ` -ab ${bitrate}`;
      
      if (sampleRate) {
        command += ` -ar ${sampleRate}`;
      }
      
      command += ` output.${audioFormat}`;
      break;
    }

    case 'trim': {
      const startTime = params.startTime || operation.params[0].defaultValue || '00:00:00';
      const duration = params.duration || operation.params[1].defaultValue || '00:00:10';

      command = `ffmpeg -i input.mp4 -ss ${startTime} -t ${duration} output.mp4`;
      break;
    }

    case 'watermark': {
      const position = params.position || operation.params[0].defaultValue || 'bottom-right';
      const opacity = params.opacity || operation.params[1].defaultValue || '0.5';
      const scale = params.scale || operation.params[2].defaultValue || '0.1';

      // Position mapping
      const positionMap: Record<string, string> = {
        'top-left': '10:10',
        'top-right': 'W-w-10:10',
        'bottom-left': '10:H-h-10',
        'bottom-right': 'W-w-10:H-h-10',
        'center': '(W-w)/2:(H-h)/2',
      };

      const pos = positionMap[position] || positionMap['bottom-right'];
      command = `ffmpeg -i input.mp4 -i watermark.png -filter_complex "[1:v]scale=iw*${scale}:ih*${scale}[wm];[0:v][wm]overlay=${pos}:format=auto,format=yuv420p" -c:a copy output.mp4`;
      break;
    }

    case 'extractFrames': {
      const fps = params.fps || operation.params[0].defaultValue || '1';
      const outputFormat = params.outputFormat || operation.params[1].defaultValue || 'png';
      const startTime = params.startTime || '';

      command = `ffmpeg`;
      if (startTime) {
        command += ` -ss ${startTime}`;
      }
      command += ` -i input.mp4 -vf fps=${fps} output_%03d.${outputFormat}`;
      break;
    }

    case 'speed': {
      const speedFactor = params.speedFactor || operation.params[0].defaultValue || '1.0';
      const speed = parseFloat(speedFactor);
      const ptsValue = (1 / speed).toFixed(2);

      command = `ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=${ptsValue}*PTS[v];[0:a]atempo=${speedFactor}[a]" -map "[v]" -map "[a]" output.mp4`;
      break;
    }

    case 'thumbnail': {
      const timestamp = params.timestamp || operation.params[0].defaultValue || '00:00:01';
      const width = params.width || operation.params[1].defaultValue || '320';
      const height = params.height || operation.params[2].defaultValue || '180';

      command = `ffmpeg -i input.mp4 -ss ${timestamp} -vframes 1 -s ${width}x${height} output.jpg`;
      break;
    }

    case 'merge': {
      const method = params.method || operation.params[0].defaultValue || 'concat';
      
      if (method === 'concat') {
        command = `ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4`;
      } else {
        command = `ffmpeg -i input1.mp4 -i input2.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" output.mp4`;
      }
      break;
    }

    default:
      command = 'ffmpeg -i input.mp4 output.mp4';
  }

  return command;
}

/**
 * Parse an FFMPEG command string into structured format
 */
export function parseCommand(commandString: string): ParsedCommand {
  const trimmed = commandString.trim();
  if (!trimmed) {
    return {
      binary: 'ffmpeg',
      inputs: [],
      globalOptions: [],
      videoOptions: [],
      audioOptions: [],
      filters: [],
      outputs: [],
      rawTokens: [],
    };
  }

  // Tokenize the command
  const tokens: string[] = [];
  let currentToken = '';
  let inQuotes = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
      currentToken += char;
    } else if ((char === ' ' || char === '\t') && !inQuotes) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }
  
  if (currentToken) {
    tokens.push(currentToken);
  }

  // Parse tokens
  const result: ParsedCommand = {
    binary: tokens[0] || 'ffmpeg',
    inputs: [],
    globalOptions: [],
    videoOptions: [],
    audioOptions: [],
    filters: [],
    outputs: [],
    rawTokens: tokens.map((token, index) => {
      if (index === 0) return { token, type: 'binary' as const };
      if (token.startsWith('-i')) return { token, type: 'flag' as const };
      if (token.startsWith('-vf') || token.startsWith('-filter:v') || token.startsWith('-filter_complex')) {
        return { token, type: 'filter' as const };
      }
      if (token.startsWith('-')) return { token, type: 'flag' as const };
      if (index === tokens.length - 1) return { token, type: 'file' as const };
      return { token, type: 'value' as const };
    }),
  };

  let i = 1;
  let currentInput: { flags: string[]; file: string } | null = null;
  let expectingValue = false;
  let lastFlag = '';

  while (i < tokens.length) {
    const token = tokens[i];
    
    // Check if it's the last token (output file)
    if (i === tokens.length - 1 && !token.startsWith('-')) {
      result.outputs.push({ flags: [], file: token });
      break;
    }

    // Input file flag
    if (token === '-i' || token.startsWith('-i')) {
      if (token === '-i') {
        i++;
        const file = tokens[i] || '';
        result.inputs.push({ flags: ['-i'], file });
      } else {
        // -i is combined with value like -iinput.mp4
        const file = token.slice(2);
        result.inputs.push({ flags: ['-i'], file });
      }
      i++;
      continue;
    }

    // Flags
    if (token.startsWith('-')) {
      lastFlag = token;
      expectingValue = true;

      // Categorize flag
      const explanation = getFlagExplanation(token);
      const category = explanation?.category || 'global';

      if (token.startsWith('-vf') || token.startsWith('-filter:v')) {
        i++;
        const filterValue = tokens[i] || '';
        result.filters.push({ type: 'video', value: filterValue });
      } else if (token.startsWith('-af') || token.startsWith('-filter:a')) {
        i++;
        const filterValue = tokens[i] || '';
        result.filters.push({ type: 'audio', value: filterValue });
      } else if (token.startsWith('-filter_complex')) {
        i++;
        const filterValue = tokens[i] || '';
        result.filters.push({ type: 'complex', value: filterValue });
      } else if (category === 'video') {
        i++;
        const value = tokens[i];
        result.videoOptions.push({ flag: token, value });
      } else if (category === 'audio') {
        i++;
        const value = tokens[i];
        result.audioOptions.push({ flag: token, value });
      } else {
        i++;
        const value = tokens[i];
        result.globalOptions.push({ flag: token, value });
      }
      
      i++;
      continue;
    }

    // Value without flag (shouldn't happen in well-formed commands)
    i++;
  }

  return result;
}

/**
 * Get command breakdown organized by category
 */
export function getCommandBreakdown(parsed: ParsedCommand): CommandBreakdown[] {
  const breakdown: CommandBreakdown[] = [];

  // Inputs
  if (parsed.inputs.length > 0) {
    breakdown.push({
      category: 'input',
      items: parsed.inputs.map(input => ({
        flag: '-i',
        value: input.file,
        explanation: getFlagExplanation('-i'),
      })),
    });
  }

  // Global options
  if (parsed.globalOptions.length > 0) {
    breakdown.push({
      category: 'global',
      items: parsed.globalOptions.map(opt => ({
        flag: opt.flag,
        value: opt.value,
        explanation: getFlagExplanation(opt.flag),
      })),
    });
  }

  // Video options
  if (parsed.videoOptions.length > 0) {
    breakdown.push({
      category: 'video',
      items: parsed.videoOptions.map(opt => ({
        flag: opt.flag,
        value: opt.value,
        explanation: getFlagExplanation(opt.flag),
      })),
    });
  }

  // Audio options
  if (parsed.audioOptions.length > 0) {
    breakdown.push({
      category: 'audio',
      items: parsed.audioOptions.map(opt => ({
        flag: opt.flag,
        value: opt.value,
        explanation: getFlagExplanation(opt.flag),
      })),
    });
  }

  // Filters
  if (parsed.filters.length > 0) {
    breakdown.push({
      category: 'filter',
      items: parsed.filters.map(filter => ({
        flag: filter.type === 'video' ? '-vf' : filter.type === 'audio' ? '-af' : '-filter_complex',
        value: filter.value,
        explanation: getFlagExplanation(filter.type === 'video' ? '-vf' : filter.type === 'audio' ? '-af' : '-filter_complex'),
      })),
    });
  }

  // Outputs
  if (parsed.outputs.length > 0) {
    breakdown.push({
      category: 'output',
      items: parsed.outputs.map(output => ({
        flag: 'output',
        value: output.file,
      })),
    });
  }

  return breakdown;
}

/**
 * Validate command syntax (basic validation)
 */
export function validateCommand(commandString: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const trimmed = commandString.trim();

  if (!trimmed) {
    errors.push('Command is empty');
    return { valid: false, errors };
  }

  if (!trimmed.startsWith('ffmpeg')) {
    errors.push('Command should start with "ffmpeg"');
  }

  // Check for at least one input
  if (!trimmed.includes('-i')) {
    errors.push('Command must include at least one input file (-i)');
  }

  // Check for output file (last argument should not start with -)
  const tokens = trimmed.split(/\s+/);
  const lastToken = tokens[tokens.length - 1];
  if (lastToken.startsWith('-')) {
    errors.push('Last argument should be the output file (not a flag)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract filter details from filter string
 */
export function parseFilter(filterString: string): Array<{ name: string; params: Record<string, string> }> {
  // Simple parser for common filters
  const filters: Array<{ name: string; params: Record<string, string> }> = [];
  
  // Remove quotes
  const cleaned = filterString.replace(/^["']|["']$/g, '');
  
  // Split by comma (for chained filters)
  const filterParts = cleaned.split(',').map(f => f.trim());
  
  for (const part of filterParts) {
    const match = part.match(/^(\w+)(?:=(.+))?$/);
    if (match) {
      const [, name, paramsStr] = match;
      const params: Record<string, string> = {};
      
      if (paramsStr) {
        // Parse key=value pairs
        const paramPairs = paramsStr.split(':');
        paramPairs.forEach((pair, index) => {
          if (index === 0 && !pair.includes('=')) {
            params.value = pair;
          } else {
            const [key, value] = pair.split('=');
            if (key && value) {
              params[key] = value;
            }
          }
        });
      }
      
      filters.push({ name, params });
    }
  }
  
  return filters;
}
