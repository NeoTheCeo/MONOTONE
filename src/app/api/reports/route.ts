import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { track_id, reason, contact_email } = body;

    if (!track_id || !reason) {
      return NextResponse.json(
        { error: 'track_id and reason are required' },
        { status: 400 }
      );
    }

    const report = await pb.collection('reports').create({
      track_id,
      reason,
      contact_email: contact_email || '',
      status: 'pending',
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Failed to create report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}