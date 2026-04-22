import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || 'african-archive-radio';

interface RouteParams {
  params: { trackId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    pb.authStore.save(token, { id: 'temp', email: '' } as any);
    
    if (!pb.authStore.isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
      await pb.collection('users').authRefresh();
    } catch {
      pb.authStore.clear();
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    const track = await pb.collection('tracks').getOne(params.trackId);
    
    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (track.user !== pb.authStore.model?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: track.s3_key,
      ContentType: 'audio/mpeg',
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({
      upload_url: presignedUrl,
      expires_in: 3600,
    });
  } catch (error) {
    console.error('Get upload URL error:', error);
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    pb.authStore.save(token, { id: 'temp', email: '' } as any);
    
    if (!pb.authStore.isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
      await pb.collection('users').authRefresh();
    } catch {
      pb.authStore.clear();
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    const body = await request.json();
    const { streaming_url, thumbnail } = body;

    const track = await pb.collection('tracks').update(params.trackId, {
      status: 'ready',
      streaming_url: streaming_url,
      thumbnail: thumbnail || '',
      visible: true,
    });

    return NextResponse.json({ success: true, track });
  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 });
  }
}
