# AccNext - ระบบติดตามรายรับรายจ่าย

## 📋 ภาพรวม

AccNext เป็นระบบติดตามรายรับรายจ่ายที่พัฒนาสำหรับห้างหุ้นส่วนจำกัด "Solution NextGen" โดยใช้เทคโนโลยีสมัยใหม่และออกแบบให้ใช้งานง่ายสำหรับเจ้าหน้าที่บัญชีคนไทย

## 🚀 ฟีเจอร์หลัก

### ✅ **ระบบพื้นฐาน**
- **ระบบล็อกอิน (JWT Auth)** พร้อมการเข้ารหัสรหัสผ่าน
- **บันทึกวันที่อัตโนมัติ** ในแต่ละธุรกรรม
- **ติดตามรายรับ-รายจ่าย** พร้อมหมวดหมู่ (ค่าเช่า, เงินเดือน, วัสดุ ฯลฯ)
- **รายงานการเงินรายเดือน/รายปี**
- **สร้างใบเสร็จ PDF**
- **ระบบสิทธิ์ผู้ใช้**: แอดมิน, นักบัญชี, ผู้ชม
- **นำเข้าไฟล์ CSV/Excel**
- **สำรองข้อมูลอัตโนมัติ** รายสัปดาห์

### ✅ **ระบบแจ้งเตือน (ใหม่)**
- **แจ้งเตือนทางอีเมลเมื่อรายจ่ายเกินงบ** (ส่งที่ `sooksun2511@gmail.com`)
- **ระบบแจ้งเตือนอัตโนมัติ** ทุกวันเวลา 9:00 น.
- **รายงานประจำเดือนอัตโนมัติ** ทุกวันที่ 1 ของเดือนเวลา 8:00 น.
- **ทดสอบการส่งอีเมล** สำหรับตรวจสอบการตั้งค่า

### ✅ **LINE OA Integration (ใหม่)**
- **ส่งการแจ้งเตือนรายจ่ายเกิน 5,000 บาท** ผ่าน LINE
- **ส่งรายงานประจำวัน/เดือน** อัตโนมัติ
- **Webhook สำหรับรับข้อความ** จาก LINE
- **ทดสอบการเชื่อมต่อ LINE Bot**

### ✅ **RD Prep API Integration (ใหม่)**
- **ส่งข้อมูลรายรับ-รายจ่าย** ไปยังกรมสรรพากร
- **ส่งรายงานประจำเดือน/ปี** อัตโนมัติ
- **ตั้งเวลาส่งข้อมูล** ตามรอบบัญชี
- **ทดสอบการเชื่อมต่อ RD Prep API**

### ✅ **Docker Support (ใหม่)**
- **Docker Compose** สำหรับ CasaOS deployment
- **Nginx Reverse Proxy** พร้อม SSL support
- **Health Check** สำหรับ container monitoring
- **Persistent Data** สำหรับ database และไฟล์

## 🏗️ สถาปัตยกรรม

### Frontend
- **Next.js 15** with TypeScript
- **TailwindCSS** สำหรับ UI
- **React Hook Form** + **Zod** สำหรับ validation
- **Axios** สำหรับ HTTP requests
- **Recharts** สำหรับกราฟและสถิติ

### Backend
- **Node.js** with Express.js
- **MySQL** database with Sequelize ORM
- **JWT** สำหรับ authentication
- **bcryptjs** สำหรับเข้ารหัสรหัสผ่าน
- **Nodemailer** สำหรับส่งอีเมล
- **node-cron** สำหรับงานอัตโนมัติ
- **pdfkit** สำหรับสร้าง PDF
- **multer** สำหรับอัปโหลดไฟล์

## 📁 โครงสร้างโปรเจค

