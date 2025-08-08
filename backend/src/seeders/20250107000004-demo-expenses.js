'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('expenses', [
      {
        amount: 35000.00,
        description: 'ค่าเช่าสำนักงานประจำเดือนธันวาคม',
        transaction_date: '2024-12-01',
        reference_number: 'RENT-2024-12',
        payment_method: 'bank_transfer',
        vendor: 'บริษัท อาคารสำนักงาน จำกัด',
        notes: 'โอนชำระผ่านธนาคารกสิกรไทย',
        is_recurring: true,
        recurring_period: 'monthly',
        budget_limit: 40000.00,
        user_id: 1,
        category_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        amount: 85000.00,
        description: 'เงินเดือนพนักงานประจำเดือนธันวาคม',
        transaction_date: '2024-12-05',
        reference_number: 'SAL-2024-12',
        payment_method: 'bank_transfer',
        vendor: 'พนักงานบริษัท',
        notes: 'โอนเงินเดือนให้พนักงาน 3 คน',
        is_recurring: true,
        recurring_period: 'monthly',
        budget_limit: 90000.00,
        user_id: 1,
        category_id: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        amount: 4500.00,
        description: 'ค่าไฟฟ้าประจำเดือนพฤศจิกายน',
        transaction_date: '2024-12-08',
        reference_number: 'ELEC-2024-11',
        payment_method: 'cash',
        vendor: 'การไฟฟ้านครหลวง',
        notes: 'ชำระที่เคาน์เตอร์ 7-Eleven',
        is_recurring: true,
        recurring_period: 'monthly',
        budget_limit: 6000.00,
        user_id: 2,
        category_id: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        amount: 1200.00,
        description: 'ค่าน้ำประปาประจำเดือนพฤศจิกายน',
        transaction_date: '2024-12-10',
        reference_number: 'WATER-2024-11',
        payment_method: 'cash',
        vendor: 'การประปานครหลวง',
        notes: 'ชำระที่เคาน์เตอร์ธนาคาร',
        is_recurring: true,
        recurring_period: 'monthly',
        budget_limit: 2000.00,
        user_id: 2,
        category_id: 7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        amount: 3200.00,
        description: 'ซื้อวัสดุสำนักงาน กระดาษ หมึกปริ้นเตอร์',
        transaction_date: '2024-12-12',
        reference_number: 'OFF-2024-12-001',
        payment_method: 'credit_card',
        vendor: 'Office Mate',
        notes: 'ซื้อที่ร้าน Office Mate สาขาเซ็นทรัลพลาซา',
        is_recurring: false,
        budget_limit: 5000.00,
        user_id: 2,
        category_id: 8,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('expenses', null, {});
  }
};