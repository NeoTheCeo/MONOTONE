/**
 * S3 Upload Policy Generator
 * 
 * Inspired by Are.na's upload architecture:
 * 1. Client requests presigned policy from server
 * 2. Server generates presigned URL with S3
 * 3. Client uploads directly to S3
 * 4. Client notifies server of completion
 * 
 * This avoids proxying large files through the server.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || 'african-archive-radio';

interface UploadPolicy {
  key: string;
  acl: string;
  bucket: string;
  policy: string;
  signature: string;
  AWSAccessKeyId: string;
  success_action_status: string;
  expires: number;
}

export async function generateUploadPolicy(
  userId: string,
  filename: string,
  contentType: string
): Promise<UploadPolicy> {
  const key = `uploads/${userId}/${Date.now()}-${filename}`;
  const conditions = [
    { 'Content-Type': contentType },
    { key },
    { bucket: BUCKET },
    { acl: 'private' },
    ['content-length-range', 0, 100 * 1024 * 1024], // Max 100MB
  ];

  // Generate presigned URL valid for 1 hour
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return {
    key,
    acl: 'private',
    bucket: BUCKET,
    policy: '', // Empty for presigned URL approach
    signature: '',
    AWSAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    success_action_status: '201',
    expires: Date.now() + 3600000,
  };
}

export async function getDownloadUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 86400 });
}