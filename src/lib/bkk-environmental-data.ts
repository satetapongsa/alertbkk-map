export interface CanalWaterStation {
  id: string;
  name: string;
  canalName: string;
  district: string;
  lat: number;
  lng: number;
  waterLevelMsl: number; // Meters above Mean Sea Level (m MSL / ม. รทก.)
  bankLevelMsl: number;  // Embankment level (ม. รทก.)
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  statusTh: string;
  trend: 'RISING' | 'STABLE' | 'FALLING';
  trendTh: string;
  flowRateCubicM: number;
  lastUpdated: string;
}

export interface AirQualityStation {
  id: string;
  stationName: string;
  district: string;
  lat: number;
  lng: number;
  pm25: number;       // ug/m3
  aqi: number;
  status: 'VERY_GOOD' | 'GOOD' | 'MODERATE' | 'UNHEALTHY_SENSITIVE' | 'UNHEALTHY';
  statusTh: string;
  colorHex: string;
  healthAdviceTh: string;
  temperatureC: number;
  humidityPct: number;
  lastUpdated: string;
}

export interface BangkokDistrict {
  id: string;
  nameTh: string;
  nameEn: string;
  lat: number;
  lng: number;
  postalCode: string;
}

export interface EmergencyHotline {
  number: string;
  agencyTh: string;
  agencyEn: string;
  category: 'MEDICAL' | 'DISASTER' | 'TRAFFIC' | 'POLICE' | 'MUNICIPAL';
  descriptionTh: string;
  availableHours: string;
}

