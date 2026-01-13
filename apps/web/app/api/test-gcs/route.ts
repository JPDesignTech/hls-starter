import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export async function GET() {
  try {
    const storage = new Storage(
      process.env.GCP_SERVICE_ACCOUNT_KEY
        ? {
            projectId: process.env.GCP_PROJECT_ID,
            credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY),
          }
        : {}
    );
    
    const [buckets] = await storage.getBuckets();
    const bucket = storage.bucket(process.env.GCS_BUCKET_NAME ?? '');
    const [exists] = await bucket.exists();
    
    return NextResponse.json({
      connected: true,
      bucketExists: exists,
      bucketName: process.env.GCS_BUCKET_NAME,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 