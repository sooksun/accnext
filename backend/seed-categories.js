const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'accnext',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// Categories data
const categories = [
  // หมวดหมู่รายรับ
  {
    name: 'รายได้จากการขาย',
    type: 'income',
    description: 'รายได้หลักจากการขายสินค้าและบริการ',
    color: '#10B981',
    icon: 'cash',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'ดอกเบี้ยรับ',
    type: 'income',
    description: 'ดอกเบี้ยจากเงินฝากและการลงทุน',
    color: '#3B82F6',
    icon: 'percentage',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'รายได้อื่นๆ',
    type: 'income',
    description: 'รายได้เบ็ดเตล็ด',
    color: '#8B5CF6',
    icon: 'plus',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  
  // หมวดหมู่รายจ่าย
  {
    name: 'ค่าเช่า',
    type: 'expense',
    description: 'ค่าเช่าสำนักงานและพื้นที่ต่างๆ',
    color: '#EF4444',
    icon: 'home',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'เงินเดือนพนักงาน',
    type: 'expense',
    description: 'เงินเดือนและค่าแรงพนักงาน',
    color: '#F59E0B',
    icon: 'users',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'ค่าไฟฟ้า',
    type: 'expense',
    description: 'ค่าไฟฟ้าสำนักงาน',
    color: '#F97316',
    icon: 'lightning-bolt',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'ค่าน้ำประปา',
    type: 'expense',
    description: 'ค่าน้ำประปาสำนักงาน',
    color: '#06B6D4',
    icon: 'droplet',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'วัสดุสำนักงาน',
    type: 'expense',
    description: 'อุปกรณ์และวัสดุสำนักงาน',
    color: '#84CC16',
    icon: 'clipboard',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'ค่าโทรศัพท์และอินเทอร์เน็ต',
    type: 'expense',
    description: 'ค่าสื่อสารและอินเทอร์เน็ต',
    color: '#6366F1',
    icon: 'phone',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'ค่าเดินทาง',
    type: 'expense',
    description: 'ค่าเดินทางและค่าขนส่ง',
    color: '#EC4899',
    icon: 'truck',
    is_default: true,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function seedCategories() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

    // Check if users exist
    const [users] = await sequelize.query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.error('❌ ไม่พบข้อมูลผู้ใช้ กรุณารัน seed users ก่อน');
      return;
    }

    const userId = users[0].id;
    console.log(`👤 ใช้ผู้ใช้ ID: ${userId}`);

    // Update categories to use existing user ID
    const categoriesWithUserId = categories.map(cat => ({
      ...cat,
      created_by: userId
    }));

    // Clear existing categories
    await sequelize.query('DELETE FROM categories');
    console.log('🗑️ ลบข้อมูลหมวดหมู่เดิมแล้ว');

    // Insert new categories
    await sequelize.query('INSERT INTO categories (name, type, description, color, icon, is_default, is_active, created_by, created_at, updated_at) VALUES ?', {
      replacements: [
        categoriesWithUserId.map(cat => [
          cat.name,
          cat.type,
          cat.description,
          cat.color,
          cat.icon,
          cat.is_default,
          cat.is_active,
          cat.created_by,
          cat.created_at,
          cat.updated_at
        ])
      ]
    });

    console.log('✅ เพิ่มข้อมูลหมวดหมู่สำเร็จ');
    console.log(`📊 เพิ่มหมวดหมู่รายรับ: ${categories.filter(c => c.type === 'income').length} รายการ`);
    console.log(`📊 เพิ่มหมวดหมู่รายจ่าย: ${categories.filter(c => c.type === 'expense').length} รายการ`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Run the seed
seedCategories(); 