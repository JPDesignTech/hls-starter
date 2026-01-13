import { type NextRequest, NextResponse } from 'next/server';
import { TranscoderServiceClient } from '@google-cloud/video-transcoder';
import type { ClientOptions } from 'google-gax';

interface TestResults {
  environment: {
    hasProjectId: boolean;
    hasBucketName: boolean;
    hasPrivateKey: boolean;
    hasClientEmail: boolean;
    hasCredentialsFile: boolean;
    projectId: string;
  };
  clientTest: {
    initialized?: boolean;
    parentPath?: string;
    canListJobs?: boolean;
    jobCount?: number;
    listError?: {
      message?: string;
      code?: string | number;
      details?: string;
    };
    error?: {
      message?: string;
      stack?: string;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const results: TestResults = {
      environment: {
        hasProjectId: !!process.env.GCP_PROJECT_ID,
        hasBucketName: !!process.env.GCS_BUCKET_NAME,
        hasPrivateKey: !!process.env.GCS_PRIVATE_KEY,
        hasClientEmail: !!process.env.GCS_CLIENT_EMAIL,
        hasCredentialsFile: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.GCP_PROJECT_ID ?? 'NOT_SET',
      },
      clientTest: {},
    };

    // Test client initialization
    try {
      const config: ClientOptions = {};

      if (process.env.GCP_PROJECT_ID) {
        config.projectId = process.env.GCP_PROJECT_ID;
      }

      if (
        process.env.GCS_PRIVATE_KEY &&
        process.env.GCS_CLIENT_EMAIL &&
        process.env.GCP_PROJECT_ID
      ) {
        config.credentials = {
          client_email: process.env.GCS_CLIENT_EMAIL,
          private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
      } catch (listError) {
        results.clientTest.canListJobs = false;
        results.clientTest.listError = {
          message:
            listError instanceof Error ? listError.message : String(listError),
          code: (listError as any)?.code,
          details: (listError as any)?.details,
        };
      }
    } catch (error) {
      results.clientTest.error = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
} 