const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CSVImporter = require('../utils/csvImporter');

const csvImporter = new CSVImporter();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/imports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('ไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์ CSV หรือ Excel เท่านั้น'), false);
    }
  }
});

// Import income data from file
const importIncome = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณาอัปโหลดไฟล์' 
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const userId = req.user.id;

    let result;

    if (fileExtension === '.csv') {
      result = await csvImporter.importFromCSV(filePath, userId, 'income');
    } else {
      result = await csvImporter.importFromExcel(filePath, userId, 'income');
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `นำเข้าข้อมูลรายได้สำเร็จ ${result.imported.length} รายการ`,
      data: {
        imported: result.imported.length,
        errors: result.errors.length,
        totalRows: result.totalRows,
        errors: result.errors
      }
    });

  } catch (error) {
    console.error('Error importing income:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + error.message 
    });
  }
};

// Import expense data from file
const importExpense = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'กรุณาอัปโหลดไฟล์' 
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const userId = req.user.id;

    let result;

    if (fileExtension === '.csv') {
      result = await csvImporter.importFromCSV(filePath, userId, 'expense');
    } else {
      result = await csvImporter.importFromExcel(filePath, userId, 'expense');
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: `นำเข้าข้อมูลรายจ่ายสำเร็จ ${result.imported.length} รายการ`,
      data: {
        imported: result.imported.length,
        errors: result.errors.length,
        totalRows: result.totalRows,
        errors: result.errors
      }
    });

  } catch (error) {
    console.error('Error importing expense:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + error.message 
    });
  }
};

// Get import template
const getImportTemplate = async (req, res) => {
  try {
    const { type = 'income' } = req.query;
    
    const template = csvImporter.getImportTemplate(type);
    
    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Error getting import template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงเทมเพลต' 
    });
  }
};

// Download import template
const downloadImportTemplate = async (req, res) => {
  try {
    const { type = 'income', format = 'csv' } = req.query;
    
    const template = csvImporter.getImportTemplate(type);
    
    if (format === 'csv') {
      // Generate CSV template
      const csvContent = [
        template.headers.join(','),
        ...template.sampleData.map(row => 
          template.headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="template_${type}.csv"`);
      res.send(csvContent);
      
    } else if (format === 'xlsx') {
      // Generate Excel template
      const xlsx = require('xlsx');
      const workbook = xlsx.utils.book_new();
      
      const worksheet = xlsx.utils.json_to_sheet(template.sampleData);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');
      
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="template_${type}.xlsx"`);
      res.send(buffer);
      
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'รูปแบบไฟล์ไม่ถูกต้อง' 
      });
    }

  } catch (error) {
    console.error('Error downloading import template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต' 
    });
  }
};

module.exports = {
  upload,
  importIncome,
  importExpense,
  getImportTemplate,
  downloadImportTemplate
}; 