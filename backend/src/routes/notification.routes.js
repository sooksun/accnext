const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  testEmail,
  startNotificationService,
  stopNotificationService,
  getNotificationStatus
} = require('../controllers/notification.controller');

// ทดสอบการส่งอีเมล (Admin เท่านั้น)
router.post('/test-email', authenticateToken, authorizeRoles(['admin']), testEmail);

// เริ่มต้นระบบแจ้งเตือน (Admin เท่านั้น)
router.post('/start', authenticateToken, authorizeRoles(['admin']), startNotificationService);

// หยุดระบบแจ้งเตือน (Admin เท่านั้น)
router.post('/stop', authenticateToken, authorizeRoles(['admin']), stopNotificationService);

// ตรวจสอบสถานะระบบแจ้งเตือน (Admin เท่านั้น)
router.get('/status', authenticateToken, authorizeRoles(['admin']), getNotificationStatus);

module.exports = router; 