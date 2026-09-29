// Bangkok Reconnaissance Layer Definitions: CCTV, Boats, Military & Radar Corridors

export interface BangkokCCTVCamera {
  id: string;
  name: string;
  road: string;
  district: string;
  lat: number;
  lng: number;
  direction: string;
  agency: 'BMA' | 'EXAT' | 'DOH' | 'TRAFFIC_POLICE';
  status: 'ONLINE' | 'STANDBY';
  sampleThumb: string;
}

export interface BangkokBoatRoute {
  id: string;
  name: string;
  nameEn: string;
  type: 'CHAOPHRAYA_EXPRESS' | 'SAEN_SAEP_CANAL';
  colorCode: string;
  coordinates: [number, number][];
  piers: { name: string; nameEn: string; lat: number; lng: number }[];
  schedule: string;
}

export interface ReconCorridor {
  id: string;
  callsign: string;
  unit: string;
  type: 'MILITARY_PATROL' | 'SECURITY_CHECKPOINT' | 'GOV_ESCORT';
  lat: number;
  lng: number;
  heading: number;
  status: 'PATROLLING' | 'SECURED' | 'STANDBY';
  zone: string;
}

// 1. Street-Level Traffic CCTV Cameras (Bangkok Metropolitan & Expressway Authority)
export const BANGKOK_CCTV_CAMERAS: BangkokCCTVCamera[] = [
  {
    id: 'cctv-asok-sukhumvit',
    name: 'Asok-Sukhumvit Intersection (Sukhumvit 21)',
    road: 'Sukhumvit Rd / Asok Montri',
    district: 'Watthana',
    lat: 13.7371,
    lng: 100.5604,
    direction: 'Northbound toward Phetchaburi',
    agency: 'BMA',
    status: 'ONLINE',
    sampleThumb: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cctv-siam-rama1',
    name: 'Siam Square / Rama I Pathum Wan',
    road: 'Rama I Rd / Phaya Thai',
    district: 'Pathum Wan',
    lat: 13.7460,
    lng: 100.5347,
    direction: 'Eastbound toward Ratchaprasong',
    agency: 'BMA',
    status: 'ONLINE',
    sampleThumb: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cctv-latphrao-hayark',
    name: 'Ha Yaek Lat Phrao Junction',
    road: 'Phahonyothin / Vibhavadi Rangsit',
    district: 'Chatuchak',
    lat: 13.8123,
    lng: 100.5604,
    direction: 'Inbound toward Mo Chit',
    agency: 'DOH',
    status: 'ONLINE',
    sampleThumb: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cctv-rama9-mcot',
    name: 'Rama IX - Ratchadaphisek MCOT Junction',
    road: 'Rama IX Rd',
    district: 'Huai Khwang',
    lat: 13.7578,
    lng: 100.5649,
    direction: 'Eastbound toward Srinakarin',
    agency: 'EXAT',
    status: 'ONLINE',
    sampleThumb: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cctv-victory-monument',
    name: 'Victory Monument Rotary Sector A',
    road: 'Phahonyothin / Phaya Thai',
    district: 'Ratchathewi',
    lat: 13.7650,
    lng: 100.5380,
    direction: 'Rotary West toward Phrom Phao',
    agency: 'TRAFFIC_POLICE',
    status: 'ONLINE',
    sampleThumb: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cctv-pinklao-bridge',
    name: 'Phra Pin Klao Bridge Crossing',
    road: 'Somdet Phra Pin Klao Rd',
    district: 'Bangkok Noi',
    lat: 13.7620,
    lng: 100.4850,
    direction: 'Westbound crossing Chao Phraya River',
    agency: 'BMA',
    status: 'ONLINE',
    sampleThumb: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cctv-bangna-trad-km1',
    name: 'Bang Na - Trat Expressway KM.1 Entrance',
    road: 'Debaratna Rd (Bang Na - Trat)',
    district: 'Bang Na',
    lat: 13.6685,
    lng: 100.6044,
    direction: 'Outbound to Chonburi',
    agency: 'EXAT',
    status: 'ONLINE',
    sampleThumb: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=300&q=80',
  },
];

