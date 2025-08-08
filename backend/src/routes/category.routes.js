const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  getCategoryStats
} = require('../controllers/category.controller');
const { adminOrAccountant, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * Validation rules
 */
const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('กรุณาระบุชื่อหมวดหมู่')
    .isLength({ min: 1, max: 100 })
    .withMessage('ชื่อหมวดหมู่ต้องมีความยาว 1-100 ตัวอักษร'),
  
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('ประเภทหมวดหมู่ต้องเป็น income หรือ expense เท่านั้น'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('รายละเอียดต้องมีความยาวไม่เกิน 500 ตัวอักษร'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('รูปแบบสีไม่ถูกต้อง (ต้องเป็น #RRGGBB)'),
  
  body('icon')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('ไอคอนต้องมีความยาว 1-50 ตัวอักษร')
];

const updateCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID หมวดหมู่ไม่ถูกต้อง'),
  
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('ชื่อหมวดหมู่ต้องมีความยาว 1-100 ตัวอักษร'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('รายละเอียดต้องมีความยาวไม่เกิน 500 ตัวอักษร'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('รูปแบบสีไม่ถูกต้อง (ต้องเป็น #RRGGBB)'),
  
  body('icon')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('ไอคอนต้องมีความยาว 1-50 ตัวอักษร')
];

const categoryIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID หมวดหมู่ไม่ถูกต้อง')
];

const categoryStatsValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('ประเภทต้องเป็น income หรือ expense เท่านั้น'),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('รูปแบบวันที่เริ่มต้นไม่ถูกต้อง'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('รูปแบบวันที่สิ้นสุดไม่ถูกต้อง')
];

/**
 * Routes
 */

// GET /api/categories - ดูรายการหมวดหมู่ทั้งหมด (ไม่ต้อง authentication)
router.get('/', getCategories);

// GET /api/categories/public - ดูรายการหมวดหมู่พื้นฐาน (ไม่ต้อง authentication)
router.get('/public', getCategories);

// GET /api/categories/stats - ดูสถิติหมวดหมู่
router.get('/stats', categoryStatsValidation, getCategoryStats);

// GET /api/categories/:id - ดูรายละเอียดหมวดหมู่
router.get('/:id', categoryIdValidation, getCategoryById);

// POST /api/categories - สร้างหมวดหมู่ใหม่ (แอดมิน/นักบัญชี)
router.post('/', adminOrAccountant, createCategoryValidation, createCategory);

// PUT /api/categories/:id - แก้ไขหมวดหมู่ (แอดมิน/นักบัญชี)
router.put('/:id', adminOrAccountant, updateCategoryValidation, updateCategory);

// DELETE /api/categories/:id - ลบหมวดหมู่ (แอดมิน/นักบัญชี)
router.delete('/:id', adminOrAccountant, categoryIdValidation, deleteCategory);

// PUT /api/categories/:id/restore - กู้คืนหมวดหมู่ (แอดมิน)
router.put('/:id/restore', adminOnly, categoryIdValidation, restoreCategory);

module.exports = router;