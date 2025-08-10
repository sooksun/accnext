'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      doc_no: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'เลขที่เอกสาร (INV-001, INV-002, ...)'
      },
      doc_type: {
        type: Sequelize.ENUM('invoice', 'receipt', 'credit_note'),
        allowNull: false,
        defaultValue: 'invoice',
        comment: 'ประเภทเอกสาร'
      },
      doc_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'วันที่ออกเอกสาร'
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'วันครบกำหนดชำระ'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'รหัสลูกค้า (อ้างอิงจาก parties table)'
      },
      customer_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'ชื่อลูกค้า'
      },
      customer_tax_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'เลขประจำตัวผู้เสียภาษีของลูกค้า'
      },
      customer_address: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'ที่อยู่ลูกค้า'
      },
      customer_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'เบอร์โทรลูกค้า'
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'จำนวนเงินรวม (ไม่รวมภาษี)'
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
      grand_total: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'จำนวนเงินรวมทั้งสิ้น'
      },
      paid_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'จำนวนเงินที่รับแล้ว'
      },
      status: {
        type: Sequelize.ENUM('draft', 'issued', 'paid', 'overdue', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
        comment: 'สถานะเอกสาร'
      },
      payment_status: {
        type: Sequelize.ENUM('unpaid', 'partial', 'paid'),
        allowNull: false,
        defaultValue: 'unpaid',
        comment: 'สถานะการชำระเงิน'
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'วิธีการชำระเงิน'
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'วันที่ชำระเงิน'
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'หมายเหตุ'
      },
      terms_conditions: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'เงื่อนไขการชำระเงิน'
      },
      issued_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'รหัสผู้ออกเอกสาร (อ้างอิงจาก users table)'
      },
      issued_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'วันที่ออกเอกสารจริง'
      },
      cancelled_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'รหัสผู้ยกเลิกเอกสาร (อ้างอิงจาก users table)'
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'วันที่ยกเลิกเอกสาร'
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'เหตุผลในการยกเลิก'
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

    // เพิ่ม indexes (ลดลงเพื่อหลีกเลี่ยง error "Too many keys")
    await queryInterface.addIndex('invoices', ['doc_no']);
    await queryInterface.addIndex('invoices', ['doc_date']);
    await queryInterface.addIndex('invoices', ['customer_id']);
    await queryInterface.addIndex('invoices', ['status']);
    await queryInterface.addIndex('invoices', ['payment_status']);
    // ลบ indexes ที่ไม่จำเป็นออก
    // await queryInterface.addIndex('invoices', ['issued_by']);
    // await queryInterface.addIndex('invoices', ['created_at']);
    // await queryInterface.addIndex('invoices', ['doc_type', 'status']);
    // await queryInterface.addIndex('invoices', ['customer_id', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoices');
  }
}; 