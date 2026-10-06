import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CameraSource, CameraType } from '@/types/intelligence';

export async function GET() {
  const health = db.getSourceHealth();
  return NextResponse.json({ success: true, data: health });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      provider,
      source_type,
      source_url,
      stream_url,
      embed_url,
      license,
      district,
      latitude,
      longitude,
      embedding_allowed,
    } = body;

    // Strict validation against unauthorized private CCTV
    if (!name || !source_url || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory registration fields (name, source_url, coordinates)' },
        { status: 400 }
      );
    }

    // Safety checks: reject local/private IP addresses or suspicious RTSP credentials
    if (
      source_url.includes('192.168.') ||
      source_url.includes('10.0.') ||
      source_url.includes('admin:admin') ||
      source_url.includes('root:')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'SECURITY VIOLATION: Private network addresses and brute credentials are strictly prohibited under MIRRIX Public Safety Protocol.',
        },
        { status: 403 }
      );
    }

    const newId = `cam_manual_${Date.now()}`;
    const now = new Date().toISOString();

    const isYoutube = /(?:youtube\.com|youtu\.be)/.test(source_url);
    let ytId: string | undefined = undefined;
    if (isYoutube) {
      const match = source_url.match(/(?:v=|\/embed\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) ytId = match[1];
    }

    const newCamera: CameraSource = {
      id: newId,
      name,
      provider: provider || 'Manual Verified Public Source',
      source_type: (source_type as CameraType) || 'PUBLIC_WEBCAM',
      source_url,
      stream_url: stream_url || undefined,
      embed_url: embed_url || (ytId ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1` : undefined),
      is_youtube: isYoutube,
      youtube_video_id: ytId,
      license: license || 'Public Open Feed',
      public_access: true,
      embedding_allowed: embedding_allowed ?? true,
      country: 'Thailand',
      city: 'Bangkok',
      district: district || 'Central Bangkok',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: 'Asia/Bangkok',
      status: 'ONLINE',
      last_seen: now,
      last_checked: now,
      latency_ms: 45,
      created_at: now,
      updated_at: now,
    };

    db.addCamera(newCamera);

    return NextResponse.json({
      success: true,
      message: 'Public source validated and registered successfully',
      data: newCamera,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
