const cron = require('node-cron');
const { Expense, Category, User } = require('../models');
const emailService = require('./emailService');
const lineService = require('./lineService');

/**
 * Notification Service สำหรับระบบแจ้งเตือนอัตโนมัติ
 */
class NotificationService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * เริ่มต้นระบบแจ้งเตือน
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Notification service is already running');
      return;
    }

    // ตรวจสอบการแจ้งเตือนงบประมาณทุกวันเวลา 9:00 น.
    cron.schedule('0 9 * * *', async () => {
      console.log('🔔 Running daily budget alert check...');
      await this.checkBudgetAlerts();
    });

    // ส่งรายงานประจำเดือนทุกวันที่ 1 ของเดือนเวลา 8:00 น.
    cron.schedule('0 8 1 * *', async () => {
      console.log('📊 Running monthly report...');
      await this.sendMonthlyReports();
    });

    this.isRunning = true;
    console.log('✅ Notification service started');
  }

  /**
   * หยุดระบบแจ้งเตือน
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Notification service is not running');
      return;
    }

    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('🛑 Notification service stopped');
  }

  /**
   * ตรวจสอบการแจ้งเตือนงบประมาณ
   */
  async checkBudgetAlerts() {
    try {
      // ดึงผู้ใช้ทั้งหมด
      const users = await User.findAll({
        where: { is_active: true },
        attributes: ['id', 'first_name', 'last_name', 'email']
      });

      for (const user of users) {
        // ตรวจสอบรายจ่ายที่มี budget_limit
        const expenses = await Expense.findAll({
          where: {
            user_id: user.id,
            budget_limit: { [require('sequelize').Op.not]: null }
          },
          include: [{
            model: Category,
            as: 'category',
            attributes: ['name', 'color']
          }]
        });

        for (const expense of expenses) {
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          
          const monthlyTotal = await Expense.getMonthlyTotal(
            user.id,
            currentYear,
            currentMonth
          );

          if (monthlyTotal > expense.budget_limit) {
            // ส่งอีเมลแจ้งเตือน
            await emailService.sendBudgetExceededAlert({
              categoryName: expense.category.name,
              budgetLimit: expense.budget_limit,
              actualSpent: monthlyTotal,
              exceeded: monthlyTotal - expense.budget_limit
            });

            // ส่งการแจ้งเตือนผ่าน LINE
            if (lineService.isConfigured()) {
              await lineService.sendMessage(process.env.LINE_GROUP_ID, 
                `⚠️  การแจ้งเตือนงบประมาณเกิน
                
📂 หมวดหมู่: ${expense.category.name}
💰 งบประมาณ: ${expense.budget_limit.toLocaleString('th-TH')} บาท
💸 ใช้จ่ายจริง: ${monthlyTotal.toLocaleString('th-TH')} บาท
📈 เกินงบ: ${(monthlyTotal - expense.budget_limit).toLocaleString('th-TH')} บาท

กรุณาตรวจสอบและควบคุมค่าใช้จ่าย`);
            }

            console.log(`📧 Budget alert sent to ${user.email} for category: ${expense.category.name}`);
          }
        }
      }

      console.log('✅ Daily budget alert check completed');
    } catch (error) {
      console.error('❌ Error in budget alert check:', error);
    }
  }

  /**
   * ส่งรายงานประจำเดือน
   */
  async sendMonthlyReports() {
    try {
      const users = await User.findAll({
        where: { is_active: true },
        attributes: ['id', 'first_name', 'last_name', 'email']
      });

      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      for (const user of users) {
        // คำนวณรายรับรายเดือน
        const monthlyIncome = await require('../models').Income.getMonthlyTotal(
          user.id,
          year,
          month
        );

        // คำนวณรายจ่ายรายเดือน
        const monthlyExpense = await Expense.getMonthlyTotal(
          user.id,
          year,
          month
        );

        const netProfit = monthlyIncome - monthlyExpense;

        // ส่งรายงานประจำเดือน
        await emailService.sendMonthlyReport({
          month: month,
          year: year,
          totalIncome: monthlyIncome,
          totalExpense: monthlyExpense,
          netProfit: netProfit
        });

        console.log(`📊 Monthly report sent to ${user.email}`);
      }

      console.log('✅ Monthly reports sent');
    } catch (error) {
      console.error('❌ Error sending monthly reports:', error);
    }
  }

  /**
   * ทดสอบการส่งอีเมล
   */
  async testEmail() {
    try {
      const result = await emailService.testEmail();
      if (result) {
        console.log('✅ Test email sent successfully');
      } else {
        console.log('❌ Failed to send test email');
      }
    } catch (error) {
      console.error('❌ Error sending test email:', error);
    }
  }
}

module.exports = new NotificationService(); 