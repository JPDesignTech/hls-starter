import { NextRequest, NextResponse } from 'next/server';
import { TranscoderServiceClient } from '@google-cloud/video-transcoder';

export async function GET(request: NextRequest) {
  try {
    const results: any = {
      environment: {
        hasProjectId: !!process.env.GCP_PROJECT_ID,
        hasBucketName: !!process.env.GCS_BUCKET_NAME,
        hasPrivateKey: !!process.env.GCS_PRIVATE_KEY,
        hasClientEmail: !!process.env.GCS_CLIENT_EMAIL,
        hasCredentialsFile: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.GCP_PROJECT_ID || 'NOT_SET',
      },
      clientTest: {},
    };

    // Test client initialization
    try {
      const config: any = {};
      
      if (process.env.GCP_PROJECT_ID) {
        config.projectId = process.env.GCP_PROJECT_ID;
      }

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
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GCS_CLIENT_EMAIL || '')}`,
        };
      }

      const client = new TranscoderServiceClient(config);
      results.clientTest.initialized = true;

      // Test creating parent path
      const parent = `projects/${process.env.GCP_PROJECT_ID}/locations/us-central1`;
      results.clientTest.parentPath = parent;

      // Try to list jobs (this will test authentication)
      try {
        const [jobs] = await client.listJobs({
          parent,
          pageSize: 1,
        });
        results.clientTest.canListJobs = true;
        results.clientTest.jobCount = jobs.length;
      } catch (listError: any) {
        results.clientTest.canListJobs = false;
        results.clientTest.listError = {
          message: listError.message,
          code: listError.code,
          details: listError.details,
        };
      }

    } catch (error: any) {
      results.clientTest.error = {
        message: error.message,
        stack: error.stack,
      };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
} 