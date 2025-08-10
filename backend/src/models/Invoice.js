const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    doc_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'เลขที่เอกสาร (INV-001, INV-002, ...)'
    },
    doc_type: {
      type: DataTypes.ENUM('invoice', 'receipt', 'credit_note'),
      allowNull: false,
      defaultValue: 'invoice',
      comment: 'ประเภทเอกสาร'
    },
    doc_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'วันที่ออกเอกสาร'
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'วันครบกำหนดชำระ'
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'รหัสลูกค้า (อ้างอิงจาก parties table)'
    },
    customer_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'ชื่อลูกค้า'
    },
    customer_tax_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'เลขประจำตัวผู้เสียภาษีของลูกค้า'
    },
    customer_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'ที่อยู่ลูกค้า'
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'เบอร์โทรลูกค้า'
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'จำนวนเงินรวม (ไม่รวมภาษี)'
    },
    vat_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 7.00,
      comment: 'อัตราภาษีมูลค่าเพิ่ม (%)'
    },
    vat_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'จำนวนภาษีมูลค่าเพิ่ม'
    },
    wht_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'อัตราหัก ณ ที่จ่าย (%)'
    },
    wht_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'จำนวนหัก ณ ที่จ่าย'
    },
    grand_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'จำนวนเงินรวมทั้งสิ้น'
    },
    paid_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'จำนวนเงินที่รับแล้ว'
    },
    status: {
      type: DataTypes.ENUM('draft', 'issued', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
      comment: 'สถานะเอกสาร'
    },
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'overdue'),
      allowNull: false,
      defaultValue: 'unpaid',
      comment: 'สถานะการชำระเงิน'
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'หมายเหตุ'
    },
    issued_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'รหัสผู้ออกเอกสาร (อ้างอิงจาก users table)'
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'วันที่ออกเอกสาร'
    }
  }, {
    tableName: 'invoices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'ตารางใบกำกับภาษี'
  });

  // Define associations
  Invoice.associate = (models) => {
    // Invoice belongs to User (issued_by)
    Invoice.belongsTo(models.User, {
      foreignKey: 'issued_by',
      as: 'issuer'
    });

    // Invoice has many InvoiceItems
    Invoice.hasMany(models.InvoiceItem, {
      foreignKey: 'invoice_id',
      as: 'items'
    });
  };

  return Invoice;
}; 