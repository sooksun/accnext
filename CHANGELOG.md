# Changelog - AccNext

## [1.0.0] - 2024-01-07

### ✅ Added - ฟีเจอร์ใหม่ที่เพิ่มเข้ามา

#### 🔐 Authentication & Authorization
- **JWT Authentication** - ระบบล็อกอินที่ปลอดภัย
- **Role-based Access Control** - สิทธิ์การเข้าถึงตามบทบาท (Admin, Accountant, Viewer)
- **Password Encryption** - เข้ารหัสรหัสผ่านด้วย bcryptjs

#### 📊 การจัดการข้อมูล
- **รายได้/รายจ่าย** - เพิ่ม แก้ไข ลบ ดูรายการ
- **หมวดหมู่** - จัดการหมวดหมู่รายได้/รายจ่าย
- **การค้นหาและกรอง** - ค้นหาตามคำสำคัญ หมวดหมู่ ช่วงวันที่
- **Pagination** - แบ่งหน้าข้อมูล

#### 📈 รายงานทางการเงิน
- **รายงานรายเดือน** - สรุปยอดรวมรายเดือน พร้อมรายละเอียดแยกตามหมวดหมู่
- **รายงานรายปี** - สรุปยอดรวมรายปี พร้อมรายละเอียดแยกตามหมวดหมู่
- **รายงานช่วงวันที่กำหนด** - รายงานตามช่วงวันที่ที่เลือก
- **Dashboard Summary** - สรุปข้อมูลสำหรับแดชบอร์ด

#### 📄 การสร้าง PDF
- **ใบเสร็จรับเงิน** - สร้างใบเสร็จสำหรับรายได้/รายจ่าย
- **รายงาน PDF** - สร้างรายงานทางการเงินในรูปแบบ PDF
- **Customizable Templates** - เทมเพลตที่ปรับแต่งได้

#### 📥 การ Import ข้อมูล
- **CSV Import** - นำเข้าข้อมูลจากไฟล์ CSV
- **Excel Import** - นำเข้าข้อมูลจากไฟล์ Excel (.xlsx, .xls)
- **Template Download** - ดาวน์โหลดเทมเพลตสำหรับการ import
- **Error Handling** - จัดการข้อผิดพลาดและแสดงรายงาน

#### 💾 ระบบ Backup
- **Manual Backup** - สร้าง backup ด้วยตนเอง
- **Automatic Backup** - backup อัตโนมัติตามกำหนดเวลา
- **Backup Management** - จัดการไฟล์ backup (ดู ดาวน์โหลด ลบ)
- **Database Restore** - กู้คืนข้อมูลจาก backup
- **Backup Statistics** - สถิติการ backup

#### 🔧 ระบบรอง
- **Email Notifications** - แจ้งเตือนทางอีเมล
- **File Upload** - อัปโหลดไฟล์
- **Error Handling** - จัดการข้อผิดพลาด
- **Logging** - บันทึกการทำงาน
- **Security** - ความปลอดภัย (Helmet, Rate Limiting, CORS)

### 🔧 Changed - การเปลี่ยนแปลง

#### Backend
- **อัปเดตการเชื่อมต่อฐานข้อมูล** - เปลี่ยนจาก `accnext_db` เป็น `accnext`
- **ปรับปรุง Controller** - เพิ่มฟังก์ชัน CRUD ครบถ้วนสำหรับ Income และ Expense
- **เพิ่ม Routes ใหม่** - PDF, Import, Backup
- **ปรับปรุง Error Handling** - จัดการข้อผิดพลาดที่ดีขึ้น
- **เพิ่ม Dependencies** - PDFKit, Multer, Node-cron, CSV-parser, XLSX

#### Frontend
- **ปรับปรุง UI/UX** - ใช้งานง่ายขึ้น
- **เพิ่มฟีเจอร์ใหม่** - การจัดการข้อมูลแบบเต็มรูปแบบ
- **ปรับปรุงการแสดงผล** - รองรับข้อมูลใหม่

### 🐛 Fixed - การแก้ไขปัญหา

