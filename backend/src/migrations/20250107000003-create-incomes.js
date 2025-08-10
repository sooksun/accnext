'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('incomes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      transaction_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      reference_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'bank_transfer', 'check', 'credit_card', 'other'),
        allowNull: false,
        defaultValue: 'cash'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      receipt_file: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.addIndex('incomes', ['user_id']);
    await queryInterface.addIndex('incomes', ['category_id']);
    await queryInterface.addIndex('incomes', ['transaction_date']);
    await queryInterface.addIndex('incomes', ['user_id', 'transaction_date']);
    await queryInterface.addIndex('incomes', ['amount']);
  },

  async down(queryInterface, Sequelize) {
    // ลบ foreign key constraint ก่อน
    try {
      await queryInterface.removeConstraint('wht_cert_received', 'wht_cert_received_ibfk_1');
    } catch (error) {
      // ถ้า constraint ไม่มีอยู่แล้ว ให้ข้ามไป
    }
    await queryInterface.dropTable('incomes');
  }
};