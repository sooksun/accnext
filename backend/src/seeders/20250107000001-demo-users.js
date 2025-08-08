'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // เข้ารหัสรหัสผ่าน
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@solutionnextgen.com',
        password: hashedPassword,
        first_name: 'ผู้ดูแล',
        last_name: 'ระบบ',
        role: 'admin',
        is_active: true,
        phone: '02-123-4567',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'accountant',
        email: 'accountant@solutionnextgen.com',
        password: hashedPassword,
        first_name: 'นักบัญชี',
        last_name: 'หลัก',
        role: 'accountant',
        is_active: true,
        phone: '02-765-4321',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'viewer',
        email: 'viewer@solutionnextgen.com',
        password: hashedPassword,
        first_name: 'ผู้ชม',
        last_name: 'ข้อมูล',
        role: 'viewer',
        is_active: true,
        phone: '02-555-0123',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};