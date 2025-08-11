const { Sequelize } = require('sequelize');

// สร้าง connection สำหรับสภาพแวดล้อม development
const sequelize = new Sequelize(
  'accnext',    // database name
  'root',       // username
  '',           // password (empty for default XAMPP)
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log,
    timezone: '+07:00'
  }
);

async function clearSampleData() {
  try {
    await sequelize.authenticate();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');

    console.log('\n=== กำลังลบข้อมูลตัวอย่างเก่า ===');

    // ลบข้อมูลตามลำดับ (เพราะมี foreign key constraints)
    console.log('1. ลบข้อมูล Expenses...');
    await sequelize.query('DELETE FROM expenses');
    
    console.log('2. ลบข้อมูล Incomes...');
    await sequelize.query('DELETE FROM incomes');
    
    console.log('3. ลบข้อมูล Categories...');
    await sequelize.query('DELETE FROM categories');
    
    console.log('4. ลบข้อมูล Parties...');
    await sequelize.query('DELETE FROM parties');
    
    console.log('5. ลบข้อมูล Tax Codes...');
    await sequelize.query('DELETE FROM tax_codes');

    console.log('\n✅ ลบข้อมูลตัวอย่างเก่าสำเร็จ');

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    await sequelize.close();
  }
}

// รันสคริปต์ถ้าเป็นการเรียกใช้โดยตรง
if (require.main === module) {
  clearSampleData();
}

module.exports = clearSampleData;