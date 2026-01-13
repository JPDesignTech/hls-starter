// Extended types for fluent-ffmpeg that aren't in @types/fluent-ffmpeg
import type { FfprobeData as BaseFfprobeData, FfprobeStream, FfprobeFormat } from 'fluent-ffmpeg';

// Frame data structure returned by ffprobe when using -show_frames
export interface FfprobeFrame {
  media_type: 'video' | 'audio' | 'subtitle';
  stream_index: number;
  key_frame: 0 | 1;
  pts: number;
  pts_time: string | number;
  pkt_pts: number;
  pkt_pts_time: string | number;
  best_effort_timestamp: number;
  best_effort_timestamp_time: string | number;
  pkt_dts: number;
  pkt_dts_time: string | number;
  pkt_duration: number;
  pkt_duration_time: string | number;
  pkt_pos: string | number;
  pkt_size: string | number;
  width?: number;
  height?: number;
  pix_fmt?: string;
  pict_type?: string;
  coded_picture_number?: number;
  display_picture_number?: number;
  interlaced_frame?: number;
  top_field_first?: number;
  repeat_pict?: number;
  chroma_location?: string;
  [key: string]: any;
}

// Packet data structure returned by ffprobe when using -show_packets
export interface FfprobePacket {
  codec_type: 'video' | 'audio' | 'subtitle';
  stream_index: number;
  pts: number;
  pts_time: string | number;
  dts: number;
  dts_time: string | number;
  duration: number;
  duration_time: string | number;
  size: string | number;
  pos: string | number;
  flags: string;
  [key: string]: any;
}

// Extended FfprobeData that includes frames and packets
export interface ExtendedFfprobeData extends BaseFfprobeData {
  frames?: FfprobeFrame[];
  packets?: FfprobePacket[];
}

// Re-export the base types for convenience
export type { FfprobeStream, FfprobeFormat };
export type FfprobeData = ExtendedFfprobeData;