// 2. Bangkok River & Canal Boat Routes
export const BANGKOK_BOAT_ROUTES: BangkokBoatRoute[] = [
  {
    id: 'chaophraya-express-orange',
    name: 'เรือด่วนเจ้าพระยา ธงส้ม (นนทบุรี - วัดราชสิงขร)',
    nameEn: 'Chao Phraya Express Boat (Orange Flag: Nonthaburi - Wat Rajsingkorn)',
    type: 'CHAOPHRAYA_EXPRESS',
    colorCode: '#f97316', // Orange
    schedule: 'Every 15-20 mins (06:00 - 18:30)',
    coordinates: [
      [13.8500, 100.4900], // Nonthaburi Pier
      [13.8200, 100.5150], // Rama VII
      [13.7900, 100.5180], // Kiak Kai
      [13.7750, 100.4990], // Thewet
      [13.7600, 100.4920], // Phra Arthit
      [13.7530, 100.4880], // Wang Lang (Prannok)
      [13.7440, 100.4910], // Tha Tien (Wat Pho)
      [13.7280, 100.5130], // Si Phraya
      [13.7190, 100.5140], // Sathorn (Taksin Bridge BTS)
      [13.7050, 100.5050], // Wat Rajsingkorn
    ],
    piers: [
      { name: 'ท่าน้ำนนทบุรี', nameEn: 'Nonthaburi Pier', lat: 13.8500, lng: 100.4900 },
      { name: 'ท่าพระอาทิตย์', nameEn: 'Phra Arthit Pier', lat: 13.7600, lng: 100.4920 },
      { name: 'ท่าวังหลัง (พรานนก)', nameEn: 'Wang Lang Pier', lat: 13.7530, lng: 100.4880 },
      { name: 'ท่าสาทร (BTS ตากสิน)', nameEn: 'Sathorn Pier (BTS)', lat: 13.7190, lng: 100.5140 },
    ],
  },
  {
    id: 'saen-saep-canal-boat',
    name: 'เรือโดยสารคลองแสนแสบ (ผ่านฟ้า - ประตูน้ำ - บางกะปิ)',
    nameEn: 'Khlong Saen Saep Express Boat (Phan Fa - Pratunam - Bang Kapi)',
    type: 'SAEN_SAEP_CANAL',
    colorCode: '#0284c7', // Sky Blue
    schedule: 'Every 8-12 mins (05:30 - 20:00)',
    coordinates: [
      [13.7555, 100.5060], // Phan Fa Lilat Pier
      [13.7525, 100.5250], // Saphan Hua Chang (BTS Ratchathewi)
      [13.7495, 100.5405], // Pratunam Central Interchange
      [13.7480, 100.5620], // Asok Pier (MRT Phetchaburi)
      [13.7430, 100.6010], // Ramkhamhaeng
      [13.7650, 100.6380], // The Mall Bangkapi
      [13.7750, 100.6550], // Wat Si Bun Rueang
    ],
    piers: [
      { name: 'ท่าผ่านฟ้าลีลาศ', nameEn: 'Phan Fa Lilat Pier', lat: 13.7555, lng: 100.5060 },
      { name: 'ท่าประตูน้ำ', nameEn: 'Pratunam Interchange', lat: 13.7495, lng: 100.5405 },
      { name: 'ท่าอโศก (MRT เพชรบุรี)', nameEn: 'Asok Pier', lat: 13.7480, lng: 100.5620 },
      { name: 'ท่าวัดศรีบุญเรือง', nameEn: 'Wat Si Bun Rueang', lat: 13.7750, lng: 100.6550 },
    ],
  },
];

// 3. Security, Border & Metropolitan Patrol Units
export const BANGKOK_RECON_UNITS: ReconCorridor[] = [
  {
    id: 'recon-unit-01',
    callsign: 'PATROL-BRAVO-01',
    unit: '1st Division King\'s Guard Mobile Patrol',
    type: 'MILITARY_PATROL',
    lat: 13.7680,
    lng: 100.5120,
    heading: 90,
    status: 'PATROLLING',
    zone: 'Dusit Royal District',
  },
  {
    id: 'recon-unit-02',
    callsign: 'CHECKPOINT-VIP-NORTH',
    unit: 'Metropolitan Police Security Escort',
    type: 'SECURITY_CHECKPOINT',
    lat: 13.8350,
    lng: 100.5500,
    heading: 180,
    status: 'SECURED',
    zone: 'Vibhavadi VIP Corridor',
  },
  {
    id: 'recon-unit-03',
    callsign: 'COASTAL-DEF-WATER-04',
    unit: 'Royal Thai Navy Riverine Patrol Unit',
    type: 'MILITARY_PATROL',
    lat: 13.7380,
    lng: 100.4940,
    heading: 215,
    status: 'PATROLLING',
    zone: 'Chao Phraya River South Sector',
  },
];

