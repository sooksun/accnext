require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const incomeRoutes = require('./routes/income.routes');
const expenseRoutes = require('./routes/expense.routes');
const reportRoutes = require('./routes/report.routes');
const categoryRoutes = require('./routes/category.routes');
const pdfRoutes = require('./routes/pdf.routes');
const exportRoutes = require('./routes/export.routes');
const importRoutes = require('./routes/import.routes');
const backupRoutes = require('./routes/backup.routes');
const notificationRoutes = require('./routes/notification.routes');
const lineRoutes = require('./routes/line.routes');
const rdPrepRoutes = require('./routes/rdprep.routes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Import database
const db = require('./models');

// Import services
const notificationService = require('./utils/notificationService');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (สำหรับ production เมื่อใช้ load balancer)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100, // จำกัด 100 requests ต่อ IP ต่อ window
  message: {
    error: 'มีการร้องขอมากเกินไป กรุณาลองใหม่ในภายหลัง',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com']  // เปลี่ยนเป็น domain จริงใน production
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pdf', authenticateToken, pdfRoutes);
app.use('/api/export', authenticateToken, exportRoutes);
app.use('/api/import', authenticateToken, importRoutes);
app.use('/api/backup', authenticateToken, backupRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/line', lineRoutes); // LINE webhook ไม่ต้อง authenticate
app.use('/api/rdprep', authenticateToken, rdPrepRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ยินดีต้อนรับสู่ AccNext API - ระบบติดตามรายรับรายจ่าย Solution NextGen',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'ไม่พบเส้นทาง API ที่ร้องขอ',
    message: `ไม่พบเส้นทาง ${req.originalUrl}`,
    availableEndpoints: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users/profile',
      'GET /api/income',
      'GET /api/expense',
      'GET /api/reports',
      'GET /api/categories',
      'GET /api/pdf',
      'GET /api/export',
      'GET /api/import',
      'GET /api/backup',
      'GET /api/notifications',
      'POST /api/line/webhook',
      'POST /api/rdprep/submit'
    ]
  });
});

// Error handling middleware (ต้องอยู่ล่างสุด)
app.use(errorHandler);

// Database connection and server start
async function startServer() {
  try {
    // ทดสอบการเชื่อมต่อฐานข้อมูล
    await db.sequelize.authenticate();
    console.log('✅ เชื่อมต่อฐานข้อมูล MySQL สำเร็จ');

    // Sync models (ใน development เท่านั้น)
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ ซิงค์โมเดลฐานข้อมูลสำเร็จ');
    }

    // เริ่มต้นเซิร์ฟเวอร์
    app.listen(PORT, () => {
      console.log(`🚀 เซิร์ฟเวอร์ทำงานบนพอร์ต ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`💓 Health Check: http://localhost:${PORT}/health`);
    });

    // เริ่มต้นระบบแจ้งเตือน
    notificationService.start();

  } catch (error) {
    console.error('❌ ไม่สามารถเริ่มต้นเซิร์ฟเวอร์ได้:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 ได้รับสัญญาณ SIGTERM กำลังปิดเซิร์ฟเวอร์...');
  await db.sequelize.close();
  console.log('✅ ปิดการเชื่อมต่อฐานข้อมูลสำเร็จ');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 ได้รับสัญญาณ SIGINT กำลังปิดเซิร์ฟเวอร์...');
  await db.sequelize.close();
  console.log('✅ ปิดการเชื่อมต่อฐานข้อมูลสำเร็จ');
  process.exit(0);
});

// เริ่มต้นเซิร์ฟเวอร์
startServer();

module.exports = app;