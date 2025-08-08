const { Income, Expense, Category, User } = require('../models');
const { Op } = require('sequelize');

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
}

function toCSV(rows, headers) {
  const head = headers.join(',');
  const body = rows
    .map((r) => headers
      .map((h) => {
        const v = r[h] ?? '';
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      })
      .join(',')
    )
    .join('\n');
  return `${head}\n${body}`;
}

async function fetchIncome(user) {
  const where = {};
  if (user.role !== 'admin') where.user_id = user.id;
  return await Income.findAll({
    where,
    include: [
      { model: Category, as: 'category', attributes: ['name'] },
      { model: User, as: 'user', attributes: ['username'] },
    ],
    order: [['transaction_date', 'DESC']],
  });
}

async function fetchExpense(user) {
  const where = {};
  if (user.role !== 'admin') where.user_id = user.id;
  return await Expense.findAll({
    where,
    include: [
      { model: Category, as: 'category', attributes: ['name'] },
      { model: User, as: 'user', attributes: ['username'] },
    ],
    order: [['transaction_date', 'DESC']],
  });
}

// Export Income CSV
const exportIncomeCSV = async (req, res) => {
  try {
    const items = await fetchIncome(req.user);
    const rows = items.map((it) => ({
      id: it.id,
      date: formatDate(it.transaction_date),
      amount: it.amount,
      description: it.description,
      reference_number: it.reference_number || '',
      payment_method: it.payment_method || '',
      category: it.category?.name || '',
      user: it.user?.username || '',
    }));
    const headers = ['id', 'date', 'amount', 'description', 'reference_number', 'payment_method', 'category', 'user'];
    const csv = toCSV(rows, headers);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="income.csv"');
    res.send(csv);
  } catch (error) {
    console.error('exportIncomeCSV error:', error);
    res.status(500).json({ success: false, message: 'ไม่สามารถส่งออก CSV ได้' });
  }
};

// Export Expense CSV
const exportExpenseCSV = async (req, res) => {
  try {
    const items = await fetchExpense(req.user);
    const rows = items.map((it) => ({
      id: it.id,
      date: formatDate(it.transaction_date),
      amount: it.amount,
      description: it.description,
      reference_number: it.reference_number || '',
      payment_method: it.payment_method || '',
      vendor: it.vendor || '',
      category: it.category?.name || '',
      user: it.user?.username || '',
    }));
    const headers = ['id', 'date', 'amount', 'description', 'reference_number', 'payment_method', 'vendor', 'category', 'user'];
    const csv = toCSV(rows, headers);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="expense.csv"');
    res.send(csv);
  } catch (error) {
    console.error('exportExpenseCSV error:', error);
    res.status(500).json({ success: false, message: 'ไม่สามารถส่งออก CSV ได้' });
  }
};

// Export Income Excel
const exportIncomeExcel = async (req, res) => {
  try {
    const xlsx = require('xlsx');
    const items = await fetchIncome(req.user);
    const rows = items.map((it) => ({
      ID: it.id,
      Date: formatDate(it.transaction_date),
      Amount: Number(it.amount),
      Description: it.description,
      Reference: it.reference_number || '',
      Payment: it.payment_method || '',
      Category: it.category?.name || '',
      User: it.user?.username || '',
    }));
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, 'Income');
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="income.xlsx"');
    res.send(buf);
  } catch (error) {
    console.error('exportIncomeExcel error:', error);
    res.status(500).json({ success: false, message: 'ไม่สามารถส่งออก Excel ได้' });
  }
};

// Export Expense Excel
const exportExpenseExcel = async (req, res) => {
  try {
    const xlsx = require('xlsx');
    const items = await fetchExpense(req.user);
    const rows = items.map((it) => ({
      ID: it.id,
      Date: formatDate(it.transaction_date),
      Amount: Number(it.amount),
      Description: it.description,
      Reference: it.reference_number || '',
      Payment: it.payment_method || '',
      Vendor: it.vendor || '',
      Category: it.category?.name || '',
      User: it.user?.username || '',
    }));
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, 'Expense');
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="expense.xlsx"');
    res.send(buf);
  } catch (error) {
    console.error('exportExpenseExcel error:', error);
    res.status(500).json({ success: false, message: 'ไม่สามารถส่งออก Excel ได้' });
  }
};

module.exports = {
  exportIncomeCSV,
  exportExpenseCSV,
  exportIncomeExcel,
  exportExpenseExcel,
};

