import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const segments = db.getTrafficSegments();
    const floodZones = db.getFloodZones();

    return NextResponse.json({
      success: true,
      traffic_segments: segments,
      flood_zones: floodZones,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
