const BackupService = require('../utils/backupService');
const path = require('path');
const fs = require('fs');

const backupService = new BackupService();

// Create manual backup
const createBackup = async (req, res) => {
  try {
    const result = await backupService.createDatabaseBackup();
    
    res.json({
      success: true,
      message: 'สร้าง backup สำเร็จ',
      data: {
        fileName: result.fileName,
        size: backupService.formatFileSize(result.size),
        timestamp: result.timestamp
      }
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการสร้าง backup: ' + error.message 
    });
  }
};

// List all backups
const listBackups = async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    
    res.json({
      success: true,
      data: backups
    });

  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงรายการ backup: ' + error.message 
    });
  }
};

// Download backup file
const downloadBackup = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(backupService.backupDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบไฟล์ backup ที่ระบุ' 
      });
    }
    
    res.download(filePath, fileName);

  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดาวน์โหลด backup: ' + error.message 
    });
  }
};

// Delete backup file
const deleteBackup = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(backupService.backupDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบไฟล์ backup ที่ระบุ' 
      });
    }
    
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'ลบไฟล์ backup สำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการลบ backup: ' + error.message 
    });
  }
};

// Restore from backup
const restoreBackup = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(backupService.backupDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบไฟล์ backup ที่ระบุ' 
      });
    }
    
    const result = await backupService.restoreFromBackup(filePath);
    
    res.json({
      success: true,
      message: 'กู้คืนข้อมูลสำเร็จ',
      data: result
    });

  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการกู้คืนข้อมูล: ' + error.message 
    });
  }
};

// Get backup statistics
const getBackupStats = async (req, res) => {
  try {
    const stats = await backupService.getBackupStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting backup stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ backup: ' + error.message 
    });
  }
};

// Clean old backups
const cleanOldBackups = async (req, res) => {
  try {
    const { retentionDays = 30 } = req.body;
    
    const result = await backupService.cleanOldBackups(retentionDays);
    
    res.json({
      success: true,
      message: `ทำความสะอาด backup เก่าสำเร็จ ลบ ${result.deletedCount} ไฟล์`,
      data: result
    });

  } catch (error) {
    console.error('Error cleaning old backups:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการทำความสะอาด backup: ' + error.message 
    });
  }
};

// Start scheduled backup
const startScheduledBackup = async (req, res) => {
  try {
    const { cronExpression = '0 0 * * 0' } = req.body; // Default: weekly on Sunday at midnight
    
    const schedule = backupService.scheduleBackup(cronExpression);
    
    res.json({
      success: true,
      message: 'เริ่มต้นการ backup อัตโนมัติสำเร็จ',
      data: {
        cronExpression,
        nextRun: schedule.nextDate().toDate()
      }
    });

  } catch (error) {
    console.error('Error starting scheduled backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการเริ่มต้น backup อัตโนมัติ: ' + error.message 
    });
  }
};

module.exports = {
  createBackup,
  listBackups,
  downloadBackup,
  deleteBackup,
  restoreBackup,
  getBackupStats,
  cleanOldBackups,
  startScheduledBackup
}; 