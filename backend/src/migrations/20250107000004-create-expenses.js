'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
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
      vendor: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      receipt_file: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      recurring_period: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'yearly'),
        allowNull: true
      },
      budget_limit: {
        type: Sequelize.DECIMAL(15, 2),
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
    await queryInterface.addIndex('expenses', ['user_id']);
    await queryInterface.addIndex('expenses', ['category_id']);
    await queryInterface.addIndex('expenses', ['transaction_date']);
    await queryInterface.addIndex('expenses', ['user_id', 'transaction_date']);
    await queryInterface.addIndex('expenses', ['amount']);
    await queryInterface.addIndex('expenses', ['is_recurring']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('expenses');
  }
};