// 1. Bangkok 50 Districts Coordinates and Metadata
export const BANGKOK_50_DISTRICTS: BangkokDistrict[] = [
  { id: 'bkk-01', nameTh: 'พระนคร', nameEn: 'Phra Nakhon', lat: 13.7645, lng: 100.4991, postalCode: '10200' },
  { id: 'bkk-02', nameTh: 'ดุสิต', nameEn: 'Dusit', lat: 13.7770, lng: 100.5218, postalCode: '10300' },
  { id: 'bkk-03', nameTh: 'หนองจอก', nameEn: 'Nong Chok', lat: 13.8552, lng: 100.8625, postalCode: '10530' },
  { id: 'bkk-04', nameTh: 'บางรัก', nameEn: 'Bang Rak', lat: 13.7307, lng: 100.5235, postalCode: '10500' },
  { id: 'bkk-05', nameTh: 'บางเขน', nameEn: 'Bang Khen', lat: 13.8738, lng: 100.5967, postalCode: '10220' },
  { id: 'bkk-06', nameTh: 'บางกะปิ', nameEn: 'Bang Kapi', lat: 13.7658, lng: 100.6477, postalCode: '10240' },
  { id: 'bkk-07', nameTh: 'ปทุมวัน', nameEn: 'Pathum Wan', lat: 13.7444, lng: 100.5342, postalCode: '10330' },
  { id: 'bkk-08', nameTh: 'ป้อมปราบศัตรูพ่าย', nameEn: 'Pom Prap Sattru Phai', lat: 13.7580, lng: 100.5103, postalCode: '10100' },
  { id: 'bkk-09', nameTh: 'พระโขนง', nameEn: 'Phra Khanong', lat: 13.7022, lng: 100.6017, postalCode: '10260' },
  { id: 'bkk-10', nameTh: 'มีนบุรี', nameEn: 'Min Buri', lat: 13.8139, lng: 100.7480, postalCode: '10510' },
  { id: 'bkk-11', nameTh: 'ลาดกระบัง', nameEn: 'Lat Krabang', lat: 13.7225, lng: 100.7818, postalCode: '10520' },
  { id: 'bkk-12', nameTh: 'ยานนาวา', nameEn: 'Yan Nawa', lat: 13.7001, lng: 100.5401, postalCode: '10120' },
  { id: 'bkk-13', nameTh: 'สัมพันธวงศ์', nameEn: 'Samphanthawong', lat: 13.7388, lng: 100.5108, postalCode: '10100' },
  { id: 'bkk-14', nameTh: 'พญาไท', nameEn: 'Phaya Thai', lat: 13.7801, lng: 100.5427, postalCode: '10400' },
  { id: 'bkk-15', nameTh: 'ธนบุรี', nameEn: 'Thon Buri', lat: 13.7250, lng: 100.4858, postalCode: '10600' },
  { id: 'bkk-16', nameTh: 'บางกอกใหญ่', nameEn: 'Bangkok Yai', lat: 13.7228, lng: 100.4744, postalCode: '10600' },
  { id: 'bkk-17', nameTh: 'ห้วยขวาง', nameEn: 'Huai Khwang', lat: 13.7784, lng: 100.5750, postalCode: '10310' },
  { id: 'bkk-18', nameTh: 'คลองสาน', nameEn: 'Khlong San', lat: 13.7303, lng: 100.5050, postalCode: '10600' },
  { id: 'bkk-19', nameTh: 'ตลิ่งชัน', nameEn: 'Taling Chan', lat: 13.7769, lng: 100.4566, postalCode: '10170' },
  { id: 'bkk-20', nameTh: 'บางกอกน้อย', nameEn: 'Bangkok Noi', lat: 13.7709, lng: 100.4678, postalCode: '10700' },
  { id: 'bkk-21', nameTh: 'บางขุนเทียน', nameEn: 'Bang Khun Thian', lat: 13.6608, lng: 100.4358, postalCode: '10150' },
  { id: 'bkk-22', nameTh: 'ภาษีเจริญ', nameEn: 'Phasi Charoen', lat: 13.7147, lng: 100.4358, postalCode: '10160' },
  { id: 'bkk-23', nameTh: 'หนองแขม', nameEn: 'Nong Khaem', lat: 13.7047, lng: 100.3491, postalCode: '10160' },
  { id: 'bkk-24', nameTh: 'ราษฎร์บูรณะ', nameEn: 'Rat Burana', lat: 13.6822, lng: 100.5055, postalCode: '10140' },
  { id: 'bkk-25', nameTh: 'บางพลัด', nameEn: 'Bang Phlat', lat: 13.7939, lng: 100.4950, postalCode: '10700' },
  { id: 'bkk-26', nameTh: 'ดินแดง', nameEn: 'Din Daeng', lat: 13.7699, lng: 100.5532, postalCode: '10400' },
  { id: 'bkk-27', nameTh: 'บึงกุ่ม', nameEn: 'Bueng Kum', lat: 13.7853, lng: 100.6691, postalCode: '10240' },
  { id: 'bkk-28', nameTh: 'สาทร', nameEn: 'Sathon', lat: 13.7081, lng: 100.5264, postalCode: '10120' },
  { id: 'bkk-29', nameTh: 'บางซื่อ', nameEn: 'Bang Sue', lat: 13.8099, lng: 100.5372, postalCode: '10800' },
  { id: 'bkk-30', nameTh: 'จตุจักร', nameEn: 'Chatuchak', lat: 13.8286, lng: 100.5599, postalCode: '10900' },
  { id: 'bkk-31', nameTh: 'บางคอแหลม', nameEn: 'Bang Kho Laem', lat: 13.6933, lng: 100.5025, postalCode: '10120' },
  { id: 'bkk-32', nameTh: 'ประเวศ', nameEn: 'Prawet', lat: 13.7169, lng: 100.6947, postalCode: '10250' },
  { id: 'bkk-33', nameTh: 'คลองเตย', nameEn: 'Khlong Toei', lat: 13.7081, lng: 100.5839, postalCode: '10110' },
  { id: 'bkk-34', nameTh: 'สวนหลวง', nameEn: 'Suan Luang', lat: 13.7303, lng: 100.6517, postalCode: '10250' },
  { id: 'bkk-35', nameTh: 'จอมทอง', nameEn: 'Chom Thong', lat: 13.6772, lng: 100.4847, postalCode: '10150' },
  { id: 'bkk-36', nameTh: 'ดอนเมือง', nameEn: 'Don Mueang', lat: 13.9131, lng: 100.5897, postalCode: '10210' },
  { id: 'bkk-37', nameTh: 'ราชเทวี', nameEn: 'Ratchathewi', lat: 13.7589, lng: 100.5344, postalCode: '10400' },
  { id: 'bkk-38', nameTh: 'ลาดพร้าว', nameEn: 'Lat Phrao', lat: 13.8036, lng: 100.6075, postalCode: '10230' },
  { id: 'bkk-39', nameTh: 'วัฒนา', nameEn: 'Watthana', lat: 13.7422, lng: 100.5858, postalCode: '10110' },
  { id: 'bkk-40', nameTh: 'บางแค', nameEn: 'Bang Khae', lat: 13.6961, lng: 100.4072, postalCode: '10160' },
  { id: 'bkk-41', nameTh: 'หลักสี่', nameEn: 'Lak Si', lat: 13.8875, lng: 100.5789, postalCode: '10210' },
  { id: 'bkk-42', nameTh: 'สายไหม', nameEn: 'Sai Mai', lat: 13.9197, lng: 100.6458, postalCode: '10220' },
  { id: 'bkk-43', nameTh: 'คันนายาว', nameEn: 'Khan Na Yao', lat: 13.8272, lng: 100.6797, postalCode: '10230' },
  { id: 'bkk-44', nameTh: 'สะพานสูง', nameEn: 'Saphan Sung', lat: 13.7700, lng: 100.6847, postalCode: '10240' },
  { id: 'bkk-45', nameTh: 'วังทองหลาง', nameEn: 'Wang Thonglang', lat: 13.7864, lng: 100.6083, postalCode: '10310' },
  { id: 'bkk-46', nameTh: 'คลองสามวา', nameEn: 'Khlong Sam Wa', lat: 13.8597, lng: 100.7042, postalCode: '10510' },
  { id: 'bkk-47', nameTh: 'บางนา', nameEn: 'Bang Na', lat: 13.6681, lng: 100.6047, postalCode: '10260' },
  { id: 'bkk-48', nameTh: 'ทวีวัฒนา', nameEn: 'Thawi Watthana', lat: 13.7878, lng: 100.3542, postalCode: '10170' },
  { id: 'bkk-49', nameTh: 'ทุ่งครุ', nameEn: 'Thung Khru', lat: 13.6472, lng: 100.5050, postalCode: '10140' },
  { id: 'bkk-50', nameTh: 'บางบอน', nameEn: 'Bang Bon', lat: 13.6592, lng: 100.3992, postalCode: '10150' },
];

