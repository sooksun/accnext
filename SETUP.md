# AccNext - คู่มือการติดตั้งและใช้งาน

## 📋 ความต้องการของระบบ

### Software Requirements
- **Node.js** 18+ 
- **MySQL** 8.0+
- **npm** หรือ **yarn**

### Hardware Requirements
- **RAM**: 2GB+ (แนะนำ 4GB+)
- **Storage**: 10GB+ สำหรับฐานข้อมูลและไฟล์
- **Network**: การเชื่อมต่ออินเทอร์เน็ตสำหรับการอัปเดต

## 🚀 การติดตั้ง

### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd accnext
```

### 2. ติดตั้ง Backend

```bash
cd backend
npm install
```

### 3. ตั้งค่าฐานข้อมูล

1. **สร้างฐานข้อมูล MySQL:**
```sql
CREATE DATABASE accnext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **สร้างไฟล์ .env:**
```bash
cp env.example .env
```

3. **แก้ไขไฟล์ .env:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=accnext
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@solutionnextgen.com

# Notification Email
NOTIFICATION_EMAIL=sooksun2511@gmail.com

# File Upload Configuration
MAX_FILE_SIZE=5MB
UPLOAD_PATH=uploads/

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 0 * * 0
BACKUP_RETENTION_DAYS=30
```

### 4. รัน Migrations และ Seeders

```bash
# รัน migrations
npm run migrate

# รัน seeders
npm run seed
```

### 5. ติดตั้ง Frontend

```bash
cd ../frontend
npm install
```

### 6. ตั้งค่า Frontend

สร้างไฟล์ `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🏃‍♂️ การรันระบบ

### 1. เริ่มต้น Backend

```bash
cd backend
npm run dev
```

Backend จะทำงานที่ `http://localhost:5000`

### 2. เริ่มต้น Frontend

```bash
cd frontend
npm run dev
```

Frontend จะทำงานที่ `http://localhost:3000`

## 👥 บัญชีเริ่มต้น

หลังจากรัน seeders แล้ว จะมีบัญชีเริ่มต้นดังนี้:

| บทบาท | อีเมล | รหัสผ่าน | สิทธิ์ |
|--------|-------|----------|--------|
| Admin | admin@accnext.com | password123 | เต็มรูปแบบ |
| Accountant | accountant@accnext.com | password123 | จัดการข้อมูล |
| Viewer | viewer@accnext.com | password123 | ดูข้อมูลเท่านั้น |

## 📊 ฟีเจอร์หลัก

### 1. การจัดการรายได้/รายจ่าย

#### เพิ่มรายได้/รายจ่าย
1. เข้าสู่ระบบ
2. ไปที่หน้า "รายได้" หรือ "รายจ่าย"
3. คลิกปุ่ม "เพิ่มใหม่"
4. กรอกข้อมูล:
   - จำนวนเงิน
   - รายละเอียด
   - หมวดหมู่
   - วันที่ (ถ้าไม่ระบุจะใช้วันที่ปัจจุบัน)
5. คลิก "บันทึก"

#### แก้ไขรายได้/รายจ่าย
1. ในหน้ารายการ คลิกไอคอน "แก้ไข"
2. แก้ไขข้อมูลที่ต้องการ
3. คลิก "บันทึก"

#### ลบรายได้/รายจ่าย
1. ในหน้ารายการ คลิกไอคอน "ลบ"
2. ยืนยันการลบ

### 2. การดูรายงาน

#### รายงานรายเดือน
- ไปที่หน้า "รายงาน"
- เลือก "รายเดือน"
- เลือกปีและเดือน
- ดูสรุปยอดรวมและรายละเอียด

#### รายงานรายปี
- เลือก "รายปี"
- เลือกปี
- ดูสรุปยอดรวมรายปี

#### รายงานช่วงวันที่
- เลือก "ช่วงวันที่"
- ระบุวันที่เริ่มต้นและสิ้นสุด
- ดูรายงานตามช่วงที่กำหนด

### 3. การสร้าง PDF

#### ใบเสร็จรับเงิน
1. ในหน้ารายการรายได้/รายจ่าย
2. คลิกไอคอน PDF ข้างรายการ
3. ดาวน์โหลดไฟล์ PDF

#### รายงาน PDF
1. ในหน้ารายงาน
2. คลิกปุ่ม "สร้าง PDF"
3. ดาวน์โหลดไฟล์รายงาน

### 4. การ Import ข้อมูล

#### ดาวน์โหลดเทมเพลต
1. ไปที่หน้า "Import"
2. คลิก "ดาวน์โหลดเทมเพลต"
3. เลือกรูปแบบไฟล์ (CSV หรือ Excel)

#### Import ข้อมูล
1. เตรียมไฟล์ตามเทมเพลต
2. อัปโหลดไฟล์
3. ตรวจสอบผลลัพธ์

**รูปแบบไฟล์ที่รองรับ:**
- CSV (.csv)
- Excel (.xlsx, .xls)

