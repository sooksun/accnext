const express = require('express');
const router = express.Router();
const rdPrepService = require('../utils/rdPrepService');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/rdprep/status
 * @desc    ตรวจสอบสถานะการเชื่อมต่อ RD Prep API
 * @access  Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = await rdPrepService.checkStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Error checking RD Prep status:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ RD Prep API',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/rdprep/send-income
 * @desc    ส่งข้อมูลรายรับไปยัง RD Prep
 * @access  Private
 */
router.post('/send-income', authenticateToken, async (req, res) => {
  try {
    const { income, category } = req.body;

    if (!income || !category) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลรายรับและหมวดหมู่'
      });
    }

    const result = await rdPrepService.sendIncomeData(income, category);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        rd_prep_id: result.rd_prep_id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งข้อมูลรายรับได้',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending income to RD Prep:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งข้อมูลรายรับ',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/rdprep/send-expense
 * @desc    ส่งข้อมูลรายจ่ายไปยัง RD Prep
 * @access  Private
 */
router.post('/send-expense', authenticateToken, async (req, res) => {
  try {
    const { expense, category } = req.body;

    if (!expense || !category) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลรายจ่ายและหมวดหมู่'
      });
    }

    const result = await rdPrepService.sendExpenseData(expense, category);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        rd_prep_id: result.rd_prep_id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งข้อมูลรายจ่ายได้',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending expense to RD Prep:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งข้อมูลรายจ่าย',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/rdprep/send-monthly-report
 * @desc    ส่งรายงานประจำเดือนไปยัง RD Prep
 * @access  Private
 */
router.post('/send-monthly-report', authenticateToken, async (req, res) => {
  try {
    const { reportData } = req.body;

    if (!reportData) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลรายงานประจำเดือน'
      });
    }

    const result = await rdPrepService.sendMonthlyReport(reportData);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        rd_prep_report_id: result.rd_prep_report_id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งรายงานประจำเดือนได้',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending monthly report to RD Prep:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งรายงานประจำเดือน',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/rdprep/send-yearly-report
 * @desc    ส่งรายงานประจำปีไปยัง RD Prep
 * @access  Private
 */
router.post('/send-yearly-report', authenticateToken, async (req, res) => {
  try {
    const { reportData } = req.body;

    if (!reportData) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุข้อมูลรายงานประจำปี'
      });
    }

    const result = await rdPrepService.sendYearlyReport(reportData);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        rd_prep_report_id: result.rd_prep_report_id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถส่งรายงานประจำปีได้',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending yearly report to RD Prep:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งรายงานประจำปี',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/rdprep/fetch-data
 * @desc    ดึงข้อมูลจาก RD Prep API
 * @access  Private
 */
router.get('/fetch-data', authenticateToken, async (req, res) => {
  try {
    const { dataType, filters } = req.query;

    if (!dataType) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุประเภทข้อมูลที่ต้องการดึง'
      });
    }

    const data = await rdPrepService.fetchData(dataType, filters);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Error fetching data from RD Prep:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก RD Prep',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/rdprep/schedule-sync
 * @desc    ตั้งเวลาส่งข้อมูลไปยัง RD Prep
 * @access  Private
 */
router.post('/schedule-sync', authenticateToken, async (req, res) => {
  try {
    const { schedule } = req.body;

    if (!schedule || !['daily', 'weekly', 'monthly'].includes(schedule)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุตารางเวลาที่ถูกต้อง (daily, weekly, monthly)'
      });
    }

    rdPrepService.scheduleDataSync(schedule);
    
    res.json({
      success: true,
      message: `ตั้งเวลาส่งข้อมูล ${schedule} สำเร็จ`
    });
  } catch (error) {
    console.error('❌ Error scheduling RD Prep sync:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตั้งเวลาส่งข้อมูล',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/rdprep/sync-now
 * @desc    ส่งข้อมูลไปยัง RD Prep ทันที
 * @access  Private
 */
router.post('/sync-now', authenticateToken, async (req, res) => {
  try {
    const { syncType } = req.body;

    switch (syncType) {
      case 'daily':
        await rdPrepService.syncDailyData();
        break;
      case 'weekly':
        await rdPrepService.syncWeeklyData();
        break;
      case 'monthly':
        await rdPrepService.syncMonthlyData();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุประเภทการซิงค์ที่ถูกต้อง (daily, weekly, monthly)'
        });
    }

    res.json({
      success: true,
      message: `ซิงค์ข้อมูล ${syncType} สำเร็จ`
    });
  } catch (error) {
    console.error('❌ Error syncing data to RD Prep:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/rdprep/test
 * @desc    ทดสอบการเชื่อมต่อ RD Prep API
 * @access  Private
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const status = await rdPrepService.checkStatus();
    
    if (status.status === 'active') {
      res.json({
        success: true,
        message: 'การเชื่อมต่อ RD Prep API สำเร็จ',
        details: status
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ไม่สามารถเชื่อมต่อ RD Prep API ได้',
        details: status
      });
    }
  } catch (error) {
    console.error('❌ Error testing RD Prep connection:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ',
      error: error.message
    });
  }
});

module.exports = router; 