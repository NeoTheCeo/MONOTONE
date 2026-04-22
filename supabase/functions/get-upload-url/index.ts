import { S3Client, PutObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.500.0';

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
});

const BUCKET = Deno.env.get('AWS_S3_BUCKET')!;

Deno.serve(async (req) => {
  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { trackId, key, contentType } = await req.json();

    if (!trackId || !key || !contentType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned URL using AWS SDK
    const { getSignedUrl } = await import('https://esm.sh/@aws-sdk/s3-request-presigner@3.500.0');
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return new Response(JSON.stringify({ 
      presignedUrl,
      expiresIn: 3600
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate URL' }), { status: 500 });
  }
});