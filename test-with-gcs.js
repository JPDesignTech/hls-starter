// Test FFprobe service with your actual GCS videos
const testWithGCS = async () => {
  const serviceUrl = 'https://ffprobe-service-500588289010.us-central1.run.app';
  
  // Replace with one of your actual GCS video URLs
  const gcsVideoUrl = 'https://storage.googleapis.com/hls-starter-bucket/YOUR_VIDEO_ID/hls-1080p0000000000.ts';
  
  console.log('🧪 Testing FFprobe with GCS video...\n');
  
  try {
    const response = await fetch(`${serviceUrl}/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: gcsVideoUrl,
        detailed: false
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Probe successful!');
      console.log('\nFormat Information:');
      console.log('  Container:', result.data.format?.format_name);
      console.log('  Duration:', result.data.format?.duration, 'seconds');
      console.log('  Bitrate:', result.data.format?.bit_rate, 'bps');
      
      console.log('\nStreams:');
      result.data.streams?.forEach((stream, index) => {
        console.log(`\n  Stream ${index} (${stream.codec_type}):`);
        if (stream.codec_type === 'video') {
          console.log('    Codec:', stream.codec_name);
          console.log('    Resolution:', `${stream.width}x${stream.height}`);
          console.log('    Frame Rate:', stream.r_frame_rate);
        } else if (stream.codec_type === 'audio') {
          console.log('    Codec:', stream.codec_name);
          console.log('    Sample Rate:', stream.sample_rate);
          console.log('    Channels:', stream.channels);
        }
      });
    } else {
      console.log('❌ Probe failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testWithGCS(); 