import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { nanoid } from 'nanoid';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

const ALLOWED_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav',
  'audio/ogg', 'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/mp4', 'audio/x-m4a',
];
const MAX_SIZE = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate token by refreshing auth
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

    const userId = pb.authStore.model?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const { filename, contentType, size } = body;

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    if (size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const ext = filename.split('.').pop() || 'mp3';
    const key = `uploads/${userId}/${nanoid()}.${ext}`;

    const track = await pb.collection('tracks').create({
      title: filename.replace(/\.[^/.]+$/, ''),
      artist: (pb.authStore.model?.username || pb.authStore.model?.email?.split('@')[0]) || 'Unknown',
      user: userId,
      s3_key: key,
      status: 'uploading',
      license: 'CC-BY',
      visible: false,
      plays: 0,
    });

    return NextResponse.json({
      track_id: track.id,
      upload_url: `/api/upload/${track.id}/direct`,
      key,
      expires_in: 3600,
    });
  } catch (error) {
    console.error('Upload policy error:', error);
    return NextResponse.json({ error: 'Failed to create upload' }, { status: 500 });
  }
}
