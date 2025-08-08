const express = require('express');
const router = express.Router();
const lineService = require('../utils/lineService');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/line/status
 * @desc    ตรวจสอบสถานะ LINE Bot
 * @access  Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = await lineService.checkStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Error checking LINE status:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ LINE Bot',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/line/send-message
 * @desc    ส่งข้อความไปยัง LINE
 * @access  Private
 */
router.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุผู้รับและข้อความ'
      });
    }

    const result = await lineService.sendMessage(to, message);
    
    if (result) {
      res.json({
        success: true,
        message: 'ส่งข้อความสำเร็จ'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งข้อความได้'
      });
    }
  } catch (error) {
    console.error('❌ Error sending LINE message:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งข้อความ',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/line/send-expense-alert
 * @desc    ส่งการแจ้งเตือนรายจ่ายเกิน 5,000 บาท
 * @access  Private
 */
router.post('/send-expense-alert', authenticateToken, async (req, res) => {
  try {
    const { expense, category } = req.body;

    if (!expense || !category) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลรายจ่ายและหมวดหมู่'
      });
    }

    // ตรวจสอบว่ารายจ่ายเกิน 5,000 บาทหรือไม่
    if (expense.amount <= 5000) {
      return res.json({
        success: true,
        message: 'รายจ่ายไม่เกิน 5,000 บาท ไม่ต้องส่งการแจ้งเตือน'
      });
    }

    const result = await lineService.sendExpenseAlert(expense, category);
    
    if (result) {
      res.json({
        success: true,
        message: 'ส่งการแจ้งเตือนสำเร็จ'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งการแจ้งเตือนได้'
      });
    }
  } catch (error) {
    console.error('❌ Error sending expense alert:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งการแจ้งเตือน',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/line/send-daily-report
 * @desc    ส่งรายงานประจำวัน
 * @access  Private
 */
router.post('/send-daily-report', authenticateToken, async (req, res) => {
  try {
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลสรุปประจำวัน'
      });
    }

    const result = await lineService.sendDailyReport(summary);
    
    if (result) {
      res.json({
        success: true,
        message: 'ส่งรายงานประจำวันสำเร็จ'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งรายงานประจำวันได้'
      });
    }
  } catch (error) {
    console.error('❌ Error sending daily report:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งรายงานประจำวัน',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/line/send-monthly-report
 * @desc    ส่งรายงานประจำเดือน
 * @access  Private
 */
router.post('/send-monthly-report', authenticateToken, async (req, res) => {
  try {
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลสรุปประจำเดือน'
      });
    }

    const result = await lineService.sendMonthlyReport(summary);
    
    if (result) {
      res.json({
        success: true,
        message: 'ส่งรายงานประจำเดือนสำเร็จ'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งรายงานประจำเดือนได้'
      });
    }
  } catch (error) {
    console.error('❌ Error sending monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งรายงานประจำเดือน',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/line/webhook
 * @desc    รับ Webhook จาก LINE
 * @access  Public
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-line-signature'];
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing LINE signature'
      });
    }

    const result = lineService.handleWebhook(req.body, signature);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error handling LINE webhook:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการประมวลผล Webhook',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/line/test
 * @desc    ทดสอบการส่งข้อความ LINE
 * @access  Private
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const testMessage = `🧪 ทดสอบการส่งข้อความ LINE

📅 เวลา: ${new Date().toLocaleString('th-TH')}
✅ สถานะ: ระบบทำงานปกติ
🔧 เวอร์ชัน: 1.0.0

หากคุณได้รับข้อความนี้ แสดงว่าระบบ LINE Bot ทำงานได้ปกติ`;

    const result = await lineService.sendMessage(process.env.LINE_GROUP_ID, testMessage);
    
    if (result) {
      res.json({
        success: true,
        message: 'ส่งข้อความทดสอบสำเร็จ กรุณาตรวจสอบ LINE Group'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งข้อความทดสอบได้ กรุณาตรวจสอบการตั้งค่า'
      });
    }
  } catch (error) {
    console.error('❌ Error testing LINE message:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการทดสอบการส่งข้อความ',
      error: error.message
    });
  }
});

module.exports = router; 