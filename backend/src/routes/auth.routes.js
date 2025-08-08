const express = require('express');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  logout, 
  verifyToken 
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Validation rules
 */
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('ชื่อผู้ใช้ต้องมีความยาว 3-50 ตัวอักษร')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('รูปแบบอีเมลไม่ถูกต้อง'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('รหัสผ่านต้องประกอบด้วยตัวเล็ก ตัวใหญ่ และตัวเลข'),
  
  body('first_name')
    .notEmpty()
    .withMessage('กรุณาระบุชื่อ')
    .isLength({ max: 50 })
    .withMessage('ชื่อต้องมีความยาวไม่เกิน 50 ตัวอักษร'),
  
  body('last_name')
    .notEmpty()
    .withMessage('กรุณาระบุนามสกุล')
    .isLength({ max: 50 })
    .withMessage('นามสกุลต้องมีความยาวไม่เกิน 50 ตัวอักษร'),
  
  body('role')
    .optional()
    .isIn(['admin', 'accountant', 'viewer'])
    .withMessage('บทบาทต้องเป็น admin, accountant หรือ viewer เท่านั้น'),
  
  body('phone')
    .optional()
    .matches(/^[\d\-\+\(\)\s]+$/)
    .withMessage('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง')
];

const loginValidation = [
  body('login')
    .notEmpty()
    .withMessage('กรุณาระบุชื่อผู้ใช้หรืออีเมล'),
  
  body('password')
    .notEmpty()
    .withMessage('กรุณาระบุรหัสผ่าน')
];

const updateProfileValidation = [
  body('first_name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('ชื่อต้องมีความยาว 1-50 ตัวอักษร'),
  
  body('last_name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('นามสกุลต้องมีความยาว 1-50 ตัวอักษร'),
  
  body('phone')
    .optional()
    .matches(/^[\d\-\+\(\)\s]+$/)
    .withMessage('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง')
];

const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('กรุณาระบุรหัสผ่านปัจจุบัน'),
  
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('รหัสผ่านใหม่ต้องประกอบด้วยตัวเล็ก ตัวใหญ่ และตัวเลข'),
  
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('ยืนยันรหัสผ่านไม่ตรงกัน');
      }
      return true;
    })
];

/**
 * Routes
 */

// POST /api/auth/register - ลงทะเบียนผู้ใช้ใหม่
router.post('/register', registerValidation, register);

// POST /api/auth/login - เข้าสู่ระบบ
router.post('/login', loginValidation, login);

// GET /api/auth/profile - ดูข้อมูลโปรไฟล์ (ต้องล็อกอิน)
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile - แก้ไขโปรไฟล์ (ต้องล็อกอิน)
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);

// PUT /api/auth/change-password - เปลี่ยนรหัสผ่าน (ต้องล็อกอิน)
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);

// POST /api/auth/logout - ออกจากระบบ (ต้องล็อกอิน)
router.post('/logout', authenticateToken, logout);

// GET /api/auth/verify - ตรวจสอบสถานะ token (ต้องล็อกอิน)
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;