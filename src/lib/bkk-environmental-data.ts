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

// 5. Bangkok Mobile Flood Pump Truck Deployments (หน่วยเบสท์ กทม. เครื่องสูบน้ำเคลื่อนที่)
export interface PumpTruckUnit {
  id: string;
  unitCode: string;
  locationName: string;
  district: string;
  lat: number;
  lng: number;
  pumpCapacityLps: number; // ลิตร/วินาที
  status: 'PUMPING' | 'STANDBY' | 'MAINTENANCE';
  statusTh: string;
  dischargingTo: string;
  officerInCharge: string;
  contactTel: string;
  lastUpdated: string;
}

export const BANGKOK_PUMP_TRUCKS: PumpTruckUnit[] = [
  {
    id: 'pump-ratchada-latphrao',
    unitCode: 'BEST-UNIT-01',
    locationName: 'แยกรัชดาภิเษก-ลาดพร้าว (หน้าอาคารจอดแล้วจร MRT)',
    district: 'จตุจักร',
    lat: 13.8058,
    lng: 100.5745,
    pumpCapacityLps: 800,
    status: 'PUMPING',
    statusTh: 'กำลังเดินเครื่องสูบน้ำระบายลงคลองบางซื่อ',
    dischargingTo: 'คลองบางซื่อ',
    officerInCharge: 'นายช่างประจำจุด: หน่วยเบสท์เขตจตุจักร',
    contactTel: '02-513-3444',
    lastUpdated: '10 นาทีที่แล้ว',
  },
  {
    id: 'pump-bang-khen-circle',
    unitCode: 'BEST-UNIT-02',
    locationName: 'วงเวียนบางเขน (อนุสาวรีย์พิทักษ์รัฐธรรมนูญ หน้าวัดพระศรีฯ)',
    district: 'บางเขน',
    lat: 13.8741,
    lng: 100.5968,
    pumpCapacityLps: 1200,
    status: 'PUMPING',
    statusTh: 'เดินเครื่องสูบเต็มกำลังเพื่อเปิดผิวจราจร',
    dischargingTo: 'คลองรางบัว / คลองถนน',
    officerInCharge: 'หน่วยปฏิบัติการเร่งด่วนบางเขน',
    contactTel: '02-521-0066',
    lastUpdated: '5 นาทีที่แล้ว',
  },
  {
    id: 'pump-srinakarin-lamsalee',
    unitCode: 'BEST-UNIT-03',
    locationName: 'ถนนศรีนครินทร์ (แยกลำสาลี เชื่อมต่อรามคำแหง)',
    district: 'บางกะปิ',
    lat: 13.7635,
    lng: 100.6452,
    pumpCapacityLps: 1000,
    status: 'PUMPING',
    statusTh: 'สูบน้ำขังผิวถนนระบายลงคลองแสนแสบ',
    dischargingTo: 'คลองแสนแสบ',
    officerInCharge: 'ศูนย์ระบายน้ำบางกะปิ',
    contactTel: '02-377-5494',
    lastUpdated: '8 นาทีที่แล้ว',
  },
  {
    id: 'pump-chaeng-watthana',
    unitCode: 'BEST-UNIT-04',
    locationName: 'ถนนแจ้งวัฒนะ (หน้าศูนย์ราชการ - ศาลปกครอง)',
    district: 'หลักสี่',
    lat: 13.8925,
    lng: 100.5645,
    pumpCapacityLps: 900,
    status: 'STANDBY',
    statusTh: 'สแตนด์บายพร้อมสูบ ผิวถนนแห้งปกติ',
    dischargingTo: 'คลองเปรมประชากร',
    officerInCharge: 'หน่วยบรรเทาอุทกภัยหลักสี่',
    contactTel: '02-576-1393',
    lastUpdated: '15 นาทีที่แล้ว',
  },
  {
    id: 'pump-pattanakarn',
    unitCode: 'BEST-UNIT-05',
    locationName: 'ถนนพัฒนาการ (บริเวณจุดตัดคลองลาว)',
    district: 'สวนหลวง',
    lat: 13.7335,
    lng: 100.6385,
    pumpCapacityLps: 750,
    status: 'STANDBY',
    statusTh: 'ประจำจุดเฝ้าระวังระดับน้ำคลอง',
    dischargingTo: 'คลองลาว / คลองประเวศ',
    officerInCharge: 'หน่วยเคลื่อนที่เร็วสวนหลวง',
    contactTel: '02-322-6483',
    lastUpdated: '12 นาทีที่แล้ว',
  },
  {
    id: 'pump-sukhumvit-71',
    unitCode: 'BEST-UNIT-06',
    locationName: 'ถนนสุขุมวิท 71 (ปรีดี พนมยงค์ เชื่อมคลองตัน)',
    district: 'วัฒนา',
    lat: 13.7155,
    lng: 100.5925,
    pumpCapacityLps: 850,
    status: 'PUMPING',
    statusTh: 'เร่งสูบระบายน้ำขังช่วงซอยปรีดี 14-26',
    dischargingTo: 'คลองพระโขนง',
    officerInCharge: 'หน่วยสูบน้ำเคลื่อนที่วัฒนา',
    contactTel: '02-381-8930',
    lastUpdated: '6 นาทีที่แล้ว',
  },
];

