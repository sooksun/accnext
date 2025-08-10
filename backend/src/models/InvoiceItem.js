const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvoiceItem = sequelize.define('InvoiceItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'รหัสใบกำกับภาษี (อ้างอิงจาก invoices table)'
    },
    item_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ลำดับรายการ'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'รายละเอียดสินค้า/บริการ'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00,
      comment: 'จำนวน'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'ชิ้น',
      comment: 'หน่วย'
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'ราคาต่อหน่วย'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'จำนวนเงิน (quantity * unit_price)'
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
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'จำนวนเงินรวมทั้งสิ้น (amount + vat_amount - wht_amount)'
    }
  }, {
    tableName: 'invoice_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'ตารางรายการในใบกำกับภาษี'
  });

  // Define associations
  InvoiceItem.associate = (models) => {
    // InvoiceItem belongs to Invoice
    InvoiceItem.belongsTo(models.Invoice, {
      foreignKey: 'invoice_id',
      as: 'invoice'
    });
  };

  return InvoiceItem;
}; 