```
accnext/
├── frontend/                 # Next.js Frontend
│   ├── app/                 # App Router
│   │   ├── login/          # หน้าล็อกอิน
│   │   ├── dashboard/      # แดชบอร์ด
│   │   ├── income/         # จัดการรายรับ
│   │   ├── expense/        # จัดการรายจ่าย
│   │   └── report/         # รายงาน
│   ├── components/         # React Components
│   ├── lib/               # Utilities & API
│   └── public/            # Static files
├── backend/                # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # Business Logic
│   │   ├── models/        # Database Models
│   │   ├── routes/        # API Routes
│   │   ├── middleware/    # Custom Middleware
│   │   ├── utils/         # Utilities
│   │   │   ├── emailService.js      # Email Service
│   │   │   ├── notificationService.js # Notification Service
│   │   │   ├── pdfGenerator.js     # PDF Generation
│   │   │   ├── csvImporter.js      # CSV/Excel Import
│   │   │   └── backupService.js    # Backup Service
│   │   ├── migrations/    # Database Migrations
│   │   └── seeders/       # Sample Data
│   ├── uploads/           # File Uploads
│   │   ├── receipts/      # PDF Receipts
│   │   ├── reports/       # PDF Reports
│   │   └── backups/       # Database Backups
│   └── .env               # Environment Variables
├── README.md              # Project Documentation
├── SETUP.md              # Setup Guide
├── CHANGELOG.md          # Version History
└── run-demo.bat          # Windows Setup Script
```

## 🛠️ การติดตั้ง

### 1. ความต้องการของระบบ
- **Node.js** 18+
- **MySQL** 8.0+
- **npm** หรือ **yarn**

### 2. Clone และติดตั้ง

```bash
# Clone โปรเจค
git clone <repository-url>
cd accnext

# ติดตั้ง Backend
cd backend
npm install

# ติดตั้ง Frontend
cd ../frontend
npm install
```

### 3. ตั้งค่าฐานข้อมูล

