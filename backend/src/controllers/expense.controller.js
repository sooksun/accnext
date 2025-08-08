const { Expense, Category, User } = require('../models');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');
const lineService = require('../utils/lineService');

// Get all expenses with pagination and filtering
const getAllExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categoryId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (search) {
      whereClause.description = { [Op.like]: `%${search}%` };
    }
    
    if (categoryId) {
      whereClause.category_id = categoryId;
    }
    
    if (startDate && endDate) {
      whereClause.transaction_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const { count, rows } = await Expense.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายจ่าย' });
  }
};

// Get expense by ID
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    if (!expense) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายจ่ายที่ระบุ' });
    }
    
    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Error getting expense:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายจ่าย' });
  }
};

/**
 * สร้างรายจ่ายใหม่
 */
const createExpense = async (req, res) => {
  try {
    // ตรวจสอบ validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ข้อมูลไม่ถูกต้อง',
        details: errors.array()
      });
    }

    const {
      amount,
      description,
      transaction_date,
      reference_number,
      payment_method,
      vendor,
      notes,
      is_recurring,
      recurring_period,
      budget_limit,
      category_id
    } = req.body;

    // Get first user from database for testing
    const user = await User.findOne();
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'ไม่พบผู้ใช้ในระบบ' 
      });
    }
    const user_id = user.id;

    // สร้างรายจ่ายใหม่
    const expense = await Expense.create({
      amount,
      description,
      transaction_date,
      reference_number,
      payment_method,
      vendor,
      notes,
      is_recurring,
      recurring_period,
      budget_limit,
      user_id,
      category_id
    });

    // แจ้ง LINE OA หากจำนวนเงิน > 5,000 บาท (ไม่บล็อคการทำงานหลัก)
    try {
      if (Number(amount) > 5000 && lineService?.isConfigured?.()) {
        const category = await Category.findByPk(category_id);
        await lineService.sendExpenseAlert(
          {
            id: expense.id,
            amount: Number(amount),
            description,
            transaction_date
          },
          { id: category?.id, name: category?.name }
        );
      }
    } catch (e) {
      console.warn('LINE notify failed (non-blocking):', e?.message || e);
    }

    // ตรวจสอบการเกินงบประมาณและส่งอีเมลแจ้งเตือน
    if (budget_limit) {
      const monthlyTotal = await Expense.getMonthlyTotal(
        user_id,
        new Date(transaction_date).getFullYear(),
        new Date(transaction_date).getMonth() + 1
      );

      if (monthlyTotal > budget_limit) {
        const category = await Category.findByPk(category_id);
        
        // ส่งอีเมลแจ้งเตือน
        await emailService.sendBudgetExceededAlert({
          categoryName: category.name,
          budgetLimit: budget_limit,
          actualSpent: monthlyTotal,
          exceeded: monthlyTotal - budget_limit
        });
      }
    }

    // ดึงข้อมูลที่เกี่ยวข้อง
    const expenseWithDetails = await Expense.findByPk(expense.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color', 'icon']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    res.status(201).json({
      message: 'สร้างรายจ่ายสำเร็จ',
      data: expenseWithDetails
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      message: 'ไม่สามารถสร้างรายจ่ายได้'
    });
  }
};

// Update expense (public for now)
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, transaction_date, category_id } = req.body;
    
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายจ่ายที่ระบุ' });
    }
    
    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'จำนวนเงินต้องมากกว่า 0' 
      });
    }
    
    // Check if category exists and is expense type (if category_id is provided)
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category || category.type !== 'expense') {
        return res.status(400).json({ 
          success: false, 
          message: 'หมวดหมู่ไม่ถูกต้องหรือไม่ใช่หมวดหมู่รายจ่าย' 
        });
      }
    }
    
    await expense.update({
      amount: amount !== undefined ? parseFloat(amount) : expense.amount,
      description: description || expense.description,
      transaction_date: transaction_date || expense.transaction_date,
      category_id: category_id || expense.category_id
    });
    
    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    res.json({ 
      success: true, 
      message: 'อัปเดตรายจ่ายสำเร็จ',
      data: updatedExpense 
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตรายจ่าย' });
  }
};

// Delete expense (public for now)
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายจ่ายที่ระบุ' });
    }
    
    await expense.destroy();
    
    res.json({ success: true, message: 'ลบรายจ่ายสำเร็จ' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบรายจ่าย' });
  }
};

