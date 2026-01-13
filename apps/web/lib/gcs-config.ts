import { Storage } from '@google-cloud/storage';

export function getStorageConfig() {
  // SINGLE METHOD: GCP_SERVICE_ACCOUNT_KEY must be base64-encoded JSON
  // Works in ALL environments: local dev, preview, production
  if (process.env.GCP_SERVICE_ACCOUNT_KEY && process.env.GCP_SERVICE_ACCOUNT_KEY.trim() !== '') {
    try {
      const base64Content = process.env.GCP_SERVICE_ACCOUNT_KEY.trim();
      // Decode from base64
      const jsonString = Buffer.from(base64Content, 'base64').toString('utf-8');
      // Parse the decoded JSON
      const credentials = JSON.parse(jsonString);
      return {
        projectId: process.env.GCP_PROJECT_ID,
        credentials,
      };
    } catch (error) {
      console.error('Failed to decode/parse GCP_SERVICE_ACCOUNT_KEY:', error);
      throw new Error(
        'GCP_SERVICE_ACCOUNT_KEY must be base64-encoded JSON. ' +
        'Encode your service account key with: base64 -i key.json\n' +
        'Get your key from: https://console.cloud.google.com/iam-admin/serviceaccounts'
      );
    }
  }
  
  // If we have a bucket name but no credentials, throw a clear error
  // But allow build to proceed if we're in a build context (credentials might be available at runtime)
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      (process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.VERCEL_ENV);
  
  if (process.env.GCS_BUCKET_NAME && !isBuildTime) {
    throw new Error(
      'GCS_BUCKET_NAME is set but GCP_SERVICE_ACCOUNT_KEY is not set.\n\n' +
      'Set GCP_SERVICE_ACCOUNT_KEY with base64-encoded JSON of your service account key.\n' +
      'Encode with: base64 -i key.json\n' +
      'This works in ALL environments (local dev, preview, production).\n\n' +
      'Get your service account key from: https://console.cloud.google.com/iam-admin/serviceaccounts'
    );
  }
  
  // Default - will use Application Default Credentials (if available)
  console.warn('No GCP credentials found. Using default credentials (if available).');
  return {};
}

export function createStorage() {
  return new Storage(getStorageConfig());
} 