const nodemailer = require('nodemailer');

/**
 * Email Service สำหรับส่งการแจ้งเตือน
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * สร้าง transporter สำหรับส่งอีเมล
   */
  initializeTransporter() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.warn('⚠️  Email configuration not found. Email features will be disabled.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      console.log('✅ Email transporter initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
    }
  }

  /**
   * ส่งอีเมลแจ้งเตือนเมื่อรายจ่ายเกินงบ
   * @param {Object} alertData - ข้อมูลการแจ้งเตือน
   */
  async sendBudgetExceededAlert(alertData) {
    if (!this.transporter) {
      console.warn('Email transporter not available');
      return false;
    }

    try {
      const { categoryName, budgetLimit, actualSpent, exceeded } = alertData;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL || 'sooksun2511@gmail.com',
        subject: '⚠️ แจ้งเตือน: รายจ่ายเกินงบประมาณ - Solution NextGen',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0; color: #721c24;">⚠️ แจ้งเตือนรายจ่ายเกินงบประมาณ</h2>
              
              <p><strong>หมวดหมู่:</strong> ${categoryName}</p>
              <p><strong>งบประมาณที่กำหนด:</strong> ${this.formatCurrency(budgetLimit)}</p>
              <p><strong>ยอดที่ใช้จ่ายจริง:</strong> ${this.formatCurrency(actualSpent)}</p>
              <p><strong>เกินงบประมาณ:</strong> <span style="color: #dc3545; font-weight: bold;">${this.formatCurrency(exceeded)}</span></p>
              
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #f5c6cb;">
              
              <p style="font-size: 14px; color: #6c757d;">
                กรุณาตรวจสอบและควบคุมการใช้จ่ายในหมวดหมู่นี้
              </p>
              
              <p style="font-size: 12px; color: #6c757d; margin-top: 30px;">
                อีเมลนี้ส่งโดยอัตโนมัติจากระบบ AccNext - Solution NextGen<br>
                วันที่: ${new Date().toLocaleString('th-TH')}
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Budget exceeded alert email sent successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to send budget exceeded alert email:', error);
      return false;
    }
  }

  /**
   * ส่งอีเมลสรุปรายงานประจำเดือน
   * @param {Object} reportData - ข้อมูลรายงาน
   */
  async sendMonthlyReport(reportData) {
    if (!this.transporter) {
      console.warn('Email transporter not available');
      return false;
    }

    try {
      const { month, year, totalIncome, totalExpense, netProfit } = reportData;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL || 'sooksun2511@gmail.com',
        subject: `📊 รายงานการเงินประจำเดือน ${month}/${year} - Solution NextGen`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #e7f3ff; border: 1px solid #b8daff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0 0 20px 0; color: #004085;">📊 รายงานการเงินประจำเดือน</h2>
              
              <p><strong>ประจำเดือน:</strong> ${month}/${year}</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">รายการ</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; text-align: right;">จำนวนเงิน</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #dee2e6;">รายรับรวม</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right; color: #28a745; font-weight: bold;">
                    ${this.formatCurrency(totalIncome)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #dee2e6;">รายจ่ายรวม</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right; color: #dc3545; font-weight: bold;">
                    ${this.formatCurrency(totalExpense)}
                  </td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">กำไรสุทธิ</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right; font-weight: bold; color: ${netProfit >= 0 ? '#28a745' : '#dc3545'};">
                    ${this.formatCurrency(netProfit)}
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 12px; color: #6c757d; margin-top: 30px;">
                รายงานนี้ส่งโดยอัตโนมัติจากระบบ AccNext - Solution NextGen<br>
                วันที่: ${new Date().toLocaleString('th-TH')}
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Monthly report email sent successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to send monthly report email:', error);
      return false;
    }
  }

  /**
   * จัดรูปแบบเงิน
   * @param {number} amount - จำนวนเงิน
   * @returns {string} จำนวนเงินที่จัดรูปแบบแล้ว
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  }

  /**
   * ทดสอบการส่งอีเมล
   */
  async testEmail() {
    if (!this.transporter) {
      console.warn('Email transporter not available');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL || 'sooksun2511@gmail.com',
        subject: '✅ ทดสอบระบบอีเมล - AccNext',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0;">✅ ทดสอบระบบอีเมล</h2>
              <p>ระบบส่งอีเมลของ AccNext ทำงานได้ปกติ</p>
              <p style="font-size: 12px; color: #6c757d; margin-top: 20px;">
                วันที่: ${new Date().toLocaleString('th-TH')}
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();