const express = require('express');
const router = express.Router();
const { 
  getMonthlyReport, 
  getYearlyReport, 
  getCustomRangeReport,
  getDashboardSummary
} = require('../controllers/report.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get dashboard summary
router.get('/dashboard', authenticateToken, getDashboardSummary);

// Get monthly report
router.get('/monthly', authenticateToken, getMonthlyReport);

// Get yearly report
router.get('/yearly', authenticateToken, getYearlyReport);

// Get custom date range report
router.get('/custom', authenticateToken, getCustomRangeReport);

module.exports = router;