// 2. Bangkok Major Canal Telemetry Stations (BMA Drainage and Sewerage Dept)
export const BANGKOK_CANAL_STATIONS: CanalWaterStation[] = [
  {
    id: 'canal-saen-saep-asok',
    name: 'ประตูระบายน้ำคลองแสนแสบ (ตอนอโศก)',
    canalName: 'คลองแสนแสบ',
    district: 'วัฒนา / ราชเทวี',
    lat: 13.7495,
    lng: 100.5630,
    waterLevelMsl: 0.12,
    bankLevelMsl: 1.20,
    status: 'NORMAL',
    statusTh: 'ระดับน้ำปกติ',
    trend: 'STABLE',
    trendTh: 'ทรงตัว',
    flowRateCubicM: 18.4,
    lastUpdated: 'Live BMA Telemetry',
  },
  {
    id: 'canal-saen-saep-bang-kapi',
    name: 'สถานีวัดระดับน้ำคลองแสนแสบ (เดอะมอลล์บางกะปิ)',
    canalName: 'คลองแสนแสบ',
    district: 'บางกะปิ',
    lat: 13.7661,
    lng: 100.6433,
    waterLevelMsl: 0.35,
    bankLevelMsl: 1.15,
    status: 'NORMAL',
    statusTh: 'ระดับน้ำปกติ',
    trend: 'FALLING',
    trendTh: 'ลดลง',
    flowRateCubicM: 22.0,
    lastUpdated: 'Live BMA Telemetry',
  },
  {
    id: 'canal-lat-phrao-chok-chai-4',
    name: 'สถานีวัดระดับน้ำคลองลาดพร้าว (โชคชัย 4)',
    canalName: 'คลองลาดพร้าว',
    district: 'ลาดพร้าว / วังทองหลาง',
    lat: 13.7998,
    lng: 100.5986,
    waterLevelMsl: 0.68,
    bankLevelMsl: 1.10,
    status: 'WARNING',
    statusTh: 'เฝ้าระวังระดับน้ำ',
    trend: 'RISING',
    trendTh: 'เพิ่มขึ้นช้าๆ',
    flowRateCubicM: 34.2,
    lastUpdated: 'Live BMA Telemetry',
  },
  {
    id: 'canal-prem-prachakon-lak-si',
    name: 'สถานีสูบน้ำคลองเปรมประชากร (ตอนหลักสี่)',
    canalName: 'คลองเปรมประชากร',
    district: 'หลักสี่',
    lat: 13.8821,
    lng: 100.5847,
    waterLevelMsl: 0.42,
    bankLevelMsl: 1.25,
    status: 'NORMAL',
    statusTh: 'ระดับน้ำปกติ',
    trend: 'STABLE',
    trendTh: 'ทรงตัว',
    flowRateCubicM: 15.1,
    lastUpdated: 'Live BMA Telemetry',
  },
  {
    id: 'canal-bang-khen-wiphavadi',
    name: 'ประตูระบายน้ำคลองบางเขน (วิภาวดีรังสิต)',
    canalName: 'คลองบางเขน',
    district: 'จตุจักร / บางเขน',
    lat: 13.8475,
    lng: 100.5686,
    waterLevelMsl: 0.55,
    bankLevelMsl: 1.18,
    status: 'NORMAL',
    statusTh: 'ระดับน้ำปกติ',
    trend: 'FALLING',
    trendTh: 'ลดลง',
    flowRateCubicM: 28.0,
    lastUpdated: 'Live BMA Telemetry',
  },
  {
    id: 'canal-bangkok-yai-talat-phlu',
    name: 'สถานีวัดน้ำคลองบางกอกใหญ่ (ตลาดพลู)',
    canalName: 'คลองบางกอกใหญ่',
    district: 'ธนบุรี',
    lat: 13.7222,
    lng: 100.4772,
    waterLevelMsl: 0.28,
    bankLevelMsl: 1.30,
    status: 'NORMAL',
    statusTh: 'ระดับน้ำปกติ',
    trend: 'STABLE',
    trendTh: 'ทรงตัว',
    flowRateCubicM: 19.8,
    lastUpdated: 'Live BMA Telemetry',
  },
  {
    id: 'canal-thawi-watthana-salaya',
    name: 'ประตูระบายน้ำคลองทวีวัฒนา (ตอนบน)',
    canalName: 'คลองทวีวัฒนา',
    district: 'ทวีวัฒนา',
    lat: 13.7915,
    lng: 100.3458,
    waterLevelMsl: 0.38,
    bankLevelMsl: 1.40,
    status: 'NORMAL',
    statusTh: 'ระดับน้ำปกติ',
    trend: 'STABLE',
    trendTh: 'ทรงตัว',
    flowRateCubicM: 12.0,
    lastUpdated: 'Live BMA Telemetry',
  },
  {
    id: 'canal-prawet-phra-khanong',
    name: 'สถานีสูบน้ำคลองพระโขนง (อุโมงค์ยักษ์พระโขนง)',
    canalName: 'คลองพระโขนง / คลองประเวศ',
    district: 'คลองเตย / พระโขนง',
    lat: 13.7122,
    lng: 100.5925,
    waterLevelMsl: -0.15,
    bankLevelMsl: 1.50,
    status: 'NORMAL',
    statusTh: 'ระดับน้ำต่ำ (พร่องน้ำเต็มพิกัด)',
    trend: 'FALLING',
    trendTh: 'เร่งสูบออกเจ้าพระยา',
    flowRateCubicM: 95.0,
    lastUpdated: 'Live BMA Telemetry',
  },
  {
    id: 'canal-tan-ramkhamhaeng',
    name: 'สถานีวัดระดับน้ำคลองตัน (รามคำแหง)',
    canalName: 'คลองตัน',
    district: 'สวนหลวง',
    lat: 13.7428,
    lng: 100.6015,
    waterLevelMsl: 0.45,
    bankLevelMsl: 1.15,
    status: 'NORMAL',
    statusTh: 'ระดับน้ำปกติ',
    trend: 'STABLE',
    trendTh: 'ทรงตัว',
    flowRateCubicM: 20.5,
    lastUpdated: 'Live BMA Telemetry',
  },
];

