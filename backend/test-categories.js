const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCategoriesAPI() {
  try {
    console.log('🧪 ทดสอบ API Categories...');
    
    // ทดสอบ GET /api/categories
    console.log('\n1. ทดสอบ GET /api/categories');
    const response = await axios.get(`${API_BASE_URL}/categories`);
    console.log('✅ Status:', response.status);
    console.log('📊 Response structure:', Object.keys(response.data));
    console.log('📊 Data structure:', Object.keys(response.data.data));
    console.log('📊 จำนวนหมวดหมู่:', response.data.data.categories.length);
    console.log('📋 หมวดหมู่รายรับ:', response.data.data.categories.filter(c => c.type === 'income').length);
    console.log('📋 หมวดหมู่รายจ่าย:', response.data.data.categories.filter(c => c.type === 'expense').length);
    
    // แสดงรายละเอียดหมวดหมู่
    console.log('\n📋 รายการหมวดหมู่:');
    response.data.data.categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.type})`);
    });
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// รันการทดสอบ
testCategoriesAPI(); 