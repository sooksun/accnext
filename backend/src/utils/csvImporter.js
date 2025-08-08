const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const { Income, Expense, Category, User } = require('../models');

class CSVImporter {
  constructor() {
    this.supportedFormats = ['.csv', '.xlsx', '.xls'];
  }

  // Import data from CSV file
  async importFromCSV(filePath, userId, type = 'income') {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let rowNumber = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          rowNumber++;
          try {
            const processedRow = this.processCSVRow(data, type);
            if (processedRow) {
              results.push(processedRow);
            }
          } catch (error) {
            errors.push({
              row: rowNumber,
              error: error.message,
              data: data
            });
          }
        })
        .on('end', async () => {
          try {
            const importResult = await this.saveImportedData(results, userId, type);
            resolve({
              success: true,
              imported: importResult.imported,
              errors: [...errors, ...importResult.errors],
              totalRows: rowNumber
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Import data from Excel file
  async importFromExcel(filePath, userId, type = 'income') {
    return new Promise(async (resolve, reject) => {
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const results = [];
        const errors = [];

        data.forEach((row, index) => {
          try {
            const processedRow = this.processExcelRow(row, type);
            if (processedRow) {
              results.push(processedRow);
            }
          } catch (error) {
            errors.push({
              row: index + 1,
              error: error.message,
              data: row
            });
          }
        });

        const importResult = await this.saveImportedData(results, userId, type);
        
        resolve({
          success: true,
          imported: importResult.imported,
          errors: [...errors, ...importResult.errors],
          totalRows: data.length
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Process CSV row
  processCSVRow(data, type) {
    const requiredFields = ['amount', 'description', 'category'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const date = data.date ? new Date(data.date) : new Date();
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    return {
      amount,
      description: data.description.trim(),
      category: data.category.trim(),
      date,
      notes: data.notes || ''
    };
  }

  // Process Excel row
  processExcelRow(data, type) {
    const requiredFields = ['amount', 'description', 'category'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    let date = new Date();
    if (data.date) {
      // Handle Excel date format
      if (typeof data.date === 'number') {
        // Excel date is number of days since 1900-01-01
        date = new Date((data.date - 25569) * 86400 * 1000);
      } else {
        date = new Date(data.date);
      }
    }
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    return {
      amount,
      description: String(data.description).trim(),
      category: String(data.category).trim(),
      date,
      notes: data.notes ? String(data.notes).trim() : ''
    };
  }

  // Save imported data to database
  async saveImportedData(data, userId, type) {
    const imported = [];
    const errors = [];

    for (const row of data) {
      try {
        // Find or create category
        let category = await Category.findOne({
          where: {
            name: row.category,
            type: type
          }
        });

        if (!category) {
          category = await Category.create({
            name: row.category,
            type: type
          });
        }

        // Create transaction
        const transactionData = {
          amount: row.amount,
          description: row.description,
          date: row.date,
          userId,
          categoryId: category.id
        };

        if (type === 'income') {
          const income = await Income.create(transactionData);
          imported.push({
            id: income.id,
            type: 'income',
            amount: income.amount,
            description: income.description,
            category: category.name
          });
        } else {
          const expense = await Expense.create(transactionData);
          imported.push({
            id: expense.id,
            type: 'expense',
            amount: expense.amount,
            description: expense.description,
            category: category.name
          });
        }

      } catch (error) {
        errors.push({
          data: row,
          error: error.message
        });
      }
    }

    return { imported, errors };
  }

  // Get import template
  getImportTemplate(type = 'income') {
    const headers = ['amount', 'description', 'category', 'date', 'notes'];
    const sampleData = [
      {
        amount: '1000',
        description: 'เงินเดือน',
        category: 'เงินเดือน',
        date: '2024-01-15',
        notes: 'เงินเดือนเดือนมกราคม'
      },
      {
        amount: '500',
        description: 'ค่าขนส่ง',
        category: 'ค่าขนส่ง',
        date: '2024-01-16',
        notes: 'ค่าแท็กซี่'
      }
    ];

    return {
      headers,
      sampleData,
      instructions: [
        '1. ไฟล์ต้องมีคอลัมน์: amount, description, category',
        '2. amount ต้องเป็นตัวเลขที่มากกว่า 0',
        '3. description และ category ต้องไม่ว่าง',
        '4. date เป็นตัวเลือก (ถ้าไม่ระบุจะใช้วันที่ปัจจุบัน)',
        '5. notes เป็นตัวเลือก'
      ]
    };
  }

  // Validate file format
  validateFileFormat(filename) {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return this.supportedFormats.includes(extension);
  }
}

module.exports = CSVImporter; 