// 3. Bangkok Real-Time Air Quality & PM2.5 Monitoring Stations (BMA / PCD Network)
export const BANGKOK_PM25_STATIONS: AirQualityStation[] = [
  {
    id: 'aqi-pathumwan',
    stationName: 'สถานีตรวจวัดเขตปทุมวัน (สยาม / จุฬาฯ)',
    district: 'ปทุมวัน',
    lat: 13.7456,
    lng: 100.5312,
    pm25: 18.5,
    aqi: 38,
    status: 'VERY_GOOD',
    statusTh: 'คุณภาพอากาศดีมาก',
    colorHex: '#38bdf8',
    healthAdviceTh: 'เหมาะสำหรับกิจกรรมกลางแจ้งและการท่องเที่ยว',
    temperatureC: 31.2,
    humidityPct: 68,
    lastUpdated: '10 นาทีที่แล้ว',
  },
  {
    id: 'aqi-bangna',
    stationName: 'สถานีตรวจวัดเขตบางนา (สี่แยกบางนา-ตราด)',
    district: 'บางนา',
    lat: 13.6672,
    lng: 100.6058,
    pm25: 28.4,
    aqi: 54,
    status: 'GOOD',
    statusTh: 'คุณภาพอากาศดี',
    colorHex: '#22c55e',
    healthAdviceTh: 'ทำกิจกรรมกลางแจ้งได้ตามปกติ',
    temperatureC: 32.0,
    humidityPct: 65,
    lastUpdated: '12 นาทีที่แล้ว',
  },
  {
    id: 'aqi-chatuchak',
    stationName: 'สถานีตรวจวัดเขตจตุจักร (ห้าแยกลาดพร้าว)',
    district: 'จตุจักร',
    lat: 13.8155,
    lng: 100.5612,
    pm25: 32.1,
    aqi: 68,
    status: 'MODERATE',
    statusTh: 'คุณภาพอากาศปานกลาง',
    colorHex: '#eab308',
    healthAdviceTh: 'ผู้มีโรคประจำตัวระบบทางเดินหายใจควรสังเกตอาการ',
    temperatureC: 31.8,
    humidityPct: 70,
    lastUpdated: '8 นาทีที่แล้ว',
  },
  {
    id: 'aqi-din-daeng',
    stationName: 'สถานีตรวจวัดเขตดินแดง (อนุสาวรีย์ชัยฯ-มิตรไมตรี)',
    district: 'ดินแดง',
    lat: 13.7681,
    lng: 100.5512,
    pm25: 35.8,
    aqi: 76,
    status: 'MODERATE',
    statusTh: 'คุณภาพอากาศปานกลาง',
    colorHex: '#eab308',
    healthAdviceTh: 'ลดระยะเวลาทำกิจกรรมกลางแจ้งที่ใช้แรงมาก',
    temperatureC: 32.4,
    humidityPct: 64,
    lastUpdated: '15 นาทีที่แล้ว',
  },
  {
    id: 'aqi-sathon',
    stationName: 'สถานีตรวจวัดเขตสาทร (สาทร-นราธิวาส)',
    district: 'สาทร',
    lat: 13.7198,
    lng: 100.5312,
    pm25: 22.0,
    aqi: 46,
    status: 'GOOD',
    statusTh: 'คุณภาพอากาศดี',
    colorHex: '#22c55e',
    healthAdviceTh: 'อากาศดี สามารถออกกำลังกายกลางแจ้งได้',
    temperatureC: 31.5,
    humidityPct: 67,
    lastUpdated: '5 นาทีที่แล้ว',
  },
  {
    id: 'aqi-thonburi',
    stationName: 'สถานีตรวจวัดเขตธนบุรี (วงเวียนใหญ่)',
    district: 'ธนบุรี',
    lat: 13.7258,
    lng: 100.4895,
    pm25: 26.3,
    aqi: 52,
    status: 'GOOD',
    statusTh: 'คุณภาพอากาศดี',
    colorHex: '#22c55e',
    healthAdviceTh: 'ทำกิจกรรมกลางแจ้งได้ตามปกติ',
    temperatureC: 31.6,
    humidityPct: 71,
    lastUpdated: '14 นาทีที่แล้ว',
  },
  {
    id: 'aqi-bang-kapi',
    stationName: 'สถานีตรวจวัดเขตบางกะปิ (ลำสาลี)',
    district: 'บางกะปิ',
    lat: 13.7645,
    lng: 100.6488,
    pm25: 31.0,
    aqi: 64,
    status: 'MODERATE',
    statusTh: 'คุณภาพอากาศปานกลาง',
    colorHex: '#eab308',
    healthAdviceTh: 'ประชาชนทั่วไปทำกิจกรรมได้ตามปกติ',
    temperatureC: 32.1,
    humidityPct: 66,
    lastUpdated: '9 นาทีที่แล้ว',
  },
  {
    id: 'aqi-don-mueang',
    stationName: 'สถานีตรวจวัดเขตดอนเมือง (วิภาวดีรังสิต)',
    district: 'ดอนเมือง',
    lat: 13.9112,
    lng: 100.5945,
    pm25: 29.8,
    aqi: 61,
    status: 'GOOD',
    statusTh: 'คุณภาพอากาศปานกลาง',
    colorHex: '#22c55e',
    healthAdviceTh: 'อากาศอยู่ในเกณฑ์ยอมรับได้',
    temperatureC: 32.3,
    humidityPct: 63,
    lastUpdated: '11 นาทีที่แล้ว',
  },
];

