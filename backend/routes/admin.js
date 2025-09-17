const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getFinancialReports,
  getAITeamStatus
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/dashboard', auth, admin, getDashboardData);
router.get('/financial-reports', auth, admin, getFinancialReports);
router.get('/ai-team-status', auth, admin, getAITeamStatus);

module.exports = router;
