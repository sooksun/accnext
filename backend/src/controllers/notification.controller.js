const notificationService = require('../utils/notificationService');
const emailService = require('../utils/emailService');

/**
 * ทดสอบการส่งอีเมล
 */
const testEmail = async (req, res) => {
  try {
    const result = await emailService.testEmail();
    
    if (result) {
      res.status(200).json({
        message: 'ส่งอีเมลทดสอบสำเร็จ',
        data: {
          sent: true,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        error: 'ไม่สามารถส่งอีเมลได้',
        message: 'ตรวจสอบการตั้งค่าอีเมลในไฟล์ .env'
      });
    }
  } catch (error) {
    console.error('Error testing email:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      message: 'ไม่สามารถทดสอบการส่งอีเมลได้'
    });
  }
};

/**
 * เริ่มต้นระบบแจ้งเตือน
 */
const startNotificationService = async (req, res) => {
  try {
    notificationService.start();
    
    res.status(200).json({
      message: 'เริ่มต้นระบบแจ้งเตือนสำเร็จ',
      data: {
        running: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error starting notification service:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      message: 'ไม่สามารถเริ่มต้นระบบแจ้งเตือนได้'
    });
  }
};

/**
 * หยุดระบบแจ้งเตือน
 */
const stopNotificationService = async (req, res) => {
  try {
    notificationService.stop();
    
    res.status(200).json({
      message: 'หยุดระบบแจ้งเตือนสำเร็จ',
      data: {
        running: false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error stopping notification service:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      message: 'ไม่สามารถหยุดระบบแจ้งเตือนได้'
    });
  }
};

/**
 * ตรวจสอบสถานะระบบแจ้งเตือน
 */
const getNotificationStatus = async (req, res) => {
  try {
    res.status(200).json({
      message: 'ดึงสถานะระบบแจ้งเตือนสำเร็จ',
      data: {
        running: notificationService.isRunning,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting notification status:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      message: 'ไม่สามารถดึงสถานะระบบแจ้งเตือนได้'
    });
  }
};

module.exports = {
  testEmail,
  startNotificationService,
  stopNotificationService,
  getNotificationStatus
}; 