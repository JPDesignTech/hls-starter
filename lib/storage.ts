import { Storage } from '@google-cloud/storage';
import path from 'path';
import { promises as fs } from 'fs';

// Initialize Google Cloud Storage
// In production, this will use Application Default Credentials
// For local development, set GOOGLE_APPLICATION_CREDENTIALS env var
const storage = process.env.GCS_BUCKET_NAME 
  ? new Storage() 
  : null;

const bucketName = process.env.GCS_BUCKET_NAME || 'hls-demo-segments';

export interface UploadOptions {
  localPath: string;
  remotePath: string;
  contentType?: string;
  cacheControl?: string;
}

export interface StorageFile {
  name: string;
  url: string;
  size: number;
  contentType: string;
  created: Date;
}

// Upload a file to Google Cloud Storage
export async function uploadFile(options: UploadOptions): Promise<StorageFile> {
  const { localPath, remotePath, contentType, cacheControl } = options;
  
  // For local development without GCS, copy to public directory
  if (!storage) {
    const publicPath = path.join(process.cwd(), 'public', 'streams', remotePath);
    const publicDir = path.dirname(publicPath);
    await fs.mkdir(publicDir, { recursive: true });
    await fs.copyFile(localPath, publicPath);
    
    const stats = await fs.stat(publicPath);
    return {
      name: remotePath,
      url: `/streams/${remotePath}`,
      size: stats.size,
      contentType: contentType || 'application/octet-stream',
      created: stats.birthtime,
    };
  }
  
  // Upload to Google Cloud Storage
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(remotePath);
  
  await file.save(await fs.readFile(localPath), {
    metadata: {
      contentType: contentType || 'application/octet-stream',
      cacheControl: cacheControl || 'public, max-age=3600',
    },
  });
  
  // Make file publicly accessible
  await file.makePublic();
  
  const [metadata] = await file.getMetadata();
  
  return {
    name: remotePath,
    url: `https://storage.googleapis.com/${bucketName}/${remotePath}`,
    size: parseInt(metadata.size as string) || 0,
    contentType: metadata.contentType || 'application/octet-stream',
    created: new Date(metadata.timeCreated || Date.now()),
  };
}

// Upload an entire directory (for HLS segments)
export async function uploadDirectory(
  localDir: string,
  remotePrefix: string
): Promise<StorageFile[]> {
  const files = await fs.readdir(localDir, { withFileTypes: true });
  const uploads: StorageFile[] = [];
  
  for (const file of files) {
    if (file.isFile()) {
      const localPath = path.join(localDir, file.name);
      const remotePath = path.join(remotePrefix, file.name);
      
      // Determine content type based on extension
      let contentType = 'application/octet-stream';
      if (file.name.endsWith('.m3u8')) {
        contentType = 'application/vnd.apple.mpegurl';
      } else if (file.name.endsWith('.ts')) {
        contentType = 'video/mp2t';
      }
      
      const uploaded = await uploadFile({
        localPath,
        remotePath,
        contentType,
        cacheControl: file.name.endsWith('.m3u8') 
          ? 'no-cache' // Don't cache manifests
          : 'public, max-age=31536000', // Cache segments for 1 year
      });
      
      uploads.push(uploaded);
    } else if (file.isDirectory()) {
      // Recursively upload subdirectories
      const subDirUploads = await uploadDirectory(
        path.join(localDir, file.name),
        path.join(remotePrefix, file.name)
      );
      uploads.push(...subDirUploads);
    }
  }
  
  return uploads;
}

// Delete files from storage
export async function deleteFiles(remotePaths: string[]): Promise<void> {
  if (!storage) {
    // For local development, delete from public directory
    for (const remotePath of remotePaths) {
      const publicPath = path.join(process.cwd(), 'public', 'streams', remotePath);
      try {
        await fs.unlink(publicPath);
      } catch (err) {
        // Ignore errors if file doesn't exist
      }
    }
    return;
  }
  
  // Delete from Google Cloud Storage
  const bucket = storage.bucket(bucketName);
  await Promise.all(
    remotePaths.map(path => bucket.file(path).delete({ ignoreNotFound: true }))
  );
}

// Get signed URL for private content (optional security feature)
export async function getSignedUrl(
  remotePath: string,
  expiresInMinutes: number = 60
): Promise<string> {
  if (!storage) {
    // For local development, return public URL
    return `/streams/${remotePath}`;
  }
  
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(remotePath);
  
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });
  
  return url;
} 