// 6. Bangkok Sandbag Distribution Points & Municipal Relief Depots (จุดแจกกระสอบทรายและศูนย์บรรเทาภัย 50 เขต)
export interface DistrictReliefDepot {
  id: string;
  district: string;
  officeName: string;
  lat: number;
  lng: number;
  sandbagStock: number;
  sandbagStatus: 'AVAILABLE' | 'LIMITED' | 'DEPLETED';
  sandbagStatusTh: string;
  contactTel: string;
  services: string[];
}

export const BANGKOK_RELIEF_DEPOTS: DistrictReliefDepot[] = [
  {
    id: 'depot-chatuchak',
    district: 'จตุจักร',
    officeName: 'สำนักงานเขตจตุจักร (ฝ่ายโยธาและบรรเทาสาธารณภัย)',
    lat: 13.8286,
    lng: 100.5599,
    sandbagStock: 4500,
    sandbagStatus: 'AVAILABLE',
    sandbagStatusTh: 'มีกระสอบทรายพร้อมแจกจ่าย',
    contactTel: '02-513-3444',
    services: ['แจกกระสอบทรายฟรี (นำบัตร ปชช. มาแสดง)', 'บริการรถยกสูงรับส่งน้ำท่วม', 'หน่วยตัดกิ่งไม้ล้ม'],
  },
  {
    id: 'depot-bang-khen',
    district: 'บางเขน',
    officeName: 'สำนักงานเขตบางเขน (ศูนย์บริการประชาชน)',
    lat: 13.8738,
    lng: 100.5967,
    sandbagStock: 3200,
    sandbagStatus: 'AVAILABLE',
    sandbagStatusTh: 'มีกระสอบทรายพร้อมแจกจ่าย',
    contactTel: '02-521-0066',
    services: ['แจกกระสอบทราย', 'แจกถุงยังชีพผู้ประสบอุทกภัย', 'ศูนย์พักพิงชั่วคราว'],
  },
  {
    id: 'depot-phra-khanong',
    district: 'พระโขนง',
    officeName: 'สำนักงานเขตพระโขนง (ศูนย์ปฏิบัติการป้องกันน้ำท่วม)',
    lat: 13.7022,
    lng: 100.6017,
    sandbagStock: 1800,
    sandbagStatus: 'LIMITED',
    sandbagStatusTh: 'กระสอบทรายเหลือน้อย (จำกัดบ้านละ 10 กระสอบ)',
    contactTel: '02-310-4100',
    services: ['แจกกระสอบทรายจำกัดจำนวน', 'หน่วยเคลื่อนที่เร็วดึงน้ำออกจากซอย'],
  },
  {
    id: 'depot-din-daeng',
    district: 'ดินแดง',
    officeName: 'สำนักงานเขตดินแดง (ศูนย์ช่วยเหลือผู้ประสบภัย)',
    lat: 13.7699,
    lng: 100.5532,
    sandbagStock: 5000,
    sandbagStatus: 'AVAILABLE',
    sandbagStatusTh: 'มีกระสอบทรายพร้อมแจกจ่าย',
    contactTel: '02-245-1568',
    services: ['แจกกระสอบทราย', 'ศูนย์ประสานงานเครื่องสูบน้ำเข้าซอย', 'ศูนย์ปฐมพยาบาล'],
  },
  {
    id: 'depot-min-buri',
    district: 'มีนบุรี',
    officeName: 'สำนักงานเขตมีนบุรี (จุดบริการประชาชนริมคลองแสนแสบ)',
    lat: 13.8139,
    lng: 100.7480,
    sandbagStock: 6000,
    sandbagStatus: 'AVAILABLE',
    sandbagStatusTh: 'มีกระสอบทรายพร้อมแจกจ่ายจำนวนมาก',
    contactTel: '02-540-7156',
    services: ['แจกกระสอบทรายป้องกันคันกั้นน้ำล้น', 'บริการเรือท้องแบนรับส่งชาวบ้าน'],
  },
  {
    id: 'depot-thon-buri',
    district: 'ธนบุรี',
    officeName: 'สำนักงานเขตธนบุรี (ฝ่ายโยธา)',
    lat: 13.7250,
    lng: 100.4858,
    sandbagStock: 2500,
    sandbagStatus: 'AVAILABLE',
    sandbagStatusTh: 'มีกระสอบทรายพร้อมแจกจ่าย',
    contactTel: '02-465-0025',
    services: ['แจกกระสอบทราย', 'ตรวจสอบแนวกระสอบทรายริมแม่น้ำเจ้าพระยา'],
  },
];

