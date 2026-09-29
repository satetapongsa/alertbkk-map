import { Incident, IncidentComment, IncidentTimelineItem } from '@/types';
import { realtimeBroadcaster } from './realtime';
import { prisma } from './prisma';

// Fallback in-memory store with Bangkok seed data
let inMemoryStore: Incident[] = [
  {
    id: 'inc-001',
    type: 'FLOOD',
    title: 'Waterlogged Roadway on Ratchadaphisek Road',
    description: 'Standing water of approximately 30–40 cm in front of the Criminal Court heading toward Lat Phrao intersection. Small sedans risk stalling; traffic diversion recommended.',
    latitude: 13.8185,
    longitude: 100.5750,
    locationName: 'Ratchadaphisek Rd in front of Criminal Court',
    district: 'Chatuchak',
    province: 'Bangkok',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    source: 'COMMUNITY',
    confidence: 'COMMUNITY_VERIFIED',
    confirmCount: 28,
    disputeCount: 1,
    createdById: 'user-somchai',
    createdByName: 'Somchai R.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    images: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        caption: 'Water covering curb and sidewalk level in front of Criminal Court',
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
    ],
    timeline: [
      {
        id: 't-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        action: 'CREATED',
        description: 'Reported 30-40 cm waterlogged pavement and slow traffic flow.',
        user: 'Somchai R.',
      },
      {
        id: 't-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        action: 'VERIFIED',
        description: 'Verified active by 28 local drivers and commuters.',
      }
    ],
    comments: [
      {
        id: 'c-1',
        userName: 'Ratchada Motorcycle Pilot',
        message: 'Leftmost lane submerged above curb height. Low-clearance sedans stay on the far right lane only.',
        createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
      }
    ],
    floodDetails: {
      waterLevelCm: 35,
      waterLevelCategory: '30-50cm',
      smallCarPassable: false,
      largeTruckPassable: true,
      roadBlocked: false,
      strongCurrent: false,
      electricRisk: false,
    }
  },
  {
    id: 'inc-002',
    type: 'TRAFFIC',
    title: 'Severe Congestion on Outbound Vibhavadi Rangsit',
    description: 'Traffic standstill queue exceeding 3.4 km. Average speed 12 km/h caused by multi-vehicle collision on express lanes heading toward Don Mueang.',
    latitude: 13.8249,
    longitude: 100.5630,
    locationName: 'Vibhavadi Rangsit Rd Outbound near Don Mueang',
    district: 'Chatuchak',
    province: 'Bangkok',
    severity: 'HIGH',
    status: 'ACTIVE',
    source: 'COMMUNITY',
    confidence: 'COMMUNITY_VERIFIED',
    confirmCount: 45,
    disputeCount: 0,
    createdById: 'user-wirote',
    createdByName: 'Wirote SafeCommute',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    images: [
      {
        id: 'img-3',
        url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        caption: 'Vehicle tailback stretching back to Ha Yaek Lat Phrao overpass',
        createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      }
    ],
    timeline: [
      {
        id: 't-21',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        action: 'CREATED',
        description: 'Reported dense traffic standstill starting at Lat Phrao interchange.',
        user: 'Wirote',
      }
    ],
    comments: [],
    trafficDetails: {
      speedKmh: 12,
      queueLengthKm: 3.4,
      cause: 'Multi-vehicle collision on express lane',
      direction: 'Outbound toward Don Mueang - Rangsit',
      trafficLevel: 'STANDSTILL',
    }
  },
  {
    id: 'inc-003',
    type: 'ACCIDENT',
    title: '3-Vehicle Collision Blocking 2 Traffic Lanes',
    description: 'Rama IX Road inbound toward MCOT intersection. Three sedans in rear-end collision blocking middle and right lanes. Emergency rescue units on scene.',
    latitude: 13.7578,
    longitude: 100.5649,
    locationName: 'Rama IX Road at MCOT Intersection',
    district: 'Huai Khwang',
    province: 'Bangkok',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    source: 'COMMUNITY',
    confidence: 'OFFICIAL_VERIFIED',
    confirmCount: 19,
    disputeCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    images: [],
    timeline: [],
    comments: []
  },
  {
    id: 'inc-004',
    type: 'TRANSIT',
    title: 'BTS Sukhumvit Line Delay Between Asok - Phrom Phong',
    description: 'Trains experiencing 5-10 minute delays due to temporary signaling adjustments. High passenger density on station platforms.',
    latitude: 13.7371,
    longitude: 100.5604,
    locationName: 'BTS Asok Station',
    district: 'Watthana',
    province: 'Bangkok',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    source: 'COMMUNITY',
    confidence: 'COMMUNITY_VERIFIED',
    confirmCount: 52,
    disputeCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    images: [],
    timeline: [],
    comments: [],
    transitDetails: {
      lineId: 'bts-sukhumvit',
      lineName: 'BTS Sukhumvit Line',
      lineColor: '#22c55e',
      stationName: 'Asok - Phrom Phong',
      delayMinutes: 8,
      status: 'DELAYED',
    }
  }
];

