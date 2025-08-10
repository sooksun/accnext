'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('parties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      party_type: {
        type: Sequelize.ENUM('customer', 'vendor', 'both'),
        allowNull: false,
        comment: 'ประเภท: ลูกค้า, ผู้ขาย, หรือทั้งสอง'
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'รหัสลูกค้า/ผู้ขาย'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'ชื่อบริษัท/บุคคล'
      },
      name_en: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'ชื่อภาษาอังกฤษ'
      },
      tax_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'เลขประจำตัวผู้เสียภาษี'
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'ที่อยู่'
      },
      address_en: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'ที่อยู่ภาษาอังกฤษ'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'เบอร์โทรศัพท์'
      },
      fax: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'เบอร์แฟกซ์'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'อีเมล'
      },
      website: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'เว็บไซต์'
      },
      contact_person: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'ชื่อผู้ติดต่อ'
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'เบอร์โทรผู้ติดต่อ'
      },
      contact_email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'อีเมลผู้ติดต่อ'
      },
      credit_limit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'วงเงินเครดิต'
      },
      payment_terms: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'เงื่อนไขการชำระเงิน'
      },
      vat_type: {
        type: Sequelize.ENUM('registered', 'unregistered', 'exempt'),
        allowNull: false,
        defaultValue: 'registered',
        comment: 'ประเภทผู้เสียภาษี: ขึ้นทะเบียน, ไม่ขึ้นทะเบียน, ได้รับการยกเว้น'
      },
      vat_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 7.00,
        comment: 'อัตราภาษีมูลค่าเพิ่ม (%)'
      },
      wht_type: {
        type: Sequelize.ENUM('company', 'individual', 'exempt'),
        allowNull: false,
        defaultValue: 'company',
        comment: 'ประเภทหัก ณ ที่จ่าย: บริษัท, บุคคลธรรมดา, ได้รับการยกเว้น'
      },
      wht_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 3.00,
        comment: 'อัตราหัก ณ ที่จ่าย (%)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'สถานะการใช้งาน'
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'หมายเหตุ'
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
    await queryInterface.addIndex('parties', ['party_type']);
    await queryInterface.addIndex('parties', ['code']);
    await queryInterface.addIndex('parties', ['name']);
    await queryInterface.addIndex('parties', ['tax_id']);
    await queryInterface.addIndex('parties', ['is_active']);
    await queryInterface.addIndex('parties', ['party_type', 'is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('parties');
  }
}; 