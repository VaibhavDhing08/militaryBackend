const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Purchases
router.post('/purchase', authenticateToken, authorizeRoles('admin', 'logistics'), assetController.addPurchase);
router.get('/purchases', authenticateToken, assetController.getPurchases);

// Transfers
router.post('/transfer', authenticateToken, authorizeRoles('admin', 'logistics'), assetController.transferAsset);
router.get('/transfers', authenticateToken, assetController.getTransfers);

// Assignments
router.post('/assign', authenticateToken, authorizeRoles('admin', 'logistics'), assetController.assignAsset);
router.get('/assignments', authenticateToken, assetController.getAssignments);

// Expenditures
router.post('/expend', authenticateToken, authorizeRoles('admin', 'logistics'), assetController.expendAsset);
router.get('/expenditures', authenticateToken, assetController.getExpenditures);

// Dashboard Stats
router.get('/dashboard', authenticateToken, assetController.getDashboardStats);
    
// Assets list (for dropdowns etc.)
router.get('/assets', authenticateToken, assetController.getAssets);

// Logs (only admin can see)
router.get('/logs', authenticateToken, authorizeRoles('admin'), assetController.getLogs);

module.exports = router;
