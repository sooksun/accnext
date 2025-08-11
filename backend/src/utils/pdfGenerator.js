const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.doc = null;
  }

  // Helper: set Thai-capable font
  setThaiFont(doc) {
    try {
      // ใช้ font ภาษาไทยจาก backend fonts directory
      const fontPaths = [
        path.join(__dirname, '../../fonts/THSarabunNew.ttf'),
        path.join(__dirname, '../../frontend/public/fonts/THSarabunNew.ttf'),
        path.resolve(__dirname, '../../fonts/THSarabunNew.ttf')
      ];
      
      console.log('🔍 Searching for Thai font...');
      for (const fontPath of fontPaths) {
        console.log(`Checking: ${fontPath}`);
        if (fs.existsSync(fontPath)) {
          console.log(`✅ Found Thai font at: ${fontPath}`);
          doc.registerFont('thai', fontPath);
          return 'thai';
        }
      }
      
      // ถ้าไม่พบ font ในโปรเจค ให้ใช้ font ที่รองรับภาษาไทยในระบบ
      const systemFonts = [
        'C:/Windows/Fonts/THSarabunNew.ttf',
        'C:/Windows/Fonts/cordia.ttf',
        'C:/Windows/Fonts/cordiau.ttf',
        'C:/Windows/Fonts/angsa.ttf'
      ];
      
      console.log('🔍 Searching for system Thai fonts...');
      for (const systemFont of systemFonts) {
        console.log(`Checking: ${systemFont}`);
        if (fs.existsSync(systemFont)) {
          console.log(`✅ Found system Thai font at: ${systemFont}`);
          doc.registerFont('thai', systemFont);
          return 'thai';
        }
      }
      
      // ถ้าไม่พบ font ใดๆ ให้ใช้ Helvetica แต่จะแสดงภาษาไทยไม่ได้
      console.warn('❌ ไม่พบ font ภาษาไทย ข้อความภาษาไทยอาจแสดงผลไม่ถูกต้อง');
      return 'Helvetica';
    } catch (error) {
      console.error('❌ Error setting Thai font:', error);
      return 'Helvetica';
    }
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
        const filePath = path.join(__dirname, '../../uploads/receipts', fileName);
        
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

  // Generate invoice PDF
  async generateInvoice(invoice) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const fileName = `invoice_${invoice.doc_no}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../../uploads/receipts', fileName);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const baseFont = this.setThaiFont(doc);

        // Header with logo
        try {
          // Try to add company logo
          const logoPath = path.join(__dirname, '../../public/logo/company.png');
          if (fs.existsSync(logoPath)) {
            console.log('✅ Adding company logo to PDF');
            
            // Save current position
            const currentY = doc.y;
            
            // Add logo (left side)
            doc.image(logoPath, 45, currentY, { 
              width: 80, 
              height: 80,
              fit: [80, 80]
            });
            
            // Add company text (center-right side)
            doc.fontSize(24)
               .font(baseFont)
               .text('Solution NextGen', 110, currentY + 10, { align: 'center', width: 350 });
            
            doc.fontSize(18)
               .font(baseFont)
               .text('ใบกำกับภาษี / ใบเสร็จรับเงิน', 110, currentY + 40, { align: 'center', width: 350 });
            
            doc.fontSize(14)
               .font(baseFont)
               .text('TAX INVOICE / RECEIPT', 110, currentY + 65, { align: 'center', width: 350 });
               
            // Move to next position after logo
            doc.y = currentY + 80;
            
          } else {
            console.log('⚠️ Logo not found, using text-only header');
            
            // Fallback to text-only header
            doc.fontSize(24)
               .font(baseFont)
               .text('Solution NextGen', { align: 'center' });
            
            doc.fontSize(18)
               .font(baseFont)
               .text('ใบกำกับภาษี / ใบเสร็จรับเงิน', { align: 'center' });
            
            doc.fontSize(14)
               .font(baseFont)
               .text('TAX INVOICE / RECEIPT', { align: 'center' });
          }
        } catch (error) {
          console.log('⚠️ Error adding logo, using text-only header:', error.message);
          
          // Fallback to text-only header
          doc.fontSize(24)
             .font(baseFont)
             .text('Solution NextGen', { align: 'center' });
          
          doc.fontSize(18)
             .font(baseFont)
             .text('ใบกำกับภาษี / ใบเสร็จรับเงิน', { align: 'center' });
          
          doc.fontSize(14)
             .font(baseFont)
             .text('TAX INVOICE / RECEIPT', { align: 'center' });
        }
        
        doc.moveDown(1);

        // Company info
        doc.fontSize(12)
           .font(baseFont)
           .text('ห้างหุ้นส่วนจำกัด โซลูชั่นเนกซ์เจน');
        
        doc.fontSize(10)
           .font(baseFont)
           .text('ที่อยู่: 468/449 หมู่ที่ 3 ตำบล บ้านดู่ อำเภอเมืองเชียงราย จังหวัดเชียงราย 57100');
        
        doc.fontSize(10)
           .font(baseFont)
           .text('โทร: 08-1277-1948 | แฟกซ์: 02-123-4568');
        
        doc.fontSize(10)
           .font(baseFont)
           .text('เลขประจำตัวผู้เสียภาษี: 0123456789012');
        
        doc.moveDown(1);

        // Invoice details
        doc.fontSize(12)
           .font(baseFont)
           .text(`เลขที่เอกสาร: ${invoice.doc_no}`, { continued: true })
           .font(baseFont)
           .text(`  วันที่ออกเอกสาร: ${new Date(invoice.doc_date).toLocaleDateString('th-TH')}`);
        
        if (invoice.due_date) {
          doc.fontSize(12)
             .font(baseFont)
             .text(`  วันครบกำหนดชำระ: ${new Date(invoice.due_date).toLocaleDateString('th-TH')}`);
        }
        
        doc.moveDown(1);

        // Customer info
        doc.fontSize(12)
           .font(baseFont)
           .text('ข้อมูลลูกค้า:');
        
        doc.fontSize(10)
           .font(baseFont)
           .text(`ชื่อ: ${invoice.customer_name}`);
        
        if (invoice.customer_tax_id) {
          doc.fontSize(10)
             .font(baseFont)
             .text(`เลขประจำตัวผู้เสียภาษี: ${invoice.customer_tax_id}`);
        }
        
        if (invoice.customer_address) {
          doc.fontSize(10)
             .font(baseFont)
             .text(`ที่อยู่: ${invoice.customer_address}`);
        }
        
        if (invoice.customer_phone) {
          doc.fontSize(10)
             .font(baseFont)
             .text(`โทร: ${invoice.customer_phone}`);
        }
        
        doc.moveDown(1);

        // Items table
        if (invoice.items && invoice.items.length > 0) {
          doc.fontSize(12)
             .font(baseFont)
             .text('รายการสินค้า/บริการ:');
          
          doc.moveDown(0.5);

          // Table setup
          const tableTop = doc.y;
          const tableLeft = 50;
          const tableWidth = 490;
          const colPositions = [50, 100, 320, 380, 440, 520]; // x positions for columns
          const colWidths = [50, 220, 60, 60, 80]; // column widths
          const rowHeight = 20;
          let currentY = tableTop;

          // Table header background
          doc.rect(tableLeft, currentY, tableWidth, rowHeight)
             .fillAndStroke('#f0f0f0', '#000000');

          // Header row text
          doc.fillColor('#000000')
             .fontSize(10)
             .font(baseFont)
             .text('ลำดับ', colPositions[0] + 5, currentY + 5, { width: colWidths[0] - 10, align: 'center' })
             .text('รายละเอียด', colPositions[1] + 5, currentY + 5, { width: colWidths[1] - 10, align: 'left' })
             .text('จำนวน', colPositions[2] + 5, currentY + 5, { width: colWidths[2] - 10, align: 'center' })
             .text('ราคา/หน่วย', colPositions[3] + 5, currentY + 5, { width: colWidths[3] - 10, align: 'right' })
             .text('จำนวนเงิน', colPositions[4] + 5, currentY + 5, { width: colWidths[4] - 10, align: 'right' });
          
          currentY += rowHeight;

          // Items rows
          invoice.items.forEach((item, index) => {
            // Alternate row colors
            if (index % 2 === 1) {
              doc.rect(tableLeft, currentY, tableWidth, rowHeight)
                 .fillAndStroke('#f9f9f9', '#cccccc');
            } else {
              doc.rect(tableLeft, currentY, tableWidth, rowHeight)
                 .stroke('#cccccc');
            }

            // Row text
            doc.fillColor('#000000')
               .fontSize(9)
               .font(baseFont)
               .text((index + 1).toString(), colPositions[0] + 5, currentY + 5, { width: colWidths[0] - 10, align: 'center' })
               .text(item.description, colPositions[1] + 5, currentY + 2, { width: colWidths[1] - 10, height: rowHeight - 4 })
               .text(`${item.quantity} ${item.unit || 'ชิ้น'}`, colPositions[2] + 5, currentY + 5, { width: colWidths[2] - 10, align: 'center' })
               .text(item.unit_price.toLocaleString('th-TH', { minimumFractionDigits: 2 }), colPositions[3] + 5, currentY + 5, { width: colWidths[3] - 10, align: 'right' })
               .text(item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }), colPositions[4] + 5, currentY + 5, { width: colWidths[4] - 10, align: 'right' });
            
            currentY += rowHeight;
          });

          // Vertical lines for columns
          for (let i = 0; i < colPositions.length; i++) {
            doc.moveTo(colPositions[i], tableTop)
               .lineTo(colPositions[i], currentY)
               .stroke('#000000');
          }

          // Table border
          doc.rect(tableLeft, tableTop, tableWidth, currentY - tableTop).stroke('#000000');
          
          doc.y = currentY + 10;
        }

        // Totals
        doc.fontSize(12)
           .font(baseFont)
           .text(`จำนวนเงินรวม: ${invoice.subtotal.toLocaleString('th-TH')} บาท`, { align: 'right' });
        
        if (invoice.vat_amount > 0) {
          doc.fontSize(12)
             .font(baseFont)
             .text(`ภาษีมูลค่าเพิ่ม (${invoice.vat_rate}%): ${invoice.vat_amount.toLocaleString('th-TH')} บาท`, { align: 'right' });
        }
        
        if (invoice.wht_amount > 0) {
          doc.fontSize(12)
             .font(baseFont)
             .text(`หัก ณ ที่จ่าย (${invoice.wht_rate}%): ${invoice.wht_amount.toLocaleString('th-TH')} บาท`, { align: 'right' });
        }
        
        doc.fontSize(14)
           .font(baseFont)
           .text(`จำนวนเงินรวมทั้งสิ้น: ${invoice.grand_total.toLocaleString('th-TH')} บาท`, { align: 'right' });
        
        doc.moveDown(1);

        // Payment status
        const paymentStatusText = {
          'unpaid': 'ยังไม่ชำระ',
          'partial': 'ชำระบางส่วน',
          'paid': 'ชำระครบแล้ว',
          'overdue': 'เกินกำหนดชำระ'
        };
        
        doc.fontSize(12)
           .font(baseFont)
           .text(`สถานะการชำระเงิน: ${paymentStatusText[invoice.payment_status] || invoice.payment_status}`);
        
        if (invoice.paid_amount > 0) {
          doc.fontSize(12)
             .font(baseFont)
             .text(`จำนวนเงินที่รับแล้ว: ${invoice.paid_amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`);
        }
        
        doc.moveDown(1);

        // Note
        if (invoice.note) {
          doc.fontSize(10)
             .font(baseFont)
             .text(`หมายเหตุ: ${invoice.note}`);
          doc.moveDown(1);
        }

        // Footer
        doc.fontSize(10)
           .font(baseFont)
           .text('ขอบคุณที่ใช้บริการ', { align: 'center' });
        
        doc.fontSize(10)
           .font(baseFont)
           .text('Thank you for your business', { align: 'center' });

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          const url = `/uploads/receipts/${fileName}`;
          resolve({
            fileName,
            url,
            filePath: path.resolve(filePath)
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

  // Helper: get payment status text
  getPaymentStatusText(status) {
    const statusMap = {
      'unpaid': 'ยังไม่ชำระ',
      'partial': 'ชำระบางส่วน',
      'paid': 'ชำระแล้ว',
      'overdue': 'เกินกำหนด'
    };
    return statusMap[status] || status;
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
        const filePath = path.join(__dirname, '../../uploads/reports', fileName);
        
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