// Get expense statistics
const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.transaction_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const sequelize = Expense.sequelize;
    const filters = [];
    const replacements = {};
    if (startDate && endDate) {
      filters.push('transaction_date BETWEEN :startDate AND :endDate');
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }
    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const [sumRows] = await sequelize.query(
      `SELECT COALESCE(SUM(amount),0) AS totalExpense, COUNT(*) AS expenseCount FROM expenses ${whereSql}`,
      { replacements }
    );
    const totalExpense = Number(sumRows?.[0]?.totalExpense || 0);
    const expenseCount = Number(sumRows?.[0]?.expenseCount || 0);

    const [groupRows] = await sequelize.query(
      `SELECT category_id, COALESCE(SUM(amount),0) AS totalAmount, COUNT(*) AS count
       FROM expenses ${ whereSql } GROUP BY category_id`,
      { replacements }
    );

    const categoryIds = groupRows.map(r => r.category_id).filter(Boolean);
    const categories = categoryIds.length
      ? await Category.findAll({ where: { id: { [Op.in]: categoryIds } }, attributes: ['id','name'] })
      : [];
    const idToName = new Map(categories.map(c => [c.id, c.name]));
    const expenseByCategory = groupRows.map(r => ({
      category_id: r.category_id,
      category: { id: r.category_id, name: idToName.get(r.category_id) || 'ไม่ระบุ' },
      totalAmount: Number(r.totalAmount || 0),
      count: Number(r.count || 0)
    }));
    
    res.json({
      success: true,
      data: {
        totalExpense: totalExpense || 0,
        expenseCount,
        expenseByCategory
      }
    });
  } catch (error) {
    console.error('Error getting expense stats:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงสถิติรายจ่าย' });
  }
};

/**
 * ตรวจสอบการแจ้งเตือนงบประมาณ
 */
const getBudgetAlerts = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // ตรวจสอบรายจ่ายที่มี budget_limit และเกินงบประมาณ
    const alerts = await Expense.getBudgetAlerts(user_id);
    
    res.status(200).json({
      message: 'ดึงข้อมูลการแจ้งเตือนงบประมาณสำเร็จ',
      data: alerts
    });

  } catch (error) {
    console.error('Error getting budget alerts:', error);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      message: 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้'
    });
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getBudgetAlerts
}; 

/**
 * อัปโหลดไฟล์ใบเสร็จรายจ่าย
 */
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `expense-${unique}${path.extname(file.originalname)}`);
  }
});

const receiptUpload = multer({
  storage: receiptStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('ประเภทไฟล์ไม่ถูกต้อง'), false);
    cb(null, true);
  }
});

async function attachExpenseReceipt(req, res) {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ success: false, message: 'ไม่พบรายจ่าย' });

    // ลบไฟล์เก่าถ้ามีและเป็นไฟล์ในระบบ
    if (expense.receipt_file) {
      const oldPath = path.join(__dirname, '..', expense.receipt_file.replace(/^\/+/, ''));
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (_) {}
      }
    }

    const relative = `/uploads/receipts/${path.basename(req.file.path)}`;
    await expense.update({ receipt_file: relative });

    res.json({ success: true, message: 'อัปโหลดใบเสร็จสำเร็จ', data: { receipt_file: relative } });
  } catch (error) {
    console.error('Error attaching receipt:', error);
    res.status(500).json({ success: false, message: 'อัปโหลดใบเสร็จไม่สำเร็จ' });
  }
}

async function removeExpenseReceipt(req, res) {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ success: false, message: 'ไม่พบรายจ่าย' });

    if (expense.receipt_file) {
      const filePath = path.join(__dirname, '..', expense.receipt_file.replace(/^\/+/, ''));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
    }
    await expense.update({ receipt_file: null });
    res.json({ success: true, message: 'ลบใบเสร็จสำเร็จ' });
  } catch (error) {
    console.error('Error removing receipt:', error);
    res.status(500).json({ success: false, message: 'ลบใบเสร็จไม่สำเร็จ' });
  }
}

module.exports.receiptUpload = receiptUpload;
module.exports.attachExpenseReceipt = attachExpenseReceipt;
module.exports.removeExpenseReceipt = removeExpenseReceipt;