// 7. Bangkok Major Emergency Trauma Centers & Flood Accessibility Telemetry
export interface HospitalReadiness {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  traumaLevel: 'LEVEL_1' | 'LEVEL_2';
  erBedStatus: 'AVAILABLE' | 'CONGESTED' | 'FULL';
  erBedStatusTh: string;
  floodBarrierMsl: number; // ความสูงคันกั้นน้ำ รทก.
  accessStatus: 'ALL_VEHICLES' | 'HIGH_CLEARANCE_ONLY' | 'BOAT_ONLY';
  accessStatusTh: string;
  emergencyTel: string;
  generatorBackupHours: number;
  oxygenSupplyDays: number;
  helipadReady: boolean;
  lastUpdated: string;
}

export const BANGKOK_HOSPITALS: HospitalReadiness[] = [
  {
    id: 'hosp-siriraj',
    name: 'โรงพยาบาลศิริราช (Siriraj Hospital)',
    district: 'บางกอกน้อย',
    lat: 13.7578,
    lng: 100.4855,
    traumaLevel: 'LEVEL_1',
    erBedStatus: 'AVAILABLE',
    erBedStatusTh: 'ห้องฉุกเฉินพร้อมรับผู้ป่วย',
    floodBarrierMsl: 3.2,
    accessStatus: 'ALL_VEHICLES',
    accessStatusTh: 'เข้าถึงได้ทุกยานพาหนะ (แนวเขื่อนเจ้าพระยาสูง)',
    emergencyTel: '02-419-7000',
    generatorBackupHours: 120,
    oxygenSupplyDays: 14,
    helipadReady: true,
    lastUpdated: 'Live Telemetry',
  },
  {
    id: 'hosp-chulalongkorn',
    name: 'โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย',
    district: 'ปทุมวัน',
    lat: 13.7314,
    lng: 100.5342,
    traumaLevel: 'LEVEL_1',
    erBedStatus: 'AVAILABLE',
    erBedStatusTh: 'ห้องฉุกเฉินพร้อมรับผู้ป่วยวิกฤต',
    floodBarrierMsl: 2.8,
    accessStatus: 'ALL_VEHICLES',
    accessStatusTh: 'ถนนพระราม 4 และอังรีดูนังต์สัญจรได้ปกติ',
    emergencyTel: '02-256-4000',
    generatorBackupHours: 96,
    oxygenSupplyDays: 20,
    helipadReady: true,
    lastUpdated: 'Live Telemetry',
  },
  {
    id: 'hosp-ramathibodi',
    name: 'โรงพยาบาลรามาธิบดี',
    district: 'ราชเทวี',
    lat: 13.7668,
    lng: 100.5262,
    traumaLevel: 'LEVEL_1',
    erBedStatus: 'AVAILABLE',
    erBedStatusTh: 'พร้อมรับผู้ป่วยอุบัติเหตุและฉุกเฉิน',
    floodBarrierMsl: 2.5,
    accessStatus: 'ALL_VEHICLES',
    accessStatusTh: 'ถนนพระราม 6 สัญจรได้ปกติ',
    emergencyTel: '02-201-1000',
    generatorBackupHours: 72,
    oxygenSupplyDays: 10,
    helipadReady: true,
    lastUpdated: 'Live Telemetry',
  },
  {
    id: 'hosp-rajavithi',
    name: 'โรงพยาบาลราชวิถี (อนุสาวรีย์ชัยสมรภูมิ)',
    district: 'ราชเทวี',
    lat: 13.7652,
    lng: 100.5378,
    traumaLevel: 'LEVEL_1',
    erBedStatus: 'CONGESTED',
    erBedStatusTh: 'ผู้ป่วยฉุกเฉินหนาแน่น',
    floodBarrierMsl: 2.4,
    accessStatus: 'ALL_VEHICLES',
    accessStatusTh: 'ทางลาดเชื่อมต่อสะพานข้ามแยกเข้าถึงได้',
    emergencyTel: '02-206-2900',
    generatorBackupHours: 72,
    oxygenSupplyDays: 12,
    helipadReady: false,
    lastUpdated: 'Live Telemetry',
  },
  {
    id: 'hosp-police',
    name: 'โรงพยาบาลตำรวจ (แยกราชประสงค์)',
    district: 'ปทุมวัน',
    lat: 13.7438,
    lng: 100.5395,
    traumaLevel: 'LEVEL_1',
    erBedStatus: 'AVAILABLE',
    erBedStatusTh: 'ห้องฉุกเฉินเปิดบริการ 24 ชม.',
    floodBarrierMsl: 2.6,
    accessStatus: 'ALL_VEHICLES',
    accessStatusTh: 'ถนนพระราม 1 สัญจรได้ปกติ',
    emergencyTel: '02-207-6000',
    generatorBackupHours: 48,
    oxygenSupplyDays: 7,
    helipadReady: true,
    lastUpdated: 'Live Telemetry',
  },
  {
    id: 'hosp-taksin',
    name: 'โรงพยาบาลตากสิน (สำนักการแพทย์ กทม.)',
    district: 'คลองสาน',
    lat: 13.7310,
    lng: 100.5078,
    traumaLevel: 'LEVEL_2',
    erBedStatus: 'AVAILABLE',
    erBedStatusTh: 'ศูนย์อุบัติเหตุฝั่งธนบุรีพร้อมปฏิบัติการ',
    floodBarrierMsl: 3.0,
    accessStatus: 'ALL_VEHICLES',
    accessStatusTh: 'แนวคันกั้นน้ำคลองสานแข็งแรง',
    emergencyTel: '02-437-0123',
    generatorBackupHours: 60,
    oxygenSupplyDays: 8,
    helipadReady: false,
    lastUpdated: 'Live Telemetry',
  },
  {
    id: 'hosp-bangkhen-bma',
    name: 'โรงพยาบาลภูมิพลอดุลยเดช พอ.',
    district: 'สายไหม',
    lat: 13.9100,
    lng: 100.6212,
    traumaLevel: 'LEVEL_1',
    erBedStatus: 'AVAILABLE',
    erBedStatusTh: 'ศูนย์การแพทย์ฉุกเฉินตอนเหนือ กทม.',
    floodBarrierMsl: 2.7,
    accessStatus: 'ALL_VEHICLES',
    accessStatusTh: 'ถนนพหลโยธินหน้า รพ. สัญจรได้',
    emergencyTel: '02-534-7000',
    generatorBackupHours: 120,
    oxygenSupplyDays: 14,
    helipadReady: true,
    lastUpdated: 'Live Telemetry',
  },
];

