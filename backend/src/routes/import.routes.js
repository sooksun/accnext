const express = require('express');
const router = express.Router();
const { 
  upload,
  importIncome,
  importExpense,
  getImportTemplate,
  downloadImportTemplate
} = require('../controllers/import.controller');
const { authenticateToken, adminOrAccountant } = require('../middleware/auth');

// Import income data
router.post('/income', authenticateToken, adminOrAccountant, upload.single('file'), importIncome);

// Import expense data
router.post('/expense', authenticateToken, adminOrAccountant, upload.single('file'), importExpense);

// Get import template
router.get('/template', authenticateToken, adminOrAccountant, getImportTemplate);

// Download import template
router.get('/template/download', authenticateToken, adminOrAccountant, downloadImportTemplate);

module.exports = router; 