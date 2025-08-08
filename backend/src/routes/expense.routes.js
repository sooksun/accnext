const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getBudgetAlerts,
  receiptUpload,
  attachExpenseReceipt,
  removeExpenseReceipt
} = require('../controllers/expense.controller');

// Validation middleware
const { body } = require('express-validator');

const expenseValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('จำนวนเงินต้องมากกว่า 0'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('รายละเอียดต้องมีความยาว 1-255 ตัวอักษร'),
  body('transaction_date')
    .isISO8601()
    .withMessage('วันที่ไม่ถูกต้อง'),
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('หมวดหมู่ไม่ถูกต้อง'),
  body('payment_method')
    .isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'other'])
    .withMessage('วิธีการชำระเงินไม่ถูกต้อง')
];

// Routes
// Stats before :id to avoid conflicts
router.get('/stats', getExpenseStats);
router.get('/stats/summary', getExpenseStats);

// List
router.get('/', getAllExpenses);

// Make create expense public for now (no auth)
router.post('/', expenseValidation, createExpense);

// Detail/update/delete (keep auth removed for now)
router.get('/:id', getExpenseById);
router.put('/:id', expenseValidation, updateExpense);
router.delete('/:id', deleteExpense);

router.get('/alerts/budget', getBudgetAlerts);

// Receipt upload/remove
// Make receipt upload public for now (no auth)
router.post('/:id/receipt', receiptUpload.single('file'), attachExpenseReceipt);
router.delete('/:id/receipt', authenticateToken, removeExpenseReceipt);

module.exports = router;