import { TranscoderServiceClient } from '@google-cloud/video-transcoder';
import { google } from '@google-cloud/video-transcoder/build/protos/protos';

// Initialize the Transcoder client with proper configuration
function getTranscoderClient() {
  try {
    const config: any = {};

    // Add project ID if available
    if (process.env.GCP_PROJECT_ID) {
      config.projectId = process.env.GCP_PROJECT_ID;
    }

    // Use credentials from environment if available
    if (process.env.GCS_PRIVATE_KEY && process.env.GCS_CLIENT_EMAIL && process.env.GCP_PROJECT_ID) {
      config.credentials = {
        type: 'service_account',
        project_id: process.env.GCP_PROJECT_ID,
        private_key_id: 'key-id',
        private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GCS_CLIENT_EMAIL,
        client_id: 'client-id',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GCS_CLIENT_EMAIL)}`,
      };
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      config.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }

    console.log('[Transcoder] Initializing client with project:', config.projectId);
    return new TranscoderServiceClient(config);
  } catch (error) {
    console.error('[Transcoder] Failed to initialize client:', error);
    throw error;
  }
}

interface TranscodeJobOptions {
  inputUri: string;
  outputUri: string;
  projectId: string;
  location: string;
}

export async function createTranscodeJob({
  inputUri,
  outputUri,
  projectId,
  location = 'us-central1',
}: TranscodeJobOptions): Promise<string> {
  console.log('[Transcoder] Creating job with:', {
    projectId,
    location,
    inputUri,
    outputUri,
  });

  // Validate inputs
  if (!projectId) {
    throw new Error('Project ID is required for transcoding');
  }

  // Format the parent path manually
  const parent = `projects/${projectId}/locations/${location}`;

  // Create job configuration for HLS output
  const job: google.cloud.video.transcoder.v1.IJob = {
    inputUri,
    outputUri,
    config: {
      elementaryStreams: [
        // Video streams
        {
          key: 'video-stream-1080p',
          videoStream: {
            h264: {
              widthPixels: 1920,
              heightPixels: 1080,
              frameRate: 30,
              bitrateBps: 5000000,
              pixelFormat: 'yuv420p',
              rateControlMode: 'vbr',
              crfLevel: 21,
              gopDuration: { seconds: 3 },
              vbvSizeBits: 5000000,
              vbvFullnessBits: 4500000,
              profile: 'high',
              preset: 'veryfast',
            },
          },
        },
        {
          key: 'video-stream-720p',
          videoStream: {
            h264: {
              widthPixels: 1280,
              heightPixels: 720,
              frameRate: 30,
              bitrateBps: 2800000,
              pixelFormat: 'yuv420p',
              rateControlMode: 'vbr',
              crfLevel: 21,
              gopDuration: { seconds: 3 },
              vbvSizeBits: 2800000,
              vbvFullnessBits: 2520000,
              profile: 'high',
              preset: 'veryfast',
            },
          },
        },
        {
          key: 'video-stream-480p',
          videoStream: {
            h264: {
              widthPixels: 854,
              heightPixels: 480,
              frameRate: 30,
              bitrateBps: 1400000,
              pixelFormat: 'yuv420p',
              rateControlMode: 'vbr',
              crfLevel: 21,
              gopDuration: { seconds: 3 },
              vbvSizeBits: 1400000,
              vbvFullnessBits: 1260000,
              profile: 'main',
              preset: 'veryfast',
            },
          },
        },
        {
          key: 'video-stream-360p',
          videoStream: {
            h264: {
              widthPixels: 640,
              heightPixels: 360,
              frameRate: 30,
              bitrateBps: 800000,
              pixelFormat: 'yuv420p',
              rateControlMode: 'vbr',
              crfLevel: 21,
              gopDuration: { seconds: 3 },
              vbvSizeBits: 800000,
              vbvFullnessBits: 720000,
              profile: 'main',
              preset: 'veryfast',
            },
          },
        },
        // Audio stream
        {
          key: 'audio-stream',
          audioStream: {
            codec: 'aac',
            bitrateBps: 128000,
            channelCount: 2,
            channelLayout: ['fl', 'fr'],
            sampleRateHertz: 48000,
          },
        },
      ],
      muxStreams: [
        // HLS mux streams
        {
          key: 'hls-1080p',
          container: 'ts',
          elementaryStreams: ['video-stream-1080p', 'audio-stream'],
          segmentSettings: {
            segmentDuration: { seconds: 6 },
          },
        },
        {
          key: 'hls-720p',
          container: 'ts',
          elementaryStreams: ['video-stream-720p', 'audio-stream'],
          segmentSettings: {
            segmentDuration: { seconds: 6 },
          },
        },
        {
          key: 'hls-480p',
          container: 'ts',
          elementaryStreams: ['video-stream-480p', 'audio-stream'],
          segmentSettings: {
            segmentDuration: { seconds: 6 },
          },
        },
        {
          key: 'hls-360p',
          container: 'ts',
          elementaryStreams: ['video-stream-360p', 'audio-stream'],
          segmentSettings: {
            segmentDuration: { seconds: 6 },
          },
        },
      ],
      manifests: [
        {
          fileName: 'master.m3u8',
          type: google.cloud.video.transcoder.v1.Manifest.ManifestType.HLS,
          muxStreams: ['hls-1080p', 'hls-720p', 'hls-480p', 'hls-360p'],
        },
      ],
    },
  };

  // Create the job
  try {
    const transcoderClient = getTranscoderClient();
    console.log('[Transcoder] Submitting job to parent:', parent);
    
    const [response] = await transcoderClient.createJob({
      parent,
      job,
    });

    console.log(`[Transcoder] Created transcoding job: ${response.name}`);
    return response.name || '';
  } catch (error: any) {
    console.error('[Transcoder] Failed to create job:', error);
    console.error('[Transcoder] Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    throw error;
  }
}

export async function getTranscodeJobStatus(jobName: string): Promise<{
  state: string;
  error?: string;
  progress?: number;
}> {
  const transcoderClient = getTranscoderClient();
  const [job] = await transcoderClient.getJob({ name: jobName });

  // Log the raw job state for debugging
  console.log('[Transcoder] Raw job state:', job.state);
  console.log('[Transcoder] Job details:', {
    name: job.name,
    createTime: job.createTime,
    startTime: job.startTime,
    endTime: job.endTime,
    state: job.state,
    error: job.error,
  });

  // Convert ProcessingState enum to string
  const ProcessingState = google.cloud.video.transcoder.v1.Job.ProcessingState;
  let stateString = 'UNKNOWN';
  
  // Handle the state more robustly
  if (job.state !== undefined && job.state !== null) {
    // Check for PENDING state (might be represented as PROCESSING_STATE_UNSPECIFIED)
    if (job.state === ProcessingState.PROCESSING_STATE_UNSPECIFIED || job.state === 'PENDING') {
      stateString = 'PENDING';
    } else if (job.state === ProcessingState.RUNNING || job.state === 'RUNNING') {
      stateString = 'RUNNING';
    } else if (job.state === ProcessingState.SUCCEEDED || job.state === 'SUCCEEDED') {
      stateString = 'SUCCEEDED';
    } else if (job.state === ProcessingState.FAILED || job.state === 'FAILED') {
      stateString = 'FAILED';
    } else {
      console.log('[Transcoder] Unrecognized state value:', job.state);
      console.log('[Transcoder] Available states:', ProcessingState);
      stateString = `UNKNOWN_${job.state}`;
    }
  }

  return {
    state: stateString,
    error: job.error?.message || undefined,
    progress: undefined, // Progress tracking not directly available in the API
  };
}

export async function waitForTranscodeJob(
  jobName: string,
  maxWaitTime: number = 300000 // 5 minutes
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getTranscodeJobStatus(jobName);
    
    console.log(`Job ${jobName} status: ${status.state}`);

    if (status.state === 'SUCCEEDED') {
      return true;
    } else if (status.state === 'FAILED') {
      console.error(`Transcoding job failed: ${status.error}`);
      return false;
    }

    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.error('Transcoding job timed out');
  return false;
} 