const { Sequelize } = require('sequelize');

// สร้าง connection สำหรับสภาพแวดล้อม development โดยใช้ค่าเริ่มต้น
const sequelize = new Sequelize(
  'accnext',    // database name
  'root',       // username
  '',           // password (empty for default XAMPP)
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log,
    timezone: '+07:00',
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// ข้อมูลตัวอย่าง Categories (10 รายการ)
const categoriesData = [
  // รายรับ
  {
    name: 'เงินเดือน',
    type: 'income',
    description: 'รายได้จากเงินเดือนประจำ',
    color: '#10B981',
    icon: 'wallet',
    is_default: true,
    is_active: true,
    created_by: 1
  },
  {
    name: 'ขายสินค้า',
    type: 'income',
    description: 'รายได้จากการขายสินค้า',
    color: '#3B82F6',
    icon: 'shopping-bag',
    is_default: false,
    is_active: true,
    created_by: 1
  },
  {
    name: 'รายได้เสริม',
    type: 'income',
    description: 'รายได้เสริมจากงานพิเศษ',
    color: '#8B5CF6',
    icon: 'briefcase',
    is_default: false,
    is_active: true,
    created_by: 1
  },
  {
    name: 'เงินปันผล',
    type: 'income',
    description: 'รายได้จากเงินปันผลการลงทุน',
    color: '#F59E0B',
    icon: 'trending-up',
    is_default: false,
    is_active: true,
    created_by: 1
  },
  {
    name: 'ดอกเบิ้ย',
    type: 'income',
    description: 'รายได้จากดอกเบิ้ยเงินฝาก',
    color: '#06B6D4',
    icon: 'percent',
    is_default: false,
    is_active: true,
    created_by: 1
  },
  // รายจ่าย
  {
    name: 'อาหาร',
    type: 'expense',
    description: 'ค่าใช้จ่ายด้านอาหารการกิน',
    color: '#EF4444',
    icon: 'utensils',
    is_default: true,
    is_active: true,
    created_by: 1
  },
  {
    name: 'เดินทาง',
    type: 'expense',
    description: 'ค่าใช้จ่ายในการเดินทาง',
    color: '#F97316',
    icon: 'car',
    is_default: false,
    is_active: true,
    created_by: 1
  },
  {
    name: 'บันเทิง',
    type: 'expense',
    description: 'ค่าใช้จ่ายด้านความบันเทิง',
    color: '#EC4899',
    icon: 'film',
    is_default: false,
    is_active: true,
    created_by: 1
  },
  {
    name: 'ค่าใช้จ่ายบ้าน',
    type: 'expense',
    description: 'ค่าน้ำ ค่าไฟ ค่าเช่า',
    color: '#84CC16',
    icon: 'home',
    is_default: false,
    is_active: true,
    created_by: 1
  },
  {
    name: 'การศึกษา',
    type: 'expense',
    description: 'ค่าใช้จ่ายด้านการศึกษา',
    color: '#6366F1',
    icon: 'book',
    is_default: false,
    is_active: true,
    created_by: 1
  }
];

// ข้อมูลตัวอย่าง Tax Codes (10 รายการ)
const taxCodesData = [
  {
    code: 'V7',
    name: 'ภาษีมูลค่าเพิ่ม 7%',
    name_en: 'VAT 7%',
    tax_type: 'vat',
    rate: 7.00,
    description: 'อัตราภาษีมูลค่าเพิ่มมาตรฐาน 7%',
    is_active: true,
    sort_order: 1
  },
  {
    code: 'V0',
    name: 'ภาษีมูลค่าเพิ่ม 0%',
    name_en: 'VAT 0%',
    tax_type: 'vat',
    rate: 0.00,
    description: 'สินค้าหรือบริการที่ได้รับการยกเว้นภาษี',
    is_active: true,
    sort_order: 2
  },
  {
    code: 'VEX',
    name: 'ยกเว้นภาษีมูลค่าเพิ่ม',
    name_en: 'VAT Exempt',
    tax_type: 'vat',
    rate: 0.00,
    description: 'สินค้าหรือบริการที่ยกเว้นภาษีมูลค่าเพิ่ม',
    is_active: true,
    sort_order: 3
  },
  {
    code: 'W1',
    name: 'หัก ณ ที่จ่าย 1%',
    name_en: 'WHT 1%',
    tax_type: 'wht',
    rate: 1.00,
    description: 'หัก ณ ที่จ่าย 1% สำหรับบริการทั่วไป',
    is_active: true,
    sort_order: 4
  },
  {
    code: 'W3',
    name: 'หัก ณ ที่จ่าย 3%',
    name_en: 'WHT 3%',
    tax_type: 'wht',
    rate: 3.00,
    description: 'หัก ณ ที่จ่าย 3% สำหรับบริการวิชาชีพ',
    is_active: true,
    sort_order: 5
  },
  {
    code: 'W5',
    name: 'หัก ณ ที่จ่าย 5%',
    name_en: 'WHT 5%',
    tax_type: 'wht',
    rate: 5.00,
    description: 'หัก ณ ที่จ่าย 5% สำหรับการขายสินค้า',
    is_active: true,
    sort_order: 6
  },
  {
    code: 'W10',
    name: 'หัก ณ ที่จ่าย 10%',
    name_en: 'WHT 10%',
    tax_type: 'wht',
    rate: 10.00,
    description: 'หัก ณ ที่จ่าย 10% สำหรับค่าเช่า',
    is_active: true,
    sort_order: 7
  },
  {
    code: 'W15',
    name: 'หัก ณ ที่จ่าย 15%',
    name_en: 'WHT 15%',
    tax_type: 'wht',
    rate: 15.00,
    description: 'หัก ณ ที่จ่าย 15% สำหรับการรับเหมาก่อสร้าง',
    is_active: true,
    sort_order: 8
  },
  {
    code: 'W0',
    name: 'ไม่หัก ณ ที่จ่าย',
    name_en: 'No WHT',
    tax_type: 'wht',
    rate: 0.00,
    description: 'ไม่มีการหัก ณ ที่จ่าย',
    is_active: true,
    sort_order: 9
  },
  {
    code: 'WEX',
    name: 'ยกเว้นหัก ณ ที่จ่าย',
    name_en: 'WHT Exempt',
    tax_type: 'wht',
    rate: 0.00,
    description: 'ได้รับการยกเว้นการหัก ณ ที่จ่าย',
    is_active: true,
    sort_order: 10
  }
];

// ข้อมูลตัวอย่าง Parties (10 รายการ)
const partiesData = [
  {
    party_type: 'customer',
    code: 'CUS001',
    name: 'บริษัท เอบีซี จำกัด',
    name_en: 'ABC Company Limited',
    tax_id: '0105558000123',
    address: '123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110',
    address_en: '123 Sukhumvit Road, Khlong Tan, Khlong Toei, Bangkok 10110',
    phone: '02-123-4567',
    fax: '02-123-4568',
    email: 'info@abc.co.th',
    website: 'www.abc.co.th',
    contact_person: 'นายสมชาย ใจดี',
    contact_phone: '081-234-5678',
    contact_email: 'somchai@abc.co.th',
    credit_limit: 500000.00,
    payment_terms: 'เครดิต 30 วัน',
    vat_type: 'registered',
    vat_rate: 7.00,
    wht_type: 'company',
    wht_rate: 3.00,
    is_active: true,
    note: 'ลูกค้าประจำ มีประวัติการชำระเงินดี'
  },
  {
    party_type: 'vendor',
    code: 'VEN001',
    name: 'บริษัท ซัพพลาย เอ็กซ์เซลเลนท์ จำกัด',
    name_en: 'Supply Excellent Co., Ltd.',
    tax_id: '0105559000456',
    address: '456 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
    address_en: '456 Ratchadaphisek Road, Din Daeng, Din Daeng, Bangkok 10400',
    phone: '02-456-7890',
    fax: '02-456-7891',
    email: 'contact@supply-excellent.com',
    website: 'www.supply-excellent.com',
    contact_person: 'นางสาวสุภาพร ยอดเยี่ยม',
    contact_phone: '089-567-8901',
    contact_email: 'suphaporn@supply-excellent.com',
    credit_limit: 1000000.00,
    payment_terms: 'เครดิต 45 วัน',
    vat_type: 'registered',
    vat_rate: 7.00,
    wht_type: 'company',
    wht_rate: 3.00,
    is_active: true,
    note: 'ผู้จำหน่ายวัสดุอุปกรณ์สำนักงาน'
  },
  {
    party_type: 'both',
    code: 'BOTH001',
    name: 'ห้างหุ้นส่วนจำกัด ทรัสต์ เทรด',
    name_en: 'Trust Trade Limited Partnership',
    tax_id: '0305560000789',
    address: '789 ถนนพระราม 4 แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110',
    address_en: '789 Rama 4 Road, Khlong Tan, Khlong Toei, Bangkok 10110',
    phone: '02-789-0123',
    fax: '02-789-0124',
    email: 'info@trust-trade.co.th',
    website: 'www.trust-trade.co.th',
    contact_person: 'นายวิเชียร น่าเชื่อถือ',
    contact_phone: '086-123-4567',
    contact_email: 'wichian@trust-trade.co.th',
    credit_limit: 750000.00,
    payment_terms: 'เครดิต 60 วัน',
    vat_type: 'registered',
    vat_rate: 7.00,
    wht_type: 'company',
    wht_rate: 3.00,
    is_active: true,
    note: 'ทั้งลูกค้าและผู้จำหน่าย'
  },
  {
    party_type: 'customer',
    code: 'CUS002',
    name: 'บริษัท เทคโนโลยี อินโนเวชั่น จำกัด',
    name_en: 'Technology Innovation Co., Ltd.',
    tax_id: '0105561000321',
    address: '321 ถนนวิภาวดี แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
    address_en: '321 Vibhavadi Road, Chatuchak, Chatuchak, Bangkok 10900',
    phone: '02-321-4567',
    email: 'hello@tech-innovation.com',
    contact_person: 'นายเทคโน อินโนเวทีฟ',
    contact_phone: '092-345-6789',
    contact_email: 'techno@tech-innovation.com',
    credit_limit: 300000.00,
    payment_terms: 'เงินสด',
    vat_type: 'registered',
    vat_rate: 7.00,
    wht_type: 'company',
    wht_rate: 3.00,
    is_active: true,
    note: 'บริษัทเทคโนโลยี'
  },
  {
    party_type: 'vendor',
    code: 'VEN002',
    name: 'โรงงานผลิตภัณฑ์พลาสติก มั่งคั่ง',
    name_en: 'Mungkung Plastic Manufacturing',
    tax_id: '1234567890123',
    address: '567 หมู่ 5 ตำบลบางบัวทอง อำเภอบางบัวทอง จังหวัดนนทบุรี 11110',
    phone: '02-567-8901',
    contact_person: 'นายมั่งคั่ง พลาสติก',
    contact_phone: '081-567-8901',
    credit_limit: 200000.00,
    payment_terms: 'เครดิต 30 วัน',
    vat_type: 'registered',
    vat_rate: 7.00,
    wht_type: 'company',
    wht_rate: 5.00,
    is_active: true,
    note: 'โรงงานผลิตพลาสติก'
  },
  {
    party_type: 'customer',
    code: 'CUS003',
    name: 'ร้านค้าปลีก สินค้าทั่วไป',
    tax_id: null,
    address: '888 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400',
    phone: '02-888-9999',
    contact_person: 'นางสมหญิง ขายดี',
    contact_phone: '089-888-9999',
    credit_limit: 50000.00,
    payment_terms: 'เงินสด',
    vat_type: 'unregistered',
    vat_rate: 0.00,
    wht_type: 'exempt',
    wht_rate: 0.00,
    is_active: true,
    note: 'ร้านค้าปลีก ไม่จดทะเบียนภาษี'
  },
  {
    party_type: 'vendor',
    code: 'VEN003',
    name: 'บริษัท คอนซัลติ้ง โซลูชั่น จำกัด',
    name_en: 'Consulting Solution Co., Ltd.',
    tax_id: '0105562000654',
    address: '111 อาคารเซ็นทรัล เวิลด์ ถนนราชดำริ แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',
    phone: '02-111-2222',
    email: 'info@consulting-solution.com',
    contact_person: 'นายคอนซัล ที่ปรึกษา',
    contact_phone: '095-111-2222',
    contact_email: 'consul@consulting-solution.com',
    credit_limit: 800000.00,
    payment_terms: 'เครดิต 30 วัน',
    vat_type: 'registered',
    vat_rate: 7.00,
    wht_type: 'company',
    wht_rate: 3.00,
    is_active: true,
    note: 'บริษัทให้คำปรึกษา'
  },
  {
    party_type: 'customer',
    code: 'CUS004',
    name: 'มหาวิทยาลัยเทคโนโลยี',
    name_en: 'Technology University',
    tax_id: '0994000000001',
    address: '999 ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
    phone: '02-999-0000',
    email: 'procurement@tech-university.ac.th',
    contact_person: 'นายศึกษา การศึกษา',
    contact_phone: '02-999-0001',
    credit_limit: 2000000.00,
    payment_terms: 'เครดิต 90 วัน',
    vat_type: 'exempt',
    vat_rate: 0.00,
    wht_type: 'exempt',
    wht_rate: 0.00,
    is_active: true,
    note: 'สถาบันการศึกษา ได้รับการยกเว้นภาษี'
  },
  {
    party_type: 'vendor',
    code: 'VEN004',
    name: 'บริษัท ขนส่งและโลจิสติกส์ จำกัด',
    name_en: 'Transport & Logistics Co., Ltd.',
    tax_id: '0105563000987',
    address: '777 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900',
    phone: '02-777-8888',
    contact_person: 'นายขนส่ง รวดเร็ว',
    contact_phone: '083-777-8888',
    credit_limit: 100000.00,
    payment_terms: 'เครดิต 15 วัน',
    vat_type: 'registered',
    vat_rate: 7.00,
    wht_type: 'company',
    wht_rate: 1.00,
    is_active: true,
    note: 'บริษัทขนส่งสินค้า'
  },
  {
    party_type: 'customer',
    code: 'CUS005',
    name: 'นายบุคคลธรรมดา ซื้อสินค้า',
    tax_id: '1234567890123',
    address: '555 ซอยสุขุมวิท 23 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    phone: '081-555-5555',
    contact_person: 'นายบุคคล ธรรมดา',
    contact_phone: '081-555-5555',
    credit_limit: 20000.00,
    payment_terms: 'เงินสด',
    vat_type: 'unregistered',
    vat_rate: 0.00,
    wht_type: 'individual',
    wht_rate: 5.00,
    is_active: true,
    note: 'ลูกค้าบุคคลธรรมดา'
  }
];

// ข้อมูลตัวอย่าง Incomes (10 รายการ)
const incomesData = [
  {
    amount: 45000.00,
    description: 'เงินเดือนประจำเดือนมกราคม 2025',
    transaction_date: '2025-01-05',
    reference_number: 'SAL202501001',
    payment_method: 'bank_transfer',
    notes: 'โอนเข้าบัญชีธนาคาร',
    user_id: 1,
    category_id: 1 // เงินเดือน
  },
  {
    amount: 25000.00,
    description: 'ขายสินค้าผ่านร้านออนไลน์',
    transaction_date: '2025-01-03',
    reference_number: 'SALE202501001',
    payment_method: 'bank_transfer',
    notes: 'ขายสินค้าหลายรายการ',
    user_id: 1,
    category_id: 2 // ขายสินค้า
  },
  {
    amount: 8000.00,
    description: 'รายได้เสริมจากงานฟรีแลนซ์',
    transaction_date: '2025-01-07',
    reference_number: 'FREELANCE001',
    payment_method: 'cash',
    notes: 'งานออกแบบเว็บไซต์',
    user_id: 1,
    category_id: 3 // รายได้เสริม
  },
  {
    amount: 3500.00,
    description: 'เงินปันผลจากหุ้น',
    transaction_date: '2025-01-10',
    reference_number: 'DIV202501001',
    payment_method: 'bank_transfer',
    notes: 'เงินปันผลจากหุ้น SET50',
    user_id: 1,
    category_id: 4 // เงินปันผล
  },
  {
    amount: 1200.00,
    description: 'ดอกเบิ้ยเงินฝากธนาคาร',
    transaction_date: '2025-01-01',
    reference_number: 'INT202501001',
    payment_method: 'bank_transfer',
    notes: 'ดอกเบิ้ยบัญชีออมทรัพย์',
    user_id: 1,
    category_id: 5 // ดอกเบิ้ย
  },
  {
    amount: 45000.00,
    description: 'เงินเดือนประจำเดือนธันวาคม 2024',
    transaction_date: '2024-12-05',
    reference_number: 'SAL202412001',
    payment_method: 'bank_transfer',
    notes: 'โอนเข้าบัญชีธนาคาร',
    user_id: 1,
    category_id: 1 // เงินเดือน
  },
  {
    amount: 15000.00,
    description: 'ขายของมือสอง',
    transaction_date: '2024-12-20',
    reference_number: 'USED001',
    payment_method: 'cash',
    notes: 'ขายเฟอร์นิเจอร์เก่า',
    user_id: 1,
    category_id: 2 // ขายสินค้า
  },
  {
    amount: 12000.00,
    description: 'รายได้จากการสอนพิเศษ',
    transaction_date: '2024-12-15',
    reference_number: 'TUTOR001',
    payment_method: 'cash',
    notes: 'สอนคณิตศาสตร์',
    user_id: 1,
    category_id: 3 // รายได้เสริม
  },
  {
    amount: 5000.00,
    description: 'โบนัสสิ้นปี',
    transaction_date: '2024-12-30',
    reference_number: 'BONUS2024',
    payment_method: 'bank_transfer',
    notes: 'โบนัสจากบริษัท',
    user_id: 1,
    category_id: 1 // เงินเดือน
  },
  {
    amount: 800.00,
    description: 'ดอกเบิ้ยเงินฝากประจำ',
    transaction_date: '2024-12-31',
    reference_number: 'FIXINT2024',
    payment_method: 'bank_transfer',
    notes: 'ดอกเบิ้ยเงินฝากประจำ 6 เดือน',
    user_id: 1,
    category_id: 5 // ดอกเบิ้ย
  }
];

// ข้อมูลตัวอย่าง Expenses (10 รายการ)
const expensesData = [
  {
    amount: 1500.00,
    description: 'ค่าอาหารกลางวัน',
    transaction_date: '2025-01-08',
    reference_number: 'LUNCH001',
    payment_method: 'cash',
    vendor: 'ร้านอาหารใกล้ออฟฟิศ',
    notes: 'อาหารกลางวันสำหรับทีม',
    user_id: 1,
    category_id: 6 // อาหาร
  },
  {
    amount: 800.00,
    description: 'ค่าน้ำมันรถ',
    transaction_date: '2025-01-07',
    reference_number: 'FUEL001',
    payment_method: 'credit_card',
    vendor: 'ปตท.',
    notes: 'เติมน้ำมันเดินทางไปทำงาน',
    user_id: 1,
    category_id: 7 // เดินทาง
  },
  {
    amount: 3500.00,
    description: 'ค่าเช่าบ้าน',
    transaction_date: '2025-01-01',
    reference_number: 'RENT202501',
    payment_method: 'bank_transfer',
    vendor: 'เจ้าของบ้าน',
    notes: 'ค่าเช่าประจำเดือนมกราคม',
    budget_limit: 4000.00,
    user_id: 1,
    category_id: 9 // ค่าใช้จ่ายบ้าน
  },
  {
    amount: 1200.00,
    description: 'ค่าไฟฟ้า',
    transaction_date: '2025-01-02',
    reference_number: 'ELEC202501',
    payment_method: 'bank_transfer',
    vendor: 'การไฟฟ้านครหลวง',
    notes: 'ค่าไฟประจำเดือน',
    user_id: 1,
    category_id: 9 // ค่าใช้จ่ายบ้าน
  },
  {
    amount: 2500.00,
    description: 'ซื้อหนังสือเรียน',
    transaction_date: '2025-01-05',
    reference_number: 'BOOK001',
    payment_method: 'cash',
    vendor: 'ร้านหนังสือ ABC',
    notes: 'หนังสือเรียนภาษาอังกฤษ',
    user_id: 1,
    category_id: 10 // การศึกษา
  },
  {
    amount: 650.00,
    description: 'ดูหนังในโรงภาพยนตร์',
    transaction_date: '2025-01-06',
    reference_number: 'MOVIE001',
    payment_method: 'credit_card',
    vendor: 'เมเจอร์ ซีนีเพล็กซ์',
    notes: 'ดูหนังกับครอบครัว',
    user_id: 1,
    category_id: 8 // บันเทิง
  },
  {
    amount: 450.00,
    description: 'ค่าน้ำประปา',
    transaction_date: '2025-01-03',
    reference_number: 'WATER202501',
    payment_method: 'bank_transfer',
    vendor: 'การประปานครหลวง',
    notes: 'ค่าน้ำประจำเดือน',
    user_id: 1,
    category_id: 9 // ค่าใช้จ่ายบ้าน
  },
  {
    amount: 350.00,
    description: 'ค่าเดินทางรถไฟฟ้า',
    transaction_date: '2025-01-04',
    reference_number: 'BTS001',
    payment_method: 'cash',
    vendor: 'รถไฟฟ้า BTS',
    notes: 'ค่าเดินทางไปทำงาน',
    user_id: 1,
    category_id: 7 // เดินทาง
  },
  {
    amount: 2800.00,
    description: 'ซื้อของใช้ในครัวเรือน',
    transaction_date: '2024-12-28',
    reference_number: 'HOUSE001',
    payment_method: 'cash',
    vendor: 'ตลาดนัด JJ',
    notes: 'อุปกรณ์ทำความสะอาด',
    user_id: 1,
    category_id: 9 // ค่าใช้จ่ายบ้าน
  },
  {
    amount: 1800.00,
    description: 'ค่าอาหารเย็นสำหรับงานเลี้ยง',
    transaction_date: '2024-12-31',
    reference_number: 'PARTY001',
    payment_method: 'cash',
    vendor: 'ร้านบุฟเฟ่ต์',
    notes: 'งานเลี้ยงสิ้นปี',
    user_id: 1,
    category_id: 8 // บันเทิง
  }
];

async function insertSampleData() {
  try {
    await sequelize.authenticate();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');

    // ตรวจสอบผู้ใช้ที่มีอยู่
    const [users] = await sequelize.query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('❌ ไม่มีผู้ใช้ในระบบ กรุณาสร้างผู้ใช้ก่อน');
      return;
    }
    const userId = users[0].id;
    console.log(`✅ ใช้ผู้ใช้ ID: ${userId} สำหรับการสร้างข้อมูล`);

    // อัปเดต user_id ในข้อมูลทั้งหมด
    categoriesData.forEach(item => item.created_by = userId);
    incomesData.forEach(item => item.user_id = userId);
    expensesData.forEach(item => item.user_id = userId);

    // แสดงข้อมูลที่จะเพิ่ม
    console.log('\n=== กำลังเพิ่มข้อมูลตัวอย่าง ===');
    console.log(`Categories: ${categoriesData.length} รายการ`);
    console.log(`Tax Codes: ${taxCodesData.length} รายการ`);
    console.log(`Parties: ${partiesData.length} รายการ`);
    console.log(`Incomes: ${incomesData.length} รายการ`);
    console.log(`Expenses: ${expensesData.length} รายการ`);

    // เพิ่มข้อมูล Categories
    console.log('\n1. เพิ่มข้อมูล Categories...');
    const categoryMapping = {};
    for (let i = 0; i < categoriesData.length; i++) {
      const category = categoriesData[i];
      await sequelize.query(`
        INSERT INTO categories (name, type, description, color, icon, is_default, is_active, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          category.name,
          category.type,
          category.description,
          category.color,
          category.icon,
          category.is_default,
          category.is_active,
          category.created_by
        ]
      });
      
      // ดึง ID ที่เพิ่งสร้าง
      const [idResult] = await sequelize.query('SELECT LAST_INSERT_ID() as id');
      const newId = idResult[0].id;
      
      // เก็บ mapping ระหว่าง index เดิมกับ ID ใหม่
      categoryMapping[i + 1] = newId;
    }
    console.log('✅ เพิ่มข้อมูล Categories สำเร็จ');

    // อัปเดต category_id ในข้อมูล incomes และ expenses
    console.log('Category Mapping:', categoryMapping);
    incomesData.forEach(item => {
      const oldId = item.category_id;
      if (categoryMapping[item.category_id]) {
        item.category_id = categoryMapping[item.category_id];
        console.log(`Income category_id ${oldId} -> ${item.category_id}`);
      }
    });
    expensesData.forEach(item => {
      const oldId = item.category_id;
      if (categoryMapping[item.category_id]) {
        item.category_id = categoryMapping[item.category_id];
        console.log(`Expense category_id ${oldId} -> ${item.category_id}`);
      }
    });

    // เพิ่มข้อมูล Tax Codes
    console.log('\n2. เพิ่มข้อมูล Tax Codes...');
    for (const taxCode of taxCodesData) {
      await sequelize.query(`
        INSERT INTO tax_codes (code, name, name_en, tax_type, rate, description, is_active, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          taxCode.code,
          taxCode.name,
          taxCode.name_en,
          taxCode.tax_type,
          taxCode.rate,
          taxCode.description,
          taxCode.is_active,
          taxCode.sort_order
        ]
      });
    }
    console.log('✅ เพิ่มข้อมูล Tax Codes สำเร็จ');

    // เพิ่มข้อมูล Parties
    console.log('\n3. เพิ่มข้อมูล Parties...');
    for (const party of partiesData) {
      await sequelize.query(`
        INSERT INTO parties (
          party_type, code, name, name_en, tax_id, address, address_en,
          phone, fax, email, website, contact_person, contact_phone, contact_email,
          credit_limit, payment_terms, vat_type, vat_rate, wht_type, wht_rate,
          is_active, note, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          party.party_type, party.code, party.name, party.name_en || null, party.tax_id || null,
          party.address || null, party.address_en || null, party.phone || null, party.fax || null, party.email || null,
          party.website || null, party.contact_person || null, party.contact_phone || null, party.contact_email || null,
          party.credit_limit || null, party.payment_terms || null, party.vat_type, party.vat_rate,
          party.wht_type, party.wht_rate, party.is_active, party.note || null
        ]
      });
    }
    console.log('✅ เพิ่มข้อมูล Parties สำเร็จ');

    // เพิ่มข้อมูล Incomes
    console.log('\n4. เพิ่มข้อมูล Incomes...');
    for (const income of incomesData) {
      await sequelize.query(`
        INSERT INTO incomes (amount, description, transaction_date, reference_number, payment_method, notes, user_id, category_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          income.amount,
          income.description,
          income.transaction_date,
          income.reference_number,
          income.payment_method,
          income.notes,
          income.user_id,
          income.category_id
        ]
      });
    }
    console.log('✅ เพิ่มข้อมูล Incomes สำเร็จ');

    // เพิ่มข้อมูล Expenses
    console.log('\n5. เพิ่มข้อมูล Expenses...');
    for (const expense of expensesData) {
      await sequelize.query(`
        INSERT INTO expenses (
          amount, description, transaction_date, reference_number, payment_method,
          vendor, notes, budget_limit, user_id, category_id, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          expense.amount,
          expense.description,
          expense.transaction_date,
          expense.reference_number,
          expense.payment_method,
          expense.vendor,
          expense.notes,
          expense.budget_limit || null,
          expense.user_id,
          expense.category_id
        ]
      });
    }
    console.log('✅ เพิ่มข้อมูล Expenses สำเร็จ');

    console.log('\n🎉 เพิ่มข้อมูลตัวอย่างทั้งหมดสำเร็จ!');
    console.log('\n=== สรุปข้อมูลที่เพิ่ม ===');
    console.log(`✅ Categories: ${categoriesData.length} รายการ`);
    console.log(`✅ Tax Codes: ${taxCodesData.length} รายการ`);
    console.log(`✅ Parties: ${partiesData.length} รายการ`);
    console.log(`✅ Incomes: ${incomesData.length} รายการ`);
    console.log(`✅ Expenses: ${expensesData.length} รายการ`);

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    await sequelize.close();
  }
}

// รันสคริปต์ถ้าเป็นการเรียกใช้โดยตรง
if (require.main === module) {
  insertSampleData();
}

module.exports = insertSampleData;