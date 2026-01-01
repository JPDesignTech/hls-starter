/**
 * NAL Unit Parser for H.264 and H.265/HEVC
 * Parses bitstream data to extract NAL units and their types
 */

export interface NALUnit {
  type: number;
  typeName: string;
  size: number;
  offset: number;
  data: string; // hex string
  refIdc?: number; // H.264 only
  layerId?: number; // H.265 only
  temporalId?: number; // H.265 only
}

export interface ParameterSets {
  sps?: NALUnit[];
  pps?: NALUnit[];
  vps?: NALUnit[]; // H.265 only
}

// H.264 NAL Unit Type Names
const H264_NAL_TYPES: Record<number, string> = {
  0: 'Unspecified',
  1: 'Non-IDR Coded Slice',
  2: 'Coded Slice Data Partition A',
  3: 'Coded Slice Data Partition B',
  4: 'Coded Slice Data Partition C',
  5: 'IDR Coded Slice',
  6: 'SEI',
  7: 'SPS',
  8: 'PPS',
  9: 'Access Unit Delimiter',
  10: 'End of Sequence',
  11: 'End of Stream',
  12: 'Filler Data',
  13: 'SPS Extension',
  14: 'Prefix NAL Unit',
  15: 'Subset SPS',
  19: 'Coded Slice Auxiliary Picture',
  20: 'Coded Slice Extension',
};

// H.265 NAL Unit Type Names
const H265_NAL_TYPES: Record<number, string> = {
  0: 'TRAIL_N',
  1: 'TRAIL_R',
  2: 'TSA_N',
  3: 'TSA_R',
  4: 'STSA_N',
  5: 'STSA_R',
  6: 'RADL_N',
  7: 'RADL_R',
  8: 'RASL_N',
  9: 'RASL_R',
  10: 'RSV_VCL_N10',
  11: 'RSV_VCL_R11',
  12: 'RSV_VCL_N12',
  13: 'RSV_VCL_R13',
  14: 'RSV_VCL_N14',
  15: 'RSV_VCL_R15',
  16: 'BLA_W_LP',
  17: 'BLA_W_RADL',
  18: 'BLA_N_LP',
  19: 'IDR_W_RADL',
  20: 'IDR_N_LP',
  21: 'CRA_NUT',
  22: 'RSV_IRAP_VCL22',
  23: 'RSV_IRAP_VCL23',
  32: 'VPS',
  33: 'SPS',
  34: 'PPS',
  35: 'Access Unit Delimiter',
  36: 'EOS',
  37: 'EOB',
  38: 'FD',
  39: 'PREFIX_SEI',
  40: 'SUFFIX_SEI',
};

/**
 * Find NAL unit start codes in hex string
 * Start codes: 0x00000001 (4-byte) or 0x000001 (3-byte)
 */
function findStartCodes(hexData: string): number[] {
  const positions: number[] = [];
  let i = 0;
  
  while (i < hexData.length - 6) {
    // Check for 4-byte start code (00000001)
    if (hexData.substring(i, i + 8) === '00000001') {
      positions.push(i / 2); // Convert hex char position to byte position
      i += 8;
    }
    // Check for 3-byte start code (000001)
    else if (hexData.substring(i, i + 6) === '000001') {
      positions.push(i / 2);
      i += 6;
    } else {
      i += 2;
    }
  }
  
  return positions;
}

/**
 * Parse H.264 NAL unit header
 * Format: [forbidden_zero_bit(1)][nal_ref_idc(2)][nal_unit_type(5)]
 */
function parseH264NALHeader(byte: number): { type: number; refIdc: number } {
  const type = byte & 0x1f; // Lower 5 bits
  const refIdc = (byte >> 5) & 0x03; // Bits 5-6
  return { type, refIdc };
}

/**
 * Parse H.265 NAL unit header
 * Format: [forbidden_zero_bit(1)][nal_unit_type(6)][nuh_layer_id(6)][nuh_temporal_id_plus1(3)]
 */
function parseH265NALHeader(byte: number): { type: number; layerId: number; temporalId: number } {
  const type = (byte >> 1) & 0x3f; // Bits 1-6
  const layerId = ((byte & 0x01) << 5) | ((byte >> 7) & 0x1f); // Complex bit extraction
  // For simplicity, we'll parse the second byte for layer_id and temporal_id
  return { type, layerId: 0, temporalId: 0 };
}

/**
 * Parse H.265 NAL unit header (2-byte header)
 */
function parseH265NALHeader2Bytes(byte1: number, byte2: number): { type: number; layerId: number; temporalId: number } {
  const type = (byte1 >> 1) & 0x3f; // Bits 1-6 of first byte
  const layerId = ((byte1 & 0x01) << 5) | ((byte2 >> 3) & 0x1f); // Bits 7-12
  const temporalId = byte2 & 0x07; // Lower 3 bits of second byte
  return { type, layerId, temporalId };
}

