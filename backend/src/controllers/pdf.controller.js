const PDFGenerator = require('../utils/pdfGenerator');
const { Income, Expense, Category, User, Invoice, InvoiceItem } = require('../models');

const pdfGenerator = new PDFGenerator();

// Generate receipt PDF for income
const generateIncomeReceipt = async (req, res) => {
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
    
    // Check if user can access this income
    if (req.user.role !== 'admin' && income.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงรายได้นี้' });
    }
    
    const result = await pdfGenerator.generateReceipt(income, 'income');
    
    res.json({
      success: true,
      message: 'สร้างใบเสร็จสำเร็จ',
      data: {
        fileName: result.fileName,
        downloadUrl: result.url
      }
    });
    
  } catch (error) {
    console.error('Error generating income receipt:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างใบเสร็จ' });
  }
};

// Generate receipt PDF for expense
const generateExpenseReceipt = async (req, res) => {
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
    
    // Check if user can access this expense
    if (req.user.role !== 'admin' && expense.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงรายจ่ายนี้' });
    }
    
    const result = await pdfGenerator.generateReceipt(expense, 'expense');
    
    res.json({
      success: true,
      message: 'สร้างใบเสร็จสำเร็จ',
      data: {
        fileName: result.fileName,
        downloadUrl: result.url
      }
    });
    
  } catch (error) {
    console.error('Error generating expense receipt:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างใบเสร็จ' });
  }
};

// Generate monthly report PDF
const generateMonthlyReportPDF = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.id;
    
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const whereClause = {
      transaction_date: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    };
    
    // For non-admin users, only show their own data
    if (req.user.role !== 'admin') {
      whereClause.user_id = userId;
    }
    
    // Get income data
    const totalIncome = await Income.sum('amount', { where: whereClause });
    const incomeCount = await Income.count({ where: whereClause });
    
    // Get expense data
    const totalExpense = await Expense.sum('amount', { where: whereClause });
    const expenseCount = await Expense.count({ where: whereClause });
    
    // Calculate net income
    const netIncome = (totalIncome || 0) - (totalExpense || 0);
    
    // Get income by category
    const incomeByCategory = await Income.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'category_id',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['category_id', 'category.id', 'category.name']
    });
    
    // Get expense by category
    const expenseByCategory = await Expense.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'category_id',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['category_id', 'category.id', 'category.name']
    });
    
    const reportData = {
      period: {
        year: currentYear,
        month: currentMonth,
        startDate,
        endDate
      },
      summary: {
        totalIncome: totalIncome || 0,
        totalExpense: totalExpense || 0,
        netIncome,
        incomeCount,
        expenseCount
      },
      incomeByCategory,
      expenseByCategory
    };
    
    const result = await pdfGenerator.generateFinancialReport(reportData, 'monthly');
    
    res.json({
      success: true,
      message: 'สร้างรายงาน PDF สำเร็จ',
      data: {
        fileName: result.fileName,
        downloadUrl: result.url
      }
    });
    
  } catch (error) {
    console.error('Error generating monthly report PDF:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างรายงาน PDF' });
  }
};

// Generate yearly report PDF
const generateYearlyReportPDF = async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.user.id;
    
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);
    
    const whereClause = {
      transaction_date: {
        [require('sequelize').Op.between]: [startDate, endDate]
      }
    };
    
    // For non-admin users, only show their own data
    if (req.user.role !== 'admin') {
      whereClause.user_id = userId;
    }
    
    // Get total income and expense for the year
    const totalIncome = await Income.sum('amount', { where: whereClause });
    const totalExpense = await Expense.sum('amount', { where: whereClause });
    const netIncome = (totalIncome || 0) - (totalExpense || 0);
    
    // Get income by category for the year
    const incomeByCategory = await Income.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'category_id',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['category_id', 'category.id', 'category.name']
    });
    
    // Get expense by category for the year
    const expenseByCategory = await Expense.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'category_id',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalAmount'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['category_id', 'category.id', 'category.name']
    });
    
    const reportData = {
      period: {
        year: currentYear,
        startDate,
        endDate
      },
      summary: {
        totalIncome: totalIncome || 0,
        totalExpense: totalExpense || 0,
        netIncome
      },
      incomeByCategory,
      expenseByCategory
    };
    
    const result = await pdfGenerator.generateFinancialReport(reportData, 'yearly');
    
    res.json({
      success: true,
      message: 'สร้างรายงาน PDF สำเร็จ',
      data: {
        fileName: result.fileName,
        downloadUrl: result.url
      }
    });
    
  } catch (error) {
    console.error('Error generating yearly report PDF:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างรายงาน PDF' });
  }
};

// Generate invoice PDF
const generateInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'username', 'email']
        },
        {
          model: InvoiceItem,
          as: 'items',
          order: [['item_no', 'ASC']]
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'ไม่พบใบกำกับภาษีที่ระบุ' });
    }
    
    // Check if user can access this invoice
    if (req.user.role !== 'admin' && invoice.issued_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงใบกำกับภาษีนี้' });
    }
    
    const result = await pdfGenerator.generateInvoice(invoice);
    
    // Send PDF file directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${result.fileName}"`);
    res.sendFile(result.filePath);
    
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างใบกำกับภาษี PDF' });
  }
};

module.exports = {
  generateIncomeReceipt,
  generateExpenseReceipt,
  generateMonthlyReportPDF,
  generateYearlyReportPDF,
  generateInvoicePDF
}; 