# ระบบภาษีไทยแบบครบวงจร (Thai Tax System)

ระบบภาษีไทยที่ครอบคลุมการออกใบกำกับภาษี/ใบเสร็จ และรายงานภาษี ภ.พ.30 / ภ.ง.ด.3/53 พร้อมฟีเจอร์ VAT 7% และ WHT (หัก ณ ที่จ่าย)

## 🚀 คุณสมบัติหลัก

### 📄 ใบกำกับภาษี/ใบเสร็จ
- ออกใบกำกับภาษี/ใบเสร็จรับเงิน (เต็มรูป)
- รองรับ VAT 7% และ WHT (หัก ณ ที่จ่าย)
- รายการผสม: สินค้า + บริการ
- PromptPay QR Code
- PDF พร้อมฟอนต์ไทย (THSarabunNew)

### 🛒 ใบซื้อและหนังสือรับรอง
- บันทึกใบซื้อพร้อมภาษี
- ออกหนังสือรับรองหักภาษี ณ ที่จ่าย
- รองรับแบบฟอร์ม ภ.ง.ด.3 และ ภ.ง.ด.53
- คำนวณ WHT อัตโนมัติ

### 📊 รายงานภาษี
- **ภ.พ.30**: รายงานภาษีมูลค่าเพิ่ม
- **ภ.ง.ด.3/53**: รายงานหนังสือรับรองหักภาษี ณ ที่จ่าย
- ส่งออก PDF พร้อมลายเซ็นและตราประทับ
- สรุปรายเดือน/รายปี

### 💼 ระบบบัญชี
- เชื่อมโยงกับระบบรายรับ-รายจ่ายเดิม
- คำนวณภาษีอัตโนมัติ
- ติดตามสถานะการจ่ายเงิน
- แดชบอร์ดสรุปภาษี

## 🏗️ สถาปัตยกรรมระบบ

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui Components**

### Backend  
- **Node.js API Routes**
- **MySQL Database**
- **PDFMake** สำหรับสร้าง PDF
- **QRCode** สำหรับ PromptPay

### Database
- ใช้ฐานข้อมูล MySQL เดิม (`accnext`)
- เพิ่มฟิลด์ภาษีในตาราง `incomes` และ `expenses`
- ตารางใหม่สำหรับจัดการภาษี

## 📦 การติดตั้ง

### 1. Clone Repository
```bash
git clone <repository-url>
cd accnext
```

### 2. ติดตั้ง Dependencies
```bash
cd frontend
npm install
```

### 3. ตั้งค่าฐานข้อมูล
```bash
# Import migration script
mysql -u root -p accnext < migration-tax-system.sql
```

### 4. ตั้งค่าไฟล์ Environment
```bash
# สร้างไฟล์ .env.local
cp env.example .env.local
```

แก้ไขไฟล์ `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=accnext
VAT_RATE=0.07
TZ=Asia/Bangkok
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. เพิ่มฟอนต์ไทย
วางไฟล์ฟอนต์ในโฟลเดอร์ `public/fonts/`:
- `THSarabunNew.ttf`
- `THSarabunNew Bold.ttf` 
- `THSarabunNew Italic.ttf`
- `THSarabunNew BoldItalic.ttf`

### 6. เพิ่มโลโก้บริษัท
วางไฟล์โลโก้ในโฟลเดอร์ `public/logo.png`

### 7. รันระบบ
```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000/tax`

## 📚 การใช้งาน

### เส้นทางหลัก
- `/tax` - แดชบอร์ดหลัก
- `/tax/invoices` - จัดการใบกำกับภาษี
- `/tax/invoices/new` - ออกใบกำกับใหม่
- `/tax/purchases/new` - บันทึกใบซื้อ
- `/tax/reports/vat` - รายงาน ภ.พ.30
- `/tax/reports/wht` - รายงาน ภ.ง.ด.3/53

### API Endpoints
```
POST /api/invoices                  # สร้างใบกำกับภาษี
GET  /api/invoices                  # ดึงรายการใบกำกับ
GET  /api/invoices/[id]/pdf         # ดาวน์โหลด PDF ใบกำกับ

POST /api/purchases                 # สร้างใบซื้อ + WHT cert
GET  /api/purchases                 # ดึงรายการใบซื้อ

GET  /api/reports/vat               # รายงาน VAT JSON
GET  /api/reports/vat/pdf           # รายงาน VAT PDF
GET  /api/reports/wht               # รายงาน WHT JSON 
GET  /api/reports/wht/pdf           # รายงาน WHT PDF

GET  /api/tax-codes                 # รหัสภาษี
GET  /api/parties                   # คู่ค้า
GET  /api/items                     # สินค้า/บริการ

