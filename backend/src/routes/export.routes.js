const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  exportIncomeCSV,
  exportExpenseCSV,
  exportIncomeExcel,
  exportExpenseExcel,
} = require('../controllers/export.controller');

router.get('/income/csv', authenticateToken, exportIncomeCSV);
router.get('/expense/csv', authenticateToken, exportExpenseCSV);
router.get('/income/excel', authenticateToken, exportIncomeExcel);
router.get('/expense/excel', authenticateToken, exportExpenseExcel);

module.exports = router;