// 8. Bangkok Major Public Waterway Piers & Ferry Service Telemetry (เรือด่วนเจ้าพระยา / เรือคลองแสนแสบ / เรือไฟฟ้า)
export interface WaterwayPier {
  id: string;
  name: string;
  waterwayType: 'CHAO_PHRAYA_EXPRESS' | 'KHLONG_SAEN_SAEP' | 'KHLONG_PHADUNG';
  waterwayName: string;
  district: string;
  lat: number;
  lng: number;
  serviceStatus: 'NORMAL' | 'CAUTION_HIGH_TIDE' | 'SUSPENDED';
  serviceStatusTh: string;
  connectingTransit: string;
  currentWaveConditionTh: string;
  safetyAdviceTh: string;
  operatingHours: string;
}

export const BANGKOK_WATERWAYS: WaterwayPier[] = [
  {
    id: 'pier-sathorn',
    name: 'ท่าเรือสาทร (Central Pier Sathorn)',
    waterwayType: 'CHAO_PHRAYA_EXPRESS',
    waterwayName: 'แม่น้ำเจ้าพระยา',
    district: 'สาทร / บางรัก',
    lat: 13.7188,
    lng: 100.5135,
    serviceStatus: 'NORMAL',
    serviceStatusTh: 'เรือด่วนทุกธงเปิดบริการปกติ',
    connectingTransit: 'BTS สะพานตากสิน (สายสีลม)',
    currentWaveConditionTh: 'คลื่นผิวน้ำปกติ ทุ่นลอยปลอดภัย',
    safetyAdviceTh: 'ก้าวลงเรือด้วยความระมัดระวัง รอเรือจอดเทียบสนิทก่อนก้าว',
    operatingHours: '06:00 - 19:30 น.',
  },
  {
    id: 'pier-pratunam',
    name: 'ท่าเรือประตูน้ำ (จุดเชื่อมต่อตะวันออก-ตะวันตก)',
    waterwayType: 'KHLONG_SAEN_SAEP',
    waterwayName: 'คลองแสนแสบ',
    district: 'ปทุมวัน / ราชเทวี',
    lat: 13.7497,
    lng: 100.5407,
    serviceStatus: 'NORMAL',
    serviceStatusTh: 'เปิดให้บริการตามปกติทั้งสองฝั่ง',
    connectingTransit: 'แอร์พอร์ตลิงก์ ราชปรารภ / BTS ชิดลม',
    currentWaveConditionTh: 'ระดับน้ำคลองทรงตัว ลอดสะพานเฉลิมโลกได้ปลอดภัย',
    safetyAdviceTh: 'จับเชือกพยุงขณะลงเรือ ไม่ยืนบริเวณกราบเรือ',
    operatingHours: '05:30 - 20:00 น.',
  },
  {
    id: 'pier-asok',
    name: 'ท่าเรืออโศก (คลองแสนแสบ)',
    waterwayType: 'KHLONG_SAEN_SAEP',
    waterwayName: 'คลองแสนแสบ',
    district: 'วัฒนา / ราชเทวี',
    lat: 13.7492,
    lng: 100.5634,
    serviceStatus: 'NORMAL',
    serviceStatusTh: 'เรือโดยสารวิ่งปกติ',
    connectingTransit: 'MRT เพชรบุรี / ARL มักกะสัน',
    currentWaveConditionTh: 'ระดับน้ำคลองต่ำกว่าคานสะพาน 80 ซม.',
    safetyAdviceTh: 'ทางเชื่อมขึ้น MRT มีหลังคาคลุมกันฝน',
    operatingHours: '05:30 - 20:00 น.',
  },
  {
    id: 'pier-wang-lang',
    name: 'ท่าเรือพรานนก - วังหลัง (หน้า รพ.ศิริราช)',
    waterwayType: 'CHAO_PHRAYA_EXPRESS',
    waterwayName: 'แม่น้ำเจ้าพระยา',
    district: 'บางกอกน้อย',
    lat: 13.7554,
    lng: 100.4862,
    serviceStatus: 'CAUTION_HIGH_TIDE',
    serviceStatusTh: 'เฝ้าระวังช่วงน้ำทะเลหนุน',
    connectingTransit: 'รพ.ศิริราช / ตลาดวังหลัง',
    currentWaveConditionTh: 'คลื่นแรงปานกลางจากเรือโดยสารสัญจร',
    safetyAdviceTh: 'โป๊ะเทียบเรือปรับระดับตามน้ำ สวมชูชีพตามคำแนะนำเจ้าหน้าที่',
    operatingHours: '06:00 - 19:00 น.',
  },
  {
    id: 'pier-tha-chang',
    name: 'ท่าเรือท่าช้าง (พระบรมมหาราชวัง)',
    waterwayType: 'CHAO_PHRAYA_EXPRESS',
    waterwayName: 'แม่น้ำเจ้าพระยา',
    district: 'พระนคร',
    lat: 13.7525,
    lng: 100.4892,
    serviceStatus: 'NORMAL',
    serviceStatusTh: 'เรือด่วนและเรือข้ามฟากปกติ',
    connectingTransit: 'สนามหลวง / พระบรมมหาราชวัง',
    currentWaveConditionTh: 'อาคารเทียบเรือปรับปรุงใหม่ ทางลาดกันลื่นพร้อม',
    safetyAdviceTh: 'มีเจ้าหน้าที่กรมเจ้าท่าประจำจุดดูแลผู้โดยสาร',
    operatingHours: '06:00 - 19:30 น.',
  },
  {
    id: 'pier-hua-lamphong',
    name: 'ท่าเรือสถานีรถไฟหัวลำโพง (เรือไฟฟ้า EV)',
    waterwayType: 'KHLONG_PHADUNG',
    waterwayName: 'คลองผดุงกรุงเกษม',
    district: 'ปทุมวัน',
    lat: 13.7385,
    lng: 100.5165,
    serviceStatus: 'NORMAL',
    serviceStatusTh: 'เรือพลังงานสะอาด EV วิ่งฟรีตามรอบ',
    connectingTransit: 'MRT หัวลำโพง (สายสีน้ำเงิน)',
    currentWaveConditionTh: 'น้ำนิ่ง ไร้คลื่นรบกวน',
    safetyAdviceTh: 'รองรับวีลแชร์และผู้พิการ มีทางลาดขึ้นลงสะดวก',
    operatingHours: '06:00 - 19:00 น.',
  },
  {
    id: 'pier-bang-kapi',
    name: 'ท่าเรือเดอะมอลล์บางกะปิ',
    waterwayType: 'KHLONG_SAEN_SAEP',
    waterwayName: 'คลองแสนแสบ',
    district: 'บางกะปิ',
    lat: 13.7656,
    lng: 100.6438,
    serviceStatus: 'NORMAL',
    serviceStatusTh: 'เปิดให้บริการปกติ',
    connectingTransit: 'MRT สายสีเหลือง (สถานีบางกะปิ)',
    currentWaveConditionTh: 'ระดับน้ำปกติ ประตูระบายน้ำระบายต่อเนื่อง',
    safetyAdviceTh: 'ระวังลื่นช่วงฝนตก ทางเดินริมเขื่อนมีราวจับตลอดแนว',
    operatingHours: '05:30 - 19:30 น.',
  },
  {
    id: 'pier-nonthaburi',
    name: 'ท่าน้ำนนทบุรี (หอนาฬิกา)',
    waterwayType: 'CHAO_PHRAYA_EXPRESS',
    waterwayName: 'แม่น้ำเจ้าพระยา (ตอนเหนือ กทม.)',
    district: 'นนทบุรี (รอยต่อ กทม.)',
    lat: 13.8425,
    lng: 100.4905,
    serviceStatus: 'NORMAL',
    serviceStatusTh: 'ต้นสายเรือด่วนเจ้าพระยาเปิดปกติ',
    connectingTransit: 'รถสองแถวรอบเมือง / ตลาดท่าน้ำนนท์',
    currentWaveConditionTh: 'กระแสน้ำไหลแรงจากทิศเหนือ ทรงตัว',
    safetyAdviceTh: 'สวมชูชีพทันทีเมื่อลงเรือเที่ยวช่วงเย็น',
    operatingHours: '05:30 - 19:00 น.',
  },
];

