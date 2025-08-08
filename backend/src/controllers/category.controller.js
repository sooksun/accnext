const { validationResult } = require('express-validator');
const { Category } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * ดูรายการหมวดหมู่ทั้งหมด
 */
const getCategories = asyncHandler(async (req, res) => {
  const { type, active_only = 'true' } = req.query;
  
  let whereClause = {};
  
  // กรองตามประเภท
  if (type && ['income', 'expense'].includes(type)) {
    whereClause.type = type;
  }
  
  // กรองเฉพาะที่ใช้งาน
  if (active_only === 'true') {
    whereClause.is_active = true;
  }

  const categories = await Category.findAll({
    where: whereClause,
    include: [{
      model: require('../models').User,
      as: 'creator',
      attributes: ['id', 'first_name', 'last_name']
    }],
    order: [
      ['is_default', 'DESC'],
      ['type', 'ASC'],
      ['name', 'ASC']
    ]
  });

  res.json({
    success: true,
    data: {
      categories,
      total: categories.length
    }
  });
});

/**
 * ดูรายละเอียดหมวดหมู่
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id, {
    include: [{
      model: require('../models').User,
      as: 'creator',
      attributes: ['id', 'first_name', 'last_name']
    }]
  });

  if (!category) {
    throw new AppError('ไม่พบหมวดหมู่', 404);
  }

  // นับจำนวนธุรกรรมในหมวดหมู่
  const transactionCount = await category.getTransactionCount();

  res.json({
    success: true,
    data: {
      category: {
        ...category.toJSON(),
        transaction_count: transactionCount
      }
    }
  });
});

/**
 * สร้างหมวดหมู่ใหม่
 */
const createCategory = asyncHandler(async (req, res) => {
  // ตรวจสอบ validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('ข้อมูลไม่ถูกต้อง', 400, true, errors.array());
  }

  const { name, type, description, color, icon } = req.body;
  const created_by = req.user.id;

  // ตรวจสอบว่ามีหมวดหมู่ชื่อเดียวกันในประเภทเดียวกันหรือไม่
  const existingCategory = await Category.findOne({
    where: { name, type, is_active: true }
  });

  if (existingCategory) {
    throw new AppError(`มีหมวดหมู่ "${name}" ในประเภท ${type} อยู่แล้ว`, 400);
  }

  const category = await Category.create({
    name,
    type,
    description,
    color: color || '#6B7280',
    icon: icon || 'folder',
    is_default: false,
    is_active: true,
    created_by
  });

  res.status(201).json({
    success: true,
    message: 'สร้างหมวดหมู่สำเร็จ',
    data: { category }
  });
});

/**
 * แก้ไขหมวดหมู่
 */
const updateCategory = asyncHandler(async (req, res) => {
  // ตรวจสอบ validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('ข้อมูลไม่ถูกต้อง', 400, true, errors.array());
  }

  const { id } = req.params;
  const { name, description, color, icon } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new AppError('ไม่พบหมวดหมู่', 404);
  }

  // ตรวจสอบสิทธิ์ (เฉพาะผู้สร้างหรือแอดมิน)
  if (category.created_by !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('คุณไม่มีสิทธิ์แก้ไขหมวดหมู่นี้', 403);
  }

  // ไม่อนุญาตให้แก้ไขหมวดหมู่เริ่มต้น (ยกเว้นแอดมิน)
  if (category.is_default && req.user.role !== 'admin') {
    throw new AppError('ไม่สามารถแก้ไขหมวดหมู่เริ่มต้นได้', 403);
  }

  // ตรวจสอบชื่อซ้ำ (ถ้ามีการเปลี่ยนชื่อ)
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({
      where: { 
        name, 
        type: category.type, 
        id: { [require('sequelize').Op.ne]: id },
        is_active: true
      }
    });

    if (existingCategory) {
      throw new AppError(`มีหมวดหมู่ "${name}" ในประเภท ${category.type} อยู่แล้ว`, 400);
    }
  }

  await category.update({
    name: name || category.name,
    description: description !== undefined ? description : category.description,
    color: color || category.color,
    icon: icon || category.icon
  });

  res.json({
    success: true,
    message: 'แก้ไขหมวดหมู่สำเร็จ',
    data: { category }
  });
});

/**
 * ลบหมวดหมู่ (Soft Delete)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new AppError('ไม่พบหมวดหมู่', 404);
  }

  // ตรวจสอบสิทธิ์ (เฉพาะผู้สร้างหรือแอดมิน)
  if (category.created_by !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('คุณไม่มีสิทธิ์ลบหมวดหมู่นี้', 403);
  }

  // ไม่อนุญาตให้ลบหมวดหมู่เริ่มต้น
  if (category.is_default) {
    throw new AppError('ไม่สามารถลบหมวดหมู่เริ่มต้นได้', 403);
  }

  // ตรวจสอบว่ามีธุรกรรมที่ใช้หมวดหมู่นี้หรือไม่
  const transactionCount = await category.getTransactionCount();
  if (transactionCount > 0) {
    throw new AppError('ไม่สามารถลบหมวดหมู่ที่มีธุรกรรมอยู่', 400);
  }

  // Soft delete
  await category.update({ is_active: false });

  res.json({
    success: true,
    message: 'ลบหมวดหมู่สำเร็จ'
  });
});

/**
 * กู้คืนหมวดหมู่
 */
const restoreCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new AppError('ไม่พบหมวดหมู่', 404);
  }

  // เฉพาะแอดมินเท่านั้น
  if (req.user.role !== 'admin') {
    throw new AppError('เฉพาะแอดมินเท่านั้นที่สามารถกู้คืนหมวดหมู่ได้', 403);
  }

  await category.update({ is_active: true });

  res.json({
    success: true,
    message: 'กู้คืนหมวดหมู่สำเร็จ',
    data: { category }
  });
});

/**
 * ดูสถิติหมวดหมู่
 */
const getCategoryStats = asyncHandler(async (req, res) => {
  const { type, start_date, end_date } = req.query;
  const userId = req.user.id;

  let whereClause = {};
  if (type && ['income', 'expense'].includes(type)) {
    whereClause.type = type;
  }

  const categories = await Category.findAll({
    where: { ...whereClause, is_active: true },
    order: [['name', 'ASC']]
  });

  const stats = [];

  for (const category of categories) {
    let totalAmount = 0;
    let transactionCount = 0;

    if (category.type === 'income') {
      const { Income } = require('../models');
      const result = await Income.getCategoryStats(userId, start_date, end_date);
      const categoryData = result.find(item => item.category_id === category.id);
      if (categoryData) {
        totalAmount = parseFloat(categoryData.dataValues.total || 0);
        transactionCount = parseInt(categoryData.dataValues.count || 0);
      }
    } else {
      const { Expense } = require('../models');
      const result = await Expense.getCategoryStats(userId, start_date, end_date);
      const categoryData = result.find(item => item.category_id === category.id);
      if (categoryData) {
        totalAmount = parseFloat(categoryData.dataValues.total || 0);
        transactionCount = parseInt(categoryData.dataValues.count || 0);
      }
    }

    stats.push({
      category: {
        id: category.id,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon
      },
      total_amount: totalAmount,
      transaction_count: transactionCount,
      formatted_amount: new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(totalAmount)
    });
  }

  // เรียงตามจำนวนเงิน
  stats.sort((a, b) => b.total_amount - a.total_amount);

  res.json({
    success: true,
    data: {
      stats,
      period: {
        start_date: start_date || null,
        end_date: end_date || null
      }
    }
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  getCategoryStats
};