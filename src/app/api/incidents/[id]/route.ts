import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = db.getIncidentById(id);

    if (!incident) {
      return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
    }

    // Associated cameras within radius bands
    const camerasWithin1000m = db.getNearbyCameras(incident.latitude, incident.longitude, 1200);

    // Nearby Emergency Infrastructure POIs
    const nearestHospitals = db.getNearbyPOIs(incident.latitude, incident.longitude, 'HOSPITAL', 3);
    const nearestPolice = db.getNearbyPOIs(incident.latitude, incident.longitude, 'POLICE', 3);
    const nearestFire = db.getNearbyPOIs(incident.latitude, incident.longitude, 'FIRE_STATION', 3);

    return NextResponse.json({
      success: true,
      data: {
        ...incident,
        nearby_cameras: camerasWithin1000m,
        emergency_infrastructure: {
          nearest_hospitals: nearestHospitals,
          nearest_police: nearestPolice,
          nearest_fire: nearestFire,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
