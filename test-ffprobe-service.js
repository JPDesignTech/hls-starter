const testFFprobeService = async () => {
  const serviceUrl = 'https://ffprobe-service-500588289010.us-central1.run.app';
  
  // Test URL - using a sample HLS segment
  const testVideoUrl = 'https://storage.googleapis.com/hls-starter-bucket/041e5ea7-1c32-4f52-9a3f-31c07b7d3c77/hls-1080p0000000000.ts';
  
  console.log('🧪 Testing FFprobe Cloud Run Service...\n');
  console.log(`Service URL: ${serviceUrl}`);
  console.log(`Test video: ${testVideoUrl}\n`);
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check endpoint...');
    const healthResponse = await fetch(serviceUrl);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');
    
    // Test 2: Basic probe
    console.log('2️⃣ Testing basic probe...');
    const basicResponse = await fetch(`${serviceUrl}/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: testVideoUrl,
        detailed: false
      })
    });
    
    const basicResult = await basicResponse.json();
    if (basicResult.success) {
      console.log('✅ Basic probe successful!');
      console.log('Format:', basicResult.data.format?.format_name);
      console.log('Duration:', basicResult.data.format?.duration, 'seconds');
      console.log('Streams:', basicResult.data.streams?.length);
    } else {
      console.log('❌ Basic probe failed:', basicResult.error);
    }
    console.log('');
    
    // Test 3: Detailed probe
    console.log('3️⃣ Testing detailed probe (this may take longer)...');
    const detailedResponse = await fetch(`${serviceUrl}/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: testVideoUrl,
        detailed: true
      })
    });
    
    const detailedResult = await detailedResponse.json();
    if (detailedResult.success) {
      console.log('✅ Detailed probe successful!');
      console.log('Response size:', JSON.stringify(detailedResult).length, 'bytes');
    } else {
      console.log('❌ Detailed probe failed:', detailedResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing service:', error.message);
  }
};

// Run the test
testFFprobeService(); 