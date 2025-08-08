'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('incomes', [
      {
        amount: 125000.00,
        description: 'ขายสินค้าลูกค้า ABC Company',
        transaction_date: '2024-12-01',
        reference_number: 'INV-2024-001',
        payment_method: 'bank_transfer',
        notes: 'ชำระเงินผ่านโอนธนาคาร กสิกรไทย',
        user_id: 1,
        category_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        amount: 85000.00,
        description: 'รายได้จากบริการให้คำปรึกษา',
        transaction_date: '2024-12-05',
        reference_number: 'INV-2024-002',
        payment_method: 'cash',
        notes: 'รับชำระเงินสดจากลูกค้า',
        user_id: 1,
        category_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        amount: 3500.00,
        description: 'ดอกเบี้ยจากเงินฝากธนาคาร',
        transaction_date: '2024-12-10',
        reference_number: 'INT-2024-001',
        payment_method: 'bank_transfer',
        notes: 'ดอกเบี้ยประจำเดือน ธนาคารกรุงเทพ',
        user_id: 1,
        category_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        amount: 95000.00,
        description: 'ขายสินค้าลูกค้า XYZ Corporation',
        transaction_date: '2024-12-15',
        reference_number: 'INV-2024-003',
        payment_method: 'check',
        notes: 'รับชำระด้วยเช็คธนาคาร',
        user_id: 2,
        category_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        amount: 12000.00,
        description: 'รายได้จากการเช่าพื้นที่',
        transaction_date: '2024-12-20',
        reference_number: 'RENT-2024-001',
        payment_method: 'bank_transfer',
        notes: 'รายได้จากการให้เช่าพื้นที่ส่วนหนึ่งของสำนักงาน',
        user_id: 2,
        category_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('incomes', null, {});
  }
};