function mapPrismaIncident(raw: any): Incident {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    description: raw.description,
    latitude: raw.latitude,
    longitude: raw.longitude,
    locationName: raw.locationName,
    district: raw.district || undefined,
    province: raw.province,
    severity: raw.severity,
    status: raw.status,
    source: raw.source,
    confidence: raw.confidence,
    confirmCount: raw.confirmCount,
    disputeCount: raw.disputeCount,
    createdById: raw.createdById || undefined,
    createdByName: raw.createdBy?.name || undefined,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : raw.updatedAt,
    lastVerifiedAt: raw.lastVerifiedAt instanceof Date ? raw.lastVerifiedAt.toISOString() : raw.lastVerifiedAt,
    resolvedAt: raw.resolvedAt instanceof Date ? raw.resolvedAt.toISOString() : raw.resolvedAt,
    images: (raw.images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      caption: img.caption || undefined,
      createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt,
    })),
    timeline: (raw.updates || []).map((u: any) => ({
      id: u.id,
      timestamp: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      action: u.action,
      description: u.description,
    })),
    comments: (raw.comments || []).map((c: any) => ({
      id: c.id,
      userName: c.userName,
      message: c.message,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    })),
    floodDetails: raw.metadata?.waterLevelCategory ? (raw.metadata as any) : undefined,
    trafficDetails: raw.metadata?.speedKmh ? (raw.metadata as any) : undefined,
    transitDetails: raw.metadata?.delayMinutes ? (raw.metadata as any) : undefined,
  };
}

// 1. Get All Incidents
export async function getAllIncidents(): Promise<Incident[]> {
  try {
    const dbIncidents = await prisma.incident.findMany({
      include: {
        images: true,
        updates: true,
        comments: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbIncidents && dbIncidents.length > 0) {
      return dbIncidents.map(mapPrismaIncident);
    }
  } catch (error) {
    console.warn('Prisma query failed, using in-memory store:', error);
  }

  return [...inMemoryStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// 2. Get Incident By ID
export async function getIncidentById(id: string): Promise<Incident | null> {
  try {
    const inc = await prisma.incident.findUnique({
      where: { id },
      include: {
        images: true,
        updates: true,
        comments: true,
        createdBy: true,
      },
    });
    if (inc) return mapPrismaIncident(inc);
  } catch (e) {
    console.warn('Prisma getIncidentById error, using fallback');
  }

  const found = inMemoryStore.find((i) => i.id === id);
  return found ? { ...found } : null;
}

// 3. Create Incident
export async function createIncident(
  data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'confirmCount' | 'disputeCount' | 'timeline' | 'comments' | 'images'> & {
    images?: any[];
  }
): Promise<Incident> {
  const now = new Date().toISOString();

  try {
    const created = await prisma.incident.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        locationName: data.locationName,
        district: data.district,
        province: data.province || 'กรุงเทพมหานคร',
        severity: data.severity,
        status: 'ACTIVE',
        source: data.source || 'COMMUNITY',
        confidence: data.confidence || 'MEDIUM',
        confirmCount: 1,
        disputeCount: 0,
        metadata: (data.floodDetails || data.trafficDetails || data.transitDetails || {}) as any,
        images: {
          create: (data.images || []).map((img) => ({
            url: typeof img === 'string' ? img : img.url,
            caption: typeof img === 'object' ? img.caption : undefined,
          })),
        },
        updates: {
          create: [
            {
              action: 'CREATED',
              description: `ผู้ใช้งาน (${data.createdByName || 'ประชาชน'}) รายงานเหตุการณ์`,
            },
          ],
        },
      },
      include: {
        images: true,
        updates: true,
        comments: true,
      },
    });

    const mapped = mapPrismaIncident(created);
    inMemoryStore.unshift(mapped);
    realtimeBroadcaster.broadcast('incident.created', mapped);
    return mapped;
  } catch (error) {
    console.warn('Prisma create failed, saving to in-memory store:', error);
  }

  const id = `inc-${Date.now().toString(36)}`;
  const newIncident: Incident = {
    ...data,
    id,
    confirmCount: 1,
    disputeCount: 0,
    createdAt: now,
    updatedAt: now,
    lastVerifiedAt: now,
    images: data.images || [],
    timeline: [
      {
        id: `t-${Date.now()}`,
        timestamp: now,
        action: 'CREATED',
        description: 'ผู้ใช้งานรายงานเหตุการณ์',
        user: data.createdByName || 'ประชาชน',
      },
    ],
    comments: [],
  };

  inMemoryStore.unshift(newIncident);
  realtimeBroadcaster.broadcast('incident.created', newIncident);
  return newIncident;
}

// 4. Confirm Incident
export async function confirmIncident(id: string, userName = 'ผู้ใช้งานทั่วไป'): Promise<Incident | null> {
  const now = new Date().toISOString();

  try {
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        confirmCount: { increment: 1 },
        lastVerifiedAt: new Date(),
        updates: {
          create: {
            action: 'VERIFIED',
            description: `ผู้ใช้งาน (${userName}) ยืนยันว่าเหตุการณ์ยังเกิดขึ้น`,
          },
        },
      },
      include: {
        images: true,
        updates: true,
        comments: true,
      },
    });

    const mapped = mapPrismaIncident(updated);
    const idx = inMemoryStore.findIndex((i) => i.id === id);
    if (idx !== -1) inMemoryStore[idx] = mapped;

    realtimeBroadcaster.broadcast('incident.confirmed', {
      id,
      confirmCount: mapped.confirmCount,
      lastVerifiedAt: mapped.lastVerifiedAt,
    });
    return mapped;
  } catch (e) {
    console.warn('Prisma confirm failed, updating in-memory:', e);
  }

  const inc = inMemoryStore.find((i) => i.id === id);
  if (!inc) return null;

  inc.confirmCount += 1;
  inc.lastVerifiedAt = now;
  inc.updatedAt = now;
  inc.timeline.push({
    id: `t-${Date.now()}`,
    timestamp: now,
    action: 'VERIFIED',
    description: `ผู้ใช้งาน (${userName}) ยืนยันว่าเหตุการณ์ยังเกิดขึ้น`,
    user: userName,
  });

  realtimeBroadcaster.broadcast('incident.confirmed', {
    id,
    confirmCount: inc.confirmCount,
    lastVerifiedAt: inc.lastVerifiedAt,
  });
  return { ...inc };
}