POST /api/incomes-tax               # รายรับที่มีภาษี
POST /api/expenses-tax              # รายจ่ายที่มีภาษี
GET  /api/dashboard-tax             # ข้อมูลแดชบอร์ด
```

## 💰 สูตรคำนวณภาษี

### VAT 7%
```javascript
// คำนวณจากยอดรวม VAT
const baseAmount = totalAmount / (1 + vatRate);
const vatAmount = totalAmount - baseAmount;
```

### WHT (หัก ณ ที่จ่าย)
```javascript
// คำนวณจากฐานก่อน VAT (เฉพาะบริการ)
const whtAmount = serviceBaseAmount * whtRate;
const netReceivable = grandTotal - whtAmount;
```

### ตัวอย่างการคำนวณ
**รายการผสม:**
- สินค้า: 10,000 บาท (VAT 7%)
- บริการ: 5,000 บาท (VAT 7%, WHT 3%)

**ผลลัพธ์:**
- ฐานรวม: 15,000 บาท
- VAT 7%: 1,050 บาท  
- ยอดรวม: 16,050 บาท
- WHT 3%: 150 บาท (จากฐานบริการ 5,000)
- รับเงินสุทธิ: 15,900 บาท

## 🗄️ โครงสร้างฐานข้อมูล

### ตารางเดิม (ขยาย)
```sql
-- incomes: เพิ่มฟิลด์ภาษี
ALTER TABLE incomes ADD COLUMN vat_rate DECIMAL(5,2);
ALTER TABLE incomes ADD COLUMN vat_amount DECIMAL(12,2);
ALTER TABLE incomes ADD COLUMN wht_amount DECIMAL(12,2);
ALTER TABLE incomes ADD COLUMN tax_invoice_no VARCHAR(20);

-- expenses: เพิ่มฟิลด์ภาษี  
ALTER TABLE expenses ADD COLUMN vat_rate DECIMAL(5,2);
ALTER TABLE expenses ADD COLUMN vat_amount DECIMAL(12,2);
ALTER TABLE expenses ADD COLUMN wht_amount DECIMAL(12,2);
ALTER TABLE expenses ADD COLUMN vendor_invoice_no VARCHAR(50);
```

### ตารางใหม่
```sql
-- org_profile: ข้อมูลองค์กร
-- tax_codes: รหัสภาษี VAT/WHT
-- parties: คู่ค้า (ลูกค้า/ผู้ขาย)
-- wht_cert_received: หนังสือรับรองที่ได้รับ
-- wht_cert_issued: หนังสือรับรองที่ออก
```

## 📋 รายการตรวจสอบ (Checklist)

### การติดตั้ง
- [ ] Clone repository
- [ ] ติดตั้ง dependencies  
- [ ] Import migration script
- [ ] ตั้งค่า environment variables
- [ ] เพิ่มฟอนต์ไทย
- [ ] เพิ่มโลโก้บริษัท
- [ ] ทดสอบเชื่อมต่อฐานข้อมูล

### การทดสอบ
- [ ] ออกใบกำกับภาษี/ใบเสร็จ
- [ ] ดาวน์โหลด PDF ใบกำกับ
- [ ] บันทึกใบซื้อพร้อม WHT
- [ ] สร้างรายงาน ภ.พ.30
- [ ] สร้างรายงาน ภ.ง.ด.3/53
- [ ] ทดสอบ PromptPay QR
- [ ] ตรวจสอบการคำนวณภาษี

## 🎯 การปรับแต่ง

### ปรับแต่งอัตราภาษี
แก้ไขในตาราง `tax_codes`:
```sql
UPDATE tax_codes SET rate = 7.00 WHERE code = 'VAT7';
UPDATE tax_codes SET rate = 3.00 WHERE code = 'WHT3';
```

### ปรับแต่งข้อมูลองค์กร
แก้ไขในตาราง `org_profile`:
```sql
UPDATE org_profile SET 
  org_name = 'ชื่อบริษัทของคุณ',
  tax_id = '1234567890123',
  address = 'ที่อยู่บริษัท'
WHERE id = 1;
```

### ปรับแต่งเลขที่เอกสาร
แก้ไขในไฟล์ `lib/db.ts` ฟังก์ชัน `generateDocNo()`:
```javascript
export function generateDocNo(prefix: string, date: Date = new Date()): string {
  // ปรับรูปแบบตามต้องการ
  return `${prefix}${year}${month}${day}${sequence}`;
}
```

## 🔧 การแก้ไขปัญหา

### ไม่สามารถเชื่อมต่อฐานข้อมูล
1. ตรวจสอบการตั้งค่าใน `.env.local`
2. ตรวจสอบว่า MySQL เปิดอยู่
3. ตรวจสอบสิทธิ์การเข้าถึงฐานข้อมูล

### PDF ไม่แสดงฟอนต์ไทย
1. ตรวจสอบไฟล์ฟอนต์ใน `public/fonts/`
2. ตรวจสอบ path ในไฟล์ PDF routes
3. ตรวจสอบสิทธิ์การเข้าถึงไฟล์

### การคำนวณภาษีไม่ถูกต้อง
1. ตรวจสอบอัตราภาษีในตาราง `tax_codes`
2. ตรวจสอบฟังก์ชันคำนวณใน `lib/tax.ts`
3. ตรวจสอบการส่งข้อมูลจาก frontend

## 📞 การสนับสนุน

สำหรับข้อสงสัยหรือปัญหาการใช้งาน กรุณาติดต่อทีมพัฒนา

---

**หมายเหตุ:** ระบบนี้ใช้อัตราภาษี VAT 7% ซึ่งมีผลบังคับใช้ถึง 30 กันยายน 2568 หากมีการเปลี่ยนแปลงอัตราภาษี กรุณาอัปเดตในตาราง `tax_codes`