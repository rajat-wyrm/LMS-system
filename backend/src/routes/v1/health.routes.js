const express = require('express');
const router = express.Router();

const {
  getSystemHealth
} = require('../../controllers/health.controller');

router.get('/', getSystemHealth);

module.exports = router;