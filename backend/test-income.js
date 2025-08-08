const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCreateIncome() {
  try {
    console.log('🧪 ทดสอบการสร้างรายรับใหม่...');
    
    const incomeData = {
      amount: 5000,
      description: 'เงินเดือน',
      transaction_date: '2024-01-15',
      category_id: 21, // รายได้จากการขาย
      payment_method: 'bank_transfer',
      reference_number: 'REF001',
      notes: 'เงินเดือนเดือนมกราคม'
    };
    
    console.log('📊 ข้อมูลที่จะส่ง:', incomeData);
    
    const response = await axios.post(`${API_BASE_URL}/income`, incomeData);
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

testCreateIncome(); 