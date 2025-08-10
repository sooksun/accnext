const express = require('express');
const router = express.Router();
const { 
  getAllInvoices, 
  getInvoiceById, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice,
  issueInvoice
} = require('../controllers/invoice.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all invoices (with pagination and filtering)
router.get('/', authenticateToken, getAllInvoices);

// Get invoice by ID
router.get('/:id', authenticateToken, getInvoiceById);

// Create new invoice
router.post('/', authenticateToken, authorizeRoles(['admin', 'accountant']), createInvoice);

// Update invoice
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'accountant']), updateInvoice);

// Delete invoice
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), deleteInvoice);

// Issue invoice (change status to issued)
router.patch('/:id/issue', authenticateToken, authorizeRoles(['admin', 'accountant']), issueInvoice);

module.exports = router; 