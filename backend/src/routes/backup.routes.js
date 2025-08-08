const express = require('express');
const router = express.Router();
const { 
  createBackup,
  listBackups,
  downloadBackup,
  deleteBackup,
  restoreBackup,
  getBackupStats,
  cleanOldBackups,
  startScheduledBackup
} = require('../controllers/backup.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create manual backup (admin only)
router.post('/', authenticateToken, authorizeRoles(['admin']), createBackup);

// List all backups (admin only)
router.get('/', authenticateToken, authorizeRoles(['admin']), listBackups);

// Download backup file (admin only)
router.get('/download/:fileName', authenticateToken, authorizeRoles(['admin']), downloadBackup);

// Delete backup file (admin only)
router.delete('/:fileName', authenticateToken, authorizeRoles(['admin']), deleteBackup);

// Restore from backup (admin only)
router.post('/restore/:fileName', authenticateToken, authorizeRoles(['admin']), restoreBackup);

// Get backup statistics (admin only)
router.get('/stats', authenticateToken, authorizeRoles(['admin']), getBackupStats);

// Clean old backups (admin only)
router.post('/clean', authenticateToken, authorizeRoles(['admin']), cleanOldBackups);

// Start scheduled backup (admin only)
router.post('/schedule', authenticateToken, authorizeRoles(['admin']), startScheduledBackup);

module.exports = router; 