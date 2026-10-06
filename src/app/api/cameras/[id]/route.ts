import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const camera = db.getCameraById(id);

    if (!camera) {
      return NextResponse.json({ success: false, error: 'Camera not found' }, { status: 404 });
    }

    // Also include nearby incidents within 1.5km
    const nearbyIncidents = db.getIncidents().filter((inc) => {
      const latDiff = Math.abs(inc.latitude - camera.latitude);
      const lngDiff = Math.abs(inc.longitude - camera.longitude);
      return latDiff < 0.02 && lngDiff < 0.02;
    });

    return NextResponse.json({
      success: true,
      data: {
        ...camera,
        nearby_incidents: nearbyIncidents,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
