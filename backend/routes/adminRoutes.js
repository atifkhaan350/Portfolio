const express = require('express');
const router = express.Router();
const {
  createAdmin,
  getAdmins,
  deactivateAdmin,
} = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All admin routes - requires super admin authentication
router.post('/', authenticateToken, authorize('superadmin'), createAdmin);
router.get('/', authenticateToken, authorize('superadmin'), getAdmins);
router.patch(
  '/:adminId/deactivate',
  authenticateToken,
  authorize('superadmin'),
  deactivateAdmin
);

module.exports = router;
