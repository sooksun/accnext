const express = require('express');
const router = express.Router();
const { 
  generateIncomeReceipt,
  generateExpenseReceipt,
  generateMonthlyReportPDF,
  generateYearlyReportPDF,
  generateInvoicePDF
} = require('../controllers/pdf.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Generate income receipt PDF
router.get('/income/:id/receipt', authenticateToken, generateIncomeReceipt);

// Generate expense receipt PDF
router.get('/expense/:id/receipt', authenticateToken, generateExpenseReceipt);

// Generate monthly report PDF
router.get('/report/monthly', authenticateToken, generateMonthlyReportPDF);

// Generate yearly report PDF
router.get('/report/yearly', authenticateToken, generateYearlyReportPDF);

// Generate invoice PDF
router.get('/invoice/:id', authenticateToken, generateInvoicePDF);

module.exports = router; 