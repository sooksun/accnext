const { Income, Category, User } = require('../models');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Get all incomes with pagination and filtering
const getAllIncomes = async (req, res) => {
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
    
    const { count, rows } = await Income.findAndCountAll({
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
    console.error('Error getting incomes:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายได้' });
  }
};

// Get income by ID
const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const income = await Income.findByPk(id, {
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
    
    if (!income) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายได้ที่ระบุ' });
    }
    
    res.json({ success: true, data: income });
  } catch (error) {
    console.error('Error getting income:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายได้' });
  }
};

// Create new income
const createIncome = async (req, res) => {
  try {
    const { amount, description, transaction_date, category_id } = req.body;
    
    // Get first user from database for testing
    const user = await User.findOne();
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'ไม่พบผู้ใช้ในระบบ' 
      });
    }
    const userId = user.id;
    
    // Validate required fields
    if (!amount || !description || !category_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (จำนวนเงิน, รายละเอียด, หมวดหมู่)' 
      });
    }
    
    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'จำนวนเงินต้องมากกว่า 0' 
      });
    }
    
    // Check if category exists and is income type
    const category = await Category.findByPk(category_id);
    if (!category || category.type !== 'income') {
      return res.status(400).json({ 
        success: false, 
        message: 'หมวดหมู่ไม่ถูกต้องหรือไม่ใช่หมวดหมู่รายได้' 
      });
    }
    
    const income = await Income.create({
      amount: parseFloat(amount),
      description,
      transaction_date: transaction_date || new Date(),
      user_id: userId,
      category_id: category_id
    });
    
    const createdIncome = await Income.findByPk(income.id, {
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
    
    res.status(201).json({ 
      success: true, 
      message: 'เพิ่มรายได้สำเร็จ',
      data: createdIncome 
    });
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มรายได้' });
  }
};

// Update income (public for now)
const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, transaction_date, category_id } = req.body;
    
    const income = await Income.findByPk(id);
    if (!income) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายได้ที่ระบุ' });
    }
    
    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'จำนวนเงินต้องมากกว่า 0' 
      });
    }
    
    // Check if category exists and is income type (if category_id is provided)
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category || category.type !== 'income') {
        return res.status(400).json({ 
          success: false, 
          message: 'หมวดหมู่ไม่ถูกต้องหรือไม่ใช่หมวดหมู่รายได้' 
        });
      }
    }
    
    await income.update({
      amount: amount !== undefined ? parseFloat(amount) : income.amount,
      description: description || income.description,
      transaction_date: transaction_date || income.transaction_date,
      category_id: category_id || income.category_id
    });
    
    const updatedIncome = await Income.findByPk(id, {
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
      message: 'อัปเดตรายได้สำเร็จ',
      data: updatedIncome 
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตรายได้' });
  }
};

// Delete income (public for now)
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    
    const income = await Income.findByPk(id);
    if (!income) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายได้ที่ระบุ' });
    }
    
    await income.destroy();
    
    res.json({ success: true, message: 'ลบรายได้สำเร็จ' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบรายได้' });
  }
};

// Get income statistics
const getIncomeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const sequelize = Income.sequelize;

    // Dynamic date filter
    const filters = [];
    const replacements = {};
    if (startDate && endDate) {
      filters.push('transaction_date BETWEEN :startDate AND :endDate');
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }
    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // Totals
    const [sumRows] = await sequelize.query(
      `SELECT COALESCE(SUM(amount),0) AS totalIncome, COUNT(*) AS incomeCount FROM incomes ${whereSql}`,
      { replacements }
    );
    const totalIncome = Number(sumRows?.[0]?.totalIncome || 0);
    const incomeCount = Number(sumRows?.[0]?.incomeCount || 0);

    // Group by category
    const [groupRows] = await sequelize.query(
      `SELECT category_id, COALESCE(SUM(amount),0) AS totalAmount, COUNT(*) AS count
       FROM incomes ${ whereSql } GROUP BY category_id`,
      { replacements }
    );

    const categoryIds = groupRows.map(r => r.category_id).filter(Boolean);
    const categories = categoryIds.length
      ? await Category.findAll({ where: { id: { [Op.in]: categoryIds } }, attributes: ['id','name'] })
      : [];
    const idToName = new Map(categories.map(c => [c.id, c.name]));
    const incomeByCategory = groupRows.map(r => ({
      category_id: r.category_id,
      category: { id: r.category_id, name: idToName.get(r.category_id) || 'ไม่ระบุ' },
      totalAmount: Number(r.totalAmount || 0),
      count: Number(r.count || 0)
    }));
    
    res.json({
      success: true,
      data: {
        totalIncome: totalIncome || 0,
        incomeCount,
        incomeByCategory
      }
    });
  } catch (error) {
    console.error('Error getting income stats:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงสถิติรายได้' });
  }
};

module.exports = {
  getAllIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats
};

/**
 * อัปโหลดไฟล์ประกอบรายรับ
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
    cb(null, `income-${unique}${path.extname(file.originalname)}`);
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

async function attachIncomeReceipt(req, res) {
  try {
    const { id } = req.params;
    const income = await Income.findByPk(id);
    if (!income) return res.status(404).json({ success: false, message: 'ไม่พบรายรับ' });

    if (income.receipt_file) {
      const oldPath = path.join(__dirname, '..', income.receipt_file.replace(/^\/+/, ''));
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (_) {}
      }
    }

    const relative = `/uploads/receipts/${path.basename(req.file.path)}`;
    await income.update({ receipt_file: relative });

    res.json({ success: true, message: 'อัปโหลดไฟล์สำเร็จ', data: { receipt_file: relative } });
  } catch (error) {
    console.error('Error attaching income receipt:', error);
    res.status(500).json({ success: false, message: 'อัปโหลดไฟล์ไม่สำเร็จ' });
  }
}

module.exports.receiptUpload = receiptUpload;
module.exports.attachIncomeReceipt = attachIncomeReceipt;