// 4. Bangkok Emergency & Rescue Hotlines Directory
export const BANGKOK_EMERGENCY_HOTLINES: EmergencyHotline[] = [
  {
    number: '199',
    agencyTh: 'สถานีดับเพลิงและกู้ภัย กทม.',
    agencyEn: 'Bangkok Fire & Rescue Department',
    category: 'DISASTER',
    descriptionTh: 'ระงับอัคคีภัย สัตว์มีพิษเข้าบ้าน ช่วยเหลือภัยพิบัติใน กทม.',
    availableHours: '24 ชั่วโมง (ฟรี)',
  },
  {
    number: '1669',
    agencyTh: 'ศูนย์เอราวัณ สำนักการแพทย์ กทม.',
    agencyEn: 'Erawan Medical Emergency Center',
    category: 'MEDICAL',
    descriptionTh: 'เจ็บป่วยฉุกเฉิน อุบัติเหตุรุนแรง พร้อมส่งรถพยาบาลฉุกเฉินทันที',
    availableHours: '24 ชั่วโมง (ฟรี)',
  },
  {
    number: '1197',
    agencyTh: 'ศูนย์ควบคุมและสั่งการจราจร (บก.จร.)',
    agencyEn: 'Traffic Control and Command Center',
    category: 'TRAFFIC',
    descriptionTh: 'แจ้งอุบัติเหตุทางถนน สอบถามเส้นทาง สภาพการจราจร กทม.',
    availableHours: '24 ชั่วโมง',
  },
  {
    number: '1555',
    agencyTh: 'สายด่วน กทม. 24 ชั่วโมง',
    agencyEn: 'Bangkok Metropolitan Administration (BMA) Hotline',
    category: 'MUNICIPAL',
    descriptionTh: 'แจ้งปัญหาน้ำท่วมขัง ท่อระบายน้ำอุดตัน ไฟฟ้าสาธารณะดับ เรื่องร้องทุกข์ กทม.',
    availableHours: '24 ชั่วโมง',
  },
  {
    number: '191',
    agencyTh: 'ศูนย์รับแจ้งเหตุด่วนเหตุร้าย กองบัญชาการตำรวจนครบาล',
    agencyEn: 'National Police Emergency Operations',
    category: 'POLICE',
    descriptionTh: 'เหตุด่วน เหตุร้าย โจรกรรม ความปลอดภัยในชีวิตและทรัพย์สิน',
    availableHours: '24 ชั่วโมง (ฟรี)',
  },
  {
    number: '1784',
    agencyTh: 'กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)',
    agencyEn: 'Department of Disaster Prevention and Mitigation (DDPM)',
    category: 'DISASTER',
    descriptionTh: 'แจ้งสาธารณภัย อุทกภัย วาตภัย และภัยธรรมชาติขนาดใหญ่',
    availableHours: '24 ชั่วโมง',
  },
  {
    number: '1155',
    agencyTh: 'ตำรวจท่องเที่ยว (Tourist Police)',
    agencyEn: 'Tourist Police Bureau',
    category: 'POLICE',
    descriptionTh: 'ดูแลความปลอดภัยชาวต่างชาติและนักท่องเที่ยวในเขต กทม.',
    availableHours: '24 ชั่วโมง (Multilingual)',
  },
];