// 5. Dispute Incident
export async function disputeIncident(id: string, userName = 'ผู้ใช้งานทั่วไป'): Promise<Incident | null> {
  const now = new Date().toISOString();

  try {
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        disputeCount: { increment: 1 },
        updates: {
          create: {
            action: 'DISPUTED',
            description: `ผู้ใช้งาน (${userName}) แจ้งว่าไม่พบเหตุการณ์แล้ว`,
          },
        },
      },
      include: {
        images: true,
        updates: true,
        comments: true,
      },
    });

    const mapped = mapPrismaIncident(updated);
    const idx = inMemoryStore.findIndex((i) => i.id === id);
    if (idx !== -1) inMemoryStore[idx] = mapped;

    realtimeBroadcaster.broadcast('incident.disputed', {
      id,
      disputeCount: mapped.disputeCount,
    });
    return mapped;
  } catch (e) {
    console.warn('Prisma dispute failed, updating in-memory:', e);
  }

  const inc = inMemoryStore.find((i) => i.id === id);
  if (!inc) return null;

  inc.disputeCount += 1;
  inc.updatedAt = now;
  inc.timeline.push({
    id: `t-${Date.now()}`,
    timestamp: now,
    action: 'DISPUTED',
    description: `ผู้ใช้งาน (${userName}) แจ้งว่าไม่พบเหตุการณ์แล้ว`,
    user: userName,
  });

  realtimeBroadcaster.broadcast('incident.disputed', { id, disputeCount: inc.disputeCount });
  return { ...inc };
}

