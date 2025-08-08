const axios = require('axios');

/**
 * RD Prep API Service สำหรับการส่งข้อมูลไปยังกรมสรรพากร
 */
class RdPrepService {
  constructor() {
    this.apiUrl = process.env.RD_PREP_API_URL;
    this.apiKey = process.env.RD_PREP_API_KEY;
    this.companyId = process.env.RD_PREP_COMPANY_ID;
  }

  /**
   * ตรวจสอบการตั้งค่า RD Prep API
   */
  isConfigured() {
    return this.apiUrl && this.apiKey && this.companyId;
  }

  /**
   * ส่งข้อมูลรายรับไปยัง RD Prep
   */
  async sendIncomeData(income, category) {
    if (!this.isConfigured()) {
      console.log('⚠️  RD Prep API not configured');
      return false;
    }

    try {
      const payload = {
        company_id: this.companyId,
        transaction_type: 'income',
        transaction_date: income.transaction_date,
        amount: income.amount,
        description: income.description,
        category: category.name,
        reference_number: income.reference_number,
        payment_method: income.payment_method,
        notes: income.notes,
        receipt_file: income.receipt_file,
        created_at: income.created_at,
        updated_at: income.updated_at
      };

      const response = await axios.post(
        `${this.apiUrl}/income`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0'
          }
        }
      );

      console.log('✅ Income data sent to RD Prep successfully');
      return {
        success: true,
        rd_prep_id: response.data.id,
        message: 'ข้อมูลรายรับถูกส่งไปยัง RD Prep แล้ว'
      };
    } catch (error) {
      console.error('❌ Error sending income data to RD Prep:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * ส่งข้อมูลรายจ่ายไปยัง RD Prep
   */
  async sendExpenseData(expense, category) {
    if (!this.isConfigured()) {
      console.log('⚠️  RD Prep API not configured');
      return false;
    }

    try {
      const payload = {
        company_id: this.companyId,
        transaction_type: 'expense',
        transaction_date: expense.transaction_date,
        amount: expense.amount,
        description: expense.description,
        category: category.name,
        reference_number: expense.reference_number,
        payment_method: expense.payment_method,
        vendor: expense.vendor,
        notes: expense.notes,
        receipt_file: expense.receipt_file,
        is_recurring: expense.is_recurring,
        recurring_period: expense.recurring_period,
        budget_limit: expense.budget_limit,
        created_at: expense.created_at,
        updated_at: expense.updated_at
      };

      const response = await axios.post(
        `${this.apiUrl}/expense`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0'
          }
        }
      );

      console.log('✅ Expense data sent to RD Prep successfully');
      return {
        success: true,
        rd_prep_id: response.data.id,
        message: 'ข้อมูลรายจ่ายถูกส่งไปยัง RD Prep แล้ว'
      };
    } catch (error) {
      console.error('❌ Error sending expense data to RD Prep:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * ส่งรายงานประจำเดือนไปยัง RD Prep
   */
  async sendMonthlyReport(reportData) {
    if (!this.isConfigured()) {
      console.log('⚠️  RD Prep API not configured');
      return false;
    }

    try {
      const payload = {
        company_id: this.companyId,
        report_type: 'monthly',
        report_period: {
          year: reportData.year,
          month: reportData.month
        },
        summary: {
          total_income: reportData.totalIncome,
          total_expense: reportData.totalExpense,
          net_amount: reportData.totalIncome - reportData.totalExpense
        },
        income_details: reportData.incomeDetails,
        expense_details: reportData.expenseDetails,
        category_summary: reportData.categorySummary,
        generated_at: new Date().toISOString()
      };

      const response = await axios.post(
        `${this.apiUrl}/reports/monthly`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0'
          }
        }
      );

      console.log('✅ Monthly report sent to RD Prep successfully');
      return {
        success: true,
        rd_prep_report_id: response.data.id,
        message: 'รายงานประจำเดือนถูกส่งไปยัง RD Prep แล้ว'
      };
    } catch (error) {
      console.error('❌ Error sending monthly report to RD Prep:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * ส่งรายงานประจำปีไปยัง RD Prep
   */
  async sendYearlyReport(reportData) {
    if (!this.isConfigured()) {
      console.log('⚠️  RD Prep API not configured');
      return false;
    }

    try {
      const payload = {
        company_id: this.companyId,
        report_type: 'yearly',
        report_period: {
          year: reportData.year
        },
        summary: {
          total_income: reportData.totalIncome,
          total_expense: reportData.totalExpense,
          net_amount: reportData.totalIncome - reportData.totalExpense
        },
        monthly_breakdown: reportData.monthlyBreakdown,
        category_summary: reportData.categorySummary,
        tax_summary: reportData.taxSummary,
        generated_at: new Date().toISOString()
      };

      const response = await axios.post(
        `${this.apiUrl}/reports/yearly`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0'
          }
        }
      );

      console.log('✅ Yearly report sent to RD Prep successfully');
      return {
        success: true,
        rd_prep_report_id: response.data.id,
        message: 'รายงานประจำปีถูกส่งไปยัง RD Prep แล้ว'
      };
    } catch (error) {
      console.error('❌ Error sending yearly report to RD Prep:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ RD Prep API
   */
  async checkStatus() {
    if (!this.isConfigured()) {
      return { status: 'not_configured', message: 'RD Prep API not configured' };
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0'
          }
        }
      );

      return { 
        status: 'active', 
        message: 'RD Prep API is working',
        details: response.data 
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * ดึงข้อมูลจาก RD Prep API
   */
  async fetchData(dataType, filters = {}) {
    if (!this.isConfigured()) {
      throw new Error('RD Prep API not configured');
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/${dataType}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0'
          },
          params: {
            company_id: this.companyId,
            ...filters
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${dataType} from RD Prep:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * ตั้งเวลาส่งข้อมูลไปยัง RD Prep
   */
  scheduleDataSync(schedule = 'daily') {
    const cron = require('node-cron');
    
    switch (schedule) {
      case 'daily':
        // ส่งข้อมูลทุกวันเวลา 23:00 น.
        cron.schedule('0 23 * * *', async () => {
          console.log('🔄 Starting daily RD Prep data sync...');
          await this.syncDailyData();
        });
        break;
      
      case 'weekly':
        // ส่งข้อมูลทุกวันอาทิตย์เวลา 22:00 น.
        cron.schedule('0 22 * * 0', async () => {
          console.log('🔄 Starting weekly RD Prep data sync...');
          await this.syncWeeklyData();
        });
        break;
      
      case 'monthly':
        // ส่งข้อมูลทุกวันที่ 1 ของเดือนเวลา 21:00 น.
        cron.schedule('0 21 1 * *', async () => {
          console.log('🔄 Starting monthly RD Prep data sync...');
          await this.syncMonthlyData();
        });
        break;
    }
  }

  /**
   * ซิงค์ข้อมูลรายวัน
   */
  async syncDailyData() {
    // ดึงข้อมูลรายรับ-รายจ่ายของวันนี้
    const today = new Date().toISOString().split('T')[0];
    
    // ส่งข้อมูลไปยัง RD Prep
    console.log('📤 Syncing daily data to RD Prep...');
    // Implementation here
  }

  /**
   * ซิงค์ข้อมูลรายสัปดาห์
   */
  async syncWeeklyData() {
    console.log('📤 Syncing weekly data to RD Prep...');
    // Implementation here
  }

  /**
   * ซิงค์ข้อมูลรายเดือน
   */
  async syncMonthlyData() {
    console.log('📤 Syncing monthly data to RD Prep...');
    // Implementation here
  }
}

module.exports = new RdPrepService(); 