**คอลัมน์ที่จำเป็น:**
- `amount` - จำนวนเงิน
- `description` - รายละเอียด
- `category` - หมวดหมู่

**คอลัมน์ที่เลือกได้:**
- `date` - วันที่ (YYYY-MM-DD)
- `notes` - หมายเหตุ

### 5. ระบบ Backup

#### สร้าง Backup ด้วยตนเอง (Admin เท่านั้น)
1. ไปที่หน้า "Backup"
2. คลิก "สร้าง Backup"
3. รอการสร้างเสร็จ

#### ตั้งค่า Backup อัตโนมัติ
1. ไปที่หน้า "Backup"
2. ตั้งค่าการทำงานอัตโนมัติ
3. เลือกความถี่ (รายวัน/รายสัปดาห์/รายเดือน)

#### กู้คืนข้อมูล
1. ไปที่หน้า "Backup"
2. เลือกไฟล์ backup
3. คลิก "กู้คืน"
4. ยืนยันการกู้คืน

## 🔧 การตั้งค่าเพิ่มเติม

### Email Configuration

สำหรับการแจ้งเตือนทางอีเมล ต้องตั้งค่า SMTP:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**หมายเหตุ:** สำหรับ Gmail ต้องใช้ App Password ไม่ใช่รหัสผ่านปกติ

### Backup Configuration

```env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 0 * * 0  # ทุกวันอาทิตย์เวลาเที่ยงคืน
BACKUP_RETENTION_DAYS=30
```

### File Upload Configuration

```env
MAX_FILE_SIZE=5MB
UPLOAD_PATH=uploads/
```

## 🛠️ การแก้ไขปัญหา

### ปัญหาการเชื่อมต่อฐานข้อมูล

1. **ตรวจสอบการตั้งค่า MySQL:**
```bash
mysql -u root -p
```

2. **ตรวจสอบฐานข้อมูล:**
```sql
SHOW DATABASES;
USE accnext;
SHOW TABLES;
```

3. **ตรวจสอบไฟล์ .env:**
```env
DB_HOST=localhost
DB_NAME=accnext
DB_USER=root
DB_PASSWORD=
```

### ปัญหาการรัน Migrations

```bash
# ลบ migrations ที่มีปัญหา
npm run migrate:undo

# รัน migrations ใหม่
npm run migrate
```

### ปัญหาการ Import ข้อมูล

1. **ตรวจสอบรูปแบบไฟล์:**
   - ไฟล์ต้องเป็น CSV หรือ Excel
   - ขนาดไฟล์ไม่เกิน 5MB

2. **ตรวจสอบคอลัมน์:**
   - ต้องมีคอลัมน์ `amount`, `description`, `category`
   - ข้อมูลต้องไม่ว่าง

3. **ตรวจสอบข้อมูล:**
   - `amount` ต้องเป็นตัวเลขที่มากกว่า 0
   - `date` ต้องเป็นรูปแบบ YYYY-MM-DD

### ปัญหาการสร้าง PDF

1. **ตรวจสอบสิทธิ์การเขียนไฟล์:**
```bash
# สร้างโฟลเดอร์ uploads
mkdir -p backend/uploads/receipts
mkdir -p backend/uploads/reports
chmod 755 backend/uploads
```

2. **ตรวจสอบ dependencies:**
```bash
npm install pdfkit
```

### ปัญหาการ Backup

1. **ตรวจสอบ mysqldump:**
```bash
which mysqldump
```

2. **ตรวจสอบสิทธิ์การเขียน:**
```bash
mkdir -p backend/backups
chmod 755 backend/backups
```

## 📞 การสนับสนุน

หากพบปัญหาในการติดตั้งหรือใช้งาน:

1. **ตรวจสอบ Logs:**
   - Backend: ดู console output
   - Frontend: ดู browser console

2. **ตรวจสอบ Network:**
   - Backend API: `http://localhost:5000/health`
   - Frontend: `http://localhost:3000`

3. **ติดต่อทีมพัฒนา:**
   - Email: support@solutionnextgen.com
   - Line: @solutionnextgen

## 🔄 การอัปเดต

### อัปเดต Backend
```bash
cd backend
git pull
npm install
npm run migrate
```

### อัปเดต Frontend
```bash
cd frontend
git pull
npm install
```

## 📝 การบำรุงรักษา

### การทำความสะอาด Logs
```bash
# ลบ logs เก่า
find backend/logs -name "*.log" -mtime +30 -delete
```

### การทำความสะอาด Uploads
```bash
# ลบไฟล์ uploads เก่า
find backend/uploads -name "*.pdf" -mtime +90 -delete
```

### การทำความสะอาด Backups
```bash
# ลบ backups เก่า (อัตโนมัติ)
# หรือใช้ API: POST /api/backup/clean
```

---

**พัฒนาโดย Solution NextGen**  
**เวอร์ชัน 1.0.0**