// 6. Resolve Incident
export async function resolveIncident(id: string, adminName = 'ผู้ดูแลระบบ'): Promise<Incident | null> {
  const now = new Date();

  try {
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: now,
        updates: {
          create: {
            action: 'RESOLVED',
            description: `เหตุการณ์ได้รับการคลี่คลายแล้ว โดย ${adminName}`,
          },
        },
      },
      include: {
        images: true,
        updates: true,
        comments: true,
      },
    });

    const mapped = mapPrismaIncident(updated);
    const idx = inMemoryStore.findIndex((i) => i.id === id);
    if (idx !== -1) inMemoryStore[idx] = mapped;

    realtimeBroadcaster.broadcast('incident.resolved', {
      id,
      status: 'RESOLVED',
      resolvedAt: mapped.resolvedAt,
    });
    return mapped;
  } catch (e) {
    console.warn('Prisma resolve failed, updating in-memory:', e);
  }

  const inc = inMemoryStore.find((i) => i.id === id);
  if (!inc) return null;

  inc.status = 'RESOLVED';
  inc.resolvedAt = now.toISOString();
  inc.updatedAt = inc.resolvedAt;

  realtimeBroadcaster.broadcast('incident.resolved', {
    id,
    status: 'RESOLVED',
    resolvedAt: inc.resolvedAt,
  });
  return { ...inc };
}

// 7. Delete Incident
export async function deleteIncident(id: string, adminName = 'ผู้ดูแลระบบ'): Promise<boolean> {
  try {
    await prisma.incident.delete({ where: { id } });
  } catch (e) {
    console.warn('Prisma delete fallback:', e);
  }

  const index = inMemoryStore.findIndex((i) => i.id === id);
  if (index !== -1) {
    inMemoryStore.splice(index, 1);
  }

  realtimeBroadcaster.broadcast('incident.updated', { id, deleted: true });
  return true;
}

// 8. Add Comment
export async function addCommentToIncident(
  id: string,
  commentData: { userName: string; message: string; isOfficial?: boolean }
): Promise<IncidentComment | null> {
  try {
    const created = await prisma.comment.create({
      data: {
        incidentId: id,
        userName: commentData.userName || 'ผู้ใช้งาน',
        message: commentData.message,
      },
    });

    const comment: IncidentComment = {
      id: created.id,
      userName: created.userName,
      message: created.message,
      createdAt: created.createdAt.toISOString(),
      isOfficial: commentData.isOfficial || false,
    };

    realtimeBroadcaster.broadcast('incident.updated', { id, newComment: comment });
    return comment;
  } catch (e) {
    console.warn('Prisma comment error, fallback:', e);
  }

  const inc = inMemoryStore.find((i) => i.id === id);
  if (!inc) return null;

  const newComment: IncidentComment = {
    id: `c-${Date.now()}`,
    userName: commentData.userName || 'ผู้ใช้งาน',
    message: commentData.message,
    createdAt: new Date().toISOString(),
    isOfficial: commentData.isOfficial || false,
  };

  inc.comments.push(newComment);
  realtimeBroadcaster.broadcast('incident.updated', { id, newComment });
  return newComment;
}

// 9. Dashboard Stats
export async function getDashboardStats() {
  const incidents = await getAllIncidents();
  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED');

  const byType = {
    FLOOD: incidents.filter((i) => i.type === 'FLOOD').length,
    TRAFFIC: incidents.filter((i) => i.type === 'TRAFFIC').length,
    ACCIDENT: incidents.filter((i) => i.type === 'ACCIDENT').length,
    ROAD_CLOSED: incidents.filter((i) => i.type === 'ROAD_CLOSED').length,
    TRANSIT: incidents.filter((i) => i.type === 'TRANSIT').length,
    EMERGENCY: incidents.filter((i) => i.type === 'EMERGENCY').length,
    GENERAL: incidents.filter((i) => i.type === 'GENERAL').length,
  };

  const bySeverity = {
    LOW: incidents.filter((i) => i.severity === 'LOW').length,
    MEDIUM: incidents.filter((i) => i.severity === 'MEDIUM').length,
    HIGH: incidents.filter((i) => i.severity === 'HIGH').length,
    CRITICAL: incidents.filter((i) => i.severity === 'CRITICAL').length,
  };

  return {
    totalIncidents: incidents.length,
    activeCount: activeIncidents.length,
    resolvedCount: resolvedIncidents.length,
    monitoringCount: incidents.filter((i) => i.status === 'MONITORING').length,
    byType,
    bySeverity,
    lastUpdated: new Date().toISOString(),
  };
}

// 10. Audit Logs
export async function getAuditLogs() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    if (logs.length > 0) {
      return logs.map((l) => ({
        id: l.id,
        adminName: 'Admin BKK',
        action: l.action,
        details: l.details || '',
        createdAt: l.createdAt.toISOString(),
      }));
    }
  } catch (e) {}

  return [
    {
      id: 'log-1',
      adminName: 'Admin System',
      action: 'SYSTEM_INIT',
      details: 'ระบบฐานข้อมูล Neon PostgreSQL พร้อมใช้งาน',
      createdAt: new Date().toISOString(),
    },
  ];
}
