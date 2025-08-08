#!/bin/bash

echo "========================================"
echo "   AccNext - Financial Tracking System"
echo "   Solution NextGen"
echo "========================================"
echo

echo "[1/6] ตรวจสอบ Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ ไม่พบ Node.js กรุณาติดตั้ง Node.js 18+ ก่อน"
    exit 1
fi
echo "✅ Node.js พร้อมใช้งาน"

echo
echo "[2/6] ตรวจสอบ MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "❌ ไม่พบ MySQL กรุณาติดตั้ง MySQL 8.0+ ก่อน"
    exit 1
fi
echo "✅ MySQL พร้อมใช้งาน"

echo
echo "[3/6] ติดตั้ง Backend Dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 ติดตั้ง dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ การติดตั้ง Backend dependencies ล้มเหลว"
        exit 1
    fi
else
    echo "✅ Backend dependencies ติดตั้งแล้ว"
fi

echo
echo "[4/6] ตั้งค่าฐานข้อมูล..."
if [ ! -f ".env" ]; then
    echo "📝 สร้างไฟล์ .env..."
    cp env.example .env
    echo "✅ สร้างไฟล์ .env สำเร็จ"
else
    echo "✅ ไฟล์ .env มีอยู่แล้ว"
fi

echo
echo "[5/6] รัน Database Migrations..."
echo "🔄 รัน migrations..."
npm run migrate
if [ $? -ne 0 ]; then
    echo "❌ การรัน migrations ล้มเหลว"
    exit 1
fi

echo
echo "[6/6] เพิ่มข้อมูลตัวอย่าง..."
echo "🌱 เพิ่มข้อมูลตัวอย่าง..."
npm run seed
if [ $? -ne 0 ]; then
    echo "❌ การเพิ่มข้อมูลตัวอย่างล้มเหลว"
    exit 1
fi

echo
echo "========================================"
echo "   เริ่มต้นเซิร์ฟเวอร์..."
echo "========================================"
echo

echo "🚀 เริ่มต้น Backend Server..."
gnome-terminal --title="Backend Server" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "Backend Server" -e "npm run dev; bash" 2>/dev/null || \
konsole --title "Backend Server" -e bash -c "npm run dev; exec bash" 2>/dev/null || \
echo "⚠️  ไม่สามารถเปิด terminal ใหม่ได้ กรุณารันคำสั่ง 'npm run dev' ใน backend directory ด้วยตนเอง"

echo
echo "⏳ รอ Backend เริ่มต้น (5 วินาที)..."
sleep 5

echo
echo "[7/7] ติดตั้ง Frontend Dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "📦 ติดตั้ง dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ การติดตั้ง Frontend dependencies ล้มเหลว"
        exit 1
    fi
else
    echo "✅ Frontend dependencies ติดตั้งแล้ว"
fi

echo
echo "🚀 เริ่มต้น Frontend Server..."
gnome-terminal --title="Frontend Server" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "Frontend Server" -e "npm run dev; bash" 2>/dev/null || \
konsole --title "Frontend Server" -e bash -c "npm run dev; exec bash" 2>/dev/null || \
echo "⚠️  ไม่สามารถเปิด terminal ใหม่ได้ กรุณารันคำสั่ง 'npm run dev' ใน frontend directory ด้วยตนเอง"

echo
echo "========================================"
echo "   ✅ ระบบพร้อมใช้งาน!"
echo "========================================"
echo
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/health"
echo
echo "👥 บัญชีเริ่มต้น:"
echo "   Admin: admin@accnext.com / password123"
echo "   Accountant: accountant@accnext.com / password123"
echo "   Viewer: viewer@accnext.com / password123"
echo
echo "📚 ดูคู่มือการใช้งานได้ที่ SETUP.md"
echo
echo "กด Enter เพื่อปิดหน้าต่างนี้..."
read