// 4. Bangkok Wi-Fi Hotspots & Cyber Telemetry
export type WifiCategory = 'CORPORATE_ISP' | 'COMMERCIAL_MALL_CAFE' | 'SUSPICIOUS_UNSECURED';

export interface BangkokWifiHotspot {
  id: string;
  ssid: string;
  bssid: string;
  provider: string;
  category: WifiCategory;
  lat: number;
  lng: number;
  locationName: string;
  signalStrength: number; // dBm e.g. -45, -60, -85
  securityType: 'WPA3_ENTERPRISE' | 'WPA2_PSK' | 'OPEN_CAPTIVE' | 'ROGUE_EVIL_TWIN' | 'UNENCRYPTED_HONEYPOT';
  warningMessage?: string;
  status: 'ONLINE' | 'FLAGGED';
}

export const BANGKOK_WIFI_HOTSPOTS: BangkokWifiHotspot[] = [
  // 1. Green: Corporate / Service Provider Networks
  {
    id: 'wifi-ais-siam-paragon',
    ssid: '@ AIS SMART 5G WiFi',
    bssid: 'E4:8D:8C:91:2A:40',
    provider: 'AIS (Advanced Info Service)',
    category: 'CORPORATE_ISP',
    lat: 13.7460,
    lng: 100.5348,
    locationName: 'Siam Paragon Flagship Terminal',
    signalStrength: -48,
    securityType: 'WPA3_ENTERPRISE',
    status: 'ONLINE',
  },
  {
    id: 'wifi-true-centralworld',
    ssid: '.@ TrueMove H GigaWiFi',
    bssid: '70:F1:A1:34:B8:12',
    provider: 'True Corporation',
    category: 'CORPORATE_ISP',
    lat: 13.7466,
    lng: 100.5393,
    locationName: 'CentralWorld Ratchaprasong Plaza',
    signalStrength: -52,
    securityType: 'WPA3_ENTERPRISE',
    status: 'ONLINE',
  },
  {
    id: 'wifi-nt-government-chaengwattana',
    ssid: 'Free_Gov_WiFi_by_NT',
    bssid: '00:26:86:E0:41:88',
    provider: 'National Telecom (NT)',
    category: 'CORPORATE_ISP',
    lat: 13.8824,
    lng: 100.5652,
    locationName: 'Government Complex Chaeng Watthana',
    signalStrength: -55,
    securityType: 'WPA2_PSK',
    status: 'ONLINE',
  },
  {
    id: 'wifi-ais-bangsue-grand',
    ssid: '@ AIS SMART WiFi Krung Thep Aphiwat',
    bssid: 'D8:B3:70:9A:11:3C',
    provider: 'AIS (State Railway Hub)',
    category: 'CORPORATE_ISP',
    lat: 13.8037,
    lng: 100.5408,
    locationName: 'Krung Thep Aphiwat Central Terminal',
    signalStrength: -50,
    securityType: 'WPA3_ENTERPRISE',
    status: 'ONLINE',
  },
  {
    id: 'wifi-true-suvarnabhumi',
    ssid: '.@ TrueWiFi_Suvarnabhumi_Terminal',
    bssid: 'BC:67:1C:88:5F:29',
    provider: 'Airports of Thailand (AOT) / True',
    category: 'CORPORATE_ISP',
    lat: 13.6900,
    lng: 100.7501,
    locationName: 'Suvarnabhumi Airport Departure Concourse D',
    signalStrength: -45,
    securityType: 'WPA3_ENTERPRISE',
    status: 'ONLINE',
  },

  // 2. Yellow: Coffee Shops / Shopping Malls
  {
    id: 'wifi-starbucks-emquartier',
    ssid: 'Starbucks_Free_WiFi',
    bssid: '44:65:7F:A1:EE:33',
    provider: 'Starbucks Coffee Thailand',
    category: 'COMMERCIAL_MALL_CAFE',
    lat: 13.7314,
    lng: 100.5698,
    locationName: 'Starbucks Reserve EmQuartier Sukhumvit',
    signalStrength: -58,
    securityType: 'OPEN_CAPTIVE',
    status: 'ONLINE',
  },
  {
    id: 'wifi-iconsiam-guest',
    ssid: 'ICONSIAM_FreeWiFi_Guest',
    bssid: 'A8:BD:27:12:44:90',
    provider: 'ICONSIAM Retail Management',
    category: 'COMMERCIAL_MALL_CAFE',
    lat: 13.7267,
    lng: 100.5108,
    locationName: 'ICONSIAM Riverside Walkway',
    signalStrength: -54,
    securityType: 'OPEN_CAPTIVE',
    status: 'ONLINE',
  },
  {
    id: 'wifi-cafe-amazon-ptt-vibhavadi',
    ssid: 'CafeAmazon_CustomerWiFi',
    bssid: '18:64:72:90:3A:CC',
    provider: 'PTT Oil and Retail Business (OR)',
    category: 'COMMERCIAL_MALL_CAFE',
    lat: 13.8205,
    lng: 100.5601,
    locationName: 'Café Amazon Vibhavadi Rangsit Hub',
    signalStrength: -62,
    securityType: 'WPA2_PSK',
    status: 'ONLINE',
  },
  {
    id: 'wifi-terminal21-asok',
    ssid: 'Terminal21_Visitor_WiFi',
    bssid: '2C:30:33:DE:7F:10',
    provider: 'Terminal 21 Asok Retail Tech',
    category: 'COMMERCIAL_MALL_CAFE',
    lat: 13.7378,
    lng: 100.5604,
    locationName: 'Terminal 21 Asok Food Island',
    signalStrength: -59,
    securityType: 'OPEN_CAPTIVE',
    status: 'ONLINE',
  },
  {
    id: 'wifi-roast-thonglor',
    ssid: 'theCOMMONS_Patron_WiFi',
    bssid: '74:83:C2:5F:AA:19',
    provider: 'theCOMMONS Community Mall',
    category: 'COMMERCIAL_MALL_CAFE',
    lat: 13.7348,
    lng: 100.5833,
    locationName: 'theCOMMONS Thonglor Soi 17',
    signalStrength: -64,
    securityType: 'WPA2_PSK',
    status: 'ONLINE',
  },

  // 3. Red: Suspicious Public Wi-Fi Networks (Warning Markers)
  {
    id: 'wifi-suspicious-khao-san',
    ssid: 'FREE_INTERNET_NO_PASSWORD_FAST',
    bssid: '00:14:22:98:X7:01',
    provider: 'UNKNOWN (Unverified Rogue AP)',
    category: 'SUSPICIOUS_UNSECURED',
    lat: 13.7592,
    lng: 100.4975,
    locationName: 'Khao San Road Walking Street',
    signalStrength: -42,
    securityType: 'ROGUE_EVIL_TWIN',
    warningMessage: 'WARNING: Detected fake Evil Twin hotspot broadcasting unencrypted packets. Potential man-in-the-middle phishing attack.',
    status: 'FLAGGED',
  },
  {
    id: 'wifi-suspicious-chatuchak',
    ssid: '@_Free_HighSpeed_Market_WiFi',
    bssid: '28:EF:01:A0:5B:DE',
    provider: 'ANONYMOUS PROXY NODE',
    category: 'SUSPICIOUS_UNSECURED',
    lat: 13.7999,
    lng: 100.5504,
    locationName: 'Chatuchak Weekend Market Gate 3',
    signalStrength: -49,
    securityType: 'UNENCRYPTED_HONEYPOT',
    warningMessage: 'WARNING: HoneyPot credential sniffer detected. Captive portal mimics banking login pages. Do not connect.',
    status: 'FLAGGED',
  },
  {
    id: 'wifi-suspicious-nana-plaza',
    ssid: 'Bangkok_Metro_Public_FreeNet',
    bssid: 'AC:7F:3E:99:00:2A',
    provider: 'SPOOFED_MAC_IDENTITY',
    category: 'SUSPICIOUS_UNSECURED',
    lat: 13.7420,
    lng: 100.5530,
    locationName: 'Sukhumvit Soi 4 (Nana Intersection)',
    signalStrength: -44,
    securityType: 'ROGUE_EVIL_TWIN',
    warningMessage: 'WARNING: Spoofed public network name without valid digital certificates. Traffic injection active.',
    status: 'FLAGGED',
  },
];