// 5. Bangkok Flood Evacuation Shelters & High-Ground Parking Points
export interface BangkokShelter {
  id: string;
  name: string;
  type: 'SHELTER' | 'PARKING_HIGH_GROUND';
  district: string;
  lat: number;
  lng: number;
  capacityPeople: number;
  parkingSpots: number;
  elevationMsl: number; // Meters above MSL
  amenities: string[];
  contactTel: string;
}

export const BANGKOK_SHELTERS: BangkokShelter[] = [
  {
    id: 'shelter-thai-japan',
    name: 'ศูนย์เยาวชนกรุงเทพมหานคร (ไทย-ญี่ปุ่น ดินแดง)',
    type: 'SHELTER',
    district: 'ดินแดง',
    lat: 13.7661,
    lng: 100.5542,
    capacityPeople: 1500,
    parkingSpots: 350,
    elevationMsl: 3.2,
    amenities: ['ห้องพยาบาลฉุกเฉิน', 'โรงครัวพระราชทาน', 'จุดชาร์จไฟสำรอง'],
    contactTel: '02-245-4743',
  },
  {
    id: 'shelter-bangkok-arena',
    name: 'ศูนย์กีฬาบางกอกอารีนา (หนองจอก)',
    type: 'SHELTER',
    district: 'หนองจอก',
    lat: 13.8552,
    lng: 100.8625,
    capacityPeople: 3000,
    parkingSpots: 800,
    elevationMsl: 3.5,
    amenities: ['อาคารปรับอากาศ', 'เตียงพับสนาม', 'ระบบผลิตน้ำดื่มสะอาด'],
    contactTel: '02-136-8300',
  },
  {
    id: 'shelter-benjakitti',
    name: 'อาคารกีฬาและที่จอดรถสวนเบญจกิติ',
    type: 'PARKING_HIGH_GROUND',
    district: 'คลองเตย',
    lat: 13.7301,
    lng: 100.5582,
    capacityPeople: 800,
    parkingSpots: 600,
    elevationMsl: 4.1,
    amenities: ['อาคารจอดรถยกสูง', 'ไฟสำรอง', 'รปภ. 24 ชม.'],
    contactTel: '02-254-1263',
  },
  {
    id: 'shelter-mrt-lat-phrao',
    name: 'อาคารจอดแล้วจร MRT ลาดพร้าว (9 ชั้นยกสูง)',
    type: 'PARKING_HIGH_GROUND',
    district: 'จตุจักร',
    lat: 13.8066,
    lng: 100.5739,
    capacityPeople: 500,
    parkingSpots: 2200,
    elevationMsl: 5.5,
    amenities: ['อาคารคอนกรีตสูง 9 ชั้น', 'กล้อง CCTV ทุกชั้น', 'เข้าสู่ระบบรถไฟฟ้า'],
    contactTel: '02-716-4000',
  },
  {
    id: 'shelter-chon-prathan',
    name: 'หอประชุมโรงเรียนชลประทานวิทยา (ปากเกร็ด/นนทบุรีเชื่อมต่อ กทม.)',
    type: 'SHELTER',
    district: 'เขตเชื่อมต่อตอนเหนือ',
    lat: 13.8967,
    lng: 100.5056,
    capacityPeople: 1200,
    parkingSpots: 250,
    elevationMsl: 3.8,
    amenities: ['พื้นที่ยกพื้นสูง', 'ทีมแพทย์ปฐมพยาบาล'],
    contactTel: '02-583-7033',
  },
  {
    id: 'shelter-thawi-watthana',
    name: 'ศูนย์พัฒนาบุคลากรกรุงเทพมหานคร (ทวีวัฒนา)',
    type: 'SHELTER',
    district: 'ทวีวัฒนา',
    lat: 13.7825,
    lng: 100.3512,
    capacityPeople: 1000,
    parkingSpots: 300,
    elevationMsl: 3.6,
    amenities: ['อาคารพักอาศัย', 'ห้องน้ำรวมแยกชายหญิง', 'ที่จอดรถยกสูง'],
    contactTel: '02-441-4700',
  },
];
