import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

export function getStorageConfig() {
  // For production (Vercel) - when GCP_SERVICE_ACCOUNT_KEY env var is set
  if (process.env.GCP_SERVICE_ACCOUNT_KEY && process.env.GCP_SERVICE_ACCOUNT_KEY.trim() !== '') {
    try {
      // Only try to parse if it looks like JSON (starts with {)
      if (process.env.GCP_SERVICE_ACCOUNT_KEY.trim().startsWith('{')) {
        return {
          projectId: process.env.GCP_PROJECT_ID,
          credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY),
        };
      }
    } catch (error) {
      console.error('Failed to parse GCP_SERVICE_ACCOUNT_KEY:', error);
      // Fall through to other methods
    }
  }
  
  // For local development with GOOGLE_APPLICATION_CREDENTIALS env var
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      projectId: process.env.GCP_PROJECT_ID || 'personalportfolio-4caf3',
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    };
  }
  
  // For local development - try to find the key file automatically
  const keyFiles = ['personalportfolio-4caf3-fb3a4d5f37b7.json', 'gcp-key.json', 'service-account-key.json'];
  for (const keyFile of keyFiles) {
    const keyPath = path.join(process.cwd(), keyFile);
    if (fs.existsSync(keyPath)) {
      console.log(`Using GCP key file: ${keyFile}`);
      return {
        projectId: process.env.GCP_PROJECT_ID || 'personalportfolio-4caf3',
        keyFilename: keyPath,
      };
    }
  }
  
  // If we have a bucket name but no credentials, throw a clear error
  if (process.env.GCS_BUCKET_NAME) {
    throw new Error(
      'GCS_BUCKET_NAME is set but no valid credentials found. ' +
      'Please either:\n' +
      '1. Set GOOGLE_APPLICATION_CREDENTIALS to point to your key file\n' +
      '2. Place your key file in the project root\n' +
      '3. Set GCP_SERVICE_ACCOUNT_KEY with the full JSON content'
    );
  }
  
  // Default - will use Application Default Credentials
  console.warn('No GCP credentials found. Using default credentials.');
  return {};
}

export function createStorage() {
  return new Storage(getStorageConfig());
} 