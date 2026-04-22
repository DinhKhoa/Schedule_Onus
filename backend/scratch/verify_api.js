const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const PT_ID = '69e726d7d1088e5834cf776d'; // Thắng
const SECRET = process.env.JWT_SECRET || 'onus_fitness_jwt_secret_key_2024';

// Create a token for the PT
const token = jwt.sign({ id: PT_ID, vaiTro: 'PT' }, SECRET, { expiresIn: '1h' });

async function verify() {
  try {
    console.log('Fetching schedules for PT Thắng via API...');
    const res = await axios.get(`http://localhost:5000/api/lich-tap?ptId=${PT_ID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const schedules2304 = res.data.filter(s => {
      const date = new Date(s.ngayTapId?.ngay).toISOString().slice(0, 10);
      return date === '2026-04-23';
    });

    if (schedules2304.length > 0) {
      console.log('SUCCESS: Found schedule on 23/04:');
      console.log(JSON.stringify(schedules2304, null, 2));
    } else {
      console.log('FAILURE: No schedule found on 23/04 in API response.');
      console.log('Full API Response sample (first 2):', JSON.stringify(res.data.slice(0, 2), null, 2));
    }
  } catch (err) {
    console.error('API Error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

verify();
