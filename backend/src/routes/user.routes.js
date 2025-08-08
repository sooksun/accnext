const express = require('express');
const { adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - ดูรายการผู้ใช้ (แอดมิน)
router.get('/', adminOnly, (req, res) => {
  res.json({
    success: true,
    message: 'API ผู้ใช้ - ยังไม่ได้ implement',
    data: []
  });
});

module.exports = router;