/**
 * Desktop storage configuration utilities
 * Handles optional GCS configuration for hybrid cloud/local storage
 */

/**
 * Check if GCS is configured for desktop app
 * Returns true only if all required credentials are present
 */
export function isGCSConfiguredForDesktop(): boolean {
  const hasProjectId = !!process.env.GCP_PROJECT_ID;
  const hasBucket = !!process.env.GCS_BUCKET_NAME;
  const hasCredentials = !!process.env.GCP_SERVICE_ACCOUNT_KEY;
  
  return hasProjectId && hasBucket && hasCredentials;
}

/**
 * Get storage mode for desktop app
 */
export function getDesktopStorageMode(): 'local-only' | 'hybrid' {
  return isGCSConfiguredForDesktop() ? 'hybrid' : 'local-only';
}

/**
 * Log storage configuration status
 */
export function logStorageConfig() {
  const mode = getDesktopStorageMode();
  console.log('[Storage] Mode:', mode);
  
  if (mode === 'hybrid') {
    console.log('[Storage] GCS bucket:', process.env.GCS_BUCKET_NAME);
    console.log('[Storage] GCP project:', process.env.GCP_PROJECT_ID);
  } else {
    console.log('[Storage] Running in local-only mode (no cloud upload)');
    console.log('[Storage] To enable cloud upload, configure .env.local with GCS credentials');
    console.log('[Storage] See apps/desktop/.env.local.example for template');
  }
}

/**
 * Get GCS credentials if configured
 */
export function getGCSCredentials() {
  if (!isGCSConfiguredForDesktop()) {
    return null;
  }

  return {
    projectId: process.env.GCP_PROJECT_ID!,
    bucketName: process.env.GCS_BUCKET_NAME!,
    serviceAccountKey: process.env.GCP_SERVICE_ACCOUNT_KEY!,
  };
}
