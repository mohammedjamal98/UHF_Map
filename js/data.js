/* ============================================================
   بيانات تجريبية (Mock) — لوحة تتبع المركبات عبر أجهزة UHF
   جميع البيانات أدناه وهمية لأغراض العرض فقط.
   ============================================================ */

const DEVICES = [
  /* بغداد — عدة نقاط تفتيش لتغطية مداخل ومحطات العاصمة */
  { id: 'DEV-01', name: 'بوابة بغداد الرئيسية',        city: 'بغداد', lat: 33.3152, lng: 44.3661, type: 'قارئ بوابة',      status: 'online'  },
  { id: 'DEV-02', name: 'نقطة تفتيش مطار بغداد الدولي', city: 'بغداد', lat: 33.2625, lng: 44.2346, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-13', name: 'المدخل الشرقي — جسر ديالى',    city: 'بغداد', lat: 33.2900, lng: 44.4800, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-14', name: 'المدخل الشمالي — التاجي',      city: 'بغداد', lat: 33.4700, lng: 44.3300, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-15', name: 'المدخل الجنوبي — اللطيفية',    city: 'بغداد', lat: 33.1500, lng: 44.3200, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-16', name: 'كراج النهضة (محطة نقل الركاب)', city: 'بغداد', lat: 33.3200, lng: 44.4200, type: 'قارئ محطة',      status: 'online'  },
  { id: 'DEV-17', name: 'المدخل الغربي — أبو غريب',     city: 'بغداد', lat: 33.3000, lng: 44.1300, type: 'قارئ نقطة تفتيش', status: 'warning' },

  /* بقية المحافظات ونقاط الحدود */
  { id: 'DEV-03', name: 'نقطة تفتيش كربلاء',      city: 'كربلاء',   lat: 32.6160, lng: 44.0249, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-04', name: 'نقطة تفتيش النجف',       city: 'النجف',    lat: 31.9958, lng: 44.3107, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-05', name: 'نقطة تفتيش الناصرية',    city: 'الناصرية', lat: 31.0563, lng: 46.2586, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-06', name: 'بوابة ميناء البصرة',     city: 'البصرة',   lat: 30.5085, lng: 47.7835, type: 'قارئ بوابة',      status: 'online'  },
  { id: 'DEV-07', name: 'معبر سفوان الحدودي',     city: 'سفوان',    lat: 30.1077, lng: 47.7852, type: 'قارئ حدودي',      status: 'online'  },
  { id: 'DEV-08', name: 'نقطة تفتيش أربيل',       city: 'أربيل',    lat: 36.1911, lng: 44.0092, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-09', name: 'نقطة تفتيش الموصل',      city: 'الموصل',   lat: 36.3489, lng: 43.1189, type: 'قارئ نقطة تفتيش', status: 'offline' },
  { id: 'DEV-10', name: 'نقطة تفتيش كركوك',       city: 'كركوك',    lat: 35.4681, lng: 44.3922, type: 'قارئ نقطة تفتيش', status: 'online'  },
  { id: 'DEV-11', name: 'معبر زرباطية الحدودي',   city: 'زرباطية',  lat: 33.1500, lng: 46.0833, type: 'قارئ حدودي',      status: 'online'  },
  { id: 'DEV-12', name: 'معبر طريبيل الحدودي',    city: 'طريبيل',   lat: 32.9860, lng: 39.0000, type: 'قارئ حدودي',      status: 'warning' },
];

const VEHICLES = [
  { id: 'VEH-01', plate: 'بغداد 12345', tagId: 'E28011700000021234', type: 'حافلة ركاب',   driver: 'أحمد التميمي',   driverPhone: '0770 123 4567' },
  { id: 'VEH-02', plate: 'بغداد 67890', tagId: 'E28011700000067890', type: 'ميني باص',      driver: 'محمد الجبوري',   driverPhone: '0771 234 5678' },
  { id: 'VEH-03', plate: 'أربيل 55521', tagId: 'E28011700000055521', type: 'حافلة VIP',     driver: 'حسين السلطاني', driverPhone: '0772 345 6789' },
  { id: 'VEH-04', plate: 'بغداد 90011', tagId: 'E28011700000090011', type: 'سيارة عامة',    driver: 'كريم الزبيدي',  driverPhone: '0773 456 7890' },
  { id: 'VEH-05', plate: 'بغداد 33221', tagId: 'E28011700000033221', type: 'ميني باص',      driver: 'علي حسن',       driverPhone: '0774 567 8901' },
];

/* الرحلات: كل توقف يشير إلى الجهاز الذي قرأ بطاقة UHF الخاصة بالمركبة،
   بالترتيب الزمني الذي حصلت فيه القراءة. */
const TRIPS = [
  {
    id: 'TRIP-1001',
    vehicleId: 'VEH-01',
    status: 'completed',
    origin: 'ميناء البصرة',
    destination: 'كراج النهضة — بغداد',
    startTime: '2026-09-18T06:00:00',
    endTime:   '2026-09-18T14:20:00',
    route: [
      { deviceId: 'DEV-07', timestamp: '2026-09-18T06:00:00', direction: 'OUT', speedKmh: 42 },
      { deviceId: 'DEV-06', timestamp: '2026-09-18T06:45:00', direction: 'IN',  speedKmh: 38 },
      { deviceId: 'DEV-05', timestamp: '2026-09-18T09:10:00', direction: 'IN',  speedKmh: 91 },
      { deviceId: 'DEV-04', timestamp: '2026-09-18T11:05:00', direction: 'IN',  speedKmh: 87 },
      { deviceId: 'DEV-03', timestamp: '2026-09-18T12:30:00', direction: 'IN',  speedKmh: 95 },
      { deviceId: 'DEV-01', timestamp: '2026-09-18T13:50:00', direction: 'IN',  speedKmh: 60 },
      { deviceId: 'DEV-16', timestamp: '2026-09-18T14:20:00', direction: 'IN',  speedKmh: 22 },
    ],
  },
  {
    id: 'TRIP-1002',
    vehicleId: 'VEH-02',
    status: 'in-transit',
    origin: 'معبر طريبيل الحدودي',
    destination: 'السوق المركزي — بغداد',
    startTime: '2026-09-19T05:30:00',
    endTime: null,
    route: [
      { deviceId: 'DEV-12', timestamp: '2026-09-19T05:30:00', direction: 'IN', speedKmh: 35 },
      { deviceId: 'DEV-03', timestamp: '2026-09-19T11:15:00', direction: 'IN', speedKmh: 88 },
    ],
  },
  {
    id: 'TRIP-1003',
    vehicleId: 'VEH-03',
    status: 'in-transit',
    origin: 'أربيل',
    destination: 'كراج النهضة — بغداد',
    startTime: '2026-09-19T04:00:00',
    endTime: null,
    route: [
      { deviceId: 'DEV-08', timestamp: '2026-09-19T04:00:00', direction: 'OUT', speedKmh: 55 },
      { deviceId: 'DEV-10', timestamp: '2026-09-19T06:20:00', direction: 'IN',  speedKmh: 79 },
    ],
  },
  {
    id: 'TRIP-1004',
    vehicleId: 'VEH-04',
    status: 'scheduled',
    origin: 'معبر زرباطية الحدودي',
    destination: 'الكرادة — بغداد',
    startTime: '2026-09-20T07:00:00',
    endTime: null,
    route: [],
  },
];

/* قوائم الركاب (Manifest) — بيانات الأشخاص المسجّلين على متن كل رحلة،
   بدلاً من بيانات بضائع/مواد. */
const MANIFESTS = {
  'TRIP-1001': {
    manifestNo: 'MAN-2026-001122',
    tripRef: 'رحلة رقم T-88213',
    carrier: 'شركة الرافدين للنقل',
    totalPassengers: 28,
    totalLuggage: 34,
    passengers: [
      { name: 'أحمد جبار حسن',     nationalId: '19850234567', gender: 'ذكر',  age: 41, seat: 1, phone: '0790 111 2233' },
      { name: 'زينب علي كاظم',     nationalId: '19910345678', gender: 'أنثى', age: 29, seat: 2, phone: '0791 222 3344' },
      { name: 'محمد كريم صالح',    nationalId: '19700456789', gender: 'ذكر',  age: 55, seat: 3, phone: '0792 333 4455' },
      { name: 'نور حسين عبدالله',  nationalId: '19920567890', gender: 'أنثى', age: 34, seat: 4, phone: '0793 444 5566' },
      { name: 'حيدر فاضل عودة',    nationalId: '20030678901', gender: 'ذكر',  age: 22, seat: 5, phone: '0794 555 6677' },
      { name: 'سارة ياسين محمود',  nationalId: '19980789012', gender: 'أنثى', age: 27, seat: 6, phone: '0795 666 7788' },
      { name: 'علي عبدالكريم جاسم', nationalId: '19650890123', gender: 'ذكر',  age: 60, seat: 7, phone: '0796 777 8899' },
      { name: 'هدى سالم راضي',     nationalId: '20060901234', gender: 'أنثى', age: 19, seat: 8, phone: '0797 888 9900' },
    ],
  },
  'TRIP-1002': {
    manifestNo: 'MAN-2026-001188',
    tripRef: 'رحلة رقم T-88340',
    carrier: 'مكتب الأمانة لنقل المسافرين',
    totalPassengers: 14,
    totalLuggage: 16,
    passengers: [
      { name: 'مصطفى وليد فرحان',  nationalId: '19881122334', gender: 'ذكر',  age: 37, seat: 1, phone: '0780 111 2233' },
      { name: 'رانيا سعد توفيق',   nationalId: '19951233445', gender: 'أنثى', age: 30, seat: 2, phone: '0781 222 3344' },
      { name: 'عمر رياض شهاب',     nationalId: '19771344556', gender: 'ذكر',  age: 48, seat: 3, phone: '0782 333 4455' },
      { name: 'ياسمين قصي نجم',    nationalId: '20001455667', gender: 'أنثى', age: 25, seat: 4, phone: '0783 444 5566' },
      { name: 'باسم عدنان خليل',   nationalId: '19681566778', gender: 'ذكر',  age: 57, seat: 5, phone: '0784 555 6677' },
    ],
  },
  'TRIP-1003': {
    manifestNo: 'MAN-2026-001199',
    tripRef: 'رحلة رقم T-88355',
    carrier: 'شركة زاگروس للنقل السياحي',
    totalPassengers: 18,
    totalLuggage: 20,
    passengers: [
      { name: 'دلشاد كمال أحمد',   nationalId: '19901677889', gender: 'ذكر',  age: 33, seat: 1, phone: '0750 111 2233' },
      { name: 'شيلان هوشيار سعيد', nationalId: '19961788990', gender: 'أنثى', age: 28, seat: 2, phone: '0751 222 3344' },
      { name: 'رزگار جمال طه',     nationalId: '19821899001', gender: 'ذكر',  age: 42, seat: 3, phone: '0752 333 4455' },
      { name: 'ئاڤان سردار قادر',  nationalId: '19991900112', gender: 'أنثى', age: 24, seat: 4, phone: '0753 444 5566' },
      { name: 'كاوة رشيد عمر',     nationalId: '19752011223', gender: 'ذكر',  age: 49, seat: 5, phone: '0754 555 6677' },
    ],
  },
  'TRIP-1004': {
    manifestNo: 'MAN-2026-001210',
    tripRef: 'رحلة رقم T-88402',
    carrier: 'شركة دجلة لنقل الركاب',
    totalPassengers: 9,
    totalLuggage: 11,
    passengers: [
      { name: 'فراس ماجد كاظم',    nationalId: '19872122334', gender: 'ذكر',  age: 39, seat: 1, phone: '0760 111 2233' },
      { name: 'إيمان طارق حمزة',   nationalId: '19942233445', gender: 'أنثى', age: 31, seat: 2, phone: '0761 222 3344' },
      { name: 'حسام عباس فيصل',    nationalId: '19782344556', gender: 'ذكر',  age: 46, seat: 3, phone: '0762 333 4455' },
      { name: 'رغد صباح إبراهيم',  nationalId: '20012455667', gender: 'أنثى', age: 23, seat: 4, phone: '0763 444 5566' },
    ],
  },
};

/* قراءات إضافية "خلفية" — مركبات تعبر أجهزة خارج أي رحلة متتبَّعة،
   فقط لجعل سجل المعاملات الحي يبدو واقعياً. */
const NOISE_TRANSACTIONS = [
  { deviceId: 'DEV-01', vehicleId: 'VEH-05', timestamp: '2026-09-19T07:12:00', direction: 'IN',  speedKmh: 28 },
  { deviceId: 'DEV-02', vehicleId: 'VEH-05', timestamp: '2026-09-19T07:40:00', direction: 'OUT', speedKmh: 33 },
  { deviceId: 'DEV-13', vehicleId: 'VEH-05', timestamp: '2026-09-19T08:05:00', direction: 'IN',  speedKmh: 30 },
  { deviceId: 'DEV-16', vehicleId: 'VEH-05', timestamp: '2026-09-19T08:30:00', direction: 'IN',  speedKmh: 20 },
  { deviceId: 'DEV-01', vehicleId: 'VEH-05', timestamp: '2026-09-19T13:05:00', direction: 'OUT', speedKmh: 25 },
];

/* تجميع كل توقفات الرحلات + القراءات الخلفية في سجل معاملات واحد. */
function buildTransactions() {
  const rows = [];
  let seq = 1;
  TRIPS.forEach(trip => {
    trip.route.forEach(stop => {
      rows.push({
        id: 'TXN-' + String(seq++).padStart(5, '0'),
        deviceId: stop.deviceId,
        vehicleId: trip.vehicleId,
        tripId: trip.id,
        timestamp: stop.timestamp,
        direction: stop.direction,
        speedKmh: stop.speedKmh,
      });
    });
  });
  NOISE_TRANSACTIONS.forEach(n => {
    rows.push({
      id: 'TXN-' + String(seq++).padStart(5, '0'),
      deviceId: n.deviceId,
      vehicleId: n.vehicleId,
      tripId: null,
      timestamp: n.timestamp,
      direction: n.direction,
      speedKmh: n.speedKmh,
    });
  });
  rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return rows;
}

const TRANSACTIONS = buildTransactions();

/* ---- دوال بحث مساعدة ---- */
const deviceById  = id => DEVICES.find(d => d.id === id);
const vehicleById = id => VEHICLES.find(v => v.id === id);
const tripById    = id => TRIPS.find(t => t.id === id);
