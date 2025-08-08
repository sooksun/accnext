const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { Op } = require('sequelize');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * สร้าง JWT Token
 * @param {Object} user - ข้อมูลผู้ใช้
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'accnext-api',
      audience: 'accnext-frontend'
    }
  );
};

/**
 * ลงทะเบียนผู้ใช้ใหม่
 */
const register = asyncHandler(async (req, res) => {
  // ตรวจสอบ validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('ข้อมูลไม่ถูกต้อง', 400, true, errors.array());
  }

  const { username, email, password, first_name, last_name, role = 'viewer', phone } = req.body;

  // ตรวจสอบว่ามีผู้ใช้อีเมลหรือชื่อผู้ใช้นี้แล้วหรือไม่
  let existingUser = await User.findOne({
    where: { email }
  });
  
  if (!existingUser) {
    existingUser = await User.findOne({
      where: { username }
    });
  }

  if (existingUser) {
    const field = existingUser.email === email ? 'อีเมล' : 'ชื่อผู้ใช้';
    throw new AppError(`${field}นี้ถูกใช้งานแล้ว`, 400);
  }

  // สร้างผู้ใช้ใหม่
  const user = await User.create({
    username,
    email,
    password,
    first_name,
    last_name,
    role,
    phone,
    is_active: true
  });

  // สร้าง token
  const token = generateToken(user);

  // อัพเดทเวลาล็อกอิน
  await user.update({ last_login: new Date() });

  res.status(201).json({
    success: true,
    message: 'ลงทะเบียนสำเร็จ',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        phone: user.phone,
        created_at: user.created_at
      },
      token,
      expires_in: process.env.JWT_EXPIRES_IN || '7d'
    }
  });
});

/**
 * เข้าสู่ระบบ
 */
const login = asyncHandler(async (req, res) => {
  // ตรวจสอบ validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('ข้อมูลไม่ถูกต้อง', 400, true, errors.array());
  }

  const { login, password } = req.body;

  // หาผู้ใช้ด้วยอีเมลหรือชื่อผู้ใช้
  let user = await User.scope('withPassword').findOne({
    where: { email: login, is_active: true }
  });
  
  if (!user) {
    user = await User.scope('withPassword').findOne({
      where: { username: login, is_active: true }
    });
  }

  if (!user) {
    throw new AppError('ชื่อผู้ใช้หรืออีเมลไม่ถูกต้อง', 401);
  }

  // ตรวจสอบรหัสผ่าน
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw new AppError('รหัสผ่านไม่ถูกต้อง', 401);
  }

  // สร้าง token
  const token = generateToken(user);

  // อัพเดทเวลาล็อกอิน
  await user.update({ last_login: new Date() });

  res.json({
    success: true,
    message: 'เข้าสู่ระบบสำเร็จ',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.getFullName(),
        role: user.role,
        is_active: user.is_active,
        phone: user.phone,
        avatar: user.avatar,
        last_login: user.last_login
      },
      token,
      expires_in: process.env.JWT_EXPIRES_IN || '7d'
    }
  });
});

/**
 * ดูข้อมูลโปรไฟล์
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.getFullName(),
        role: user.role,
        is_active: user.is_active,
        phone: user.phone,
        avatar: user.avatar,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }
  });
});

/**
 * อัพเดทโปรไฟล์
 */
const updateProfile = asyncHandler(async (req, res) => {
  // ตรวจสอบ validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('ข้อมูลไม่ถูกต้อง', 400, true, errors.array());
  }

  const { first_name, last_name, phone } = req.body;
  const user = req.user;

  // อัพเดทข้อมูล
  await user.update({
    first_name: first_name || user.first_name,
    last_name: last_name || user.last_name,
    phone: phone || user.phone
  });

  res.json({
    success: true,
    message: 'อัพเดทโปรไฟล์สำเร็จ',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: user.getFullName(),
        role: user.role,
        phone: user.phone,
        updated_at: user.updated_at
      }
    }
  });
});

/**
 * เปลี่ยนรหัสผ่าน
 */
const changePassword = asyncHandler(async (req, res) => {
  // ตรวจสอบ validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('ข้อมูลไม่ถูกต้อง', 400, true, errors.array());
  }

  const { current_password, new_password } = req.body;
  const userId = req.user.id;

  // หาผู้ใช้พร้อมรหัสผ่าน
  const user = await User.scope('withPassword').findByPk(userId);
  if (!user) {
    throw new AppError('ไม่พบผู้ใช้', 404);
  }

  // ตรวจสอบรหัสผ่านปัจจุบัน
  const isCurrentPasswordValid = await user.validatePassword(current_password);
  if (!isCurrentPasswordValid) {
    throw new AppError('รหัสผ่านปัจจุบันไม่ถูกต้อง', 400);
  }

  // อัพเดทรหัสผ่านใหม่
  await user.update({ password: new_password });

  res.json({
    success: true,
    message: 'เปลี่ยนรหัสผ่านสำเร็จ'
  });
});

/**
 * ออกจากระบบ (สำหรับการทำงานในอนาคต เช่น blacklist token)
 */
const logout = asyncHandler(async (req, res) => {
  // ในปัจจุบันเราแค่ส่งข้อความตอบกลับ
  // ในอนาคตอาจเพิ่มระบบ blacklist token
  
  res.json({
    success: true,
    message: 'ออกจากระบบสำเร็จ'
  });
});

/**
 * ตรวจสอบสถานะ token
 */
const verifyToken = asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    message: 'Token ถูกต้อง',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      }
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken
};