// 9. Metropolitan Electricity Authority (MEA / กฟน.) High-Voltage Power Grid Substations Telemetry
export interface PowerSubstation {
  id: string;
  name: string;
  meaDistrict: string;
  voltageKv: string;
  lat: number;
  lng: number;
  floodBarrierMsl: number;
  status: 'ONLINE' | 'STANDBY_ALERT' | 'ISOLATED_SAFETY';
  statusTh: string;
  servicingZone: string;
  emergencyFeederReady: boolean;
  contactTel: string;
  safetyAdvisoryTh: string;
}

export const BANGKOK_POWER_SUBSTATIONS: PowerSubstation[] = [
  {
    id: 'sub-bang-kapi',
    name: 'สถานีไฟฟ้าแรงสูงบางกะปิ (MEA 230kV / 115kV Grid)',
    meaDistrict: 'เขตบางกะปิ / รามคำแหง',
    voltageKv: '230 kV',
    lat: 13.7665,
    lng: 100.6385,
    floodBarrierMsl: 3.1,
    status: 'ONLINE',
    statusTh: 'จ่ายกระแสไฟฟ้าปกติทุกหม้อแปลง',
    servicingZone: 'บางกะปิ, บึงกุ่ม, ลาดพร้าว, วังทองหลาง',
    emergencyFeederReady: true,
    contactTel: '1130',
    safetyAdvisoryTh: 'แนวคันกั้นน้ำสถานีสูง +3.1 ม. รทก. ป้องกันเครื่องแปลงไฟสมบูรณ์',
  },
  {
    id: 'sub-asok',
    name: 'สถานีไฟฟ้าย่อยอโศก (Asok GIS Substation)',
    meaDistrict: 'เขตวัฒนา / สุขุมวิท',
    voltageKv: '115 kV',
    lat: 13.7432,
    lng: 100.5621,
    floodBarrierMsl: 2.8,
    status: 'ONLINE',
    statusTh: 'ระบบแก๊สฉนวน GIS ในอาคารปลอดภัย 100%',
    servicingZone: 'สุขุมวิท 1-39, อโศกมนตรี, เพชรบุรีตัดใหม่',
    emergencyFeederReady: true,
    contactTel: '1130',
    safetyAdvisoryTh: 'เป็นสถานีแบบปิดในอาคาร น้ำท่วมภายนอกไม่กระทบระบบจำหน่ายไฟฟ้า',
  },
  {
    id: 'sub-yan-nawa',
    name: 'สถานีไฟฟ้าย่อยยานนาวา (ริมเจ้าพระยา)',
    meaDistrict: 'เขตยานนาวา / พระราม 3',
    voltageKv: '115 kV',
    lat: 13.6925,
    lng: 100.5365,
    floodBarrierMsl: 3.4,
    status: 'STANDBY_ALERT',
    statusTh: 'เฝ้าระวังระดับน้ำทะเลหนุนริมแม่น้ำ',
    servicingZone: 'พระราม 3, สาธุประดิษฐ์, นราธิวาสราชนครินทร์',
    emergencyFeederReady: true,
    contactTel: '1130',
    safetyAdvisoryTh: 'สูบน้ำออกจากบ่อดักสายใต้ดินตลอด 24 ชั่วโมง',
  },
  {
    id: 'sub-bang-sue',
    name: 'สถานีไฟฟ้าแรงสูงบางซื่อ (ชุมทางคมนาคม)',
    meaDistrict: 'เขตบางซื่อ / จตุจักร',
    voltageKv: '230 kV',
    lat: 13.8045,
    lng: 100.5395,
    floodBarrierMsl: 2.9,
    status: 'ONLINE',
    statusTh: 'จ่ายไฟรองรับสถานีกลางกรุงเทพอภิวัฒน์และรถไฟฟ้า',
    servicingZone: 'บางซื่อ, จตุจักร, ชุมทางรถไฟ, ประชาชื่น',
    emergencyFeederReady: true,
    contactTel: '1130',
    safetyAdvisoryTh: 'มีระบบตัดวงจรอัตโนมัติ (Arc Flash Protection) มาตรฐานสูงสุด',
  },
  {
    id: 'sub-thon-buri',
    name: 'สถานีไฟฟ้าย่อยธนบุรี (ฝั่งธนบุรี)',
    meaDistrict: 'เขตธนบุรี / วงเวียนใหญ่',
    voltageKv: '115 kV',
    lat: 13.7275,
    lng: 100.4905,
    floodBarrierMsl: 3.0,
    status: 'ONLINE',
    statusTh: 'ระบบจ่ายไฟฝั่งธนบุรีมีเสถียรภาพ',
    servicingZone: 'วงเวียนใหญ่, สมเด็จพระเจ้าตากสิน, อิสรภาพ',
    emergencyFeederReady: true,
    contactTel: '1130',
    safetyAdvisoryTh: 'ป้อนกระแสไฟฟ้าตรงเข้า รพ.ตากสิน และ รพ.ศิริราช อย่างต่อเนื่อง',
  },
  {
    id: 'sub-chaeng-watthana',
    name: 'สถานีไฟฟ้าแจ้งวัฒนะ (ศูนย์ราชการ)',
    meaDistrict: 'เขตหลักสี่ / แจ้งวัฒนะ',
    voltageKv: '115 kV',
    lat: 13.8912,
    lng: 100.5695,
    floodBarrierMsl: 2.7,
    status: 'ONLINE',
    statusTh: 'พร้อมจ่ายไฟฉุกเฉินศูนย์ราชการ กทม.',
    servicingZone: 'ศูนย์ราชการแจ้งวัฒนะ, หลักสี่, ดอนเมืองตอนใต้',
    emergencyFeederReady: true,
    contactTel: '1130',
    safetyAdvisoryTh: 'หม้อแปลงยกสูงจากระดับพื้น 1.80 เมตร ปลอดภัยจากน้ำหลาก',
  },
];

