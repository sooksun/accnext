const db = require('./src/models');

async function checkInvoices() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');
    
    const invoices = await db.Invoice.findAll({
      include: [{
        model: db.InvoiceItem,
        as: 'items'
      }],
      order: [['id', 'ASC']]
    });
    
    console.log(`\n📋 Found ${invoices.length} invoices:`);
    invoices.forEach(inv => {
      console.log(`- ID: ${inv.id}, Doc No: ${inv.doc_no}, Customer: ${inv.customer_name}, Status: ${inv.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkInvoices();