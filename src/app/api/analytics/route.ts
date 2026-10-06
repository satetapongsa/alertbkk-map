import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cameras = db.getCameras();
    const incidents = db.getIncidents();
    const floodZones = db.getFloodZones();

    // Incident distribution by type
    const byType: Record<string, number> = {};
    incidents.forEach((inc) => {
      byType[inc.type] = (byType[inc.type] || 0) + 1;
    });

    // Incident distribution by severity
    const bySeverity: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    incidents.forEach((inc) => {
      bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
    });

    // District breakdown
    const byDistrict: Record<string, number> = {};
    incidents.forEach((inc) => {
      byDistrict[inc.district] = (byDistrict[inc.district] || 0) + 1;
    });

    // Camera uptime statistics
    const onlineCams = cameras.filter((c) => c.status === 'ONLINE').length;
    const degradedCams = cameras.filter((c) => c.status === 'DEGRADED').length;
    const offlineCams = cameras.filter((c) => c.status === 'OFFLINE').length;
    const uptimePct = cameras.length > 0 ? ((onlineCams / cameras.length) * 100).toFixed(1) : '100.0';

    // Incidents / hour timeline (hourly simulated aggregate)
    const hourlyDistribution = [
      { hour: '14:00', count: 2 },
      { hour: '15:00', count: 4 },
      { hour: '16:00', count: 3 },
      { hour: '17:00', count: 7 },
      { hour: '18:00', count: 11 },
      { hour: '19:00', count: 9 },
      { hour: '20:00', count: incidents.length },
    ];

    return NextResponse.json({
      success: true,
      data: {
        total_incidents: incidents.length,
        by_type: byType,
        by_severity: bySeverity,
        by_district: byDistrict,
        cameras: {
          total: cameras.length,
          online: onlineCams,
          degraded: degradedCams,
          offline: offlineCams,
          uptime_percentage: parseFloat(uptimePct),
        },
        flood_warnings_active: floodZones.filter((f) => f.status === 'WARNING' || f.status === 'SEVERE').length,
        hourly_distribution: hourlyDistribution,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
