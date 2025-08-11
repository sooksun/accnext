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

async function checkIndexes() {
  try {
    await sequelize.authenticate();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');

    // ตรวจสอบ indexes ในตาราง invoices
    console.log('\n=== ตรวจสอบ Indexes ในตาราง invoices ===');
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM invoices
    `);

    console.log(`จำนวน indexes ทั้งหมด: ${indexes.length}`);
    console.log('\nรายการ indexes:');
    
    // แสดง indexes แยกตาม key_name
    const indexGroups = {};
    indexes.forEach(index => {
      if (!indexGroups[index.Key_name]) {
        indexGroups[index.Key_name] = [];
      }
      indexGroups[index.Key_name].push(index);
    });

    Object.keys(indexGroups).forEach(keyName => {
      const group = indexGroups[keyName];
      console.log(`\n${keyName}:`);
      group.forEach(index => {
        console.log(`  - Column: ${index.Column_name}, Unique: ${index.Non_unique === 0 ? 'Yes' : 'No'}, Type: ${index.Index_type}`);
      });
    });

    console.log(`\nจำนวน index groups: ${Object.keys(indexGroups).length}`);

    if (Object.keys(indexGroups).length > 60) {
      console.log('\n⚠️  WARNING: มี indexes มากเกินไป อาจจะเกิน 64 keys limit');
      
      // หา indexes ที่น่าจะซ้ำซ้อนหรือไม่จำเป็น
      console.log('\n🔍 ตรวจสอบ indexes ที่อาจซ้ำซ้อน:');
      Object.keys(indexGroups).forEach(keyName => {
        if (keyName.includes('ibfk') && keyName !== 'PRIMARY') {
          console.log(`  - ${keyName} (Foreign Key Index - อาจซ้ำซ้อน)`);
        }
      });
    }

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error.message);
  } finally {
    await sequelize.close();
  }
}

// รันสคริปต์ถ้าเป็นการเรียกใช้โดยตรง
if (require.main === module) {
  checkIndexes();
}

module.exports = checkIndexes;