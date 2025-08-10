'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tax_codes', [
      // VAT Codes
      {
        code: 'V7',
        name: 'ภาษีมูลค่าเพิ่ม 7%',
        name_en: 'VAT 7%',
        tax_type: 'vat',
        rate: 7.00,
        description: 'ภาษีมูลค่าเพิ่มตามมาตรา 86/6 แห่งประมวลรัษฎากร',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'V0',
        name: 'ภาษีมูลค่าเพิ่ม 0%',
        name_en: 'VAT 0%',
        tax_type: 'vat',
        rate: 0.00,
        description: 'ภาษีมูลค่าเพิ่ม 0% สำหรับสินค้าส่งออก',
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'VE',
        name: 'ได้รับการยกเว้นภาษีมูลค่าเพิ่ม',
        name_en: 'VAT Exempt',
        tax_type: 'vat',
        rate: 0.00,
        description: 'สินค้าหรือบริการที่ได้รับการยกเว้นภาษีมูลค่าเพิ่ม',
        is_active: true,
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // WHT Codes
      {
        code: 'W3',
        name: 'หัก ณ ที่จ่าย 3%',
        name_en: 'WHT 3%',
        tax_type: 'wht',
        rate: 3.00,
        description: 'หัก ณ ที่จ่ายสำหรับบริการทั่วไป (บริษัท)',
        is_active: true,
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'W5',
        name: 'หัก ณ ที่จ่าย 5%',
        name_en: 'WHT 5%',
        tax_type: 'wht',
        rate: 5.00,
        description: 'หัก ณ ที่จ่ายสำหรับค่าเช่าและค่าสิทธิ',
        is_active: true,
        sort_order: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'W1',
        name: 'หัก ณ ที่จ่าย 1%',
        name_en: 'WHT 1%',
        tax_type: 'wht',
        rate: 1.00,
        description: 'หัก ณ ที่จ่ายสำหรับการขายสินค้า',
        is_active: true,
        sort_order: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'W0',
        name: 'ไม่หัก ณ ที่จ่าย',
        name_en: 'No WHT',
        tax_type: 'wht',
        rate: 0.00,
        description: 'ไม่มีการหัก ณ ที่จ่าย',
        is_active: true,
        sort_order: 7,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tax_codes', null, {});
  }
}; 