1. **สร้างฐานข้อมูล MySQL:**
```sql
CREATE DATABASE accnext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **แก้ไขการตั้งค่าฐานข้อมูลใน `backend/.env`:**
```env
DB_HOST=localhost
DB_NAME=accnext
DB_USER=root
DB_PASSWORD=
```

### 4. รัน Migrations และ Seeders

```bash
cd backend
npm run migrate
npm run seed
```

### 5. เริ่มต้นเซิร์ฟเวอร์

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 6. เข้าสู่ระบบ

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

**บัญชีเริ่มต้น:**
- **Admin**: admin@solutionnextgen.com / password123
- **Accountant**: accountant@solutionnextgen.com / password123
- **Viewer**: viewer@solutionnextgen.com / password123

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - ล็อกอิน
- `POST /api/auth/register` - ลงทะเบียน

### Users
- `GET /api/users/profile` - ดูโปรไฟล์
- `PUT /api/users/profile` - แก้ไขโปรไฟล์

### Income
- `GET /api/income` - ดูรายการรายได้
- `POST /api/income` - เพิ่มรายได้
- `PUT /api/income/:id` - แก้ไขรายได้
- `DELETE /api/income/:id` - ลบรายได้
- `GET /api/income/stats/summary` - สถิติรายได้

### Expense
- `GET /api/expense` - ดูรายการรายจ่าย
- `POST /api/expense` - เพิ่มรายจ่าย
- `PUT /api/expense/:id` - แก้ไขรายจ่าย
- `DELETE /api/expense/:id` - ลบรายจ่าย
- `GET /api/expense/stats/summary` - สถิติรายจ่าย
- `GET /api/expense/alerts/budget` - การแจ้งเตือนงบประมาณ

### Reports
- `GET /api/reports/dashboard` - สรุปแดชบอร์ด
- `GET /api/reports/monthly` - รายงานรายเดือน
- `GET /api/reports/yearly` - รายงานรายปี

### Notifications (ใหม่)
- `POST /api/notifications/test-email` - ทดสอบการส่งอีเมล
- `POST /api/notifications/start` - เริ่มต้นระบบแจ้งเตือน
- `POST /api/notifications/stop` - หยุดระบบแจ้งเตือน
- `GET /api/notifications/status` - สถานะระบบแจ้งเตือน

### LINE OA Integration (ใหม่)
- `GET /api/line/status` - ตรวจสอบสถานะ LINE Bot
- `POST /api/line/send-message` - ส่งข้อความไปยัง LINE
- `POST /api/line/send-expense-alert` - ส่งการแจ้งเตือนรายจ่ายเกิน 5,000 บาท
- `POST /api/line/send-daily-report` - ส่งรายงานประจำวัน
- `POST /api/line/send-monthly-report` - ส่งรายงานประจำเดือน
- `POST /api/line/webhook` - รับ Webhook จาก LINE
- `POST /api/line/test` - ทดสอบการส่งข้อความ LINE

### RD Prep API Integration (ใหม่)
- `GET /api/rdprep/status` - ตรวจสอบสถานะการเชื่อมต่อ RD Prep API
- `POST /api/rdprep/send-income` - ส่งข้อมูลรายรับไปยัง RD Prep
- `POST /api/rdprep/send-expense` - ส่งข้อมูลรายจ่ายไปยัง RD Prep
- `POST /api/rdprep/send-monthly-report` - ส่งรายงานประจำเดือนไปยัง RD Prep
- `POST /api/rdprep/send-yearly-report` - ส่งรายงานประจำปีไปยัง RD Prep
- `GET /api/rdprep/fetch-data` - ดึงข้อมูลจาก RD Prep API
- `POST /api/rdprep/schedule-sync` - ตั้งเวลาส่งข้อมูลไปยัง RD Prep
- `POST /api/rdprep/sync-now` - ส่งข้อมูลไปยัง RD Prep ทันที
- `POST /api/rdprep/test` - ทดสอบการเชื่อมต่อ RD Prep API

### PDF Generation
- `GET /api/pdf/income/:id/receipt` - สร้างใบเสร็จรายรับ
- `GET /api/pdf/expense/:id/receipt` - สร้างใบเสร็จรายจ่าย
- `GET /api/pdf/report/monthly` - สร้างรายงานรายเดือน PDF
- `GET /api/pdf/report/yearly` - สร้างรายงานรายปี PDF

### Data Import
- `POST /api/import/income` - นำเข้ารายรับจากไฟล์
- `POST /api/import/expense` - นำเข้ารายจ่ายจากไฟล์
- `GET /api/import/template` - ดาวน์โหลดเทมเพลต
- `GET /api/import/template/download` - ดาวน์โหลดไฟล์เทมเพลต

### Backup System
- `POST /api/backup` - สร้าง backup
- `GET /api/backup` - ดูรายการ backup
- `GET /api/backup/download/:fileName` - ดาวน์โหลด backup
- `DELETE /api/backup/:fileName` - ลบ backup
- `POST /api/backup/restore/:fileName` - กู้คืนจาก backup
- `GET /api/backup/stats` - สถิติ backup
- `POST /api/backup/clean` - ลบ backup เก่า
- `POST /api/backup/schedule` - ตั้งค่า backup อัตโนมัติ

## 🔧 การตั้งค่า Email

สำหรับการแจ้งเตือนทางอีเมล ต้องตั้งค่า SMTP ใน `backend/.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@solutionnextgen.com

# Notification Email
NOTIFICATION_EMAIL=sooksun2511@gmail.com
```

**หมายเหตุ:** สำหรับ Gmail ต้องใช้ App Password ไม่ใช่รหัสผ่านปกติ

## 🔧 การตั้งค่า LINE OA

สำหรับการแจ้งเตือนผ่าน LINE ต้องตั้งค่าใน `backend/.env`:

```env
# LINE OA Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here
LINE_GROUP_ID=your_line_group_id_here
```

**หมายเหตุ:** ต้องสร้าง LINE Official Account และตั้งค่า Webhook URL เป็น `https://your-domain.com/api/line/webhook`

## 🔧 การตั้งค่า RD Prep API

สำหรับการส่งข้อมูลไปยังกรมสรรพากร ต้องตั้งค่าใน `backend/.env`:

```env
# RD Prep API Configuration
RD_PREP_API_URL=https://api.rdprep.go.th/v1
RD_PREP_API_KEY=your_rd_prep_api_key_here
RD_PREP_COMPANY_ID=your_company_id_here
```

**หมายเหตุ:** ต้องสมัครใช้งาน RD Prep API และได้รับ API Key จากกรมสรรพากร

## 📊 ข้อมูลตัวอย่าง

ระบบมาพร้อมกับข้อมูลตัวอย่าง:

