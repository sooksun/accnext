const express = require('express');
const router = express.Router();
const { 
  getAllIncomes, 
  getIncomeById, 
  createIncome, 
  updateIncome, 
  deleteIncome,
  getIncomeStats,
  receiptUpload,
  attachIncomeReceipt
} = require('../controllers/income.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get income statistics (วางก่อน :id เพื่อไม่ชน)
router.get('/stats', getIncomeStats);
router.get('/stats/summary', getIncomeStats);

// Get all incomes (with pagination and filtering)
router.get('/', getAllIncomes);

// Create new income (public for now)
router.post('/', createIncome);

// Upload income receipt (public for now)
router.post('/:id/receipt', receiptUpload.single('file'), attachIncomeReceipt);

// Get income by ID
router.get('/:id', getIncomeById);

// Update income
router.put('/:id', updateIncome);

// Delete income
router.delete('/:id', deleteIncome);

module.exports = router;