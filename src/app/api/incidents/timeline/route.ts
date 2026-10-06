import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const incidents = db.getIncidents();
    const timeline = incidents.map((inc) => ({
      id: inc.id,
      timestamp: inc.reported_at,
      type: inc.type,
      title: inc.title,
      district: inc.district,
      severity: inc.severity,
      confidence: inc.confidence,
      latitude: inc.latitude,
      longitude: inc.longitude,
    }));

    return NextResponse.json({
      success: true,
      count: timeline.length,
      data: timeline,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
