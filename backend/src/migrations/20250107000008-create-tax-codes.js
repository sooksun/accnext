'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tax_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
        comment: 'รหัสภาษี (เช่น V7, V0, W3, W5)'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'ชื่อรหัสภาษี'
      },
      name_en: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'ชื่อรหัสภาษีภาษาอังกฤษ'
      },
      tax_type: {
        type: Sequelize.ENUM('vat', 'wht'),
        allowNull: false,
        comment: 'ประเภทภาษี: VAT หรือ WHT'
      },
      rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'อัตราภาษี (%)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'รายละเอียดเพิ่มเติม'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'สถานะการใช้งาน'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'ลำดับการแสดงผล'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // เพิ่ม indexes
    await queryInterface.addIndex('tax_codes', ['code']);
    await queryInterface.addIndex('tax_codes', ['tax_type']);
    await queryInterface.addIndex('tax_codes', ['is_active']);
    await queryInterface.addIndex('tax_codes', ['sort_order']);
    await queryInterface.addIndex('tax_codes', ['tax_type', 'is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tax_codes');
  }
}; 