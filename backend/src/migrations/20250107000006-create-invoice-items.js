'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoice_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'รหัสใบกำกับภาษี (อ้างอิงจาก invoices table)'
      },
      item_no: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ลำดับรายการ'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'รายละเอียดสินค้า/บริการ'
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.00,
        comment: 'จำนวน'
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'ชิ้น',
        comment: 'หน่วย'
      },
      unit_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'ราคาต่อหน่วย'
      },
      discount_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'อัตราส่วนลด (%)'
      },
      discount_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'จำนวนส่วนลด'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'จำนวนเงิน (หลังหักส่วนลด)'
      },
      vat_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 7.00,
        comment: 'อัตราภาษีมูลค่าเพิ่ม (%)'
      },
      vat_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'จำนวนภาษีมูลค่าเพิ่ม'
      },
      wht_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'อัตราหัก ณ ที่จ่าย (%)'
      },
      wht_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'จำนวนหัก ณ ที่จ่าย'
      },
      total_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'จำนวนเงินรวมทั้งสิ้น'
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'หมายเหตุรายการ'
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
    await queryInterface.addIndex('invoice_items', ['invoice_id']);
    await queryInterface.addIndex('invoice_items', ['item_no']);
    await queryInterface.addIndex('invoice_items', ['invoice_id', 'item_no']);

    // เพิ่ม foreign key constraint
    await queryInterface.addConstraint('invoice_items', {
      fields: ['invoice_id'],
      type: 'foreign key',
      name: 'fk_invoice_items_invoice_id',
      references: {
        table: 'invoices',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('invoice_items', 'fk_invoice_items_invoice_id');
    await queryInterface.dropTable('invoice_items');
  }
}; 