# AccNext - Docker Deployment Guide

## 🐳 การใช้งาน Docker

คู่มือการติดตั้งและใช้งาน AccNext ผ่าน Docker สำหรับ CasaOS

## 📋 ความต้องการของระบบ

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **CasaOS** (สำหรับ deployment บน CasaOS)

## 🚀 การติดตั้งแบบรวดเร็ว

### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd accnext
```

### 2. ตั้งค่า Environment Variables

```bash
# คัดลอกไฟล์ env.example
cp env.example .env

# แก้ไขไฟล์ .env ตามการตั้งค่าของคุณ
nano .env
```

### 3. สร้างโฟลเดอร์สำหรับข้อมูล

```bash
mkdir -p data/db data/uploads data/backup
```

### 4. รันระบบด้วย Docker Compose

```bash
docker-compose up -d
```

### 5. เข้าสู่ระบบ

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

**บัญชีเริ่มต้น:**
- **Admin**: admin@solutionnextgen.com / password123
- **Accountant**: accountant@solutionnextgen.com / password123
- **Viewer**: viewer@solutionnextgen.com / password123

## ⚙️ การตั้งค่า Environment Variables

### Database Configuration
```env
DB_HOST=mysql
DB_PORT=3306
DB_NAME=accnext
DB_USER=accnext_user
DB_PASSWORD=accnext_password
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d
```

### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@solutionnextgen.com
NOTIFICATION_EMAIL=sooksun2511@gmail.com
```

### LINE OA Configuration
```env
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here
LINE_GROUP_ID=your_line_group_id_here
```

### RD Prep API Configuration
```env
RD_PREP_API_URL=https://api.rdprep.go.th/v1
RD_PREP_API_KEY=your_rd_prep_api_key_here
RD_PREP_COMPANY_ID=your_company_id_here
```

## 🏗️ โครงสร้าง Docker

```
accnext/
├── Dockerfile.backend          # Backend Docker image
├── Dockerfile.frontend         # Frontend Docker image
├── docker-compose.yml          # Docker Compose configuration
├── nginx.conf                  # Nginx reverse proxy
├── env.example                 # Environment variables template
├── data/                       # Persistent data
│   ├── db/                     # MySQL database files
│   ├── uploads/                # Uploaded files
│   └── backup/                 # Database backups
└── README-DOCKER.md           # This file
```

## 🔧 การจัดการ Container

### ดูสถานะ Container
```bash
docker-compose ps
```

### ดู Logs
```bash
# ทั้งหมด
docker-compose logs

# เฉพาะ backend
docker-compose logs backend

# เฉพาะ frontend
docker-compose logs frontend

# เฉพาะ database
docker-compose logs mysql
```

### หยุดระบบ
```bash
docker-compose down
```

### รีสตาร์ทระบบ
```bash
docker-compose restart
```

### อัปเดตระบบ
```bash
# ดึง image ใหม่
docker-compose pull

# รีสตาร์ทด้วย image ใหม่
docker-compose up -d
```

## 📊 การจัดการข้อมูล

### Backup ฐานข้อมูล
```bash
# สร้าง backup
docker-compose exec backend npm run backup

# ดูรายการ backup
docker-compose exec backend npm run backup:list
```

### Restore ฐานข้อมูล
```bash
# กู้คืนจาก backup
docker-compose exec backend npm run backup:restore <filename>
```

### Import ข้อมูลตัวอย่าง
```bash
# รัน migrations
docker-compose exec backend npm run migrate

# รัน seeders
docker-compose exec backend npm run seed
```

## 🔒 ความปลอดภัย

### เปลี่ยนรหัสผ่านเริ่มต้น
```bash
# เข้าไปใน backend container
docker-compose exec backend bash

# รัน script เปลี่ยนรหัสผ่าน
node scripts/change-password.js
```

### ตั้งค่า SSL/HTTPS
1. เพิ่ม SSL certificate ใน `nginx/ssl/`
2. แก้ไข `nginx.conf` เพื่อใช้ HTTPS
3. รีสตาร์ท nginx container

### Firewall Configuration
```bash
# เปิดพอร์ตที่จำเป็น
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp
```

## 🐛 การแก้ไขปัญหา

### ตรวจสอบสถานะระบบ
```bash
# ตรวจสอบ health check
curl http://localhost/health

# ตรวจสอบ API
curl http://localhost:5000/health

# ตรวจสอบ frontend
curl http://localhost:3000
```

### ปัญหาที่พบบ่อย

#### 1. Container ไม่สามารถเชื่อมต่อฐานข้อมูลได้
```bash
# ตรวจสอบ MySQL container
docker-compose logs mysql

# รีสตาร์ท MySQL
docker-compose restart mysql
```

#### 2. Frontend ไม่สามารถเชื่อมต่อ Backend ได้
```bash
# ตรวจสอบ network
docker network ls
docker network inspect accnext_accnext_network

# รีสตาร์ท frontend
docker-compose restart frontend
```

#### 3. ไฟล์อัปโหลดไม่แสดง
```bash
# ตรวจสอบ permissions
docker-compose exec backend ls -la uploads/

# แก้ไข permissions
docker-compose exec backend chmod -R 755 uploads/
```

#### 4. LINE Bot ไม่ทำงาน
```bash
# ตรวจสอบ LINE configuration
docker-compose exec backend node -e "console.log(process.env.LINE_CHANNEL_ACCESS_TOKEN)"

# ทดสอบ LINE connection
curl -X POST http://localhost:5000/api/line/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📈 การ Monitor และ Logging

### ดู Resource Usage
```bash
# ดูการใช้ CPU และ Memory
docker stats

# ดู disk usage
docker system df
```

### ตั้งค่า Log Rotation
```bash
# สร้างไฟล์ logrotate configuration
sudo nano /etc/logrotate.d/accnext

# เพิ่ม configuration
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
```

## 🔄 การอัปเดตระบบ

### อัปเดตแบบ Manual
```bash
# ดึงโค้ดใหม่
git pull origin main

# Build images ใหม่
docker-compose build

# รีสตาร์ทระบบ
docker-compose up -d
```

### อัปเดตแบบอัตโนมัติ (Watchtower)
```bash
# ติดตั้ง Watchtower
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --cleanup \
  --interval 86400
```

## 📞 การสนับสนุน

หากมีปัญหาในการใช้งาน กรุณาติดต่อ:
- **Email**: support@solutionnextgen.com
- **Documentation**: ดูไฟล์ `README.md` สำหรับรายละเอียดเพิ่มเติม
- **Issues**: สร้าง issue ใน GitHub repository

## 📄 License

MIT License - ดูรายละเอียดในไฟล์ `LICENSE`

---

**พัฒนาโดย Solution NextGen**  
**เวอร์ชัน**: 1.0.0  
**อัปเดตล่าสุด**: 7 สิงหาคม 2025 