/**
 * Convert hex string to byte array
 */
function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return bytes;
}

/**
 * Parse NAL units from H.264 bitstream
 */
export function parseH264NALUnits(hexData: string): NALUnit[] {
  const nalUnits: NALUnit[] = [];
  const startPositions = findStartCodes(hexData);
  
  if (startPositions.length === 0) {
    return nalUnits;
  }
  
  for (let i = 0; i < startPositions.length; i++) {
    const startPos = startPositions[i];
    const nextStartPos = i < startPositions.length - 1 
      ? startPositions[i + 1] 
      : hexData.length / 2;
    
    // Extract NAL unit data (skip start code)
    const nalStartByte = startPos + 4; // Skip 4-byte start code (00000001)
    const nalEndByte = nextStartPos;
    
    if (nalStartByte >= nalEndByte) continue;
    
    // Extract NAL unit header byte
    const headerStart = nalStartByte * 2; // Convert to hex char position
    const headerHex = hexData.substring(headerStart, headerStart + 2);
    const headerByte = parseInt(headerHex, 16);
    
    const { type, refIdc } = parseH264NALHeader(headerByte);
    
    // Extract NAL unit data
    const nalDataHex = hexData.substring(headerStart, nalEndByte * 2);
    
    nalUnits.push({
      type,
      typeName: H264_NAL_TYPES[type] || `Unknown (${type})`,
      size: nalEndByte - nalStartByte,
      offset: nalStartByte,
      data: nalDataHex,
      refIdc,
    });
  }
  
  return nalUnits;
}

/**
 * Parse NAL units from H.265 bitstream
 */
export function parseH265NALUnits(hexData: string): NALUnit[] {
  const nalUnits: NALUnit[] = [];
  const startPositions = findStartCodes(hexData);
  
  if (startPositions.length === 0) {
    return nalUnits;
  }
  
  for (let i = 0; i < startPositions.length; i++) {
    const startPos = startPositions[i];
    const nextStartPos = i < startPositions.length - 1 
      ? startPositions[i + 1] 
      : hexData.length / 2;
    
    // Extract NAL unit data (skip start code)
    const nalStartByte = startPos + 4; // Skip 4-byte start code
    const nalEndByte = nextStartPos;
    
    if (nalStartByte >= nalEndByte) continue;
    
    // Extract NAL unit header (2 bytes for H.265)
    const headerStart = nalStartByte * 2;
    const headerHex = hexData.substring(headerStart, headerStart + 4); // 2 bytes = 4 hex chars
    const headerBytes = hexToBytes(headerHex);
    
    if (headerBytes.length < 2) continue;
    
    const { type, layerId, temporalId } = parseH265NALHeader2Bytes(headerBytes[0], headerBytes[1]);
    
    // Extract NAL unit data
    const nalDataHex = hexData.substring(headerStart, nalEndByte * 2);
    
    nalUnits.push({
      type,
      typeName: H265_NAL_TYPES[type] || `Unknown (${type})`,
      size: nalEndByte - nalStartByte,
      offset: nalStartByte,
      data: nalDataHex,
      layerId,
      temporalId,
    });
  }
  
  return nalUnits;
}

/**
 * Extract parameter sets from NAL units
 */
export function extractParameterSets(nalUnits: NALUnit[], codec: 'h264' | 'h265'): ParameterSets {
  const parameterSets: ParameterSets = {
    sps: [],
    pps: [],
    vps: [],
  };
  
  for (const nal of nalUnits) {
    if (codec === 'h264') {
      if (nal.type === 7) {
        parameterSets.sps!.push(nal);
      } else if (nal.type === 8) {
        parameterSets.pps!.push(nal);
      }
    } else if (codec === 'h265') {
      if (nal.type === 32) {
        parameterSets.vps!.push(nal);
      } else if (nal.type === 33) {
        parameterSets.sps!.push(nal);
      } else if (nal.type === 34) {
        parameterSets.pps!.push(nal);
      }
    }
  }
  
  return parameterSets;
}

/**
 * Parse NAL units from bitstream (auto-detect codec or specify)
 */
export function parseNALUnits(hexData: string, codec?: 'h264' | 'h265'): NALUnit[] {
  if (codec === 'h264') {
    return parseH264NALUnits(hexData);
  } else if (codec === 'h265' || codec === 'hevc') {
    return parseH265NALUnits(hexData);
  } else {
    // Try to auto-detect: H.265 uses 2-byte headers, H.264 uses 1-byte
    // For now, default to H.264 if uncertain
    return parseH264NALUnits(hexData);
  }
}


