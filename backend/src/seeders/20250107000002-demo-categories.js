'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      // หมวดหมู่รายรับ
      {
        name: 'รายได้จากการขาย',
        type: 'income',
        description: 'รายได้หลักจากการขายสินค้าและบริการ',
        color: '#10B981',
        icon: 'cash',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'ดอกเบี้ยรับ',
        type: 'income',
        description: 'ดอกเบี้ยจากเงินฝากและการลงทุน',
        color: '#3B82F6',
        icon: 'percentage',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'รายได้อื่นๆ',
        type: 'income',
        description: 'รายได้เบ็ดเตล็ด',
        color: '#8B5CF6',
        icon: 'plus',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // หมวดหมู่รายจ่าย
      {
        name: 'ค่าเช่า',
        type: 'expense',
        description: 'ค่าเช่าสำนักงานและพื้นที่ต่างๆ',
        color: '#EF4444',
        icon: 'home',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'เงินเดือนพนักงาน',
        type: 'expense',
        description: 'เงินเดือนและค่าแรงพนักงาน',
        color: '#F59E0B',
        icon: 'users',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'ค่าไฟฟ้า',
        type: 'expense',
        description: 'ค่าไฟฟ้าสำนักงาน',
        color: '#F97316',
        icon: 'lightning-bolt',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'ค่าน้ำประปา',
        type: 'expense',
        description: 'ค่าน้ำประปาสำนักงาน',
        color: '#06B6D4',
        icon: 'droplet',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'วัสดุสำนักงาน',
        type: 'expense',
        description: 'อุปกรณ์และวัสดุสำนักงาน',
        color: '#84CC16',
        icon: 'clipboard',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'ค่าโทรศัพท์และอินเทอร์เน็ต',
        type: 'expense',
        description: 'ค่าสื่อสารและอินเทอร์เน็ต',
        color: '#6366F1',
        icon: 'phone',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'ค่าเดินทาง',
        type: 'expense',
        description: 'ค่าเดินทางและค่าขนส่ง',
        color: '#EC4899',
        icon: 'truck',
        is_default: true,
        is_active: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};