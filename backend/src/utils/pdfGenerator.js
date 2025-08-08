const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.doc = null;
  }

  // Helper: set Thai-capable font if provided
  setThaiFont(doc) {
    try {
      const fontPath = process.env.PDF_FONT_PATH; // e.g. backend/assets/fonts/THSarabunNew.ttf
      if (fontPath && fs.existsSync(fontPath)) {
        doc.registerFont('thai', fontPath);
        return 'thai';
      }
    } catch (_) {}
    return 'Helvetica';
  }

  // Generate receipt PDF
  async generateReceipt(transaction, type = 'income') {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const fileName = `receipt_${type}_${transaction.id}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../uploads/receipts', fileName);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const baseFont = this.setThaiFont(doc);

        // Header
        doc.fontSize(24)
           .font(baseFont)
           .text('Solution NextGen', { align: 'center' });
        
        doc.fontSize(16)
           .font(baseFont)
           .text('ใบเสร็จรับเงิน', { align: 'center' });
        
        doc.moveDown(0.5);

        // Receipt details
        doc.fontSize(12)
           .font(baseFont)
           .text(`เลขที่: ${transaction.id}`, { continued: true })
           .font(baseFont)
           .text(`  วันที่: ${new Date(transaction.date).toLocaleDateString('th-TH')}`);
        
        doc.moveDown(0.5);

        // Transaction type
        const typeText = type === 'income' ? 'รายได้' : 'รายจ่าย';
        doc.fontSize(14)
           .font(baseFont)
           .text(`ประเภท: ${typeText}`);
        
        doc.moveDown(0.5);

        // Category
        doc.fontSize(12)
           .font(baseFont)
           .text(`หมวดหมู่: ${transaction.category?.name || 'ไม่ระบุ'}`);
        
        doc.moveDown(0.5);

        // Description
        doc.fontSize(12)
           .font(baseFont)
           .text('รายละเอียด:');
        
        doc.fontSize(12)
           .font(baseFont)
           .text(transaction.description || 'ไม่ระบุ');
        
        doc.moveDown(0.5);

        // Amount
        doc.fontSize(16)
           .font(baseFont)
           .text(`จำนวนเงิน: ${transaction.amount.toLocaleString('th-TH')} บาท`, { align: 'right' });
        
        doc.moveDown(1);

        // User info
        doc.fontSize(10)
           .font(baseFont)
           .text(`บันทึกโดย: ${transaction.user?.username || 'ไม่ระบุ'}`);
        
        doc.moveDown(0.5);

        // Footer
        doc.fontSize(10)
           .font(baseFont)
           .text('ใบเสร็จนี้สร้างโดยระบบ AccNext', { align: 'center' });
        
        doc.fontSize(8)
           .font(baseFont)
           .text(`สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}`, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            url: `/uploads/receipts/${fileName}`
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate financial report PDF
  async generateFinancialReport(reportData, reportType = 'monthly') {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const baseFont = this.setThaiFont(doc);

        const fileName = `report_${reportType}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../uploads/reports', fileName);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(24)
           .font(baseFont)
           .text('Solution NextGen', { align: 'center' });
        
        doc.fontSize(16)
           .font(baseFont)
           .text(`รายงานทางการเงิน - ${reportType === 'monthly' ? 'รายเดือน' : 'รายปี'}`, { align: 'center' });
        
        doc.moveDown(0.5);

        // Period
        const period = reportData.period;
        if (period) {
          doc.fontSize(12)
             .font(baseFont)
             .text(`ช่วงเวลา: ${period.startDate ? new Date(period.startDate).toLocaleDateString('th-TH') : ''} - ${period.endDate ? new Date(period.endDate).toLocaleDateString('th-TH') : ''}`);
          
          doc.moveDown(0.5);
        }

        // Summary
        const summary = reportData.summary;
        if (summary) {
          doc.fontSize(14)
             .font(baseFont)
             .text('สรุปยอดรวม:');
          
          doc.fontSize(12)
             .font(baseFont)
             .text(`รายได้รวม: ${summary.totalIncome?.toLocaleString('th-TH') || '0'} บาท`);
          
          doc.text(`รายจ่ายรวม: ${summary.totalExpense?.toLocaleString('th-TH') || '0'} บาท`);
          
          doc.fontSize(14)
             .font(baseFont)
             .text(`ยอดสุทธิ: ${summary.netIncome?.toLocaleString('th-TH') || '0'} บาท`);
          
          doc.moveDown(0.5);
        }

        // Income by category
        if (reportData.incomeByCategory && reportData.incomeByCategory.length > 0) {
          doc.fontSize(14)
             .font(baseFont)
             .text('รายได้แยกตามหมวดหมู่:');
          
          reportData.incomeByCategory.forEach((item, index) => {
            doc.fontSize(12)
               .font(baseFont)
               .text(`${index + 1}. ${item.category?.name || 'ไม่ระบุ'}: ${parseFloat(item.totalAmount).toLocaleString('th-TH')} บาท`);
          });
          
          doc.moveDown(0.5);
        }

        // Expense by category
        if (reportData.expenseByCategory && reportData.expenseByCategory.length > 0) {
          doc.fontSize(14)
             .font(baseFont)
             .text('รายจ่ายแยกตามหมวดหมู่:');
          
          reportData.expenseByCategory.forEach((item, index) => {
            doc.fontSize(12)
               .font(baseFont)
               .text(`${index + 1}. ${item.category?.name || 'ไม่ระบุ'}: ${parseFloat(item.totalAmount).toLocaleString('th-TH')} บาท`);
          });
          
          doc.moveDown(0.5);
        }

        // Footer
        doc.fontSize(10)
           .font(baseFont)
           .text('รายงานนี้สร้างโดยระบบ AccNext', { align: 'center' });
        
        doc.fontSize(8)
           .font(baseFont)
           .text(`สร้างเมื่อ: ${new Date().toLocaleString('th-TH')}`, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            url: `/uploads/reports/${fileName}`
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator; 