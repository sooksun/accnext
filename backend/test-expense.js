const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCreateExpense() {
  try {
    console.log('🧪 ทดสอบการสร้างรายจ่ายใหม่...');
    
    const expenseData = {
      amount: 1500,
      description: 'ค่าอาหารกลางวัน',
      transaction_date: '2024-01-15',
      category_id: 1, // อาหารและเครื่องดื่ม
      payment_method: 'cash',
      vendor: 'ร้านอาหาร ABC',
      reference_number: 'REF002',
      notes: 'อาหารกลางวันกับทีม'
    };
    
    console.log('📊 ข้อมูลที่จะส่ง:', expenseData);
    
    const response = await axios.post(`${API_BASE_URL}/expense`, expenseData);
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', response.data);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCreateExpense(); 