const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware สำหรับตรวจสอบ JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'ไม่มีสิทธิ์เข้าถึง',
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
      });
    }

    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ค้นหาผู้ใช้จากฐานข้อมูล
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        error: 'ผู้ใช้ไม่ถูกต้อง',
        message: 'ไม่พบผู้ใช้ในระบบ กรุณาเข้าสู่ระบบใหม่'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: 'บัญชีถูกระงับ',
        message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ'
      });
    }

    // เพิ่มข้อมูลผู้ใช้ในการร้องขอ
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token ไม่ถูกต้อง',
        message: 'กรุณาเข้าสู่ระบบใหม่'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token หมดอายุ',
        message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      message: 'ไม่สามารถตรวจสอบสิทธิ์การเข้าถึงได้'
    });
  }
};

/**
 * Middleware สำหรับตรวจสอบสิทธิ์ตามบทบาท
 * @param {Array} allowedRoles - อาร์เรย์ของบทบาทที่อนุญาต
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'ไม่มีสิทธิ์เข้าถึง',
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'ไม่มีสิทธิ์เข้าถึง',
        message: 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้'
      });
    }

    next();
  };
};

/**
 * Middleware สำหรับสิทธิ์แอดมินเท่านั้น
 */
const adminOnly = authorizeRoles(['admin']);

/**
 * Middleware สำหรับสิทธิ์แอดมินและนักบัญชี
 */
const adminOrAccountant = authorizeRoles(['admin', 'accountant']);

/**
 * Middleware สำหรับการตรวจสอบว่าผู้ใช้เป็นเจ้าของข้อมูลหรือมีสิทธิ์แอดมิน
 */
const ownerOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'ไม่มีสิทธิ์เข้าถึง',
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
      });
    }

    // แอดมินสามารถเข้าถึงข้อมูลทั้งหมดได้
    if (req.user.role === 'admin') {
      return next();
    }

    // ตรวจสอบว่าเป็นเจ้าของข้อมูลหรือไม่
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId.toString() === req.user.id.toString()) {
      return next();
    }

    return res.status(403).json({
      error: 'ไม่มีสิทธิ์เข้าถึง',
      message: 'คุณสามารถเข้าถึงเฉพาะข้อมูลของตัวเองเท่านั้น'
    });
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  adminOnly,
  adminOrAccountant,
  ownerOrAdmin
};