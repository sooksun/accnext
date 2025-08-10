'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // สร้างข้อมูล invoice ตัวอย่าง
    const invoices = [
      {
        id: 1,
        doc_no: 'INV-001',
        doc_type: 'invoice',
        doc_date: '2025-01-07',
        customer_id: 1,
        customer_name: 'บริษัท เอ จำกัด',
        customer_tax_id: '0123456789012',
        customer_address: '123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000',
        subtotal: 10000.00,
        vat_rate: 0.07,
        vat_amount: 700.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        grand_total: 10700.00,
        paid_amount: 10700.00,
        status: 'paid',
        payment_status: 'paid',
        note: 'ใบกำกับภาษีสำหรับบริการที่ 1',
        issued_by: 1, // admin user
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        doc_no: 'INV-002',
        doc_type: 'invoice',
        doc_date: '2025-01-08',
        customer_id: 2,
        customer_name: 'บริษัท บี จำกัด',
        customer_tax_id: '0987654321098',
        customer_address: '456 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000',
        subtotal: 15000.00,
        vat_rate: 0.07,
        vat_amount: 1050.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        grand_total: 16050.00,
        paid_amount: 0.00,
        status: 'issued',
        payment_status: 'unpaid',
        note: 'ใบกำกับภาษีสำหรับบริการที่ 2',
        issued_by: 1, // admin user
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        doc_no: 'INV-003',
        doc_type: 'invoice',
        doc_date: '2025-01-05',
        customer_id: 3,
        customer_name: 'บริษัท ซี จำกัด',
        customer_tax_id: '0555666777888',
        customer_address: '789 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000',
        subtotal: 8000.00,
        vat_rate: 0.07,
        vat_amount: 560.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        grand_total: 8560.00,
        paid_amount: 0.00,
        status: 'draft',
        payment_status: 'unpaid',
        note: 'ใบกำกับภาษีสำหรับบริการที่ 3',
        issued_by: 1, // admin user
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // สร้างข้อมูล invoice items ตัวอย่าง
    const invoiceItems = [
      {
        id: 1,
        invoice_id: 1,
        item_no: 1,
        description: 'บริการที่ 1',
        quantity: 1.00,
        unit: 'ชิ้น',
        unit_price: 10000.00,
        discount_rate: 0.00,
        discount_amount: 0.00,
        amount: 10000.00,
        vat_rate: 7.00,
        vat_amount: 700.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        total_amount: 10700.00,
        note: 'รายละเอียดบริการที่ 1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        invoice_id: 2,
        item_no: 1,
        description: 'บริการที่ 2',
        quantity: 1.00,
        unit: 'ชิ้น',
        unit_price: 15000.00,
        discount_rate: 0.00,
        discount_amount: 0.00,
        amount: 15000.00,
        vat_rate: 7.00,
        vat_amount: 1050.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        total_amount: 16050.00,
        note: 'รายละเอียดบริการที่ 2',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        invoice_id: 3,
        item_no: 1,
        description: 'บริการที่ 3',
        quantity: 1.00,
        unit: 'ชิ้น',
        unit_price: 8000.00,
        discount_rate: 0.00,
        discount_amount: 0.00,
        amount: 8000.00,
        vat_rate: 7.00,
        vat_amount: 560.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        total_amount: 8560.00,
        note: 'รายละเอียดบริการที่ 3',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // เพิ่มข้อมูลลงในฐานข้อมูล
    await queryInterface.bulkInsert('invoices', invoices, {});
    await queryInterface.bulkInsert('invoice_items', invoiceItems, {});
  },

  down: async (queryInterface, Sequelize) => {
    // ลบข้อมูลที่เพิ่มเข้าไป
    await queryInterface.bulkDelete('invoice_items', null, {});
    await queryInterface.bulkDelete('invoices', null, {});
  }
}; 