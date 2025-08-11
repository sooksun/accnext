const { Sequelize } = require('sequelize');

// สร้าง connection สำหรับสภาพแวดล้อม development
const sequelize = new Sequelize(
  'accnext',    // database name
  'root',       // username
  '',           // password (empty for default XAMPP)
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,  // ปิด logging เพื่อให้เห็นผลลัพธ์ชัดเจน
    timezone: '+07:00'
  }
);

async function fixDuplicateIndexes() {
  try {
    await sequelize.authenticate();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');

    console.log('\n=== แก้ไข Duplicate Indexes ในตาราง invoices ===');

    // ตรวจสอบ indexes ปัจจุบัน
    const [indexes] = await sequelize.query(`SHOW INDEX FROM invoices`);
    console.log(`จำนวน indexes ปัจจุบัน: ${indexes.length}`);

    // หา duplicate doc_no indexes
    const docNoIndexes = indexes.filter(index => 
      index.Key_name.startsWith('doc_no') && index.Key_name !== 'doc_no'
    );

    if (docNoIndexes.length > 0) {
      console.log(`\nพบ duplicate doc_no indexes: ${docNoIndexes.length} รายการ`);
      
      // ลบ duplicate indexes
      for (const index of docNoIndexes) {
        try {
          console.log(`กำลังลบ index: ${index.Key_name}`);
          await sequelize.query(`ALTER TABLE invoices DROP INDEX \`${index.Key_name}\``);
        } catch (error) {
          console.log(`⚠️  ไม่สามารถลบ index ${index.Key_name}: ${error.message}`);
        }
      }
    } else {
      console.log('\n✅ ไม่พบ duplicate indexes');
    }

    // ตรวจสอบผลลัพธ์หลังจากลบ
    const [finalIndexes] = await sequelize.query(`SHOW INDEX FROM invoices`);
    console.log(`\nจำนวน indexes หลังแก้ไข: ${finalIndexes.length}`);
    
    const indexGroups = {};
    finalIndexes.forEach(index => {
      if (!indexGroups[index.Key_name]) {
        indexGroups[index.Key_name] = [];
      }
      indexGroups[index.Key_name].push(index);
    });

    console.log('\nรายการ indexes ที่เหลือ:');
    Object.keys(indexGroups).forEach(keyName => {
      console.log(`- ${keyName}`);
    });

    console.log('\n🎉 แก้ไข duplicate indexes สำเร็จ!');

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error.message);
  } finally {
    await sequelize.close();
  }
}

// รันสคริปต์ถ้าเป็นการเรียกใช้โดยตรง
if (require.main === module) {
  fixDuplicateIndexes();
}

module.exports = fixDuplicateIndexes;