### ผู้ใช้
- **Admin**: ผู้ดูแลระบบ (สิทธิ์เต็ม)
- **Accountant**: นักบัญชี (จัดการข้อมูล)
- **Viewer**: ผู้ชม (ดูข้อมูลเท่านั้น)

### หมวดหมู่
- **รายรับ**: รายได้จากการขาย, ดอกเบี้ยรับ, รายได้อื่นๆ
- **รายจ่าย**: ค่าเช่า, เงินเดือนพนักงาน, ค่าไฟฟ้า, ค่าน้ำประปา, วัสดุสำนักงาน, ค่าโทรศัพท์และอินเทอร์เน็ต, ค่าเดินทาง

### ข้อมูลตัวอย่าง
- **รายรับ**: 5 รายการ รวม 320,500 บาท
- **รายจ่าย**: 5 รายการ รวม 127,900 บาท

## 🎯 ฟีเจอร์พิเศษ

### ระบบแจ้งเตือนอัตโนมัติ
- **ตรวจสอบงบประมาณ**: ทุกวันเวลา 9:00 น.
- **รายงานประจำเดือน**: ทุกวันที่ 1 ของเดือนเวลา 8:00 น.
- **แจ้งเตือนเมื่อเกินงบ**: ส่งอีเมลไปที่ `sooksun2511@gmail.com`

### การจัดการไฟล์
- **อัปโหลดไฟล์**: รองรับ PDF, CSV, Excel
- **สร้าง PDF**: ใบเสร็จและรายงาน
- **Backup อัตโนมัติ**: รายสัปดาห์

### ความปลอดภัย
- **JWT Authentication**: ระบบล็อกอินที่ปลอดภัย
- **Role-based Access**: ควบคุมสิทธิ์ตามบทบาท
- **Input Validation**: ตรวจสอบข้อมูลที่ป้อน
- **Error Handling**: จัดการข้อผิดพลาดอย่างครอบคลุม

## 🚀 การใช้งาน

### สำหรับผู้ดูแลระบบ (Admin)
1. เข้าสู่ระบบด้วยบัญชี admin
2. จัดการผู้ใช้และสิทธิ์
3. ตั้งค่าระบบแจ้งเตือน
4. จัดการ backup และ restore
5. ดูรายงานและสถิติ
6. ตั้งค่า LINE OA และ RD Prep API
7. จัดการการเชื่อมต่อภายนอก

### สำหรับนักบัญชี (Accountant)
1. เข้าสู่ระบบด้วยบัญชี accountant
2. จัดการรายรับ-รายจ่าย
3. สร้างรายงาน
4. นำเข้าข้อมูลจากไฟล์
5. สร้าง PDF ใบเสร็จ
6. ตรวจสอบการแจ้งเตือน LINE
7. ส่งข้อมูลไปยัง RD Prep

### สำหรับผู้ชม (Viewer)
1. เข้าสู่ระบบด้วยบัญชี viewer
2. ดูข้อมูลและรายงาน
3. ไม่สามารถแก้ไขข้อมูลได้
4. รับการแจ้งเตือนผ่าน LINE (ถ้าถูกเพิ่มในกลุ่ม)

## 🐳 การใช้งาน Docker

สำหรับการใช้งานบน CasaOS หรือ Docker environment:

```bash
# Clone โปรเจค
git clone <repository-url>
cd accnext

# ตั้งค่า environment variables
cp env.example .env
# แก้ไขไฟล์ .env ตามการตั้งค่าของคุณ

# สร้างโฟลเดอร์สำหรับข้อมูล
mkdir -p data/db data/uploads data/backup

# รันระบบ
docker-compose up -d
```

ดูรายละเอียดเพิ่มเติมใน `README-DOCKER.md`

## 📞 การสนับสนุน

หากมีปัญหาในการใช้งาน กรุณาติดต่อ:
- **Email**: support@solutionnextgen.com
- **Documentation**: ดูไฟล์ `SETUP.md` สำหรับรายละเอียดเพิ่มเติม

## 📄 License

MIT License - ดูรายละเอียดในไฟล์ `LICENSE`

---

**พัฒนาโดย Solution NextGen**  
**เวอร์ชัน**: 1.0.0  
**อัปเดตล่าสุด**: 7 สิงหาคม 2025