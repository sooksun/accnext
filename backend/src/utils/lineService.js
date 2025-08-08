const axios = require('axios');

/**
 * LINE OA Service สำหรับการส่งข้อความแจ้งเตือน
 */
class LineService {
  constructor() {
    this.channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    this.channelSecret = process.env.LINE_CHANNEL_SECRET;
    this.baseURL = 'https://api.line.me/v2';
  }

  /**
   * ตรวจสอบการตั้งค่า LINE
   */
  isConfigured() {
    return this.channelAccessToken && this.channelSecret;
  }

  /**
   * ส่งข้อความไปยัง LINE Group หรือ User
   */
  async sendMessage(to, message) {
    if (!this.isConfigured()) {
      console.log('⚠️  LINE service not configured');
      return false;
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/bot/message/push`,
        {
          to: to,
          messages: [
            {
              type: 'text',
              text: message
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.channelAccessToken}`
          }
        }
      );

      console.log('✅ LINE message sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending LINE message:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * ส่งการแจ้งเตือนรายจ่ายเกิน 5,000 บาท
   */
  async sendExpenseAlert(expense, category) {
    const message = `💰 การแจ้งเตือนรายจ่าย

📝 รายละเอียด: ${expense.description}
💵 จำนวนเงิน: ${expense.amount.toLocaleString('th-TH')} บาท
📂 หมวดหมู่: ${category.name}
📅 วันที่: ${new Date(expense.transaction_date).toLocaleDateString('th-TH')}
🏢 ผู้ขาย: ${expense.vendor || 'ไม่ระบุ'}

⚠️  จำนวนเงินเกิน 5,000 บาท กรุณาตรวจสอบ`;

    return await this.sendMessage(process.env.LINE_GROUP_ID, message);
  }

  /**
   * ส่งรายงานประจำวัน
   */
  async sendDailyReport(summary) {
    const message = `📊 รายงานประจำวัน

📈 รายรับวันนี้: ${summary.todayIncome.toLocaleString('th-TH')} บาท
📉 รายจ่ายวันนี้: ${summary.todayExpense.toLocaleString('th-TH')} บาท
💰 ยอดคงเหลือ: ${(summary.todayIncome - summary.todayExpense).toLocaleString('th-TH')} บาท

📅 วันที่: ${new Date().toLocaleDateString('th-TH')}`;

    return await this.sendMessage(process.env.LINE_GROUP_ID, message);
  }

  /**
   * ส่งรายงานประจำเดือน
   */
  async sendMonthlyReport(summary) {
    const message = `📈 รายงานประจำเดือน

💰 รายรับรวม: ${summary.totalIncome.toLocaleString('th-TH')} บาท
💸 รายจ่ายรวม: ${summary.totalExpense.toLocaleString('th-TH')} บาท
📊 ยอดคงเหลือ: ${(summary.totalIncome - summary.totalExpense).toLocaleString('th-TH')} บาท

📅 เดือน: ${new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`;

    return await this.sendMessage(process.env.LINE_GROUP_ID, message);
  }

  /**
   * ตรวจสอบสถานะ LINE Bot
   */
  async checkStatus() {
    if (!this.isConfigured()) {
      return { status: 'not_configured', message: 'LINE service not configured' };
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/bot/profile`,
        {
          headers: {
            'Authorization': `Bearer ${this.channelAccessToken}`
          }
        }
      );

      return { 
        status: 'active', 
        message: 'LINE service is working',
        profile: response.data 
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * รับ Webhook จาก LINE
   */
  handleWebhook(body, signature) {
    // ตรวจสอบ signature
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('SHA256', this.channelSecret)
      .update(JSON.stringify(body))
      .digest('base64');

    if (hash !== signature) {
      throw new Error('Invalid signature');
    }

    // ประมวลผล events
    const events = body.events || [];
    
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        this.handleTextMessage(event);
      }
    }

    return { status: 'ok' };
  }

  /**
   * จัดการข้อความที่ได้รับจาก LINE
   */
  async handleTextMessage(event) {
    const message = event.message.text.toLowerCase();
    const userId = event.source.userId;

    let response = '';

    switch (message) {
      case 'รายงานวันนี้':
        response = '📊 กำลังดึงรายงานประจำวัน...';
        break;
      case 'รายงานเดือนนี้':
        response = '📈 กำลังดึงรายงานประจำเดือน...';
        break;
      case 'ช่วยเหลือ':
        response = `🤖 คำสั่งที่ใช้งานได้:
        
📊 รายงานวันนี้ - ดูรายงานประจำวัน
📈 รายงานเดือนนี้ - ดูรายงานประจำเดือน
❓ ช่วยเหลือ - แสดงคำสั่งทั้งหมด`;
        break;
      default:
        response = '❓ พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งที่ใช้งานได้';
    }

    // ส่งข้อความตอบกลับ
    await this.sendMessage(userId, response);
  }
}

module.exports = new LineService(); 