// 10. Bangkok Emergency Pet & Animal Flood Evacuation Shelters (ศูนย์พักพิงสัตว์เลี้ยงและหน่วยกู้ภัยสัตว์ กทม.)
export interface PetRescueShelter {
  id: string;
  name: string;
  organization: string;
  district: string;
  lat: number;
  lng: number;
  petCapacity: number;
  acceptedAnimals: string[];
  intakeStatus: 'OPEN' | 'LIMITED' | 'FULL';
  intakeStatusTh: string;
  vetOnDuty: boolean;
  contactTel: string;
  requirements: string[];
}

export const BANGKOK_PET_SHELTERS: PetRescueShelter[] = [
  {
    id: 'pet-bma-prawet',
    name: 'ศูนย์ควบคุมและพักพิงสัตว์ กทม. (ประเวศ)',
    organization: 'สำนักอนามัย กรุงเทพมหานคร',
    district: 'ประเวศ',
    lat: 13.7145,
    lng: 100.6895,
    petCapacity: 350,
    acceptedAnimals: ['สุนัข', 'แมว'],
    intakeStatus: 'OPEN',
    intakeStatusTh: 'เปิดรับสัตว์เลี้ยงอพยพน้ำท่วม',
    vetOnDuty: true,
    contactTel: '02-328-7460',
    requirements: ['กรงหรือสายจูงประจำตัว', 'อาหารสัตว์ 3-7 วัน', 'สมุดวัคซีน (ถ้ามี)'],
  },
  {
    id: 'pet-ku-vet-bangkhen',
    name: 'โรงพยาบาลสัตว์ มหาวิทยาลัยเกษตรศาสตร์ (บางเขน)',
    organization: 'คณะสัตวแพทยศาสตร์ ม.เกษตรศาสตร์',
    district: 'จตุจักร',
    lat: 13.8475,
    lng: 100.5732,
    petCapacity: 200,
    acceptedAnimals: ['สุนัข', 'แมว', 'สัตว์เลี้ยงพิเศษ (Exotic)'],
    intakeStatus: 'OPEN',
    intakeStatusTh: 'พร้อมรับสัตว์ป่วยวิกฤตและพักพิงฉุกเฉิน',
    vetOnDuty: true,
    contactTel: '02-797-1900',
    requirements: ['ประวัติการรักษา', 'กรงหรือกระเป๋าเดินทางสัตว์', 'ยาประจำตัวสัตว์'],
  },
  {
    id: 'pet-the-voice',
    name: 'ศูนย์ประสานงานกู้ภัยสัตว์ มูลนิธิเดอะวอยซ์ (เสียงจากเรา)',
    organization: 'The Voice Foundation',
    district: 'วัฒนา',
    lat: 13.7385,
    lng: 100.5815,
    petCapacity: 120,
    acceptedAnimals: ['สุนัข', 'แมว'],
    intakeStatus: 'LIMITED',
    intakeStatusTh: 'รับเฉพาะเคสติดน้ำท่วมสูง/ไร้ที่ไป',
    vetOnDuty: true,
    contactTel: '098-922-3888',
    requirements: ['แจ้งพิกัดน้ำท่วมเพื่อประสานเรือกู้ภัย', 'เบอร์ติดต่อเจ้าของ'],
  },
  {
    id: 'pet-soi-dog-bkk',
    name: 'หน่วยกู้ภัยสัตว์ฉุกเฉิน มูลนิธิเพื่อสุนัขในซอย (Soi Dog BKK Desk)',
    organization: 'Soi Dog Foundation',
    district: 'คลองเตย',
    lat: 13.7125,
    lng: 100.5655,
    petCapacity: 150,
    acceptedAnimals: ['สุนัข', 'แมว', 'สัตว์ไร้บ้านติดเกาะน้ำท่วม'],
    intakeStatus: 'OPEN',
    intakeStatusTh: 'ส่งทีมเรือเข้าช่วยเหลือสัตว์ติดค้าง',
    vetOnDuty: true,
    contactTel: '076-681-029',
    requirements: ['พิกัด GPS จุดที่สัตว์ติดค้าง', 'รูปถ่ายสัตว์เพื่อประเมินอุปกรณ์'],
  },
  {
    id: 'pet-chula-small-animal',
    name: 'โรงพยาบาลสัตว์เล็ก จุฬาลงกรณ์มหาวิทยาลัย',
    organization: 'คณะสัตวแพทยศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย',
    district: 'ปทุมวัน',
    lat: 13.7412,
    lng: 100.5312,
    petCapacity: 100,
    acceptedAnimals: ['สุนัข', 'แมว', 'นก', 'กระต่าย'],
    intakeStatus: 'OPEN',
    intakeStatusTh: 'ห้องฉุกเฉินสัตว์ 24 ชั่วโมงเปิดบริการปกติ',
    vetOnDuty: true,
    contactTel: '02-218-9751',
    requirements: ['นำสัตว์ใส่กรงที่ปลอดภัย', 'สายจูงและปลอกคอพร้อมป้ายชื่อ'],
  },
];