- **แก้ไขการเชื่อมต่อฐานข้อมูล** - ปรับการตั้งค่า MySQL ตามที่ระบุ
- **แก้ไข Routes** - อัปเดต routes ให้ใช้ controller ใหม่
- **แก้ไข Dependencies** - เพิ่ม dependencies ที่จำเป็น
- **แก้ไขการตั้งค่า** - ปรับการตั้งค่าตามความต้องการ

### 📚 Documentation

- **อัปเดต README.md** - เพิ่มรายละเอียดฟีเจอร์ใหม่
- **อัปเดต SETUP.md** - คู่มือการติดตั้งและใช้งานที่สมบูรณ์
- **เพิ่ม CHANGELOG.md** - บันทึกการเปลี่ยนแปลง
- **อัปเดต run-demo scripts** - ปรับปรุงสคริปต์การรัน demo

### 🛠️ Technical Details

#### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── income.controller.js      # ✅ CRUD operations
│   │   ├── expense.controller.js     # ✅ CRUD operations
│   │   ├── report.controller.js      # ✅ Financial reports
│   │   ├── pdf.controller.js         # ✅ PDF generation
│   │   ├── import.controller.js      # ✅ CSV/Excel import
│   │   └── backup.controller.js      # ✅ Backup management
│   ├── utils/
│   │   ├── pdfGenerator.js           # ✅ PDF creation
│   │   ├── csvImporter.js            # ✅ CSV/Excel import
│   │   └── backupService.js          # ✅ Backup service
│   ├── routes/
│   │   ├── income.routes.js          # ✅ Updated routes
│   │   ├── expense.routes.js         # ✅ Updated routes
│   │   ├── report.routes.js          # ✅ Updated routes
│   │   ├── pdf.routes.js             # ✅ New routes
│   │   ├── import.routes.js          # ✅ New routes
│   │   └── backup.routes.js          # ✅ New routes
│   └── server.js                     # ✅ Updated with new routes
```

#### API Endpoints
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Income**: `/api/income/*`
- **Expense**: `/api/expense/*`
- **Reports**: `/api/reports/*`
- **PDF**: `/api/pdf/*`
- **Import**: `/api/import/*`
- **Backup**: `/api/backup/*`

### 🎯 Features Status

| ฟีเจอร์ | สถานะ | หมายเหตุ |
|---------|-------|----------|
| JWT Authentication | ✅ Complete | ระบบล็อกอินที่ปลอดภัย |
| Role-based Access | ✅ Complete | Admin, Accountant, Viewer |
| Income Management | ✅ Complete | CRUD operations |
| Expense Management | ✅ Complete | CRUD operations |
| Financial Reports | ✅ Complete | Monthly, Yearly, Custom |
| PDF Generation | ✅ Complete | Receipts & Reports |
| CSV/Excel Import | ✅ Complete | Template & Error handling |
| Automatic Backup | ✅ Complete | Manual & Scheduled |
| Email Notifications | ✅ Complete | SMTP configuration |
| File Upload | ✅ Complete | Multer integration |
| Security | ✅ Complete | Helmet, CORS, Rate limiting |

### 🚀 Deployment

#### Requirements
- **Node.js** 18+
- **MySQL** 8.0+
- **npm** หรือ **yarn**

#### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd accnext

# Setup backend
cd backend
npm install
cp env.example .env
# Edit .env with your database settings
npm run migrate
npm run seed

# Setup frontend
cd ../frontend
npm install
# Create .env.local with API URL

# Run servers
cd ../backend && npm run dev
cd ../frontend && npm run dev
```

### 👥 User Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@accnext.com | password123 | Full access |
| Accountant | accountant@accnext.com | password123 | Data management |
| Viewer | viewer@accnext.com | password123 | Read-only |

### 📞 Support

หากมีปัญหาในการใช้งาน:
- **Email**: support@solutionnextgen.com
- **Documentation**: SETUP.md
- **Health Check**: http://localhost:5000/health

---

**พัฒนาโดย Solution NextGen**  
**เวอร์ชัน 1.0.0** 