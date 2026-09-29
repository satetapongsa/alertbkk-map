import { TransportLine } from '@/types';

export const BANGKOK_TRANSIT_LINES: TransportLine[] = [
  {
    id: 'bts-sukhumvit',
    name: 'BTS สายสุขุมวิท',
    nameEn: 'BTS Sukhumvit Line',
    type: 'BTS',
    colorCode: '#22c55e', // Green
    status: 'DELAYED',
    statusDetail: 'ขบวนรถล่าช้าบริเวณสถานีอโศก - พร้อมพงษ์ ประมาณ 5-10 นาที เนื่องจากระบบอาณัติสัญญาณขัดข้องชั่วคราว',
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    affectedStations: ['Asok', 'Phrom Phong'],
    coordinates: [
      [13.8249, 100.5694], // Ha Yaek Lat Phrao
      [13.8024, 100.5539], // Mo Chit
      [13.7749, 100.5422], // Ari
      [13.7539, 100.5348], // Phaya Thai
      [13.7460, 100.5347], // Siam
      [13.7441, 100.5401], // Chit Lom
      [13.7371, 100.5604], // Asok
      [13.7303, 100.5698], // Phrom Phong
      [13.7203, 100.5841], // Thong Lo
      [13.7196, 100.5912], // Ekkamai
      [13.7082, 100.6010], // Phra Khanong
      [13.7025, 100.6053], // On Nut
      [13.6685, 100.6044], // Bang Na
      [13.5990, 100.6000]  // Kheha
    ],
    stations: [
      { id: 'bts-mochit', code: 'N8', name: 'หมอชิต', nameEn: 'Mo Chit', latitude: 13.8024, longitude: 100.5539, status: 'NORMAL' },
      { id: 'bts-ari', code: 'N5', name: 'อารีย์', nameEn: 'Ari', latitude: 13.7749, longitude: 100.5422, status: 'NORMAL' },
      { id: 'bts-phayathai', code: 'N2', name: 'พญาไท', nameEn: 'Phaya Thai', latitude: 13.7539, longitude: 100.5348, status: 'NORMAL' },
      { id: 'bts-siam', code: 'CEN', name: 'สยาม', nameEn: 'Siam', latitude: 13.7460, longitude: 100.5347, status: 'NORMAL' },
      { id: 'bts-asok', code: 'E4', name: 'อโศก', nameEn: 'Asok', latitude: 13.7371, longitude: 100.5604, status: 'DELAYED' },
      { id: 'bts-phromphong', code: 'E5', name: 'พร้อมพงษ์', nameEn: 'Phrom Phong', latitude: 13.7303, longitude: 100.5698, status: 'DELAYED' },
      { id: 'bts-thonglo', code: 'E6', name: 'ทองหล่อ', nameEn: 'Thong Lo', latitude: 13.7203, longitude: 100.5841, status: 'NORMAL' },
      { id: 'bts-onnut', code: 'E9', name: 'อ่อนนุช', nameEn: 'On Nut', latitude: 13.7025, longitude: 100.6053, status: 'NORMAL' }
    ]
  },
  {
    id: 'bts-silom',
    name: 'BTS สายสีลม',
    nameEn: 'BTS Silom Line',
    type: 'BTS',
    colorCode: '#059669', // Dark Green
    status: 'NORMAL',
    statusDetail: 'ให้บริการตามตารางเวลาปกติ ความถี่ 3.5 - 5 นาที',
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    coordinates: [
      [13.7460, 100.5347], // Siam
      [13.7378, 100.5332], // Ratchadamri
      [13.7285, 100.5342], // Sala Daeng
      [13.7214, 100.5283], // Chong Nonsi
      [13.7190, 100.5152], // Saphan Taksin
      [13.7208, 100.5050], // Krung Thon Buri
      [13.7212, 100.4578]  // Bang Wa
    ],
    stations: [
      { id: 'bts-national-stadium', code: 'W1', name: 'สนามกีฬาแห่งชาติ', nameEn: 'National Stadium', latitude: 13.7465, longitude: 100.5292, status: 'NORMAL' },
      { id: 'bts-saladaeng', code: 'S2', name: 'ศาลาแดง', nameEn: 'Sala Daeng', latitude: 13.7285, longitude: 100.5342, status: 'NORMAL' },
      { id: 'bts-chongnonsi', code: 'S3', name: 'ช่องนนทรี', nameEn: 'Chong Nonsi', latitude: 13.7214, longitude: 100.5283, status: 'NORMAL' },
      { id: 'bts-saphantaksin', code: 'S6', name: 'สะพานตากสิน', nameEn: 'Saphan Taksin', latitude: 13.7190, longitude: 100.5152, status: 'NORMAL' },
      { id: 'bts-bangwa', code: 'S12', name: 'บางหว้า', nameEn: 'Bang Wa', latitude: 13.7212, longitude: 100.4578, status: 'NORMAL' }
    ]
  },
  {
    id: 'mrt-blue',
    name: 'MRT สายสีน้ำเงิน',
    nameEn: 'MRT Blue Line',
    type: 'MRT',
    colorCode: '#2563eb', // Blue
    status: 'NORMAL',
    statusDetail: 'การเดินรถปกติทุกสถานี ความถี่ 4 นาที',
    updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    coordinates: [
      [13.8038, 100.5375], // Bang Sue
      [13.8024, 100.5539], // Chatuchak Park
      [13.8123, 100.5604], // Phahon Yothin
      [13.8055, 100.5739], // Lat Phrao
      [13.7766, 100.5734], // Huai Khwang
      [13.7634, 100.5694], // Thailand Cultural Centre
      [13.7578, 100.5649], // Phra Ram 9
      [13.7490, 100.5630], // Phetchaburi
      [13.7371, 100.5604], // Sukhumvit (Asok)
      [13.7229, 100.5583], // Queen Sirikit
      [13.7235, 100.5447], // Khlong Toei
      [13.7285, 100.5342], // Si Lom
      [13.7329, 100.5292], // Sam Yan
      [13.7381, 100.5167], // Hua Lamphong
      [13.7439, 100.5080], // Wat Mangkon
      [13.7445, 100.4983], // Sanam Chai
      [13.7303, 100.4727]  // Tha Phra
    ],
    stations: [
      { id: 'mrt-bangsue', code: 'BL11', name: 'บางซื่อ', nameEn: 'Bang Sue', latitude: 13.8038, longitude: 100.5375, status: 'NORMAL' },
      { id: 'mrt-chatuchak', code: 'BL13', name: 'สวนจตุจักร', nameEn: 'Chatuchak Park', latitude: 13.8024, longitude: 100.5539, status: 'NORMAL' },
      { id: 'mrt-latphrao', code: 'BL15', name: 'ลาดพร้าว', nameEn: 'Lat Phrao', latitude: 13.8055, longitude: 100.5739, status: 'NORMAL' },
      { id: 'mrt-phraram9', code: 'BL20', name: 'พระราม 9', nameEn: 'Phra Ram 9', latitude: 13.7578, longitude: 100.5649, status: 'NORMAL' },
      { id: 'mrt-sukhumvit', code: 'BL22', name: 'สุขุมวิท', nameEn: 'Sukhumvit', latitude: 13.7371, longitude: 100.5604, status: 'NORMAL' },
      { id: 'mrt-silom', code: 'BL26', name: 'สีลม', nameEn: 'Si Lom', latitude: 13.7285, longitude: 100.5342, status: 'NORMAL' },
      { id: 'mrt-sanamchai', code: 'BL31', name: 'สนามไชย', nameEn: 'Sanam Chai', latitude: 13.7445, longitude: 100.4983, status: 'NORMAL' }
    ]
  },
  {
    id: 'mrt-yellow',
    name: 'MRT สายสีเหลือง',
    nameEn: 'MRT Yellow Line',
    type: 'MRT',
    colorCode: '#eab308', // Yellow
    status: 'NORMAL',
    statusDetail: 'ลาดพร้าว - สำโรง ให้บริการปกติ',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    coordinates: [
      [13.8055, 100.5739], // Lat Phrao
      [13.7915, 100.6083], // Chok Chai 4
      [13.7745, 100.6272], // Bang Kapi
      [13.7500, 100.6444], // Hua Mak
      [13.7100, 100.6480], // Si Nut
      [13.6700, 100.6480], // Si Iam
      [13.6000, 100.6050]  // Samrong
    ],
    stations: [
      { id: 'mrt-y-latphrao', code: 'YL01', name: 'ลาดพร้าว', nameEn: 'Lat Phrao', latitude: 13.8055, longitude: 100.5739, status: 'NORMAL' },
      { id: 'mrt-y-bangkapi', code: 'YL08', name: 'บางกะปิ', nameEn: 'Bang Kapi', latitude: 13.7745, longitude: 100.6272, status: 'NORMAL' },
      { id: 'mrt-y-samrong', code: 'YL23', name: 'สำโรง', nameEn: 'Samrong', latitude: 13.6000, longitude: 100.6050, status: 'NORMAL' }
    ]
  },
  {
    id: 'arl',
    name: 'Airport Rail Link',
    nameEn: 'Airport Rail Link',
    type: 'ARL',
    colorCode: '#dc2626', // Red
    status: 'NORMAL',
    statusDetail: 'สุวรรณภูมิ - พญาไท เปิดให้บริการปกติ ความถี่ 10-15 นาที',
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    coordinates: [
      [13.7539, 100.5348], // Phaya Thai
      [13.7548, 100.5430], // Ratchaprarop
      [13.7511, 100.5620], // Makkasan
      [13.7430, 100.6010], // Ramkhamhaeng
      [13.7380, 100.6450], // Hua Mak
      [13.7220, 100.6890], // Ban Thap Chang
      [13.7000, 100.7500]  // Suvarnabhumi Airport
    ],
    stations: [
      { id: 'arl-phayathai', code: 'A8', name: 'พญาไท', nameEn: 'Phaya Thai', latitude: 13.7539, longitude: 100.5348, status: 'NORMAL' },
      { id: 'arl-makkasan', code: 'A6', name: 'มักกะสัน', nameEn: 'Makkasan', latitude: 13.7511, longitude: 100.5620, status: 'NORMAL' },
      { id: 'arl-suvarnabhumi', code: 'A1', name: 'สุวรรณภูมิ', nameEn: 'Suvarnabhumi', latitude: 13.7000, longitude: 100.7500, status: 'NORMAL' }
    ]
  },
  {
    id: 'srt-darkred',
    name: 'SRT สายสีแดงเข้ม',
    nameEn: 'SRT Dark Red Line',
    type: 'SRT',
    colorCode: '#991b1b', // Dark Red
    status: 'NORMAL',
    statusDetail: 'กรุงเทพอภิวัฒน์ - รังสิต วิ่งตามตารางปกติ',
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    coordinates: [
      [13.8038, 100.5375], // Krung Thep Aphiwat
      [13.8290, 100.5550], // Wat Samian Nari
      [13.8480, 100.5630], // Bang Khen
      [13.8850, 100.5820], // Lak Si
      [13.9130, 100.5980], // Don Mueang
      [13.9890, 100.6120]  // Rangsit
    ],
    stations: [
      { id: 'srt-aphiwat', code: 'RN01', name: 'กรุงเทพอภิวัฒน์', nameEn: 'Krung Thep Aphiwat', latitude: 13.8038, longitude: 100.5375, status: 'NORMAL' },
      { id: 'srt-donmueang', code: 'RN08', name: 'ดอนเมือง', nameEn: 'Don Mueang', latitude: 13.9130, longitude: 100.5980, status: 'NORMAL' },
      { id: 'srt-rangsit', code: 'RN10', name: 'รังสิต', nameEn: 'Rangsit', latitude: 13.9890, longitude: 100.6120, status: 'NORMAL' }
    ]
  },
  // Bangkok BMTA & Smart Bus Trunk Routes
  {
    id: 'bus-route-8',
    name: 'สาย 8 (2-38) แฮปปี้แลนด์ - สะพานพุทธ',
    nameEn: 'Bus Line 8 (Happyland - Memorial Bridge)',
    type: 'BUS',
    colorCode: '#0284c7', // Cyan Blue
    status: 'NORMAL',
    statusDetail: 'เดินรถปกติผ่านถนนลาดพร้าว, อนุสาวรีย์ชัยฯ, ราชดำเนินกลาง, สะพานพุทธ',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    coordinates: [
      [13.7820, 100.6430], // Happyland
      [13.7915, 100.6130], // The Mall Bangkapi
      [13.7960, 100.5840], // Chok Chai 4
      [13.8123, 100.5604], // Ha Yaek Lat Phrao
      [13.8024, 100.5539], // Mo Chit BTS
      [13.7749, 100.5422], // Ari
      [13.7650, 100.5380], // Victory Monument
      [13.7580, 100.5180], // Yommarat
      [13.7550, 100.5010], // Ratchadamnoen
      [13.7400, 100.4980]  // Memorial Bridge
    ],
    stations: [
      { id: 'bus-8-1', code: 'B8-1', name: 'แฮปปี้แลนด์', nameEn: 'Happyland', latitude: 13.7820, longitude: 100.6430, status: 'NORMAL' },
      { id: 'bus-8-2', code: 'B8-2', name: 'อนุสาวรีย์ชัยฯ', nameEn: 'Victory Monument', latitude: 13.7650, longitude: 100.5380, status: 'NORMAL' },
      { id: 'bus-8-3', code: 'B8-3', name: 'สะพานพุทธ', nameEn: 'Memorial Bridge', latitude: 13.7400, longitude: 100.4980, status: 'NORMAL' }
    ]
  },
  {
    id: 'bus-route-511',
    name: 'สาย 511 ปากน้ำ - สายใต้ใหม่',
    nameEn: 'Bus Line 511 (Pak Nam - Southern Bus Terminal)',
    type: 'BUS',
    colorCode: '#f97316', // Orange
    status: 'NORMAL',
    statusDetail: 'เดินรถแกนหลักสุขุมวิท, เพลินจิต, ประตูน้ำ, ราชดำเนินกลาง ข้ามสะพานปิ่นเกล้า',
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    coordinates: [
      [13.5990, 100.6000], // Pak Nam
      [13.6685, 100.6044], // Bang Na
      [13.7025, 100.6053], // On Nut
      [13.7371, 100.5604], // Asok Sukhumvit
      [13.7440, 100.5420], // Phloen Chit
      [13.7505, 100.5390], // Pratunam
      [13.7560, 100.5050], // Democracy Monument
      [13.7620, 100.4850], // Pinklao Bridge
      [13.7800, 100.4250]  // Southern Bus Terminal (Sai Tai Mai)
    ],
    stations: [
      { id: 'bus-511-1', code: 'B511-1', name: 'ปากน้ำ', nameEn: 'Pak Nam', latitude: 13.5990, longitude: 100.6000, status: 'NORMAL' },
      { id: 'bus-511-2', code: 'B511-2', name: 'ประตูน้ำ', nameEn: 'Pratunam', latitude: 13.7505, longitude: 100.5390, status: 'NORMAL' },
      { id: 'bus-511-3', code: 'B511-3', name: 'สายใต้ใหม่', nameEn: 'Southern Bus Terminal', latitude: 13.7800, longitude: 100.4250, status: 'NORMAL' }
    ]
  },
  {
    id: 'bus-route-137',
    name: 'สาย 137 วงกลมรามคำแหง - รัชดาภิเษก',
    nameEn: 'Bus Line 137 (Ramkhamhaeng - Ratchadaphisek Circle)',
    type: 'BUS',
    colorCode: '#06b6d4', // Cyan
    status: 'NORMAL',
    statusDetail: 'เดินรถวงกลมเชื่อมต่อ MRT รัชดา, ลาดพร้าว, พระราม 9, ม.รามคำแหง',
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    coordinates: [
      [13.7578, 100.5649], // Rama IX
      [13.7710, 100.5730], // Thailand Cultural Centre
      [13.7890, 100.5740], // Huai Khwang
      [13.8185, 100.5750], // Ratchada-Lat Phrao
      [13.8050, 100.5980], // Lat Phrao 71
      [13.7620, 100.6280], // The Mall Bangkapi
      [13.7520, 100.6180], // Ramkhamhaeng University
      [13.7430, 100.6010], // Airport Link Ramkhamhaeng
      [13.7578, 100.5649]  // Rama IX (Loop closed)
    ],
    stations: [
      { id: 'bus-137-1', code: 'B137-1', name: 'เซ็นทรัลพระราม 9', nameEn: 'Central Rama IX', latitude: 13.7578, longitude: 100.5649, status: 'NORMAL' },
      { id: 'bus-137-2', code: 'B137-2', name: 'แยกรัชดา-ลาดพร้าว', nameEn: 'Ratchada-Lat Phrao', latitude: 13.8185, longitude: 100.5750, status: 'NORMAL' },
      { id: 'bus-137-3', code: 'B137-3', name: 'ม.รามคำแหง', nameEn: 'Ramkhamhaeng Univ', latitude: 13.7520, longitude: 100.6180, status: 'NORMAL' }
    ]
  }
];
