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

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');

    // ตรวจสอบข้อมูลผู้ใช้
    const [results] = await sequelize.query('SELECT * FROM users');
    console.log('\n=== ข้อมูลผู้ใช้ในระบบ ===');
    if (results.length === 0) {
      console.log('❌ ไม่มีข้อมูลผู้ใช้ในระบบ');
      
      // สร้างผู้ใช้ตัวอย่าง
      console.log('\n🔧 กำลังสร้างผู้ใช้ตัวอย่าง...');
      await sequelize.query(`
        INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
        VALUES (
          'ผู้ดูแลระบบ',
          'admin@example.com',
          '$2b$10$XeJ5Ox.KQfF/YHp5QrnRIu0UhY5P.Yy6q5V2dWzwF8EwGk.J2mJM6',
          'admin',
          true,
          NOW(),
          NOW()
        )
      `);
      console.log('✅ สร้างผู้ใช้ตัวอย่างสำเร็จ (ID: 1)');
    } else {
      console.log(`✅ พบข้อมูลผู้ใช้ ${results.length} คน`);
      results.forEach(user => {
        console.log(`- ID: ${user.id}, ชื่อ: ${user.name}, อีเมล: ${user.email}`);
      });
    }

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    await sequelize.close();
  }
}

// รันสคริปต์ถ้าเป็นการเรียกใช้โดยตรง
if (require.main === module) {
  checkUsers();
}

module.exports = checkUsers;