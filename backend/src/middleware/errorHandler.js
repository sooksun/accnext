/**
 * Global Error Handler Middleware
 * จัดการข้อผิดพลาดทั้งหมดในระบบ
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error ใน development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(error => error.message);
    error.message = 'ข้อมูลไม่ถูกต้อง';
    return res.status(400).json({
      error: error.message,
      details: messages
    });
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    let message = 'ข้อมูลซ้ำในระบบ';
    
    if (field === 'email') {
      message = 'อีเมลนี้ถูกใช้งานแล้ว';
    } else if (field === 'username') {
      message = 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว';
    }

    return res.status(400).json({
      error: message,
      field: field
    });
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'ข้อมูลอ้างอิงไม่ถูกต้อง',
      message: 'ไม่สามารถดำเนินการได้เนื่องจากข้อมูลมีความสัมพันธ์กับข้อมูลอื่น'
    });
  }

  // Sequelize Database Connection Error
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      error: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้',
      message: 'ระบบกำลังมีปัญหา กรุณาลองใหม่ในภายหลัง'
    });
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token ไม่ถูกต้อง',
      message: 'กรุณาเข้าสู่ระบบใหม่'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token หมดอายุ',
      message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
    });
  }

  // Multer Errors (File Upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'ไฟล์มีขนาดใหญ่เกินไป',
      message: 'กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'ประเภทไฟล์ไม่ถูกต้อง',
      message: 'กรุณาเลือกไฟล์ที่ถูกต้อง'
    });
  }

  // Cast Error (Invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'รูปแบบข้อมูลไม่ถูกต้อง',
      message: 'ID ที่ระบุไม่ถูกต้อง'
    });
  }

  // Validation Errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'ข้อมูลไม่ถูกต้อง',
      details: err.errors
    });
  }

  // Custom Application Errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      error: err.message,
      ...(err.details && { details: err.details })
    });
  }

  // Default Error Response
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

/**
 * สร้าง Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true, details = null) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async Error Handler Wrapper
 * ใช้สำหรับ wrap async functions เพื่อจัดการ errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`ไม่พบเส้นทาง ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  AppError,
  asyncHandler,
  notFound
};