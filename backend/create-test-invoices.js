const db = require('./src/models');

async function createTestInvoices() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
    
    // สร้าง invoice ID 1, 2, 3 เพื่อให้ตรงกับที่ UI เรียก
    const invoices = [
      {
        id: 1,
        doc_no: 'INV-001',
        doc_type: 'invoice',
        doc_date: '2025-01-07',
        customer_id: 1,
        customer_name: 'บริษัท เอ จำกัด',
        customer_tax_id: '0123456789012',
        customer_address: '123 ถนนสุขุมวิท',
        subtotal: 10000.00,
        vat_rate: 7.00,
        vat_amount: 700.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        grand_total: 10700.00,
        paid_amount: 10700.00,
        status: 'paid',
        payment_status: 'paid',
        note: 'ใบกำกับภาษีสำหรับบริการที่ 1',
        issued_by: 16 // admin user id
      },
      {
        id: 2,
        doc_no: 'INV-002',
        doc_type: 'invoice',
        doc_date: '2025-01-08',
        customer_id: 2,
        customer_name: 'บริษัท บี จำกัด',
        customer_tax_id: '0987654321098',
        customer_address: '456 ถนนรัชดาภิเษก',
        subtotal: 15000.00,
        vat_rate: 7.00,
        vat_amount: 1050.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        grand_total: 16050.00,
        paid_amount: 0.00,
        status: 'issued',
        payment_status: 'unpaid',
        note: 'ใบกำกับภาษีสำหรับบริการที่ 2',
        issued_by: 16
      },
      {
        id: 3,
        doc_no: 'INV-003',
        doc_type: 'invoice',
        doc_date: '2025-01-05',
        customer_id: 3,
        customer_name: 'บริษัท ซี จำกัด',
        customer_tax_id: '0555666777888',
        customer_address: '789 ถนนลาดพร้าว',
        subtotal: 8000.00,
        vat_rate: 7.00,
        vat_amount: 560.00,
        wht_rate: 0.00,
        wht_amount: 0.00,
        grand_total: 8560.00,
        paid_amount: 0.00,
        status: 'draft',
        payment_status: 'unpaid',
        note: 'ใบกำกับภาษีสำหรับบริการที่ 3',
        issued_by: 16
      }
    ];

    // ลบ invoice เก่าก่อน
    await db.InvoiceItem.destroy({ where: {} });
    await db.Invoice.destroy({ where: {} });

    // สร้าง invoices ใหม่
    for (const invData of invoices) {
      const invoice = await db.Invoice.create(invData);
      
      // สร้าง invoice items
      await db.InvoiceItem.create({
        invoice_id: invoice.id,
        item_no: 1,
        description: `บริการทดสอบสำหรับ ${invoice.customer_name}`,
        quantity: 1,
        unit: 'ชิ้น',
        unit_price: invData.subtotal,
        amount: invData.subtotal,
        vat_rate: invData.vat_rate,
        vat_amount: invData.vat_amount,
        wht_rate: invData.wht_rate,
        wht_amount: invData.wht_amount,
        total_amount: invData.grand_total
      });
      
      console.log(`✅ Created invoice: ${invoice.doc_no} (ID: ${invoice.id})`);
    }
    
    console.log('🎉 All test invoices created successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestInvoices();