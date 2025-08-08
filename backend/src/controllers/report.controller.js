const { Income, Expense, Category, User } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

// Get monthly financial report
const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.id;
    
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const whereClause = {
      transaction_date: {
        [Op.between]: [startDate, endDate]
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
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
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
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['category_id', 'category.id', 'category.name']
    });
    
    // Get daily breakdown
    const dailyIncome = await Income.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('transaction_date')), 'date'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('transaction_date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('transaction_date')), 'ASC']]
    });
    
    const dailyExpense = await Expense.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('transaction_date')), 'date'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('transaction_date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('transaction_date')), 'ASC']]
    });
    
    res.json({
      success: true,
      data: {
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
        expenseByCategory,
        dailyBreakdown: {
          income: dailyIncome,
          expense: dailyExpense
        }
      }
    });
  } catch (error) {
    console.error('Error getting monthly report:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงรายงานรายเดือน' });
  }
};

// Get yearly financial report
const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.user.id;
    
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);
    
    const whereClause = {
      date: {
        [Op.between]: [startDate, endDate]
      }
    };
    
    // For non-admin users, only show their own data
    if (req.user.role !== 'admin') {
      whereClause.userId = userId;
    }
    
    // Get total income and expense for the year
    const totalIncome = await Income.sum('amount', { where: whereClause });
    const totalExpense = await Expense.sum('amount', { where: whereClause });
    const netIncome = (totalIncome || 0) - (totalExpense || 0);
    
    // Get monthly breakdown
    const monthlyIncome = await Income.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('MONTH', Sequelize.col('date'))],
      order: [[Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']]
    });
    
    const monthlyExpense = await Expense.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('MONTH', Sequelize.col('date'))],
      order: [[Sequelize.fn('MONTH', Sequelize.col('date')), 'ASC']]
    });
    
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
        'categoryId',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['categoryId', 'category.id', 'category.name']
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
        'categoryId',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['categoryId', 'category.id', 'category.name']
    });
    
    res.json({
      success: true,
      data: {
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
        monthlyBreakdown: {
          income: monthlyIncome,
          expense: monthlyExpense
        },
        incomeByCategory,
        expenseByCategory
      }
    });
  } catch (error) {
    console.error('Error getting yearly report:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงรายงานรายปี' });
  }
};

// Get custom date range report
const getCustomRangeReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุด' 
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ 
        success: false, 
        message: 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด' 
      });
    }
    
    const whereClause = {
      date: {
        [Op.between]: [start, end]
      }
    };
    
    // For non-admin users, only show their own data
    if (req.user.role !== 'admin') {
      whereClause.userId = userId;
    }
    
    // Get total income and expense
    const totalIncome = await Income.sum('amount', { where: whereClause });
    const totalExpense = await Expense.sum('amount', { where: whereClause });
    const netIncome = (totalIncome || 0) - (totalExpense || 0);
    
    // Get income and expense counts
    const incomeCount = await Income.count({ where: whereClause });
    const expenseCount = await Expense.count({ where: whereClause });
    
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
        'categoryId',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['categoryId', 'category.id', 'category.name']
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
        'categoryId',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['categoryId', 'category.id', 'category.name']
    });
    
    // Get daily breakdown
    const dailyIncome = await Income.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('date')), 'date'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('date')), 'ASC']]
    });
    
    const dailyExpense = await Expense.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('date')), 'date'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('date')), 'ASC']]
    });
    
    res.json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end
        },
        summary: {
          totalIncome: totalIncome || 0,
          totalExpense: totalExpense || 0,
          netIncome,
          incomeCount,
          expenseCount
        },
        incomeByCategory,
        expenseByCategory,
        dailyBreakdown: {
          income: dailyIncome,
          expense: dailyExpense
        }
      }
    });
  } catch (error) {
    console.error('Error getting custom range report:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงรายงานช่วงวันที่กำหนด' });
  }
};

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current month data
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const currentMonthWhere = {
      transaction_date: {
        [Op.between]: [currentMonthStart, currentMonthEnd]
      }
    };
    
    // For non-admin users, only show their own data
    if (req.user.role !== 'admin') {
      currentMonthWhere.user_id = userId;
    }
    
    // Get current month totals
    const currentMonthIncome = await Income.sum('amount', { where: currentMonthWhere });
    const currentMonthExpense = await Expense.sum('amount', { where: currentMonthWhere });
    const currentMonthNet = (currentMonthIncome || 0) - (currentMonthExpense || 0);
    
    // Get previous month data
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    const previousMonthWhere = {
      transaction_date: {
        [Op.between]: [previousMonthStart, previousMonthEnd]
      }
    };
    
    if (req.user.role !== 'admin') {
      previousMonthWhere.user_id = userId;
    }
    
    const previousMonthIncome = await Income.sum('amount', { where: previousMonthWhere });
    const previousMonthExpense = await Expense.sum('amount', { where: previousMonthWhere });
    const previousMonthNet = (previousMonthIncome || 0) - (previousMonthExpense || 0);
    
    // Calculate changes
    const incomeChange = currentMonthIncome - previousMonthIncome;
    const expenseChange = currentMonthExpense - previousMonthExpense;
    const netChange = currentMonthNet - previousMonthNet;
    
    // Get top categories for current month
    const topIncomeCategories = await Income.findAll({
      where: currentMonthWhere,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'category_id',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
      ],
      group: ['category_id', 'category.id', 'category.name'],
      order: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'DESC']],
      limit: 5
    });
    
    const topExpenseCategories = await Expense.findAll({
      where: currentMonthWhere,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'category_id',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
      ],
      group: ['category_id', 'category.id', 'category.name'],
      order: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'DESC']],
      limit: 5
    });
    
    res.json({
      success: true,
      data: {
        currentMonth: {
          income: currentMonthIncome || 0,
          expense: currentMonthExpense || 0,
          net: currentMonthNet
        },
        previousMonth: {
          income: previousMonthIncome || 0,
          expense: previousMonthExpense || 0,
          net: previousMonthNet
        },
        changes: {
          income: incomeChange,
          expense: expenseChange,
          net: netChange
        },
        topCategories: {
          income: topIncomeCategories,
          expense: topExpenseCategories
        }
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงสรุปแดชบอร์ด' });
  }
};

module.exports = {
  getMonthlyReport,
  getYearlyReport,
  getCustomRangeReport,
  getDashboardSummary
}; 